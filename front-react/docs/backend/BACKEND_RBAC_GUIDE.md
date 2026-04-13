# 📚 Backend Documentation - RBAC & JWT Implementation

## Overview

O frontend agora implementa **RBAC (Role-Based Access Control)** com autenticação baseada em JWT. Este documento descreve o que o backend deve implementar para funcionar corrretamente com o frontend.

---

## 🏗️ Arquitetura RBAC

### User Roles

```
User (Padrão)
  ├─ Acesso: Home, Customers
  ├─ Permissões: Ver, criar, editar clientes
  │
Admin
  ├─ Acesso: Home, Customers, Config
  ├─ Permissões: Tudo, incluindo gerenciar usuários e sistema
```

### Frontend Routes by Role

```
Public:
  /login - Login page

Protected (All authenticated users):
  /home - Dashboard
  /customers - Customer management

Admin-Only (role: 'admin'):
  /config - System configuration
```

---

## 🔐 JWT Token Implementation

### Required JWT Payload

O backend deve retornar um JWT com o seguinte payload:

```json
{
  "sub": "user@example.com",          // Subject - identificação única (email ou UUID)
  "email": "user@example.com",        // Email do usuário
  "role": "user",                     // Role: 'user' ou 'admin'
  "id": "uuid-or-numeric-id",         // ID único do usuário
  "iat": 1716256022,                  // Issued at (timestamp)
  "exp": 1716259622                   // Expiration (3600 segundos = 1 hora)
}
```

### JWT Validation Flow

```
1. Frontend realiza login
2. Backend valida credenciais
3. Backend gera JWT com role no payload
4. Backend retorna { accessToken, refreshToken }
5. Frontend:
   ├─ Salva tokens em localStorage
   ├─ Decodifica JWT (sem validar signature)
   ├─ Extrai { email, role, id }
   ├─ Armazena em state (user)
   └─ Usa role para RBAC (controlar rotas/menus)
```

---

## 🔑 API Endpoints Required

### 1. POST /auth/login

**Request:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "email": "user@example.com",
  "role": "user"
}
```

**Spec:**
- ✅ Validar email + password contra usuarios
- ✅ Incluir `role` no JWT payload
- ✅ AccessToken com TTL de 1 hora (3600s)
- ✅ RefreshToken com TTL de 7 dias (604800s)
- ✅ Retornar erro 401 se credenciais inválidas

---

### 2. POST /auth/refresh

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**Spec:**
- ✅ Validar refreshToken
- ✅ Gerar novo accessToken com role preservado
- ✅ Retornar erro 401 se token inválido/expirado

---

### 3. POST /auth/logout

**Request:**
```json
{
  "refreshToken": "refresh_token_here"
}
```

**Response (200):**
```json
{
  "message": "Logout realizado"
}
```

**Spec:**
- ✅ Revogar refreshToken no banco
- ✅ Retornar sucesso mesmo se token já foi revogado

---

### 4. GET /api/customers (Protected)

**Request Headers:**
```
Authorization: Bearer <accessToken>
```

**Response (200):**
```json
[
  {
    "id": "1",
    "name": "Acme Corp",
    "email": "contact@acme.com",
    "phone": "(11) 98765-4321",
    "address": {
      "city": "São Paulo",
      "state": "SP",
      "zipcode": "01310-100"
    }
  }
]
```

**Spec:**
- ✅ Validar Bearer token
- ✅ Retornar erro 401 se token inválido
- ✅ Retornar erro 403 se sem permissão (opcional - users podem ver todos)

---

### 5. POST /api/customers (Protected)

**Request:**
```json
{
  "name": "Cliente Novo",
  "email": "new@client.com",
  "phone": "(11) 98765-4321",
  "city": "São Paulo"
}
```

**Response (201):**
```json
{
  "id": "123",
  "name": "Cliente Novo",
  "email": "new@client.com",
  "phone": "(11) 98765-4321",
  "address": {
    "city": "São Paulo",
    "state": "SP",
    "zipcode": "01310-100"
  }
}
```

**Spec:**
- ✅ Verificar Bearer token (user ou admin)
- ✅ Validar dados obrigatórios
- ✅ Retornar 201 com cliente criado

---

### 6. PUT /api/customers/:id (Protected)

**Request:**
```json
{
  "name": "Cliente Atualizado",
  "email": "updated@client.com",
  "phone": "(11) 98765-4321",
  "city": "São Paulo"
}
```

**Response (200):**
```json
{
  "id": "123",
  "name": "Cliente Atualizado",
  ...
}
```

**Spec:**
- ✅ Verificar Bearer token
- ✅ Validar que cliente existe
- ✅ Atualizar campos fornecidos

---

### 7. DELETE /api/customers/:id (Protected)

**Response (200 ou 204):**
```json
{ "message": "Cliente removido" }
```

**Spec:**
- ✅ Verificar Bearer token
- ✅ Validar que cliente existe
- ✅ Remover customer
- ✅ Retornar sucesso

---

## 🛡️ RBAC Enforcement (Optional)

### Recomendações para Futuro

Se adicionar permissões mais granulares:

```
User:
  - Pode ver customers
  - Pode criar customers
  - Pode editar seus próprios customers
  - NÃO pode deletar

