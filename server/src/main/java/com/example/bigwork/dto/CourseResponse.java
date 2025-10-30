package com.example.bigwork.dto;

public record CourseResponse(
        Long id,
        String title,
        String description,
        String teacher,
        Double credit,
        Long majorId,
        String majorName
) {
}
