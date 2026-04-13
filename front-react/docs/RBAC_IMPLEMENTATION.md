# RBAC - Role-Based Access Control

## 🎯 Visão Geral

Sistema de controle de acesso baseado em papéis (RBAC) implementado com:
- ✅ **Admin**: Acesso completo (Config, Usuários, Clientes)
- 👤 **Usuário**: Aceso limitado (Home, visualizar clientes)

## 🔐 Token JWT

Ao fazer login, recebe um token com essas informações:

```json
{
  "email": "admin@lume.com",
  "idUser": 1,
  "tenant": "lume",
  "firstName": "Admin",
  "lastName": "Lume",
  "userLogin": "admin@lume.com",
  "hasFullPermission": true,
  "nameIdentifier": "Admin Lume",
  "role": "admin",           // ← Principal identificador de role
  "sub": "admin@lume.com",
  "iat": 1776077628,
  "exp": 1776078528
}
```

## 📋 Permissões por Role

### Admin (ROLE_ADMIN)
| Recurso | Listar | Criar | Editar | Deletar |
|---------|--------|-------|--------|---------|
| 🏠 Home | ✅ | N/A | N/A | N/A |
| 👥 Clientes | ✅ | ✅ | ✅ | ✅ |
| ⚙️ Configurações | ✅ | ✅ | ✅ | ✅ |
| 👤 Usuários | ✅ | ✅ | ✅ | ✅ |

### Usuário Normal (ROLE_USER)
| Recurso | Listar | Criar | Editar | Deletar |
|---------|--------|-------|--------|---------|
| 🏠 Home | ✅ | N/A | N/A | N/A |
| 👥 Clientes | ✅ | ❌ | ❌ | ❌ |
| ⚙️ Configurações | ❌ | N/A | N/A | N/A |
| 👤 Usuários | ❌ | N/A | N/A | N/A |

## 🛠️ Implementação - Arquivos Modificados

### 1. **src/hooks/useRbac.js** ✨ NOVO
```javascript
// Hook para verificar permissões do usuário
export function useRbac() {
  const { user } = useAuth()
  return {
    isAdmin: user?.isAdmin ?? false,
    can: {
      createCustomer: user?.isAdmin ?? false,
      editCustomer: user?.isAdmin ?? false,
      deleteCustomer: user?.isAdmin ?? false,
      createUser: user?.isAdmin ?? false,
      editUser: user?.isAdmin ?? false,
      deleteUser: user?.isAdmin ?? false,
      accessConfig: user?.isAdmin ?? false,
    },
  }
}
```

### 2. **src/App.jsx**
- CustomersPage está **acessível a todos** os usuários autenticados
- ConfigPage está **protegida para admin apenas** com `requiredRoles=['ROLE_ADMIN']`

```jsx
{/* Customers - todos autenticados podem visualizar */}
<Route element={<ProtectedRoute />}>
  <Route path="/customers" element={...} />
</Route>

{/* Config - apenas admin */}
<Route element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']} />}>
  <Route path="/config" element={...} />
</Route>
```

### 3. **src/components/layout/Drawer.jsx**
Menu mostra "Configurações" **apenas para admin**:

```jsx
const MENU_ITEMS = [
  { id: 'home', label: 'Home', requireAdmin: false },
  { id: 'customers', label: 'Clientes', requireAdmin: false },
  { id: 'config', label: 'Configurações', requireAdmin: true },  // ← Apenas admin
]
```

### 4. **src/pages/CustomersPage.jsx**
- Utiliza `useRbac()` para validar permissões
- Botão "Adicionar Cliente" **apenas para admin**
- Botões de editar/deletar **apenas para admin**

```jsx
const { can } = useRbac()
const isAdmin = can.createCustomer

if (!isAdmin) {
  logger.warn('🚫 Acesso negado - usuário não é admin')
  return
}
```

### 5. **src/pages/ConfigPage.jsx**
- Rota já protegida por `requiredRoles=['ROLE_ADMIN']`
- Validações adicionais em cada ação (criar/editar/deletar)

