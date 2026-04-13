import { useState } from 'react'
import { Alert } from '../ui/Alert'
import styles from './UserForm.module.css'

/**
 * Form para criar/editar usuários
 * 
 * Props:
 *   user?: User                    - Usuário para editar (se vazio, é criação)
 *   isLoading?: boolean            - Desativa form enquanto envia
 *   onSubmit: (data) => Promise    - Chamado ao enviar
 *   onCancel?: () => void          - Chamado ao cancelar
 *   apiError?: string              - Erro da API para exibir
 *   onClearError?: () => void      - Chamado para limpar erro
 */
export function UserForm({ user, isLoading, onSubmit, onCancel, apiError, onClearError }) {
  const isEditing = !!user
  const [formData, setFormData] = useState({
    firstName: user?.firstName || '',
    lastName: user?.lastName || '',
    email: user?.email || '',
    password: '',
    role: user?.role || 'ROLE_USER',
  })
  const [errors, setErrors] = useState({})
  const [isSubmitting, setIsSubmitting] = useState(false)

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
    if (!isEditing && !formData.password) {
      newErrors.password = 'Senha é obrigatória'
    }
    if (isEditing && formData.password && formData.password.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
    }
    if (!isEditing && formData.password?.length < 6) {
      newErrors.password = 'Senha deve ter no mínimo 6 caracteres'
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

    setIsSubmitting(true)
    try {
      const payload = {
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        role: formData.role,
      }

      // Adicionar senha apenas se estiver preenchida
      if (formData.password) {
        payload.password = formData.password
      }

      await onSubmit(payload)
    } finally {
      setIsSubmitting(false)
    }
  }

  const disabled = isLoading || isSubmitting

  return (
    <form className={styles.form} onSubmit={handleSubmit}>
      <h2>{isEditing ? 'Editar Usuário' : 'Criar Novo Usuário'}</h2>

      {/* Erro da API */}
      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={onClearError}
          autoClose={false}
        />
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
          disabled={disabled}
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
          disabled={disabled}
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
          disabled={disabled || isEditing}
          placeholder="Ex: usuario@lume.com"
          className={errors.email ? styles.error : ''}
        />
        {errors.email && (
          <span className={styles['error-message']}>{errors.email}</span>
        )}
      </div>

      {/* Senha */}
      <div className={styles['form-group']}>
        <label htmlFor="password">
          Senha {!isEditing && '*'}
          {isEditing && '(deixe em branco para manter atual)'}
        </label>
        <input
          id="password"
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          disabled={disabled}
          placeholder={isEditing ? 'Opcionalmente digite nova senha' : 'Mínimo 6 caracteres'}
          className={errors.password ? styles.error : ''}
        />
        {errors.password && (
          <span className={styles['error-message']}>{errors.password}</span>
        )}
      </div>

      {/* Role */}
      <div className={styles['form-group']}>
        <label htmlFor="role">Função *</label>
        <select
          id="role"
          name="role"
          value={formData.role}
          onChange={handleChange}
          disabled={disabled}
        >
          <option value="ROLE_USER">👤 Usuário</option>
          <option value="ROLE_ADMIN">🔐 Admin</option>
        </select>
      </div>

      {/* Botões */}
      <div className={styles['form-actions']}>
        <button
          type="submit"
          disabled={disabled}
          className={styles['btn-submit']}
        >
          {isSubmitting ? '⏳ Enviando...' : isEditing ? '💾 Atualizar' : '➕ Criar'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={disabled}
            className={styles['btn-cancel']}
          >
            ✕ Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
