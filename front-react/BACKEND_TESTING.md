# Backend Testing Guide

Guia para testar a integração com o backend real usando cURL.

## ✅ Pré-requisitos

1. Backend rodando em `http://localhost:8080`
2. Frontend rodando em `http://localhost:5173`
3. Terminal com cURL instalado

## 🔑 1. Teste de Login

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "admin@lume.com",
    "password": "admin123"
  }'
```

### Response esperada (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "7b22acb1-3ed4-4204-8242-66ba36f15a11"
}
```

**Guarde o `accessToken` para os próximos testes.**

## 📋 2. Listar Clientes

### Request
```bash
curl -X GET http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

Substitua `YOUR_ACCESS_TOKEN` pelo token obtido no passo anterior.

### Response esperada (200 OK)
```json
[
  {
    "id": 1,
    "name": "Cliente 1",
    "email": "cliente1@example.com",
    "phone": "(11) 98765-4321",
    "cpf": "12345678901",
    "zipCode": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "city": "São Paulo",
    "state": "SP",
    "createdAt": "2026-04-10T18:59:49Z",
    "updatedAt": "2026-04-10T18:59:49Z"
  }
]
```

## ➕ 3. Criar Cliente

### Request
```bash
curl -X POST http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Novo Cliente",
    "email": "novo@example.com",
    "phone": "(11) 98765-1234",
    "cpf": "12345678901",
    "zipCode": "01310-100",
    "street": "Avenida Paulista",
    "number": "1000",
    "city": "São Paulo",
    "state": "SP",
    "complement": "Apto 1000"
  }'
```

### Response esperada (201 Created)
```json
{
  "id": 2,
  "name": "Novo Cliente",
  "email": "novo@example.com",
  "phone": "(11) 98765-1234",
  "cpf": "12345678901",
  "zipCode": "01310-100",
  "street": "Avenida Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "complement": "Apto 1000",
  "createdAt": "2026-04-10T19:00:00Z",
  "updatedAt": "2026-04-10T19:00:00Z"
}
```

## 🔍 4. Buscar Cliente por ID

### Request
```bash
curl -X GET http://localhost:8080/api/v1/customers/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Response esperada (200 OK)
```json
{
  "id": 1,
  "name": "Cliente 1",
  "email": "cliente1@example.com",
  "phone": "(11) 98765-4321",
  "cpf": "12345678901",
  "zipCode": "01310-100",
  "street": "Avenida Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "createdAt": "2026-04-10T18:59:49Z",
  "updatedAt": "2026-04-10T18:59:49Z"
}
```

## ✏️ 5. Atualizar Cliente

### Request
```bash
curl -X PUT http://localhost:8080/api/v1/customers/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Cliente 1 Atualizado",
    "email": "cliente1updated@example.com",
    "phone": "(11) 98765-0000"
  }'
```

### Response esperada (200 OK)
```json
{
  "id": 1,
  "name": "Cliente 1 Atualizado",
  "email": "cliente1updated@example.com",
  "phone": "(11) 98765-0000",
  "cpf": "12345678901",
  "zipCode": "01310-100",
  "street": "Avenida Paulista",
  "number": "1000",
  "city": "São Paulo",
  "state": "SP",
  "createdAt": "2026-04-10T18:59:49Z",
  "updatedAt": "2026-04-10T19:00:00Z"
}
```

## 🗑️ 6. Deletar Cliente

### Request
```bash
curl -X DELETE http://localhost:8080/api/v1/customers/1 \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Response esperada (204 No Content)
Sem conteúdo

Ou em alguns backends:
```json
{
  "message": "Cliente excluído com sucesso"
}
```

## 🏠 7. Buscar Endereço por CEP

### Request
```bash
curl -X GET "http://localhost:8080/api/v1/customers/address-lookup/01310-100" \
  -H "Authorization: Bearer YOUR_ACCESS_TOKEN" \
  -H "Content-Type: application/json"
```

### Response esperada (200 OK)
```json
{
  "street": "Avenida Paulista",
  "city": "São Paulo",
  "state": "SP",
  "neighborhood": "Bela Vista",
  "number": "1000"
}
```

## 🔄 8. Refresh Token

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

Substitua `YOUR_REFRESH_TOKEN` pelo token obtido no login.

### Response esperada (200 OK)
```json
{
  "accessToken": "eyJhbGciOiJIUzUxMiJ9...",
  "refreshToken": "7b22acb1-3ed4-4204-8242-66ba36f15a11"
}
```

## 🚪 9. Logout

### Request
```bash
curl -X POST http://localhost:8080/api/v1/auth/logout \
  -H "Content-Type: application/json" \
  -d '{
    "refreshToken": "YOUR_REFRESH_TOKEN"
  }'
```

### Response esperada (200 OK)
```json
{
  "message": "Logout realizado com sucesso"
}
```

## 📊 API Docs

Acesse a documentação interativa do Swagger:
```
http://localhost:8080/swagger-ui.html
```

Ou obtenha a spec em JSON:
```bash
curl http://localhost:8080/v3/api-docs | jq .
```

## 🎯 Fluxo Completo de Teste

```bash
# 1. Login
TOKEN=$(curl -s -X POST http://localhost:8080/api/v1/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lume.com","password":"admin123"}' | jq -r '.accessToken')

echo "Access Token: $TOKEN"

# 2. Listar clientes
curl -X GET http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" | jq .

# 3. Criar cliente
curl -X POST http://localhost:8080/api/v1/customers \
  -H "Authorization: Bearer $TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Teste",
    "email": "teste@example.com",
    "phone": "(11) 98765-1234",
    "cpf": "12345678901",
    "zipCode": "01310-100",
    "street": "Rua Teste",
    "number": "123",
    "city": "São Paulo",
    "state": "SP"
  }' | jq .
```

## 🐛 Troubleshooting

### 401 Unauthorized
- Verifique se o token é válido
- Verifique se o token não expirou
- Verifique se o header Authorization está correto: `Bearer TOKEN`

### CORS Error
- Certifique-se que o backend tem CORS configurado
- Verifique se a URL está correta

### 404 Not Found
- Verifique se o endpoint está correto
- Verifique se o ID do cliente existe
- Consulte o Swagger para ver todos os endpoints

### 500 Internal Server Error
- Verifique os logs do backend
- Verifique se o banco de dados está conectado

## 💡 Dicas

1. Use `jq` para formatar respostas: `curl ... | jq .`
2. Salve o token em variável: `TOKEN=$(curl ... | jq -r '.accessToken')`
3. Use `-v` para ver headers: `curl -v ...`
4. Use `-i` para ver status code: `curl -i ...`
