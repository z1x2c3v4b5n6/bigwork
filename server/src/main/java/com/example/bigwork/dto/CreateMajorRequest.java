package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateMajorRequest(
        @NotBlank(message = "专业名称不能为空") String name,
        String description
) {
}
