import { httpClient } from './httpClient'
import { logger } from '../utils/logger'

/**
 * API de Usuários - Lume API
 * 
 * Endpoints:
 *   GET    /api/v1/users              -> User[]          (admin only)
 *   POST   /api/v1/users              -> User            (admin only)
 *   GET    /api/v1/users/{id}         -> User            (admin ou próprio)
 *   PUT    /api/v1/users/{id}         -> User            (admin ou próprio)
 *   DELETE /api/v1/users/{id}         -> void            (admin only)
 * 
 * User Model:
 *   {
 *     id: number,
 *     firstName: string,
 *     lastName: string,
 *     fullName: string,
 *     email: string,
 *     role: "ROLE_ADMIN" | "ROLE_USER",
 *     password?: string (only on create/update)
 *   }
 */

/**
 * GET /api/v1/users
 * Lista todos os usuários (admin only)
 */
export async function listUsers() {
  try {
    logger.info('📋 Listando usuários')
    const { data } = await httpClient.get('/api/v1/users')
    logger.info('✅ Usuários listados com sucesso', {
      count: data?.length || 0,
    })
    return data || []
  } catch (error) {
    logger.error('❌ Erro ao listar usuários', {
      status: error?.response?.status,
      message: error?.response?.data?.message,
    })
    throw error
  }
}

/**
 * GET /api/v1/users/:id
 * Obtém um usuário específico (admin ou próprio perfil)
 */
export async function getUserById(id) {
  try {
    logger.info('🔍 Obtendo usuário', { id })
    const { data } = await httpClient.get(`/api/v1/users/${id}`)
    logger.info('✅ Usuário obtido com sucesso', {
      email: data?.email,
      id: data?.id,
    })
    return data
  } catch (error) {
    logger.error('❌ Erro ao obter usuário', {
      id,
      status: error?.response?.status,
      message: error?.response?.data?.message,
    })
    throw error
  }
}

/**
 * POST /api/v1/users
 * Cria um novo usuário (admin only)
 */
export async function createUser(payload) {
  try {
    logger.info('➕ Criando novo usuário', {
      email: payload.email,
      firstName: payload.firstName,
    })
    const { data } = await httpClient.post('/api/v1/users', payload)
    logger.info('✅ Usuário criado com sucesso', {
      id: data?.id,
      email: data?.email,
      role: data?.role,
    })
    return data
  } catch (error) {
    logger.error('❌ Erro ao criar usuário', {
      email: payload.email,
      status: error?.response?.status,
      message: error?.response?.data?.message,
    })
    throw error
  }
}

/**
 * PUT /api/v1/users/:id
 * Atualiza um usuário (admin ou próprio perfil)
 */
export async function updateUser(id, payload) {
  try {
    logger.info('✏️ Atualizando usuário', {
      id,
      email: payload.email,
    })
    const { data } = await httpClient.put(`/api/v1/users/${id}`, payload)
    logger.info('✅ Usuário atualizado com sucesso', {
      id: data?.id,
      email: data?.email,
    })
    return data
  } catch (error) {
    logger.error('❌ Erro ao atualizar usuário', {
      id,
      status: error?.response?.status,
      message: error?.response?.data?.message,
    })
    throw error
  }
}

/**
 * DELETE /api/v1/users/:id
 * Deleta um usuário (admin only)
 */
export async function deleteUser(id) {
  try {
    logger.info('🗑️ Deletando usuário', { id })
    await httpClient.delete(`/api/v1/users/${id}`)
    logger.info('✅ Usuário deletado com sucesso', { id })
  } catch (error) {
    logger.error('❌ Erro ao deletar usuário', {
      id,
      status: error?.response?.status,
      message: error?.response?.data?.message,
    })
    throw error
  }
}
