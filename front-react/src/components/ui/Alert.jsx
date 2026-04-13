/**
 * Componente Alert reutilizável
 * Variantes: success, error, info, warning
 */

import { useEffect } from 'react'
import styles from './Alert.module.css'

export function Alert({
  type = 'info',
  message,
  onClose,
  autoClose = 5000,
  className = '',
}) {
  useEffect(() => {
    if (autoClose && onClose) {
      const timer = setTimeout(onClose, autoClose)
      return () => clearTimeout(timer)
    }
  }, [autoClose, onClose])

  const icons = {
    success: '✓',
    error: '✕',
    info: 'ℹ',
    warning: '⚠',
  }

  const alertClasses = [
    styles.alert,
    styles[`alert--${type}`],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <div className={alertClasses} role="alert">
      <span className={styles['alert-icon']}>{icons[type]}</span>
      <span className={styles['alert-message']}>{message}</span>
      {onClose && (
        <button
          className={styles['alert-close']}
          onClick={onClose}
          aria-label="Fechar alerta"
        >
          ✕
        </button>
      )}
    </div>
  )
}
