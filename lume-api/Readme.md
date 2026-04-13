# Lume API

REST API built with **Java 21 + Spring Boot 3** featuring JWT authentication, customer CRUD, CEP integration, and Swagger documentation.

---

## Stack

- Java 21
- Spring Boot 3.3
- Spring Security + JWT (jjwt 0.12)
- Spring Data JPA + H2
- SpringDoc OpenAPI (Swagger UI)
- Docker

---

## Running locally

### Option 1 — Maven

```bash
./mvnw spring-boot:run
```

### Option 2 — Docker Compose

```bash
docker compose up --build
```

The API will be available at `http://localhost:8080`.

---

## Swagger UI

```
http://localhost:8080/swagger-ui.html
```

To authenticate in Swagger:
1. Call `POST /api/v1/auth/login` with the credentials below
2. Copy the `accessToken` from the response
3. Click **Authorize** (top right) and paste: `Bearer <accessToken>`

---

## H2 Console

```
http://localhost:8080/h2-console
JDBC URL: jdbc:h2:mem:lumedb
Username: sa
Password: (leave blank)
```

---

## Default credentials

| Email           | Password   | Role        |
|-----------------|------------|-------------|
| admin@lume.com  | admin123   | ROLE_ADMIN  |

---

## Auth endpoints

| Method | Endpoint                    | Description              | Auth required |
|--------|-----------------------------|--------------------------|---------------|
| POST   | `/api/v1/auth/register`     | Register new user        | No            |
| POST   | `/api/v1/auth/login`        | Login → tokens           | No            |
| POST   | `/api/v1/auth/refresh`      | Refresh access token     | No            |
| POST   | `/api/v1/auth/logout`       | Revoke refresh token     | No            |

## Customer endpoints

| Method | Endpoint                                  | Description             | Auth required |
|--------|-------------------------------------------|-------------------------|---------------|
| POST   | `/api/v1/customers`                       | Create customer         | Yes           |
| GET    | `/api/v1/customers`                       | List all customers      | Yes           |
| GET    | `/api/v1/customers/{id}`                  | Get customer by ID      | Yes           |
| PUT    | `/api/v1/customers/{id}`                  | Update customer         | Yes           |
| DELETE | `/api/v1/customers/{id}`                  | Delete customer         | Yes           |
| GET    | `/api/v1/customers/address-lookup/{cep}`  | Lookup address by CEP   | Yes           |

---

## Example login request

```json
POST /api/v1/auth/login
{
  "email": "admin@lume.com",
  "password": "admin123"
}
```

Response:
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid-token"
}
```