Admin:
  - Pode fazer tudo
  - Pode gerenciar usuários
  - Pode acessar /config
```

**Implementação:**
1. Backend valida `role` em Bearer token
2. Backend retorna 403 se permissão insuficiente
3. Frontend já redireciona com ProtectedRoute + requiredRoles

---

## 🗄️ Database Schema (Java Backend)

### User Entity

```java
@Entity
@Table(name = "users")
public class User {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(unique = true, nullable = false)
  private String email;

  @Column(nullable = false)
  private String passwordHash; // Use BCrypt!

  @Enumerated(EnumType.STRING)
  @Column(nullable = false)
  private UserRole role; // ADMIN, USER

  @Column(nullable = false)
  private LocalDateTime createdAt;

  @Column(nullable = false)
  private LocalDateTime updatedAt;

  @OneToMany(mappedBy = "user")
  private List<RefreshToken> refreshTokens;
}

public enum UserRole {
  USER,
  ADMIN
}
```

### RefreshToken Entity

```java
@Entity
@Table(name = "refresh_tokens")
public class RefreshToken {
  @Id
  @GeneratedValue(strategy = GenerationType.UUID)
  private String id;

  @Column(unique = true, nullable = false)
  private String token;

  @ManyToOne
  @JoinColumn(name = "user_id")
  private User user;

  @Column(nullable = false)
  private LocalDateTime expiresAt;

  @Column(nullable = false)
  private LocalDateTime createdAt;
}
```

---

## 🔧 Spring Security Configuration

```java
@Configuration
@EnableWebSecurity
public class SecurityConfig {

  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .csrf().disable() // Para desenvolvimento (habilitar em produção)
      .cors().and()
      .authorizeRequests()
        // Public endpoints
        .antMatchers("/auth/login", "/auth/register").permitAll()
        // Protected endpoints
        .antMatchers("/api/**").authenticated()
        .anyRequest().authenticated()
      .and()
      .sessionManagement()
        .sessionCreationPolicy(SessionCreationPolicy.STATELESS)
      .and()
      .addFilterBefore(jwtAuthenticationFilter(), UsernamePasswordAuthenticationFilter.class);
    
    return http.build();
  }

  @Bean
  public JwtAuthenticationFilter jwtAuthenticationFilter() {
    return new JwtAuthenticationFilter();
  }
}
```

### JWT Filter Implementation

```java
public class JwtAuthenticationFilter extends OncePerRequestFilter {
  
