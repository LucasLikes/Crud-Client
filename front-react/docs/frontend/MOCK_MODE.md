# 🎭 Modo Mock - Para Testar Fluxo de Telas

## 🚀 Como Ativar

### **Docker - Modo Mock**
```bash
docker-compose up
```

Quando subir, acesse:
```
http://localhost:5173/?mock=true
```

### **Ou Localmente com npm**
```bash
npm run dev
```

Depois acesse:
```
http://localhost:5173/?mock=true
```

---

## 🎯 O Que o Modo Mock Faz

✅ **Login** - Aceita qualquer email/senha e gera token fake
✅ **Listagem de Clientes** - Retorna 3 clientes de exemplo
✅ **CRUD de Clientes** - Cria, atualiza, deleta (localmente)
✅ **Sem Dependência do Backend** - Tudo funciona offline

---

## 📊 Dados de Teste

### **Login**
```
Email: admin@lume.com
Senha: admin123
```
(Qualquer email/senha funciona em modo mock)

### **Clientes de Exemplo**
1. **João Silva** - CPF: 123.456.789-00
2. **Maria Santos** - CPF: 987.654.321-11
3. **Pedro Costa** - CPF: 456.789.123-22

---

## 🔄 Fluxo de Telas

```
1. Login Page
   ↓ (use qualquer email)
2. Customers Page
   ├─ Listagem dos 3 clientes
   ├─ Criar novo cliente
   ├─ Editar cliente
   ├─ Deletar cliente
   └─ Logout
```

---

## 🎪 Indicadores do Modo Mock

No console (F12):

```
🎭 MODO MOCK ATIVADO 🎭
🎭 MOCK API: Login com admin@lume.com
🎭 MOCK API: Listando clientes
```

---

## 🔌 Voltar para API Real

Remova `?mock=true` da URL:
```
http://localhost:5173
```

Vai tentar conectar no backend real em `http://localhost:8080`

---

## 📝 Próximas Ações

1. ✅ Teste o fluxo completo de telas
2. ✅ Verifique se a UI está ok
3. ✅ Corrija erros Java no backend (ver BACKEND_ERRORS.md)
4. ✅ Habilite o backend no docker-compose.yml
5. ✅ Teste tudo funcionando junto
