package com.lume.lumeapi.config;

import com.lume.lumeapi.domain.entity.User;
import com.lume.lumeapi.enums.Role;
import com.lume.lumeapi.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.ApplicationArguments;
import org.springframework.boot.ApplicationRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

@Slf4j
@Component
@RequiredArgsConstructor
public class Datainitializer implements ApplicationRunner {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    @Override
    public void run(ApplicationArguments args) {
        if (userRepository.existsByEmail("admin@lume.com")) return;

        userRepository.save(User.builder()
                .firstName("Admin")
                .lastName("Lume")
                .email("admin@lume.com")
                .password(passwordEncoder.encode("admin123"))
                .role(Role.ROLE_ADMIN)
                .build());

        log.info("Default admin created → admin@lume.com / admin123");
    }
}