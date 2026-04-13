# Backend Integration Guide

## Overview
Este documento descreve como conectar o frontend React ao backend Java (Lume API).

## 📋 Configuração Necessária

### 1. Variáveis de Ambiente
Crie um arquivo `.env` na raiz do projeto:

```env
VITE_API_BASE_URL=http://localhost:8080
```

### 2. Backend Setup
Certifique-se que o backend Java está rodando em `http://localhost:8080`

## 🔐 Autenticação JWT

### Credenciais Padrão (Exemplo)
- **Email**: `admin@lume.com`
- **Password**: `admin123`

### Fluxo de Login

1. **POST** `/api/v1/auth/login`
   ```json
   {
     "email": "admin@lume.com",
     "password": "admin123"
   }
   ```

2. **Response** (Status 200)
   ```json
   {
     "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
     "refreshToken": "7b22acb1-3ed4-4204-8242-66ba36f15a11"
   }
   ```

### Token JWT Structure
O `accessToken` é um JWT com as seguintes claims:
```json
{
  "sub": "admin@lume.com",      // Email do usuário
  "iat": 1775847589,             // Issued at
  "exp": 1775848489,             // Expiration time
  "role": "admin"                // [Optional] Role do usuário
}
```

## 🔄 Refresh Token Flow

### POST `/api/v1/auth/refresh`
```json
{
  "refreshToken": "7b22acb1-3ed4-4204-8242-66ba36f15a11"
}
```

**Response** (Status 200)
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "7b22acb1-3ed4-4204-8242-66ba36f15a11"
}
```

## 📦 API Endpoints

BaseURL: `http://localhost:8080`

### Authentication Group (`/api/v1/auth/`)

| Method | Endpoint | Descrição |
|--------|----------|-----------|
| POST | `/register` | Registrar novo usuário |
| POST | `/login` | Login |
| POST | `/refresh` | Renovar access token |
| POST | `/logout` | Fazer logout |

### Customers Group (`/api/v1/customers/`)

| Method | Endpoint | Descrição | Auth |
|--------|----------|-----------|------|
| GET | `/` | Listar clientes | Bearer |
| POST | `/` | Criar cliente | Bearer |
| GET | `/{id}` | Obter cliente | Bearer |
| PUT | `/{id}` | Atualizar cliente | Bearer |
| DELETE | `/{id}` | Deletar cliente | Bearer |
| GET | `/address-lookup/{zipCode}` | Buscar enderço por CEP | Bearer |

## 🔑 Bearer Token

Todas as requisições autenticadas devem incluir o header:
```
Authorization: Bearer <accessToken>
```

Exemplo:
```bash
curl -X GET http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer eyJhbGciOiJIUzUxMiJ9..."
```

## ✅ Verificação de Funcionamento

### 1. Login via cURL
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lume.com",
    "password": "admin123"
  }'
```

### 2. Listar Clientes
```bash
curl -X GET http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN"
```

### 3. Verificar Status da API
```bash
curl -X GET http://localhost:8080/v3/api-docs
```

## 🛠️ Modo Mock (Offline)

Para testar sem backend, use:
```
http://localhost:5173?mock=true
```

Isso carregará dados mockados e não fará requisições ao backend.

## 🐛 Troubleshooting

### CORS Error
Se receber erro de CORS:
1. Verifique se o backend está rodando em `http://localhost:8080`
2. Verifique as configurações de CORS no backend Spring Boot

### 401 Unauthorized
1. Verifique se o token é válido
2. Verifique se o token não expirou
3. Verifique se o header Authorization está correto

### Token Expired
1. O frontend automaticamente tenta renovar com o refresh token
2. Se o refresh falhar, o usuário é redirecionado para login

## 📱 Frontend Integration

O frontend já está configurado com:

1. **httpClient.js** - Cliente HTTP com interceptadores
   - Adiciona automaticamente Bearer token nos headers
   - Trata erros 401 com refresh token

2. **AuthContext.jsx** - Gerenciamento de autenticação
   - Decodifica JWT para extrair user info
   - Extrai: email, role, id

3. **authApi.js** - Funções de autenticação
   - login()
   - register()
   - refreshToken()
   - logout()

4. **ProtectedRoute.jsx** - Proteção de rotas
   - Requer autenticação
   - Suporta controle de acesso por role

## 🚀 Próximas Etapas

1. Iniciar backend Java em `http://localhost:8080`
2. Atualizar arquivo `.env` com a URL correta
3. Testar login com as credenciais fornecidas
4. Implementar RBAC no backend (se não estiver pronto)
5. Testar CRUD de clientes

## 📚 Links Úteis

- Documentação Swagger: `http://localhost:8080/swagger-ui.html`
- OpenAPI Specification: `http://localhost:8080/v3/api-docs`
