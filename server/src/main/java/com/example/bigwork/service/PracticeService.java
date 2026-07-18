package com.example.bigwork.service;

import com.example.bigwork.dto.CreatePracticeQuestionRequest;
import com.example.bigwork.dto.CreatePracticeSetRequest;
import com.example.bigwork.dto.PracticeQuestionResponse;
import com.example.bigwork.dto.PracticeSetSummary;
import com.example.bigwork.dto.PracticeResultResponse;
import com.example.bigwork.dto.SubmitPracticeRequest;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.PracticeQuestion;
import com.example.bigwork.model.PracticeSet;
import com.example.bigwork.model.PracticeAttempt;
import com.example.bigwork.model.WrongQuestion;
import com.example.bigwork.repository.PracticeAttemptRepository;
import com.example.bigwork.repository.PracticeQuestionRepository;
import com.example.bigwork.repository.PracticeSetRepository;
import com.example.bigwork.repository.WrongQuestionRepository;
import com.example.bigwork.support.DateTimeUtils;
import com.example.bigwork.support.SessionUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;
import java.util.Arrays;
import java.util.Objects;
import java.util.Map;
import java.util.function.Function;
import java.util.stream.Collectors;

@Service
public class PracticeService {

    private final PracticeSetRepository practiceSetRepository;
    private final PracticeQuestionRepository practiceQuestionRepository;
    private final PracticeAttemptRepository practiceAttemptRepository;
    private final WrongQuestionRepository wrongQuestionRepository;

