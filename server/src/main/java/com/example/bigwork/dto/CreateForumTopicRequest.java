package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateForumTopicRequest(
        @NotBlank(message = "话题标题不能为空") String title,
        String description,
        String category
) {
}
