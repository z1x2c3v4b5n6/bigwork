package com.example.bigwork.repository;

import com.example.bigwork.model.CourseMaterial;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface CourseMaterialRepository extends JpaRepository<CourseMaterial, Long> {
    List<CourseMaterial> findByTitleContainingIgnoreCase(String keyword);
}
