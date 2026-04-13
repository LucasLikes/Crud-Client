package com.lume.lumeapi.security;

public record UserClaims(
        String  nameIdentifier,    // "João Silva" (fullName)
        String  firstName,
        String  lastName,
        String  userLogin,
        String  email,
        Long    idUser,
        String  role,
        String  tenant,
        boolean hasFullPermission
) {}