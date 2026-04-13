package com.lume.lumeapi.service;

import com.lume.lumeapi.domain.dto.request.UserRequest;
import com.lume.lumeapi.domain.dto.response.UserResponse;
import com.lume.lumeapi.domain.entity.User;
import com.lume.lumeapi.exception.EmailAlreadyExistsException;
import com.lume.lumeapi.exception.ForbiddenException;
import com.lume.lumeapi.exception.ResourceNotFoundException;
import com.lume.lumeapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserService {

    private final UserRepository  userRepository;
    private final PasswordEncoder passwordEncoder;

    // ── Create (admin only via @PreAuthorize on controller) ──────────────────

    @Transactional
    public UserResponse create(UserRequest.Create req) {
        if (userRepository.existsByEmail(req.email())) {
            throw new EmailAlreadyExistsException(req.email());
        }

        var user = User.builder()
                .firstName(req.firstName())
                .lastName(req.lastName())
                .email(req.email())
                .password(passwordEncoder.encode(req.password()))
                .role(req.role())
                .build();

        return UserResponse.from(userRepository.save(user));
    }

    // ── Read ─────────────────────────────────────────────────────────────────

    @Transactional(readOnly = true)
    public List<UserResponse> findAll() {
        return userRepository.findAll().stream()
                .map(UserResponse::from)
                .toList();
    }

    @Transactional(readOnly = true)
    public UserResponse findById(Long id) {
        return userRepository.findById(id)
                .map(UserResponse::from)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));
    }

    // ── Update ───────────────────────────────────────────────────────────────

    /**
     * Admin   → can update any user, including their role.
     * Regular → can only update their own profile, role field is ignored.
     */
    @Transactional
    public UserResponse update(Long id, UserRequest.Update req) {
        var callerEmail = callerEmail();
        var callerAdmin = isCallerAdmin();

        var user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User", id));

        if (!callerAdmin && !user.getEmail().equals(callerEmail)) {
            throw new ForbiddenException("You can only update your own profile");
        }

        if (userRepository.existsByEmailAndIdNot(req.email(), id)) {
            throw new EmailAlreadyExistsException(req.email());
        }

        user.setFirstName(req.firstName());
        user.setLastName(req.lastName());
        user.setEmail(req.email());

        // Password: only update when explicitly provided
        if (req.password() != null && !req.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(req.password()));
        }

        // Role: admin-only change
        if (callerAdmin && req.role() != null && !req.role().isBlank()) {
            user.setRole(req.role());
        }

        return UserResponse.from(userRepository.save(user));
    }

    // ── Delete (admin only via @PreAuthorize on controller) ──────────────────

    @Transactional
    public void delete(Long id) {
        if (!userRepository.existsById(id)) {
            throw new ResourceNotFoundException("User", id);
        }
        userRepository.deleteById(id);
    }

    // ── Helpers ──────────────────────────────────────────────────────────────

    private String callerEmail() {
        return SecurityContextHolder.getContext().getAuthentication().getName();
    }

    private boolean isCallerAdmin() {
        return SecurityContextHolder.getContext().getAuthentication()
                .getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN"));
    }
}