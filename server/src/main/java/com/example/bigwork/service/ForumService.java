package com.example.bigwork.service;

import com.example.bigwork.dto.CreateForumPostRequest;
import com.example.bigwork.dto.CreateForumTopicRequest;
import com.example.bigwork.dto.ForumPostResponse;
import com.example.bigwork.dto.ForumTopicResponse;
import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.ForumPost;
import com.example.bigwork.model.ForumTopic;
import com.example.bigwork.repository.ForumPostRepository;
import com.example.bigwork.repository.ForumTopicRepository;
import com.example.bigwork.repository.UserRepository;
import com.example.bigwork.support.DateTimeUtils;
import com.example.bigwork.support.SessionUser;
import org.springframework.http.HttpStatus;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class ForumService {

    private final ForumTopicRepository forumTopicRepository;
    private final ForumPostRepository forumPostRepository;
    private final UserRepository userRepository;

    public ForumService(ForumTopicRepository forumTopicRepository, ForumPostRepository forumPostRepository, UserRepository userRepository) {
        this.forumTopicRepository = forumTopicRepository;
        this.forumPostRepository = forumPostRepository;
        this.userRepository = userRepository;
    }

    @Transactional(readOnly = true)
    public List<ForumTopicResponse> listTopics() {
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

    @Transactional
    public Long createTopic(CreateForumTopicRequest request, SessionUser sessionUser) {
        requireLogin(sessionUser);
        ForumTopic topic = new ForumTopic();
        topic.setTitle(request.title());
        topic.setDescription(request.description());
        topic.setAuthorId(sessionUser.getId());
        LocalDateTime now = LocalDateTime.now();
        topic.setCreatedAt(now);
        topic.setUpdatedAt(now);
        ForumTopic saved = forumTopicRepository.save(topic);
        return saved.getId();
    }

    @Transactional(readOnly = true)
    public List<ForumPostResponse> listPosts(Long topicId) {
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
    public Long createPost(Long topicId, CreateForumPostRequest request, SessionUser sessionUser) {
        requireLogin(sessionUser);
        ForumTopic topic = forumTopicRepository.findById(topicId)
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "话题不存在"));
        ForumPost post = new ForumPost();
        post.setTopicId(topic.getId());
        post.setAuthorId(sessionUser.getId());
        post.setContent(request.content());
        LocalDateTime now = LocalDateTime.now();
        post.setCreatedAt(now);
        post.setUpdatedAt(now);
        ForumPost saved = forumPostRepository.save(post);

        topic.setUpdatedAt(now);
        forumTopicRepository.save(topic);
        return saved.getId();
    }

    private void requireLogin(SessionUser sessionUser) {
        if (sessionUser == null) {
            throw new BusinessException(HttpStatus.UNAUTHORIZED, "请先登录");
        }
    }

    private String resolveAuthorName(Long userId) {
        if (userId == null) {
            return "匿名用户";
        }
        return userRepository.findById(userId)
                .map(user -> user.getDisplayName())
                .orElse("用户已删除");
    }
}