  @Override
  protected void doFilterInternal(HttpServletRequest request, 
                                 HttpServletResponse response, 
                                 FilterChain filterChain) throws ServletException, IOException {
    try {
      String token = extractTokenFromRequest(request);
      
      if (token != null && tokenProvider.validateToken(token)) {
        String email = tokenProvider.getEmailFromToken(token);
        String role = tokenProvider.getRoleFromToken(token); // Extract role
        
        // Criar authentication com role como authority
        UserDetails userDetails = userDetailsService.loadUserByUsername(email);
        Authentication auth = new UsernamePasswordAuthenticationToken(
          userDetails, null, userDetails.getAuthorities()
        );
        SecurityContextHolder.getContext().setAuthentication(auth);
      }
    } catch (Exception e) {
      logger.error("Erro ao processar JWT", e);
    }
    
    filterChain.doFilter(request, response);
  }

  private String extractTokenFromRequest(HttpServletRequest request) {
    String bearerToken = request.getHeader("Authorization");
    if (bearerToken != null && bearerToken.startsWith("Bearer ")) {
      return bearerToken.substring(7);
    }
    return null;
  }
}
```

### Token Provider

```java
@Component
public class JwtTokenProvider {
  
  @Value("${jwt.secret:your-secret-key-here}")
  private String jwtSecret;
  
  @Value("${jwt.expiration:3600}") // 1 hour
  private long jwtExpiration;

  public String generateToken(User user) {
    return Jwts.builder()
      .setSubject(user.getEmail())
      .claim("email", user.getEmail())
      .claim("role", user.getRole().name()) // Add role claim
      .claim("id", user.getId())
      .setIssuedAt(new Date())
      .setExpiration(new Date(System.currentTimeMillis() + jwtExpiration * 1000))
      .signWith(SignatureAlgorithm.HS512, jwtSecret)
      .compact();
  }

  public String getEmailFromToken(String token) {
    return Jwts.parser()
      .setSigningKey(jwtSecret)
      .parseClaimsJws(token)
      .getBody()
      .get("email", String.class);
  }

  public String getRoleFromToken(String token) {
    return Jwts.parser()
      .setSigningKey(jwtSecret)
      .parseClaimsJws(token)
      .getBody()
      .get("role", String.class);
  }

  public boolean validateToken(String token) {
    try {
      Jwts.parser().setSigningKey(jwtSecret).parseClaimsJws(token);
      return true;
    } catch (JwtException | IllegalArgumentException e) {
      return false;
    }
  }
}
```

---

## 🧪 Testing Auth Flow

### 1. Test Login

```bash
curl -X POST http://localhost:8080/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@lume.com","password":"password123"}'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "refreshToken": "refresh_token_here",
  "role": "admin"
}
```

### 2. Test Protected Endpoint

```bash
curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."

# Response:
[{ "id": "1", "name": "Acme Corp", ... }]
```

### 3. Test Unauthorized Access

```bash
curl -X GET http://localhost:8080/api/customers
# Response: 401 Unauthorized

curl -X GET http://localhost:8080/api/customers \
  -H "Authorization: Bearer invalid_token"
# Response: 401 Unauthorized
```

### 4. Test Token Refresh

```bash
curl -X POST http://localhost:8080/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken":"refresh_token_here"}'

