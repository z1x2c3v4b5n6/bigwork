package com.example.bigwork.service;

import com.example.bigwork.dto.*;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.*;
import com.example.bigwork.repository.*;
import com.example.bigwork.support.DateTimeUtils;
import com.example.bigwork.support.SessionUser;
import org.springframework.http.HttpStatus;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.Objects;
import java.util.stream.Collectors;

@Service
public class AdminService {

    private final UserRepository userRepository;
    private final SiteSettingRepository siteSettingRepository;
    private final AdminAuditLogRepository adminAuditLogRepository;
    private final StudentProgressRepository studentProgressRepository;
    private final StudyTaskRepository studyTaskRepository;
    private final FollowUpTaskRepository followUpTaskRepository;
    private final SystemAlertRepository systemAlertRepository;
    private final MajorRepository majorRepository;
    private final CourseRepository courseRepository;
    private final CourseMaterialRepository courseMaterialRepository;
    private final PracticeSetRepository practiceSetRepository;
    private final PracticeQuestionRepository practiceQuestionRepository;
    private final ForumTopicRepository forumTopicRepository;
    private final ForumPostRepository forumPostRepository;
    private final BCryptPasswordEncoder passwordEncoder = new BCryptPasswordEncoder();

    public AdminService(
            UserRepository userRepository,
            SiteSettingRepository siteSettingRepository,
            AdminAuditLogRepository adminAuditLogRepository,
            StudentProgressRepository studentProgressRepository,
            StudyTaskRepository studyTaskRepository,
            FollowUpTaskRepository followUpTaskRepository,
            SystemAlertRepository systemAlertRepository,
            MajorRepository majorRepository,
            CourseRepository courseRepository,
            CourseMaterialRepository courseMaterialRepository,
            PracticeSetRepository practiceSetRepository,
            PracticeQuestionRepository practiceQuestionRepository,
            ForumTopicRepository forumTopicRepository,
            ForumPostRepository forumPostRepository
    ) {
        this.userRepository = userRepository;
        this.siteSettingRepository = siteSettingRepository;
        this.adminAuditLogRepository = adminAuditLogRepository;
        this.studentProgressRepository = studentProgressRepository;
        this.studyTaskRepository = studyTaskRepository;
        this.followUpTaskRepository = followUpTaskRepository;
        this.systemAlertRepository = systemAlertRepository;
        this.majorRepository = majorRepository;
        this.courseRepository = courseRepository;
        this.courseMaterialRepository = courseMaterialRepository;
        this.practiceSetRepository = practiceSetRepository;
        this.practiceQuestionRepository = practiceQuestionRepository;
        this.forumTopicRepository = forumTopicRepository;
        this.forumPostRepository = forumPostRepository;
    }

    public void ensureAdmin(SessionUser sessionUser) {
        if (sessionUser == null || !"admin".equals(sessionUser.getRole())) {
            throw new BusinessException(HttpStatus.FORBIDDEN, "需要管理员权限");
        }
    }

    @Transactional(readOnly = true)
    public AdminDashboardResponse getDashboard() {
        long activeStudents = studentProgressRepository.count();
        LocalDate today = LocalDate.now();
        long tasksCompletedToday = studyTaskRepository.countByCompletedIsTrueAndCompletedAtBetween(
                today.atStartOfDay(),
                today.atTime(LocalTime.MAX)
        );
        long followUpsPending = followUpTaskRepository.countByStatus("pending");
        long systemAlerts = systemAlertRepository.countByResolvedFalse();

        AdminDashboardMetrics metrics = new AdminDashboardMetrics(
                activeStudents,
                tasksCompletedToday,
                followUpsPending,
                systemAlerts
        );

        List<StudentProgressRow> progressRows = studentProgressRepository.findTop10ByOrderByUpdatedAtDesc()
                .stream()
                .map(progress -> {
                    User user = userRepository.findById(progress.getUserId()).orElse(null);
                    String name = user != null ? user.getDisplayName() : "未找到用户";
                    return new StudentProgressRow(
                            progress.getId(),
                            name,
                            progress.getTargetUniversity(),
                            progress.getWeeklyStudyHours(),
                            progress.getCompletionRate()
                    );
                })
                .toList();

        List<AuditLogRow> auditLogs = adminAuditLogRepository.findTop10ByOrderByCreatedAtDesc()
                .stream()
                .map(log -> new AuditLogRow(
                        log.getId(),
                        log.getAction(),
                        log.getDetail(),
                        log.getActorName(),
                        DateTimeUtils.format(log.getCreatedAt())
                ))
                .toList();

        List<String> administrators = userRepository.findByRole("admin")
                .stream()
                .map(User::getDisplayName)
                .toList();

        return new AdminDashboardResponse(
                metrics,
                progressRows,
                auditLogs,
                administrators,
                "请定期检查管理员账号并启用双重验证，保护系统安全。"
        );
    }

