import { formatCpf } from '../utils/cpf'
import { formatZipCode } from '../utils/formatters'
import styles from './CustomerTable.module.css'

export function CustomerTable({ customers, onEdit, onDelete, isLoading, isAdmin = false }) {
  if (isLoading) {
    return (
      <div className={styles['loading-container']}>
        <div className={styles['spinner']}>⏳</div>
        <p>Carregando clientes...</p>
      </div>
    )
  }

  if (!customers.length) {
    return (
      <div className={styles['empty-container']}>
        <div className={styles['empty-icon']}>📋</div>
        <h3>Nenhum cliente encontrado</h3>
        <p>Comece criando um novo cliente</p>
      </div>
    )
  }

  return (
    <div className={styles['table-wrapper']}>
      <table className={styles['customers-table']}>
        <thead>
          <tr>
            <th>Nome</th>
            <th>CPF</th>
            <th>Cidade/UF</th>
            <th>CEP</th>
            {isAdmin && <th className={styles['col-actions']}>Ações</th>}
          </tr>
        </thead>
        <tbody>
          {customers.map((customer, index) => (
            <tr key={customer.id} className={styles['table-row']} style={{ '--row-delay': `${index * 50}ms` }}>
              <td className={styles['col-name']}>
                <div className={styles['customer-name-cell']}>
                  <span className={styles['customer-avatar']}>👤</span>
                  <span className={styles['customer-name']}>{customer.name}</span>
                </div>
              </td>
              <td className={styles['col-cpf']}>
                <code className={styles['cpf-badge']}>{formatCpf(customer.cpf)}</code>
              </td>
              <td className={styles['col-location']}>
                <span className={styles['location-badge']}>
                  {customer.address.city}/{customer.address.state}
                </span>
              </td>
              <td className={styles['col-cep']}>
                <span className={styles['cep-code']}>{formatZipCode(customer.address.zipCode)}</span>
              </td>
              {isAdmin && (
                <td className={styles['col-actions']}>
                  <div className={styles['actions-group']}>
                    <button
                      className={`${styles['btn-action']} ${styles['btn-edit']}`}
                      onClick={() => onEdit(customer)}
                      title="Editar cliente"
                      aria-label={`Editar ${customer.name}`}
                    >
                      ✏️
                    </button>
                    <button
                      className={`${styles['btn-action']} ${styles['btn-delete']}`}
                      onClick={() => onDelete(customer.id)}
                      title="Deletar cliente"
                      aria-label={`Deletar ${customer.name}`}
                    >
                      🗑️
                    </button>
                  </div>
                </td>
              )}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
