# ⚡ RBAC Cheatsheet - Referência Rápida

## 🎯 Em Uma Linha
**Admin** pode acessar/criar/editar/deletar usuários+clientes. **User** pode visualizar apenas.

---

## 🔑 Pontos-Chave

### 1. Verificar se é Admin
```javascript
import { useRbac } from '@/hooks/useRbac'

const { can, isAdmin } = useRbac()

console.log(can.createCustomer)  // true/false
console.log(isAdmin)             // true/false
```

### 2. Proteger Rota
```jsx
<Route element={<ProtectedRoute requiredRoles={['ROLE_ADMIN']} />}>
  <Route path="/config" element={<ConfigPage />} />
</Route>
```

### 3. Menu Condicional
```jsx
const visibleItems = MENU_ITEMS.filter(
  (item) => !item.requireAdmin || user?.isAdmin
)
```

### 4. Botão Condicional
```jsx
{isAdmin && (
  <button onClick={handleCreate}>➕ Novo</button>
)}
```

### 5. Handler com Validação
```javascript
const handleCreate = () => {
  if (!isAdmin) {
    logger.warn('🚫 Acesso negado')
    return
  }
  // ... fazer algo
}
```

---

## 📍 Estrutura de Arquivos

```
src/
├── hooks/
│   ├── useAuth.js          ← Autenticação
│   └── useRbac.js          ← ✨ NEW: Permissões
├── context/
│   └── AuthContext.jsx     ← Armazena user + role
├── pages/
│   ├── CustomersPage.jsx   ← Usa useRbac()
│   └── ConfigPage.jsx      ← Usa useRbac()
├── components/
│   ├── ProtectedRoute.jsx  ← Valida requiredRoles
│   ├── layout/
│   │   └── Drawer.jsx      ← Menu condicional
│   ├── CustomerTable.jsx   ← Ações condicionais
│   └── users/
│       └── UserTable.jsx   ← Ações condicionais
└── api/
    ├── authApi.js
    ├── usersApi.js
    └── customersApi.js
```

---

## 🔐 Fluxo de Autenticação

```
Login
  ↓ (email + password)
Backend retorna { accessToken, refreshToken }
  ↓
Salva em localStorage
  ↓
AuthProvider decodifica JWT
  ↓
Extrai: email, role, isAdmin (derivado)
  ↓
useAuth() + useRbac() disponível
  ↓
ProtectedRoute bloqueia se necessário
  ↓
Componentes renderizam baseado em can.*
```

---

## 📋 Checklist Rápido

### Para o Usuário Admin
- [ ] Login funciona ✅
- [ ] Menu mostra "Configurações" ✅
- [ ] Pode clicar em "Configurações" ✅
- [ ] Vê botão "Novo Usuário" ✅
- [ ] Vê botão "Adicionar Cliente" ✅
- [ ] Pode editar/deletar usuários ✅
- [ ] Pode editar/deletar clientes ✅

### Para o Usuário Normal
- [ ] Login funciona ✅
- [ ] Menu NÃO mostra "Configurações" ✅
- [ ] Acesso a /config é bloqueado ✅
- [ ] NÃO vê botão "Novo Usuário" ✅
- [ ] NÃO vê botão "Adicionar Cliente" ✅
- [ ] NÃO consegue editar/deletar ✅

---

## 🧪 Debug Útil

### Console - Verificar User
```javascript
const { user } = useAuth()
console.log(user)
// { email: '...', role: 'ROLE_ADMIN', isAdmin: true }
```

### Console - Verificar Permissões
```javascript
const { can } = useRbac()
console.log(can)
// { 
//   manageCustomers: true,
//   createCustomer: true,
//   editCustomer: true,
//   deleteCustomer: true,
//   manageUsers: true,
//   ... 
// }
```

### LocalStorage - Ver Token
```javascript
localStorage.getItem('accessToken')
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

### Decodificar JWT (site)
Cole em: https://jwt.io
Veja as claims: `role`, `email`, `sub`, etc

---

## 🚨 Problemas Comuns

| Problema | Solução |
|----------|---------|
| Botão não aparece | Verifique `isAdmin` console |
| "Acesso Bloqueado" | Role é ROLE_USER? Use admin |
| Token com erro | Logout e login novamente |
| 403 Forbidden | Backend não reconhece role |
| Menu não filtra | useAuth() retornando null? |

---

## 📊 Permissões

```
Admin (ROLE_ADMIN)
├── Home ✅
├── Clientes
│   ├── Visualizar ✅
│   ├── Criar ✅
│   ├── Editar ✅
│   └── Deletar ✅
└── Configurações
    ├── Visualizar ✅
    ├── Criar Usuário ✅
    ├── Editar Usuário ✅
    └── Deletar Usuário ✅

User (ROLE_USER)
├── Home ✅
├── Clientes
│   ├── Visualizar ✅
│   ├── Criar ❌
│   ├── Editar ❌
│   └── Deletar ❌
└── Configurações ❌
```

---

## 🔗 Links Úteis

- **Implementação Tech**: `docs/RBAC_IMPLEMENTATION.md`
- **Fluxos & Diagramas**: `docs/RBAC_FLOW_DIAGRAM.md`
- **Teste Prático**: `docs/RBAC_TEST_GUIDE.md`
- **Resumo**: `docs/RBAC_SUMMARY.md`

---

## 💡 Dicas

1. **Sempre use hooks** - `useAuth()` e `useRbac()` juntos
2. **Camadas** - UI (UX), Lógica (validação), Backend (segurança)
3. **Logs** - `logger.warn()` quando acesso é negado
4. **Testing** - Teste como admin E como user
5. **Segurança** - Backend sempre rejeita (não confie no frontend)

---

**Versão**: 1.0 | **Última Atualização**: 2026-04-13
