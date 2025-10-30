package com.example.bigwork.dto;

public record UpdateMaterialRequest(
        String title,
        String description,
        String fileUrl,
        Long courseId
) {
}
