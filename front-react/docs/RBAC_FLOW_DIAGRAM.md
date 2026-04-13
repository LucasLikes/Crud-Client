# Diagrama de Fluxo RBAC

## 📊 Estrutura de Permissões Implementada

```
┌─────────────────────────────────────────────────────────────────┐
│                    APLICAÇÃO REACT                              │
└─────────────────────────────────────────────────────────────────┘
                              │
                    ┌─────────▼────────────┐
                    │   Login/Register     │
                    │   (PublicRoutes)     │
                    └─────────┬────────────┘
                              │
                    Recebe accessToken
                    com role: "ROLE_ADMIN"
                              │
                ┌─────────────▼──────────────────┐
                │ AuthProvider armazena em       │
                │ localStorage (storage.js)      │
                │ + Decodifica JWT claims        │
                └──────────┬──────────────────────┘
                           │
                 ┌─────────▼────────────┐
                 │  AuthContext.jsx     │
                 │ Fornece user + role  │
                 └──────────┬───────────┘
                            │
         ┌──────────────────┴──────────────────┐
         │                                     │
         ▼                                     ▼
    useAuth()                             useRbac()
    Returns:                              Returns:
    - user.role                          - can.createCustomer
    - user.isAdmin                       - can.editCustomer
    - isAuthenticated                    - can.deleteCustomer
                                         - can.createUser
                                         - can.accessConfig
```

## 🔐 Matriz de Acesso Detalhada

### ROLE_ADMIN (hasFullPermission: true)
```
┌──────────────────────────────────────────────────────────────┐
│ ADMIN USER                                                    │
│ ─────────────────────────────────────────────────────────── │
│ Email: admin@lume.com                                        │
│ Role: ROLE_ADMIN                                             │
│ isAdmin: true (derivado)                                     │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ 🏠 HOME                 │
│ ✅ Acesso Completo      │
└─────────────────────────┘

┌──────────────────────────────────────────────┐
│ 👥 CUSTOMERS PAGE                            │
│ ─────────────────────────────────────────── │
│ ✅ Visualizar clientes                      │
│ ✅ Botão "Adicionar Cliente"                │
│ ✅ Editar clientes (botão ✏️)                │
│ ✅ Deletar clientes (botão 🗑️)              │
│ ✅ Chamar APIs:                             │
│    - POST   /api/v1/customers              │
│    - PUT    /api/v1/customers/{id}         │
│    - DELETE /api/v1/customers/{id}         │
└──────────────────────────────────────────────┘

┌──────────────────────────────────────────────┐
│ ⚙️ CONFIG PAGE (Gerenciar Usuários)         │
│ ─────────────────────────────────────────── │
│ ✅ Visualizar usuários                      │
│ ✅ Botão "Novo Usuário" ➕                   │
│ ✅ Editar usuários (botão ✏️)                │
│ ✅ Deletar usuários (botão 🗑️)              │
│ ✅ Atribuir roles (ROLE_ADMIN/ROLE_USER)   │
│ ✅ Chamar APIs:                             │
│    - GET    /api/v1/users                 │
│    - POST   /api/v1/users                 │
│    - PUT    /api/v1/users/{id}            │
│    - DELETE /api/v1/users/{id}            │
└──────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📋 MENU LATERAL (Drawer)                            │
│ ─────────────────────────────────────────────────  │
│ 🏠 Home                                            │
│ 👥 Clientes                                        │
│ ⚙️ Configurações (Apenas Admin)                    │
└─────────────────────────────────────────────────────┘
```

### ROLE_USER (Usuário Normal)
```
┌──────────────────────────────────────────────────────────────┐
│ REGULAR USER                                                 │
│ ─────────────────────────────────────────────────────────── │
│ Email: user@lume.com                                         │
│ Role: ROLE_USER                                              │
│ isAdmin: false (derivado)                                    │
└──────────────────────────────────────────────────────────────┘

┌─────────────────────────┐
│ 🏠 HOME                 │
│ ✅ Acesso Completo      │
└─────────────────────────┘

┌──────────────────────────────────────────────┐
│ 👥 CUSTOMERS PAGE                            │
│ ─────────────────────────────────────────── │
│ ✅ Visualizar clientes                      │
│ ❌ Botão "Adicionar Cliente" (Oculto)       │
│ ❌ Editar clientes (Botão ✏️ Oculto)         │
│ ❌ Deletar clientes (Botão 🗑️ Oculto)       │
│ ❌ Chamar APIs: Retorna 403 Forbidden       │
│    (Se tentar, backend rejeita)             │
└──────────────────────────────────────────────┘

┌───────────────────────────────────────────────┐
│ ⚙️ CONFIG PAGE                                 │
│ ─────────────────────────────────────────── │
│ ❌ Acesso Bloqueado (Redirect para Home)     │
│     (ProtectedRoute com requiredRoles)       │
└───────────────────────────────────────────────┘

┌─────────────────────────────────────────────────────┐
│ 📋 MENU LATERAL (Drawer)                            │
│ ─────────────────────────────────────────────────  │
│ 🏠 Home                                            │
│ 👥 Clientes                                        │
│ ❌ Configurações (Oculto)                          │
└─────────────────────────────────────────────────────┘
```

