import { Navigate, Outlet, useLocation } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'

/**
 * Protege rotas por autenticação e opcionalmente por role.
 * requiredRoles aceita: ['ROLE_ADMIN'] ou ['admin'] (ambos funcionam)
 */
export function ProtectedRoute({ requiredRoles = [] }) {
  const { isAuthenticated, isLoading, user } = useAuth()
  const location = useLocation()

  if (isLoading) {
    return <div style={{ display: 'grid', placeItems: 'center', minHeight: '100vh' }}>Carregando...</div>
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />
  }

  if (requiredRoles.length > 0) {
    const userRole = user?.role ?? ''
    const hasRole = requiredRoles.some(r =>
      r === userRole ||
      r.toLowerCase() === userRole.toLowerCase() ||
      (r === 'ROLE_ADMIN' && user?.isAdmin) ||
      (r === 'admin' && user?.isAdmin)
    )
    if (!hasRole) {
      return <Navigate to="/home" replace />
    }
  }

  return <Outlet />
}