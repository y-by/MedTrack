import { createContext, useContext, useEffect, useState, useCallback } from 'react'
import { users } from '../lib/mockData'

/**
 * AUTH BOUNDARY
 * -------------
 * Mocked for now: "Continue with Google" and "Continue with email" both
 * sign you in instantly as a seed user, no real credential check.
 * Session persists to localStorage so a refresh doesn't log you out.
 *
 * When we connect Netlify Identity, this file's internals swap to wrap
 * `netlify-identity-widget` (init / open / on('login') / on('logout') /
 * currentUser()) but the context shape below — user, loading, login,
 * logout — stays the same, so no consuming component changes.
 */

const AuthContext = createContext(null)
const STORAGE_KEY = 'medtrack.mockSession.userId'

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const savedId = localStorage.getItem(STORAGE_KEY)
    const savedUser = savedId ? users.find((u) => u.id === savedId) : null
    setUser(savedUser || null)
    setLoading(false)
  }, [])

  const login = useCallback(async ({ provider, asSeedUserId } = {}) => {
    // In mock mode we just log in as a seed user so the app is explorable.
    // `asSeedUserId` lets the Auth page offer "demo as patient" / "demo as caretaker".
    const seedUser = users.find((u) => u.id === asSeedUserId) || users[0]
    localStorage.setItem(STORAGE_KEY, seedUser.id)
    setUser(seedUser)
    return seedUser
  }, [])

  const logout = useCallback(async () => {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
  }, [])

  // Mock mode mutates the shared `users` array in place (see lib/api.js),
  // so after a roles/profile update we just re-read the same object by id.
  // The real Netlify Identity integration will instead update from the
  // JWT/user object returned by the identity widget's 'login' event.
  const refreshUser = useCallback(() => {
    setUser((current) => {
      if (!current) return current
      const fresh = users.find((u) => u.id === current.id)
      return fresh ? { ...fresh } : current
    })
  }, [])

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used within AuthProvider')
  return ctx
}
