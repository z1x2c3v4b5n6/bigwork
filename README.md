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

后端不会自动迁移数据库，请在部署前手动执行 `server/schema/structure.sql`，或参照下表创建所有业务数据表：

| 模块 | 数据表 | 关键字段（节选） |
| ---- | ------ | ---------------- |
| 用户与基础配置 | `majors` | `id`、`name`、`description`、`created_at` |
| 用户与基础配置 | `users` | `id`、`username`、`password`、`display_name`、`role`、`major_id`、`created_at`、`updated_at` |
| 课程与资料 | `courses` | `id`、`major_id`、`name`、`category`、`teacher`、`status`、`summary`、`created_at`、`updated_at` |
| 课程与资料 | `materials` | `id`、`course_id`、`title`、`material_type`、`url`、`description`、`created_at` |
| 刷题训练 | `practice_sets` | `id`、`owner_id`、`name`、`focus`、`difficulty`、`duration_minutes`、`question_count`、`last_accuracy`、`updated_at` |
| 刷题训练 | `practice_questions` | `id`、`practice_set_id`、`question_type`、`stem`、`options_json`、`correct_options`、`created_at` |
| 刷题训练 | `practice_attempts` | `id`、`practice_set_id`、`user_id`、`accuracy`、`score`、`answers_json`、`summary`、`created_at` |
| 日程管理 | `schedule_events` | `id`、`user_id`、`title`、`event_type`、`start_time`、`end_time`、`location`、`tags_json`、`created_at` |
| 学习分析 | `subject_mastery` | `id`、`user_id`、`subject`、`mastery`、`trend`、`focus` |
| 学习分析 | `analytics_overview` | `user_id`、`mock_trend`、`time_distribution`、`behavior_insight`、`updated_at` |
| 学习分析 | `weak_topics` | `id`、`user_id`、`topic`、`error_rate`、`suggestion` |
| 论坛社区 | `forum_topics` | `id`、`author_id`、`title`、`content`、`tags_json`、`created_at` |
| 论坛社区 | `forum_comments` | `id`、`topic_id`、`author_id`、`content`、`created_at` |
| 论坛社区 | `forum_likes` | `topic_id`、`user_id`、`created_at` |

脚本末尾同时包含示例数据（专业、课程、资料、题单等），执行一次即可完成基础数据填充，方便前端、小程序联调。【F:server/schema/structure.sql†L1-L213】
