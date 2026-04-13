# 🔴 Erros de Compilação do Backend

## 📋 Resumo dos Problemas

O backend tem **erros de compilação Java** que impedem o build Docker. Segue lista de correções necessárias:

---

## 🔧 Correções Necessárias

### **1️⃣ Problema: CorsConfiguration - Nome do arquivo**

```
❌ [ERROR] class CorsConfig is public, should be declared in a file named CorsConfig.java
   at CorsConfiguration.java:12
```

**Solução:**
- Renomeie o arquivo de `CorsConfiguration.java` para `CorsConfig.java`
- OU mude a classe de `CorsConfig` para `CorsConfiguration`

---

### **2️⃣ Problema: Faltam Annotations Lombok**

```
❌ cannot find symbol: method builder()
❌ cannot find symbol: method getPassword()
❌ cannot find symbol: method getId()
```

**Classes Afetadas:**
- `User.java` - falta `@Builder`, `@Getter`, `@Setter`
- `Customer.java` - falta `@Builder`, `@Getter`, `@Setter`
- `Address.java` - falta `@Builder`, `@Getter`, `@Setter`
- `RefreshToken.java` - falta `@Builder`, `@Getter`, `@Setter`

**Solução:**
Adicione em cada classe Entity:

```java
@Data                    // getter, setter, equals, hashCode, toString
@Builder                 // padrão builder
@NoArgsConstructor       // construtor vazio
@AllArgsConstructor      // construtor com todos os campos
@Entity
@Table(name = "users")
public class User implements UserDetails {
    // ... seu código
}
```

---

### **3️⃣ Problema: Falta @Slf4j (Logger)**

```
❌ cannot find symbol: variable log
```

**Classes Afetadas:**
- `DataInitializer.java`
- `JwtService.java`

**Solução:**
Adicione acima da classe:

```java
@Slf4j  // Lombok - cria automaticamente private static final Logger log
public class DataInitializer {
    // Agora pode usar: log.info("mensagem");
}
```

---

### **4️⃣ Problema: User não implementa UserDetails corretamente**

```
❌ User is not abstract and does not override abstract method getPassword()
   in org.springframework.security.core.userdetails.UserDetails
```

**Solução:**
Sua classe `User` implementa `UserDetails` mas não tem todos os métodos necessários.

Adicione:

```java
@Data
@Entity
public class User implements UserDetails {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    
    private String email;
    private String password;
    private boolean enabled = true;
    
    // Implementar métodos abstratos de UserDetails
    @Override
    public Collection<? extends GrantedAuthority> getAuthorities() {
        return Collections.emptyList();
    }

    @Override
    public String getPassword() {
        return this.password;
    }

    @Override
    public String getUsername() {
        return this.email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return this.enabled;
    }
}
```

---

## ✅ Checklist de Correções

- [ ] Renomeie `CorsConfiguration.java` → `CorsConfig.java`
- [ ] Adicione `@Data @Builder @NoArgsConstructor @AllArgsConstructor` em `User.java`
- [ ] Adicione `@Data @Builder @NoArgsConstructor @AllArgsConstructor` em `Customer.java`
- [ ] Adicione `@Data @Builder @NoArgsConstructor @AllArgsConstructor` em `Address.java`
- [ ] Adicione `@Data @Builder @NoArgsConstructor @AllArgsConstructor` em `RefreshToken.java`
- [ ] Adicione `@Slf4j` em `DataInitializer.java`
- [ ] Adicione `@Slf4j` em `JwtService.java`
- [ ] Implemente todos os métodos de `UserDetails` em `User.java`
- [ ] Teste compilação local: `mvn clean package`
- [ ] Teste Docker build novamente

---

## 🚀 Enquanto Isso...

O frontend está testando ok! O docker-compose.yml foi atualizado para:
✅ Desabilitar o build do backend por enquanto
✅ Concentrar no teste do frontend

**Para voltar a incluir o backend:**
1. Corrija todos os erros acima no código Java
2. Descomente a seção `lume-api` no `docker-compose.yml`
3. Execute `docker-compose up --build` novamente

---

## 📝 Dependências Necessárias (pom.xml)

Garanta que tem isto no seu pom.xml:

```xml
<!-- Lombok -->
<dependency>
    <groupId>org.projectlombok</groupId>
    <artifactId>lombok</artifactId>
    <optional>true</optional>
</dependency>

<!-- Spring Security -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-security</artifactId>
</dependency>

<!-- Spring Data JPA -->
<dependency>
    <groupId>org.springframework.boot</groupId>
    <artifactId>spring-boot-starter-data-jpa</artifactId>
</dependency>
```
