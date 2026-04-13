package com.lume.lumeapi.domain.dto.request;

import jakarta.validation.constraints.*;

/**
 * DTOs de autenticação.
 *
 * Register — frontend envia apenas { email, password }.
 *   Nome de usuário é derivado da parte local do e-mail no cadastro
 *   (ex.: "joao.silva@example.com" → firstName="joao", lastName="silva").
 *   Isso mantém o contrato público minimal e evita que o cliente precise
 *   de um formulário multi-campo só para criar a conta.
 */
public class AuthRequest {

    public record Register(
            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password
    ) {}

    public record Login(
            @NotBlank @Email String email,
            @NotBlank        String password
    ) {}

    public record Refresh(@NotBlank String refreshToken) {}
    public record Logout (@NotBlank String refreshToken) {}
}