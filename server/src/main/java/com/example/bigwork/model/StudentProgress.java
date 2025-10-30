package com.example.bigwork.model;

import jakarta.persistence.*;

import java.time.LocalDateTime;

@Entity
@Table(name = "student_progress")
public class StudentProgress {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @Column(name = "user_id", nullable = false)
    private Long userId;

    @Column(name = "target_university", length = 120)
    private String targetUniversity;

    @Column(name = "weekly_study_hours")
    private Integer weeklyStudyHours;

    @Column(name = "completion_rate")
    private Double completionRate;

    @Column(name = "updated_at", nullable = false)
    private LocalDateTime updatedAt;

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public Long getUserId() {
        return userId;
    }

    public void setUserId(Long userId) {
        this.userId = userId;
    }

    public String getTargetUniversity() {
        return targetUniversity;
    }

    public void setTargetUniversity(String targetUniversity) {
        this.targetUniversity = targetUniversity;
    }

    public Integer getWeeklyStudyHours() {
        return weeklyStudyHours;
    }

    public void setWeeklyStudyHours(Integer weeklyStudyHours) {
        this.weeklyStudyHours = weeklyStudyHours;
    }

    public Double getCompletionRate() {
        return completionRate;
    }

    public void setCompletionRate(Double completionRate) {
        this.completionRate = completionRate;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
