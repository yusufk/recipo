import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitRecipe } from '../hooks/useRecipes'

const CATEGORIES = ['mains', 'desserts', 'sides', 'breads', 'drinks', 'snacks', 'breakfast']
const DIFFICULTIES = ['easy', 'medium', 'hard']

export default function Submit() {
  const { user, token } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)

  const [form, setForm] = useState({
    title: '',
    category: 'mains',
    cuisine: '',
    serves: '',
    prep_time: '',
    cook_time: '',
    difficulty: 'medium',
    tags: '',
    ingredients: '',
    method: '',
    notes: '',
  })

  if (!user || !token) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>Add a Recipe</h1>
        <p style={{ marginBottom: '1rem' }}>You need to sign in with GitHub to submit recipes.</p>
        <Link to="/login" className="btn">Sign in with GitHub</Link>
      </div>
    )
  }

  if (success) {
    return (
      <div className="form-page" style={{ textAlign: 'center', padding: '3rem' }}>
        <h1>🎉 Recipe submitted!</h1>
        <p style={{ margin: '1rem 0' }}>Your pull request has been created. A maintainer will review it shortly.</p>
        <a href={success.url} target="_blank" rel="noreferrer" className="btn" style={{ textDecoration: 'none', display: 'inline-block', marginRight: '1rem' }}>
          View PR on GitHub
        </a>
        <button className="btn btn-outline" onClick={() => { setSuccess(null); setForm({ title: '', category: 'mains', cuisine: '', serves: '', prep_time: '', cook_time: '', difficulty: 'medium', tags: '', ingredients: '', method: '', notes: '' }) }}>
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
      const pr = await submitRecipe(token, user.login, form)
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

  const update = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }))

  return (
    <div className="form-page">
      <h1>Add a Recipe</h1>
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        This will create a pull request on the <a href="https://github.com/yusufk/recipo" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>recipo repo</a> with your recipe.
      </p>

      {error && <p style={{ color: 'var(--accent)', marginBottom: '1rem' }}>{error}</p>}

      <form onSubmit={handleSubmit}>
        <div className="field">
          <label htmlFor="title">Recipe Title</label>
          <input id="title" required value={form.title} onChange={update('title')} placeholder="Grandma's Biryani" />
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="category">Category</label>
            <select id="category" value={form.category} onChange={update('category')}>
              {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div className="field">
            <label htmlFor="difficulty">Difficulty</label>
            <select id="difficulty" value={form.difficulty} onChange={update('difficulty')}>
              {DIFFICULTIES.map(d => <option key={d} value={d}>{d}</option>)}
            </select>
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="cuisine">Cuisine</label>
            <input id="cuisine" value={form.cuisine} onChange={update('cuisine')} placeholder="Indian" />
          </div>
          <div className="field">
            <label htmlFor="serves">Serves</label>
            <input id="serves" value={form.serves} onChange={update('serves')} placeholder="4" />
          </div>
          <div className="field">
            <label htmlFor="prep_time">Prep Time</label>
            <input id="prep_time" value={form.prep_time} onChange={update('prep_time')} placeholder="20min" />
          </div>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
          <div className="field">
            <label htmlFor="cook_time">Cook Time</label>
            <input id="cook_time" value={form.cook_time} onChange={update('cook_time')} placeholder="45min" />
          </div>
          <div className="field">
            <label htmlFor="tags">Tags</label>
            <input id="tags" value={form.tags} onChange={update('tags')} placeholder="chicken, curry, weeknight" />
          </div>
        </div>

        <div className="field">
          <label htmlFor="ingredients">Ingredients</label>
          <textarea id="ingredients" required value={form.ingredients} onChange={update('ingredients')} placeholder={"- 500g chicken thigh, cubed\n- 1 cup yoghurt\n- 2 tsp garam masala\n- ..."} style={{ minHeight: '150px' }} />
        </div>

        <div className="field">
          <label htmlFor="method">Method</label>
          <textarea id="method" required value={form.method} onChange={update('method')} placeholder={"1. Marinate chicken in yoghurt and spices for 2 hours\n2. Heat oil in a large pan\n3. ..."} style={{ minHeight: '200px' }} />
        </div>

        <div className="field">
          <label htmlFor="notes">Notes (optional)</label>
          <textarea id="notes" value={form.notes} onChange={update('notes')} placeholder="Can substitute cream with coconut cream for dairy-free version" style={{ minHeight: '80px' }} />
        </div>

        <button type="submit" className="btn" disabled={submitting}>
          {submitting ? <><span className="spinner" /> Creating PR...</> : '🍳 Submit Recipe'}
        </button>
      </form>
    </div>
  )
}
