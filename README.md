# bigwork

考研学习平台的前后端一体化项目，包含学员端看板、刷题、日程、论坛以及管理员后台。系统以 MySQL 为中心，通过 Node.js 接口向 React 前端提供统一的数据访问能力。

## 前后端技术栈与目录

| 模块 | 技术栈 | 目录 | 启动命令 |
| ---- | ------ | ---- | -------- |
| 前端界面 | Vite + React 18 + React Router + MUI 组件库，辅以 React Query、Axios 管理数据请求 | `frontend/` | `npm install` → `npm run dev`（默认端口 5173） |
| 后端服务 | Node.js (Express) + MySQL，会话管理使用 express-session + express-mysql-session，密码加密采用 bcryptjs | `server/` | `npm install` → `npm run dev` 或 `npm start`（默认端口 3000） |
| 微信小程序 | 微信小程序原生框架 + TypeScript，复用服务端院校推荐算法并内置完整演示数据 | `miniprogram/` | 直接导入微信开发者工具，基础库 ≥ 2.33.0 |

### 前端结构与职责概述
- `src/layouts/AppLayout.tsx`：负责整体导航框架、响应式抽屉与主题切换。
- `src/pages/`：按功能划分页面（课程、刷题、日程、论坛、后台等），通过 React Router 组织路由。
- `src/context/AuthContext.tsx`：提供登录态与角色的全局上下文，配合 `RequireAuth`、`RequireAdmin` 控制路由访问。
- `src/services/`：封装 Axios 请求，与后端 `/api/*` 接口通信，前端状态通过 React Query 做缓存与错误处理。

### 后端结构与职责概述
- `src/index.js`：创建 Express 应用、加载中间件、挂载路由、启动服务。
- `src/config/`：读取 `.env` 配置（数据库、会话、CORS 等）。
- `src/database.js`：初始化 MySQL 连接与连接池，供业务层复用。
- `src/routes/`：按功能拆分模块（`auth`、`learning`、`practice`、`forum`、`admin`），统一挂载在 `/api` 前缀下。
- `src/middleware/`：包含认证、错误处理、会话持久化等通用逻辑。

## 微信小程序实现概览

小程序端定位为“移动复试资料助手”，复刻 Web 端核心能力并支持离线演示、在线联调双模式：

- **页面结构**：`app.json` 中配置 12 个页面（概览、课程、刷题、日程、学习分析、院校顾问、论坛、个人中心、后台、复试资料三大分栏等），全局样式由 `app.ts` / `app.wxss` 控制，保证卡片式统一视觉。【F:miniprogram/README.md†L5-L35】
- **数据来源**：默认读取 `data/` 目录内的 TypeScript 数据文件（如 `dashboard.ts`、`practice.ts`、`resources.ts`），借助 `utils/storage.ts` 写入本地存储，首次进入即可看到完整样例数据。【F:miniprogram/README.md†L37-L60】
- **智能推荐**：`utils/universityAdvisor.ts` 重用了 Web/后端的推荐算法，结合 `data/universityProfiles.ts` 生成冲刺 / 稳妥 / 保底院校组合，并输出策略建议。【F:miniprogram/README.md†L61-L86】
- **接口适配**：`config.ts` 提供 `baseUrl` 配置；小程序 API 封装在 `utils/api.ts` 中，自动附带 Express 会话 Cookie 并在 401 时清理缓存，保证与服务器联调时的登录态一致。【F:miniprogram/utils/api.ts†L1-L70】
- **启动体验**：`app.ts` 中的登录检测逻辑会在冷启动时检查本地凭据，若会话失效则直接跳转到“个人中心/登录”页，避免未授权访问导致的 401 报错。【F:miniprogram/app.ts†L1-L37】

> 微信端所有页面均基于原生组件实现，无需额外第三方 UI 库，可通过修改 `app.wxss` 与各页面样式快速适配院校主题色。

## 毕业论文撰写思路（示例）
1. **背景与需求分析**：说明考研学习的痛点、目标用户、核心需求以及竞品调研结果。
2. **系统总体设计**：从整体架构入手，描述前后端分离、RESTful API、会话认证与权限划分，并附系统功能模块图或用例图。
3. **前端实现**：重点阐述组件化设计、路由与状态管理（React Context + React Query）、响应式 UI 以及与后端的接口适配策略。
4. **后端实现**：介绍 Express 的路由设计、分层结构、会话管理、安全（密码加密、权限校验）和与数据库的交互方式。
5. **数据库设计**：给出 E-R 图或表结构设计原则，强调范式、索引、外键关系与数据一致性方案。
6. **系统测试与部署**：列出接口测试、端到端场景、性能或安全测试要点，并说明部署拓扑（前端静态资源 + Node.js 服务 + MySQL）。
7. **总结与展望**：评价系统价值，提出未来可以扩展的方向（智能推荐、移动端、小程序等）。

