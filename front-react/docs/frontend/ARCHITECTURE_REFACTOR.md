# 🏗️ Arquitetura Refatorada - CustomersPage

## Overview

A página CustomersPage foi completamente refatorada para seguir princípios SOLID e padrões modernos de React:

- **Single Responsibility Principle**: Lógica separada em hooks custom
- **Open/Closed Principle**: Components reutilizáveis e extensíveis
- **Dependency Inversion**: Componentes recebem dados/callbacks como props
- **Component Composition**: Pequenos components que se combinam

---

## 📊 Arquitetura

```
CustomersPage (Page)
├── useCustomers (Hook Custom)
│   ├── State: customers, isLoading, error, success, isSubmitting
│   ├── Methods: fetchCustomers, createNew, updateExisting, remove, clearMessages
│   └── Integration: Chama APIs via customersApi.js e logger.js
│
├── UI Components
│   ├── Card (Wrapper com styling consistente)
│   ├── Button (Variants: primary, secondary, ghost, danger)
│   ├── Alert (Types: success, error, info, warning)
│   ├── Spinner (Loading indicator)
│   ├── EmptyState (Placeholder vazio)
│   ├── ConfirmDialog (Modal de confirmação)
│   ├── CustomerForm (Form para criar/editar)
│   └── CustomerTable (Tabela de listagem)
│
└── State Management
    ├── selectedCustomer (Estado local da página)
    ├── deleteConfirm (Modal de deletar)
    └── Hook states (isLoading, error, success, etc)
```

---

## 🔄 Fluxos de Dados

### 1️⃣ Carregamento de Clientes

```
CustomersPage
  └─> useEffect (onMount)
      └─> fetchCustomers() [useCustomers]
          ├─> listCustomers() [API]
          ├─> setIsLoading(true)
          ├─> Atualiza customers state
          └─> setIsLoading(false)
          
UI Rendering:
  ├─> isLoading? <Spinner /> : <CustomerTable />
  ├─> error? <Alert type="error" /> : null
  └─> customers.length === 0? <EmptyState /> : <CustomerTable />
```

### 2️⃣ Criar Novo Cliente

```
CustomersPage
  └─> CustomerForm
      └─> handleSave()
          └─> createNew(payload) [useCustomers]
              ├─> createCustomer(payload) [API]
              ├─> setIsSubmitting(true)
              ├─> fetchCustomers() (refresh)
              ├─> setSuccess("Cliente criado!")
              └─> return true
              
UI Updates:
  ├─> <Alert type="success" message={success} />
  ├─> setSelectedCustomer(null)
  └─> <CustomerTable /> com dados novos
```

### 3️⃣ Editar Cliente

```
CustomersPage
  └─> CustomerTable
      └─> onEdit(customer) -> setSelectedCustomer(customer)
      
CustomersPage
  └─> CustomerForm
      └─> handleSave(payload)
          └─> updateExisting(id, payload) [useCustomers]
              ├─> updateCustomer(id, payload) [API]
              ├─> setIsSubmitting(true)
              ├─> fetchCustomers() (refresh)
              └─> setSuccess("Cliente atualizado!")
              
UI Updates:
  ├─> Card title muda para "Editar Cliente"
  ├─> Form preenchido com initialValues
  ├─> Button submitLabel muda para "Atualizar"
  └─> Novo botão "Cancelar" aparece
```

### 4️⃣ Deletar Cliente (com Modal)

```
CustomersPage
  └─> CustomerTable
      └─> onDelete(id)
          └─> handleDelete(id)
              ├─> Acha customer name
              └─> setDeleteConfirm({ isOpen: true, customerId: id, name })
              
<ConfirmDialog />
  └─> User clica em "Remover"
      └─> handleConfirmDelete()
          ├─> setDeleteConfirm({...isLoading: true})
          └─> remove(customerId) [useCustomers]
              ├─> deleteCustomer(customerId) [API]
              ├─> fetchCustomers() (refresh)
              └─> setSuccess("Cliente removido!")
              
UI Updates:
  ├─> Delete button fica com loading spinner
  ├─> Modal fecha após sucesso
  ├─> <Alert type="success" /> mostra feedback
  └─> <CustomerTable /> sem o cliente deletado
```

