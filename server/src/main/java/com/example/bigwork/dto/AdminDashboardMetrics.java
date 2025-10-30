package com.example.bigwork.dto;

public record AdminDashboardMetrics(
        long activeStudents,
        long tasksCompletedToday,
        long followUpsPending,
        long systemAlerts
) {
}
