package com.example.bigwork.repository;
import com.example.bigwork.model.ForumInteraction;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.*;
public interface ForumInteractionRepository extends JpaRepository<ForumInteraction,Long>{
 Optional<ForumInteraction> findByTopicIdAndUserId(Long topicId,Long userId);
 List<ForumInteraction> findByTopicId(Long topicId);
 void deleteByTopicId(Long topicId);
}
