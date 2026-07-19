import { createContext, useContext, useState, useEffect, useCallback, type ReactNode } from 'react'

const CLIENT_ID = import.meta.env.VITE_GITHUB_CLIENT_ID || ''
const SCOPE = 'public_repo'
const TOKEN_KEY = 'recipo_gh_token'
const USER_KEY = 'recipo_gh_user'

interface GitHubUser {
  login: string
  avatar_url: string
  name: string | null
}

interface DeviceCodeResponse {
  device_code: string
  user_code: string
  verification_uri: string
  expires_in: number
  interval: number
}

interface AuthContextType {
  user: GitHubUser | null
  token: string | null
  isLoading: boolean
  deviceCode: DeviceCodeResponse | null
  startDeviceFlow: () => Promise<void>
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
  const [deviceCode, setDeviceCode] = useState<DeviceCodeResponse | null>(null)

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
            // Token is invalid
            logout()
          }
        })
        .catch(() => logout())
    }
  }, [token])

  const startDeviceFlow = useCallback(async () => {
    setIsLoading(true)
    try {
      // Step 1: Request device code
      const res = await fetch('https://github.com/login/device/code', {
        method: 'POST',
        headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
        body: JSON.stringify({ client_id: CLIENT_ID, scope: SCOPE }),
      })
      const data: DeviceCodeResponse = await res.json()
      setDeviceCode(data)

      // Copy code to clipboard
      try {
        await navigator.clipboard.writeText(data.user_code)
      } catch { /* clipboard might fail, that's ok */ }

      // Open verification URL
      window.open(data.verification_uri, '_blank')

      // Step 3: Poll for token
      const pollInterval = (data.interval || 5) * 1000
      const expiresAt = Date.now() + data.expires_in * 1000

      const poll = async () => {
        if (Date.now() > expiresAt) {
          setDeviceCode(null)
          setIsLoading(false)
          return
        }

        const tokenRes = await fetch('https://github.com/login/oauth/access_token', {
          method: 'POST',
          headers: { Accept: 'application/json', 'Content-Type': 'application/json' },
          body: JSON.stringify({
            client_id: CLIENT_ID,
            device_code: data.device_code,
            grant_type: 'urn:ietf:params:oauth:grant-type:device_code',
          }),
        })
        const tokenData = await tokenRes.json()

        if (tokenData.access_token) {
          localStorage.setItem(TOKEN_KEY, tokenData.access_token)
          setToken(tokenData.access_token)
          setDeviceCode(null)
          setIsLoading(false)
        } else if (tokenData.error === 'authorization_pending' || tokenData.error === 'slow_down') {
          const delay = tokenData.error === 'slow_down' ? pollInterval + 5000 : pollInterval
          setTimeout(poll, delay)
        } else {
          // Expired or denied
          setDeviceCode(null)
          setIsLoading(false)
        }
      }

      setTimeout(poll, pollInterval)
    } catch (err) {
      console.error('Device flow error:', err)
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    setToken(null)
    setUser(null)
    setDeviceCode(null)
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, isLoading, deviceCode, startDeviceFlow, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