    @Transactional(readOnly = true)
    public Map<String, String> getSettings() {
        return siteSettingRepository.findAll()
                .stream()
                .collect(Collectors.toMap(SiteSetting::getKey, setting -> Objects.toString(setting.getValue(), "")));
    }

    @Transactional
    public void updateSettings(Map<String, String> settings, SessionUser sessionUser) {
        LocalDateTime now = LocalDateTime.now();
        settings.forEach((key, value) -> {
            SiteSetting setting = siteSettingRepository.findById(key).orElseGet(SiteSetting::new);
            setting.setKey(key);
            setting.setValue(value);
            setting.setUpdatedAt(now);
            siteSettingRepository.save(setting);
        });
        saveAuditLog("更新系统设置", "批量更新设置", sessionUser);
    }

    @Transactional(readOnly = true)
    public List<AdminUserResponse> listUsers() {
        return userRepository.findAll().stream()
                .map(user -> new AdminUserResponse(
                        user.getId(),
                        user.getUsername(),
                        user.getDisplayName(),
                        user.getRole(),
                        user.getEmail(),
                        DateTimeUtils.format(user.getCreatedAt()),
                        DateTimeUtils.format(user.getUpdatedAt())
                ))
                .toList();
    }

    @Transactional
    public void createUser(CreateAdminUserRequest request, SessionUser operator) {
        if (userRepository.existsByUsername(request.username())) {
            throw new BusinessException(HttpStatus.CONFLICT, "用户名已存在");
        }
        User user = new User();
        user.setUsername(request.username());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setDisplayName(request.displayName());
        user.setEmail(request.email());
        user.setRole(request.role() != null ? request.role() : "student");
        LocalDateTime now = LocalDateTime.now();
        user.setCreatedAt(now);
        user.setUpdatedAt(now);
        userRepository.save(user);
        saveAuditLog("创建用户", "新增用户：" + request.username(), operator);
    }

