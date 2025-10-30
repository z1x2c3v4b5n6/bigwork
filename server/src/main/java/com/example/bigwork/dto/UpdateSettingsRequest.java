package com.example.bigwork.dto;

import java.util.Map;

public record UpdateSettingsRequest(Map<String, String> settings) {
}
