package com.lume.lumeapi.domain.dto.response;

import com.lume.lumeapi.domain.entity.User;

/** Public projection — password never exposed. */
public record UserResponse(
        Long   id,
        String firstName,
        String lastName,
        String fullName,
        String email,
        String role
) {
    public static UserResponse from(User user) {
        return new UserResponse(
                user.getId(),
                user.getFirstName(),
                user.getLastName(),
                user.getFullName(),
                user.getEmail(),
                user.getRole()
        );
    }
}