import { useEffect, useState } from 'react'
import { useParams, Link } from 'react-router-dom'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { fetchRecipeContent, useRecipes } from '../hooks/useRecipes'
import { useAuth } from '../hooks/useAuth'
import { isFavourite, toggleFavourite } from '../hooks/useFavourites'
import Comments from '../components/Comments'

export default function Recipe() {
  const { category, slug } = useParams()
  const { user } = useAuth()
  const { recipes } = useRecipes()
  const [body, setBody] = useState('')
  const [meta, setMeta] = useState<Record<string, unknown>>({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const currentPath = `recipes/${category}/${slug}.md`

  // Favourites
  const [saved, setSaved] = useState(() => isFavourite(currentPath))

  // Find variations of this recipe
  const variations = recipes.filter(r => r.based_on === currentPath)

  // Find if this is itself a variation
  const basedOnPath = meta.based_on as string | undefined
  const originalRecipe = basedOnPath ? recipes.find(r => r.path === basedOnPath) : null

  // Is the current user the author?
  const isAuthor = user?.login === meta.author

  useEffect(() => {
    if (!category || !slug) return
    setLoading(true)
    fetchRecipeContent(currentPath)
      .then(({ meta, body }) => {
        setMeta(meta)
        // Strip the leading H1 title from body (already shown from frontmatter)
        const stripped = body.replace(/^\s*#\s+.+\n*/, '')
        setBody(stripped)
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

      <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginTop: '1rem' }}>
        <h1 style={{ flex: 1 }}>{meta.title as string || slug}</h1>
        <button
          onClick={() => setSaved(toggleFavourite(currentPath))}
          title={saved ? 'Remove from saved' : 'Save recipe'}
          style={{ background: 'none', border: 'none', fontSize: '1.8rem', cursor: 'pointer', opacity: saved ? 1 : 0.4, transition: 'opacity 0.2s' }}
        >
          {saved ? '⭐' : '☆'}
        </button>
      </div>

      {/* Recipe image */}
      {meta.image ? (
        <img
          src={`/recipo/${String(meta.image).replace(/^\//, '')}`}
          alt={String(meta.title)}
          style={{ width: '100%', maxHeight: '350px', objectFit: 'cover', borderRadius: '4px', marginTop: '1rem', marginBottom: '1rem', border: '1px solid var(--border)' }}
        />
      ) : null}

      {/* Based-on attribution */}
      {originalRecipe && (
        <div style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.1rem', color: 'var(--blue-ink)', marginBottom: '0.5rem' }}>
          🔀 Variation of <Link to={`/recipe/${originalRecipe.category}/${originalRecipe.slug}`} style={{ color: 'var(--accent)' }}>
            {originalRecipe.title}
          </Link> by <Link to={`/user/${originalRecipe.author}`} style={{ color: 'var(--accent)' }}>@{originalRecipe.author}</Link>
        </div>
      )}

      <div className="recipe-meta">
        {'author' in meta && <span>by <Link to={`/user/${String(meta.author)}`} style={{ color: 'var(--accent)', fontWeight: 600, textDecoration: 'none' }}>@{String(meta.author)}</Link> · </span>}
        {'cuisine' in meta && <span>{String(meta.cuisine)} · </span>}
        {'difficulty' in meta && <span>{String(meta.difficulty)} · </span>}
        {'serves' in meta && <span>Serves {String(meta.serves)} · </span>}
        {'prep_time' in meta && <span>Prep: {String(meta.prep_time)} · </span>}
        {'cook_time' in meta && <span>Cook: {String(meta.cook_time)}</span>}
      </div>

      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {body}
      </ReactMarkdown>

      {/* Variations section */}
      {variations.length > 0 && (
        <div style={{ marginTop: '2rem', padding: '1rem', background: 'rgba(91, 122, 94, 0.05)', borderRadius: '4px', border: '1px solid var(--border)' }}>
          <h3 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem', color: 'var(--herb)', marginBottom: '0.5rem' }}>
            🔀 {variations.length} variation{variations.length > 1 ? 's' : ''} of this recipe
          </h3>
          <ul style={{ listStyle: 'none', padding: 0 }}>
            {variations.map(v => (
              <li key={v.path} style={{ padding: '0.3rem 0' }}>
                <Link to={`/recipe/${v.category}/${v.slug}`} style={{ color: 'var(--accent)', textDecoration: 'none' }}>
                  {v.title}
                </Link>
                <span style={{ color: 'var(--ink-light)', fontSize: '0.85rem' }}> by @{v.author}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Actions: Edit (owner) or Make a variation (others) */}
      <div style={{ marginTop: '2rem', paddingTop: '1rem', borderTop: '1px dashed var(--border)', fontSize: '0.85rem', color: 'var(--ink-light)' }}>
        <a
          href={`https://github.com/yusufk/recipo/blob/main/${currentPath}`}
          target="_blank"
          rel="noreferrer"
          style={{ color: 'var(--accent)' }}
        >
          View source on GitHub
        </a>
        {isAuthor && (
          <>
            {' · '}
            <Link to={`/edit/${category}/${slug}`} style={{ color: 'var(--accent)' }}>
              ✏️ Edit this recipe
            </Link>
          </>
        )}
        {' · '}
        <Link to={user ? `/submit?vary=${currentPath}` : '/login'} style={{ color: 'var(--herb)' }}>
          🔀 Make a variation (fork)
        </Link>
      </div>

      <Comments term={`recipes/${category}/${slug}`} />
    </article>
  )
}
