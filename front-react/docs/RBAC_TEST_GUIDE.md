# 🧪 Guia de Testes RBAC

## 📋 Pré-requisitos

- ✅ Backend rodando na porta 8000 (ou configurado no `.env`)
- ✅ Frontend rodando na porta 5173 (Vite)
- ✅ Usuários criados no banco:
  - `admin@lume.com` com role `ROLE_ADMIN`
  - `user@lume.com` com role `ROLE_USER`

## 🚀 Iniciando testes

### 1. Inicie o Frontend

```bash
cd c:\Users\lucas\IdeaProjects\front-react
npm run dev
```

Acesse: http://localhost:5173

### 2. Teste #1: Login como Admin

#### Ação:
```
1. Clique em "Login"
2. Email: admin@lume.com
3. Password: Senha do admin
4. Clique em "Entrar"
```

#### Resultado Esperado:
```
✅ Redirect para /home com sucesso
✅ Drawer mostra:
   - 🏠 Home
   - 👥 Clientes
   - ⚙️ Configurações (Visível!)
✅ Pode clicar em "Configurações"
✅ Console mostra:
   - "✅ Acesso permitido - renderizando página"
   - user.role: "ROLE_ADMIN"
   - user.isAdmin: true
```

#### Teste o Console:
```javascript
// Abra DevTools (F12) → Console
const { user } = useAuth()
console.log(user)
// Output:
// {
//   email: "admin@lume.com",
//   role: "ROLE_ADMIN",
//   isAdmin: true
// }
```

### 3. Teste #2: Acessar Configurações (Admin)

#### Ação:
```
1. Como admin, clique em "⚙️ Configurações"
2. Próximo passo: vá para /config
```

#### Resultado Esperado:
```
✅ Página carrega com sucesso
✅ Mostra:
   - Título: "Gerenciamento de Usuários 👥"
   - Botão "➕ Novo Usuário" (Visível!)
   - Tabela de usuários com colunas:
     * Nome Completo
     * Email
     * Função
     * Ações (✏️ Editar, 🗑️ Deletar) ← Botões visíveis!
```

#### Debug no Console:
```javascript
const { can } = useRbac()
console.log(can.manageUsers)        // true
console.log(can.createUser)         // true
console.log(can.deleteUser)         // true
```

### 4. Teste #3: Criar Novo Usuário (Admin)

#### Ação:
```
1. Na página /config, clique "➕ Novo Usuário"
2. Preencha:
   - Nome: "Teste User"
   - Email: "teste@lume.com"
   - Senha: "Password123!"
   - Função: "ROLE_USER"
3. Clique "Salvar"
```

#### Resultado Esperado:
```
✅ Sucesso! Mostra: "Usuário criado com sucesso"
✅ Novo usuário aparece na tabela
✅ Console mostra:
   - POST /api/v1/users
   - Status 201
   - responseData contém novo usuário com ID
```

#### Se der erro:
```
❌ 403 Forbidden? 
   → Verifique se token é válido no backend
   
❌ Email já existe?
   → Use um email diferente
   
❌ 400 Bad Request?
   → Verifique validação frontend (campos obrigatórios)
```

### 5. Teste #4: Logout e Login como Usuário Normal

#### Ação:
```
1. Clique "Sair" (Logout)
2. Clique "Login"
3. Email: user@lume.com
4. Password: Senha do user
5. Clique "Entrar"
```

#### Resultado Esperado:
```
✅ Redirect para /home com sucesso
✅ Drawer mostra:
   - 🏠 Home
   - 👥 Clientes
   - ❌ Configurações (Oculto!)
✅ Console mostra:
   - user.role: "ROLE_USER"
   - user.isAdmin: false
```

### 6. Teste #5: Tentar Acessar /config como Usuário Normal

#### Ação:
```
1. Como user, digite na barra de endereço:
   http://localhost:5173/config
2. Pressione Enter
```

#### Resultado Esperado:
```
❌ Acesso Bloqueado!
✅ Redirect automático para /home
✅ Console mostra:
   - "🚫 Acesso negado - permissão insuficiente (RBAC)"
   - "userRole: ROLE_USER"
   - "requiredRoles: ["ROLE_ADMIN"]"
```

### 7. Teste #6: Tentar Criar Cliente como Usuário Normal

#### Ação:
```
1. Como user, clique em "👥 Clientes"
2. Procure pelo botão "➕ Adicionar Cliente"
```

#### Resultado Esperado:
```
✅ Página de clientes carrega
✅ NÃO aparece botão "➕ Adicionar Cliente"
✅ Na tabela, coluna "Ações" (✏️🗑️) não aparece
❌ Se tentar editar/deletar via console:
   - Buttons não ficam clicáveis
   - handleDelete() retorna cedo
   - Console mostra warning
```

#### Debug no Console:
```javascript
const { can } = useRbac()
console.log(can.createCustomer)     // false
console.log(can.editCustomer)       // false
console.log(can.deleteCustomer)     // false
```

### 8. Teste #7: Criar Cliente como Admin

