# JWT Real Integration - Data Flow

## 📊 Fluxo de Dados do JWT

```
Backend (JwtService.java)
    ↓
JWT criado com claims:
    └─ email, idUser, nameIdentifier, role, tenant, hasFullPermission, etc.
    ↓
Frontend recebe tokens no response de login:
    ├─ accessToken (JWT codificado)
    └─ refreshToken (UUID)
    ↓
Salvo em localStorage: getAccessToken() / getRefreshToken()
    ↓
AuthContext.jsx: parseUserFromToken(accessToken)
    ├─ Decodifica o JWT
    ├─ Mapeia claims para propriedades amigáveis
    └─ Retorna objeto user tipado
    ↓
useAuth() hook retorna { user, accessToken, login, logout, ... }
    ↓
Componentes usam user para renderizar dados e controlar acesso
```

## 🔐 JWT Real do Backend

```json
{
  "email": "admin@lume.com",
  "hasFullPermission": true,
  "userLogin": "admin@lume.com",
  "nameIdentifier": "admin",
  "idUser": 1,
  "role": "ROLE_ADMIN",
  "tenant": "lume",
  "sub": "admin@lume.com",
  "iat": 1775853647,
  "exp": 1775854547
}
```

## 📝 Mapeamento de Claims → User Object

| JWT Claim | Mapeado para | Tipo | Exemplo |
|-----------|-------------|------|---------|
| `idUser` | `user.id` | number | 1 |
| `email` | `user.email` | string | "admin@lume.com" |
| `nameIdentifier` | `user.name` | string | "admin" |
| `userLogin` | `user.userLogin` | string | "admin@lume.com" |
| `role` | `user.role` | string | "ROLE_ADMIN" |
| `tenant` | `user.tenant` | string | "lume" |
| `hasFullPermission` | `user.hasFullPermission` | boolean | true |
| `role === 'ROLE_ADMIN'` | `user.isAdmin` | boolean | true |
| `role === 'ROLE_USER'` | `user.isUser` | boolean | false |
| `exp * 1000` | `user.expiresAt` | Date | 2026-04-10T... |

## 🔄 Arquivos Atualizados

### 1. `src/hooks/useAuth.js` ✅
**Função**: Exporta `parseUserFromToken()` para decodificar JWT

```javascript
export const parseUserFromToken = (token) => {
  // Decodifica JWT (base64url → JSON)
  // Mapeia claims para objeto user tipado
  // Retorna { id, email, name, role, isAdmin, ... }
}

export function useAuth() {
  // Retorna { user, accessToken, login, logout, ... }
}
```

### 2. `src/context/AuthContext.jsx` ✅
**Função**: Gerencia estado de autenticação e usa `parseUserFromToken()`

```javascript
import { parseUserFromToken } from '../hooks/useAuth'

export function AuthProvider({ children }) {
  // Na inicialização:
  const token = getAccessToken()
  const user = parseUserFromToken(token)  // ← Decodifica JWT
  
  // No login:
  const userData = parseUserFromToken(newAccessToken)  // ← Mapeia claims
  setUser(userData)
  
  // Retorna { user, accessToken, isAuthenticated, login, logout }
}
```

### 3. `src/components/layout/Drawer.jsx` ✅
**Função**: Exibe dados do usuário e controla menú

```javascript
export function Drawer() {
  const { user } = useAuth()  // ← Obtém user decodificado
  
  // Usa dados do JWT:
  const displayName = user?.name              // nameIdentifier
  const roleLabel = user?.isAdmin ? '🔐 Admin' : '👤 User'
  const showTenant = user?.tenant !== 'lume'
  
  // Controla visibilidade do menú:
  const visibleItems = MENU_ITEMS.filter(
    item => !item.requireAdmin || user?.isAdmin
  )
}
```

## 📍 Exemplo de Uso em Componentes

### Acessar dados do usuário
```javascript
import { useAuth } from './hooks/useAuth'

function MyComponent() {
  const { user, isAuthenticated } = useAuth()
  
  if (!isAuthenticated) return <LoginPage />
  
  return (
    <div>
      <h1>Bem-vindo, {user.name}!</h1>
      <p>Email: {user.email}</p>
      <p>Tenant: {user.tenant}</p>
      
      {user.isAdmin && <AdminPanel />}
    </div>
  )
}
```

### Controlar visibilidade por role
```javascript
function FeaturesList() {
  const { user } = useAuth()
  
  return (
    <div>
      <Feature name="Basic" /> {/* Visible to everyone */}
      
      {user.hasFullPermission && (
        <Feature name="Advanced" />
      )}
      
      {user.isAdmin && (
        <Feature name="Admin Only" />
      )}
    </div>
  )
}
```

## 🧪 Testando os Dados

### Via DevTools Console
```javascript
// Obter user do contexto
const user = localStorage.getItem('access_token')
  ? parseUserFromToken(localStorage.getItem('access_token'))
  : null
console.log(user)

// Resultado:
// {
//   id: 1,
//   email: "admin@lume.com",
//   name: "admin",
//   userLogin: "admin@lume.com",
//   role: "ROLE_ADMIN",
//   tenant: "lume",
//   hasFullPermission: true,
//   isAdmin: true,
//   isUser: false,
//   expiresAt: Date
// }
```

### Via React DevTools Profiler
1. Abra React DevTools
2. Vá para Profiler
3. Procure por `AuthProvider` ou `Drawer`
4. Verifique o prop `user` que deve conter todos os dados

## ✅ Checklist de Integração

- [x] `parseUserFromToken()` implementado em `useAuth.js`
- [x] Todos os claims do JWT mapeados para `user` object
- [x] `AuthContext.jsx` importa e usa `parseUserFromToken()`
- [x] `Drawer.jsx` exibe dados corretos do usuário
- [x] Menu filtra por `user.isAdmin` (derivado de `role === 'ROLE_ADMIN'`)
- [x] Suporte a multi-tenancy com `user.tenant`
- [x] Suporte a permissions com `user.hasFullPermission`
- [x] `user.expiresAt` track quando token expira

## 🔑 Principais Propriedades Disponíveis

```javascript
user = {
  // ── Identidade ─────────────────────
  id:               1,
  email:            "admin@lume.com",
  name:             "admin",           // nameIdentifier
  userLogin:        "admin@lume.com",
  
  // ── Autorização ────────────────────
  role:             "ROLE_ADMIN",       // Raw role from JWT
  tenant:           "lume",             // Multi-tenancy
  hasFullPermission: true,              // Custom permission flag
  
  // ── Derived Helpers ────────────────
  isAdmin:          true,               // role === 'ROLE_ADMIN'
  isUser:           false,              // role === 'ROLE_USER'
  
  // ── Metadata ───────────────────────
  expiresAt:        Date                // When token expires
}
```

## 🚀 Produção

Para production:
1. Não decodificar JWT no frontend (apenas referência)
2. Backend deve validar JWT e retornar claims em endpoint `/me`
3. Frontend chama `/me` uma vez após login
4. Armazena user data em Context

Para agora (desenvolvimento):
- ✅ Frontend decodifica JWT localmente
- ✅ Tudo funciona sem endpoint `/me`
- ✅ Pronto para migrar quando necessário

## 📚 Documentação Relacionada

- [BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md) - Endpoints esperados
- [BACKEND_TESTING.md](./BACKEND_TESTING.md) - Testes com cURL
- [BACKEND_READY.md](./BACKEND_READY.md) - Status final de integração
