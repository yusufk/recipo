import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useRecipes } from '../hooks/useRecipes'

interface Contributor {
  username: string
  recipeCount: number
  categories: string[]
}

export default function Contributors() {
  const { recipes, loading } = useRecipes()

  const contributors = useMemo(() => {
    const map = new Map<string, Contributor>()
    for (const recipe of recipes) {
      const existing = map.get(recipe.author)
      if (existing) {
        existing.recipeCount++
        if (!existing.categories.includes(recipe.category)) {
          existing.categories.push(recipe.category)
        }
      } else {
        map.set(recipe.author, {
          username: recipe.author,
          recipeCount: 1,
          categories: [recipe.category],
        })
      }
    }
    return Array.from(map.values()).sort((a, b) => b.recipeCount - a.recipeCount)
  }, [recipes])

  if (loading) {
    return (
      <div style={{ textAlign: 'center', padding: '3rem' }}>
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>Loading contributors...</span>
      </div>
    )
  }

  return (
    <>
      <h1 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2.5rem', textAlign: 'center', marginBottom: '0.5rem' }}>
        Contributors
      </h1>
      <p style={{ textAlign: 'center', color: 'var(--ink-light)', marginBottom: '2rem', fontSize: '0.9rem' }}>
        {contributors.length} cook{contributors.length !== 1 ? 's' : ''} · {recipes.length} recipe{recipes.length !== 1 ? 's' : ''}
      </p>

      <div className="contributors-grid">
        {contributors.map(contributor => (
          <Link
            key={contributor.username}
            to={`/user/${contributor.username}`}
            className="contributor-card"
          >
            <img
              src={`https://github.com/${contributor.username}.png?size=80`}
              alt={contributor.username}
              className="contributor-avatar"
            />
            <div className="contributor-info">
              <h3>@{contributor.username}</h3>
              <p>{contributor.recipeCount} recipe{contributor.recipeCount !== 1 ? 's' : ''}</p>
              <div className="tags">
                {contributor.categories.map(cat => (
                  <span key={cat} className="tag">{cat}</span>
                ))}
              </div>
            </div>
          </Link>
        ))}
      </div>
    </>
  )
}
