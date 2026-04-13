# 🔌 RBAC - Integração Backend

> Documento para o backend validar permissões baseado no JWT token

## 🎯 Visão Geral

Frontend envia **JWT token** em cada request.
Backend deve extrair `role` do JWT e validar permissões.

```
Frontend Request
    ↓
Headers: { Authorization: "Bearer eyJhbGc..." }
    ↓
Backend extrai JWT
    ↓
Decodifica claims: { role: "ROLE_ADMIN", email: "...", ... }
    ↓
Valida: role === "ROLE_ADMIN"?
    ↓
✅ 200 OK ou ❌ 403 Forbidden
```

---

## 🔑 Claims JWT Importantes

```json
{
  "role": "ROLE_ADMIN",           // ← Principal para validar
  "email": "admin@lume.com",
  "sub": "admin@lume.com",
  "iat": 1776077628,              // issued at
  "exp": 1776078528               // expiration
}
```

**O backend deve validar**:
1. ✅ JWT válido (assinatura)
2. ✅ JWT não expirado (`exp > now`)
3. ✅ Role autorizado para endpoint

---

## 📋 Mapeamento de Endpoints → Roles

### Usuários

#### GET /api/v1/users
```
Frontend: CustomersPage listando
Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se não:
    → 403 Forbidden
    → { error: "User not authorized to list users" }
```

#### POST /api/v1/users (Criar Usuário)
```
Frontend: ConfigPage → "Novo Usuário" → formulário
Request:
  {
    "firstName": "João",
    "lastName": "Silva",
    "email": "joao@lume.com",
    "password": "Senha123!",
    "role": "ROLE_ADMIN"
  }

Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 201 Created
    → { id, firstName, lastName, email, role }
    
  Se User:
    → 403 Forbidden
```

#### PUT /api/v1/users/{id} (Editar Usuário)
```
Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 200 OK (usuário atualizado)
    
  Se User:
    → 403 Forbidden
```

#### DELETE /api/v1/users/{id}
```
Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 204 No Content
    
  Se User:
    → 403 Forbidden
```

### Clientes

#### GET /api/v1/customers
```
Frontend: CustomersPage listando
Validação:
  - Token válido? ✅
  - Qualquer usuário autenticado pode listar
  
  Se autenticado:
    → 200 OK [ { id, name, cpf, ... }, ... ]
    
  Se não autenticado:
    → 401 Unauthorized
```

#### POST /api/v1/customers (Criar Cliente)
```
Frontend: CustomersPage → "Adicionar Cliente"
Request:
  {
    "name": "João Silva",
    "cpf": "12345678900",
    "address": {
      "street": "Rua A",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01234567"
    }
  }

Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 201 Created { id, name, cpf, ... }
    
  Se User:
    → 403 Forbidden
    → { error: "Only admins can create customers" }
```

#### PUT /api/v1/customers/{id}
```
Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 200 OK (cliente atualizado)
    
  Se User:
    → 403 Forbidden
```

#### DELETE /api/v1/customers/{id}
```
Backend Validação:
  - Token válido? ✅
  - role === "ROLE_ADMIN"? ✅
  
  Se Admin:
    → 204 No Content
    
  Se User:
    → 403 Forbidden
```

---

## 🧬 Exemplo de Validação em Spring Boot

```java
@RestController
@RequestMapping("/api/v1/users")
public class UserController {

    @PostMapping
    public ResponseEntity<?> createUser(
        @RequestBody CreateUserRequest request,
        @AuthenticationPrincipal JwtAuthenticationToken auth) {
        
        // ✅ Extrair role do JWT
        String role = auth.getToken()
            .getClaimAsString("role");
        
        // ✅ Validar se é ROLE_ADMIN
        if (!"ROLE_ADMIN".equals(role)) {
            return ResponseEntity
                .status(HttpStatus.FORBIDDEN)
                .body(new ErrorResponse("Only admins can create users"));
        }
        
        // ✅ Se autorizado, criar usuário
        User newUser = userService.create(request);
        return ResponseEntity.status(201).body(newUser);
    }
}
```

---

## 🧬 Exemplo em Node.js/Express

```javascript
const express = require('express');
const jwt = require('jsonwebtoken');

function requireAdmin(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // ✅ Validar role
    if (decoded.role !== 'ROLE_ADMIN') {
      return res.status(403).json({ 
        error: 'Only admins can access this' 
      });
    }
    
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(401).json({ error: 'Invalid token' });
  }
}

// ✅ Usar middleware
app.post('/api/v1/users', requireAdmin, (req, res) => {
  // Criar usuário
  res.status(201).json(newUser);
});
```

---

## 📊 Tabela de Validação

