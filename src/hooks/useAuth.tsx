import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const AUTH_WORKER = import.meta.env.VITE_AUTH_WORKER_URL || ''
const SCOPE = 'public_repo'
const TOKEN_KEY = 'recipo_gh_token'
const USER_KEY = 'recipo_gh_user'
const REDIRECT_URI = `${window.location.origin}/recipo/login`

interface GitHubUser {
  login: string
  avatar_url: string
  name: string | null
}

interface AuthContextType {
  user: GitHubUser | null
  token: string | null
  isLoading: boolean
  login: () => void
  logout: () => void
}

const AuthContext = createContext<AuthContextType | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(() => localStorage.getItem(TOKEN_KEY))
  const [user, setUser] = useState<GitHubUser | null>(() => {
    const stored = localStorage.getItem(USER_KEY)
    return stored ? JSON.parse(stored) : null
  })
  const [isLoading, setIsLoading] = useState(false)

  // Fetch user info when we have a token
  useEffect(() => {
    if (token && !user) {
      fetch('https://api.github.com/user', {
        headers: { Authorization: `Bearer ${token}` },
      })
        .then(r => r.json())
        .then(data => {
          if (data.login) {
            setUser(data)
            localStorage.setItem(USER_KEY, JSON.stringify(data))
          } else {
            logout()
          }
        })
        .catch(() => logout())
    }
  }, [token])

  // Handle the OAuth callback — check for ?code= in the URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search)
    const code = params.get('code')

    if (code && !token) {
      setIsLoading(true)
      // Exchange code for token via our Worker
      fetch(`${AUTH_WORKER}/auth/token`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code }),
      })
        .then(r => r.json())
        .then(data => {
          if (data.access_token) {
            localStorage.setItem(TOKEN_KEY, data.access_token)
            setToken(data.access_token)
          }
        })
        .catch(err => console.error('Token exchange failed:', err))
        .finally(() => {
          setIsLoading(false)
          // Clean up the URL
          window.history.replaceState({}, '', window.location.pathname)
        })
    }
  }, [])

  const login = useCallback(() => {
    const state = crypto.randomUUID()
    sessionStorage.setItem('oauth_state', state)

    const params = new URLSearchParams({
      client_id: CLIENT_ID,
      redirect_uri: REDIRECT_URI,
      scope: SCOPE,
      state,
    })

    window.location.href = `https://github.com/login/oauth/authorize?${params}`
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
