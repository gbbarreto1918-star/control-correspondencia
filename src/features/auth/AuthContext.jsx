import { createContext, useContext, useState, useEffect, useCallback } from 'react'
import { supabase } from '../../lib/supabase'

const AuthContext = createContext(null)

export function AuthProvider({ children }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const stored = localStorage.getItem('cc_auth')
    if (stored === 'true') {
      setIsAuthenticated(true)
    }
    setLoading(false)
  }, [])

  const login = useCallback(async (pin) => {
    try {
      const { data, error } = await supabase
        .from('configuracion')
        .select('pin_secretaria')
        .eq('id', 1)
        .single()

      if (error) {
        console.error('Error al consultar configuración:', error)
        return false
      }

      if (data && data.pin_secretaria === pin) {
        localStorage.setItem('cc_auth', 'true')
        setIsAuthenticated(true)
        return true
      }

      return false
    } catch (err) {
      console.error('Error de autenticación:', err)
      return false
    }
  }, [])

  const logout = useCallback(() => {
    localStorage.removeItem('cc_auth')
    setIsAuthenticated(false)
  }, [])

  const value = {
    isAuthenticated,
    loading,
    login,
    logout
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth debe usarse dentro de un AuthProvider')
  }
  return context
}

export default AuthContext
