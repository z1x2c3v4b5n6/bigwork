package com.example.bigwork.dto;
import jakarta.validation.Valid;
import jakarta.validation.constraints.NotEmpty;
import jakarta.validation.constraints.NotNull;
import java.util.List;
public record SubmitPracticeRequest(@NotEmpty List<@Valid Answer> answers) {
    public record Answer(@NotNull Long questionId, String answer) {}
}
