import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import { api } from '../lib/api'

const AuthContext = createContext(null)

function normalizeStoredUser(user) {
  if (!user || typeof user !== 'object') return null
  if (user.id) return user
  if (user._id) return { ...user, id: String(user._id) }
  return user
}

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('zygo-user')
    if (!saved) return null

    try {
      return normalizeStoredUser(JSON.parse(saved))
    } catch {
      localStorage.removeItem('zygo-user')
      return null
    }
  })

  useEffect(() => {
    if (user) {
      localStorage.setItem('zygo-user', JSON.stringify(user))
    } else {
      localStorage.removeItem('zygo-user')
    }
  }, [user])

  const value = useMemo(() => ({
    user,
    setUser,
    logout: () => setUser(null),
    refreshUser: async () => {
      const userId = user?.id || user?._id
      if (!userId) return null
      const nextUser = await api.getUser(userId)
      setUser(nextUser)
      return nextUser
    },
  }), [user])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  return useContext(AuthContext)
}
