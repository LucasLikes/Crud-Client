/**
 * Sistema de logging para debugar requisições e erros do backend
 */

const isDev = import.meta.env.DEV

const COLORS = {
  reset: '\x1b[0m',
  bright: '\x1b[1m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  red: '\x1b[31m',
  blue: '\x1b[36m',
}

function formatTime() {
  return new Date().toLocaleTimeString('pt-BR', {
    hour12: false,
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  })
}

export const logger = {
  // Request logs
  logRequest(method, url, config) {
    if (!isDev) return

    const headers = config?.headers || {}
    const hasAuth = headers.Authorization ? '✓ Bearer' : '✗ Sem Bearer'

    console.group(
      `%c📤 ${method} ${url}`,
      `color: ${COLORS.blue}; font-weight: bold; font-size: 13px`,
    )
    console.log(`%cTempo: ${formatTime()}`, `color: ${COLORS.blue}`)
    console.log(`%cAutentificação: ${hasAuth}`, `color: ${COLORS.blue}`)

    if (headers.Authorization) {
      const token = headers.Authorization.replace('Bearer ', '')
      console.log(
        `%cToken (primeiros 20 chars): ${token.substring(0, 20)}...`,
        `color: ${COLORS.blue}`,
      )
    }

    if (config?.data) {
      console.log('%cPayload:', `color: ${COLORS.blue}`, config.data)
    }

    console.groupEnd()
  },

  // Success response logs
  logResponseSuccess(method, url, status, data) {
    if (!isDev) return

    console.group(
      `%c✅ ${method} ${url} - ${status}`,
      `color: ${COLORS.green}; font-weight: bold; font-size: 13px`,
    )
    console.log(`%cTempo: ${formatTime()}`, `color: ${COLORS.green}`)
    console.log(`%cStatus: ${status}`, `color: ${COLORS.green}`)

    if (data) {
      console.log('%cResposta:', `color: ${COLORS.green}`, data)
    }

    console.groupEnd()
  },

  // Error logs
  logResponseError(method, url, status, error) {
    const errorMessage = error?.response?.data?.message || error?.message || ''
    const errorDetails = error?.response?.data

    // ============ DETECTAR ERRO CORS ============
    const isCorsError =
      error?.code === 'ERR_NETWORK' ||
      error?.message?.includes('CORS') ||
      (status === 403 && method === 'OPTIONS')

    if (isCorsError) {
      console.group(
        `%c⚠️  ERRO CORS DETECTADO - ${method} ${url}`,
        `color: ${COLORS.red}; font-weight: bold; font-size: 14px; background: #ffcccc; padding: 5px`,
      )
      console.log(
        `%c🔓 CORS (Cross-Origin Resource Sharing) está bloqueando a requisição!`,
        `color: ${COLORS.red}; font-weight: bold`,
      )
      console.log(
        `%c❌ Frontend: http://localhost:5173`,
        `color: ${COLORS.red}`,
      )
      console.log(
        `%c❌ Backend: http://localhost:8080`,
        `color: ${COLORS.red}`,
      )
      console.log(
        `%c💡 Solução: Configure CORS no backend Spring`,
        `color: ${COLORS.yellow}; font-weight: bold`,
      )
      console.log(
        `%c📝 Adicione isto na classe de configuração Spring:`,
        `color: ${COLORS.yellow}`,
      )
      console.log(`%c@Configuration
public class CorsConfiguration implements WebMvcConfigurer {
    @Override
    public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
                .allowedOrigins("http://localhost:5173")
                .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
                .allowedHeaders("*")
                .allowCredentials(true)
                .maxAge(3600);
    }
}`, `color: ${COLORS.blue}; font-family: monospace`)
      console.groupEnd()
      return
    }

    console.group(
      `%c❌ ${method} ${url} - ${status}`,
      `color: ${COLORS.red}; font-weight: bold; font-size: 13px`,
    )
    console.log(`%cTempo: ${formatTime()}`, `color: ${COLORS.red}`)
    console.log(`%cStatus HTTP: ${status}`, `color: ${COLORS.red}`)
    console.log(`%cMensagem: ${errorMessage}`, `color: ${COLORS.red}`)

    if (errorDetails) {
      console.log('%cDetalhes do erro:', `color: ${COLORS.red}`, errorDetails)
    }

    // Log stack trace se houver
    if (error?.stack) {
      console.log('%cStack:', `color: ${COLORS.red}`, error.stack)
    }

    console.groupEnd()
  },

  // General info
  info(message, data) {
    if (!isDev) return
    console.log(
      `%c[INFO] ${message}`,
      `color: ${COLORS.blue}; font-weight: bold`,
      data,
    )
  },

  // Warning
  warn(message, data) {
    if (!isDev) return
    console.warn(
      `%c[WARN] ${message}`,
      `color: ${COLORS.yellow}; font-weight: bold`,
      data,
    )
  },

  // Error
  error(message, data) {
    if (!isDev) return
    console.error(
      `%c[ERROR] ${message}`,
      `color: ${COLORS.red}; font-weight: bold`,
      data,
    )
  },
}
