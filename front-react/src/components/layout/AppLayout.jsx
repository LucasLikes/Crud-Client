import { Drawer } from './Drawer'
import { useDrawer } from '../../context/DrawerContext'
import styles from './AppLayout.module.css'

export function AppLayout({ children }) {
  const { isExpanded } = useDrawer()

  return (
    <div className={styles['app-layout']}>
      <Drawer />
      <main className={`${styles['app-main']} ${isExpanded ? styles['expanded'] : styles['collapsed']}`}>
        {children}
      </main>
    </div>
  )
}
