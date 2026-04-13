/**
 * Componente Empty State
 */

import styles from './EmptyState.module.css'

export function EmptyState({ 
  icon = '📭', 
  title = 'Nenhum item encontrado',
  message = 'Comece criando um novo item',
  action
}) {
  return (
    <div className={styles['empty-state']}>
      <div className={styles['empty-icon']}>{icon}</div>
      <h3 className={styles['empty-title']}>{title}</h3>
      <p className={styles['empty-message']}>{message}</p>
      {action && <div className={styles['empty-action']}>{action}</div>}
    </div>
  )
}
