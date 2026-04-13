import axios from 'axios'
import { refreshToken as refreshTokenRequest } from './authApi'
import {
  clearTokens,
  getAccessToken,
  getRefreshToken,
  setAccessToken,
  setRefreshToken,
} from '../utils/storage'
import { logger } from '../utils/logger'

/**
 * HTTP Client para comunicação com o backend.
 *
 * Token rotation:
 *   O backend agora retorna { accessToken, refreshToken } no endpoint /auth/refresh.
 *   Ao receber a resposta, tanto o accessToken quanto o refreshToken são
 *   persistidos no storage, garantindo que o cliente sempre use o par mais recente.
 *   Isso implementa o lado cliente do token rotation pattern.
 */

const USE_MOCK = new URLSearchParams(window.location.search).get('mock') === 'true'
const baseURL = import.meta.env.VITE_API_BASE_URL ?? 'http://localhost:8080'

logger.info('🔗 HTTP Client inicializado', { baseURL, useMock: USE_MOCK })

export const httpClient = axios.create({
  baseURL: USE_MOCK ? 'http://mock-api' : baseURL,
  headers: { 'Content-Type': 'application/json' },
})

let isRefreshing = false
let refreshSubscribers = []

function subscribeToRefresh(callback) {
  refreshSubscribers.push(callback)
}

function notifySubscribers(token) {
  refreshSubscribers.forEach((cb) => cb(token))
  refreshSubscribers = []
}

// ── REQUEST INTERCEPTOR ──────────────────────────────────────────────────────

httpClient.interceptors.request.use((config) => {
  const token = getAccessToken()
  if (token) config.headers.Authorization = `Bearer ${token}`
  logger.logRequest(config.method.toUpperCase(), config.url, config)
  return config
})

// ── RESPONSE INTERCEPTOR ─────────────────────────────────────────────────────

httpClient.interceptors.response.use(
  (response) => {
    logger.logResponseSuccess(
      response.config.method.toUpperCase(),
      response.config.url,
      response.status,
      response.data,
    )
    return response
  },
  async (error) => {
    const originalRequest = error.config
    const status          = error?.response?.status

    logger.logResponseError(
      originalRequest?.method?.toUpperCase() || 'UNKNOWN',
      originalRequest?.url  || 'UNKNOWN',
      status || 'NO_STATUS',
      error,
    )

    if (USE_MOCK && status === 401) {
      logger.warn('🎭 MOCK: Simulando erro 401, limpando tokens', {})
      clearTokens()
      return Promise.reject(error)
    }

    if (status !== 401 || originalRequest?._retry) {
      return Promise.reject(error)
    }

    const currentRefreshToken = getRefreshToken()
    if (!currentRefreshToken) {
      logger.warn('Nenhum refresh token disponível. Limpando e redirecionando para login.', {})
      clearTokens()
      return Promise.reject(error)
    }

    if (isRefreshing) {
      logger.info('Refresh em progresso, enfileirando requisição.')
      return new Promise((resolve) => {
        subscribeToRefresh((newAccessToken) => {
          originalRequest.headers.Authorization = `Bearer ${newAccessToken}`
          resolve(httpClient(originalRequest))
        })
      })
    }

    originalRequest._retry = true
    isRefreshing = true

    try {
      logger.info('🔄 Renovando tokens (rotation)...')

      // Backend retorna { accessToken, refreshToken } — token rotation
      const { accessToken, refreshToken } = await refreshTokenRequest({
        refreshToken: currentRefreshToken,
      })

      // Persiste AMBOS os tokens (rotation: o refreshToken antigo foi revogado)
      setAccessToken(accessToken)
      setRefreshToken(refreshToken)

      logger.info('✅ Tokens renovados com sucesso.')

      notifySubscribers(accessToken)
      originalRequest.headers.Authorization = `Bearer ${accessToken}`

      return httpClient(originalRequest)
    } catch (refreshError) {
      logger.error('❌ Falha ao renovar tokens, deslogando.', {
        status: refreshError?.response?.status,
      })
      clearTokens()
      return Promise.reject(refreshError)
    } finally {
      isRefreshing = false
    }
  },
)