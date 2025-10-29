# bigwork

毕业设计 - 考研学习平台前后端项目。本次提交新增了基于 React + Vite + Material UI 的前端原型，并配套了一个 Node.js Express 示例后端，涵盖学习概览、课程体系、刷题训练、日程规划、数据分析以及个人中心等核心页面，便于与现有后端或数据库对接。

## 前后端目录与启动方式

| 模块 | 目录 | 进入目录后运行的命令 | 默认端口 |
| ---- | ---- | ------------------- | -------- |
| 前端（Vite + React） | `frontend/` | `npm install` → `npm run dev` | `5173` |
| 后端（Express API + MySQL） | `server/` | `npm install` → `npm run dev`（或 `npm start`） | `3000` |

> ⚠️ 请分别在两个独立的终端中运行前端和后端，并在启动后端前确认本地 MySQL 已运行。首次启动会自动建库建表并写入示例数据。

### 前端对接后端接口

1. **配置接口地址**
   - 将 `frontend/.env.example` 复制为 `frontend/.env.local`（或 `.env`），并根据后端部署情况修改：
     ```bash
     VITE_API_BASE_URL=http://localhost:3000      # 你的后端基础地址
     VITE_DASHBOARD_ENDPOINT=/api/dashboard       # 返回看板总览的接口路径
     VITE_SCHEDULE_ENDPOINT=/api/schedule         # 日程相关接口
     VITE_PRACTICE_ENDPOINT=/api/practice         # 练习题单接口
     VITE_FORUM_ENDPOINT=/api/forum/topics        # 圈子交流接口
     VITE_ADMIN_OVERVIEW_ENDPOINT=/api/admin/overview
     VITE_ADMIN_COURSES_ENDPOINT=/api/admin/courses
     VITE_ADMIN_SYNC_ENDPOINT=/api/admin/sync
     VITE_MAJORS_ENDPOINT=/api/majors
     VITE_MATERIALS_ENDPOINT=/api/materials
     VITE_API_WITH_CREDENTIALS=false              # 如果需要携带 Cookie/Session，改为 true
     ```
   - `.env.local` 会被 Vite 自动加载，`VITE_` 前缀会注入到浏览器端代码中。不要在仓库中提交真实的私有地址或密钥。

2. **数据结构参考**
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

3. **页面对应关系**
   - `Home`、`Courses` 页面使用 `useDashboardData` 钩子获取总览数据，并根据登录角色（学员或管理员）展示差异化的总览卡片和提醒。
   - `Practice` 页面依赖 `/api/practice/*` 系列接口，支持获取题目、开始作答、提交测验以及查看“最新一次练习”摘要。
   - `Schedule` 页面通过 `/api/schedule` 读写个人行程，新建的日程会同步到首页时间轴和统计区域。
   - `Community` 页面连接 `/api/forum/topics`，用于发帖、评论、点赞；后端内置敏感词过滤并可标记待审核内容。
   - `Profile` 页面调用 `/api/users/:id` 与 `/api/majors`，允许学员与管理员分别维护自己的资料、目标和负责方向。
   - `AdminDashboard` 页面组合 `/api/admin/*`、`/api/materials` 等接口，提供课程发布、资料管理、圈子巡检与统计视图。

4. **调试建议**
   - 保证后端允许跨域访问（CORS），特别是在前端使用 `npm run dev` 时端口为 `5173`。
   - 若后端需要 Cookie/Session，在 `.env.local` 中设置 `VITE_API_WITH_CREDENTIALS=true`，并在后端允许携带凭据。
   - 建议使用浏览器开发者工具的 Network 面板或 `npm run dev -- --host` 暴露给局域网设备调试。

## 后端本地运行与数据库说明

`server/` 目录已经内置了基于 MySQL 的 Express 服务：

1. **数据库配置**
   - 仓库附带的 `server/.env` 默认内容如下，可在部署前按需修改：
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=123456
     DB_NAME=kaoyan_platform
     ```
   - 启动后端前，请确保本地或远程 MySQL 服务已运行且账号密码正确。

2. **自动建库建表与种子数据**
   - 首次运行 `npm run dev` / `npm start` 时会自动：
     1. 创建 `kaoyan_platform` 数据库；
     2. 建立所需的数据表；
     3. 写入示例专业、账号、课程、资料、题库、圈子、分析等内容。
   - 如果想重置数据，可在 Navicat 或命令行中清空这些表，或直接删除数据库后重新启动服务。

3. **主要数据表**
   | 表名 | 作用 | 关键字段 |
   | --- | --- | --- |
   | `majors` | 专业管理 | `name`、`description` |
   | `users` | 用户与管理员账号 | `username`、`password`、`role`、`major_id` |
   | `courses` | 课程与发布状态 | `name`、`category`、`teacher`、`status`、`release_window` |
   | `materials` | 资料与题库附件 | `course_id`、`title`、`material_type`、`url` |
   | `practice_sets` | 专项训练概览 | `name`、`focus`、`last_accuracy`、`last_summary` |
   | `practice_questions` | 单选/多选题库 | `practice_set_id`、`question_type`、`stem`、`options_json` |
   | `practice_attempts` | 练习历史 | `practice_set_id`、`user_id`、`accuracy`、`answers_json` |
   | `schedule_events` | 学习日程 | `user_id`、`title`、`event_type`、`start_time`、`tags_json` |
   | `forum_topics` | 圈子话题 | `title`、`content`、`tags_json`、`needs_moderation` |
   | `forum_comments` | 圈子评论 | `topic_id`、`content`、`author_id` |
   | `forum_likes` | 点赞记录 | `topic_id`、`user_id` |
   | `analytics_overview` | 学习分析摘要 | `mock_trend`、`time_distribution`、`behavior_insight` |
   | `subject_mastery` | 学科掌握度 | `subject`、`mastery`、`trend`、`focus` |
   | `weak_topics` | 薄弱知识点 | `topic`、`error_rate`、`suggestion` |

4. **接口与功能覆盖**
   - `/api/auth/login`：根据数据库账号完成登录，返回角色信息、联系方式、目标院校等。
   - `/api/dashboard`：根据角色返回学习总览、课程进度、题单、日程以及管理员关注项。
   - `/api/practice` + `/api/practice/:id/questions` + `/api/practice/:id/attempt`：创建题单、获取题目、提交答卷并记录最新成绩摘要。
   - `/api/schedule`：读取与创建学习日程，自动与首页同步。
   - `/api/forum/topics`：圈子发帖、评论、点赞；系统会使用内置敏感词表替换辱骂词并标记待审核话题。
   - `/api/users/:id`：个人中心信息查询与更新。
   - `/api/majors`、`/api/materials`、`/api/admin/*`：管理员端的专业、资料、课程草稿、统计与同步控制。

5. **Navicat 维护建议**
   - 使用 Navicat 连接 `kaoyan_platform` 后，可直接通过可视化界面新增课程、题目、论坛帖子或用户信息。
   - 导入外部 SQL/CSV 题库时，请确保字段名称与上表一致，必要时可在 `server/seedData.js` 参考示例数据结构。

6. **预置账号**
   - 学员账号：`student / study2025`
   - 管理员账号：`admin / admin123`

> 如果需要重新执行种子脚本，可删除数据库或清空各表后重启后端服务。
