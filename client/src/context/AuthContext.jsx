import { createContext, useContext, useState, useEffect } from 'react'
import api from '../services/api'
import { useDataCache } from './DataCacheContext'

const AuthContext = createContext(null)

const USER_KEY = 'streakly_user'
const TOKEN_KEY = 'token'

export function AuthProvider({ children }) {
  const { prefetchAll, clearCache } = useDataCache()

  const [user, setUser] = useState(() => {
    try { return JSON.parse(localStorage.getItem(USER_KEY)) } catch { return null }
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const token = localStorage.getItem(TOKEN_KEY)
    if (!token) { setLoading(false); return }

    // Cached user var mı? Varsa hemen göster, arka planda tazele
    const cached = localStorage.getItem(USER_KEY)
    if (cached) {
      try { setUser(JSON.parse(cached)) } catch {}
      setLoading(false)
      // Sessiz arka plan: kullanıcı bilgisini doğrula + data cache'i doldur (F5 sonrası boş olabilir)
      api.get('/api/auth/me')
        .then(({ data }) => {
          setUser(data)
          localStorage.setItem(USER_KEY, JSON.stringify(data))
          prefetchAll().catch(() => {})
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        })
    } else {
      api.get('/api/auth/me')
        .then(({ data }) => {
          setUser(data)
          localStorage.setItem(USER_KEY, JSON.stringify(data))
          prefetchAll().catch(() => {})
        })
        .catch(() => {
          localStorage.removeItem(TOKEN_KEY)
          localStorage.removeItem(USER_KEY)
          setUser(null)
        })
        .finally(() => setLoading(false))
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  const login = async (email, password) => {
    const { data } = await api.post('/api/auth/login', { email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    // Login sonrası tüm kullanıcı verilerini arka planda önceden çek
    prefetchAll().catch(() => {})
    return data
  }

  const register = async (name, email, password) => {
    const { data } = await api.post('/api/auth/register', { name, email, password })
    localStorage.setItem(TOKEN_KEY, data.token)
    localStorage.setItem(USER_KEY, JSON.stringify(data.user))
    setUser(data.user)
    // Register sonrası da aynı şekilde prefetch yap
    prefetchAll().catch(() => {})
    return data
  }

  const logout = () => {
    localStorage.removeItem(TOKEN_KEY)
    localStorage.removeItem(USER_KEY)
    clearCache()
    setUser(null)
  }

  return (
    <AuthContext.Provider value={{ user, loading, login, register, logout }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  return useContext(AuthContext)
}
