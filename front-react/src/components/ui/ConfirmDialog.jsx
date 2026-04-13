import { Button } from './Button'
import styles from './ConfirmDialog.module.css'

export function ConfirmDialog({
  isOpen,
  title = 'Confirmar ação',
  message = 'Tem certeza que deseja continuar?',
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  isLoading = false,
  variant = 'warning',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null

  // Fechar ao clicar fora
  const handleBackdropClick = (e) => {
    if (e.target === e.currentTarget) {
      onCancel?.()
    }
  }

  return (
    <>
      {/* Backdrop */}
      <div className={styles['confirm-backdrop']} onClick={handleBackdropClick} />

      {/* Dialog */}
      <div className={styles['confirm-dialog']}>
        <h2 className={styles['confirm-title']}>{title}</h2>
        <p className={styles['confirm-message']}>{message}</p>

        <div className={styles['confirm-actions']}>
          <Button
            variant="ghost"
            onClick={onCancel}
            disabled={isLoading}
          >
            {cancelText}
          </Button>
          <Button
            variant={variant}
            onClick={onConfirm}
            isLoading={isLoading}
          >
            {confirmText}
          </Button>
        </div>
      </div>
    </>
  )
}
