package com.example.bigwork.dto;

import java.util.List;
import java.util.Map;

public record AdminSearchResponse(
        List<Map<String, Object>> users,
        List<Map<String, Object>> majors,
        List<Map<String, Object>> courses,
        List<Map<String, Object>> materials,
        List<Map<String, Object>> forumTopics
) {
}
