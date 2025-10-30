package com.example.bigwork.dto;

public record StatisticsOverview(
        long totalUsers,
        long totalMajors,
        long totalCourses,
        long totalMaterials,
        long totalPracticeSets,
        long totalForumPosts,
        String lastUpdatedAt
) {
}
