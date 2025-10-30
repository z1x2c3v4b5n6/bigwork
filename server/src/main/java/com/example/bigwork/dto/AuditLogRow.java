package com.example.bigwork.dto;

public record AuditLogRow(
        Long id,
        String title,
        String description,
        String actor,
        String createdAt
) {
}
