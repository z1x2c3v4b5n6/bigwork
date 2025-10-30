package com.example.bigwork.dto;

import jakarta.validation.constraints.NotBlank;

public record CreateForumPostRequest(
        @NotBlank(message = "回帖内容不能为空") String content
) {
}
