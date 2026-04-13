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
@DisplayName("AuthService")
class AuthServiceTest {

    @Mock UserRepository userRepository;
    @Mock PasswordEncoder passwordEncoder;
    @Mock JwtService jwtService;
    @Mock TokenService tokenService;
    @Mock AuthenticationManager authenticationManager;

    @InjectMocks AuthService authService;

    // ─── Fixtures ────────────────────────────────────────────────────────────

    private static final String EMAIL    = "user@lume.com";
    private static final String PASSWORD = "secret123";
    private static final String ACCESS   = "access.jwt.token";
    private static final String REFRESH  = "refresh-uuid";

    private User mockUser() {
        return User.builder().id(1L).email(EMAIL).password("encoded").role("ROLE_USER").build();
    }

    private RefreshToken mockRefreshToken(User user) {
        return RefreshToken.builder()
                .id(1L).token(REFRESH).user(user)
                .expiresAt(Instant.now().plusSeconds(3600))
                .build();
    }

    // ─── register ────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("register()")
    class Register {

        @Test
        @DisplayName("should register and return success message when email is unique")
        void success() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(false);
            given(passwordEncoder.encode(PASSWORD)).willReturn("encoded");

            var result = authService.register(new AuthRequest.Register(EMAIL, PASSWORD));

            assertThat(result.message()).isEqualTo("User registered successfully");
            then(userRepository).should().save(any(User.class));
        }

        @Test
        @DisplayName("should throw EmailAlreadyExistsException when email is taken")
        void duplicateEmail() {
            given(userRepository.existsByEmail(EMAIL)).willReturn(true);

            assertThatThrownBy(() -> authService.register(new AuthRequest.Register(EMAIL, PASSWORD)))
                    .isInstanceOf(EmailAlreadyExistsException.class)
                    .hasMessageContaining(EMAIL);

            then(userRepository).should(never()).save(any());
        }
    }

    // ─── login ────────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("login()")
    class Login {

        @Test
        @DisplayName("should return token pair on valid credentials")
        void success() {
            var user         = mockUser();
            var refreshToken = mockRefreshToken(user);

            given(userRepository.findByEmail(EMAIL)).willReturn(Optional.of(user));
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);
            given(tokenService.create(user)).willReturn(refreshToken);

            var result = authService.login(new AuthRequest.Login(EMAIL, PASSWORD));

            assertThat(result.accessToken()).isEqualTo(ACCESS);
            assertThat(result.refreshToken()).isEqualTo(REFRESH);
        }

        @Test
        @DisplayName("should propagate BadCredentialsException on wrong password")
        void badCredentials() {
            willThrow(BadCredentialsException.class)
                    .given(authenticationManager)
                    .authenticate(any(UsernamePasswordAuthenticationToken.class));

            assertThatThrownBy(() -> authService.login(new AuthRequest.Login(EMAIL, "wrong")))
                    .isInstanceOf(BadCredentialsException.class);

            then(jwtService).shouldHaveNoInteractions();
        }
    }

    // ─── refresh ──────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("refresh()")
    class Refresh {

        @Test
        @DisplayName("should return new access token for valid refresh token")
        void success() {
            var user  = mockUser();
            var rt    = mockRefreshToken(user);

            given(tokenService.findAndValidate(REFRESH)).willReturn(rt);
            given(jwtService.generateAccessToken(user)).willReturn(ACCESS);

            var result = authService.refresh(new AuthRequest.Refresh(REFRESH));

            assertThat(result.accessToken()).isEqualTo(ACCESS);
        }
    }

    // ─── logout ───────────────────────────────────────────────────────────────

    @Nested
    @DisplayName("logout()")
    class Logout {

        @Test
        @DisplayName("should revoke refresh token and return success message")
        void success() {
            var result = authService.logout(new AuthRequest.Logout(REFRESH));

            assertThat(result.message()).isEqualTo("Logged out successfully");
            then(tokenService).should().revoke(REFRESH);
        }
    }
}