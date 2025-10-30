package com.example.bigwork.service;

import com.example.bigwork.dto.CreatePracticeQuestionRequest;
import com.example.bigwork.dto.CreatePracticeSetRequest;
import com.example.bigwork.dto.PracticeQuestionResponse;
import com.example.bigwork.dto.PracticeSetSummary;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.PracticeQuestion;
import com.example.bigwork.model.PracticeSet;
import com.example.bigwork.repository.PracticeQuestionRepository;
import com.example.bigwork.repository.PracticeSetRepository;
import com.example.bigwork.support.DateTimeUtils;
import com.example.bigwork.support.SessionUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Objects;

@Service
public class PracticeService {

    private final PracticeSetRepository practiceSetRepository;
    private final PracticeQuestionRepository practiceQuestionRepository;

    public PracticeService(PracticeSetRepository practiceSetRepository, PracticeQuestionRepository practiceQuestionRepository) {
        this.practiceSetRepository = practiceSetRepository;
        this.practiceQuestionRepository = practiceQuestionRepository;
    }

    @Transactional(readOnly = true)
    public List<PracticeSetSummary> listPracticeSets() {
        return practiceSetRepository.findAll().stream()
                .map(set -> new PracticeSetSummary(
                        set.getId(),
                        set.getTitle(),
                        set.getDescription(),
                        set.getDifficulty(),
                        splitTags(set.getTags()),
                        practiceQuestionRepository.countByPracticeSetId(set.getId()),
                        DateTimeUtils.format(set.getCreatedAt()),
                        DateTimeUtils.format(set.getUpdatedAt())
                ))
                .toList();
    }

    @Transactional
    public Long createPracticeSet(CreatePracticeSetRequest request, SessionUser sessionUser) {
        PracticeSet set = new PracticeSet();
        set.setTitle(request.title());
        set.setDescription(request.description());
        set.setDifficulty(request.difficulty() != null ? request.difficulty() : "medium");
        set.setTags(joinTags(request.tags()));
        set.setCreatedBy(sessionUser != null ? sessionUser.getId() : null);
        LocalDateTime now = LocalDateTime.now();
        set.setCreatedAt(now);
        set.setUpdatedAt(now);
        PracticeSet saved = practiceSetRepository.save(set);
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<PracticeQuestionResponse> listPracticeQuestions(Long setId) {
        ensurePracticeSetExists(setId);
        return practiceQuestionRepository.findByPracticeSetIdOrderByUpdatedAtDesc(setId).stream()
                .map(question -> new PracticeQuestionResponse(
                        question.getId(),
                        question.getQuestionText(),
                        question.getAnswerText(),
                        question.getExplanation(),
                        splitTags(question.getTags()),
                        question.getDifficulty(),
                        DateTimeUtils.format(question.getCreatedAt()),
                        DateTimeUtils.format(question.getUpdatedAt())
                ))
                .toList();
    }

    @Transactional
    public Long createPracticeQuestion(Long setId, CreatePracticeQuestionRequest request, SessionUser sessionUser) {
        PracticeSet set = ensurePracticeSetExists(setId);
        PracticeQuestion question = new PracticeQuestion();
        question.setPracticeSetId(set.getId());
        question.setQuestionText(request.questionText());
        question.setAnswerText(request.answerText());
        question.setExplanation(request.explanation());
        question.setTags(joinTags(request.tags()));
        question.setDifficulty(request.difficulty() != null ? request.difficulty() : "medium");
        question.setCreatedBy(sessionUser != null ? sessionUser.getId() : null);
        LocalDateTime now = LocalDateTime.now();
        question.setCreatedAt(now);
        question.setUpdatedAt(now);
        PracticeQuestion saved = practiceQuestionRepository.save(question);
        return saved.getId();
    }

    private PracticeSet ensurePracticeSetExists(Long setId) {
        return practiceSetRepository.findById(setId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "题单不存在"));
    }

    private String joinTags(List<String> tags) {
        if (tags == null || tags.isEmpty()) {
            return null;
        }
        List<String> sanitized = tags.stream()
                .filter(Objects::nonNull)
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toList();
        if (sanitized.isEmpty()) {
            return null;
        }
        return String.join(",", sanitized);
    }

    private String[] splitTags(String tags) {
        if (tags == null || tags.isBlank()) {
            return new String[0];
        }
        return java.util.Arrays.stream(tags.split(","))
                .map(String::trim)
                .filter(s -> !s.isEmpty())
                .toArray(String[]::new);
    }
}