#### Ação:
```
1. Faça login como admin
2. Clique em "👥 Clientes"
3. Clique "➕ Adicionar Cliente"
4. Preencha:
   - Nome: "João Silva"
   - CPF: "12345678900"
   - CEP: "12345678"
   - (preench outros campos)
5. Clique "Cadastrar"
```

#### Resultado Esperado:
```
✅ Sucesso! Mostra: "Cliente cadastrado com sucesso"
✅ Novo cliente aparece na tabela
✅ Tabela mostra coluna "Ações" com ✏️🗑️
✅ Console mostra:
   - POST /api/v1/customers
   - Status 201
```

### 9. Teste #8: Editar Cliente como Admin

#### Ação:
```
1. Na tabela de clientes, clique no botão ✏️ (editar)
2. Modifique o nome: "João Silva da Silva"
3. Clique "Salvar"
```

#### Resultado Esperado:
```
✅ Sucesso! Cliente atualizado
✅ Tabela refetch com dados novos
✅ Console mostra:
   - PUT /api/v1/customers/{id}
   - Status 200
```

### 10. Teste #9: Deletar Cliente como Admin

#### Ação:
```
1. Na tabela de clientes, clique no botão 🗑️ (deletar)
2. Confirme a exclusão no diálogo
```

#### Resultado Esperado:
```
✅ Sucesso! Cliente deletado
✅ Cliente desaparece da tabela
✅ Console mostra:
   - DELETE /api/v1/customers/{id}
   - Status 204 ou 200
```

## 🔍 Verificações de Log

Abra DevTools (F12) → Console e procure por estes logs:

### Quando Login funciona:
```
✅ Acesso permitido - renderizando página
   rota: /home
   userRole: ROLE_ADMIN
```

### Quando Acesso é Negado:
```
🚫 Acesso negado - permissão insuficiente (RBAC)
   rota: /config
   userRole: ROLE_USER
   requiredRoles: ["ROLE_ADMIN"]
```

### Quando Click é Bloqueado:
```
🚫 Acesso negado - usuário não é admin, tentou criar cliente
```

## 📊 Checklist de Testes Completo

### Como Admin
- [ ] Login bem-sucedido
- [ ] Dashboard mostra todos os menus
- [ ] Pode acessar /config
- [ ] Pode criar usuário
- [ ] Pode editar usuário
- [ ] Pode deletar usuário
- [ ] Pode criar cliente
- [ ] Pode editar cliente
- [ ] Pode deletar cliente
- [ ] Console mostra isAdmin: true

### Como Usuário Normal
- [ ] Login bem-sucedido
- [ ] Dashboard mostra Home + Clientes (sem Config)
- [ ] NÃO pode acessar /config (redirect automático)
- [ ] NÃO vê botão "Novo Usuário"
- [ ] NÃO vê botão "Adicionar Cliente"
- [ ] NÃO vê coluna "Ações" nas tabelas
- [ ] Console mostra isAdmin: false

### Testes de Segurança
- [ ] Backend rejeita requests sem token válido (401)
- [ ] Backend rejeita requests de user normal em endpoints admin (403)
- [ ] Frontend valida antes de enviar (UX)
- [ ] Backend valida (segurança real)

## 🐛 Troubleshooting

### Problema: "Erro ao fazer login"
```
❌ Solução:
   1. Verifique credenciais (email/senha corretos)
   2. Verifique se backend está rodando
   3. Verifique se user existe no banco de dados
   4. Verificque CORS no backend
```

### Problema: Botões aparecem mas não funcionam
```
❌ Solução:
   1. Verifique no console se há warnings de RBAC
   2. Verifique se isAdmin está correto
   3. Faça logout e login novamente
   4. Limpe localStorage: localStorage.clear()
```

### Problema: "403 Forbidden" ao criar usuário
```
❌ Solução:
   1. Verifique se é admin (user.role === "ROLE_ADMIN")
   2. Verifique se token não expirou
   3. Regenere token fazendo logout/login
   4. Verifique no backend a validação de roles
```

### Problema: Menu não mostra "Configurações"
```
❌ Solução:
   1. Verifique no console: user.isAdmin
   2. Se false, faça nuevo login como admin
   3. Verifique token no localStorage
   4. Use: localStorage.getItem('accessToken')
```

## 🎬 Vídeo de Teste (Passo a Passo)

### Parte 1: Setup
1. Inicie backend (docker-compose ou aplicação)
2. Inicie frontend (npm run dev)
3. Abra DevTools (F12)

### Parte 2: Admin
1. Login como admin@lume.com
2. Vá para /config
3. Crie novo usuário
4. Vá para /customers
5. Crie novo cliente
6. Edit e Delete cliente

### Parte 3: User
1. Logout
2. Login como user@lume.com
3. Tente acessar /config (deve bloquear)
4. Vá para /customers (sem botões de ação)
5. Veja que menu não tem "Configurações"

### Parte 4: Verificação
1. Abra console
2. Execute: const { user } = useAuth(); console.log(user)
3. Verifique role e isAdmin

---

**Tempo Total de Testes**: ~30 minutos
**Sucesso**: ✅ Se todos os testes passarem, RBAC está funcionando!
