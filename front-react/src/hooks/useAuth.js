import { useContext, useMemo } from 'react'
import { AuthContext } from '../context/authContext'

export function useAuth() {
  const context = useContext(AuthContext)

  if (!context) {
    throw new Error('useAuth must be used within AuthProvider')
  }

  const { accessToken, ...rest } = context

  // Apenas retorna o user como está armazenado (já vem com isAdmin derivado)
  const user = useMemo(() => rest.user, [rest.user])

  return { ...rest, accessToken, user }
}
