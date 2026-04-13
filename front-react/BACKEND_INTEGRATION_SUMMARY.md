# Ajustes para Backend Real - Sumário 

## 📋 O que foi ajustado

Todo o frontend foi configurado para trabalhar com o backend real (Lume API) em `http://localhost:8080`.

## 📁 Arquivos Modificados

### 1. **.env** (NOVO)
- Base URL: `VITE_API_BASE_URL=http://localhost:8080`
- Importado automaticamente pelo Vite

### 2. **.env.example** (NOVO)
- Documentação das variáveis de ambiente
- Explicação de cada variável

### 3. **README.md** (ATUALIZADO)
- Instruções para usar o backend real
- Referência ao BACKEND_INTEGRATION.md
- Credenciais de teste

### 4. **src/api/httpClient.js** (ATUALIZADO)
- Comentários explicando authentication flow
- Bearer token adicionado automaticamente
- Refresh token com fila para evitar race conditions
- Logging detalhado

### 5. **src/api/authApi.js** (ATUALIZADO)
- Documentação dos endpoints esperados
- JWT structure esperada
- Comentários em cada função explicando requisições/respostas

### 6. **src/api/customersApi.js** (ATUALIZADO)
- Documentação dos endpoints CRUD
- Customer model esperada
- Comentários explicando cada operação

### 7. **src/context/AuthContext.jsx** (ATUALIZADO)
- Ajustado decodeToken para trabalhar com JWT real
- Extrai `sub` (email) do payload
- Fallback para 'user' como role padrão
- Comentários explicando estrutura do token

### 8. **BACKEND_INTEGRATION.md** (NOVO)
- Documentação completa da integração
- Endpoints disponíveis
- Fluxo de autenticação
- Estrutura de JWT
- Troubleshooting

### 9. **BACKEND_TESTING.md** (NOVO)
- Guia de testes com cURL
- Exemplos para cada endpoint
- Respostas esperadas
- Fluxo completo de teste

## 🔗 Endpoints Configurados

### Autenticação (`/api/v1/auth/`)
- `POST /login` - Login com email/password
- `POST /register` - Registrar novo usuário
- `POST /refresh` - Renovar access token
- `POST /logout` - Fazer logout

### Clientes (`/api/v1/customers/`)
- `GET /` - Listar todos
- `POST /` - Criar novo
- `GET /{id}` - Buscar por ID
- `PUT /{id}` - Atualizar
- `DELETE /{id}` - Deletar
- `GET /address-lookup/{zipCode}` - Buscar endereço

## 🔐 Autenticação

### Request
Todos os endpoints (exceto `/auth/login` e `/auth/register`) requerem:
```
Authorization: Bearer <accessToken>
```

### Response do Login
```json
{
  "accessToken": "string",
  "refreshToken": "string"
}
```

### JWT Structure (accessToken)
```json
{
  "sub": "email@example.com",
  "iat": 1775847589,
  "exp": 1775848489,
  "role": "admin"  // opcional
}
```

## 🚀 Como Usar

### 1. Iniciar Backend
```bash
# Certifique-se que está rodando em http://localhost:8080
curl http://localhost:8080/v3/api-docs
```

### 2. Iniciar Frontend
```bash
npm install
npm run dev
```

Frontend disponível em `http://localhost:5173`

### 3. Testar Login
Abra o app em `http://localhost:5173` e use:
- Email: `admin@lume.com`
- Senha: `admin123`

### 4. Testar API via cURL
Ver [BACKEND_TESTING.md](./BACKEND_TESTING.md) para exemplos completos.

## ✅ Verificação

### Modo Mock (offline)
```
http://localhost:5173?mock=true
```

### Com Backend Real
```
http://localhost:5173
```

O frontend automaticamente:
- ✅ Detecta credenciais válidas
- ✅ Armazena tokens no localStorage
- ✅ Adiciona Bearer token em requisições
- ✅ Trata erros 401 com refresh automático
- ✅ Redireciona para login se token expirar
- ✅ Registra logs detalhados de requisições

## 📚 Documentação Completa

- **[README.md](./README.md)** - Overview do projeto
- **[BACKEND_INTEGRATION.md](./BACKEND_INTEGRATION.md)** - Guia de integração completo
- **[BACKEND_TESTING.md](./BACKEND_TESTING.md)** - Exemplos de teste com cURL
- **[docs/INDEX.md](./docs/INDEX.md)** - Navegação por roles (user/admin)

## 🔧 Variáveis de Ambiente

```env
# Backend URL (padrão: http://localhost:8080)
VITE_API_BASE_URL=http://localhost:8080

# Modo Mock (adicionar na URL: ?mock=true)
```

## 🎯 Próximas Etapas

1. ✅ Frontend configurado para backend real
2. ⏳ Backend deve implementar RBAC (roles no JWT)
3. ⏳ Testes full-stack (frontend + backend)
4. ⏳ Deployment

## 📞 Contato com Backend

Backend Team deve:
1. Implementar os endpoints conforme especificado
2. Adicionar `role` claim ao JWT (opcional mas recomendado)
3. Configurar CORS para `http://localhost:5173` (dev)
4. Implementar validação de CPF (opcional)
5. Implementar address lookup via ViaCEP ou similar

## ✨ Checklist

- [x] .env configurado
- [x] Base URL correta
- [x] Endpoints documentados
- [x] Autenticação JWT implementada
- [x] Refresh token implementado
- [x] Logging de requisições
- [x] CORS configurado
- [x] Guias de teste criados
- [x] Documentação completa
- [ ] Backend implementado
- [ ] Testes de integração
