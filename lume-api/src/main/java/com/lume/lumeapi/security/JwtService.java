package com.lume.lumeapi.security;

import com.lume.lumeapi.domain.entity.User;
import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.security.Keys;
import lombok.extern.slf4j.Slf4j;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Service;

import javax.crypto.SecretKey;
import java.nio.charset.StandardCharsets;
import java.util.Date;
import java.util.Map;

/**
 * Serviço de geração e validação de JWT.
 *
 * Contrato de claims:
 *   - "sub"   → email (usado pelo Spring Security como username)
 *   - "role"  → "admin" | "user"  (sem prefixo ROLE_; o frontend decodifica diretamente)
 *   - demais claims → enriquecimento de perfil no cliente
 *
 * Decisão de design — role sem prefixo:
 *   O Spring Security usa ROLE_ADMIN internamente, mas expor esse detalhe
 *   de implementação no JWT acopla o cliente ao framework.
 *   O mapeamento ROLE_ ↔ admin/user ocorre nesta camada, mantendo o
 *   frontend agnóstico ao Spring Security.
 */
@Slf4j
@Service
public class JwtService {

    static final String CLAIM_NAME_IDENTIFIER     = "nameIdentifier";
    static final String CLAIM_FIRST_NAME          = "firstName";
    static final String CLAIM_LAST_NAME           = "lastName";
    static final String CLAIM_USER_LOGIN          = "userLogin";
    static final String CLAIM_EMAIL               = "email";
    static final String CLAIM_ID_USER             = "idUser";
    static final String CLAIM_ROLE                = "role";
    static final String CLAIM_TENANT              = "tenant";
    static final String CLAIM_HAS_FULL_PERMISSION = "hasFullPermission";

    private final SecretKey secretKey;
    private final long      accessTokenExpirationMs;

    public JwtService(
            @Value("${security.jwt.secret}") String secret,
            @Value("${security.jwt.access-token-expiration-ms}") long accessTokenExpirationMs
    ) {
        this.secretKey               = Keys.hmacShaKeyFor(secret.getBytes(StandardCharsets.UTF_8));
        this.accessTokenExpirationMs = accessTokenExpirationMs;
    }

    // ── Generation ───────────────────────────────────────────────────────────

    public String generateAccessToken(User user) {
        return buildToken(buildClaims(user), user.getUsername(), accessTokenExpirationMs);
    }

    public String generateAccessToken(UserDetails userDetails) {
        if (userDetails instanceof User user) return generateAccessToken(user);
        return buildToken(Map.of(), userDetails.getUsername(), accessTokenExpirationMs);
    }

    // ── Reading ──────────────────────────────────────────────────────────────

    public String extractUsername(String token) {
        return extractClaims(token).getSubject();
    }

    public UserClaims extractUserClaims(String token) {
        var c = extractClaims(token);
        return new UserClaims(
                c.get(CLAIM_NAME_IDENTIFIER,      String.class),
                c.get(CLAIM_FIRST_NAME,           String.class),
                c.get(CLAIM_LAST_NAME,            String.class),
                c.get(CLAIM_USER_LOGIN,           String.class),
                c.get(CLAIM_EMAIL,                String.class),
                c.get(CLAIM_ID_USER,              Long.class),
                c.get(CLAIM_ROLE,                 String.class),
                c.get(CLAIM_TENANT,               String.class),
                Boolean.TRUE.equals(c.get(CLAIM_HAS_FULL_PERMISSION, Boolean.class))
        );
    }

    // ── Validation ───────────────────────────────────────────────────────────

    public boolean isValid(String token, UserDetails userDetails) {
        try {
            return extractUsername(token).equals(userDetails.getUsername())
                    && !isExpired(token);
        } catch (JwtException | IllegalArgumentException ex) {
            log.warn("Invalid JWT: {}", ex.getMessage());
            return false;
        }
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    /**
     * Constrói os claims do JWT.
     *
     * role é emitido sem o prefixo "ROLE_" para manter o contrato
     * com o frontend agnóstico ao Spring Security.
     * Mapeamento: "ROLE_ADMIN" → "admin", qualquer outro → "user".
     */
    private Map<String, Object> buildClaims(User user) {
        var roleForClient = toClientRole(user.getRole());
        var isAdmin       = "admin".equals(roleForClient);

        return Map.of(
                CLAIM_NAME_IDENTIFIER,     user.getFullName(),
                CLAIM_FIRST_NAME,          user.getFirstName(),
                CLAIM_LAST_NAME,           user.getLastName(),
                CLAIM_USER_LOGIN,          user.getEmail(),
                CLAIM_EMAIL,               user.getEmail(),
                CLAIM_ID_USER,             user.getId(),
                CLAIM_ROLE,                roleForClient,
                CLAIM_TENANT,              "lume",
                CLAIM_HAS_FULL_PERMISSION, isAdmin
        );
    }

    /**
     * Converte a role interna do Spring Security para o formato do cliente.
     * "ROLE_ADMIN" → "admin"
     * "ROLE_USER"  → "user"
     * qualquer outro → "user" (safe default)
     */
    static String toClientRole(String springRole) {
        if (springRole == null) return "user";
        return switch (springRole) {
            case "ROLE_ADMIN" -> "admin";
            case "ROLE_USER"  -> "user";
            default           -> "user";
        };
    }

    private boolean isExpired(String token) {
        return extractClaims(token).getExpiration().before(new Date());
    }

    private Claims extractClaims(String token) {
        return Jwts.parser()
                .verifyWith(secretKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }

    private String buildToken(Map<String, Object> claims, String subject, long expirationMs) {
        var now = new Date();
        return Jwts.builder()
                .claims(claims)
                .subject(subject)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + expirationMs))
                .signWith(secretKey)
                .compact();
    }
}