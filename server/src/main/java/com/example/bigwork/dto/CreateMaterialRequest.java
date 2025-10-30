package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMaterialRequest(
        @NotBlank(message = "资料标题不能为空") String title,
        String description,
        String fileUrl,
        Long courseId
) {
}
