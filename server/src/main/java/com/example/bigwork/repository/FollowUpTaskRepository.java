package com.example.bigwork.repository;

import com.example.bigwork.model.FollowUpTask;
import org.springframework.data.jpa.repository.JpaRepository;

public interface FollowUpTaskRepository extends JpaRepository<FollowUpTask, Long> {
    long countByStatus(String status);
}
