import { Outlet, Link, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

export default function Layout() {
  const { user, logout } = useAuth()
  const location = useLocation()

  const isActive = (path: string) => location.pathname === path ? 'active' : ''

  return (
    <div className="layout">
      <header className="header">
        <Link to="/" style={{ textDecoration: 'none', color: 'inherit' }}>
          <h1>Recipo</h1>
        </Link>
        <p className="tagline">git commit -m 'added grandma's biryani'</p>
      </header>

      <nav className="nav">
        <Link to="/" className={isActive('/')}>All Recipes</Link>
        <Link to="/submit" className={isActive('/submit')}>+ Add Recipe</Link>
        {user ? (
          <button onClick={logout} title={`Signed in as ${user.login}`}>
            👋 {user.login}
          </button>
        ) : (
          <Link to="/login" className={isActive('/login')}>Sign In</Link>
        )}
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
