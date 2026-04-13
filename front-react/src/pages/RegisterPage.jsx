import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Alert } from '../components/ui/Alert'
import { register as registerApi } from '../api/authApi'
import { logger } from '../utils/logger'
import styles from './RegisterPage.module.css'

export function RegisterPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState(null)
  const [success, setSuccess] = useState(false)
  
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  
  const [errors, setErrors] = useState({})

  const validateForm = () => {
    const newErrors = {}

    if (!formData.firstName.trim()) {
      newErrors.firstName = 'Primeiro nome é obrigatório'
    }
    if (!formData.lastName.trim()) {
      newErrors.lastName = 'Último nome é obrigatório'
    }
    if (!formData.email.trim()) {
      newErrors.email = 'Email é obrigatório'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email inválido'
    }
    if (!formData.password) {
      newErrors.password = 'Senha é obrigatória'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }
    if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Senhas não conferem'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }))
    // Limpar erro ao editar o campo
    if (errors[name]) {
      setErrors((prev) => ({
        ...prev,
        [name]: null,
      }))
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()

    if (!validateForm()) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      logger.info('📝 Registrando novo usuário', { email: formData.email })

      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        password: formData.password,
      }

      await registerApi(payload)

      logger.info('✅ Registro realizado com sucesso', { email: formData.email })
      setSuccess(true)

      // Redirecionar para login após 2 segundos
      setTimeout(() => {
        navigate('/login', {
          state: {
            message: 'Conta criada com sucesso! Agora faça login.',
            email: formData.email,
          },
        })
      }, 2000)
    } catch (err) {
      const message = err?.response?.data?.message || 'Erro ao criar conta'
      setError(message)
      logger.error('❌ Erro ao registrar', {
        email: formData.email,
        message,
        status: err?.response?.status,
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (success) {
    return (
      <div className={styles['register-page']}>
        <div className={styles['register-container']}>
          <div className={styles['success-message']}>
            <div className={styles['success-icon']}>✅</div>
            <h2>Conta Criada com Sucesso!</h2>
            <p>Redirecionando para login...</p>
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className={styles['register-page']}>
      <div className={styles['register-container']}>
        <form className={styles['register-form']} onSubmit={handleSubmit}>
          {/* Header */}
          <div className={styles['form-header']}>
            <div className={styles['brand-icon']}>📊</div>
            <h1>Criar Conta</h1>
            <p>Preencha os campos abaixo para se registrar</p>
          </div>

          {/* Alerts */}
          {error && (
            <Alert type="error" message={error} onClose={() => setError(null)} />
          )}

          {/* Primeiro Nome */}
          <div className={styles['form-group']}>
            <label htmlFor="firstName">Primeiro Nome *</label>
            <input
              id="firstName"
              type="text"
              name="firstName"
              value={formData.firstName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ex: João"
              className={errors.firstName ? styles.error : ''}
            />
            {errors.firstName && (
              <span className={styles['error-message']}>{errors.firstName}</span>
            )}
          </div>

          {/* Último Nome */}
          <div className={styles['form-group']}>
            <label htmlFor="lastName">Último Nome *</label>
            <input
              id="lastName"
              type="text"
              name="lastName"
              value={formData.lastName}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Ex: Silva"
              className={errors.lastName ? styles.error : ''}
            />
            {errors.lastName && (
              <span className={styles['error-message']}>{errors.lastName}</span>
            )}
          </div>

          {/* Email */}
          <div className={styles['form-group']}>
            <label htmlFor="email">Email *</label>
            <input
              id="email"
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="seu@email.com"
              className={errors.email ? styles.error : ''}
            />
            {errors.email && (
              <span className={styles['error-message']}>{errors.email}</span>
            )}
          </div>

          {/* Senha */}
          <div className={styles['form-group']}>
            <label htmlFor="password">Senha *</label>
            <input
              id="password"
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Mínimo 6 caracteres"
              className={errors.password ? styles.error : ''}
            />
            {errors.password && (
              <span className={styles['error-message']}>{errors.password}</span>
            )}
          </div>

          {/* Confirmar Senha */}
          <div className={styles['form-group']}>
            <label htmlFor="passwordConfirm">Confirmar Senha *</label>
            <input
              id="passwordConfirm"
              type="password"
              name="passwordConfirm"
              value={formData.passwordConfirm}
              onChange={handleChange}
              disabled={isLoading}
              placeholder="Repita sua senha"
              className={errors.passwordConfirm ? styles.error : ''}
            />
            {errors.passwordConfirm && (
              <span className={styles['error-message']}>
                {errors.passwordConfirm}
              </span>
            )}
          </div>

          {/* Submit */}
          <button
            type="submit"
            disabled={isLoading}
            className={styles['btn-register']}
          >
            {isLoading ? '⏳ Criando conta...' : '✅ Criar Conta'}
          </button>

          {/* Link para Login */}
          <div className={styles['login-link']}>
            Já tem conta?{' '}
            <Link to="/login">Faça login aqui</Link>
          </div>
        </form>
      </div>
    </div>
  )
}
