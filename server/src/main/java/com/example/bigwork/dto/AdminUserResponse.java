package com.example.bigwork.dto;

public record AdminUserResponse(
        Long id,
        String username,
        String displayName,
        String role,
        String email,
        String createdAt,
        String updatedAt
) {
}
