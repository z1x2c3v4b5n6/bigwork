-- ------------------------------------------------------------
-- MySQL schema for the study forum module
-- ------------------------------------------------------------
-- 运行本脚本即可创建考研交流论坛所需的基础表结构，并写入示例数据。
-- 可以在 Navicat 或其他客户端中直接执行，重复执行不会破坏既有数据。
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(64) NOT NULL,
  `email` VARCHAR(128) DEFAULT NULL,
  `role` VARCHAR(16) NOT NULL DEFAULT 'student',
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_topics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `author_id` BIGINT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_forum_topics_author` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic_id` BIGINT UNSIGNED NOT NULL,
  `author_id` BIGINT UNSIGNED DEFAULT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_forum_posts_topic` (`topic_id`),
  KEY `idx_forum_posts_author` (`author_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_topic_likes` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `created_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_topic_user` (`topic_id`, `user_id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 示例数据，便于前端页面立即展示内容
-- ------------------------------------------------------------

INSERT INTO `users` (`id`, `username`, `password`, `display_name`, `email`, `role`)
VALUES
  (1, 'student', 'study2025', '张同学', 'student@example.com', 'student'),
  (2, 'admin', 'admin123', '李老师', 'admin@example.com', 'admin')
ON DUPLICATE KEY UPDATE
  `username` = VALUES(`username`),
  `password` = VALUES(`password`),
  `display_name` = VALUES(`display_name`),
  `email` = VALUES(`email`),
  `role` = VALUES(`role`);

INSERT INTO `forum_topics` (`id`, `author_id`, `title`, `description`)
VALUES
  (1, 1, '初试经验交流', '分享全年复习规划、时间管理和自我调节心得，欢迎晒出你的复习进度表。'),
  (2, 1, '院校信息互助', '讨论目标院校专业课复习资料、复试要求与往年录取情况，共建情报库。'),
  (3, 1, '每日打卡与互励', '记录当天完成的任务、复盘心得或遇到的困难，互相监督保持节奏。'),
  (4, 2, '复试准备与面试攻略', '整理复试题库、材料准备清单以及常见问答经验，提前做好规划。')
ON DUPLICATE KEY UPDATE
  `title` = VALUES(`title`),
  `description` = VALUES(`description`),
  `author_id` = VALUES(`author_id`);

INSERT INTO `forum_posts` (`id`, `topic_id`, `author_id`, `content`)
VALUES
  (1, 1, 1, '这周的复习节奏是：早上背单词，中午刷 408，晚上复盘错题，欢迎一起监督～'),
  (2, 1, 2, '建议每两周安排一次阶段性模拟，结合错题分析调整复习计划。'),
  (3, 2, 2, '北理 408 复试大多围绕数据结构与操作系统，真题可以从 2018 年开始看。'),
  (4, 3, 1, '打卡：完成英语阅读三篇 + 线代习题 20 题，明天目标是整理错题本。')
ON DUPLICATE KEY UPDATE
  `content` = VALUES(`content`),
  `author_id` = VALUES(`author_id`),
  `updated_at` = CURRENT_TIMESTAMP;

INSERT INTO `forum_topic_likes` (`topic_id`, `user_id`)
VALUES
  (1, 1),
  (1, 2),
  (2, 1)
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`);

