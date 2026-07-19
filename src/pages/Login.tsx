import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Login() {
  const { user, isLoading, login } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  if (user) return null

  if (isLoading) {
    return (
      <div className="auth-box">
        <span className="spinner" />
        <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.5rem' }}>
          Signing you in...
        </span>
      </div>
    )
  }

  return (
    <div className="auth-box">
      <h2 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2rem', marginBottom: '0.5rem' }}>
        Sign in with GitHub
      </h2>
      <p className="instructions">
        You need a GitHub account to submit and edit recipes.
        <br />Contributions are made via pull requests.
      </p>
      <button className="btn" onClick={login}>
        🔑 Sign in with GitHub
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '1rem' }}>
        We only request access to public repositories.
      </p>
    </div>
  )
}
