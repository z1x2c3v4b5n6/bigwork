package com.example.bigwork.repository;

import com.example.bigwork.model.SystemAlert;
import org.springframework.data.jpa.repository.JpaRepository;

public interface SystemAlertRepository extends JpaRepository<SystemAlert, Long> {
    long countByResolvedFalse();
}
