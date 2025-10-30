package com.example.bigwork.dto;

public record MaterialResponse(
        Long id,
        String title,
        String description,
        String fileUrl,
        Long courseId,
        String courseTitle
) {
}