| Endpoint | HTTP | Admin | User | Auth |
|----------|------|-------|------|------|
| GET /users | GET | ✅ | ❌ | Required |
| POST /users | POST | ✅ | ❌ | Required |
| PUT /users/{id} | PUT | ✅ | ❌ | Required |
| DELETE /users/{id} | DELETE | ✅ | ❌ | Required |
| GET /customers | GET | ✅ | ✅ | Required |
| POST /customers | POST | ✅ | ❌ | Required |
| PUT /customers/{id} | PUT | ✅ | ❌ | Required |
| DELETE /customers/{id} | DELETE | ✅ | ❌ | Required |

---

## 🔍 Validação de Claims

### JWT Decode (exemplo)
```json
HEADER
{
  "alg": "HS256",
  "typ": "JWT"
}

PAYLOAD
{
  "email": "admin@lume.com",
  "idUser": 1,
  "tenant": "lume",
  "firstName": "Admin",
  "lastName": "Lume",
  "userLogin": "admin@lume.com",
  "hasFullPermission": true,
  "nameIdentifier": "Admin Lume",
  "role": "admin",              // ← Validar isso!
  "sub": "admin@lume.com",
  "iat": 1776077628,
  "exp": 1776078528
}

SIGNATURE
HMACSHA256(
  base64UrlEncode(header) + "." +
  base64UrlEncode(payload),
  your-256-bit-secret
)
```

**⚠️ IMPORTANTE**: Validar a assinatura antes de usar os claims!

---

## ❌ Códigos HTTP Esperados

| Cenário | Status | Resposta |
|---------|--------|----------|
| Token válido + Admin | 201/200 | ✅ Sucesso |
| Token válido + User | 403 | Forbidden |
| Token inválido | 401 | Unauthorized |
| Token expirado | 401 | Unauthorized |
| Sem token | 401 | Unauthorized |
| Recurso não existe | 404 | Not Found |
| Dados inválidos | 400 | Bad Request |

---

## 🛡️ Checklist de Segurança Backend

- [ ] Valida JWT assinatura
- [ ] Valida JWT expiração
- [ ] Extrai `role` do claim
- [ ] Verifica role antes de cada ação
- [ ] Retorna 403 se não autorizado
- [ ] Retorna 401 se sem token
- [ ] Registra tentativas negadas (logs)
- [ ] Não expõe dados sensíveis em erro
- [ ] Usa HTTPS em produção
- [ ] Secret do JWT é seguro

---

## 🔗 Relacionamento Frontend ↔ Backend

```
Frontend (React)              Backend (Java/Node)
─────────────────            ─────────────────

useAuth()                     /auth/login
  ↓ GET /auth/me              ↓ Valida credentials
Decodifica JWT               ↓ Retorna JWT com role
  ↓ Extrai role              
  ↓
useRbac()
  ↓ Verifica can.*
  ↓
customersApi.js
  ↓ POST /api/v1/customers   
  ↓ Headers: Bearer token    
                               Recebe request
                               ↓ Valida token
                               ↓ Extrai role
                               ↓ role === ADMIN?
                               ↓ 201 Created
                               ↓
  Recebe 201
  ↓ Sucesso!
```

---

## 📝 Teste de Integração

### Admin Criando Usuário (Sucesso)
```bash
# Frontend clica "Novo Usuário"
# CustomersPage → POST /api/v1/users
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer eyJhbGc...ADMIN...xyz" \
  -H "Content-Type: application/json" \
  -d '{
    "firstName": "João",
    "lastName": "Silva",  
    "email": "joao@lume.com",
    "password": "Senha123!",
    "role": "ROLE_ADMIN"
  }'

# Response 201
{
  "id": 2,
  "firstName": "João",
  "lastName": "Silva",
  "email": "joao@lume.com",
  "fullName": "João Silva",
  "role": "ROLE_ADMIN"
}
```

### User Tentando Criar Usuário (Bloqueado)
```bash
# Frontend → CustomersPage → POST /api/v1/users
# (Frontend impede via UI, mas se não houvesse...)
curl -X POST http://localhost:8000/api/v1/users \
  -H "Authorization: Bearer eyJhbGc...USER...xyz" \
  -H "Content-Type: application/json" \
  -d '{ ... }'

# Response 403
{
  "error": "Forbidden",
  "message": "Only admins can create users",
  "status": 403
}
```

---

## 🚀 Deployment Checklist

- [ ] JWT_SECRET é variável de ambiente
- [ ] CORS está configurado para domínio frontend
- [ ] HTTPS habilitado
- [ ] Rate limiting ativado
- [ ] Logs de auditoria de acessos
- [ ] Tokens com TTL (Time To Live) curto
- [ ] Refresh token implementado

---

**Status**: Backend-ready ✅
**Versão**: 1.0
**Última atualização**: 2026-04-13
