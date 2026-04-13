package com.lume.lumeapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lume.lumeapi.domain.dto.request.CustomerRequest;
import com.lume.lumeapi.domain.entity.User;
import com.lume.lumeapi.repository.CustomerRepository;
import com.lume.lumeapi.repository.UserRepository;
import com.lume.lumeapi.security.JwtService;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;
import static org.hamcrest.Matchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("CustomerController — integration tests")
class CustomerControllerIT {

    @Autowired MockMvc         mockMvc;
    @Autowired ObjectMapper    objectMapper;
    @Autowired JwtService      jwtService;
    @Autowired UserRepository  userRepository;
    @Autowired CustomerRepository customerRepository;
    @Autowired PasswordEncoder passwordEncoder;

    private String adminToken;
    private String userToken;

    // ── setup / teardown ──────────────────────────────────────────────────────

    @BeforeEach
    void setUp() {
        customerRepository.deleteAll();
        userRepository.findByEmail("it-admin@lume.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("it-user@lume.com").ifPresent(userRepository::delete);

        var admin = userRepository.save(User.builder()
                .firstName("IT").lastName("Admin")
                .email("it-admin@lume.com")
                .password(passwordEncoder.encode("pass"))
                .role("ROLE_ADMIN").build());

        var regular = userRepository.save(User.builder()
                .firstName("IT").lastName("User")
                .email("it-user@lume.com")
                .password(passwordEncoder.encode("pass"))
                .role("ROLE_USER").build());

        adminToken = jwtService.generateAccessToken(admin);
        userToken  = jwtService.generateAccessToken(regular);
    }

    @AfterEach
    void tearDown() {
        customerRepository.deleteAll();
        userRepository.findByEmail("it-admin@lume.com").ifPresent(userRepository::delete);
        userRepository.findByEmail("it-user@lume.com").ifPresent(userRepository::delete);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private CustomerRequest validRequest(String cpf) {
        return new CustomerRequest(
                "João Silva", cpf,
                new CustomerRequest.AddressRequest(
                        "Rua das Flores", "Centro", "São Paulo", "SP", "01310100")
        );
    }

    private String json(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    private String bearer(String token) {
        return "Bearer " + token;
    }

    // ── authentication guard ──────────────────────────────────────────────────

    @Nested
    @DisplayName("Authentication guard")
    class AuthGuard {

        @Test
        @DisplayName("GET /customers returns 401 without token")
        void listWithoutToken() throws Exception {
            mockMvc.perform(get("/api/v1/customers"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("POST /customers returns 401 without token")
        void createWithoutToken() throws Exception {
            mockMvc.perform(post("/api/v1/customers")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("DELETE /customers/{id} returns 401 without token")
        void deleteWithoutToken() throws Exception {
            mockMvc.perform(delete("/api/v1/customers/1"))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── RBAC: listing (all authenticated) ────────────────────────────────────

    @Nested
    @DisplayName("GET /customers — accessible to all authenticated users")
    class ListCustomers {

        @Test
        @DisplayName("admin can list customers")
        void adminCanList() throws Exception {
            mockMvc.perform(get("/api/v1/customers")
                            .header("Authorization", bearer(adminToken)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$", isA(java.util.List.class)));
        }

        @Test
        @DisplayName("regular user can list customers")
        void userCanList() throws Exception {
            mockMvc.perform(get("/api/v1/customers")
                            .header("Authorization", bearer(userToken)))
                    .andExpect(status().isOk());
        }
    }

    // ── RBAC: create (admin only) ──────────────────────────────────────────────

    @Nested
    @DisplayName("POST /customers — admin only")
    class CreateCustomer {

        @Test
        @DisplayName("admin creates customer and receives 201")
        void adminCanCreate() throws Exception {
            mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.cpf").value("52998224725"))
                    .andExpect(jsonPath("$.name").value("João Silva"));
        }

        @Test
        @DisplayName("regular user receives 403 when trying to create")
        void userCannotCreate() throws Exception {
            mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(userToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 409 when CPF is already registered")
        void duplicateCpfReturns409() throws Exception {
            var payload = json(validRequest("52998224725"));

            mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(payload))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("returns 400 when request body is invalid (blank name)")
        void invalidBodyReturns400() throws Exception {
            var bad = new CustomerRequest(
                    "", "52998224725",
                    new CustomerRequest.AddressRequest("Rua A", "B", "C", "SP", "01310100"));

            mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(bad)))
                    .andExpect(status().isBadRequest());
        }
    }

    // ── RBAC: update (admin only) ──────────────────────────────────────────────

    @Nested
    @DisplayName("PUT /customers/{id} — admin only")
    class UpdateCustomer {

        @Test
        @DisplayName("admin can update an existing customer")
        void adminCanUpdate() throws Exception {
            // create first
            var createResult = mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isCreated())
                    .andReturn();

            var id = objectMapper.readTree(createResult.getResponse().getContentAsString())
                    .get("id").asLong();

            var updated = new CustomerRequest(
                    "Maria Atualizada", "52998224725",
                    new CustomerRequest.AddressRequest("Av Nova", "Bairro", "Rio", "RJ", "20000000"));

            mockMvc.perform(put("/api/v1/customers/" + id)
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(updated)))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.name").value("Maria Atualizada"));
        }

        @Test
        @DisplayName("regular user receives 403 on update")
        void userCannotUpdate() throws Exception {
            mockMvc.perform(put("/api/v1/customers/1")
                            .header("Authorization", bearer(userToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isForbidden());
        }
    }

    // ── RBAC: delete (admin only) ──────────────────────────────────────────────

    @Nested
    @DisplayName("DELETE /customers/{id} — admin only")
    class DeleteCustomer {

        @Test
        @DisplayName("admin deletes existing customer and receives 204")
        void adminCanDelete() throws Exception {
            var createResult = mockMvc.perform(post("/api/v1/customers")
                            .header("Authorization", bearer(adminToken))
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(validRequest("52998224725"))))
                    .andExpect(status().isCreated())
                    .andReturn();

            var id = objectMapper.readTree(createResult.getResponse().getContentAsString())
                    .get("id").asLong();

            mockMvc.perform(delete("/api/v1/customers/" + id)
                            .header("Authorization", bearer(adminToken)))
                    .andExpect(status().isNoContent());
        }

        @Test
        @DisplayName("regular user receives 403 when trying to delete")
        void userCannotDelete() throws Exception {
            mockMvc.perform(delete("/api/v1/customers/1")
                            .header("Authorization", bearer(userToken)))
                    .andExpect(status().isForbidden());
        }

        @Test
        @DisplayName("returns 404 when customer does not exist")
        void notFoundReturns404() throws Exception {
            mockMvc.perform(delete("/api/v1/customers/999999")
                            .header("Authorization", bearer(adminToken)))
                    .andExpect(status().isNotFound());
        }
    }

    // ── address lookup ─────────────────────────────────────────────────────────

    @Nested
    @DisplayName("GET /customers/address-lookup/{zipCode}")
    class AddressLookup {

        @Test
        @DisplayName("returns 401 without token")
        void requiresAuth() throws Exception {
            mockMvc.perform(get("/api/v1/customers/address-lookup/01310100"))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("authenticated user can access lookup endpoint")
        void userCanLookup() throws Exception {
            // The ViaCEP call may fail in CI — we just verify auth layer works
            // A mocked CepService would be better for isolated testing
            mockMvc.perform(get("/api/v1/customers/address-lookup/01310100")
                            .header("Authorization", bearer(userToken)))
                    .andExpect(status().is(not(401)))
                    .andExpect(status().is(not(403)));
        }
    }
}