> 写作时可将 README 中的架构与技术说明整理成论文附录或章节提纲，并补充截图、流程图、序列图等佐证材料。

## 数据库设计摘要

后端不会自动迁移数据库，请在部署前手动执行 `server/schema/structure.sql`。下方按照业务域枚举了全部表结构及字段含义，可直接引用到论文的数据库章节：

### 基础配置模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `majors` | `id` | VARCHAR(30) | 专业主键，手工指定便于跨库同步 |
|  | `name` | VARCHAR(100) | 专业名称，唯一约束 |
|  | `description` | TEXT | 专业简介与学习路径说明 |
|  | `created_at` | TIMESTAMP | 创建时间，默认当前时间 |
| `users` | `id` | VARCHAR(30) | 用户主键，使用雪花/UUID 等非自增方案 |
|  | `username` | VARCHAR(64) | 登录账号，唯一 |
|  | `password` | VARCHAR(255) | Bcrypt 加密后的密码摘要 |
|  | `display_name` | VARCHAR(64) | 前端显示昵称 |
|  | `role` | ENUM('student','admin') | 角色标识，默认学生 |
|  | `email` | VARCHAR(128) | 邮箱（可选） |
|  | `phone` | VARCHAR(32) | 手机号（可选） |
|  | `organization` | VARCHAR(255) | 所属院校/机构 |
|  | `goal` | VARCHAR(255) | 个人目标，如目标分数或院校 |
|  | `major_id` | VARCHAR(30) | 关联专业，外键至 `majors.id` |
|  | `avatar` | VARCHAR(255) | 头像链接或标识 |
|  | `bio` | TEXT | 自我介绍 |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间（自动更新） |

### 课程与资料模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `courses` | `id` | VARCHAR(30) | 课程主键 |
|  | `major_id` | VARCHAR(30) | 关联专业，外键至 `majors.id` |
|  | `name` | VARCHAR(200) | 课程名称 |
|  | `category` | VARCHAR(40) | 课程分类（公共课、专业课等） |
|  | `teacher` | VARCHAR(100) | 授课老师 |
|  | `credit` | DECIMAL(4,1) | 学分或课时权重 |
|  | `progress` | INT | 完成进度百分比 |
|  | `status` | VARCHAR(20) | 发布状态（published/draft/review 等） |
|  | `summary` | TEXT | 课程简介 |
|  | `schedule_info` | VARCHAR(255) | 课程排期信息 |
|  | `release_window` | VARCHAR(120) | 发布周期描述 |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间 |
| `materials` | `id` | VARCHAR(30) | 资料主键 |
|  | `course_id` | VARCHAR(30) | 关联课程，外键至 `courses.id` |
|  | `title` | VARCHAR(200) | 资料标题 |
|  | `material_type` | VARCHAR(50) | 资料类型（讲义、视频等） |
|  | `url` | VARCHAR(255) | 资料下载或访问地址 |
|  | `description` | TEXT | 内容描述 |
|  | `created_at` | TIMESTAMP | 创建时间 |

### 刷题训练模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `practice_sets` | `id` | VARCHAR(30) | 题单主键 |
|  | `owner_id` | VARCHAR(30) | 创建人，外键至 `users.id` |
|  | `name` | VARCHAR(200) | 题单名称 |
|  | `focus` | VARCHAR(255) | 训练侧重点 |
|  | `difficulty` | VARCHAR(20) | 难度标签 |
|  | `duration_minutes` | INT | 建议练习时长 |
|  | `question_count` | INT | 题目数量 |
|  | `last_attempt_at` | DATETIME | 最近一次作答时间 |
|  | `last_accuracy` | DECIMAL(5,2) | 最近一次正确率 |
|  | `last_score` | INT | 最近一次得分 |
|  | `last_summary` | TEXT | 最近一次作答总结 |
|  | `source` | VARCHAR(100) | 题单来源（默认系统推荐） |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间 |
| `practice_questions` | `id` | VARCHAR(30) | 题目主键 |
|  | `practice_set_id` | VARCHAR(30) | 所属题单，外键至 `practice_sets.id` |
|  | `question_type` | ENUM('single','multiple') | 题目类型（单选/多选） |
|  | `stem` | TEXT | 题干 |
|  | `options_json` | TEXT | 选项 JSON |
|  | `correct_options` | TEXT | 正确选项 JSON |
|  | `explanation` | TEXT | 解析说明 |
|  | `knowledge_point` | VARCHAR(255) | 知识点标签 |
|  | `created_at` | TIMESTAMP | 创建时间 |
| `practice_attempts` | `id` | VARCHAR(30) | 作答记录主键 |
|  | `practice_set_id` | VARCHAR(30) | 关联题单 |
|  | `user_id` | VARCHAR(30) | 作答用户 |
|  | `accuracy` | DECIMAL(5,2) | 正确率 |
|  | `score` | INT | 得分 |
|  | `answers_json` | LONGTEXT | 用户作答详情 JSON |
|  | `summary` | TEXT | 系统总结或人工批注 |
|  | `created_at` | TIMESTAMP | 创建时间 |
| `wrong_questions` | `id` | VARCHAR(60) | 错题主键 |
|  | `user_id` | VARCHAR(30) | 所属用户 |
|  | `question` | TEXT | 题干或知识点描述 |
|  | `answer` | TEXT | 正确答案 |
|  | `analysis` | TEXT | 解题思路或解析 |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间 |

