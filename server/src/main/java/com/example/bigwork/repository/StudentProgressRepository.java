package com.example.bigwork.repository;

import com.example.bigwork.model.StudentProgress;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface StudentProgressRepository extends JpaRepository<StudentProgress, Long> {
    List<StudentProgress> findTop10ByOrderByUpdatedAtDesc();
}
