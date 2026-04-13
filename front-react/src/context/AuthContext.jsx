import { useCallback, useEffect, useMemo, useState } from 'react'
import { login as loginRequest, logout as logoutRequest } from '../api/authApi'
import { logger } from '../utils/logger'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/storage'
import { AuthContext } from './authContext'

/**
 * Decode JWT payload (sem verificar assinatura – só pra leitura de claims no frontend)
 */
function decodeJWT(token) {
  try {
    const payload = token.split('.')[1]
    const decoded = JSON.parse(atob(payload.replace(/-/g, '+').replace(/_/g, '/')))
    return decoded
  } catch {
    return null
  }
}

/**
 * Monta o objeto user a partir do token JWT.
 * O backend emite: { sub: email, role: "ROLE_ADMIN" | "ROLE_USER", iat, exp }
 */
function buildUserFromToken(token) {
  if (!token) return null
  const claims = decodeJWT(token)
  if (!claims) return null

  // Normaliza role: aceita tanto "ROLE_ADMIN" quanto "admin" (mock)
  const rawRole = claims.role ?? ''
  const isAdmin =
    rawRole === 'ROLE_ADMIN' ||
    rawRole === 'admin' ||
    rawRole.toLowerCase().includes('admin')

  return {
    email: claims.sub ?? claims.email ?? '',
    role: rawRole,
    isAdmin,
  }
}

export function AuthProvider({ children }) {
  const [accessToken, setAccessTokenState] = useState(() => getAccessToken())
  const [user, setUser] = useState(() => buildUserFromToken(getAccessToken()))
  const [isLoading, setIsLoading] = useState(false)

  // Sincroniza user sempre que o token mudar
  useEffect(() => {
    setUser(buildUserFromToken(accessToken))
  }, [accessToken])

  const login = useCallback(async ({ email, password }) => {
    setIsLoading(true)
    try {
      const { accessToken: newAccessToken, refreshToken } = await loginRequest({ email, password })

      setAccessToken(newAccessToken)
      setRefreshToken(refreshToken)
      setAccessTokenState(newAccessToken)

      const userData = buildUserFromToken(newAccessToken)
      setUser(userData)

      logger.info('✅ Login OK', { email: userData?.email, role: userData?.role, isAdmin: userData?.isAdmin })
    } catch (error) {
      logger.error('❌ Login falhou', { status: error?.response?.status })
      throw error
    } finally {
      setIsLoading(false)
    }
  }, [])

  const logout = useCallback(async () => {
    try {
      const refreshToken = getRefreshToken()
      if (refreshToken) await logoutRequest({ refreshToken })
    } catch {
      // silencia erros de logout no backend
    } finally {
      clearTokens()
      setAccessTokenState(null)
      setUser(null)
    }
  }, [])

  const value = useMemo(() => ({
    accessToken,
    isAuthenticated: Boolean(accessToken),
    isLoading,
    user,
    login,
    logout,
  }), [accessToken, isLoading, user, login, logout])

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}