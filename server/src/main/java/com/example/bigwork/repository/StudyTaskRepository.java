package com.example.bigwork.repository;

import com.example.bigwork.model.StudyTask;
import org.springframework.data.jpa.repository.JpaRepository;

import java.time.LocalDateTime;

public interface StudyTaskRepository extends JpaRepository<StudyTask, Long> {
    long countByCompletedIsTrueAndCompletedAtBetween(LocalDateTime start, LocalDateTime end);
}
