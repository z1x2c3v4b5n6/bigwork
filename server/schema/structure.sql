-- ------------------------------------------------------------
-- MySQL schema and seed data for the Postgraduate Study Platform
-- ------------------------------------------------------------
-- 运行本脚本即可创建完整的业务数据表，并写入示例数据。
-- 可在 Navicat / DataGrip 等客户端直接执行，多次执行也不会破坏既有数据。
-- ------------------------------------------------------------

CREATE DATABASE IF NOT EXISTS `kaoyan_platform`
  DEFAULT CHARACTER SET utf8mb4
  DEFAULT COLLATE utf8mb4_unicode_ci;

USE `kaoyan_platform`;

-- ------------------------------------------------------------
-- 基础表结构
-- ------------------------------------------------------------

CREATE TABLE IF NOT EXISTS `majors` (
  `id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(100) NOT NULL UNIQUE,
  `description` TEXT,
  `subject_tags` TEXT DEFAULT NULL,
  `created_at` TIMESTAMP NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `users` (
  `id` VARCHAR(30) NOT NULL,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(64) NOT NULL,
  `role` ENUM('student', 'admin', 'institution') NOT NULL DEFAULT 'student',
  `email` VARCHAR(128) DEFAULT NULL,
  `phone` VARCHAR(32) DEFAULT NULL,
  `organization` VARCHAR(255) DEFAULT NULL,
  `goal` VARCHAR(255) DEFAULT NULL,
  `major_id` VARCHAR(30) DEFAULT NULL,
  `avatar` VARCHAR(255) DEFAULT NULL,
  `bio` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_users_major` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE SET NULL
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `courses` (
  `id` VARCHAR(30) NOT NULL,
  `major_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `category` VARCHAR(40) NOT NULL,
  `teacher` VARCHAR(100) NOT NULL,
  `credit` DECIMAL(4,1) DEFAULT 0,
  `progress` INT DEFAULT 0,
  `status` VARCHAR(20) DEFAULT 'published',
  `summary` TEXT,
  `schedule_info` VARCHAR(255) DEFAULT NULL,
  `release_window` VARCHAR(120) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_courses_major` FOREIGN KEY (`major_id`) REFERENCES `majors` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `materials` (
  `id` VARCHAR(30) NOT NULL,
  `course_id` VARCHAR(30) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `material_type` VARCHAR(50) NOT NULL,
  `url` VARCHAR(255) DEFAULT NULL,
  `description` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_materials_course` FOREIGN KEY (`course_id`) REFERENCES `courses` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_sets` (
  `id` VARCHAR(30) NOT NULL,
  `owner_id` VARCHAR(30) NOT NULL,
  `name` VARCHAR(200) NOT NULL,
  `focus` VARCHAR(255) DEFAULT NULL,
  `difficulty` VARCHAR(20) DEFAULT NULL,
  `duration_minutes` INT DEFAULT NULL,
  `question_count` INT DEFAULT 0,
  `last_attempt_at` DATETIME DEFAULT NULL,
  `last_accuracy` DECIMAL(5,2) DEFAULT NULL,
  `last_score` INT DEFAULT NULL,
  `last_summary` TEXT,
  `source` VARCHAR(100) DEFAULT '系统推荐',
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_practice_sets_owner` FOREIGN KEY (`owner_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_questions` (
  `id` VARCHAR(30) NOT NULL,
  `practice_set_id` VARCHAR(30) NOT NULL,
  `question_type` ENUM('single', 'multiple') NOT NULL,
  `stem` TEXT NOT NULL,
  `options_json` TEXT,
  `correct_options` TEXT,
  `explanation` TEXT,
  `knowledge_point` VARCHAR(255) DEFAULT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_practice_questions_set` FOREIGN KEY (`practice_set_id`) REFERENCES `practice_sets` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `practice_attempts` (
  `id` VARCHAR(30) NOT NULL,
  `practice_set_id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `accuracy` DECIMAL(5,2) DEFAULT NULL,
  `score` INT DEFAULT NULL,
  `answers_json` LONGTEXT,
  `summary` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_practice_attempts_set` FOREIGN KEY (`practice_set_id`) REFERENCES `practice_sets` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_practice_attempts_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `wrong_questions` (
  `id` VARCHAR(60) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` TEXT,
  `analysis` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_wrong_questions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `schedule_events` (
  `id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `event_type` VARCHAR(30) NOT NULL,
  `start_time` DATETIME NOT NULL,
  `end_time` DATETIME NOT NULL,
  `location` VARCHAR(200) DEFAULT NULL,
  `focus` VARCHAR(255) DEFAULT NULL,
  `tags_json` TEXT,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_schedule_events_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `daily_learning_tasks` (
  `id` VARCHAR(40) NOT NULL,
  `task_date` DATE NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `description` TEXT,
  `target_text` VARCHAR(200) DEFAULT NULL,
  `estimated_minutes` INT DEFAULT 45,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_daily_task_date` (`task_date`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `daily_task_completions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `task_id` VARCHAR(40) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `completed_at` DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uniq_task_user` (`task_id`, `user_id`),
  CONSTRAINT `fk_daily_task_completions_task` FOREIGN KEY (`task_id`) REFERENCES `daily_learning_tasks` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_daily_task_completions_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_topics` (
  `id` VARCHAR(30) NOT NULL,
  `author_id` VARCHAR(30) NOT NULL,
  `title` VARCHAR(200) NOT NULL,
  `content` TEXT NOT NULL,
  `tags_json` TEXT,
  `needs_moderation` TINYINT(1) DEFAULT 0,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_forum_topics_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_comments` (
  `id` VARCHAR(30) NOT NULL,
  `topic_id` VARCHAR(30) NOT NULL,
  `author_id` VARCHAR(30) NOT NULL,
  `content` TEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_forum_comments_topic` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_forum_comments_author` FOREIGN KEY (`author_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `forum_likes` (
  `topic_id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`topic_id`, `user_id`),
  CONSTRAINT `fk_forum_likes_topic` FOREIGN KEY (`topic_id`) REFERENCES `forum_topics` (`id`) ON DELETE CASCADE,
  CONSTRAINT `fk_forum_likes_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `subject_mastery` (
  `id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `subject` VARCHAR(100) NOT NULL,
  `mastery` DECIMAL(4,2) NOT NULL,
  `trend` VARCHAR(20) DEFAULT NULL,
  `focus` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_subject_mastery_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `analytics_overview` (
  `user_id` VARCHAR(30) NOT NULL,
  `mock_trend` TEXT,
  `time_distribution` TEXT,
  `behavior_insight` TEXT,
  `updated_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`user_id`),
  CONSTRAINT `fk_analytics_overview_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `weak_topics` (
  `id` VARCHAR(30) NOT NULL,
  `user_id` VARCHAR(30) NOT NULL,
  `topic` VARCHAR(200) NOT NULL,
  `error_rate` VARCHAR(20) DEFAULT NULL,
  `suggestion` TEXT,
  PRIMARY KEY (`id`),
  CONSTRAINT `fk_weak_topics_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS `ai_conversations` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` VARCHAR(30) NOT NULL,
  `question` TEXT NOT NULL,
  `answer` LONGTEXT NOT NULL,
  `created_at` TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_ai_conversations_user` (`user_id`),
  CONSTRAINT `fk_ai_conversations_user` FOREIGN KEY (`user_id`) REFERENCES `users` (`id`) ON DELETE CASCADE
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

-- ------------------------------------------------------------
-- 种子数据
-- ------------------------------------------------------------

INSERT INTO `majors` (`id`, `name`, `description`, `subject_tags`)
VALUES
  (
    'major_cs',
    '计算机科学与技术',
    '涵盖数据结构、计算机组成原理、操作系统与计算机网络的系统备考路径。',
    '计算机,408,算法,工程实践,数学一'
  ),
  (
    'major_math',
    '应用数学',
    '专注高等数学、线性代数与概率统计的强化与冲刺训练。',
    '数学,统计建模,概率论,数学三'
  ),
  (
    'major_english',
    '英语语言文学',
    '从基础语法到写作实战，兼顾翻译与写作能力提升。',
    '英语,口语,翻译,写作'
  ),
  (
    'major_management',
    '工商管理',
    '管理类联考数学、逻辑与写作的全阶段复习方案。',
    '管理类联考,金融,案例分析,英语二'
  )
ON DUPLICATE KEY UPDATE
  `name` = VALUES(`name`),
  `description` = VALUES(`description`),
  `subject_tags` = VALUES(`subject_tags`);

INSERT INTO `users` (
  `id`, `username`, `password`, `display_name`, `role`, `email`, `phone`, `organization`, `goal`, `major_id`, `avatar`, `bio`
)
VALUES
  (
    'user_student_1',
    'student',
    'study2025',
    '张同学',
    'student',
    'student@example.com',
    '13800001234',
    '北京理工大学 · 计算机专硕',
    '冲刺 2025 统考 390+ 分',
    'major_cs',
    '张',
    '目标院校：北京理工大学；擅长英语阅读，需强化 408 图论与操作系统。'
  ),
  (
    'user_admin_1',
    'admin',
    'admin123',
    '李老师',
    'admin',
    'admin@example.com',
    '13500004567',
    '研学进阶教研组',
    '统筹课程与题库质量，保障教研节奏。',
    'major_cs',
    '李',
    '负责数学、英语与专业课教研统筹，擅长课程建设与教学服务。'
  ),
  (
    'user_institution_1',
    'institution',
    'admit2024',
    '华清学院招生办',
    'institution',
    'admission@hq.edu.cn',
    '010-88881234',
    '华清学院招生办公室',
    '发布招生简章与复试动态，及时提醒关注考生。',
    'major_management',
    '招',
    '官方院校账号，提供招生政策解读、复试安排与调剂咨询。'
  )
ON DUPLICATE KEY UPDATE
  `username` = VALUES(`username`),
  `password` = VALUES(`password`),
  `display_name` = VALUES(`display_name`),
  `role` = VALUES(`role`),
  `email` = VALUES(`email`),
  `phone` = VALUES(`phone`),
  `organization` = VALUES(`organization`),
  `goal` = VALUES(`goal`),
  `major_id` = VALUES(`major_id`),
  `avatar` = VALUES(`avatar`),
  `bio` = VALUES(`bio`);

INSERT INTO `courses` (
  `id`, `major_id`, `name`, `category`, `teacher`, `credit`, `progress`, `status`, `summary`, `schedule_info`, `release_window`
)
VALUES
  (
    'course_algo',
    'major_cs',
    '408 数据结构强化班',
    '专业课',
    '张老师',
    4.0,
    62,
    'published',
    '深度讲解图论、动态规划等高频考点，配套题单与解析。',
    '每周三晚 19:00 直播',
    '2024.06-2024.09'
  ),
  (
    'course_math',
    'major_math',
    '数学一冲刺直播营',
    '公共课',
    '王老师',
    3.0,
    48,
    'published',
    '针对高数、线代难点的冲刺突破课程，结合模考试卷讲评。',
    '每周末 09:00-12:00',
    '2024.05-2024.10'
  ),
  (
    'course_english',
    'major_english',
    '英语一写作密训营',
    '公共课',
    '刘老师',
    2.0,
    71,
    'published',
    '模板搭建、真题拆解与批改反馈结合的写作提升计划。',
    '每周二、周四晚 20:00',
    '2024.04-2024.08'
  ),
  (
    'course_politics',
    'major_management',
    '政治热点全掌握',
    '公共课',
    '肖老师',
    2.0,
    35,
    'draft',
    '覆盖当年时政热点与分析框架，搭配押题模拟。',
    '待排期',
    '2024.07-2024.11'
  ),
  (
    'course_ai',
    'major_cs',
    'AI 赋能考研算法专题',
    '专业课',
    '周老师',
    2.0,
    15,
    'review',
    '以算法题为主线，结合 AI 批改与诊断，强化薄弱知识点。',
    '计划 8 月上线',
    '2024.08-2024.10'
  ),
  (
    'course_mba_case',
    'major_management',
    '管理类联考案例实战工坊',
    '公共课',
    '陈老师',
    2.0,
    52,
    'published',
    '分模块演练双语商业案例与面试答题策略，附带导师点评模板。',
    '每周日晚 19:30 线上研讨',
    '2024.06-2024.09'
  ),
  (
    'course_english_speaking',
    'major_english',
    '英语口语听力提升营',
    '公共课',
    'Grace',
    2.0,
    58,
    'published',
    '覆盖听力跟读、口语即兴表达与复试常见问答，提供录音点评。',
    '每周二、周四晚 19:30',
    '2024.05-2024.08'
  )
ON DUPLICATE KEY UPDATE
  `major_id` = VALUES(`major_id`),
  `name` = VALUES(`name`),
  `category` = VALUES(`category`),
  `teacher` = VALUES(`teacher`),
  `credit` = VALUES(`credit`),
  `progress` = VALUES(`progress`),
  `status` = VALUES(`status`),
  `summary` = VALUES(`summary`),
  `schedule_info` = VALUES(`schedule_info`),
  `release_window` = VALUES(`release_window`);

INSERT INTO `materials` (`id`, `course_id`, `title`, `material_type`, `url`, `description`)
VALUES
  (
    'material_algo_outline',
    'course_algo',
    '数据结构图论拔高讲义',
    '讲义',
    'https://example.com/materials/graph-outline.pdf',
    '包含最短路、最小生成树与拓扑排序的重点题型分析。'
  ),
  (
    'material_algo_problem',
    'course_algo',
    '算法化题单（含解析）',
    '题单',
    'https://example.com/materials/algo-problem-set.pdf',
    '精选 40 道历年真题与模拟题，覆盖图、树、动态规划。'
  ),
  (
    'material_math_notes',
    'course_math',
    '线代冲刺公式速查表',
    '资料',
    'https://example.com/materials/linear-algebra-cheatsheet.pdf',
    '线性代数高频考点与常见陷阱总结。'
  ),
  (
    'material_english_templates',
    'course_english',
    '大作文万能模板与素材库',
    '资料',
    'https://example.com/materials/english-writing-pack.pdf',
    '包含 12 篇高分范文、开头结尾模板与热点素材。'
  )
ON DUPLICATE KEY UPDATE
  `course_id` = VALUES(`course_id`),
  `title` = VALUES(`title`),
  `material_type` = VALUES(`material_type`),
  `url` = VALUES(`url`),
  `description` = VALUES(`description`);

INSERT INTO `practice_sets` (
  `id`, `owner_id`, `name`, `focus`, `difficulty`, `duration_minutes`, `question_count`, `last_attempt_at`, `last_accuracy`, `last_score`, `last_summary`, `source`
)
VALUES
  (
    'practice_algo_strength',
    'user_student_1',
    '强化算法与数据结构薄弱点',
    '图论、动态规划、并查集',
    '进阶',
    45,
    6,
    '2024-04-10 21:00:00',
    0.68,
    68,
    '上次训练正确 17/25 题，图论最短路与并查集题型存在失误。',
    'AI 诊断生成'
  ),
  (
    'practice_politics_hot',
    'user_student_1',
    '政治热点主观题精练',
    '时政热点、主观题作答结构',
    '冲刺',
    35,
    2,
    '2024-04-08 10:00:00',
    0.62,
    74,
    '模拟题写作结构合理，需加强时政案例积累。',
    '系统推荐'
  ),
  (
    'practice_english_reading',
    'user_student_1',
    '英语一阅读理解巩固',
    '长难句、细节题定位',
    '基础',
    30,
    2,
    '2024-04-06 08:30:00',
    0.82,
    82,
    '细节题正确率高，主旨题需关注逻辑连接词。',
    '系统推荐'
  )
ON DUPLICATE KEY UPDATE
  `owner_id` = VALUES(`owner_id`),
  `name` = VALUES(`name`),
  `focus` = VALUES(`focus`),
  `difficulty` = VALUES(`difficulty`),
  `duration_minutes` = VALUES(`duration_minutes`),
  `last_attempt_at` = VALUES(`last_attempt_at`),
  `last_accuracy` = VALUES(`last_accuracy`),
  `last_score` = VALUES(`last_score`),
  `last_summary` = VALUES(`last_summary`),
  `source` = VALUES(`source`);

INSERT INTO `practice_questions` (
  `id`, `practice_set_id`, `question_type`, `stem`, `options_json`, `correct_options`, `explanation`, `knowledge_point`
)
VALUES
  (
    'q_algo_01',
    'practice_algo_strength',
    'single',
    '设有一个含 n 个顶点的连通无向图，使用 Prim 算法求最小生成树时，采用邻接矩阵存储，使用最小堆维护横切边集合，则算法的时间复杂度是？',
    '["O(n^2)", "O(n log n)", "O((n + m) log n)", "O(m log n)"]',
    '[2]',
    '采用最小堆后，Prim 算法的时间复杂度为 O((n + m) log n)，对稠密图近似为 O(n^2 log n)。',
    '最小生成树'
  ),
  (
    'q_algo_02',
    'practice_algo_strength',
    'multiple',
    '关于并查集（Union-Find）结构的描述，正确的有？',
    '["按秩合并可以减小树的高度", "路径压缩可以将查找操作的时间复杂度降低到 O(1)", "启用路径压缩后最坏情况下仍可能退化到链表", "按秩合并与路径压缩配合时，单次操作的均摊复杂度接近 O(α(n))"]',
    '[0,3]',
    '按秩合并与路径压缩结合时，单次操作的均摊复杂度为 O(α(n))，路径压缩可大幅降低高度但不是绝对 O(1)。',
    '并查集'
  ),
  (
    'q_algo_03',
    'practice_algo_strength',
    'single',
    '在 Dijkstra 算法中，若采用邻接表存储图并使用二叉堆，算法的时间复杂度是？',
    '["O(n^2)", "O(n log n + m)", "O(m log n)", "O(n + m log n)"]',
    '[2]',
    'Dijkstra 算法使用二叉堆时的时间复杂度为 O(m log n)。',
    '最短路径'
  ),
  (
    'q_algo_04',
    'practice_algo_strength',
    'multiple',
    '以下关于拓扑排序的说法正确的是：',
    '["拓扑排序适用于有向无环图（DAG）", "拓扑排序的结果可能不唯一", "若图中存在环，则无法得到拓扑序", "拓扑排序可用于检测无向图是否存在环"]',
    '[0,1,2]',
    '拓扑排序只适用于 DAG；若存在环则无法得到拓扑序；结果可能不唯一。',
    '拓扑排序'
  ),
  (
    'q_algo_05',
    'practice_algo_strength',
    'single',
    '对于一个使用邻接表存储的图，采用 BFS 判断图中是否存在长度为 k 的最短路径，算法的时间复杂度主要取决于：',
    '["顶点数 n", "边数 m", "k 的大小", "与图的连通分支数量无关"]',
    '[1]',
    'BFS 的复杂度主要取决于边数 m；k 只影响遍历深度，但不会改变量级。',
    '图的遍历'
  ),
  (
    'q_algo_06',
    'practice_algo_strength',
    'single',
    '在动态规划求解背包问题时，若容量 W 与物品个数 n 均较大，下列优化方法更适合的是？',
    '["完全背包优化", "分组背包优化", "状态压缩或滚动数组", "使用回溯搜索"]',
    '[2]',
    '滚动数组可以将空间复杂度由 O(nW) 降至 O(W)。',
    '动态规划优化'
  ),
  (
    'q_politics_01',
    'practice_politics_hot',
    'single',
    '回答政治主观题时，开头需要做到哪一点才能更好引出观点？',
    '["直接给出结论即可，不必铺垫", "先简要概括材料背景，再提出观点", "引用经典语录即可", "加入与主题无关的故事增加趣味性"]',
    '[1]',
    '开头应当概括背景并提出观点，形成完整的论述框架。',
    '政治主观题作答结构'
  ),
  (
    'q_politics_02',
    'practice_politics_hot',
    'multiple',
    '下列哪些属于常见的时政论证素材？',
    '["政府工作报告中的数据", "权威媒体对热点事件的评论", "个人社交平台的随意观点", "党的二十大报告中的战略部署"]',
    '[0,1,3]',
    '论证素材需权威可信，可引用政府报告、权威评论与大会报告。',
    '时政素材积累'
  ),
  (
    'q_english_01',
    'practice_english_reading',
    'single',
    '长难句分析的第一步通常是？',
    '["找到句子谓语动词", "先翻译从句", "查阅生词", "寻找代词指代"]',
    '[0]',
    '分析长难句首先需要找出谓语动词，确定句子主干。',
    '长难句分析'
  ),
  (
    'q_english_02',
    'practice_english_reading',
    'multiple',
    '关于英语阅读理解细节题的解题技巧，正确的有？',
    '["定位关键词，回到原文寻找对应句子", "根据常识和经验选择答案即可", "注意同义替换与语义转换", "不需要通读全文，只需看题干"]',
    '[0,2]',
    '细节题需要回原文定位，同时留意选项中的同义替换。',
    '阅读理解技巧'
  )
ON DUPLICATE KEY UPDATE
  `practice_set_id` = VALUES(`practice_set_id`),
  `question_type` = VALUES(`question_type`),
  `stem` = VALUES(`stem`),
  `options_json` = VALUES(`options_json`),
  `correct_options` = VALUES(`correct_options`),
  `explanation` = VALUES(`explanation`),
  `knowledge_point` = VALUES(`knowledge_point`);

INSERT INTO `practice_attempts` (
  `id`, `practice_set_id`, `user_id`, `accuracy`, `score`, `answers_json`, `summary`
)
VALUES
  (
    'attempt_001',
    'practice_algo_strength',
    'user_student_1',
    0.68,
    68,
    '[{"questionId":"q_algo_01","selected":[2]},{"questionId":"q_algo_02","selected":[0,3]},{"questionId":"q_algo_03","selected":[2]},{"questionId":"q_algo_04","selected":[0,1]},{"questionId":"q_algo_05","selected":[1]},{"questionId":"q_algo_06","selected":[2]}]',
    'AI 诊断：图论题正确率 60%，建议复盘 Dijkstra 边界条件。'
  ),
  (
    'attempt_002',
    'practice_english_reading',
    'user_student_1',
    0.82,
    82,
    '[{"questionId":"q_english_01","selected":[0]},{"questionId":"q_english_02","selected":[0,2]}]',
    '长难句分析准确，需关注选项干扰项的逻辑关系。'
  )
ON DUPLICATE KEY UPDATE
  `practice_set_id` = VALUES(`practice_set_id`),
  `user_id` = VALUES(`user_id`),
  `accuracy` = VALUES(`accuracy`),
  `score` = VALUES(`score`),
  `answers_json` = VALUES(`answers_json`),
  `summary` = VALUES(`summary`);

INSERT INTO `schedule_events` (
  `id`, `user_id`, `title`, `event_type`, `start_time`, `end_time`, `location`, `focus`, `tags_json`
)
VALUES
  (
    'schedule_live_math',
    'user_student_1',
    '数学一冲刺直播课',
    '直播课',
    '2024-04-12 19:00:00',
    '2024-04-12 21:00:00',
    '腾讯会议 938-102-001',
    '线性代数特征值专项',
    '["直播课", "数学"]'
  ),
  (
    'schedule_morning_read',
    'user_student_1',
    '英语晨读打卡',
    '自习',
    '2024-04-13 06:45:00',
    '2024-04-13 07:25:00',
    '',
    '外刊精读 + 词汇巩固',
    '["晨读", "英语"]'
  ),
  (
    'schedule_evening_review',
    'user_student_1',
    '晚间错题回顾',
    '自习',
    '2024-04-14 21:30:00',
    '2024-04-14 22:30:00',
    '',
    '复盘图论与政治主观题',
    '["错题整理"]'
  ),
  (
    'schedule_mock_exam',
    'user_student_1',
    '英语一全真模拟',
    '模拟考试',
    '2024-04-15 13:30:00',
    '2024-04-15 17:00:00',
    '线下自习室 A301',
    '完整模拟，检验时间管理',
    '["模考", "英语"]'
  ),
  (
    'schedule_coach',
    'user_student_1',
    '教练辅导：AI 诊断复盘',
    '教练辅导',
    '2024-04-16 20:00:00',
    '2024-04-16 21:00:00',
    '腾讯会议 889-345-778',
    '讨论算法薄弱点训练策略',
    '["辅导", "AI 诊断"]'
  ),
  (
    'schedule_admin_sync',
    'user_admin_1',
    '教研数据同步会',
    '教练辅导',
    '2024-04-13 10:00:00',
    '2024-04-13 11:00:00',
    '办公区会议室 B2',
    '更新课程上线进度与题库状态',
    '["教研", "会议"]'
  )
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `title` = VALUES(`title`),
  `event_type` = VALUES(`event_type`),
  `start_time` = VALUES(`start_time`),
  `end_time` = VALUES(`end_time`),
  `location` = VALUES(`location`),
  `focus` = VALUES(`focus`),
  `tags_json` = VALUES(`tags_json`);

INSERT INTO `forum_topics` (`id`, `author_id`, `title`, `content`, `tags_json`, `needs_moderation`)
VALUES
  (
    'topic_ai_training',
    'user_student_1',
    'AI 自适应训练体验分享',
    '昨晚体验了 AI 自适应训练，系统自动识别了我在图论和动态规划上的薄弱知识点，题目难度衔接很顺畅。大家还有哪些使用技巧？',
    '["AI 训练", "数据结构", "经验分享"]',
    0
  ),
  (
    'topic_material_share',
    'user_student_1',
    '求推荐：数学一冲刺资料',
    '有没有小伙伴整理数学一线性代数的错题本或冲刺资料？想找一份适合快速查漏补缺的。',
    '["数学", "资料交流"]',
    0
  ),
  (
    'topic_admin_notice',
    'user_admin_1',
    '教研通知：英语写作密训营资料校对',
    '本周五前请完成英语写作密训营资料的交叉校对，注意关注范文点评部分的语言风格一致性。',
    '["教研", "公告"]',
    1
  )
ON DUPLICATE KEY UPDATE
  `author_id` = VALUES(`author_id`),
  `title` = VALUES(`title`),
  `content` = VALUES(`content`),
  `tags_json` = VALUES(`tags_json`),
  `needs_moderation` = VALUES(`needs_moderation`);

INSERT INTO `forum_comments` (`id`, `topic_id`, `author_id`, `content`)
VALUES
  (
    'comment_001',
    'topic_ai_training',
    'user_admin_1',
    '很棒的反馈！建议在训练后打开知识点回放功能，查看详细解析。'
  ),
  (
    'comment_002',
    'topic_ai_training',
    'user_student_1',
    '收到！另外 AI 生成的错题本也不错，可以导出 PDF。'
  ),
  (
    'comment_003',
    'topic_material_share',
    'user_admin_1',
    '我们整理了一份线代冲刺资料，已上传至资料中心，可搜索“线代冲刺公式速查表”。'
  )
ON DUPLICATE KEY UPDATE
  `topic_id` = VALUES(`topic_id`),
  `author_id` = VALUES(`author_id`),
  `content` = VALUES(`content`);

INSERT INTO `forum_likes` (`topic_id`, `user_id`)
VALUES
  ('topic_ai_training', 'user_student_1'),
  ('topic_ai_training', 'user_admin_1'),
  ('topic_material_share', 'user_student_1')
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`);

INSERT INTO `subject_mastery` (`id`, `user_id`, `subject`, `mastery`, `trend`, `focus`)
VALUES
  (
    'mastery_math',
    'user_student_1',
    '数学一',
    0.72,
    '+6.4%',
    '重点复习线性代数特征值与概率统计大题。'
  ),
  (
    'mastery_politics',
    'user_student_1',
    '政治',
    0.58,
    '+3.1%',
    '梳理毛中特第二章框架，并强化时政题积累。'
  ),
  (
    'mastery_english',
    'user_student_1',
    '英语一',
    0.81,
    '+4.8%',
    '巩固阅读理解逻辑与写作素材积累。'
  ),
  (
    'mastery_cs',
    'user_student_1',
    '计算机 408',
    0.66,
    '+5.5%',
    '补齐数据结构-图与操作系统-进程管理。'
  )
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `subject` = VALUES(`subject`),
  `mastery` = VALUES(`mastery`),
  `trend` = VALUES(`trend`),
  `focus` = VALUES(`focus`);

INSERT INTO `analytics_overview` (`user_id`, `mock_trend`, `time_distribution`, `behavior_insight`)
VALUES
  (
    'user_student_1',
    '最近 3 次模考成绩：358 → 368 → 379，已连续两周保持上升趋势。',
    '工作日平均每日学习 4.5 小时，周末 7 小时。建议将政治复习时间提升 30%。',
    '上周平均专注时长 42min/番茄钟，错题回顾完成率 86%，夜间复盘坚持 5/7 天。'
  )
ON DUPLICATE KEY UPDATE
  `mock_trend` = VALUES(`mock_trend`),
  `time_distribution` = VALUES(`time_distribution`),
  `behavior_insight` = VALUES(`behavior_insight`);

INSERT INTO `weak_topics` (`id`, `user_id`, `topic`, `error_rate`, `suggestion`)
VALUES
  (
    'weak_linear_algebra',
    'user_student_1',
    '线性代数 · 特征值与特征向量',
    '32%',
    '回看第 5-6 讲并完成配套训练营。'
  ),
  (
    'weak_politics',
    'user_student_1',
    '政治 · 马原哲学部分',
    '28%',
    '整理错题思维导图，参加周五直播答疑。'
  ),
  (
    'weak_english',
    'user_student_1',
    '英语 · 长难句理解',
    '25%',
    '每日精读一篇外刊，积累结构。'
  ),
  (
    'weak_os',
    'user_student_1',
    '操作系统 · 进程同步',
    '24%',
    '完成专项题单并观看讲解视频。'
  ),
  (
    'weak_graph',
    'user_student_1',
    '数据结构 · 图的遍历',
    '21%',
    '整理 DFS/BFS 思维流程图，强化练习。'
  )
ON DUPLICATE KEY UPDATE
  `user_id` = VALUES(`user_id`),
  `topic` = VALUES(`topic`),
  `error_rate` = VALUES(`error_rate`),
  `suggestion` = VALUES(`suggestion`);
