import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { submitRecipe } from '../hooks/useRecipes'
import RecipeForm, { EMPTY_FORM, type RecipeFormData } from '../components/RecipeForm'

export default function Submit() {
  const { user, token } = useAuth()
  const [submitting, setSubmitting] = useState(false)
  const [success, setSuccess] = useState<{ url: string } | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [form, setForm] = useState<RecipeFormData>(EMPTY_FORM)

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

  return (
    <div className="form-page">
      <h1>Add a Recipe</h1>
      <p style={{ color: 'var(--ink-light)', marginBottom: '1.5rem', fontSize: '0.9rem' }}>
        This will create a pull request on the <a href="https://github.com/yusufk/recipo" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>recipo repo</a> with your recipe.
      </p>
      <RecipeForm
        form={form}
        setForm={setForm}
        onSubmit={handleSubmit}
        submitting={submitting}
        error={error}
        submitLabel="🍳 Submit Recipe"
      />
    </div>
  )
}
