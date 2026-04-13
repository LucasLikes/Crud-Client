# Lume Frontend (React)

Frontend em React para autenticacao JWT e CRUD de clientes consumindo a Lume API.

## Funcionalidades implementadas

- Login com `email` e `password`
- Armazenamento de `accessToken` e `refreshToken`
- Renovacao automatica do `accessToken` ao receber `401`
- Logout com invalidacao de refresh token no backend
- Rotas protegidas para usuarios autenticados
- CRUD completo de clientes
- Busca de endereco por CEP (endpoint `address-lookup`)
- Validacao de CPF com digito verificador

## Tecnologias

- React 19 + Vite
- React Router
- Axios (com interceptor para refresh token)

## Como executar

### 1) Backend

Suba sua API Spring Boot na porta `8080`:

- Swagger: `http://localhost:8080/swagger-ui.html`
- API docs: `http://localhost:8080/v3/api-docs`

### 2) Frontend

```bash
npm install
cp .env.example .env
npm run dev
```

Frontend disponivel em `http://localhost:5173`.

## Configuracao de ambiente

Arquivo `.env`:

```env
VITE_API_BASE_URL=http://localhost:8080
```

## Credenciais de exemplo

- Email: `admin@lume.com`
- Senha: `admin123`

## Estrutura principal

- `src/context/AuthContext.jsx`: estado de autenticacao da aplicacao
- `src/api/httpClient.js`: Axios com auth header e refresh token
- `src/pages/LoginPage.jsx`: tela de login
- `src/pages/CustomersPage.jsx`: tela protegida de CRUD
- `src/components/CustomerForm.jsx`: formulario com validacao de CPF e CEP

## Scripts

- `npm run dev`: sobe ambiente local
- `npm run build`: gera build de producao
- `npm run preview`: testa build localmente
- `npm run lint`: roda eslint