---

## 🎨 Component Hierarchy

### CustomersPage (Container)
- **Props**: Nenhuma (pega auth do useAuth hook)
- **State**: selectedCustomer, deleteConfirm
- **Responsabilidades**: 
  - Orquestrar data flow
  - Handle user actions (criar, editar, deletar)
  - Render UI components
  - Gerenciar alerts e confirmações

### useCustomers (Custom Hook)
- **Props**: Nenhuma
- **State Returns**:
  ```js
  {
    customers: [],          // Lista de clientes
    isLoading: bool,       // Carregando dados?
    error: string,         // Mensagem de erro
    success: string,       // Mensagem de sucesso
    isSubmitting: bool,    // Submetendo form?
    fetchCustomers: fn,    // Carregar clientes
    createNew: fn,         // Criar novo
    updateExisting: fn,    // Atualizar existente
    remove: fn,            // Deletar
    clearMessages: fn,     // Limpar alerts
  }
  ```
- **Responsabilidades**:
  - Gerenciar estado de clientes
  - Fazer chamadas de API
  - Handle loading/error/success states
  - Logging automático

### UI Components (Presentational)

#### Card
```jsx
<Card title="Lista de Clientes">
  {content}
</Card>
```
- **Props**: title (optional), children, className (optional)
- **Responsabilidades**: Estilo consistente, wrapper

#### Button
```jsx
<Button variant="primary" size="md" isLoading={false} onClick={...}>
  Salvar
</Button>
```
- **Props**: variant, size, isLoading, disabled, type, className, children, onClick
- **Variants**: primary, secondary, ghost, danger
- **Responsabilidades**: Rendering de botão com estados

#### Alert
```jsx
<Alert type="success" message="Salvo!" onClose={...} autoClose={4000} />
```
- **Props**: type, message, onClose, autoClose, className
- **Types**: success, error, info, warning
- **Responsabilidades**: Show feedback com auto-dismiss

#### Spinner
```jsx
<Spinner message="Carregando..." />
```
- **Props**: message
- **Responsabilidades**: Loading indicator

#### EmptyState
```jsx
<EmptyState 
  icon="📋" 
  title="Nenhum cliente" 
  message="Crie um novo cliente"
  action={<Button>Criar</Button>}
/>
```
- **Props**: icon, title, message, action (optional)
- **Responsabilidades**: Placeholder para dados vazios

#### ConfirmDialog
```jsx
<ConfirmDialog
  isOpen={true}
  title="Remover?"
  message="Tem certeza?"
  onConfirm={...}
  onCancel={...}
  variant="danger"
  isLoading={false}
/>
```
- **Props**: isOpen, title, message, confirmText, cancelText, variant, isLoading, onConfirm, onCancel
- **Responsabilidades**: Modal de confirmação com backdrop

---

## 📁 Estrutura de Arquivos

```
src/
├── pages/
│   ├── CustomersPage.jsx          ← Container principal
│   └── CustomersPage.module.css   ← Styling da página
│
├── features/
│   └── customers/
│       └── useCustomers.js        ← Business logic
│
├── components/
│   ├── ui/
│   │   ├── Button.jsx
│   │   ├── Button.module.css
│   │   ├── Card.jsx
│   │   ├── Card.module.css
│   │   ├── Alert.jsx
│   │   ├── Alert.module.css
│   │   ├── Spinner.jsx
│   │   ├── Spinner.module.css
│   │   ├── EmptyState.jsx
│   │   ├── EmptyState.module.css
│   │   ├── ConfirmDialog.jsx      ← NEW
│   │   └── ConfirmDialog.module.css ← NEW
│   │
│   ├── CustomerForm.jsx           ← Form (needs update to use Button)
│   ├── CustomerTable.jsx          ← Table (already uses Button concept)
│   └── ProtectedRoute.jsx
│
├── api/
│   ├── httpClient.js              ← Axios instance
│   ├── customersApi.js            ← CRUD endpoints
│   └── authApi.js                 ← Auth endpoints
│
├── context/
│   ├── authContext.js
│   └── AuthContext.jsx            ← Provider
│
├── hooks/
│   └── useAuth.js
│
├── utils/
│   ├── logger.js                  ← Logging utility
│   ├── storage.js                 ← LocalStorage helper
│   ├── formatters.js              ← Formatting utilities
│   └── cpf.js                     ← CPF validation
│
└── index.css                      ← Design system tokens
```

