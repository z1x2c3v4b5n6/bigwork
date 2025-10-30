package com.example.bigwork.dto;

public record UserResponse(
        Long id,
        String name,
        String role,
        String email
) {
}
