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
     VITE_API_BASE_URL=http://localhost:3000          # 你的后端基础地址
     VITE_DASHBOARD_ENDPOINT=/api/learning/dashboard  # 返回学习看板的接口路径
     VITE_API_WITH_CREDENTIALS=false                  # 如果需要携带 Cookie/Session，改为 true
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
   - `Home`、`Courses`、`Practice`、`Schedule` 页面会调用 `/api/learning/*`、`/api/practice/*` 等接口，当请求失败时会提示错误并保留示例数据。
   - 可以在 `frontend/src/services/dashboardService.ts`、`frontend/src/services/learningService.ts` 中调整字段映射或替换接口路径。

4. **联调建议**
   - 保证后端允许跨域访问（CORS），特别是在前端使用 `npm run dev` 时端口通常为 `5173`。
   - 若后端需要 Cookie 或 Session，可以在 `.env.local` 中把 `VITE_API_WITH_CREDENTIALS` 设置为 `true`，并在后端设置允许携带凭据。
   - 推荐使用 `npm run dev` 启动前端后，通过浏览器开发者工具或 `Network` 面板确认请求是否成功、数据结构是否匹配。

## Node.js 服务端与数据库说明

> **重要提醒**：后端不会自动建表或灌入种子数据，仍需在 MySQL 中手动维护结构。下面列出的都是业务需要的表及字段，字段类型推荐沿用 `BIGINT UNSIGNED` 主键、`DATETIME` 时间戳，并保持所有外键字段类型与主表一致。

### 如何启动 Node.js 服务

1. 在 `server/` 目录下确认已经安装 Node.js 18+ 与 npm / pnpm / yarn 中任意一种包管理器。
2. 根据 `.env.example` 创建 `.env` 并填入数据库、会话、CORS 等配置：
   - `DB_HOST` / `DB_PORT` / `DB_NAME` / `DB_USER` / `DB_PASSWORD`
   - `ALLOWED_ORIGINS`（默认允许 `5173-5175` 端口，多个地址用逗号分隔）
   - `SESSION_SECRET`、`SESSION_NAME`、`SESSION_MAX_AGE`、`SESSION_SAME_SITE`、`SESSION_COOKIE_SECURE`
   - `PORT`（默认 `3000`）
3. 安装依赖并启动服务：
   ```bash
   cd server
   npm install        # 或 pnpm install / yarn install
   npm run start      # 生产模式
   # 或
   npm run dev        # 带热重载的开发模式
   ```
4. 控制台看到 `Server is running on http://localhost:3000` 后，即可通过前端页面访问接口。

主要接口全部挂载在 `/api` 前缀下，支持跨域并默认携带 Session Cookie：

- `/api/auth/*`：登录、注册、查询会话、退出登录
- `/api/practice/*`：刷题题单、题目增删查
- `/api/forum/*`：考研论坛话题与帖子发布浏览
- `/api/learning/*`：学习看板、课程体系、学习日程
- `/api/admin/*`：管理员看板、用户/专业/课程/资料/论坛管理、统计分析

### 数据库表清单

- **认证与基础设置**
  - `users`：`id`、`username`、`password`、`display_name`、`email`、`role`、`created_at`、`updated_at`
  - `site_settings`：`key`、`value`、`updated_at`
  - `admin_audit_logs`：`id`、`action`、`detail`、`actor_name`、`created_at`
- **学习进度与站点运营**
  - `student_progress`：`id`、`user_id`、`target_university`、`weekly_study_hours`、`completion_rate`、`updated_at`
  - `study_tasks`：`id`、`user_id`、`title`、`completed`、`completed_at`
  - `follow_up_tasks`：`id`、`title`、`status`
  - `system_alerts`：`id`、`message`、`resolved`
- **专业课程与资料**
  - `majors`：`id`、`name`、`description`、`created_at`、`updated_at`
  - `courses`：`id`、`title`/`name`、`teacher`、`category`、`progress`、`next_task`、`description`、`created_at`、`updated_at`
  - `course_materials`：`id`、`course_id`、`title`、`description`、`file_url`、`created_at`、`updated_at`
- **刷题题库**
  - `practice_sets`：`id`、`title`/`name`、`description`、`difficulty`/`level`、`tags`/`tags_json`、`accuracy`（可选）、`created_by`、`created_at`、`updated_at`
  - `practice_questions`：`id`、`practice_set_id`/`set_id`、`question_text`/`content`、`answer_text`、`explanation`、`tags`、`difficulty`、`created_by`、`created_at`、`updated_at`
- **论坛交流**
  - `forum_topics`：`id`、`title`、`description`、`author_id`、`created_at`、`updated_at`
  - `forum_posts`：`id`、`topic_id`、`author_id`、`content`、`created_at`、`updated_at`
- **学习日程**
  - `study_schedule` / `study_tasks` / `schedule_events`：`id`、`title`/`name`、`type`、`start_time`、`end_time`、`all_day`、`location`、`user_id`、`created_at`、`updated_at`

确保以上数据表准备就绪后即可直接使用 Node.js 服务，通过前端界面完成所有增删改查与管理操作。
