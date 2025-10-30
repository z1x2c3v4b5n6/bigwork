package com.example.bigwork.dto;

public record PracticeSetSummary(
        Long id,
        String title,
        String description,
        String difficulty,
        String[] tags,
        long questionCount,
        String createdAt,
        String updatedAt
) {
}
