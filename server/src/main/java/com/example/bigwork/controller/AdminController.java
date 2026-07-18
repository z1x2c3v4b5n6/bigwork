package com.example.bigwork.controller;

import com.example.bigwork.dto.*;
import com.example.bigwork.service.AdminService;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/admin")
public class AdminController {

    private static final String SESSION_KEY = "AUTH_USER";

    private final AdminService adminService;

    public AdminController(AdminService adminService) {
        this.adminService = adminService;
    }

    private SessionUser currentAdmin(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(SESSION_KEY);
        adminService.ensureAdmin(user);
        return user;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<AdminDashboardResponse> dashboard(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(adminService.getDashboard());
    }

    @GetMapping("/settings")
    public ResponseEntity<Map<String, Object>> getSettings(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("settings", adminService.getSettings()));
    }

    @PutMapping("/settings")
    public ResponseEntity<Void> updateSettings(@RequestBody UpdateSettingsRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        Map<String, String> settings = request != null && request.settings() != null ? request.settings() : Map.of();
        adminService.updateSettings(settings, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/users")
    public ResponseEntity<Map<String, List<AdminUserResponse>>> listUsers(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("users", adminService.listUsers()));
    }

    @PostMapping("/users")
    public ResponseEntity<Void> createUser(@Valid @RequestBody CreateAdminUserRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.createUser(request, admin);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/users/{id}")
    public ResponseEntity<Void> updateUser(@PathVariable Long id, @RequestBody UpdateAdminUserRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.updateUser(id, request, admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/users/{id}")
    public ResponseEntity<Void> deleteUser(@PathVariable Long id, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteUser(id, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/majors")
    public ResponseEntity<Map<String, List<MajorResponse>>> listMajors(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("majors", adminService.listMajors()));
    }

    @PostMapping("/majors")
    public ResponseEntity<Void> createMajor(@Valid @RequestBody CreateMajorRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.createMajor(request, admin);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/majors/{id}")
    public ResponseEntity<Void> updateMajor(@PathVariable Long id, @RequestBody UpdateMajorRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.updateMajor(id, request, admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/majors/{id}")
    public ResponseEntity<Void> deleteMajor(@PathVariable Long id, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteMajor(id, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/courses")
    public ResponseEntity<Map<String, List<CourseResponse>>> listCourses(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("courses", adminService.listCourses()));
    }

    @PostMapping("/courses")
    public ResponseEntity<Void> createCourse(@Valid @RequestBody CreateCourseRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.createCourse(request, admin);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/courses/{id}")
    public ResponseEntity<Void> updateCourse(@PathVariable Long id, @RequestBody UpdateCourseRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.updateCourse(id, request, admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/courses/{id}")
    public ResponseEntity<Void> deleteCourse(@PathVariable Long id, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteCourse(id, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/materials")
    public ResponseEntity<Map<String, List<MaterialResponse>>> listMaterials(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("materials", adminService.listMaterials()));
    }

    @PostMapping("/materials")
    public ResponseEntity<Void> createMaterial(@Valid @RequestBody CreateMaterialRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.createMaterial(request, admin);
        return ResponseEntity.status(201).build();
    }

    @PutMapping("/materials/{id}")
    public ResponseEntity<Void> updateMaterial(@PathVariable Long id, @RequestBody UpdateMaterialRequest request, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.updateMaterial(id, request, admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/materials/{id}")
    public ResponseEntity<Void> deleteMaterial(@PathVariable Long id, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteMaterial(id, admin);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/statistics/overview")
    public ResponseEntity<StatisticsOverview> statisticsOverview(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(adminService.getStatisticsOverview());
    }

    @GetMapping("/statistics/search")
    public ResponseEntity<AdminSearchResponse> search(@RequestParam(required = false) String keyword, HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(adminService.search(keyword));
    }

    @GetMapping("/forum/topics")
    public ResponseEntity<Map<String, List<ForumTopicResponse>>> listForumTopics(HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("topics", adminService.listForumTopics()));
    }

    @GetMapping("/forum/topics/{topicId}/posts")
    public ResponseEntity<Map<String, List<ForumPostResponse>>> listForumPosts(@PathVariable Long topicId, HttpSession session) {
        currentAdmin(session);
        return ResponseEntity.ok(Map.of("posts", adminService.listForumPosts(topicId)));
    }

    @DeleteMapping("/forum/topics/{topicId}")
    public ResponseEntity<Void> deleteForumTopic(@PathVariable Long topicId, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteForumTopic(topicId, admin);
        return ResponseEntity.noContent().build();
    }

    @DeleteMapping("/forum/posts/{postId}")
    public ResponseEntity<Void> deleteForumPost(@PathVariable Long postId, HttpSession session) {
        SessionUser admin = currentAdmin(session);
        adminService.deleteForumPost(postId, admin);
        return ResponseEntity.noContent().build();
    }
}
