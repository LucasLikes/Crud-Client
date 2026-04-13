import styles from './Modal.module.css'

export function Modal({
  isOpen,
  title,
  children,
  onClose,
  showCloseButton = true,
  size = 'md',
}) {
  if (!isOpen) return null

  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onClose?.()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles['modal-backdrop']} onClick={handleBackdropClick} />

      {/* Modal */}
      <div className={`${styles['modal']} ${styles[`modal-${size}`]}`}>
        {/* Header */}
        <div className={styles['modal-header']}>
          <h2 className={styles['modal-title']}>{title}</h2>
          {showCloseButton && (
            <button
              className={styles['modal-close']}
              onClick={onClose}
              aria-label="Fechar"
            >
              ✕
            </button>
          )}
        </div>

        {/* Body */}
        <div className={styles['modal-body']}>
          {children}
        </div>
      </div>
    </>
  )
}