### 日程与学习任务模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `schedule_events` | `id` | VARCHAR(30) | 日程事件主键 |
|  | `user_id` | VARCHAR(30) | 关联用户 |
|  | `title` | VARCHAR(200) | 事件标题 |
|  | `event_type` | VARCHAR(30) | 事件类型（直播、考试等） |
|  | `start_time` | DATETIME | 开始时间 |
|  | `end_time` | DATETIME | 结束时间 |
|  | `location` | VARCHAR(200) | 地点 |
|  | `focus` | VARCHAR(255) | 关注点/备注 |
|  | `tags_json` | TEXT | 标签 JSON |
|  | `created_at` | TIMESTAMP | 创建时间 |
| `daily_learning_tasks` | `id` | VARCHAR(40) | 每日学习任务主键 |
|  | `task_date` | DATE | 任务日期，唯一 |
|  | `title` | VARCHAR(200) | 任务标题 |
|  | `description` | TEXT | 任务描述 |
|  | `target_text` | VARCHAR(200) | 目标说明或口号 |
|  | `estimated_minutes` | INT | 预计耗时，默认 45 分钟 |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间 |
| `daily_task_completions` | `id` | BIGINT UNSIGNED | 自增主键 |
|  | `task_id` | VARCHAR(40) | 对应任务，外键至 `daily_learning_tasks.id` |
|  | `user_id` | VARCHAR(30) | 完成任务的用户 |
|  | `completed_at` | DATETIME | 实际完成时间 |
|  | `created_at` | TIMESTAMP | 创建时间 |
|  | `updated_at` | TIMESTAMP | 更新时间 |

### 论坛与互动模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `forum_topics` | `id` | VARCHAR(30) | 话题主键 |
|  | `author_id` | VARCHAR(30) | 发帖用户 |
|  | `title` | VARCHAR(200) | 帖子标题 |
|  | `content` | TEXT | 帖子正文 |
|  | `tags_json` | TEXT | 标签 JSON |
|  | `needs_moderation` | TINYINT(1) | 是否需人工审核 |
|  | `created_at` | TIMESTAMP | 创建时间 |
| `forum_comments` | `id` | VARCHAR(30) | 评论主键 |
|  | `topic_id` | VARCHAR(30) | 所属话题 |
|  | `author_id` | VARCHAR(30) | 评论用户 |
|  | `content` | TEXT | 评论内容 |
|  | `created_at` | TIMESTAMP | 创建时间 |
| `forum_likes` | `topic_id` | VARCHAR(30) | 点赞所属话题 |
|  | `user_id` | VARCHAR(30) | 点赞用户 |
|  | `created_at` | TIMESTAMP | 点赞时间 |

### 学习分析与 AI 模块

| 表名 | 字段 | 类型 | 说明 |
| ---- | ---- | ---- | ---- |
| `subject_mastery` | `id` | VARCHAR(30) | 学科掌握度主键 |
|  | `user_id` | VARCHAR(30) | 用户 ID |
|  | `subject` | VARCHAR(100) | 学科名称 |
|  | `mastery` | DECIMAL(4,2) | 掌握度 0-100 |
|  | `trend` | VARCHAR(20) | 趋势（上升、持平等） |
|  | `focus` | TEXT | 建议关注点 |
| `analytics_overview` | `user_id` | VARCHAR(30) | 关联用户主键，同表主键 |
|  | `mock_trend` | TEXT | 模考趋势 JSON |
|  | `time_distribution` | TEXT | 时间分布 JSON |
|  | `behavior_insight` | TEXT | 学习行为洞察 |
|  | `updated_at` | TIMESTAMP | 更新时间 |
| `weak_topics` | `id` | VARCHAR(30) | 弱项主键 |
|  | `user_id` | VARCHAR(30) | 用户 ID |
|  | `topic` | VARCHAR(200) | 弱项主题 |
|  | `error_rate` | VARCHAR(20) | 错误率描述 |
|  | `suggestion` | TEXT | 改进建议 |
| `ai_conversations` | `id` | BIGINT UNSIGNED | 自增会话主键 |
|  | `user_id` | VARCHAR(30) | 用户 ID |
|  | `question` | TEXT | 用户提问 |
|  | `answer` | LONGTEXT | AI 回复内容 |
|  | `created_at` | TIMESTAMP | 会话创建时间 |

脚本末尾同时包含示例数据（专业、课程、资料、题单等），执行一次即可完成基础数据填充，方便前端、小程序联调。【F:server/schema/structure.sql†L1-L249】
