package com.example.bigwork.repository;
import com.example.bigwork.model.WrongQuestion;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;
import java.util.Optional;
public interface WrongQuestionRepository extends JpaRepository<WrongQuestion, Long> {
    Optional<WrongQuestion> findByUserIdAndQuestionId(Long userId, Long questionId);
    List<WrongQuestion> findByUserIdOrderByLastWrongAtDesc(Long userId);
}
