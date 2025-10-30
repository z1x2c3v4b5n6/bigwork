package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreatePracticeSetRequest(
        @NotBlank(message = "题单标题不能为空") String title,
        String description,
        String difficulty,
        List<String> tags
) {
}
