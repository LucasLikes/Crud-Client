import { useState } from 'react'
import { Navigate, useLocation, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../hooks/useAuth'
import { logger } from '../utils/logger'
import styles from './LoginPage.module.css'

export function LoginPage() {
  const { login, isAuthenticated } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()

  const [email, setEmail] = useState('admin@lume.com')
  const [password, setPassword] = useState('admin123')
  const [error, setError] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)

  if (isAuthenticated) {
    logger.info('👤 Usuário já autenticado, redirecionando para /customers')
    return <Navigate to="/customers" replace />
  }

  const from = location.state?.from?.pathname ?? '/customers'

  const handleSubmit = async (event) => {
    event.preventDefault()
    setError('')
    setIsSubmitting(true)

    logger.info('📝 Tentando fazer login', { email, from })

    try {
      await login({ email, password })
      logger.info('✅ Login bem-sucedido, redirecionando para', { destino: from })
      navigate(from, { replace: true })
    } catch (err) {
      logger.error('❌ Falha no login na LoginPage', {
        email,
        erro: err?.message,
        status: err?.response?.status,
      })
      setError('Falha no login. Verifique e-mail e senha.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className={styles['login-container']}>
      {/* ========== LADO ESQUERDO - BRANDING ========== */}
      <div className={styles['login-branding']}>
        <div className={styles['login-branding-content']}>
          <div className={styles['login-branding-icon']}>💡</div>
          <h2>LUME</h2>
          <p>Gerenciamento de clientes com tecnologia e inovação</p>
        </div>
      </div>

      {/* ========== LADO DIREITO - FORMULÁRIO ========== */}
      <div className={styles['login-form-container']}>
        <div className={styles['login-form-card']}>
          {/* Header */}
          <div className={styles['login-form-header']}>
            <h1>Bem-vindo</h1>
            <p>Acesse sua conta para continuar</p>
          </div>

          {/* Formulário */}
          <form className={styles['login-form-group']} onSubmit={handleSubmit}>
            {/* Email Input */}
            <div className={styles['login-input-wrapper']}>
              <label htmlFor="email" className={styles['login-input-label']}>
                E-mail
              </label>
              <input
                id="email"
                type="email"
                className={styles['login-input']}
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="seu@email.com"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Password Input */}
            <div className={styles['login-input-wrapper']}>
              <label htmlFor="password" className={styles['login-input-label']}>
                Senha
              </label>
              <input
                id="password"
                type="password"
                className={styles['login-input']}
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="••••••••"
                required
                disabled={isSubmitting}
              />
            </div>

            {/* Error Message */}
            {error && <div className={styles['login-error']}>{error}</div>}

            {/* Submit Button */}
            <button
              type="submit"
              className={styles['login-button']}
              disabled={isSubmitting}
            >
              {isSubmitting ? (
                <>
                  <span className={styles['login-button-spinner']}>⏳</span>
                  Entrando...
                </>
              ) : (
                'Entrar'
              )}
            </button>
          </form>

          {/* Footer Info */}
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.85rem', 
            color: 'var(--color-muted)',
            marginTop: '2rem',
            marginBottom: '1rem'
          }}>
            🎭 Modo <strong>MOCK</strong> ativado — use qualquer email/senha
          </p>

          {/* Register Link */}
          <p style={{ 
            textAlign: 'center', 
            fontSize: '0.9rem',
            marginTop: 0,
            marginBottom: 0
          }}>
            Não tem uma conta? <Link to="/register" style={{ 
              color: 'var(--color-primary)', 
              textDecoration: 'none',
              fontWeight: '500',
              cursor: 'pointer'
            }}>Criar conta</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
