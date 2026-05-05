import { createContext, useContext, useEffect, useState, useCallback } from 'react'

const ACCENT_KEY = 'streakly_accent'
const MODE_KEY = 'streakly_theme_mode'

export const ACCENT_PRESETS = [
  { name: 'Emerald',  primary: '#67C090', secondary: '#AAFFC7' },
  { name: 'Violet',   primary: '#8B5CF6', secondary: '#C4B5FD' },
  { name: 'Sapphire', primary: '#3B82F6', secondary: '#93C5FD' },
  { name: 'Amber',    primary: '#F59E0B', secondary: '#FCD34D' },
  { name: 'Rose',     primary: '#EC4899', secondary: '#F9A8D4' },
  { name: 'Cyan',     primary: '#06B6D4', secondary: '#67E8F9' },
]

const ThemeContext = createContext(null)

function readAccent() {
  try {
    const raw = localStorage.getItem(ACCENT_KEY)
    if (raw) {
      const parsed = JSON.parse(raw)
      if (parsed?.primary && parsed?.secondary) return parsed
    }
    // Fallback: kullanıcı objesinde accentColor varsa eşleşeni getir
    const user = JSON.parse(localStorage.getItem('streakly_user') || 'null')
    if (user?.accentColor) {
      const match = ACCENT_PRESETS.find((p) => p.primary.toLowerCase() === user.accentColor.toLowerCase())
      if (match) return match
    }
  } catch {}
  return ACCENT_PRESETS[0]
}

function readMode() {
  return localStorage.getItem(MODE_KEY) || 'dark'
}

function applyAccent(accent) {
  const root = document.documentElement
  root.style.setProperty('--accent-green', accent.primary)
  root.style.setProperty('--glow-mint', accent.secondary)
}

function applyMode(mode) {
  document.documentElement.setAttribute('data-theme', mode)
}

export function ThemeProvider({ children }) {
  const [accent, setAccent] = useState(readAccent)
  const [mode, setMode] = useState(readMode)

  useEffect(() => { applyAccent(accent) }, [accent])
  useEffect(() => { applyMode(mode) }, [mode])

  const updateAccent = useCallback((next) => {
    setAccent(next)
    try { localStorage.setItem(ACCENT_KEY, JSON.stringify(next)) } catch {}
  }, [])

  const updateMode = useCallback((next) => {
    setMode(next)
    try { localStorage.setItem(MODE_KEY, next) } catch {}
  }, [])

  return (
    <ThemeContext.Provider value={{ accent, mode, setAccent: updateAccent, setMode: updateMode }}>
      {children}
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used inside ThemeProvider')
  return ctx
}
