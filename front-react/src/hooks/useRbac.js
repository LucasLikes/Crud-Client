import { useAuth } from './useAuth'

/**
 * Hook de permissões RBAC.
 * isAdmin é derivado do role JWT:  ROLE_ADMIN → true, ROLE_USER → false
 */
export function useRbac() {
  const { user, isAuthenticated } = useAuth()

  const isAdmin = user?.isAdmin ?? false

  return {
    isAdmin,
    isAuthenticated,
    can: {
      // Clientes
      createCustomer: isAdmin,
      editCustomer:   isAdmin,
      deleteCustomer: isAdmin,
      // Usuários
      createUser:   isAdmin,
      editUser:     isAdmin,
      deleteUser:   isAdmin,
      manageUsers:  isAdmin,
      // Rotas
      accessConfig: isAdmin,
    },
  }
}