package com.lume.lumeapi.security;

import com.lume.lumeapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Security expression bean.
 * Used as: @PreAuthorize("hasRole('ADMIN') or @userSecurity.isOwner(#id)")
 */
@Component("userSecurity")
@RequiredArgsConstructor
public class UserSecurity {

    private final UserRepository userRepository;

    public boolean isOwner(Long userId) {
        var callerEmail = SecurityContextHolder.getContext()
                .getAuthentication().getName();
        return userRepository.findById(userId)
                .map(u -> u.getEmail().equals(callerEmail))
                .orElse(false);
    }
}