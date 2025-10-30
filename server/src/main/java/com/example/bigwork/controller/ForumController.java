package com.example.bigwork.controller;

import com.example.bigwork.dto.CreateForumPostRequest;
import com.example.bigwork.dto.CreateForumTopicRequest;
import com.example.bigwork.dto.ForumPostResponse;
import com.example.bigwork.dto.ForumTopicResponse;
import com.example.bigwork.service.ForumService;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/forum")
public class ForumController {

    private static final String SESSION_KEY = "AUTH_USER";

    private final ForumService forumService;

    public ForumController(ForumService forumService) {
        this.forumService = forumService;
    }

    private SessionUser currentUser(HttpSession session) {
        return (SessionUser) session.getAttribute(SESSION_KEY);
    }

    @GetMapping("/topics")
    public ResponseEntity<Map<String, List<ForumTopicResponse>>> listTopics() {
        return ResponseEntity.ok(Map.of("topics", forumService.listTopics()));
    }

    @PostMapping("/topics")
    public ResponseEntity<Map<String, Object>> createTopic(@Valid @RequestBody CreateForumTopicRequest request, HttpSession session) {
        SessionUser user = currentUser(session);
        Long id = forumService.createTopic(request, user);
        return ResponseEntity.status(201).body(Map.of(
                "id", id,
                "title", request.title()
        ));
    }

    @GetMapping("/topics/{topicId}/posts")
    public ResponseEntity<Map<String, List<ForumPostResponse>>> listPosts(@PathVariable Long topicId) {
        return ResponseEntity.ok(Map.of("posts", forumService.listPosts(topicId)));
    }

    @PostMapping("/topics/{topicId}/posts")
    public ResponseEntity<Map<String, Object>> createPost(
            @PathVariable Long topicId,
            @Valid @RequestBody CreateForumPostRequest request,
            HttpSession session
    ) {
        SessionUser user = currentUser(session);
        Long id = forumService.createPost(topicId, request, user);
        return ResponseEntity.status(201).body(Map.of("id", id));
    }
}
