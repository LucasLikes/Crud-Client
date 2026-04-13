package com.lume.lumeapi.security;

import com.lume.lumeapi.domain.entity.User;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.CsvSource;

import static org.assertj.core.api.Assertions.assertThat;

@DisplayName("JwtService — unit tests")
class JwtServiceTest {

    // 64-char hex string — matches what the real application.yaml provides
    private static final String SECRET =
            "404E635266556A586E3272357538782F413F4428472B4B6250645367566B5970";

    private static final long ACCESS_EXPIRATION_MS = 900_000L; // 15 min

    private JwtService jwtService;

    @BeforeEach
    void setUp() {
        jwtService = new JwtService(SECRET, ACCESS_EXPIRATION_MS);
    }

    // ── helpers ───────────────────────────────────────────────────────────────

    private User adminUser() {
        return User.builder()
                .id(1L).email("admin@lume.com").password("encoded")
                .firstName("Admin").lastName("Lume").role("ROLE_ADMIN")
                .build();
    }

    private User regularUser() {
        return User.builder()
                .id(2L).email("user@lume.com").password("encoded")
                .firstName("Regular").lastName("User").role("ROLE_USER")
                .build();
    }

    // ── token generation ──────────────────────────────────────────────────────

    @Nested
    @DisplayName("generateAccessToken()")
    class GenerateAccessToken {

        @Test
        @DisplayName("returns non-blank JWT for admin user")
        void nonBlankToken() {
            var token = jwtService.generateAccessToken(adminUser());
            assertThat(token).isNotBlank().contains(".");
        }

        @Test
        @DisplayName("extracts correct username (email) from generated token")
        void extractsUsername() {
            var token = jwtService.generateAccessToken(adminUser());
            assertThat(jwtService.extractUsername(token)).isEqualTo("admin@lume.com");
        }

        @Test
        @DisplayName("token is valid for the issuing user")
        void tokenValidForItsUser() {
            var user  = adminUser();
            var token = jwtService.generateAccessToken(user);
            assertThat(jwtService.isValid(token, user)).isTrue();
        }

        @Test
        @DisplayName("token is invalid for a different user")
        void tokenInvalidForOtherUser() {
            var token = jwtService.generateAccessToken(adminUser());
            assertThat(jwtService.isValid(token, regularUser())).isFalse();
        }
    }

    // ── role mapping ──────────────────────────────────────────────────────────

    @Nested
    @DisplayName("toClientRole() — static method")
    class ToClientRole {

        @ParameterizedTest(name = "{0} → {1}")
        @CsvSource({
            "ROLE_ADMIN, admin",
            "ROLE_USER,  user",
            "ROLE_GUEST, user",
            ",           user"
        })
        @DisplayName("maps Spring roles to client-facing names")
        void mapsRoles(String springRole, String expected) {
            assertThat(JwtService.toClientRole(springRole)).isEqualTo(expected);
        }
    }

    // ── claims extraction ─────────────────────────────────────────────────────

    @Nested
    @DisplayName("extractUserClaims()")
    class ExtractUserClaims {

        @Test
        @DisplayName("admin token carries role=admin and hasFullPermission=true")
        void adminClaims() {
            var token  = jwtService.generateAccessToken(adminUser());
            var claims = jwtService.extractUserClaims(token);

            assertThat(claims.role()).isEqualTo("admin");
            assertThat(claims.hasFullPermission()).isTrue();
            assertThat(claims.email()).isEqualTo("admin@lume.com");
        }

        @Test
        @DisplayName("regular user token carries role=user and hasFullPermission=false")
        void userClaims() {
            var token  = jwtService.generateAccessToken(regularUser());
            var claims = jwtService.extractUserClaims(token);

            assertThat(claims.role()).isEqualTo("user");
            assertThat(claims.hasFullPermission()).isFalse();
        }

        @Test
        @DisplayName("nameIdentifier contains full name")
        void nameIdentifier() {
            var token  = jwtService.generateAccessToken(adminUser());
            var claims = jwtService.extractUserClaims(token);

            assertThat(claims.nameIdentifier()).isEqualTo("Admin Lume");
        }

        @Test
        @DisplayName("tenant is always lume")
        void tenant() {
            var token  = jwtService.generateAccessToken(regularUser());
            var claims = jwtService.extractUserClaims(token);

            assertThat(claims.tenant()).isEqualTo("lume");
        }
    }

    // ── token validation edge cases ────────────────────────────────────────────

    @Nested
    @DisplayName("isValid()")
    class IsValid {

        @Test
        @DisplayName("returns false for tampered token")
        void tamperedToken() {
            var token    = jwtService.generateAccessToken(adminUser());
            var tampered = token.substring(0, token.length() - 5) + "XXXXX";

            assertThat(jwtService.isValid(tampered, adminUser())).isFalse();
        }

        @Test
        @DisplayName("returns false for expired token (expiration in the past)")
        void expiredToken() {
            // Create a JwtService with 1ms expiration so the token expires immediately
            var shortLived = new JwtService(SECRET, 1L);
            var token = shortLived.generateAccessToken(adminUser());

            // Small sleep ensures expiration timestamp is in the past
            try { Thread.sleep(10); } catch (InterruptedException ignored) {}

            assertThat(shortLived.isValid(token, adminUser())).isFalse();
        }
    }
}
