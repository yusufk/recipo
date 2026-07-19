import { useState, useMemo } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { useRecipes, type RecipeMeta } from '../hooks/useRecipes'

export default function Home() {
  const { recipes, loading, error } = useRecipes()
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<string | null>(null)
  const [showCount, setShowCount] = useState(12)
  const navigate = useNavigate()

  const categories = useMemo(() => {
    const cats = new Set(recipes.map(r => r.category))
    return Array.from(cats).sort()
  }, [recipes])

  const filtered = useMemo(() => {
    let result = recipes
    if (category) result = result.filter(r => r.category === category)
    if (search) {
      const q = search.toLowerCase()
      result = result.filter(r =>
        r.title.toLowerCase().includes(q) ||
        r.cuisine.toLowerCase().includes(q) ||
        r.tags.some(t => t.toLowerCase().includes(q)) ||
        r.ingredients.toLowerCase().includes(q)
      )
    }
    // Sort newest first
    result = [...result].sort((a, b) => (b.created || '').localeCompare(a.created || ''))
    return result
  }, [recipes, search, category])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
          Fetching recipes from the repo...
        </span>
      </div>
    )
  }

  if (error) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <p style={{ color: 'var(--accent)' }}>Couldn't load recipes: {error}</p>
        <p style={{ fontSize: '0.9rem', color: 'var(--ink-light)', marginTop: '0.5rem' }}>
          The repo might not exist yet, or GitHub API rate limit hit.
        </p>
      </div>
    )
  }

  return (
    <>
      <div className="search-bar">
        <input
          type="text"
          placeholder="Search recipes, ingredients, cuisines..."
          value={search}
          onChange={e => setSearch(e.target.value)}
          aria-label="Search recipes"
        />
      </div>

      {categories.length > 0 && (
        <div className="nav" style={{ marginBottom: '1.5rem' }}>
          <button
            onClick={() => setCategory(null)}
            className={!category ? 'active' : ''}
          >
            All
          </button>
          {categories.map(cat => (
            <button
              key={cat}
              onClick={() => setCategory(cat)}
              className={category === cat ? 'active' : ''}
            >
              {cat}
            </button>
          ))}
        </div>
      )}

      {filtered.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem' }}>
          <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
            No recipes yet! Be the first to contribute.
          </p>
        </div>
      ) : (
        <div className="recipe-grid">
          {filtered.slice(0, showCount).map(recipe => (
            <RecipeCard key={recipe.path} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.category}/${recipe.slug}`)} />
          ))}
        </div>
        {filtered.length > showCount && (
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <button className="btn btn-outline" onClick={() => setShowCount(s => s + 12)}>
              Show more ({filtered.length - showCount} remaining)
            </button>
          </div>
        )}
      )}
    </>
  )
}

function RecipeCard({ recipe, onClick }: { recipe: RecipeMeta; onClick: () => void }) {
  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      {recipe.image && (
        <img
          src={`https://raw.githubusercontent.com/yusufk/recipo/main/${recipe.image.replace(/^\//, '')}`}
          alt={recipe.title}
          className="recipe-card-img"
        />
      )}
      <h3>{recipe.title}</h3>
      <div className="meta">
        <Link
          to={`/user/${recipe.author}`}
          className="author"
          onClick={e => e.stopPropagation()}
        >
          by @{recipe.author}
        </Link>
        {recipe.cuisine && <span> · {recipe.cuisine}</span>}
        {recipe.difficulty && <span> · {recipe.difficulty}</span>}
        {recipe.prep_time && <span> · ⏱ {recipe.prep_time}</span>}
      </div>
      {recipe.tags.length > 0 && (
        <div className="tags">
          {recipe.tags.map(tag => <span key={tag} className="tag">{tag}</span>)}
        </div>
      )}
    </div>
  )
}
