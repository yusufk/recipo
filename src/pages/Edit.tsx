import { useState, useEffect } from 'react'
import { useParams, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { fetchRecipeContent, editRecipe } from '../hooks/useRecipes'
import RecipeForm, { type RecipeFormData } from '../components/RecipeForm'

export default function Edit() {
  const { category, slug } = useParams()
  const { user, token } = useAuth()
  const [loading, setLoading] = useState(true)
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormData>({
    title: '', category: category || 'mains', cuisine: '', serves: '',
    prep_time: '', cook_time: '', difficulty: 'medium', tags: '',
    ingredients: '', method: '', notes: '',
  })

  // Load existing recipe content
  useEffect(() => {
    if (!category || !slug) return
    fetchRecipeContent(`recipes/${category}/${slug}.md`)
      .then(({ meta, body }) => {
        // Parse the body back into ingredients/method/notes sections
        const sections = parseBodySections(body)

        setForm({
          title: String(meta.title || slug),
          category: String(meta.category || category),
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
      .finally(() => setLoading(false))
  }, [category, slug])

  if (!user || !token) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Edit Recipe</h1>
        <p style={{ marginBottom: '1rem' }}>You need to sign in with GitHub to edit recipes.</p>
        <Link to="/login" className="btn">Sign in with GitHub</Link>
      </div>
    )
  }

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading recipe...</span>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>✏️ Edit submitted!</h1>
        <p style={{ margin: '1rem 0' }}>Your changes have been submitted as a pull request.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '1rem' }}>
          View PR on GitHub
        </a>
        <Link to={`/recipe/${category}/${slug}`} className="btn btn-outline" style={{ textDecoration: 'none' }}>
          Back to recipe
        </Link>
      </div>
    )
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!token || !user || !category || !slug) return

    setSubmitting(true)
    setError(null)
    try {
      const pr = await editRecipe(token, user.login, `recipes/${category}/${slug}.md`, form)
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
      <Link to={`/recipe/${category}/${slug}`} style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
        ← back to recipe
      </Link>
      <h1 style={{ marginTop: '0.5rem' }}>Edit: {form.title}</h1>
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        Your changes will be submitted as a pull request for review.
      </p>
      <RecipeForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="✏️ Submit Edit"
        titleEditable={false}
      />
    </div>
  )
}

/** Parse markdown body back into sections */
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
