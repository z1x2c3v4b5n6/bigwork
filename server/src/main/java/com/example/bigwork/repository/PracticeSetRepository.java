package com.example.bigwork.repository;

import com.example.bigwork.model.PracticeSet;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface PracticeSetRepository extends JpaRepository<PracticeSet, Long> {
    List<PracticeSet> findByTitleContainingIgnoreCase(String keyword);
}
