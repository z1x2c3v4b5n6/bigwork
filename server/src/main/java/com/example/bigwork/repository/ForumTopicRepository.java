package com.example.bigwork.repository;

import com.example.bigwork.model.ForumTopic;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumTopicRepository extends JpaRepository<ForumTopic, Long> {
    List<ForumTopic> findByTitleContainingIgnoreCase(String keyword);
}
