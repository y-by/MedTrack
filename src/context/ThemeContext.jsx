import { createContext, useContext, useEffect, useState, useCallback } from 'react'

/**
 * THEME BOUNDARY
 * --------------
 * `theme` is the user's stored preference: 'system' | 'light' | 'dark'.
 * When it's 'system', the resolved theme follows the OS's
 * prefers-color-scheme live (updates without a reload if the OS setting
 * changes while the app is open). The resolved theme is applied as
 * `data-theme` on <html>; see src/styles/tokens.css for the dark values.
 */

const ThemeContext = createContext(null)
const STORAGE_KEY = 'medtrack.theme'
const THEMES = ['system', 'light', 'dark']

function getStoredTheme() {
  const stored = localStorage.getItem(STORAGE_KEY)
  return THEMES.includes(stored) ? stored : 'system'
}

function resolveTheme(theme, prefersDark) {
  return theme === 'system' ? (prefersDark ? 'dark' : 'light') : theme
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(getStoredTheme)

  useEffect(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)')

    function applyTheme() {
      document.documentElement.setAttribute('data-theme', resolveTheme(theme, media.matches))
    }

    applyTheme()

    if (theme === 'system') {
      media.addEventListener('change', applyTheme)
      return () => media.removeEventListener('change', applyTheme)
    }
  }, [theme])

  const setTheme = useCallback((next) => {
    if (!THEMES.includes(next)) return
    localStorage.setItem(STORAGE_KEY, next)
    setThemeState(next)
  }, [])

  return <ThemeContext.Provider value={{ theme, setTheme }}>{children}</ThemeContext.Provider>
}

export function useTheme() {
  const ctx = useContext(ThemeContext)
  if (!ctx) throw new Error('useTheme must be used within ThemeProvider')
  return ctx
}
