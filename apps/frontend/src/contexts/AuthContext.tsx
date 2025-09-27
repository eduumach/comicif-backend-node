import React, { createContext, useContext, useState, useEffect } from 'react'
import { config } from '@/config/env'

interface AuthContextType {
  isAuthenticated: boolean
  token: string | null
  login: (password: string) => Promise<void>
  logout: () => void
  loading: boolean
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [token, setToken] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    // Check for stored token on mount
    const storedToken = localStorage.getItem('comicif_token')
    if (storedToken) {
      setToken(storedToken)
    }
    setLoading(false)
  }, [])

  const login = async (password: string) => {
    try {
      const response = await fetch(`${config.apiBaseUrl}/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ password }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Login failed')
      }

      const data = await response.json()
      const authToken = data.token

      setToken(authToken)
      localStorage.setItem('comicif_token', authToken)
    } catch (error) {
      console.error('Login error:', error)
      throw error
    }
  }

  const logout = () => {
    setToken(null)
    localStorage.removeItem('comicif_token')
  }

  const value = {
    isAuthenticated: !!token,
    token,
    login,
    logout,
    loading,
  }

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}