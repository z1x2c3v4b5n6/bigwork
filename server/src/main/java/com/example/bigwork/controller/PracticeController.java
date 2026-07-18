package com.example.bigwork.controller;

import com.example.bigwork.dto.CreatePracticeQuestionRequest;
import com.example.bigwork.dto.CreatePracticeSetRequest;
import com.example.bigwork.dto.PracticeQuestionResponse;
import com.example.bigwork.dto.PracticeSetSummary;
import com.example.bigwork.dto.PracticeResultResponse;
import com.example.bigwork.dto.SubmitPracticeRequest;
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

    private SessionUser requireAdmin(HttpSession session) {
        SessionUser user = requireLogin(session);
        if (!"admin".equalsIgnoreCase(user.getRole())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "仅管理员可以维护题库");
        }
        return user;
    }

    @GetMapping("/sets")
    public ResponseEntity<Map<String, List<PracticeSetSummary>>> listSets() {
        return ResponseEntity.ok(Map.of("sets", practiceService.listPracticeSets()));
    }

    @PostMapping("/sets")
    public ResponseEntity<Map<String, Long>> createSet(@Valid @RequestBody CreatePracticeSetRequest request, HttpSession session) {
        SessionUser user = requireAdmin(session);
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
        SessionUser user = requireAdmin(session);
        Long id = practiceService.createPracticeQuestion(setId, request, user);
        return ResponseEntity.status(201).body(Map.of("id", id));
    }

    @PutMapping("/sets/{setId}/questions/{questionId}")
    public ResponseEntity<Void> updateQuestion(@PathVariable Long setId, @PathVariable Long questionId,
                                               @Valid @RequestBody CreatePracticeQuestionRequest request,
                                               HttpSession session) {
        requireAdmin(session);
        practiceService.updatePracticeQuestion(setId, questionId, request);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/sets/{setId}/questions/{questionId}")
    public ResponseEntity<Void> deleteQuestion(@PathVariable Long setId, @PathVariable Long questionId,
                                               HttpSession session) {
        requireAdmin(session);
        practiceService.deletePracticeQuestion(setId, questionId);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/sets/{setId}/submit")
    public PracticeResultResponse submit(@PathVariable Long setId, @Valid @RequestBody SubmitPracticeRequest request,
                                         HttpSession session) {
        return practiceService.submit(setId, request, requireLogin(session));
    }

    @GetMapping("/progress")
    public Map<String, Object> progress(HttpSession session) {
        return practiceService.progress(requireLogin(session));
    }

    @GetMapping("/wrong-questions")
    public Map<String, Object> wrongQuestions(HttpSession session) {
        return Map.of("questions", practiceService.wrongQuestions(requireLogin(session)));
    }
}
