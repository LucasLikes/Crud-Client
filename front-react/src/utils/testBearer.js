/**
 * Script de teste para verificar se Bearer token está sendo enviado
 * Para usar: abra o console (F12) e execute: testBearerToken()
 */

import { httpClient } from '../api/httpClient'
import { getAccessToken } from '../utils/storage'
import { logger } from './logger'

export async function testBearerToken() {
  logger.info('🧪 INICIANDO TESTE DE BEARER TOKEN')

  // 1. Verifica se tem token armazenado
  const token = getAccessToken()
  console.log('%c✅ Token armazenado no localStorage:', 'color: blue; font-weight: bold')
  console.log(token ? `${token.substring(0, 30)}...` : '❌ NENHUM TOKEN!')

  if (!token) {
    logger.error('❌ Nenhum token encontrado. Faça login primeiro!', {})
    return
  }

  // 2. Tenta fazer uma requisição simples para testing
  try {
    logger.info('📤 Testando requisição com Bearer...')
    
    // Faz uma requisição GET simples (que não existe, só para testar headers)
    const response = await httpClient.get('/api/v1/customers', {
      validateStatus: () => true, // Aceita qualquer status
    })

    console.log('%c✅ Teste concluído!', 'color: green; font-weight: bold')
    console.log('%cStatus:', 'color: green', response.status)
    console.log('%cHeaders enviados:', 'color: green', response.config.headers)
    console.log(
      '%cAuthorization header:',
      'color: green',
      response.config.headers.Authorization
        ? `✓ ${response.config.headers.Authorization.substring(0, 30)}...`
        : '❌ NÃO ENVIADO',
    )
  } catch (error) {
    logger.error('❌ Erro durante teste', error.message)
  }
}

// Exportar para window para usar no console
if (typeof window !== 'undefined') {
  window.testBearerToken = testBearerToken
}
