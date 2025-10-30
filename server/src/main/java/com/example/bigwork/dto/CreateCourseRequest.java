package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateCourseRequest(
        @NotBlank(message = "课程标题不能为空") String title,
        String description,
        String teacher,
        Double credit,
        Long majorId
) {
}
