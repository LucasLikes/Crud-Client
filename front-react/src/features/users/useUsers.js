import { useCallback, useState } from 'react'
import {
  listUsers as listUsersApi,
  getUserById as getUserByIdApi,
  createUser as createUserApi,
  updateUser as updateUserApi,
  deleteUser as deleteUserApi,
} from '../../api/usersApi'
import { logger } from '../../utils/logger'

/**
 * Custom hook para gerenciamento de usuários
 * 
 * Fornece:
 * - Estado: users, isLoading, error, successMessage
 * - Métodos: fetchUsers, getUser, createNew, updateExisting, remove
 * - Leitura de mensagens: getSuccessMessage, getErrorMessage
 * - Limpeza: clearMessages
 */
export function useUsers() {
  const [users, setUsers] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [successMessage, setSuccessMessage] = useState(null)

  // ── Fetch Users ──────────────────────────────────────────────────────
  const fetchUsers = useCallback(async () => {
    setIsLoading(true)
    setError(null)
    try {
      const data = await listUsersApi()
      setUsers(data)
      logger.info('📋 Usuários carregados', { count: data.length })
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao carregar usuários'
      setError(message)
      logger.error('❌ Erro ao carregar usuários', { message })
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Get User ──────────────────────────────────────────────────────
  const getUser = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)
    try {
      const user = await getUserByIdApi(id)
      logger.info('✅ Usuário obtido', { id, email: user.email })
      return user
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao obter usuário'
      setError(message)
      logger.error('❌ Erro ao obter usuário', { id, message })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Create User ──────────────────────────────────────────────────────
  const createNew = useCallback(async (payload) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const newUser = await createUserApi(payload)
      setUsers((prev) => [...prev, newUser])
      setSuccessMessage(`Usuário ${newUser.email} criado com sucesso`)
      logger.info('✅ Usuário criado', { email: newUser.email, id: newUser.id })
      return newUser
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao criar usuário'
      setError(message)
      logger.error('❌ Erro ao criar usuário', { message })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Update User ──────────────────────────────────────────────────────
  const updateExisting = useCallback(async (id, payload) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      const updatedUser = await updateUserApi(id, payload)
      setUsers((prev) =>
        prev.map((u) => (u.id === id ? updatedUser : u))
      )
      setSuccessMessage(`Usuário ${updatedUser.email} atualizado com sucesso`)
      logger.info('✅ Usuário atualizado', { id, email: updatedUser.email })
      return updatedUser
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao atualizar usuário'
      setError(message)
      logger.error('❌ Erro ao atualizar usuário', { id, message })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [])

  // ── Delete User ──────────────────────────────────────────────────────
  const remove = useCallback(async (id) => {
    setIsLoading(true)
    setError(null)
    setSuccessMessage(null)
    try {
      await deleteUserApi(id)
      const deletedUser = users.find((u) => u.id === id)
      setUsers((prev) => prev.filter((u) => u.id !== id))
      setSuccessMessage(`Usuário ${deletedUser?.email} deletado com sucesso`)
      logger.info('✅ Usuário deletado', { id })
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao deletar usuário'
      setError(message)
      logger.error('❌ Erro ao deletar usuário', { id, message })
      throw err
    } finally {
      setIsLoading(false)
    }
  }, [users])

  // ── Message Helpers ──────────────────────────────────────────────────────
  const clearMessages = useCallback(() => {
    setError(null)
    setSuccessMessage(null)
  }, [])

  const getSuccessMessage = useCallback(() => successMessage, [successMessage])
  const getErrorMessage = useCallback(() => error, [error])

  return {
    // Estado
    users,
    isLoading,
    error,
    successMessage,

    // Métodos
    fetchUsers,
    getUser,
    createNew,
    updateExisting,
    remove,

    // Leitura de mensagens
    getSuccessMessage,
    getErrorMessage,
    clearMessages,
  }
}
