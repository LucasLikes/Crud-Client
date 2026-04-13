package com.lume.lumeapi.domain.dto.response;

/**
 * Respostas de autenticação.
 *
 * TokenPair — retornado no login E no refresh (token rotation).
 *   O frontend (httpClient.js) espera { accessToken, refreshToken } em ambos os casos.
 *   Token rotation garante que cada refresh invalida o token anterior,
 *   mitigando ataques de reutilização de refresh token.
 *
 * AccessToken — mantido para compatibilidade interna; não mais exposto via HTTP.
 */
public class AuthResponse {

    /** Login e Refresh — cliente recebe par completo (rotation). */
    public record TokenPair(String accessToken, String refreshToken) {}

    /** Uso interno apenas (geração de token sem criar par). */
    public record AccessToken(String accessToken) {}

    /** Mensagens de sucesso (register, logout). */
    public record Message(String message) {}
}