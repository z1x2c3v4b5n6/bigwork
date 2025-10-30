package com.example.bigwork.service;

import com.example.bigwork.dto.LoginRequest;
import com.example.bigwork.dto.RegisterRequest;
import com.example.bigwork.dto.UserResponse;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.User;
import com.example.bigwork.repository.UserRepository;
import com.example.bigwork.support.SessionUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AuthService(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public SessionUser login(LoginRequest request) {
        User user = userRepository.findByUsername(request.username())
                .orElseThrow(() -> new BusinessException(HttpStatus.UNAUTHORIZED, "账号或密码错误"));

        if (!passwordMatches(request.password(), user.getPassword())) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "账号或密码错误");
        }

        return toSessionUser(user);
    }

    @Transactional
    public SessionUser register(RegisterRequest request) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(HttpStatus.CONFLICT, "用户名已存在");
        }

        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setEmail(request.email());
        user.setRole("student");
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);

        User saved = userRepository.save(user);
        return toSessionUser(saved);
    }

    @Transactional(readOnly = true)
    public SessionUser refreshSession(Long userId) {
        if (userId == null) {
            return null;
        }

        return userRepository.findById(userId)
                .map(this::toSessionUser)
                .orElse(null);
    }

    public UserResponse toUserResponse(SessionUser sessionUser) {
        if (sessionUser == null) {
            return null;
        }
        return new UserResponse(
                sessionUser.getId(),
                sessionUser.getDisplayName(),
                sessionUser.getRole(),
                sessionUser.getEmail()
        );
    }

    private boolean passwordMatches(String rawPassword, String storedPassword) {
        if (storedPassword == null) {
            return false;
        }
        if (storedPassword.startsWith("$2a$") || storedPassword.startsWith("$2b$") || storedPassword.startsWith("$2y$")) {
            return passwordEncoder.matches(rawPassword, storedPassword);
        }
        return storedPassword.equals(rawPassword);
    }

    private SessionUser toSessionUser(User user) {
        return new SessionUser(
                user.getId(),
                user.getUsername(),
                user.getDisplayName(),
                user.getRole(),
                user.getEmail()
        );
    }
}