## 🔄 Fluxo de Decisão - Criar Cliente

```
User clica em "Adicionar Cliente"
         │
         ▼
useRbac() → can.createCustomer?
         │
    ┌────┴────┐
    │         │
   Sim        Não
    │         │
    ▼         ▼
  Abre    Não faz nada +
  Modal   Log warning
    │    
    │
    ▼
User preenche formulário
    │
    ▼
Click "Cadastrar"
    │
    ▼
handleSaveFromModal()
    │
    ▼
POST /api/v1/customers
    │
    ┌─────────────────────┬──────────────────────┐
    │                     │                      │
   201                   403                   500
 Created             Forbidden           Server Error
    │                     │                      │
    ▼                     ▼                      ▼
Success          Show Error             Retry/Cancel
Refetch          User not admin         User not admin
Clientes         Backend validação      Backend validação
```

## 🧪 Validação em Camadas

```
┌─────────────────────────────────────────────────────┐
│ CAMADA 1: UI (Frontend)                             │
│ ─────────────────────────────────────────────────  │
│ ✅ Botão escondido se não é admin                  │
│ ✅ Coluna "Ações" não renderiza                    │
│ ✅ Menu "Configurações" escondido                  │
│ 📝 Apenas UX, não é segurança!                     │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ CAMADA 2: Lógica (Frontend)                         │
│ ─────────────────────────────────────────────────  │
│ ✅ useRbac() valida permissões                     │
│ ✅ Handler retorna cedo se não autorizado          │
│ ✅ Logs de tentativa negada                        │
│ 📝 Proteção comportamental                         │
└────────────────────┬────────────────────────────────┘
                     │
┌────────────────────▼────────────────────────────────┐
│ CAMADA 3: API (Backend) 🔐                          │
│ ─────────────────────────────────────────────────  │
│ ✅ Valida JWT token                               │
│ ✅ Extrai user.role do JWT                        │
│ ✅ Retorna 403 Forbidden se role != ROLE_ADMIN   │
│ 📝 Segurança real! Não pode ser contornada!      │
└─────────────────────────────────────────────────────┘
```

## 📱 Componentes e Seus Checks RBAC

```
ProtectedRoute ──┬─► requiredRoles prop
                 └─► user?.role validation
                    
Drawer ──────────┬─► MENU_ITEMS.requireAdmin
                 └─► visibleItems filter
                    
CustomersPage ──┬─► useRbac().can.createCustomer
                ├─► handleOpenModal() validation
                ├─► handleDelete() validation
                └─► isAdmin prop para CustomerTable
                    
ConfigPage ─────┬─► useRbac().can.manageUsers
                ├─► handleCreateClick() validation
                ├─► handleEditClick() validation
                ├─► handleDeleteUser() validation
                └─► isAdmin prop para UserTable
                    
CustomerTable ──┬─► isAdmin prop
                └─► Renderiza coluna "Ações" condicionalmente
                    
UserTable ──────┬─► isAdmin prop
                └─► Renderiza coluna "Ações" condicionalmente
```

## 🛡️ Segurança - Checklist

- ✅ JWT decode armazenado com as claims (role)
- ✅ AuthProvider deriva `isAdmin` do role
- ✅ useRbac() centraliza permissões
- ✅ ProtectedRoute bloqueia rotas admin
- ✅ Botões ocultados condicionalmente
- ✅ Handlers validam permissões
- ✅ Logs de tentativas negadas
- ✅ Backend valida (camada real de segurança)
- ✅ Token armazenado securely (localStorage)
- ✅ Refresh token para sessão

## 🚀 Deploy - Considerações

1. **Variáveis de Ambiente**
   - Não hardcode API URLs
   - Use .env para endpoints

2. **CORS**
   - Backend deve aceitar requests do domínio frontend

3. **Token Expiration**
   - Implementar refresh token flow
   - Redirecionar para login se expirado

4. **HTTPS**
   - Usar HTTPS em produção
   - localStorage não é 100% seguro

5. **Monitoramento**
   - Track tentativas de acesso negado
   - Alertar em casos suspeitos

---

**Última atualização**: 2026-04-13
