# 🐳 Docker Setup - Lume Application

## 📋 Arquivos Criados

```
front-react/
├── Dockerfile              # Build do frontend React
├── nginx.conf             # Config nginx para servir a app
├── docker-compose.yml     # Orquestração de containers
├── .dockerignore           # Arquivos ignorados no build
└── .env.docker            # Variáveis de ambiente Docker
```

---

## 🚀 Como Usar

### **1️⃣ Estrutura de Diretórios Esperada**

```
IdeaProjects/
├── lume-api/              # Seu backend Spring Boot
│   ├── Dockerfile
│   ├── pom.xml
│   └── ...
└── front-react/           # Seu frontend React
    ├── Dockerfile
    ├── docker-compose.yml
    └── ...
```

### **2️⃣ Iniciar Tudo com Docker Compose**

```bash
cd front-react/
docker-compose up --build
```

**Isso vai:**
- ✅ Compilar o backend Spring Boot
- ✅ Compilar o frontend React
- ✅ Iniciar ambos os containers
- ✅ Configurar networking entre eles

---

## 🌐 Acessar os Serviços

| Serviço | URL | Container |
|---------|-----|-----------|
| **Frontend** | http://localhost:5173 | lume-frontend |
| **Backend** | http://localhost:8080 | lume-api |
| **Swagger** | http://localhost:8080/swagger-ui.html | lume-api |

---

## ⚙️ Configurações Importantes

### **Frontend - Dockerfile**
- **Node 20**: Build rápido e leve
- **Nginx**: Serve arquivos estáticos
- **Multi-stage**: Reduz tamanho final da imagem

### **Backend - Dockerfile**
- **Eclipse Temurin JDK 21**: Compilação
- **Eclipse Temurin JRE 21**: Runtime leve
- **Multi-stage**: Reduz tamanho final

### **Networking**
- Networks permite containers se comunicarem
- Frontend acessa Backend via `http://lume-api:8080`
- DNS resolve automaticamente

### **Health Check**
- Backend tem health check
- Frontend aguarda backend estar saudável
- Evita problemas de inicialização

---

## 🛑 Parar os Containers

```bash
docker-compose down
```

## 🔄 Reconstruir Imagens

```bash
docker-compose up --build --force-recreate
```

## 📊 Ver Logs

```bash
# Todos os serviços
docker-compose logs -f

# Apenas frontend
docker-compose logs -f lume-frontend

# Apenas backend
docker-compose logs -f lume-api
```

---

## 🔐 Variáveis de Ambiente

### **Frontend (.env.docker)**
```env
VITE_API_BASE_URL=http://lume-api:8080
```

### **Backend (docker-compose.yml)**
```yaml
environment:
  SPRING_PROFILES_ACTIVE: docker
  SERVER_PORT: 8080
```

---

## ✅ Checklist de Configuração

- [ ] Dockerfile do backend criado
- [ ] Dockerfile do frontend criado
- [ ] docker-compose.yml no diretório front-react
- [ ] Paths dos contextos estão corretos
- [ ] .dockerignore criado
- [ ] CORS configurado no backend
- [ ] Variáveis de ambiente configuradas

---

## 🐛 Troubleshooting

### **Backend não inicia**
```bash
docker-compose logs -f lume-api
# Verifica logs de erro
```

### **Frontend não conecta ao backend**
```bash
# Verificar se está usando http://lume-api:8080
# (não http://localhost:8080 dentro do container)
```

### **Porta 8080 ou 5173 já em uso**
```yaml
# Edite docker-compose.yml
ports:
  - "8081:8080"  # Mude a porta externa
```

### **Limpar tudo e começar do zero**
```bash
docker-compose down -v
docker system prune -a
docker-compose up --build
```

---

## 📝 Próximos Passos

1. Coloque o `docker-compose.yml` em um diretório pai comum
2. Configure CORS no backend Spring
3. Teste: `docker-compose up`
4. Acesse http://localhost:5173