---

## 🎯 SOLID Principles Application

### 1️⃣ Single Responsibility
- `useCustomers`: Apenas gerencia estado de clientes
- `CustomersPage`: Apenas orquestra e renderiza
- Cada component UI tem uma responsabilidade clara

### 2️⃣ Open/Closed
- Components são abertos para extensão (props: variant, size, etc)
- Fechados para modificação (não precisa editá-los para customizar)
- Exemplo: `<Button variant="custom" />` pode ser adicionado sem modificar Button.jsx

### 3️⃣ Liskov Substitution
- Qualquer `variant` de Button funciona igual (mesma interface)
- Qualquer tipo de `Alert` funciona igual

### 4️⃣ Interface Segregation
- Components não recebem props que não usam
- Button não recebe props da Table
- Alerts não recebem props de Spinners

### 5️⃣ Dependency Inversion
- CustomersPage não depende de implementação de HTTP
- Depende de `useCustomers` que abstrai os detalhes
- useCustomers pode mudar backend sem CustomersPage saber

---

## 🔌 Integration Points

### API Integration (via useCustomers)
```js
// Hook chama essas funções
import { listCustomers, createCustomer, updateCustomer, deleteCustomer } from '../api/customersApi'

// Que por sua vez usam httpClient
import httpClient from './httpClient' // Axios com interceptors
```

### State Management
```js
// LocalStorage via storage utility
import { getToken, setToken, clearToken } from '../utils/storage'

// Auth context
import { useAuth } from '../hooks/useAuth'
```

### Logging
```js
// Automatic logging via Logger utility
import logger from '../utils/logger'
logger.info('📋 Buscando clientes...')
```

---

## 🚀 Performance Optimizations

1. **useCallback em useCustomers**: Previne re-renders desnecessários
2. **CSS Modules**: Evita conflito de estilos globais
3. **Memoization de estado**: Only re-renders quando estado muda
4. **Lazy loading com Spinner**: UX feedback durante carregamento
5. **Auto-dismiss de alerts**: Clutter visual reduzido

---

## 📝 Usage Example

```jsx
function CustomersPage() {
  // Get hook with all customer logic
  const { customers, isLoading, error, success, createNew, remove } = useCustomers()

  // Handle user actions
  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, customerId: id })
  }

  const handleConfirmDelete = async () => {
    // Hook method called here
    await remove(deleteConfirm.customerId)
    setDeleteConfirm({ isOpen: false })
  }

  return (
    <>
      {/* Render with UI components */}
      {isLoading && <Spinner />}
      {error && <Alert type="error" message={error} />}
      {success && <Alert type="success" message={success} />}

      {customers.length === 0 ? (
        <EmptyState title="Nenhum cliente" />
      ) : (
        <CustomerTable customers={customers} onDelete={handleDelete} />
      )}

      {/* Modal for confirmations */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onConfirm={handleConfirmDelete}
        onCancel={() => setDeleteConfirm({ isOpen: false })}
      />
    </>
  )
}
```

---

## 🔄 What Changed vs Old Architecture

