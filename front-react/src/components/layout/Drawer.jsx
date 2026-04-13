import { useNavigate } from 'react-router-dom'
import { useAuth } from '../../hooks/useAuth'
import { useDrawer } from '../../context/DrawerContext'
import styles from './Drawer.module.css'

const MENU_ITEMS = [
  { id: 'home',      label: 'Home',           path: '/home',      icon: '🏠', requireAdmin: false },
  { id: 'customers', label: 'Clientes',        path: '/customers', icon: '👥', requireAdmin: false },
  { id: 'config',   label: 'Configurações',   path: '/config',    icon: '⚙️', requireAdmin: true  },
]

export function Drawer() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { isExpanded, toggleExpanded } = useDrawer()

  // Filtra menu pelo role
  const visibleItems = MENU_ITEMS.filter(item => !item.requireAdmin || user?.isAdmin)

  const handleNavigate = (path) => {
    navigate(path)
    if (window.innerWidth < 768) toggleExpanded()
  }

  const displayName = user?.email?.split('@')[0] ?? '...'
  const roleLabel   = user?.isAdmin ? '🔐 Admin' : '👤 Usuário'

  return (
    <>
      {isExpanded && (
        <div className={styles['drawer-backdrop']} onClick={toggleExpanded} aria-label="Fechar menu" />
      )}

      <aside className={`${styles.drawer} ${isExpanded ? styles.expanded : ''}`}>
        {/* Header */}
        <div className={styles['drawer-header']}>
          <div className={styles['app-brand']}>
            <span className={styles['app-icon']}>📊</span>
            {isExpanded && <span className={styles['app-name']}>Lume</span>}
          </div>
          <button className={styles['toggle-btn']} onClick={toggleExpanded} aria-label="Toggle menu">
            {isExpanded ? '◀' : '▶'}
          </button>
        </div>

        {/* Nav */}
        <nav className={styles['drawer-nav']}>
          <ul className={styles['menu-list']}>
            {visibleItems.map(item => (
              <li key={item.id}>
                <button
                  className={styles['menu-item']}
                  onClick={() => handleNavigate(item.path)}
                  title={!isExpanded ? item.label : undefined}
                  aria-label={item.label}
                >
                  <span className={styles['menu-icon']}>{item.icon}</span>
                  {isExpanded && <span className={styles['menu-label']}>{item.label}</span>}
                </button>
              </li>
            ))}
          </ul>
        </nav>

        {/* Footer */}
        <div className={styles['drawer-footer']}>
          <div className={styles['user-section']}>
            <div className={styles['user-avatar']} title={user?.email}>👤</div>
            {isExpanded && (
              <div className={styles['user-info']}>
                <div className={styles['user-name']}>{displayName}</div>
                <div className={styles['user-role']}>{roleLabel}</div>
              </div>
            )}
          </div>
        </div>
      </aside>
    </>
  )
}