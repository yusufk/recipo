import { useState, useEffect } from 'react'

const REPO_OWNER = 'yusufk'
const REPO_NAME = 'recipo'
const RECIPES_PATH = 'recipes'

export interface RecipeMeta {
  title: string
  author: string
  category: string
  cuisine: string
  serves: number | string
  prep_time: string
  cook_time: string
  difficulty: string
  tags: string[]
  image?: string
  based_on?: string
  created: string
  slug: string
  path: string
}

interface RecipeFile {
  name: string
  path: string
  type: string
  download_url: string
}

function parseFrontmatter(content: string): { meta: Record<string, unknown>; body: string } {
  const match = content.match(/^---\n([\s\S]*?)\n---\n([\s\S]*)$/)
  if (!match) return { meta: {}, body: content }

  const meta: Record<string, unknown> = {}
  const lines = match[1].split('\n')
  for (const line of lines) {
    const colonIdx = line.indexOf(':')
    if (colonIdx === -1) continue
    const key = line.slice(0, colonIdx).trim()
    let value: unknown = line.slice(colonIdx + 1).trim()

    // Parse arrays like [tag1, tag2]
    if (typeof value === 'string' && value.startsWith('[') && value.endsWith(']')) {
      value = value.slice(1, -1).split(',').map(s => s.trim())
    }
    meta[key] = value
  }
  return { meta, body: match[2] }
}

export function useRecipes() {
  const [recipes, setRecipes] = useState<RecipeMeta[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchRecipeIndex()
  }, [])

  async function fetchRecipeIndex() {
    try {
      setLoading(true)
      // Get all category folders
      const res = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${RECIPES_PATH}`)
      if (!res.ok) throw new Error('Failed to fetch recipes')
      const categories: RecipeFile[] = await res.json()

      const allRecipes: RecipeMeta[] = []

      // Fetch files in each category
      for (const cat of categories.filter(c => c.type === 'dir')) {
        const catRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/contents/${cat.path}`)
        if (!catRes.ok) continue
        const files: RecipeFile[] = await catRes.json()

        for (const file of files.filter(f => f.name.endsWith('.md'))) {
          const fileRes = await fetch(file.download_url)
          const content = await fileRes.text()
          const { meta } = parseFrontmatter(content)

          allRecipes.push({
            title: (meta.title as string) || file.name.replace('.md', ''),
            author: (meta.author as string) || 'unknown',
            category: cat.name,
            cuisine: (meta.cuisine as string) || '',
            serves: (meta.serves as string) || '',
            prep_time: (meta.prep_time as string) || '',
            cook_time: (meta.cook_time as string) || '',
            difficulty: (meta.difficulty as string) || '',
            tags: (meta.tags as string[]) || [],
            image: meta.image as string | undefined,
            based_on: (meta.based_on as string) || undefined,
            created: (meta.created as string) || '',
            slug: file.name.replace('.md', ''),
            path: file.path,
          })
        }
      }

      setRecipes(allRecipes)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setLoading(false)
    }
  }

  return { recipes, loading, error, refetch: fetchRecipeIndex }
}

export async function fetchRecipeContent(path: string): Promise<{ meta: Record<string, unknown>; body: string }> {
  const res = await fetch(`https://raw.githubusercontent.com/${REPO_OWNER}/${REPO_NAME}/main/${path}`)
  if (!res.ok) throw new Error('Recipe not found')
  const content = await res.text()
  return parseFrontmatter(content)
}

