package com.example.bigwork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "wrong_questions", uniqueConstraints = @UniqueConstraint(columnNames = {"user_id", "question_id"}))
public class WrongQuestion {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY) private Long id;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(name = "question_id", nullable = false) private Long questionId;
    @Column(name = "wrong_answer", columnDefinition = "TEXT") private String wrongAnswer;
    @Column(name = "wrong_count", nullable = false) private int wrongCount;
    @Column(name = "last_wrong_at", nullable = false) private LocalDateTime lastWrongAt;
    public Long getId() { return id; }
    public Long getUserId() { return userId; }
    public void setUserId(Long value) { userId = value; }
    public Long getQuestionId() { return questionId; }
    public void setQuestionId(Long value) { questionId = value; }
    public String getWrongAnswer() { return wrongAnswer; }
    public void setWrongAnswer(String value) { wrongAnswer = value; }
    public int getWrongCount() { return wrongCount; }
    public void setWrongCount(int value) { wrongCount = value; }
    public LocalDateTime getLastWrongAt() { return lastWrongAt; }
    public void setLastWrongAt(LocalDateTime value) { lastWrongAt = value; }
}
