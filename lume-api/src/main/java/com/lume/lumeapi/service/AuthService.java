package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.request.AuthRequest;
import com.lume.lumeapi.domain.dto.response.AuthResponse;
import com.lume.lumeapi.domain.entity.User;
import com.lume.lumeapi.enums.Role;
import com.lume.lumeapi.exception.EmailAlreadyExistsException;
import com.lume.lumeapi.repository.UserRepository;
import com.lume.lumeapi.security.JwtService;
import lombok.RequiredArgsConstructor;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

/**
 * Serviço de autenticação.
 *
 * Decisões de design:
 *
 * 1. Register com { email, password } apenas.
 *    O frontend envia apenas esses dois campos.
 *    O nome (firstName / lastName) é derivado da parte local do e-mail
 *    para não bloquear o fluxo de cadastro.
 *    Ex.: "joao.silva@example.com" → firstName="joao", lastName="silva"
 *         "admin@lume.com"         → firstName="admin", lastName=""
 *
 * 2. Token rotation no refresh.
 *    A cada chamada a refresh(), o refresh token atual é revogado e um
 *    novo par (access + refresh) é emitido.
 *    Isso mitiga ataques de reutilização e mantém o cliente sempre com
 *    tokens de curta validade.
 *    O frontend (httpClient.js) armazena o novo refreshToken retornado.
 */
@Service
@RequiredArgsConstructor
public class AuthService {

    private final UserRepository        userRepository;
    private final PasswordEncoder       passwordEncoder;
    private final JwtService            jwtService;
    private final TokenService          tokenService;
    private final AuthenticationManager authenticationManager;

    // ── Register ─────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse.Message register(AuthRequest.Register req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new EmailAlreadyExistsException(req.email());
        }

        var names = deriveNamesFromEmail(req.email());

        var user = User.builder()
                .firstName(names[0])
                .lastName(names[1])
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(Role.ROLE_USER)
                .build();

        userRepository.save(user);
        return new AuthResponse.Message("User registered successfully");
    }

    // ── Login ─────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse.TokenPair login(AuthRequest.Login req) {
        authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(req.email(), req.password())
        );
        var user         = userRepository.findByEmail(req.email()).orElseThrow();
        var accessToken  = jwtService.generateAccessToken(user);
        var refreshToken = tokenService.create(user);
        return new AuthResponse.TokenPair(accessToken, refreshToken.getToken());
    }

    // ── Refresh (token rotation) ──────────────────────────────────────────────

    /**
     * Valida o refresh token atual, revoga-o e emite um novo par.
     * O frontend deve armazenar o novo refreshToken retornado.
     */
    @Transactional
    public AuthResponse.TokenPair refresh(AuthRequest.Refresh req) {
        var rt          = tokenService.findAndValidate(req.refreshToken());
        var user        = rt.getUser();

        // Revoga o token atual antes de emitir o novo (rotation)
        tokenService.revoke(req.refreshToken());

        var newAccessToken  = jwtService.generateAccessToken(user);
        var newRefreshToken = tokenService.create(user);

        return new AuthResponse.TokenPair(newAccessToken, newRefreshToken.getToken());
    }

    // ── Logout ────────────────────────────────────────────────────────────────

    @Transactional
    public AuthResponse.Message logout(AuthRequest.Logout req) {
        tokenService.revoke(req.refreshToken());
        return new AuthResponse.Message("Logged out successfully");
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Deriva firstName e lastName da parte local do e-mail.
     *
     * Regras:
     *   - "joao.silva@example.com" → ["joao", "silva"]
     *   - "admin@lume.com"         → ["admin", ""]
     *   - "joao.carlos.silva@..."  → ["joao", "carlos.silva"]
     *
     * Retorna array de exatamente 2 elementos: [firstName, lastName].
     */
    static String[] deriveNamesFromEmail(String email) {
        var local = email.split("@")[0];
        var parts = local.split("\\.", 2);
        return new String[]{
                capitalize(parts[0]),
                parts.length > 1 ? capitalize(parts[1]) : ""
        };
    }

    private static String capitalize(String s) {
        if (s == null || s.isBlank()) return s == null ? "" : s;
        return Character.toUpperCase(s.charAt(0)) + s.substring(1).toLowerCase();
    }
}