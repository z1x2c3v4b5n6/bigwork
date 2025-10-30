package com.example.bigwork.dto;

public record ForumPostResponse(
        Long id,
        String content,
        String author,
        String createdAt,
        String updatedAt
) {
}
