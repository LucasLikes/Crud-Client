import { httpClient } from './httpClient'
import { mockApi } from './mockApi'

/**
 * API de Clientes - Lume API
 * 
 * Base URL: /api/v1/customers
 * Authorization: Bearer token (adicionado automaticamente pelo httpClient)
 * 
 * Endpoints disponíveis:
 *   GET    /api/v1/customers                    -> { data: Customer[] }
 *   POST   /api/v1/customers                    -> { id, email, name, ... }
 *   GET    /api/v1/customers/{id}               -> { id, email, name, ... }
 *   PUT    /api/v1/customers/{id}               -> { id, email, name, ... }
 *   DELETE /api/v1/customers/{id}               -> { message: "..." }
 *   GET    /api/v1/customers/address-lookup/{zipCode} -> { street, city, state, ... }
 * 
 * Customer Model (esperado):
 *   {
 *     id: number,
 *     name: string,
 *     email: string,
 *     phone: string,
 *     cpf: string,
 *     zipCode: string,
 *     street: string,
 *     number: string,
 *     city: string,
 *     state: string,
 *     complement?: string,
 *     createdAt: string (ISO 8601),
 *     updatedAt: string (ISO 8601)
 *   }
 */

const USE_MOCK = new URLSearchParams(window.location.search).get('mock') === 'true'

export async function createCustomer(payload) {
  if (USE_MOCK) return mockApi.createCustomer(payload)
  
  // POST /api/v1/customers
  // Envia dados do cliente e retorna o cliente criado com ID
  const { data } = await httpClient.post('/api/v1/customers', payload)
  return data
}

export async function listCustomers() {
  if (USE_MOCK) return mockApi.listCustomers()
  
  // GET /api/v1/customers
  // Retorna lista de clientes
  const { data } = await httpClient.get('/api/v1/customers')
  return data
}

export async function getCustomerById(id) {
  if (USE_MOCK) return mockApi.getCustomerById(id)
  
  // GET /api/v1/customers/{id}
  // Busca cliente específico por ID
  const { data } = await httpClient.get(`/api/v1/customers/${id}`)
  return data
}

export async function updateCustomer(id, payload) {
  if (USE_MOCK) return mockApi.updateCustomer(id, payload)
  
  // PUT /api/v1/customers/{id}
  // Atualiza cliente específico
  const { data } = await httpClient.put(`/api/v1/customers/${id}`, payload)
  return data
}

export async function deleteCustomer(id) {
  if (USE_MOCK) return mockApi.deleteCustomer(id)
  
  // DELETE /api/v1/customers/{id}
  // Remove cliente específico
  const { data } = await httpClient.delete(`/api/v1/customers/${id}`)
  return data
}

export async function lookupAddress(zipCode) {
  if (USE_MOCK) return mockApi.lookupAddress(zipCode)
  
  // GET /api/v1/customers/address-lookup/{zipCode}
  // Busca endereço por CEP (pode usar ViaCEP ou outra API)
  // Retorno esperado: { street, number?, city, state, neighborhood, ... }
  const { data } = await httpClient.get(
    `/api/v1/customers/address-lookup/${zipCode}`,
  )
  return data
}
