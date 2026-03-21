import { createContext, useContext, useState, useCallback, useEffect } from 'react'

const AuthContext = createContext(null)

const API = 'http://localhost:5001'

export function AuthProvider({ children }) {
  const [user, setUser]       = useState(null)
  const [token, setToken]     = useState(() => localStorage.getItem('nep_token') || null)
  const [loading, setLoading] = useState(true)  // true while verifying token with backend

  // On app load: verify stored token with PostgreSQL via backend
  useEffect(() => {
    const storedToken = localStorage.getItem('nep_token')
    if (!storedToken) {
      setLoading(false)
      return
    }

    fetch(`${API}/api/auth/me`, {
      headers: { Authorization: `Bearer ${storedToken}` },
    })
      .then((res) => {
        if (!res.ok) throw new Error('Token invalid or expired')
        return res.json()
      })
      .then((userData) => {
        // Fresh user data from PostgreSQL — not from localStorage
        setUser(userData)
        setToken(storedToken)
      })
      .catch(() => {
        // Token is bad — clear everything and force re-login
        localStorage.removeItem('nep_token')
        setUser(null)
        setToken(null)
      })
      .finally(() => setLoading(false))
  }, [])

  const login = useCallback((userData, jwt) => {
    setUser(userData)
    setToken(jwt)
    localStorage.setItem('nep_token', jwt)
    // nep_user removed — user data always comes from backend now
  }, [])

  const logout = useCallback(() => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('nep_token')
  }, [])

  return (
    <AuthContext.Provider value={{ user, token, login, logout, loading }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
