package com.example.bigwork.controller;

import com.example.bigwork.dto.LoginRequest;
import com.example.bigwork.dto.RegisterRequest;
import com.example.bigwork.dto.UserResponse;
import com.example.bigwork.service.AuthService;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    private static final String SESSION_KEY = "AUTH_USER";

    private final AuthService authService;

    public AuthController(AuthService authService) {
        this.authService = authService;
    }

    @GetMapping("/session")
    public ResponseEntity<Map<String, Object>> getSession(HttpSession session) {
        SessionUser sessionUser = (SessionUser) session.getAttribute(SESSION_KEY);
        Map<String, Object> body = new java.util.HashMap<>();
        body.put("user", authService.toUserResponse(sessionUser));
        return ResponseEntity.ok(body);
    }

    @PostMapping("/login")
    public ResponseEntity<Map<String, Object>> login(@Valid @RequestBody LoginRequest request, HttpSession session) {
        SessionUser user = authService.login(request);
        session.setAttribute(SESSION_KEY, user);
        UserResponse response = authService.toUserResponse(user);
        return ResponseEntity.ok(Map.of("user", response));
    }

    @PostMapping("/register")
    public ResponseEntity<Map<String, Object>> register(@Valid @RequestBody RegisterRequest request, HttpSession session) {
        SessionUser user = authService.register(request);
        session.setAttribute(SESSION_KEY, user);
        UserResponse response = authService.toUserResponse(user);
        return ResponseEntity.ok(Map.of("user", response));
    }

    @PostMapping("/logout")
    public ResponseEntity<Void> logout(HttpSession session) {
        session.invalidate();
        return ResponseEntity.noContent().build();
    }
}
