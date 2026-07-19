import { useAuth } from '../hooks/useAuth'
import { useNavigate } from 'react-router-dom'
import { useEffect } from 'react'

export default function Login() {
  const { user, isLoading, deviceCode, startDeviceFlow } = useAuth()
  const navigate = useNavigate()

  // Redirect if already logged in
  useEffect(() => {
    if (user) navigate('/')
  }, [user, navigate])

  if (user) return null

  if (deviceCode) {
    return (
      <div className="auth-box">
        <h2 style={{ fontFamily: 'var(--font-handwritten)', fontSize: '2rem', marginBottom: '0.5rem' }}>
          Almost there!
        </h2>
        <p className="instructions">
          Enter this code at GitHub:
        </p>
        <div className="code">{deviceCode.user_code}</div>
        <p className="instructions" style={{ fontSize: '0.85rem' }}>
          Code copied to clipboard. A new tab should have opened.
          <br />If not, go to{' '}
          <a href={deviceCode.verification_uri} target="_blank" rel="noreferrer" style={{ color: 'var(--accent)' }}>
            github.com/login/device
          </a>
        </p>
        <div style={{ marginTop: '1.5rem' }}>
          <span className="spinner" />
          <span style={{ fontFamily: 'var(--font-handwritten)', fontSize: '1.2rem', color: 'var(--ink-light)' }}>
            Waiting for you to authorise...
          </span>
        </div>
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
      <button className="btn" onClick={startDeviceFlow} disabled={isLoading}>
        {isLoading ? 'Starting...' : '🔑 Sign in'}
      </button>
      <p style={{ fontSize: '0.8rem', color: 'var(--ink-light)', marginTop: '1rem' }}>
        We only request access to public repositories.
      </p>
    </div>
  )
}
