package com.example.bigwork.controller;

import com.example.bigwork.dto.CreatePracticeQuestionRequest;
import com.example.bigwork.dto.CreatePracticeSetRequest;
import com.example.bigwork.dto.PracticeQuestionResponse;
import com.example.bigwork.dto.PracticeSetSummary;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.service.PracticeService;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/practice")
public class PracticeController {

    private static final String SESSION_KEY = "AUTH_USER";

    private final PracticeService practiceService;

    public PracticeController(PracticeService practiceService) {
        this.practiceService = practiceService;
    }

    private SessionUser requireLogin(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SESSION_KEY);
        if (user == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "请先登录");
        }
        return user;
    }

    @GetMapping("/sets")
    public ResponseEntity<Map<String, List<PracticeSetSummary>>> listSets() {
        return ResponseEntity.ok(Map.of("sets", practiceService.listPracticeSets()));
    }

    @PostMapping("/sets")
    public ResponseEntity<Map<String, Long>> createSet(@Valid @RequestBody CreatePracticeSetRequest request, HttpSession session) {
        SessionUser user = requireLogin(session);
        Long id = practiceService.createPracticeSet(request, user);
        return ResponseEntity.status(201).body(Map.of("id", id));
    }

    @GetMapping("/sets/{setId}/questions")
    public ResponseEntity<Map<String, List<PracticeQuestionResponse>>> listQuestions(@PathVariable Long setId) {
        return ResponseEntity.ok(Map.of("questions", practiceService.listPracticeQuestions(setId)));
    }

    @PostMapping("/sets/{setId}/questions")
    public ResponseEntity<Map<String, Long>> createQuestion(
            @PathVariable Long setId,
            @Valid @RequestBody CreatePracticeQuestionRequest request,
            HttpSession session
    ) {
        SessionUser user = requireLogin(session);
        Long id = practiceService.createPracticeQuestion(setId, request, user);
        return ResponseEntity.status(201).body(Map.of("id", id));
    }
}
