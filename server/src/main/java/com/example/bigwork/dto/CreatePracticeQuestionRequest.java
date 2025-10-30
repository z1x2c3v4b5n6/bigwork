package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

import java.util.List;

public record CreatePracticeQuestionRequest(
        @NotBlank(message = "题干不能为空") String questionText,
        String answerText,
        String explanation,
        List<String> tags,
        String difficulty
) {
}
