# Lume — Sistema de Gestão de Clientes

Sistema completo com **autenticação JWT**, **CRUD de clientes** e **integração com ViaCEP**.
Stack: **Spring Boot 3 + React 19 + Docker**.

---

## 📋 Sumário

- [Pré-requisitos](#pré-requisitos)
- [Como executar com Docker](#como-executar-com-docker-recomendado)
- [Como executar sem Docker](#como-executar-sem-docker-desenvolvimento)
- [Acessar o Swagger](#acessar-o-swagger)
- [Acessar o Frontend](#acessar-o-frontend)
- [Credenciais de exemplo](#credenciais-de-exemplo)
- [Funcionalidades](#funcionalidades)
- [Arquitetura](#arquitetura)
- [Endpoints da API](#endpoints-da-api)

---

## Pré-requisitos

| Com Docker | Sem Docker |
|------------|------------|
| Docker Desktop instalado e rodando | Java 21 + Maven |
| — | Node.js 20+ |

---

## Como executar com Docker (recomendado)

### 1. Clonar o repositório

```bash
git clone https://github.com/seu-usuario/seu-repo.git
cd seu-repo
```

### 2. Subir o Backend

```bash
cd lume-api
docker build -t lume-api .
docker run -p 8080:8080 --name lume-api lume-api
```

### 3. Subir o Frontend

```bash
cd front-react
docker-compose up --build
```

**Pronto!**
- Frontend: http://localhost:5173
- Backend API: http://localhost:8080
- Swagger UI: http://localhost:8080/swagger-ui.html

---

## Como executar sem Docker (desenvolvimento)

### Backend

```bash
cd lume-api
./mvnw spring-boot:run
# Windows:
mvnw.cmd spring-boot:run
```

Backend sobe em `http://localhost:8080`

### Frontend

```bash
cd front-react
npm install
npm run dev
```

Frontend sobe em `http://localhost:5173`

> **Dica:** Para testar o frontend sem backend, acesse `http://localhost:5173?mock=true`

---

## Acessar o Swagger

Com o backend rodando, abra no navegador:

```
http://localhost:8080/swagger-ui.html
```

### Como autenticar no Swagger:

1. Clique em **POST /api/v1/auth/login**
2. Clique em **Try it out**
3. Use o body:
```json
{
  "email": "admin@lume.com",
  "password": "admin123"
}
```
4. Execute — copie o valor de `accessToken`
5. Clique no botão **🔐 Authorize** (topo da página)
6. Cole o token no campo `bearerAuth`: `Bearer <seu_token>`
7. Clique **Authorize** → agora todos os endpoints funcionam

---

## Acessar o Frontend

```
http://localhost:5173
```

Login na tela inicial com as credenciais abaixo.

---

## Credenciais de exemplo

| Tipo | Email | Senha | Permissões |
|------|-------|-------|------------|
| **Admin** | `admin@lume.com` | `admin123` | Criar, editar, excluir clientes e usuários |
| **Usuário** | _(criar via Swagger ou tela de registro)_ | _(sua senha)_ | Somente visualizar clientes |

> O usuário **admin** é criado automaticamente ao subir o backend.

---

## Funcionalidades

### Autenticação & Autorização

| Funcionalidade | Endpoint | Autenticação? |
|----------------|----------|---------------|
| Registrar usuário | `POST /api/v1/auth/register` | Pública |
| Login (JWT) | `POST /api/v1/auth/login` | Pública |
| Renovar access token | `POST /api/v1/auth/refresh` | Pública |
| Logout | `POST /api/v1/auth/logout` | Pública |

### CRUD de Clientes (requer JWT)

| Funcionalidade | Endpoint | Role |
|----------------|----------|------|
| Listar clientes | `GET /api/v1/customers` | Qualquer autenticado |
| Buscar por ID | `GET /api/v1/customers/{id}` | Qualquer autenticado |
| Criar cliente | `POST /api/v1/customers` | Qualquer autenticado |
| Atualizar cliente | `PUT /api/v1/customers/{id}` | Qualquer autenticado |
| Deletar cliente | `DELETE /api/v1/customers/{id}` | Qualquer autenticado |
| Buscar endereço por CEP | `GET /api/v1/customers/address-lookup/{cep}` | Qualquer autenticado |

### RBAC no Frontend

| Ação | Admin (`ROLE_ADMIN`) | Usuário (`ROLE_USER`) |
|------|----------------------|----------------------|
| Visualizar clientes | ✅ | ✅ |
| Criar / editar / excluir clientes | ✅ | ❌ |
| Acessar tela Configurações | ✅ | ❌ |
| Criar / editar / excluir usuários | ✅ | ❌ |
| Menu "Configurações" visível | ✅ | ❌ |

---

## Arquitetura

```
┌─────────────────────────────────────────────────────┐
│                    FRONTEND (React)                  │
│                                                     │
│  LoginPage  →  AuthContext (JWT decode)             │
│  CustomersPage  →  useRbac() → ROLE_ADMIN check     │
│  ConfigPage  →  Apenas ROLE_ADMIN                   │
│  httpClient (Axios) → Bearer token automático       │
│  Refresh token automático em 401                    │
└────────────────────────┬────────────────────────────┘
                         │ HTTP + Bearer JWT
┌────────────────────────▼────────────────────────────┐
│                   BACKEND (Spring Boot)              │
│                                                     │
│  JwtAuthenticationFilter → valida token             │
│  SecurityConfig → rotas públicas / protegidas       │
│  AuthController → /register /login /refresh /logout │
│  CustomerController → CRUD clientes                 │
│  CepService → ViaCEP integration                    │
│  H2 Database (in-memory)                            │
└─────────────────────────────────────────────────────┘
```

### Estrutura do Backend

```
src/main/java/com/lume/lumeapi/
├── config/          # SecurityConfig, BeanConfig, SwaggerConfig
├── controller/      # AuthController, CustomerController
├── domain/
│   ├── dto/
│   │   ├── request/  # AuthRequest, CustomerRequest
│   │   └── response/ # AuthResponse, CustomerResponse
│   └── entity/      # User, Customer, Address, RefreshToken
├── enums/           # Role (ROLE_ADMIN, ROLE_USER)
├── exception/       # GlobalExceptionHandler + exceções
├── integration/cep/ # ViaCepClient, ViaCepResponse
├── repository/      # UserRepository, CustomerRepository, RefreshTokenRepository
├── security/        # JwtService, JwtAuthenticationFilter, UserDetailsServiceImpl
├── service/         # AuthService, CustomerService, TokenService, CepService
└── validation/      # ValidCpf, CpfValidator
```

### Estrutura do Frontend

```
src/
├── api/           # authApi, customersApi, httpClient, mockApi
├── components/
│   ├── layout/    # AppLayout, Drawer
│   ├── ui/        # Button, Alert, Card, Modal, Spinner, ConfirmDialog
│   └── users/     # UserForm, UserTable
├── context/       # AuthContext (decodifica JWT, expõe isAdmin)
├── features/
│   ├── customers/ # useCustomers hook
│   └── users/     # useUsers hook
├── hooks/         # useAuth, useRbac
├── pages/         # LoginPage, RegisterPage, HomePage, CustomersPage, ConfigPage
└── utils/         # logger, storage, cpf, formatters
```

---

## Endpoints da API

### Auth

```
POST /api/v1/auth/register
Body: { "email": "user@email.com", "password": "senha123" }
Response: { "message": "User registered successfully" }

POST /api/v1/auth/login
Body: { "email": "admin@lume.com", "password": "admin123" }
Response: { "accessToken": "eyJ...", "refreshToken": "uuid..." }

POST /api/v1/auth/refresh
Body: { "refreshToken": "uuid..." }
Response: { "accessToken": "eyJ..." }

POST /api/v1/auth/logout
Body: { "refreshToken": "uuid..." }
Response: { "message": "Logged out successfully" }
```

### Customers (requer Authorization: Bearer <token>)

```
GET    /api/v1/customers              → lista todos
GET    /api/v1/customers/{id}         → busca por ID
POST   /api/v1/customers              → cria (CPF validado)
PUT    /api/v1/customers/{id}         → atualiza
DELETE /api/v1/customers/{id}         → remove

GET    /api/v1/customers/address-lookup/{cep}  → busca endereço via ViaCEP
```

### Exemplo de criação de cliente

```bash
curl -X POST http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer SEU_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "João Silva",
    "cpf": "52998224725",
    "address": {
      "street": "Rua das Flores",
      "neighborhood": "Centro",
      "city": "São Paulo",
      "state": "SP",
      "zipCode": "01310100"
    }
  }'
```

---

## Detalhes Técnicos

### JWT

- **Access Token**: válido por 15 minutos
- **Refresh Token**: válido por 7 dias, invalidado no logout
- Claims: `{ sub: email, role: "ROLE_ADMIN"|"ROLE_USER", iat, exp }`

### Banco de Dados (H2)

- In-memory, zerado a cada restart
- Console: http://localhost:8080/h2-console
  - JDBC URL: `jdbc:h2:mem:lumedb`
  - User: `sa` / Senha: _(vazio)_

### Validações

- **CPF**: validação de formato + dígito verificador (anotação `@ValidCpf`)
- **Email**: formato válido obrigatório
- **Senha**: mínimo 6 caracteres
- **Endereço**: todos os campos obrigatórios

### Integração ViaCEP

O endpoint `GET /api/v1/customers/address-lookup/{cep}` consome `https://viacep.com.br/ws/{cep}/json/`
e retorna logradouro, bairro, cidade e estado automaticamente.

---

## Troubleshooting

### Docker: "no such host" ao fazer build

Configure o DNS no Docker Desktop → Settings → Docker Engine:
```json
{
  "dns": ["8.8.8.8", "8.8.4.4"]
}
```

### Frontend: CORS error

Certifique-se que o backend está rodando em `http://localhost:8080`.
O `VITE_API_BASE_URL` no `.env` deve apontar para o backend.

### Frontend sem backend

Adicione `?mock=true` na URL para usar dados mockados:
```
http://localhost:5173?mock=true
```
