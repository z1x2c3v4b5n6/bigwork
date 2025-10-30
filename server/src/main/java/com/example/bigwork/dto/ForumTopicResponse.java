package com.example.bigwork.dto;

public record ForumTopicResponse(
        Long id,
        String title,
        String description,
        String author,
        String createdAt,
        String updatedAt
) {
}
