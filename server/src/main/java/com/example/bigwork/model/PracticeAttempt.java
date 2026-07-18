package com.example.bigwork.model;

import jakarta.persistence.*;
import java.time.LocalDateTime;

@Entity
@Table(name = "practice_attempts")
public class PracticeAttempt {
    @Id @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;
    @Column(name = "practice_set_id", nullable = false) private Long practiceSetId;
    @Column(name = "user_id", nullable = false) private Long userId;
    @Column(nullable = false) private int total;
    @Column(nullable = false) private int correct;
    @Column(nullable = false) private int score;
    @Column(name = "submitted_at", nullable = false) private LocalDateTime submittedAt;
    public Long getId() { return id; }
    public Long getPracticeSetId() { return practiceSetId; }
    public void setPracticeSetId(Long value) { practiceSetId = value; }
    public Long getUserId() { return userId; }
    public void setUserId(Long value) { userId = value; }
    public int getTotal() { return total; }
    public void setTotal(int value) { total = value; }
    public int getCorrect() { return correct; }
    public void setCorrect(int value) { correct = value; }
    public int getScore() { return score; }
    public void setScore(int value) { score = value; }
    public LocalDateTime getSubmittedAt() { return submittedAt; }
    public void setSubmittedAt(LocalDateTime value) { submittedAt = value; }
}