### Old (Monolithic)
```jsx
export function CustomersPage() {
  const [customers, setCustomers] = useState([])        // State repeat
  const [isLoading, setIsLoading] = useState(true)      // State repeat
  const [isSubmitting, setIsSubmitting] = useState(false) // State repeat
  const [message, setMessage] = useState('')             // State repeat
  const [error, setError] = useState('')                 // State repeat

  // All logic inline
  const loadCustomers = async () => {
    setError('')
    const data = await listCustomers() // Direct API call
    setCustomers(data)
  }

  // window.confirm() for delete
  const handleDelete = async (id) => {
    const confirmed = window.confirm('Deseja excluir?')
    if (confirmed) await deleteCustomer(id)
  }

  return (
    <main>
      {message && <div className="feedback success">{message}</div>}
      {error && <div className="feedback error">{error}</div>}
      <section className="grid">
        <CustomerForm onSubmit={...} />
        <CustomerTable ... />
      </section>
    </main>
  )
}
```

### New (Modular)
```jsx
export function CustomersPage() {
  // All customer logic abstracted into hook
  const { customers, isLoading, error, success, createNew, remove } = useCustomers()
  
  // Clean local state for UI only
  const [selectedCustomer, setSelectedCustomer] = useState(null)
  const [deleteConfirm, setDeleteConfirm] = useState({ isOpen: false })

  // Elegant delete with modal instead of window.confirm()
  const handleDelete = (id) => {
    setDeleteConfirm({ isOpen: true, customerId: id })
  }

  const handleConfirmDelete = async () => {
    await remove(deleteConfirm.customerId)
    setDeleteConfirm({ isOpen: false })
  }

  return (
    <div className={styles['customers-page']}>
      <header>...</header>
      
      {/* Reusable Alert component */}
      {success && <Alert type="success" message={success} />}
      {error && <Alert type="error" message={error} />}

      {/* Reusable Card components */}
      <Card title="Novo Cliente">
        <CustomerForm onSubmit={handleSave} />
      </Card>

      <Card title="Lista de Clientes">
        {/* Reusable Spinner and EmptyState */}
        {isLoading ? (
          <Spinner />
        ) : customers.length === 0 ? (
          <EmptyState title="Nenhum cliente" />
        ) : (
          <CustomerTable customers={customers} onDelete={handleDelete} />
        )}
      </Card>

      {/* Reusable ConfirmDialog modal */}
      <ConfirmDialog isOpen={deleteConfirm.isOpen} onConfirm={handleConfirmDelete} />
    </div>
  )
}
```

---

## ✅ Benefits

| Aspecto | Antes | Depois |
|--------|-------|--------|
| **Lines of Code** | ~150 linhas | ~110 linhas |
| **State Management** | 5+ useState calls | 1 hook + 2 local states |
| **Component Reusability** | Estilos inline | Button, Card, Alert reutilizáveis |
| **Testing** | Difícil testar | useCustomers testável isoladamente |
| **Delete UX** | window.confirm() | Elegant ConfirmDialog modal |
| **Consistency** | Styling inconsistente | Design system tokens |
| **Maintenance** | Modificar página necessário | Modificar apenas components afetados |
| **Scalability** | Difícil adicionar features | Fácil adicionar com novos components |

---

## 🔮 Next Steps

1. **Update CustomerForm** to use new Button component
2. **Update CustomerTable** to use new Button component
3. **Add Input component** for form consistency
4. **Add Modal component** for more complex dialogs
5. **Add Pagination component** for large lists
6. **Add Search component** for filtering
7. **Fix Java backend** and re-enable docker-compose
8. **Full stack testing** (frontend + backend)

---

## 📚 References

- **SOLID Principles**: https://en.wikipedia.org/wiki/SOLID
- **React Hooks Patterns**: https://react.dev/reference/react
- **Component Composition**: https://www.patterns.dev/posts/component-composition/
- **Custom Hooks**: https://react.dev/reference/react/hooks

---

**Last Updated**: Current Session
**Refactor Status**: ✅ COMPLETE - CustomersPage fully refactored
