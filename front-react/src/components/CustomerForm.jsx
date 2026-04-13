import { useEffect, useState } from 'react'
import { lookupAddress } from '../api/customersApi'
import { formatCpf, isValidCpf, sanitizeDigits } from '../utils/cpf'
import { formatZipCode } from '../utils/formatters'
import { Alert } from './ui/Alert'
import styles from './CustomerForm.module.css'

const EMPTY_FORM = {
  name: '',
  cpf: '',
  address: {
    street: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
  },
}

export function CustomerForm({
  initialValues,
  onSubmit,
  onCancel,
  submitLabel = 'Salvar',
  isSubmitting,
  apiError,
  onClearError,
}) {
  const [form, setForm] = useState(EMPTY_FORM)
  const [errors, setErrors] = useState({})
  const [isLookingZipCode, setIsLookingZipCode] = useState(false)

  useEffect(() => {
    if (initialValues) {
      setForm({
        name: initialValues.name ?? '',
        cpf: formatCpf(initialValues.cpf ?? ''),
        address: {
          street: initialValues.address?.street ?? '',
          neighborhood: initialValues.address?.neighborhood ?? '',
          city: initialValues.address?.city ?? '',
          state: initialValues.address?.state ?? '',
          zipCode: formatZipCode(initialValues.address?.zipCode ?? ''),
        },
      })
      return
    }
    setForm(EMPTY_FORM)
  }, [initialValues])

  const handleAddressChange = (field, value) => {
    setForm((prev) => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value,
      },
    }))
  }

  const validate = () => {
    const newErrors = {}
    if (!form.name.trim()) newErrors.name = 'Nome e obrigatorio.'
    if (!isValidCpf(form.cpf)) newErrors.cpf = 'CPF invalido.'

    const zipCodeDigits = form.address.zipCode.replace(/\D/g, '')
    if (zipCodeDigits.length !== 8) newErrors.zipCode = 'CEP deve ter 8 digitos.'
    if (!form.address.street.trim()) newErrors.street = 'Logradouro e obrigatorio.'
    if (!form.address.neighborhood.trim()) {
      newErrors.neighborhood = 'Bairro e obrigatorio.'
    }
    if (!form.address.city.trim()) newErrors.city = 'Cidade e obrigatoria.'
    if (!form.address.state.trim()) newErrors.state = 'Estado e obrigatorio.'

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleLookupZipCode = async () => {
    const zipCodeDigits = form.address.zipCode.replace(/\D/g, '')
    if (zipCodeDigits.length !== 8) {
      setErrors((prev) => ({ ...prev, zipCode: 'Informe um CEP valido.' }))
      return
    }

    setIsLookingZipCode(true)
    try {
      const data = await lookupAddress(zipCodeDigits)
      setForm((prev) => ({
        ...prev,
        address: {
          ...prev.address,
          street: data.street ?? '',
          neighborhood: data.neighborhood ?? '',
          city: data.city ?? '',
          state: data.state ?? '',
          zipCode: formatZipCode(data.zipCode ?? zipCodeDigits),
        },
      }))
      setErrors((prev) => ({ ...prev, zipCode: undefined }))
    } catch {
      setErrors((prev) => ({
        ...prev,
        zipCode: 'Nao foi possivel buscar o endereco para este CEP.',
      }))
    } finally {
      setIsLookingZipCode(false)
    }
  }

  const handleSubmit = async (event) => {
    event.preventDefault()
    if (!validate()) return

    await onSubmit({
      name: form.name.trim(),
      cpf: sanitizeDigits(form.cpf),
      address: {
        street: form.address.street.trim(),
        neighborhood: form.address.neighborhood.trim(),
        city: form.address.city.trim(),
        state: form.address.state.trim(),
        zipCode: form.address.zipCode.replace(/\D/g, ''),
      },
    })
  }

  return (
    <form className={styles['customer-form']} onSubmit={handleSubmit}>
      {/* Erro da API */}
      {apiError && (
        <Alert
          type="error"
          message={apiError}
          onClose={onClearError}
          autoClose={false}
        />
      )}

      {/* Nome */}
      <div className={styles['form-group']}>
        <label htmlFor="name">Nome *</label>
        <input
          id="name"
          type="text"
          value={form.name}
          onChange={(event) => setForm((prev) => ({ ...prev, name: event.target.value }))}
          placeholder="Nome completo"
          disabled={isSubmitting}
          className={errors.name ? styles.error : ''}
        />
        {errors.name && <p className={styles['error-text']}>{errors.name}</p>}
      </div>

      {/* CPF */}
      <div className={styles['form-group']}>
        <label htmlFor="cpf">CPF *</label>
        <input
          id="cpf"
          type="text"
          value={form.cpf}
          onChange={(event) =>
            setForm((prev) => ({ ...prev, cpf: formatCpf(event.target.value) }))
          }
          placeholder="000.000.000-00"
          disabled={isSubmitting}
          className={errors.cpf ? styles.error : ''}
        />
        {errors.cpf && <p className={styles['error-text']}>{errors.cpf}</p>}
      </div>

      {/* CEP */}
      <div className={styles['form-group']}>
        <label htmlFor="zipCode">CEP *</label>
        <div className={styles['inline-row']}>
          <input
            id="zipCode"
            type="text"
            value={form.address.zipCode}
            onChange={(event) =>
              handleAddressChange('zipCode', formatZipCode(event.target.value))
            }
            placeholder="00000-000"
            disabled={isSubmitting || isLookingZipCode}
            className={errors.zipCode ? styles.error : ''}
          />
          <button
            type="button"
            onClick={handleLookupZipCode}
            disabled={isLookingZipCode || isSubmitting}
          >
            {isLookingZipCode ? '🔍' : '🔎'}
          </button>
        </div>
        {errors.zipCode && <p className={styles['error-text']}>{errors.zipCode}</p>}
      </div>

      {/* Logradouro */}
      <div className={styles['form-group']}>
        <label htmlFor="street">Logradouro *</label>
        <input
          id="street"
          type="text"
          value={form.address.street}
          onChange={(event) => handleAddressChange('street', event.target.value)}
          placeholder="Rua, avenida, etc"
          disabled={isSubmitting}
          className={errors.street ? styles.error : ''}
        />
        {errors.street && <p className={styles['error-text']}>{errors.street}</p>}
      </div>

      {/* Bairro */}
      <div className={styles['form-group']}>
        <label htmlFor="neighborhood">Bairro *</label>
        <input
          id="neighborhood"
          type="text"
          value={form.address.neighborhood}
          onChange={(event) => handleAddressChange('neighborhood', event.target.value)}
          placeholder="Nome do bairro"
          disabled={isSubmitting}
          className={errors.neighborhood ? styles.error : ''}
        />
        {errors.neighborhood && <p className={styles['error-text']}>{errors.neighborhood}</p>}
      </div>

      {/* Cidade */}
      <div className={styles['form-group']}>
        <label htmlFor="city">Cidade *</label>
        <input
          id="city"
          type="text"
          value={form.address.city}
          onChange={(event) => handleAddressChange('city', event.target.value)}
          placeholder="Nome da cidade"
          disabled={isSubmitting}
          className={errors.city ? styles.error : ''}
        />
        {errors.city && <p className={styles['error-text']}>{errors.city}</p>}
      </div>

      {/* Estado */}
      <div className={styles['form-group']}>
        <label htmlFor="state">Estado *</label>
        <input
          id="state"
          type="text"
          value={form.address.state}
          onChange={(event) => handleAddressChange('state', event.target.value)}
          maxLength={2}
          placeholder="UF"
          disabled={isSubmitting}
          className={errors.state ? styles.error : ''}
        />
        {errors.state && <p className={styles['error-text']}>{errors.state}</p>}
      </div>

      {/* Actions */}
      <div className={styles['actions']}>
        <button type="submit" disabled={isSubmitting}>
          {isSubmitting ? '⏳ Salvando...' : `✅ ${submitLabel}`}
        </button>
        {onCancel && (
          <button
            type="button"
            className={styles['secondary']}
            onClick={onCancel}
            disabled={isSubmitting}
          >
            ✕ Cancelar
          </button>
        )}
      </div>
    </form>
  )
}
