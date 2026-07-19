import { useState, useEffect } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitRecipe, fetchRecipeContent } from '../hooks/useRecipes'
import RecipeForm, { EMPTY_FORM, type RecipeFormData } from '../components/RecipeForm'

export default function Submit() {
  const { user, token } = useAuth()
  const [searchParams] = useSearchParams()
  const varyFrom = searchParams.get('vary')  // e.g. "recipes/mains/julies-chicken-pie.md"

  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormData>(EMPTY_FORM)
  const [loadingVariation, setLoadingVariation] = useState(!!varyFrom)
  const [originalTitle, setOriginalTitle] = useState<string>('')

  // If making a variation, pre-fill from the original recipe
  useEffect(() => {
    if (!varyFrom) return
    setLoadingVariation(true)
    fetchRecipeContent(varyFrom)
      .then(({ meta, body }) => {
        const sections = parseBodySections(body)
        const title = String(meta.title || '')
        setOriginalTitle(title)
        setForm({
          title: `${title} (variation)`,
          category: String(meta.category || 'mains'),
          cuisine: String(meta.cuisine || ''),
          serves: String(meta.serves || ''),
          prep_time: String(meta.prep_time || ''),
          cook_time: String(meta.cook_time || ''),
          difficulty: String(meta.difficulty || 'medium'),
          tags: Array.isArray(meta.tags) ? meta.tags.join(', ') : String(meta.tags || ''),
          ingredients: sections.ingredients,
          method: sections.method,
          notes: sections.notes,
        })
      })
      .catch(err => setError(err.message))
      .finally(() => setLoadingVariation(false))
  }, [varyFrom])

  if (!user || !token) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>{varyFrom ? 'Make a Variation' : 'Add a Recipe'}</h1>
        <p style={{ marginBottom: '1rem' }}>You need to sign in with GitHub to submit recipes.</p>
        <Link to="/login" className="btn">Sign in with GitHub</Link>
      </div>
    )
  }

  if (loadingVariation) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading recipe to vary...</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>🎉 {varyFrom ? 'Variation' : 'Recipe'} submitted!</h1>
        <p style={{ margin: '1rem 0' }}>Your pull request has been created. A maintainer will review it shortly.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '1rem' }}>
          View PR on GitHub
        </a>
        <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm(EMPTY_FORM) }}>
          Submit another
        </button>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !user) return

    setSubmitting(true)
    setError(null)
    try {
      const pr = await submitRecipe(token, user.login, form, varyFrom || undefined)
      if (pr.html_url) {
        setSuccess({ url: pr.html_url })
      } else {
        setError(pr.message || 'Failed to create PR')
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error')
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <h1>{varyFrom ? '🔀 Make a Variation' : 'Add a Recipe'}</h1>
      {varyFrom && originalTitle && (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--herb)', marginBottom: '0.5rem' }}>
          Based on: {originalTitle}
        </p>
      )}
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        {varyFrom
          ? 'Modify the recipe below to create your variation. Give it a unique title!'
          : <>This will create a pull request on the <a href="https://github.com/yusufk/recipo" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>recipo repo</a> with your recipe.</>
        }
      </p>
      <RecipeForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel={varyFrom ? '🔀 Submit Variation' : '🍳 Submit Recipe'}
      />
    </div>
  )
}

function parseBodySections(body: string): { ingredients: string; method: string; notes: string } {
  const lines = body.split('\n')
  let current = ''
  const sections: Record<string, string[]> = { ingredients: [], method: [], notes: [] }

  for (const line of lines) {
    const lower = line.toLowerCase().trim()
    if (lower === '## ingredients' || lower === '# ingredients') {
      current = 'ingredients'
    } else if (lower === '## method' || lower === '# method' || lower === '## instructions' || lower === '# instructions') {
      current = 'method'
    } else if (lower === '## notes' || lower === '# notes') {
      current = 'notes'
    } else if (lower.startsWith('# ') && !current) {
      // Skip the title heading
    } else if (current) {
      sections[current].push(line)
    }
  }

  return {
    ingredients: sections.ingredients.join('\n').trim(),
    method: sections.method.join('\n').trim(),
    notes: sections.notes.join('\n').trim(),
  }
}
