import axios from 'axios'
import { logger } from '../utils/logger'
import { mockApi } from './mockApi'

const USE_MOCK = new URLSearchParams(window.location.search).get('mock') === 'true'
const baseURL  = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

const authApi = axios.create({
  baseURL: USE_MOCK ? 'http://mock-api' : baseURL,
  headers: { 'Content-Type': 'application/json' },
})

export async function login(payload) {
  if (USE_MOCK) return mockApi.login(payload)
  const { data } = await authApi.post('/api/v1/auth/login', payload)
  logger.info('✅ Login OK', { email: payload.email })
  return data  // { accessToken, refreshToken }
}

export async function register(payload) {
  if (USE_MOCK) return mockApi.register(payload)
  const { data } = await authApi.post('/api/v1/auth/register', {
    email: payload.email,
    password: payload.password,
  })
  return data
}

export async function refreshToken(payload) {
  if (USE_MOCK) return mockApi.refreshToken(payload)
  const { data } = await authApi.post('/api/v1/auth/refresh', payload)
  return data  // { accessToken, refreshToken }
}

export async function logout(payload) {
  if (USE_MOCK) return mockApi.logout(payload)
  const { data } = await authApi.post('/api/v1/auth/logout', payload)
  return data
}