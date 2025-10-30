package com.example.bigwork.repository;

import com.example.bigwork.model.PracticeQuestion;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PracticeQuestionRepository extends JpaRepository<PracticeQuestion, Long> {
    long countByPracticeSetId(Long practiceSetId);

    List<PracticeQuestion> findByPracticeSetIdOrderByUpdatedAtDesc(Long practiceSetId);
}
