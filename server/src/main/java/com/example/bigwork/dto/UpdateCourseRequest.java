package com.example.bigwork.dto;

public record UpdateCourseRequest(
        String title,
        String description,
        String teacher,
        Double credit,
        Long majorId
) {
}
