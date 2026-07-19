import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchRecipeContent } from '../hooks/useRecipes'

export default function Recipe() {
  const { category, slug } = useParams()
  const [body, setBody] = useState('')
  const [meta, setMeta] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!category || !slug) return
    setLoading(true)
    fetchRecipeContent(`recipes/${category}/${slug}.md`)
      .then(({ meta, body }) => {
        setMeta(meta)
        setBody(body)
      })
      .catch(err => setError(err.message))
      .finally(() => setLoading(false))
  }, [category, slug])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--accent)' }}>Recipe not found</p>
        <Link to="/" style={{ color: 'var(--accent)' }}>← Back to recipes</Link>
      </div>
    )
  }

  return (
    <article className="recipe-page">
      <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
        ← back to recipes
      </Link>

      <h1 style={{ marginTop: '1rem' }}>{meta.title as string || slug}</h1>

      <div className="recipe-meta">
        {'author' in meta && <span>by <strong>@{String(meta.author)}</strong> · </span>}
        {'cuisine' in meta && <span>{String(meta.cuisine)} · </span>}
        {'difficulty' in meta && <span>{String(meta.difficulty)} · </span>}
        {'serves' in meta && <span>Serves {String(meta.serves)} · </span>}
        {'prep_time' in meta && <span>Prep: {String(meta.prep_time)} · </span>}
        {'cook_time' in meta && <span>Cook: {String(meta.cook_time)}</span>}
      </div>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {body}
      </ReactMarkdown>

      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--ink-light)' }}>
        <a
          href={`https://github.com/yusufk/recipo/blob/main/recipes/${category}/${slug}.md`}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          View source on GitHub
        </a>
        {' · '}
        <a
          href={`https://github.com/yusufk/recipo/edit/main/recipes/${category}/${slug}.md`}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          Edit this recipe
        </a>
      </div>
    </article>
  )
}
