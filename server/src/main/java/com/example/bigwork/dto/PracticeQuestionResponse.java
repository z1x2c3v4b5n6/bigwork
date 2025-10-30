package com.example.bigwork.dto;

public record PracticeQuestionResponse(
        Long id,
        String questionText,
        String answerText,
        String explanation,
        String[] tags,
        String difficulty,
        String createdAt,
        String updatedAt
) {
}