```jsx
const handleCreateClick = () => {
  if (!isAdmin) {
    logger.warn('🚫 Acesso negado')
    return
  }
  // ... abrir modal
}
```

### 6. **src/components/users/UserTable.jsx**
- Coluna "Ações" mostrada **apenas para admin**

```jsx
{isAdmin && (
  <th>Ações</th> // Editar/Deletar buttons
)}
```

### 7. **src/components/CustomerTable.jsx**
- Coluna "Ações" mostrada **apenas para admin**

```jsx
{isAdmin && (
  <th>Ações</th> // Editar/Deletar buttons
)}
```

## 🔄 Fluxo de Autenticação e RBAC

```
Login
  ↓
Backend retorna accessToken com role: "ROLE_ADMIN" ou "ROLE_USER"
  ↓
AuthProvider (localStorage) armazena token
  ↓
useAuth() decodifica JWT e retorna:
  - user.role → "ROLE_ADMIN" ou "ROLE_USER"
  - user.isAdmin → true ou false (derivado)
  ↓
useRbac() retorna permissões específicas
  ↓
ProtectedRoute valida renderização da página
  ↓
Componentes renderizam botões/formulários baseado em can.*
```

## 🧪 Testando o RBAC

### 1️⃣ Teste como Admin
```bash
# Login com: admin@lume.com
# Resultado esperado:
# ✅ Home acessível
# ✅ Clientes acessível + botão "Adicionar Cliente"
# ✅ Configurações acessível + botão "Novo Usuário"
# ✅ Menu lateral: Home, Clientes, Configurações
```

### 2️⃣ Teste como Usuário Normal
```bash
# Login com: user@lume.com (ou qualquer user com role: "ROLE_USER")
# Resultado esperado:
# ✅ Home acessível
# ✅ Clientes acessível mas SEM botão "Adicionar Cliente"
# ❌ Configurações NÃO acessível (redirect para Home)
# ✅ Menu lateral: Somente Home e Clientes
```

### 3️⃣ Teste de Proteção Manual
```javascript
// No console, tente chamar:
const { can } = useRbac()
console.log(can.createCustomer)  // true (admin) ou false (user)
console.log(can.accessConfig)    // true (admin) ou false (user)
```

## 📝 Logs de Segurança

Todas as tentativas de acesso negado são registradas:

```
🚫 Acesso negado - permissão insuficiente (RBAC)
   rota: /config
   userRole: ROLE_USER
   requiredRoles: ["ROLE_ADMIN"]

🚫 Acesso negado - usuário não é admin, tentou criar cliente
   customerId: undefined
```

## 🔗 Relação Backend-Frontend

### ✅ POST /api/v1/users (criar usuário)
- **Backend**: Valida se user.role === "ROLE_ADMIN"
- **Frontend**: Botão escondido, validação adicional, logs

### ✅ POST /api/v1/customers (criar cliente)
- **Backend**: Valida se user.role === "ROLE_ADMIN"
- **Frontend**: Botão escondido, validação adicional, logs

### ✅ DELETE /api/v1/customers/{id}
- **Backend**: Valida se user.role === "ROLE_ADMIN"
- **Frontend**: Botão escondido, validação adicional, logs

## 🎨 Componentes com RBAC

| Componente | Validação RBAC |
|------------|---|
| `Drawer.jsx` | Menu condicional |
| `ProtectedRoute.jsx` | Role-based routing |
| `CustomersPage.jsx` | Buttons + handlers |
| `ConfigPage.jsx` | Buttons + handlers |
| `CustomerTable.jsx` | Ações condicionais |
| `UserTable.jsx` | Ações condicionais |

## 🚀 Próximas Melhorias (Opcional)

- [ ] Adicionar mais roles (ROLE_MANAGER, ROLE_VIEWER)
- [ ] Implementar permissões granulares por feature flag
- [ ] Dashboard de auditoria de acessos
- [ ] Refresh token automático
- [ ] 2FA para admin

---

**Status**: ✅ RBAC implementado com sucesso!
**Versão**: 1.0
**Última atualização**: 2026-04-13
