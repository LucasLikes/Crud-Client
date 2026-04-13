package com.lume.lumeapi.controller;

import com.lume.lumeapi.domain.dto.request.AuthRequest;
import com.lume.lumeapi.domain.dto.response.AuthResponse;
import com.lume.lumeapi.service.AuthService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1/auth")
@RequiredArgsConstructor
@Tag(name = "Authentication", description = "Endpoints for user authentication")
public class AuthController {

    private final AuthService authService;

    @PostMapping("/register")
    @ResponseStatus(HttpStatus.CREATED)
    @Operation(
            summary = "Register a new user",
            description = "Accepts only email and password. Name is derived from the email local part."
    )
    public AuthResponse.Message register(@Valid @RequestBody AuthRequest.Register request) {
        return authService.register(request);
    }

    @PostMapping("/login")
    @Operation(summary = "Login and receive access + refresh tokens")
    public AuthResponse.TokenPair login(@Valid @RequestBody AuthRequest.Login request) {
        return authService.login(request);
    }

    /**
     * Refresh com token rotation.
     * Retorna novo par { accessToken, refreshToken }.
     * O cliente DEVE substituir o refreshToken armazenado pelo novo.
     */
    @PostMapping("/refresh")
    @Operation(
            summary = "Refresh tokens (rotation)",
            description = "Invalidates the current refresh token and returns a new token pair."
    )
    public AuthResponse.TokenPair refresh(@Valid @RequestBody AuthRequest.Refresh request) {
        return authService.refresh(request);
    }

    @PostMapping("/logout")
    @Operation(summary = "Invalidate the refresh token")
    public AuthResponse.Message logout(@Valid @RequestBody AuthRequest.Logout request) {
        return authService.logout(request);
    }
}