# Response:
{
  "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

---

## 🚨 Common Issues & Solutions

### Issue: "Token role claim missing"
**Solution**: Adicionar `role` no JWT payload antes de assinar
```java
.claim("role", user.getRole().name())
```

### Issue: "CORS error on preflight OPTIONS"
**Solution**: Configurar CORS no Spring
```java
@Configuration
public class CorsConfig {
  @Bean
  public WebMvcConfigurer corsConfigurer() {
    return new WebMvcConfigurer() {
      @Override
      public void addCorsMappings(CorsRegistry registry) {
        registry.addMapping("/api/**")
          .allowedOrigins("http://localhost:5173")
          .allowedMethods("GET", "POST", "PUT", "DELETE", "OPTIONS")
          .allowedHeaders("*")
          .allowCredentials(true);
      }
    };
  }
}
```

### Issue: "Token expired, can't refresh"
**Solution**: Validar que refreshToken não expirou no banco
```java
public boolean isRefreshTokenValid(String token) {
  RefreshToken rt = refreshTokenRepository.findByToken(token);
  return rt != null && rt.getExpiresAt().isAfter(LocalDateTime.now());
}
```

---

## 📋 Implementation Checklist

### Phase 1: Basic Auth
- [ ] User entity with role field
- [ ] Hash passwords with BCrypt
- [ ] JWT token generation with role claim
- [ ] Login endpoint returning token + role
- [ ] JWT validation filter in Spring Security

### Phase 2: Token Management
- [ ] RefreshToken entity and repository
- [ ] Refresh endpoint implementing rotation
- [ ] Token expiration handling (1 hour access, 7 days refresh)
- [ ] Logout endpoint invalidating refresh tokens

### Phase 3: RBAC Enforcement
- [ ] Role extraction from JWT in filter
- [ ] @Secured("ROLE_ADMIN") annotations on endpoints
- [ ] 403 Forbidden response for insufficient permissions
- [ ] Optional: Per-customer permissions (admin vs user)

### Phase 4: Frontend Integration
- [ ] Test with frontend at http://localhost:5173
- [ ] Verify role shows in drawer menu
- [ ] Test admin-only /config page access
- [ ] Test CORS preflight requests

---

## 🔗 Frontend Integration Points

### 1. Mock Mode Testing
```
http://localhost:5174?mock=true
// Login with any email (admin@* → admin role)
// Uses mock JWT with role embedded
```

### 2. Real Backend Testing
```
http://localhost:5174 (without ?mock=true)
// Calls real backend
// Uses your JWT implementation
```

### 3. Bearer Token in Requests
```
// Automatically added by httpClient interceptor
Authorization: Bearer <accessToken>
```

### 4. Token Refresh on 401
```
// httpClient interceptor catches 401
// Calls /auth/refresh with refreshToken
// Retries original request with new accessToken
```

---

## 🎯 Quick Start: Java Backend Setup

### 1. Add Dependencies (pom.xml)
```xml
<!-- JWT -->
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-api</artifactId>
  <version>0.12.3</version>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-impl</artifactId>
  <version>0.12.3</version>
  <scope>runtime</scope>
</dependency>
<dependency>
  <groupId>io.jsonwebtoken</groupId>
  <artifactId>jjwt-jackson</artifactId>
  <version>0.12.3</version>
  <scope>runtime</scope>
</dependency>

<!-- BCrypt -->
<dependency>
  <groupId>org.springframework.security</groupId>
  <artifactId>spring-security-crypto</artifactId>
</dependency>
```

### 2. Create User Entity
See database schema section above

### 3. Create AuthController
```java
@RestController
@RequestMapping("/auth")
public class AuthController {
  
  @PostMapping("/login")
  public ResponseEntity<?> login(@RequestBody LoginRequest request) {
    // Validate credentials
    // Generate tokens
    // Return response
  }

  @PostMapping("/refresh")
  public ResponseEntity<?> refresh(@RequestBody RefreshTokenRequest request) {
    // Validate refresh token
    // Generate new access token
    // Return response
  }

  @PostMapping("/logout")
  public ResponseEntity<?> logout(@RequestBody LogoutRequest request) {
    // Invalidate refresh token
    // Return success
  }
}
```

### 4. Configure Security
See Spring Security Configuration section above

### 5. Test Endpoints
See Testing Auth Flow section above

---

## ✅ Success Criteria

Frontend should:
- ✅ Show role in drawer (admin or user)
- ✅ Restrict /config to admin users
- ✅ Mock mode working without backend
- ✅ Real backend auth working with jwt-tokens
- ✅ Token refresh on 401
- ✅ Logout clearing tokens

Backend should:
- ✅ Return JWT with role claim
- ✅ Validate tokens in protected endpoints
- ✅ Return 401 for invalid/expired tokens
- ✅ Return 403 for insufficient permissions (optional)
- ✅ Implement token refresh without requesting new login

---

**Last Updated**: Current Session
**Status**: Ready for implementation
**Frontend Status**: ✅ Ready (implements RBAC + mock JWT)
**Backend Status**: 📋 Implementation guide provided
