package com.example.bigwork.repository;

import com.example.bigwork.model.Major;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface MajorRepository extends JpaRepository<Major, Long> {
    List<Major> findByNameContainingIgnoreCase(String keyword);
}
