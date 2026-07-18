package com.example.bigwork.dto;
import java.util.List;
public record PracticeResultResponse(Long attemptId, int total, int correct, int score, List<QuestionResult> details) {
    public record QuestionResult(Long questionId, boolean correct, String submittedAnswer, String correctAnswer, String explanation, List<String> matchedPoints, List<String> missedPoints) {}
}
