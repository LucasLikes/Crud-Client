package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.request.AuthRequest;
import com.lume.lumeapi.domain.entity.RefreshToken;
import com.lume.lumeapi.domain.entity.User;
import com.lume.lumeapi.exception.EmailAlreadyExistsException;
import com.lume.lumeapi.repository.UserRepository;
import com.lume.lumeapi.security.JwtService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.DisplayName;
import org.junit.jupiter.api.Nested;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.junit.jupiter.params.ParameterizedTest;
import org.junit.jupiter.params.provider.ValueSource;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.time.Instant;
import java.util.Optional;

import static org.assertj.core.api.Assertions.*;
import static org.mockito.ArgumentMatchers.*;
import static org.mockito.BDDMockito.*;

@ExtendWith(MockitoExtension.class)
@DisplayName("AuthService — unit tests")
class AuthServiceTest {

    @Mock UserRepository        userRepository;
    @Mock PasswordEncoder       passwordEncoder;
    @Mock JwtService            jwtService;
    @Mock TokenService          tokenService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    // ── fixtures ─────────────────────────────────────────────────────────────

    private static final String EMAIL    = "user@lume.com";
    private static final String PASSWORD = "secret123";
    private static final String ACCESS   = "access.jwt.token";
    private static final String REFRESH  = "refresh-uuid";

    private User mockUser() {
        return User.builder()
                .id(1L).email(EMAIL).password("encoded").role("ROLE_USER")
                .firstName("User").lastName("Lume")
                .build();
    }

    private RefreshToken mockRefreshToken(User user) {
        return RefreshToken.builder()
                .id(1L).token(REFRESH).user(user)
                .expiresAt(Instant.now().plusSeconds(3_600))
                .build();
    }

    // ── register ─────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("saves user and returns success message when email is unique")
        void success() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(passwordEncoder.encode(PASSWORD)).willReturn("encoded");

            var result = authService.register(new AuthRequest.Register(EMAIL, PASSWORD));

            assertThat(result.message()).isEqualTo("User registered successfully");
            then(userRepository).should().save(any(User.class));
        }

        @Test
        @DisplayName("throws EmailAlreadyExistsException when email is taken")
        void duplicateEmail() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(true);

            assertThatThrownBy(() ->
                    authService.register(new AuthRequest.Register(EMAIL, PASSWORD)))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining(EMAIL);

            then(userRepository).should(never()).save(any());
        }

        @Test
        @DisplayName("assigns ROLE_USER to every self-registered account")
        void alwaysRoleUser() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(passwordEncoder.encode(any())).willReturn("encoded");

            authService.register(new AuthRequest.Register(EMAIL, PASSWORD));

            then(userRepository).should().save(argThat(u -> "ROLE_USER".equals(u.getRole())));
        }

        @Test
        @DisplayName("encodes password before persisting")
        void encodesPassword() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(passwordEncoder.encode(PASSWORD)).willReturn("bcrypt$hashed");

            authService.register(new AuthRequest.Register(EMAIL, PASSWORD));

            then(userRepository).should().save(argThat(u -> "bcrypt$hashed".equals(u.getPassword())));
            then(passwordEncoder).should().encode(PASSWORD);
        }
    }

    // ── deriveNamesFromEmail ──────────────────────────────────────────────────

    @Nested
    @DisplayName("deriveNamesFromEmail() — static helper")
    class DeriveNames {

        @Test
        @DisplayName("splits on first dot: joao.silva → [Joao, Silva]")
        void splitOnDot() {
            var names = AuthService.deriveNamesFromEmail("joao.silva@example.com");
            assertThat(names).containsExactly("Joao", "Silva");
        }

        @Test
        @DisplayName("no dot: admin → [Admin, '']")
        void noDot() {
            var names = AuthService.deriveNamesFromEmail("admin@lume.com");
            assertThat(names).containsExactly("Admin", "");
        }

        @Test
        @DisplayName("multiple dots: joao.carlos.silva → [Joao, Carlos.silva]")
        void multipleDots() {
            var names = AuthService.deriveNamesFromEmail("joao.carlos.silva@example.com");
            assertThat(names[0]).isEqualTo("Joao");
            assertThat(names[1]).isNotEmpty();
        }

        @ParameterizedTest(name = "{0}")
        @ValueSource(strings = {
            "ADMIN@LUME.COM",
            "Test.User@Domain.com"
        })
        @DisplayName("capitalizes first letter, lowercases rest")
        void capitalizes(String email) {
            var names = AuthService.deriveNamesFromEmail(email);
            assertThat(names[0]).matches("[A-Z][a-z]*");
        }
    }

    // ── login ─────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("returns token pair on valid credentials")
        void success() {
            var user = mockUser();
            var rt   = mockRefreshToken(user);

            given(userRepository.findByEmail(EMAIL)).willReturn(Optional.of(user));
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);
            given(tokenService.create(user)).willReturn(rt);

            var result = authService.login(new AuthRequest.Login(EMAIL, PASSWORD));

            assertThat(result.accessToken()).isEqualTo(ACCESS);
            assertThat(result.refreshToken()).isEqualTo(REFRESH);
        }

        @Test
        @DisplayName("delegates authentication to AuthenticationManager")
        void delegatesAuth() {
            var user = mockUser();
            given(userRepository.findByEmail(EMAIL)).willReturn(Optional.of(user));
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);
            given(tokenService.create(user)).willReturn(mockRefreshToken(user));

            authService.login(new AuthRequest.Login(EMAIL, PASSWORD));

            then(authenticationManager).should().authenticate(
                    argThat(a -> a instanceof UsernamePasswordAuthenticationToken
                            && EMAIL.equals(a.getPrincipal())));
        }

        @Test
        @DisplayName("propagates BadCredentialsException on wrong password")
        void badCredentials() {
            willThrow(BadCredentialsException.class)
                    .given(authenticationManager)
                    .authenticate(any(UsernamePasswordAuthenticationToken.class));

            assertThatThrownBy(() ->
                    authService.login(new AuthRequest.Login(EMAIL, "wrong")))
                    .isInstanceOf(BadCredentialsException.class);

            then(jwtService).shouldHaveNoInteractions();
            then(tokenService).shouldHaveNoInteractions();
        }
    }

    // ── refresh ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("refresh()")
    class Refresh {

        @Test
        @DisplayName("returns new token pair for valid refresh token")
        void success() {
            var user     = mockUser();
            var rt       = mockRefreshToken(user);
            var newRt    = mockRefreshToken(user);

            given(tokenService.findAndValidate(REFRESH)).willReturn(rt);
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);
            given(tokenService.create(user)).willReturn(newRt);

            var result = authService.refresh(new AuthRequest.Refresh(REFRESH));

            assertThat(result.accessToken()).isEqualTo(ACCESS);
            assertThat(result.refreshToken()).isEqualTo(newRt.getToken());
        }

        @Test
        @DisplayName("revokes old token before issuing new one (rotation)")
        void revokesOldToken() {
            var user = mockUser();
            given(tokenService.findAndValidate(REFRESH)).willReturn(mockRefreshToken(user));
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);
            given(tokenService.create(user)).willReturn(mockRefreshToken(user));

            authService.refresh(new AuthRequest.Refresh(REFRESH));

            then(tokenService).should().revoke(REFRESH);
        }
    }

    // ── logout ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("logout()")
    class Logout {

        @Test
        @DisplayName("revokes refresh token and returns success message")
        void success() {
            var result = authService.logout(new AuthRequest.Logout(REFRESH));

            assertThat(result.message()).isEqualTo("Logged out successfully");
            then(tokenService).should().revoke(REFRESH);
        }
    }
}
