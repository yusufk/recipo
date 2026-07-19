import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, login, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path ? 'active' : ''

  return (
    <div className="layout">
      <header className="header">
        <div className="header-auth">
          {user ? (
            <div className="user-badge">
              <img src={user.avatar_url} alt={user.login} className="avatar" />
              <span className="username">@{user.login}</span>
              <button onClick={logout} className="btn-small">Sign out</button>
            </div>
          ) : (
            <button onClick={login} className="btn-small">Sign in with GitHub</button>
          )}
        </div>
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Recipo</h1>
        </Link>
        <p className="tagline">git commit -m 'added grandma's biryani'</p>
      </header>

      <nav className="nav">
        <Link to="/" className={isActive('/')}>All Recipes</Link>
        <Link to="/contributors" className={isActive('/contributors')}>Contributors</Link>
        <Link to="/favourites" className={isActive('/favourites')}>⭐ Saved</Link>
        <Link to="/submit" className={isActive('/submit')}>+ Add Recipe</Link>
      </nav>

      <main>
        <Outlet />
      </main>

      <footer style={{ textAlign: 'center', padding: '2rem 0', fontSize: '0.8rem', color: 'var(--ink-light)' }}>
        <p>Recipes stored as markdown in <a href="https://github.com/yusufk/recipo" target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>GitHub</a>. Fork it. Cook it. PR it back.</p>
      </footer>
    </div>
  )
}
