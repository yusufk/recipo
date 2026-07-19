import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useRecipes, type RecipeMeta } from '../hooks/useRecipes'
import { getFavourites } from '../hooks/useFavourites'

export default function Favourites() {
  const { recipes, loading } = useRecipes()
  const navigate = useNavigate()
  const [favs] = useState(() => getFavourites())

  const favouriteRecipes = useMemo(() => {
    return recipes.filter(r => favs.includes(r.path))
  }, [recipes, favs])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
      </div>
    )
  }

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        My Saved Recipes
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--ink-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        Saved locally in your browser
      </p>

      {favouriteRecipes.length === 0 ? (
        <p style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.3rem', textAlign: 'center', padding: '2rem', color: 'var(--ink-light)' }}>
          No saved recipes yet. Click ⭐ on any recipe to save it here.
        </p>
      ) : (
        <div className="recipe-grid">
          {favouriteRecipes.map(recipe => (
            <FavCard key={recipe.path} recipe={recipe} onClick={() => navigate(`/recipe/${recipe.category}/${recipe.slug}`)} />
          ))}
        </div>
      )}
    </>
  )
}

function FavCard({ recipe, onClick }: { recipe: RecipeMeta; onClick: () => void }) {
  return (
    <div className="recipe-card" onClick={onClick} role="button" tabIndex={0} onKeyDown={e => e.key === 'Enter' && onClick()}>
      <h3>{recipe.title}</h3>
      <div className="meta">
        <span style={{ color: 'var(--accent)' }}>by @{recipe.author}</span>
        {recipe.cuisine && <span> · {recipe.cuisine}</span>}
      </div>
    </div>
  )
}
