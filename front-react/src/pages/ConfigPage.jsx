import { useEffect, useState } from 'react'
import { UserForm } from '../components/users/UserForm'
import { UserTable } from '../components/users/UserTable'
import { Alert } from '../components/ui/Alert'
import { useRbac } from '../hooks/useRbac'
import { useUsers } from '../features/users/useUsers'
import { logger } from '../utils/logger'
import styles from './ConfigPage.module.css'

export function ConfigPage() {
  const { can, isAdmin } = useRbac()

  const {
    users, isLoading, error, successMessage,
    fetchUsers, createNew, updateExisting, remove, clearMessages,
  } = useUsers()

  const [isFormOpen, setIsFormOpen]   = useState(false)
  const [selectedUser, setSelectedUser] = useState(null)

  useEffect(() => { fetchUsers() }, [fetchUsers])

  useEffect(() => {
    if (error || successMessage) {
      const t = setTimeout(clearMessages, 5000)
      return () => clearTimeout(t)
    }
  }, [error, successMessage, clearMessages])

  const handleCreateClick = () => {
    if (!can.createUser) { logger.warn('🚫 Sem permissão'); return }
    clearMessages()
    setSelectedUser(null)
    setIsFormOpen(true)
  }

  const handleEditClick = (user) => {
    if (!can.editUser) { logger.warn('🚫 Sem permissão'); return }
    clearMessages()
    setSelectedUser(user)
    setIsFormOpen(true)
  }

  const handleFormCancel = () => {
    clearMessages()
    setIsFormOpen(false)
    setSelectedUser(null)
  }

  const handleFormSubmit = async (payload) => {
    try {
      if (selectedUser) {
        await updateExisting(selectedUser.id, payload)
      } else {
        await createNew(payload)
      }
      setIsFormOpen(false)
      setSelectedUser(null)
    } catch {
      // erro já registrado no hook
    }
  }

  const handleDeleteUser = async (id) => {
    if (!can.deleteUser) { logger.warn('🚫 Sem permissão'); return }
    try { await remove(id) } catch { /* erro no hook */ }
  }

  return (
    <div className={styles['config-page']}>
      <header className={styles['config-header']}>
        <h1 className={styles['config-title']}>Gerenciamento de Usuários 👥</h1>
        <p className={styles['config-subtitle']}>Somente administradores podem gerenciar usuários.</p>
      </header>

      {successMessage && <Alert type="success" message={successMessage} onClose={clearMessages} autoClose />}

      <div className={styles['content-grid']}>
        {isFormOpen && isAdmin ? (
          <div className={styles['form-section']}>
            <UserForm
              user={selectedUser}
              isLoading={isLoading}
              onSubmit={handleFormSubmit}
              onCancel={handleFormCancel}
              apiError={error}
              onClearError={clearMessages}
            />
          </div>
        ) : (
          <div className={styles['list-section']}>
            <div className={styles['list-header']}>
              <h2>Listagem de Usuários</h2>
              {isAdmin && (
                <button className={styles['btn-create']} onClick={handleCreateClick} disabled={isLoading}>
                  ➕ Novo Usuário
                </button>
              )}
            </div>
            {!isAdmin && (
              <Alert type="info" message="👁️ Você tem permissão apenas para visualizar usuários." />
            )}
            <UserTable
              users={users}
              isLoading={isLoading}
              onEdit={isAdmin ? handleEditClick : undefined}
              onDelete={isAdmin ? handleDeleteUser : undefined}
              isAdmin={isAdmin}
            />
          </div>
        )}
      </div>
    </div>
  )
}