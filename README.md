# bigwork

毕业设计 - 考研学习平台前后端项目。当前代码在原型界面基础上扩展了完整的账号体系、后台管理、刷题题库、论坛交流等功能模块，所有数
据均通过接口写入 MySQL，由人工维护的数据库结构提供支撑。

## 新增功能概览

- **账号体系**：登录、注册直接对接数据库中的 `users` 表，AuthContext 会在路由层拦截未登录访问；退出登录后自动失去管理员权限。
- **后台管理**：`/admin` 页面提供基础信息、用户、专业、课程、资料、论坛、统计查询等面板，所有操作均调用 `/api/admin/*` 接口写入数据库。
- **刷题训练**：`/practice` 页面支持创建题单、录入题目、实时查看题库内容，全部存储于 `practice_sets`、`practice_questions` 表。
- **考研论坛**：`/forum` 页面提供话题与帖子增删，管理员可在后台进行话题、帖子审核与删除。
- **接口约束**：服务端不会自动建表或填充种子数据，所有结构需按下方 SQL 手动执行。跨域默认允许 `5173/5174/5175` 端口，便于多实例调试。

## 前端如何连接现有后端

1. **配置接口地址**
   - 将 `frontend/.env.example` 复制为 `frontend/.env.local`（或 `.env`），并根据后端部署情况修改：
     ```bash
     VITE_API_BASE_URL=http://localhost:3000      # 你的后端基础地址
     VITE_DASHBOARD_ENDPOINT=/dashboard-overview  # 返回看板总览的接口路径
     VITE_API_WITH_CREDENTIALS=false              # 如果需要携带 Cookie/Session，改为 true
     ```
   - `.env.local` 会被 Vite 自动加载，`VITE_` 前缀会注入到浏览器端代码中。不要在仓库中提交真实的私有地址或密钥。

2. **返回统一的数据结构**
   - 前端默认会请求 `GET {VITE_API_BASE_URL}{VITE_DASHBOARD_ENDPOINT}` 并期望返回如下字段（可以按需增减，缺失时会自动使用内置示例数据兜底）：
     ```jsonc
     {
       "userName": "张同学",
       "stats": [
         { "id": "studyTime", "title": "本周学习时长", "value": "28 小时", "helperText": "比上周 +10%" }
       ],
       "courses": [
         { "id": "math", "title": "数学一强化", "category": "公共课", "teacher": "李老师", "progress": 72, "nextTask": "完成曲线积分" }
       ],
       "practiceSets": [
         { "id": "ps1", "name": "数学选择题", "questions": 60, "accuracy": 0.8, "lastAttempt": "2024-03-10" }
       ],
       "schedule": [
         { "id": "sc1", "title": "数学直播课", "type": "直播课", "start": "2024-03-12T19:00:00", "end": "2024-03-12T21:00:00" }
       ],
       "recommendation": "结合最新练习记录，建议……"
     }
     ```
   - `stats` 数组中的 `id` 建议使用 `studyTime`、`questionDrill`、`courseFocus`、`mockRank` 之一，以便前端自动匹配相应图标和配色。

3. **在前端页面中查看接口数据**
   - `Home`、`Courses`、`Practice`、`Schedule` 页面通过 `useDashboardData` 钩子调用后端，当接口可用时会展示实时数据；如果请求失败，则会显示错误提示并保留示例数据。
   - 你可以在 `frontend/src/services/dashboardService.ts` 中自定义字段映射逻辑，例如追加新的统计项、练习类型或使用不同的接口路径。

4. **联调建议**
   - 保证后端允许跨域访问（CORS），特别是在前端使用 `npm run dev` 时端口通常为 `5173`。
   - 若后端需要 Cookie 或 Session，可以在 `.env.local` 中把 `VITE_API_WITH_CREDENTIALS` 设置为 `true`，并在后端设置允许携带凭据。
   - 推荐使用 `npm run dev` 启动前端后，通过浏览器开发者工具或 `Network` 面板确认请求是否成功、数据结构是否匹配。

## 服务端接口与数据库表结构

> **重要说明**：以下所有数据表均需由你手动在 MySQL 中创建，项目不会自动建表。字段类型统一采用 `BIGINT UNSIGNED` 作为主键，时间字段建议使用 `DATETIME` 并结合 `toMySQLDateTime` 工具统一写入格式。

### 认证与基础设置

```sql
CREATE TABLE `users` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `username` VARCHAR(64) NOT NULL UNIQUE,
  `password` VARCHAR(255) NOT NULL,
  `display_name` VARCHAR(100) NOT NULL,
  `email` VARCHAR(120) DEFAULT NULL,
  `role` ENUM('student','admin') NOT NULL DEFAULT 'student',
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `site_settings` (
  `key` VARCHAR(64) NOT NULL,
  `value` TEXT,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`key`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `admin_audit_logs` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `action` VARCHAR(120) NOT NULL,
  `detail` TEXT,
  `actor_name` VARCHAR(100),
  `created_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 学习与运营数据

```sql
CREATE TABLE `student_progress` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `target_university` VARCHAR(120) DEFAULT NULL,
  `weekly_study_hours` INT DEFAULT 0,
  `completion_rate` DECIMAL(5,2) DEFAULT 0,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `study_tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `user_id` BIGINT UNSIGNED NOT NULL,
  `title` VARCHAR(120) NOT NULL,
  `completed` TINYINT(1) DEFAULT 0,
  `completed_at` DATETIME DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `follow_up_tasks` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(120) NOT NULL,
  `status` ENUM('pending','done') NOT NULL DEFAULT 'pending',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `system_alerts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `message` VARCHAR(255) NOT NULL,
  `resolved` TINYINT(1) NOT NULL DEFAULT 0,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 教务信息管理

```sql
CREATE TABLE `majors` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `name` VARCHAR(120) NOT NULL,
  `description` TEXT,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `courses` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `teacher` VARCHAR(100),
  `credit` DECIMAL(4,1) DEFAULT NULL,
  `major_id` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`major_id`) REFERENCES `majors`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `course_materials` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `course_id` BIGINT UNSIGNED DEFAULT NULL,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `file_url` VARCHAR(255),
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`course_id`) REFERENCES `courses`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 刷题题库

```sql
CREATE TABLE `practice_sets` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `difficulty` VARCHAR(20) DEFAULT 'medium',
  `tags` VARCHAR(255) DEFAULT NULL,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `practice_questions` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `practice_set_id` BIGINT UNSIGNED NOT NULL,
  `question_text` TEXT NOT NULL,
  `answer_text` TEXT,
  `explanation` TEXT,
  `tags` VARCHAR(255),
  `difficulty` VARCHAR(20) DEFAULT 'medium',
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`practice_set_id`) REFERENCES `practice_sets`(`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

### 论坛交流

```sql
CREATE TABLE `forum_topics` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `title` VARCHAR(150) NOT NULL,
  `description` TEXT,
  `created_by` BIGINT UNSIGNED DEFAULT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`created_by`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE `forum_posts` (
  `id` BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  `topic_id` BIGINT UNSIGNED NOT NULL,
  `user_id` BIGINT UNSIGNED DEFAULT NULL,
  `content` TEXT NOT NULL,
  `created_at` DATETIME NOT NULL,
  `updated_at` DATETIME NOT NULL,
  PRIMARY KEY (`id`),
  FOREIGN KEY (`topic_id`) REFERENCES `forum_topics`(`id`),
  FOREIGN KEY (`user_id`) REFERENCES `users`(`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;
```

准备好以上表结构后即可直接运行 `node server/src/index.js` 启动后端，并通过前端界面完成增删改查操作。
