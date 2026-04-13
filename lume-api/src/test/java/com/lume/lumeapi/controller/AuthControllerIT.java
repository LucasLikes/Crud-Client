package com.lume.lumeapi.controller;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.lume.lumeapi.domain.dto.request.AuthRequest;
import com.lume.lumeapi.repository.RefreshTokenRepository;
import com.lume.lumeapi.repository.UserRepository;
import org.junit.jupiter.api.AfterEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.http.MediaType;
import org.springframework.test.context.ActiveProfiles;
import org.springframework.test.web.servlet.MockMvc;

import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.post;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@SpringBootTest(webEnvironment = SpringBootTest.WebEnvironment.RANDOM_PORT)
@AutoConfigureMockMvc
@ActiveProfiles("test")
@DisplayName("AuthController — integration tests")
class AuthControllerIT {

    @Autowired MockMvc                mockMvc;
    @Autowired ObjectMapper           objectMapper;
    @Autowired UserRepository         userRepository;
    @Autowired RefreshTokenRepository refreshTokenRepository;

    private static final String TEST_EMAIL    = "auth-it@lume.com";
    private static final String TEST_PASSWORD = "password123";

    @AfterEach
    void tearDown() {
        userRepository.findByEmail(TEST_EMAIL).ifPresent(u -> {
            refreshTokenRepository.deleteAll(
                    refreshTokenRepository.findAll().stream()
                            .filter(rt -> rt.getUser().getId().equals(u.getId()))
                            .toList()
            );
            userRepository.delete(u);
        });
    }

    private String json(Object obj) throws Exception {
        return objectMapper.writeValueAsString(obj);
    }

    // ── register ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /auth/register")
    class Register {

        @Test
        @DisplayName("returns 201 and success message for new email")
        void success() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Register(TEST_EMAIL, TEST_PASSWORD))))
                    .andExpect(status().isCreated())
                    .andExpect(jsonPath("$.message").value("User registered successfully"));
        }

        @Test
        @DisplayName("returns 409 when email already exists")
        void duplicateEmail() throws Exception {
            var body = json(new AuthRequest.Register(TEST_EMAIL, TEST_PASSWORD));

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isCreated());

            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON).content(body))
                    .andExpect(status().isConflict());
        }

        @Test
        @DisplayName("returns 400 when email is invalid")
        void invalidEmail() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Register("not-an-email", TEST_PASSWORD))))
                    .andExpect(status().isBadRequest());
        }

        @Test
        @DisplayName("returns 400 when password is too short")
        void shortPassword() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Register(TEST_EMAIL, "123"))))
                    .andExpect(status().isBadRequest());
        }
    }

    // ── login ──────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /auth/login")
    class Login {

        private void register() throws Exception {
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Register(TEST_EMAIL, TEST_PASSWORD))))
                    .andExpect(status().isCreated());
        }

        @Test
        @DisplayName("returns 200 with accessToken and refreshToken on valid credentials")
        void success() throws Exception {
            register();

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Login(TEST_EMAIL, TEST_PASSWORD))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty());
        }

        @Test
        @DisplayName("returns 401 for wrong password")
        void wrongPassword() throws Exception {
            register();

            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Login(TEST_EMAIL, "WRONG"))))
                    .andExpect(status().isUnauthorized());
        }

        @Test
        @DisplayName("returns 401 for non-existent email")
        void unknownEmail() throws Exception {
            mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Login("ghost@lume.com", TEST_PASSWORD))))
                    .andExpect(status().isUnauthorized());
        }
    }

    // ── refresh ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("POST /auth/refresh")
    class Refresh {

        @Test
        @DisplayName("returns new token pair for valid refresh token (rotation)")
        void success() throws Exception {
            // register + login to get tokens
            mockMvc.perform(post("/api/v1/auth/register")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Register(TEST_EMAIL, TEST_PASSWORD))))
                    .andExpect(status().isCreated());

            var loginResult = mockMvc.perform(post("/api/v1/auth/login")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Login(TEST_EMAIL, TEST_PASSWORD))))
                    .andExpect(status().isOk())
                    .andReturn();

            var refreshToken = objectMapper
                    .readTree(loginResult.getResponse().getContentAsString())
                    .get("refreshToken").asText();

            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Refresh(refreshToken))))
                    .andExpect(status().isOk())
                    .andExpect(jsonPath("$.accessToken").isNotEmpty())
                    .andExpect(jsonPath("$.refreshToken").isNotEmpty());
        }

        @Test
        @DisplayName("returns 401 for invalid refresh token")
        void invalidToken() throws Exception {
            mockMvc.perform(post("/api/v1/auth/refresh")
                            .contentType(MediaType.APPLICATION_JSON)
                            .content(json(new AuthRequest.Refresh("invalid-token-uuid"))))
                    .andExpect(status().isUnauthorized());
        }
    }
}
