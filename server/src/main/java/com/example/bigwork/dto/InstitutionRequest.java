package com.example.bigwork.dto;
import jakarta.validation.constraints.NotBlank;
public record InstitutionRequest(@NotBlank String name,String level,String region,Integer referenceScore,Integer scoreYear,String scoreLabel,String majors,String requirement,String sourceUrl) {}
