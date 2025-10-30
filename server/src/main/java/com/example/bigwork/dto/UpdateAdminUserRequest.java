package com.example.bigwork.dto;

public record UpdateAdminUserRequest(
        String password,
        String displayName,
        String role,
        String email
) {
}