    @Transactional
    public void updateUser(Long id, UpdateAdminUserRequest request, SessionUser operator) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "用户不存在"));

        if (request.password() != null && !request.password().isBlank()) {
            user.setPassword(passwordEncoder.encode(request.password()));
        }
        if (request.displayName() != null) {
            user.setDisplayName(request.displayName());
        }
        if (request.role() != null) {
            user.setRole(request.role());
        }
        if (request.email() != null) {
            user.setEmail(request.email());
        }
        user.setUpdatedAt(LocalDateTime.now());
        userRepository.save(user);
        saveAuditLog("更新用户", "修改用户：" + user.getUsername(), operator);
    }

    @Transactional
    public void deleteUser(Long id, SessionUser operator) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "用户不存在"));
        if (Objects.equals(operator.getId(), id)) {
            throw new BusinessException(HttpStatus.BAD_REQUEST, "无法删除当前登录账号");
        }
        userRepository.delete(user);
        saveAuditLog("删除用户", "删除用户：" + user.getUsername(), operator);
    }

    @Transactional(readOnly = true)
    public List<MajorResponse> listMajors() {
        return majorRepository.findAll().stream()
                .map(major -> new MajorResponse(major.getId(), major.getName(), major.getDescription()))
                .toList();
    }

    @Transactional
    public void createMajor(CreateMajorRequest request, SessionUser operator) {
        Major major = new Major();
        major.setName(request.name());
        major.setDescription(request.description());
        LocalDateTime now = LocalDateTime.now();
        major.setCreatedAt(now);
        major.setUpdatedAt(now);
        majorRepository.save(major);
        saveAuditLog("新增专业", "添加专业：" + request.name(), operator);
    }

    @Transactional
    public void updateMajor(Long id, UpdateMajorRequest request, SessionUser operator) {
        Major major = majorRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "专业不存在"));
        if (request.name() != null) {
            major.setName(request.name());
        }
        if (request.description() != null) {
            major.setDescription(request.description());
        }
        major.setUpdatedAt(LocalDateTime.now());
        majorRepository.save(major);
        saveAuditLog("更新专业", "更新专业：" + major.getName(), operator);
    }

    @Transactional
    public void deleteMajor(Long id, SessionUser operator) {
        majorRepository.deleteById(id);
        saveAuditLog("删除专业", "删除专业ID：" + id, operator);
    }

    @Transactional(readOnly = true)
    public List<CourseResponse> listCourses() {
        Map<Long, String> majorNames = majorRepository.findAll().stream()
                .collect(Collectors.toMap(Major::getId, Major::getName));

        return courseRepository.findAll().stream()
                .map(course -> new CourseResponse(
                        course.getId(),
                        course.getTitle(),
                        course.getDescription(),
                        course.getTeacher(),
                        course.getCredit(),
                        course.getMajorId(),
                        course.getMajorId() != null ? majorNames.get(course.getMajorId()) : null
                ))
                .toList();
    }

    @Transactional
    public void createCourse(CreateCourseRequest request, SessionUser operator) {
        Course course = new Course();
        course.setTitle(request.title());
        course.setDescription(request.description());
        course.setTeacher(request.teacher());
        course.setCredit(request.credit());
        course.setMajorId(request.majorId());
        LocalDateTime now = LocalDateTime.now();
        course.setCreatedAt(now);
        course.setUpdatedAt(now);
        courseRepository.save(course);
        saveAuditLog("新增课程", "添加课程：" + request.title(), operator);
    }

    @Transactional
    public void updateCourse(Long id, UpdateCourseRequest request, SessionUser operator) {
        Course course = courseRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "课程不存在"));
        if (request.title() != null) {
            course.setTitle(request.title());
        }
        if (request.description() != null) {
            course.setDescription(request.description());
        }
        if (request.teacher() != null) {
            course.setTeacher(request.teacher());
        }
        if (request.credit() != null) {
            course.setCredit(request.credit());
        }
        if (request.majorId() != null) {
            course.setMajorId(request.majorId());
        }
        course.setUpdatedAt(LocalDateTime.now());
        courseRepository.save(course);
        saveAuditLog("更新课程", "更新课程：" + course.getTitle(), operator);
    }

    @Transactional
    public void deleteCourse(Long id, SessionUser operator) {
        courseRepository.deleteById(id);
        saveAuditLog("删除课程", "删除课程ID：" + id, operator);
    }

    @Transactional(readOnly = true)
    public List<MaterialResponse> listMaterials() {
        Map<Long, String> courseNames = courseRepository.findAll().stream()
                .collect(Collectors.toMap(Course::getId, Course::getTitle));

        return courseMaterialRepository.findAll().stream()
                .map(material -> new MaterialResponse(
                        material.getId(),
                        material.getTitle(),
                        material.getDescription(),
                        material.getFileUrl(),
                        material.getCourseId(),
                        material.getCourseId() != null ? courseNames.get(material.getCourseId()) : null
                ))
                .toList();
    }

    @Transactional
    public void createMaterial(CreateMaterialRequest request, SessionUser operator) {
        CourseMaterial material = new CourseMaterial();
        material.setTitle(request.title());
        material.setDescription(request.description());
        material.setFileUrl(request.fileUrl());
        material.setCourseId(request.courseId());
        LocalDateTime now = LocalDateTime.now();
        material.setCreatedAt(now);
        material.setUpdatedAt(now);
        courseMaterialRepository.save(material);
        saveAuditLog("新增资料", "上传资料：" + request.title(), operator);
    }

    @Transactional
    public void updateMaterial(Long id, UpdateMaterialRequest request, SessionUser operator) {
        CourseMaterial material = courseMaterialRepository.findById(id)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "资料不存在"));
        if (request.title() != null) {
            material.setTitle(request.title());
        }
        if (request.description() != null) {
            material.setDescription(request.description());
        }
        if (request.fileUrl() != null) {
            material.setFileUrl(request.fileUrl());
        }
        if (request.courseId() != null) {
            material.setCourseId(request.courseId());
        }
        material.setUpdatedAt(LocalDateTime.now());
        courseMaterialRepository.save(material);
        saveAuditLog("更新资料", "更新资料：" + material.getTitle(), operator);
    }

    @Transactional
    public void deleteMaterial(Long id, SessionUser operator) {
        courseMaterialRepository.deleteById(id);
        saveAuditLog("删除资料", "删除资料ID：" + id, operator);
    }

    @Transactional(readOnly = true)
    public StatisticsOverview getStatisticsOverview() {
        long users = userRepository.count();
        long majors = majorRepository.count();
        long courses = courseRepository.count();
        long materials = courseMaterialRepository.count();
        long practiceSets = practiceSetRepository.count();
        long forumPosts = forumPostRepository.count();
        LocalDateTime latest = forumPostRepository.findAll().stream()
                .map(ForumPost::getUpdatedAt)
                .filter(Objects::nonNull)
                .max(LocalDateTime::compareTo)
                .orElse(null);
        return new StatisticsOverview(
                users,
                majors,
                courses,
                materials,
                practiceSets,
                forumPosts,
                DateTimeUtils.format(latest)
        );
    }

    @Transactional(readOnly = true)
    public AdminSearchResponse search(String keyword) {
        String trimmed = keyword == null ? "" : keyword.trim();
        if (trimmed.isEmpty()) {
            return new AdminSearchResponse(List.of(), List.of(), List.of(), List.of(), List.of());
        }

        List<Map<String, Object>> userMatches = userRepository.findAll().stream()
                .filter(user -> containsIgnoreCase(user.getUsername(), trimmed) || containsIgnoreCase(user.getDisplayName(), trimmed))
                .map(user -> Map.<String, Object>of(
                        "id", user.getId(),
                        "username", user.getUsername(),
                        "displayName", user.getDisplayName(),
                        "role", user.getRole()
                ))
                .toList();

        List<Map<String, Object>> majorMatches = majorRepository.findByNameContainingIgnoreCase(trimmed).stream()
                .map(major -> Map.<String, Object>of(
                        "id", major.getId(),
                        "name", major.getName(),
                        "description", major.getDescription()
                ))
                .toList();

        List<Map<String, Object>> courseMatches = courseRepository.findByTitleContainingIgnoreCase(trimmed).stream()
                .map(course -> Map.<String, Object>of(
                        "id", course.getId(),
                        "title", course.getTitle(),
                        "teacher", course.getTeacher()
                ))
                .toList();

        List<Map<String, Object>> materialMatches = courseMaterialRepository.findByTitleContainingIgnoreCase(trimmed).stream()
                .map(material -> Map.<String, Object>of(
                        "id", material.getId(),
                        "title", material.getTitle(),
                        "fileUrl", material.getFileUrl()
                ))
                .toList();

        List<Map<String, Object>> topicMatches = forumTopicRepository.findByTitleContainingIgnoreCase(trimmed).stream()
                .map(topic -> Map.<String, Object>of(
                        "id", topic.getId(),
                        "title", topic.getTitle(),
                        "description", topic.getDescription()
                ))
                .toList();

        return new AdminSearchResponse(userMatches, majorMatches, courseMatches, materialMatches, topicMatches);
    }

    @Transactional(readOnly = true)
    public List<ForumTopicResponse> listForumTopics() {
        return forumTopicRepository.findAll().stream()
                .map(topic -> new ForumTopicResponse(
                        topic.getId(),
                        topic.getTitle(),
                        topic.getDescription(),
                        resolveAuthorName(topic.getAuthorId()),
                        DateTimeUtils.format(topic.getCreatedAt()),
                        DateTimeUtils.format(topic.getUpdatedAt())
                ))
                .toList();
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> listForumPosts(Long topicId) {
        return forumPostRepository.findByTopicIdOrderByCreatedAtAsc(topicId).stream()
                .map(post -> new ForumPostResponse(
                        post.getId(),
                        post.getContent(),
                        resolveAuthorName(post.getAuthorId()),
                        DateTimeUtils.format(post.getCreatedAt()),
                        DateTimeUtils.format(post.getUpdatedAt())
                ))
                .toList();
    }

    @Transactional
    public void deleteForumTopic(Long topicId, SessionUser operator) {
        forumTopicRepository.deleteById(topicId);
        saveAuditLog("删除话题", "删除话题ID：" + topicId, operator);
    }

    @Transactional
    public void deleteForumPost(Long postId, SessionUser operator) {
        forumPostRepository.deleteById(postId);
        saveAuditLog("删除帖子", "删除帖子ID：" + postId, operator);
    }

    private void saveAuditLog(String action, String detail, SessionUser sessionUser) {
        AdminAuditLog log = new AdminAuditLog();
        log.setAction(action);
        log.setDetail(detail);
        log.setActorName(sessionUser != null ? sessionUser.getDisplayName() : "系统");
        log.setCreatedAt(LocalDateTime.now());
        adminAuditLogRepository.save(log);
    }

    private boolean containsIgnoreCase(String value, String keyword) {
        return value != null && value.toLowerCase().contains(keyword.toLowerCase());
    }

    private String resolveAuthorName(Long userId) {
        if (userId == null) {
            return "匿名用户";
        }
        return userRepository.findById(userId)
                .map(User::getDisplayName)
                .orElse("用户已删除");
    }
}