export async function submitRecipe(
  token: string,
  userLogin: string,
  recipe: { title: string; category: string; cuisine: string; serves: string; prep_time: string; cook_time: string; difficulty: string; tags: string; ingredients: string; method: string; notes: string },
  basedOn?: string
) {
  const slug = recipe.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '')
  const path = `recipes/${recipe.category}/${slug}.md`

  const frontmatter = `---
title: "${recipe.title}"
author: ${userLogin}
category: ${recipe.category}
cuisine: ${recipe.cuisine}
serves: ${recipe.serves}
prep_time: ${recipe.prep_time}
cook_time: ${recipe.cook_time}
difficulty: ${recipe.difficulty}
tags: [${recipe.tags.split(',').map(t => t.trim()).join(', ')}]${basedOn ? `\nbased_on: ${basedOn}` : ''}
created: ${new Date().toISOString().split('T')[0]}
---`

  const body = `
# ${recipe.title}

## Ingredients
${recipe.ingredients}

## Method
${recipe.method}
${recipe.notes ? `\n## Notes\n${recipe.notes}` : ''}
`

  const content = frontmatter + '\n' + body
  const encoded = btoa(unescape(encodeURIComponent(content)))

  // Create a fork if needed, then a branch, then a PR
  // First: check if user has a fork
  const forkRes = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!forkRes.ok) {
    // Fork the repo
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    // Wait a moment for the fork to be ready
    await new Promise(r => setTimeout(r, 3000))
  }

  // Get the main branch SHA
  const mainRef = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/ref/heads/main`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const mainData = await mainRef.json()
  const baseSha = mainData.object.sha

  // Create a branch
  const branchName = `recipe/${slug}`
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
  })

  // Create the file
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/contents/${path}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Add recipe: ${recipe.title}`,
      content: encoded,
      branch: branchName,
    }),
  })

  // Create a PR
  const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: basedOn ? `🔀 Variation: ${recipe.title}` : `🍳 New recipe: ${recipe.title}`,
      body: `## ${basedOn ? 'Recipe Variation' : 'New Recipe Submission'}\n\n**${recipe.title}**\n- Cuisine: ${recipe.cuisine}\n- Difficulty: ${recipe.difficulty}\n- Serves: ${recipe.serves}\n${basedOn ? `- Based on: \`${basedOn}\`\n` : ''}\nSubmitted by @${userLogin}`,
      head: `${userLogin}:${branchName}`,
      base: 'main',
    }),
  })

  const prData = await prRes.json()
  return prData
}

export async function editRecipe(
  token: string,
  userLogin: string,
  filePath: string,
  recipe: { title: string; category: string; cuisine: string; serves: string; prep_time: string; cook_time: string; difficulty: string; tags: string; ingredients: string; method: string; notes: string }
) {
  const frontmatter = `---
title: "${recipe.title}"
author: ${userLogin}
category: ${recipe.category}
cuisine: ${recipe.cuisine}
serves: ${recipe.serves}
prep_time: ${recipe.prep_time}
cook_time: ${recipe.cook_time}
difficulty: ${recipe.difficulty}
tags: [${recipe.tags.split(',').map(t => t.trim()).join(', ')}]
created: ${new Date().toISOString().split('T')[0]}
---`

  const body = `
# ${recipe.title}

## Ingredients
${recipe.ingredients}

## Method
${recipe.method}
${recipe.notes ? `\n## Notes\n${recipe.notes}` : ''}
`

  const content = frontmatter + '\n' + body
  const encoded = btoa(unescape(encodeURIComponent(content)))

  // Ensure fork exists
  const forkRes = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}`, {
    headers: { Authorization: `Bearer ${token}` },
  })

  if (!forkRes.ok) {
    await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/forks`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    })
    await new Promise(r => setTimeout(r, 3000))
  }

  // Get the main branch SHA
  const mainRef = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/ref/heads/main`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const mainData = await mainRef.json()
  const baseSha = mainData.object.sha

  // Create a branch for the edit
  const slug = filePath.replace('recipes/', '').replace('.md', '').replace('/', '-')
  const branchName = `edit/${slug}-${Date.now()}`
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/git/refs`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({ ref: `refs/heads/${branchName}`, sha: baseSha }),
  })

  // Get the existing file's SHA (needed for updates)
  const existingFile = await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/contents/${filePath}?ref=${branchName}`, {
    headers: { Authorization: `Bearer ${token}` },
  })
  const existingData = await existingFile.json()
  const fileSha = existingData.sha

  // Update the file
  await fetch(`https://api.github.com/repos/${userLogin}/${REPO_NAME}/contents/${filePath}`, {
    method: 'PUT',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      message: `Edit recipe: ${recipe.title}`,
      content: encoded,
      branch: branchName,
      sha: fileSha,
    }),
  })

  // Create a PR
  const prRes = await fetch(`https://api.github.com/repos/${REPO_OWNER}/${REPO_NAME}/pulls`, {
    method: 'POST',
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    body: JSON.stringify({
      title: `✏️ Edit: ${recipe.title}`,
      body: `## Recipe Edit\n\n**${recipe.title}**\n\nEdited by @${userLogin}`,
      head: `${userLogin}:${branchName}`,
      base: 'main',
    }),
  })

  const prData = await prRes.json()
  return prData
}
