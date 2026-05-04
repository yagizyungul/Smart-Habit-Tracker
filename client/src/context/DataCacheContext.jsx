import { createContext, useContext, useCallback } from 'react'
import api from '../services/api'

// Cache TTL: 5 dakika (ms)
const TTL_MS = 5 * 60 * 1000

// Prefetch edilecek endpoint'ler ve karşılık gelen cache key'leri
export const CACHE_KEYS = {
  HABITS:               'cache_habits',
  CHECKINS_TODAY:       'cache_checkins_today',
  ANALYTICS_DASHBOARD:  'cache_analytics_dashboard',
  ANALYTICS_OVERVIEW:   'cache_analytics_overview',
}

const ENDPOINTS = {
  [CACHE_KEYS.HABITS]:              '/api/habits',
  [CACHE_KEYS.CHECKINS_TODAY]:      '/api/checkins/today',
  [CACHE_KEYS.ANALYTICS_DASHBOARD]: '/api/analytics/dashboard',
  [CACHE_KEYS.ANALYTICS_OVERVIEW]:  '/api/analytics/overview',
}

// localStorage yardımcıları
function writeCache(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify({ data, ts: Date.now() }))
  } catch { /* quota aşımı gibi hatalarda sessizce devam et */ }
}

function readCache(key) {
  try {
    const raw = localStorage.getItem(key)
    if (!raw) return null
    return JSON.parse(raw)  // { data, ts }
  } catch {
    return null
  }
}

function isFresh(entry) {
  if (!entry) return false
  return Date.now() - entry.ts < TTL_MS
}

// Context
const DataCacheContext = createContext(null)

export function DataCacheProvider({ children }) {

  // Tüm endpoint'leri paralel çek, localStorage'a yaz
  const prefetchAll = useCallback(async () => {
    try {
      const keys = Object.values(CACHE_KEYS)
      const results = await Promise.allSettled(
        keys.map((key) => api.get(ENDPOINTS[key]))
      )
      results.forEach((result, i) => {
        if (result.status === 'fulfilled') {
          writeCache(keys[i], result.value.data)
        }
      })
    } catch {
      // prefetch başarısız olsa bile uygulama çalışmaya devam eder
    }
  }, [])

  // Tek bir key'i tazele (mutasyon sonrası)
  const invalidate = useCallback(async (key) => {
    const endpoint = ENDPOINTS[key]
    if (!endpoint) return
    try {
      const { data } = await api.get(endpoint)
      writeCache(key, data)
      return data
    } catch {
      return null
    }
  }, [])

  // Birden fazla key'i aynı anda tazele
  const invalidateMany = useCallback(async (...keys) => {
    await Promise.allSettled(keys.map((k) => invalidate(k)))
  }, [invalidate])

  // Cache'den oku; eski veri varsa döndür ve arka planda sessizce yenile
  const get = useCallback((key) => {
    const entry = readCache(key)
    if (!entry) return null

    // TTL geçmişse arka planda sessiz yenileme başlat (UI bloke etmez)
    if (!isFresh(entry)) {
      invalidate(key).catch(() => {})
    }

    return entry.data
  }, [invalidate])

  // Logout'ta tüm cache'i temizle
  const clearCache = useCallback(() => {
    Object.values(CACHE_KEYS).forEach((key) => {
      localStorage.removeItem(key)
    })
  }, [])

  return (
    <DataCacheContext.Provider value={{ prefetchAll, invalidate, invalidateMany, get, clearCache }}>
      {children}
    </DataCacheContext.Provider>
  )
}

export function useDataCache() {
  const ctx = useContext(DataCacheContext)
  if (!ctx) throw new Error('useDataCache must be used inside DataCacheProvider')
  return ctx
}
