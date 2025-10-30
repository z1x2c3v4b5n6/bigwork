package com.example.bigwork.dto;

import java.util.List;

public record AdminDashboardResponse(
        AdminDashboardMetrics metrics,
        List<StudentProgressRow> studentProgress,
        List<AuditLogRow> auditLogs,
        List<String> administrators,
        String securityNote
) {
}
