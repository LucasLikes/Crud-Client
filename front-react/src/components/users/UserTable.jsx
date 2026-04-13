import styles from './UserTable.module.css'

/**
 * Tabela para exibir e gerenciar usuários
 * 
 * Props:
 *   users: User[]                           - Lista de usuários
 *   isLoading?: boolean                     - Mostra loading
 *   isAdmin?: boolean                       - Se o usuário atual é admin
 *   onEdit: (user) => void                  - Chamado ao clicar em editar
 *   onDelete: (id) => Promise<void>         - Chamado ao clicar em deletar
 */
export function UserTable({ users, isLoading, isAdmin = false, onEdit, onDelete }) {
  const handleDelete = async (id, email) => {
    if (window.confirm(`Tem certeza que deseja deletar ${email}?`)) {
      try {
        await onDelete(id)
      } catch (error) {
        console.error('Erro ao deletar:', error)
      }
    }
  }

  if (isLoading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles.spinner}>⏳</div>
        <p>Carregando usuários...</p>
      </div>
    )
  }

  if (!users || users.length === 0) {
    return (
      <div className={styles['empty-container']}>
        <div className={styles['empty-icon']}>👤</div>
        <h3>Nenhum usuário encontrado</h3>
        <p>Comece criando um novo usuário</p>
      </div>
    )
  }

  return (
    <div className={styles['table-container']}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Nome Completo</th>
            <th>Email</th>
            <th>Função</th>
            {isAdmin && <th className={styles['col-actions']}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr key={user.id} className={styles['table-row']}>
              <td>
                <div className={styles['user-name']}>
                  <span className={styles['user-avatar']}>👤</span>
                  <div>
                    <div className={styles['full-name']}>{user.fullName}</div>
                    <div className={styles['user-id']}>ID: {user.id}</div>
                  </div>
                </div>
              </td>
              <td className={styles['email-cell']}>
                <span className={styles['email-badge']}>{user.email}</span>
              </td>
              <td>
                <span className={styles[`role-${user.role?.toLowerCase()}`]}>
                  {user.role === 'ROLE_ADMIN' ? '🔐 Admin' : '👤 Usuário'}
                </span>
              </td>
              {isAdmin && (
                <td className={styles['col-actions']}>
                  <button
                    className={`${styles['btn-action']} ${styles['btn-edit']}`}
                    onClick={() => onEdit(user)}
                    title="Editar usuário"
                    aria-label={`Editar ${user.fullName}`}
                  >
                    ✏️ Editar
                  </button>
                  <button
                    className={`${styles['btn-action']} ${styles['btn-delete']}`}
                    onClick={() => handleDelete(user.id, user.email)}
                    title="Deletar usuário"
                    aria-label={`Deletar ${user.fullName}`}
                  >
                    🗑️ Deletar
                  </button>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
