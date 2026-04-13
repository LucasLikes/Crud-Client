/**
 * Componente Spinner para loading states
 */

import styles from './Spinner.module.css'

export function Spinner({ message = 'Carregando...' }) {
  return (
    <div className={styles['spinner-container']}>
      <div className={styles.spinner} />
      <p className={styles['spinner-text']}>{message}</p>
    </div>
  )
}
