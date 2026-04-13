package com.lume.lumeapi.domain.dto.request;

import jakarta.validation.constraints.*;

public class UserRequest {

    /** Admin creates a user — all fields required, including password. */
    public record Create(

            @NotBlank(message = "First name is required")
            String firstName,

            @NotBlank(message = "Last name is required")
            String lastName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @NotBlank(message = "Password is required")
            @Size(min = 6, message = "Password must be at least 6 characters")
            String password,

            @NotBlank(message = "Role is required")
            @Pattern(
                    regexp  = "ROLE_USER|ROLE_ADMIN",
                    message = "Role must be ROLE_USER or ROLE_ADMIN"
            )
            String role
    ) {}

    /**
     * Used for updates (admin or own profile).
     * password → optional, only applied when non-blank.
     * role     → optional, only admin may change it (enforced in service).
     */
    public record Update(

            @NotBlank(message = "First name is required")
            String firstName,

            @NotBlank(message = "Last name is required")
            String lastName,

            @NotBlank(message = "Email is required")
            @Email(message = "Invalid email format")
            String email,

            @Size(min = 6, message = "Password must be at least 6 characters")
            String password,   // null / blank = keep current

            @Pattern(
                    regexp  = "ROLE_USER|ROLE_ADMIN",
                    message = "Role must be ROLE_USER or ROLE_ADMIN"
            )
            String role        // null = keep current (non-admin callers omit this)
    ) {}
}