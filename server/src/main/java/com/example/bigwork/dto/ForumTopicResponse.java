package com.example.bigwork.dto;
public record ForumTopicResponse(Long id,String title,String description,String category,String author,String createdAt,String updatedAt,long likeCount,long favoriteCount,boolean liked,boolean favorited,boolean canDelete) {}
