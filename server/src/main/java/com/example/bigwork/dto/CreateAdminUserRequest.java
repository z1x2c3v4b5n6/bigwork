package com.example.bigwork.dto;

import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;

public record CreateAdminUserRequest(
        @NotBlank(message = "用户名不能为空") String username,
        @NotBlank(message = "密码不能为空") String password,
        @NotBlank(message = "请填写显示名称") String displayName,
        String role,
        @Email(message = "邮箱格式不正确") String email
) {
}
