# bigwork

考研学习平台的前后端一体化项目，包含学员端看板、刷题、日程、论坛以及管理员后台。系统以 MySQL 为中心，通过 Node.js 接口向 React 前端提供统一的数据访问能力。

## 前后端技术栈与目录

| 模块 | 技术栈 | 目录 | 启动命令 |
| ---- | ------ | ---- | -------- |
| 前端界面 | Vite + React 18 + React Router + MUI 组件库，辅以 React Query、Axios 管理数据请求 | `frontend/` | `npm install` → `npm run dev`（默认端口 5173） |
| 后端服务 | Node.js (Express) + MySQL，会话管理使用 express-session + express-mysql-session，密码加密采用 bcryptjs | `server/` | `npm install` → `npm run dev` 或 `npm start`（默认端口 3000） |

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

后端不会自动迁移数据库，请在部署前手动执行 `server/schema/structure.sql` 或使用下列表结构清单创建所需数据表：

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
  - `forum_topic_likes`：`id`、`topic_id`、`user_id`、`created_at`
- **学习日程**
  - `study_schedule` / `schedule_events`：`id`、`title`/`name`、`type`、`start_time`、`end_time`、`all_day`、`location`、`user_id`、`created_at`、`updated_at`

确保上述表结构与字段类型在 MySQL 中创建完毕后，即可通过后端接口和前端界面完成完整的业务流程。
