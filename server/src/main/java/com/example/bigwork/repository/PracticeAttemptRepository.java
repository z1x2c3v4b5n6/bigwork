package com.example.bigwork.repository;
import com.example.bigwork.model.PracticeAttempt;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
public interface PracticeAttemptRepository extends JpaRepository<PracticeAttempt, Long> {
    List<PracticeAttempt> findByUserIdOrderBySubmittedAtDesc(Long userId);
}
