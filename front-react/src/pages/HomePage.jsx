import { useAuth } from '../hooks/useAuth'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import styles from './HomePage.module.css'

export function HomePage() {
  const { user, logout } = useAuth()

  const stats = [
    { label: 'Clientes', value: '156', icon: '👥', color: 'blue' },
    { label: 'Vendas', value: 'R$ 45.2K', icon: '💰', color: 'green' },
    { label: 'Tarefas', value: '12', icon: '✅', color: 'purple' },
    { label: 'Mensagens', value: '8', icon: '💬', color: 'orange' },
  ]

  const recentActivities = [
    { id: 1, title: 'Cliente "Acme Corp" criado', time: 'Há 2 horas' },
    { id: 2, title: 'Venda processada com sucesso', time: 'Há 4 horas' },
    { id: 3, title: 'Relatório mensal gerado', time: 'Há 1 dia' },
  ]

  return (
    <div className={styles['home-page']}>
      {/* Header */}
      <header className={styles['home-header']}>
        <div>
          <h1 className={styles['home-title']}>
            Bem-vindo, {user?.email?.split('@')[0]}! 👋
          </h1>
          <p className={styles['home-subtitle']}>
            {user?.role === 'admin'
              ? 'Painel de administrador - Controle total do sistema'
              : 'Gerencie seus clientes e atividades'}
          </p>
        </div>
        <Button variant="ghost" onClick={logout}>
          Sair
        </Button>
      </header>

      {/* Stats Grid */}
      <section className={styles['stats-section']}>
        <h2 className={styles['section-title']}>Dashboard</h2>
        <div className={styles['stats-grid']}>
          {stats.map((stat) => (
            <Card key={stat.label}>
              <div className={`${styles['stat-card']} ${styles[`stat-${stat.color}`]}`}>
                <div className={styles['stat-icon']}>{stat.icon}</div>
                <div className={styles['stat-content']}>
                  <div className={styles['stat-value']}>{stat.value}</div>
                  <div className={styles['stat-label']}>{stat.label}</div>
                </div>
              </div>
            </Card>
          ))}
        </div>
      </section>

      {/* Recent Activity */}
      <section className={styles['activity-section']}>
        <h2 className={styles['section-title']}>Atividades Recentes</h2>
        <Card title="Últimas ações">
          <div className={styles['activity-list']}>
            {recentActivities.map((activity) => (
              <div key={activity.id} className={styles['activity-item']}>
                <div className={styles['activity-icon']}>•</div>
                <div className={styles['activity-content']}>
                  <div className={styles['activity-title']}>{activity.title}</div>
                  <div className={styles['activity-time']}>{activity.time}</div>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </section>

      {/* Quick Actions */}
      {user?.role === 'admin' && (
        <section className={styles['actions-section']}>
          <h2 className={styles['section-title']}>Ações Rápidas</h2>
          <div className={styles['actions-grid']}>
            <Card title="📊 Relatórios">
              <p className={styles['card-description']}>
                Gere relatórios detalhados sobre vendas, clientes e desempenho
              </p>
              <Button variant="primary">Acessar Relatórios</Button>
            </Card>
            <Card title="🔧 Sistema">
              <p className={styles['card-description']}>
                Gerencie usuários, permissões e configurações do sistema
              </p>
              <Button variant="primary">Ir para Configurações</Button>
            </Card>
            <Card title="👥 Usuários">
              <p className={styles['card-description']}>
                Administre usuários, roles e permissões de acesso
              </p>
              <Button variant="primary">Gerenciar Usuários</Button>
            </Card>
          </div>
        </section>
      )}
    </div>
  )
}
