package com.example.bigwork.repository;

import com.example.bigwork.model.ForumPost;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface ForumPostRepository extends JpaRepository<ForumPost, Long> {
    List<ForumPost> findByTopicIdOrderByCreatedAtAsc(Long topicId);

    long countByTopicId(Long topicId);
}
