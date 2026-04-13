import { useEffect, useState } from 'react'
import { CustomerForm } from '../components/CustomerForm'
import { CustomerTable } from '../components/CustomerTable'
import { CustomerFilter } from '../components/CustomerFilter'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../hooks/useAuth'
import { useRbac } from '../hooks/useRbac'
import { useCustomers } from '../features/customers/useCustomers'
import { Button } from '../components/ui/Button'
import { Alert } from '../components/ui/Alert'
import { ConfirmDialog } from '../components/ui/ConfirmDialog'
import { logger } from '../utils/logger'
import styles from './CustomersPage.module.css'

export function CustomersPage() {
  const { logout } = useAuth()
  const { can, isAdmin } = useRbac()

  const [isModalOpen, setIsModalOpen]   = useState(false)
  const [editCustomer, setEditCustomer] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false, customerId: null, name: '' })
  const [filteredCustomers, setFilteredCustomers] = useState([])

  const {
    customers, isLoading, error, success, isSubmitting,
    fetchCustomers, createNew, updateExisting, remove, clearMessages,
  } = useCustomers()

  useEffect(() => { fetchCustomers() }, [fetchCustomers])
  useEffect(() => { setFilteredCustomers(customers) }, [customers])

  useEffect(() => {
    if (success) {
      const t = setTimeout(clearMessages, 4000)
      return () => clearTimeout(t)
    }
  }, [success, clearMessages])

  const applyFilters = (filters) => {
    let result = customers
    if (filters.name) result = result.filter(c => c.name.toLowerCase().includes(filters.name.toLowerCase()))
    if (filters.city) result = result.filter(c => c.address.city.toLowerCase().includes(filters.city.toLowerCase()))
    if (filters.state) result = result.filter(c => c.address.state.toUpperCase() === filters.state.toUpperCase())
    setFilteredCustomers(result)
  }

  const handleOpenCreate = () => {
    if (!can.createCustomer) { logger.warn('🚫 Sem permissão para criar cliente'); return }
    clearMessages()
    setEditCustomer(null)
    setIsModalOpen(true)
  }

  const handleOpenEdit = (customer) => {
    if (!can.editCustomer) { logger.warn('🚫 Sem permissão para editar cliente'); return }
    clearMessages()
    setEditCustomer(customer)
    setIsModalOpen(true)
  }

  const handleCloseModal = () => {
    clearMessages()
    setIsModalOpen(false)
    setEditCustomer(null)
  }

  const handleSave = async (payload) => {
    let ok
    if (editCustomer) {
      ok = await updateExisting(editCustomer.id, payload)
    } else {
      ok = await createNew(payload)
    }
    if (ok) handleCloseModal()
  }

  const handleDelete = (id) => {
    if (!can.deleteCustomer) { logger.warn('🚫 Sem permissão para deletar cliente'); return }
    const customer = customers.find(c => c.id === id)
    setDeleteConfirm({ isOpen: true, customerId: id, name: customer?.name ?? 'cliente' })
  }

  const handleConfirmDelete = async () => {
    setDeleteConfirm(prev => ({ ...prev, isLoading: true }))
    await remove(deleteConfirm.customerId)
    setDeleteConfirm({ isOpen: false, customerId: null, name: '' })
  }

  return (
    <div className={styles['customers-page']}>
      {/* ── Header ── */}
      <header className={styles['customers-header']}>
        <div>
          <h1 className={styles['customers-title']}>📊 Clientes</h1>
          <p className={styles['customers-subtitle']}>Gestão de clientes · JWT autenticado</p>
        </div>
        <div className={styles['header-actions']}>
          {/* Botão visível APENAS para ROLE_ADMIN */}
          {isAdmin && (
            <button className={styles['btn-add-customer']} onClick={handleOpenCreate} disabled={isLoading}>
              ➕ Adicionar Cliente
            </button>
          )}
          <Button variant="ghost" onClick={logout}>Sair</Button>
        </div>
      </header>

      {/* ── Info de role (dev helper) ── */}
      {!isAdmin && (
        <div style={{ padding: '8px 16px', background: '#fffbe6', border: '1px solid #ffe58f', borderRadius: 8, marginBottom: 8, fontSize: 14 }}>
          👁️ Você está como <strong>usuário comum</strong> — somente visualização. Apenas admins podem criar, editar ou excluir clientes.
        </div>
      )}

      {/* ── Alerts ── */}
      {success && (
        <div className={styles['alerts-container']}>
          <Alert type="success" message={success} onClose={clearMessages} autoClose={4000} />
        </div>
      )}
      {error && (
        <div className={styles['alerts-container']}>
          <Alert type="error" message={error} onClose={clearMessages} />
        </div>
      )}

      {/* ── Filtros ── */}
      <CustomerFilter onFilterChange={applyFilters} onSearch={applyFilters} isLoading={isLoading} />

      {/* ── Tabela ── */}
      <div className={styles['customers-content']}>
        <div className={styles['results-header']}>
          <h2>{filteredCustomers.length} cliente{filteredCustomers.length !== 1 ? 's' : ''} encontrado{filteredCustomers.length !== 1 ? 's' : ''}</h2>
        </div>
        <CustomerTable
          customers={filteredCustomers}
          onEdit={isAdmin ? handleOpenEdit : undefined}
          onDelete={isAdmin ? handleDelete : undefined}
          isLoading={isLoading}
          isAdmin={isAdmin}
        />
      </div>

      {/* ── Modal criar/editar ── */}
      <Modal isOpen={isModalOpen} title={editCustomer ? 'Editar Cliente' : 'Novo Cliente'} onClose={handleCloseModal} size="lg">
        <CustomerForm
          initialValues={editCustomer}
          onSubmit={handleSave}
          onCancel={handleCloseModal}
          submitLabel={editCustomer ? 'Atualizar' : 'Cadastrar'}
          isSubmitting={isSubmitting}
          apiError={error}
          onClearError={clearMessages}
        />
      </Modal>

      {/* ── Confirmação de exclusão ── */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        title="Remover Cliente"
        message={`Tem certeza que deseja remover "${deleteConfirm.name}"? Esta ação não pode ser desfeita.`}
        confirmText="Remover"
        cancelText="Cancelar"
        variant="danger"
        isLoading={deleteConfirm.isLoading}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false, customerId: null, name: '' })}
      />
    </div>
  )
}