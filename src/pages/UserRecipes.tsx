import { useParams, Link } from 'react-router-dom'
import { useNavigate } from 'react-router-dom'
import { useRecipes, type RecipeMeta } from '../hooks/useRecipes'

export default function UserRecipes() {
  const { username } = useParams()
  const { recipes, loading } = useRecipes()
  const navigate = useNavigate()

  const userRecipes = recipes.filter(r => r.author === username)

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
          Loading recipes...
        </span>
      </div>
    )
  }

  return (
    <>
      <div style={{ marginBottom: '2rem' }}>
        <Link to="/" style={{ fontSize: '0.9rem', color: 'var(--ink-light)', textDecoration: 'none' }}>
          ← back to all recipes
        </Link>
        <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', marginTop: '0.5rem' }}>
          Recipes by @{username}
        </h1>
        <p style={{ color: 'var(--ink-light)', fontSize: '0.9rem' }}>
          {userRecipes.length} recipe{userRecipes.length !== 1 ? 's' : ''}
          {' · '}
          <a
            href={`https://github.com/${username}`}
            target="_blank"
            rel="noreferrer"
            style={{ color: 'var(--accent)' }}
          >
            GitHub profile ↗
          </a>
        </p>
      </div>

      {userRecipes.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.3rem', textAlign: 'center', padding: '2rem' }}>
          No recipes from this user yet.
        </p>
      ) : (
        <div className="recipe-grid">
          {userRecipes.map(recipe => (
            <RecipeCard key={recipe.path} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.category}/${recipe.slug}`)} />
          ))}
        </div>
      )}
    </>
  )
}

function RecipeCard({ recipe, onClick }: { recipe: RecipeMeta; onClick: () => void }) {
  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <h3>{recipe.title}</h3>
      <div className="meta">
        {recipe.cuisine && <span>{recipe.cuisine}</span>}
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