    public PracticeService(PracticeSetRepository practiceSetRepository, PracticeQuestionRepository practiceQuestionRepository,
                           PracticeAttemptRepository practiceAttemptRepository, WrongQuestionRepository wrongQuestionRepository) {
        this.practiceSetRepository = practiceSetRepository;
        this.practiceQuestionRepository = practiceQuestionRepository;
        this.practiceAttemptRepository = practiceAttemptRepository;
        this.wrongQuestionRepository = wrongQuestionRepository;
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

    @Transactional
    public void updatePracticeQuestion(Long setId, Long questionId, CreatePracticeQuestionRequest request) {
        ensurePracticeSetExists(setId);
        PracticeQuestion question = practiceQuestionRepository.findById(questionId)
                .filter(item -> item.getPracticeSetId().equals(setId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "题目不存在"));
        question.setQuestionText(request.questionText());
        question.setAnswerText(request.answerText());
        question.setExplanation(request.explanation());
        question.setTags(joinTags(request.tags()));
        question.setDifficulty(request.difficulty() == null ? question.getDifficulty() : request.difficulty());
        question.setUpdatedAt(LocalDateTime.now());
        practiceQuestionRepository.save(question);
    }

    @Transactional
    public void deletePracticeQuestion(Long setId, Long questionId) {
        PracticeQuestion question = practiceQuestionRepository.findById(questionId)
                .filter(item -> item.getPracticeSetId().equals(setId))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "题目不存在"));
        practiceQuestionRepository.delete(question);
    }

    @Transactional
    public PracticeResultResponse submit(Long setId, SubmitPracticeRequest request, SessionUser user) {
        ensurePracticeSetExists(setId);
        List<PracticeQuestion> questions = practiceQuestionRepository.findByPracticeSetIdOrderByUpdatedAtDesc(setId);
        Map<Long, PracticeQuestion> byId = questions.stream()
                .collect(Collectors.toMap(PracticeQuestion::getId, Function.identity()));
        if (request.answers().size() != questions.size()) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "请完成全部题目后再提交");
        }
        int correct = 0;
        LocalDateTime now = LocalDateTime.now();
        List<PracticeResultResponse.QuestionResult> details = new java.util.ArrayList<>();
        for (SubmitPracticeRequest.Answer submitted : request.answers()) {
            PracticeQuestion question = byId.get(submitted.questionId());
            if (question == null) {
                throw new BusinessException(HttpStatus.BAD_REQUEST, "提交内容包含不属于该题单的题目");
            }
            boolean isCorrect = answerMatches(question.getAnswerText(), submitted.answer());
            if (isCorrect) {
                correct++;
                wrongQuestionRepository.findByUserIdAndQuestionId(user.getId(), question.getId())
                        .ifPresent(wrongQuestionRepository::delete);
            } else {
                WrongQuestion wrong = wrongQuestionRepository.findByUserIdAndQuestionId(user.getId(), question.getId())
                        .orElseGet(WrongQuestion::new);
                wrong.setUserId(user.getId());
                wrong.setQuestionId(question.getId());
                wrong.setWrongAnswer(submitted.answer());
                wrong.setWrongCount(wrong.getWrongCount() + 1);
                wrong.setLastWrongAt(now);
                wrongQuestionRepository.save(wrong);
            }
            List<String> points = answerPoints(question.getAnswerText());
            String normalizedSubmitted = normalize(submitted.answer());
            List<String> matchedPoints = points.stream().filter(p -> normalizedSubmitted.contains(normalize(p))).toList();
            List<String> missedPoints = points.stream().filter(p -> !normalizedSubmitted.contains(normalize(p))).toList();
            details.add(new PracticeResultResponse.QuestionResult(question.getId(), isCorrect, submitted.answer(),
                    question.getAnswerText(), question.getExplanation(), matchedPoints, missedPoints));
        }
        int total = questions.size();
        int score = total == 0 ? 0 : Math.round(correct * 100f / total);
        PracticeAttempt attempt = new PracticeAttempt();
        attempt.setPracticeSetId(setId);
        attempt.setUserId(user.getId());
        attempt.setTotal(total);
        attempt.setCorrect(correct);
        attempt.setScore(score);
        attempt.setSubmittedAt(now);
        PracticeAttempt saved = practiceAttemptRepository.save(attempt);
        return new PracticeResultResponse(saved.getId(), total, correct, score, details);
    }

    private List<String> answerPoints(String answer){
        if(answer==null||answer.isBlank())return List.of();
        List<String> split=Arrays.stream(answer.split("[|，。；、,;\\n]" )).map(String::trim).filter(x->x.length()>=2).toList();
        return split.size()>1?split:List.of(answer.trim());
    }

    @Transactional(readOnly = true)
    public Map<String, Object> progress(SessionUser user) {
        List<PracticeAttempt> attempts = practiceAttemptRepository.findByUserIdOrderBySubmittedAtDesc(user.getId());
        double average = attempts.stream().mapToInt(PracticeAttempt::getScore).average().orElse(0);
        return Map.of("attemptCount", attempts.size(), "averageScore", Math.round(average),
                "wrongCount", wrongQuestionRepository.findByUserIdOrderByLastWrongAtDesc(user.getId()).size(),
                "attempts", attempts);
    }

    @Transactional(readOnly = true)
    public List<Map<String, Object>> wrongQuestions(SessionUser user) {
        return wrongQuestionRepository.findByUserIdOrderByLastWrongAtDesc(user.getId()).stream().map(wrong -> {
            PracticeQuestion question = practiceQuestionRepository.findById(wrong.getQuestionId()).orElse(null);
            Map<String, Object> row = new java.util.LinkedHashMap<>();
            row.put("id", wrong.getId()); row.put("questionId", wrong.getQuestionId());
            row.put("question", question == null ? "题目已删除" : question.getQuestionText());
            row.put("correctAnswer", question == null ? "" : question.getAnswerText());
            row.put("wrongAnswer", wrong.getWrongAnswer()); row.put("wrongCount", wrong.getWrongCount());
            return row;
        }).toList();
    }

    private String normalize(String value) {
        return value == null ? "" : value.toLowerCase().replaceAll("[\\s，。；、,;：:！？!?（）()《》\"']+", "");
    }

    /**
     * 面试简答题采用宽松判定：完全包含、关键短语覆盖或双字相似度达到阈值均视为基本正确。
     * 这样允许语序和表述不同，但不会把完全无关的回答判为正确。
     */
    boolean answerMatches(String standardAnswer, String submittedAnswer) {
        String standard = normalize(standardAnswer);
        String submitted = normalize(submittedAnswer);
        if (standard.isEmpty() || submitted.isEmpty()) return false;
        if (standard.equals(submitted) || submitted.contains(standard) || standard.contains(submitted) && submitted.length() >= 4) return true;

        List<String> keywords = java.util.Arrays.stream(Objects.toString(standardAnswer, "").split("[|，。；、,;\\n]"))
                .map(this::normalize).filter(word -> word.length() >= 2).toList();
        if (keywords.size() >= 2) {
            long hits = keywords.stream().filter(submitted::contains).count();
            if ((double) hits / keywords.size() >= 0.6) return true;
        }
        return bigramSimilarity(standard, submitted) >= 0.45
                || (standard.length() >= 8 && submitted.length() >= 8 && bigramCoverage(standard, submitted) >= 0.35);
    }

    private double bigramSimilarity(String left, String right) {
        if (left.length() < 2 || right.length() < 2) return 0;
        java.util.Set<String> a = new java.util.HashSet<>();
        java.util.Set<String> b = new java.util.HashSet<>();
        for (int i = 0; i < left.length() - 1; i++) a.add(left.substring(i, i + 2));
        for (int i = 0; i < right.length() - 1; i++) b.add(right.substring(i, i + 2));
        java.util.Set<String> intersection = new java.util.HashSet<>(a); intersection.retainAll(b);
        java.util.Set<String> union = new java.util.HashSet<>(a); union.addAll(b);
        return union.isEmpty() ? 0 : (double) intersection.size() / union.size();
    }

    private double bigramCoverage(String left, String right) {
        java.util.Set<String> standardParts = new java.util.HashSet<>();
        java.util.Set<String> answerParts = new java.util.HashSet<>();
        for (int i = 0; i < left.length() - 1; i++) standardParts.add(left.substring(i, i + 2));
        for (int i = 0; i < right.length() - 1; i++) answerParts.add(right.substring(i, i + 2));
        java.util.Set<String> hits = new java.util.HashSet<>(standardParts);
        hits.retainAll(answerParts);
        return standardParts.isEmpty() ? 0 : (double) hits.size() / standardParts.size();
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
