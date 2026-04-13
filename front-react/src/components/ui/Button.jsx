/**
 * Componente Button reutilizável
 * Variantes: primary (padrão), secondary, ghost, danger
 */

import styles from './Button.module.css'

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled = false,
  type = 'button',
  className = '',
  ...props
}) {
  const buttonClasses = [
    styles.button,
    styles[`button--${variant}`],
    styles[`button--${size}`],
    isLoading && styles['button--loading'],
    disabled && styles['button--disabled'],
    className,
  ]
    .filter(Boolean)
    .join(' ')

  return (
    <button
      type={type}
      className={buttonClasses}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading ? (
        <>
          <span className={styles['button-spinner']}>⏳</span>
          Processando...
        </>
      ) : (
        children
      )}
    </button>
  )
}
