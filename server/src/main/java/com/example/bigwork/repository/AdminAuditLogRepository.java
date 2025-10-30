package com.example.bigwork.repository;

import com.example.bigwork.model.AdminAuditLog;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;

public interface AdminAuditLogRepository extends JpaRepository<AdminAuditLog, Long> {
    List<AdminAuditLog> findTop10ByOrderByCreatedAtDesc();
}
