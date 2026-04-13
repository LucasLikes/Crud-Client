/**
 * Hook customizado para gerenciar lógica de clientes
 * Centraliza: fetch, criar, atualizar, deletar, estados
 */

import { useCallback, useState } from 'react'
import {
  createCustomer,
  deleteCustomer,
  listCustomers,
  updateCustomer,
} from '../../api/customersApi'
import { logger } from '../../utils/logger'

export function useCustomers() {
  const [customers, setCustomers] = useState([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(null)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Buscar todos os clientes
  const fetchCustomers = useCallback(async () => {
    try {
      setIsLoading(true)
      setError(null)
      logger.info('📋 Buscando clientes...')
      const data = await listCustomers()
      setCustomers(data)
      logger.info('✅ Clientes carregados', { total: data.length })
    } catch (err) {
      logger.error('❌ Erro ao carregar clientes', {
        erro: err.message,
        status: err?.response?.status,
      })
      setError('Não foi possível carregar os clientes. Tente novamente.')
    } finally {
      setIsLoading(false)
    }
  }, [])

  // Criar novo cliente
  const createNew = useCallback(
    async (payload) => {
      try {
        setIsSubmitting(true)
        setError(null)
        logger.info('➕ Criando novo cliente', { nome: payload.name })
        await createCustomer(payload)
        setSuccess('Cliente criado com sucesso! ✨')
        await fetchCustomers()
        return true
      } catch (err) {
        logger.error('❌ Erro ao criar cliente', {
          erro: err.message,
          status: err?.response?.status,
        })
        setError('Não foi possível criar o cliente. Verifique os dados.')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchCustomers]
  )

  // Atualizar cliente existente
  const updateExisting = useCallback(
    async (id, payload) => {
      try {
        setIsSubmitting(true)
        setError(null)
        logger.info('✏️ Atualizando cliente', { id, nome: payload.name })
        await updateCustomer(id, payload)
        setSuccess('Cliente atualizado com sucesso! ✨')
        await fetchCustomers()
        return true
      } catch (err) {
        logger.error('❌ Erro ao atualizar cliente', {
          erro: err.message,
          status: err?.response?.status,
        })
        setError('Não foi possível atualizar o cliente.')
        return false
      } finally {
        setIsSubmitting(false)
      }
    },
    [fetchCustomers]
  )

  // Deletar cliente
  const remove = useCallback(
    async (id) => {
      try {
        setError(null)
        logger.info('🗑️ Deletando cliente', { id })
        await deleteCustomer(id)
        setSuccess('Cliente removido com sucesso!')
        await fetchCustomers()
        return true
      } catch (err) {
        logger.error('❌ Erro ao deletar cliente', {
          erro: err.message,
          status: err?.response?.status,
        })
        setError('Não foi possível remover o cliente.')
        return false
      }
    },
    [fetchCustomers]
  )

  // Limpar mensagens após timeout
  const clearMessages = useCallback(() => {
    setSuccess(null)
    setError(null)
  }, [])

  return {
    // Estado
    customers,
    isLoading,
    error,
    success,
    isSubmitting,

    // Ações
    fetchCustomers,
    createNew,
    updateExisting,
    remove,
    clearMessages,
  }
}
