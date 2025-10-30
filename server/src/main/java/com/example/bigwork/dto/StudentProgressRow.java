package com.example.bigwork.dto;

public record StudentProgressRow(
        Long id,
        String name,
        String university,
        Integer studyHours,
        Double completion
) {
}
