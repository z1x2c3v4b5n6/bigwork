# bigwork

毕业设计 - 考研学习平台前后端项目。本次提交新增了基于 React + Vite + Material UI 的前端原型，并配套了一个 Node.js Express 示例后端，涵盖学习概览、课程体系、刷题训练、日程规划、数据分析以及个人中心等核心页面，便于与现有后端或数据库对接。

## 前后端目录与启动方式

| 模块 | 目录 | 进入目录后运行的命令 | 默认端口 |
| ---- | ---- | ------------------- | -------- |
| 前端（Vite + React） | `frontend/` | `npm install` → `npm run dev` | `5173` |
| 后端（Express API） | `server/` | `npm install` → `npm run dev`（或 `npm start`） | `3000` |

> ⚠️ 请分别在两个独立的终端中运行前端和后端，确保后端先启动，这样前端在发起接口请求时能够成功返回数据。

### 前端对接后端接口

1. **配置接口地址**
   - 将 `frontend/.env.example` 复制为 `frontend/.env.local`（或 `.env`），并根据后端部署情况修改：
     ```bash
     VITE_API_BASE_URL=http://localhost:3000      # 你的后端基础地址
     VITE_DASHBOARD_ENDPOINT=/api/dashboard       # 返回看板总览的接口路径
     VITE_SCHEDULE_ENDPOINT=/api/schedule         # 日程相关接口
     VITE_PRACTICE_ENDPOINT=/api/practice         # 练习题单接口
     VITE_ADMIN_ENDPOINT=/api/admin               # 管理员端入口
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
   - `Home`、`Courses` 页面使用 `useDashboardData` 钩子获取总览数据。
   - `Practice`、`Schedule`、`AdminDashboard` 页面分别使用 `usePracticeSets`、`useSchedule`、`useAdminOverview` 调用后端，可在 `frontend/src/services/*.ts` 中调整接口路径或字段映射。

4. **调试建议**
   - 保证后端允许跨域访问（CORS），特别是在前端使用 `npm run dev` 时端口为 `5173`。
   - 若后端需要 Cookie/Session，在 `.env.local` 中设置 `VITE_API_WITH_CREDENTIALS=true`，并在后端允许携带凭据。
   - 建议使用浏览器开发者工具的 Network 面板或 `npm run dev -- --host` 暴露给局域网设备调试。

## 后端本地运行与数据库连接（Navicat 示例）

`server/` 目录提供了一个使用本地 JSON 文件的 Express 示例服务，你可以先按照上面的命令直接运行，确认前后端打通。如果需要接入自己在 Navicat 中管理的数据库（例如 MySQL），可以按照以下步骤改造：

1. **在 Navicat 中创建数据库与数据表**
   - 新建连接 → 选择 MySQL → 填写主机、端口、用户名和密码（默认端口 3306）。
   - 连接成功后创建一个新的数据库（例如 `kaoyan_platform`），并在其中建立如下数据表：
     - `dashboard_stats`（字段：`id`、`title`、`value`、`helper_text`、`icon` 等）
     - `courses`（字段：`id`、`title`、`category`、`teacher`、`progress`、`next_task` 等）
     - `practice_sets`（字段：`id`、`name`、`questions`、`accuracy`、`duration`、`focus`、`last_attempt` 等）
     - `schedule_events`（字段：`id`、`title`、`type`、`start_time`、`end_time`、`location`、`focus`、`tags` 等）
     - `admin_course_drafts`、`admin_review_tasks` 等管理员专用表。
   - 你可以使用 Navicat 的「设计表」界面建表，也可以导入 SQL 脚本（例如 `CREATE TABLE ...`）。

2. **安装数据库驱动并配置环境变量**
   - 在 `server/` 目录安装 MySQL 依赖：
     ```bash
     cd server
     npm install mysql2
     ```
   - 新建 `server/.env`（或在部署环境设置变量）：
     ```env
     DB_HOST=localhost
     DB_PORT=3306
     DB_USER=root
     DB_PASSWORD=你的密码
     DB_NAME=kaoyan_platform
     ```

3. **在后端代码中启用数据库连接**
   - 示例：在 `server/index.js` 中引入 `mysql2` 并初始化连接池，然后在各个路由中替换 `readDb()/writeDb()` 为 SQL 查询。
     ```js
     import mysql from 'mysql2/promise';
     import dotenv from 'dotenv';

     dotenv.config();

     const pool = mysql.createPool({
       host: process.env.DB_HOST,
       port: process.env.DB_PORT,
       user: process.env.DB_USER,
       password: process.env.DB_PASSWORD,
       database: process.env.DB_NAME,
     });

     app.get('/api/dashboard', async (_req, res) => {
       const [stats] = await pool.query('SELECT id, title, value, helper_text FROM dashboard_stats ORDER BY sort_order');
       const [courses] = await pool.query('SELECT * FROM courses ORDER BY updated_at DESC LIMIT 8');
       // ...按需组装返回对象
       res.json({ stats, courses /* ... */ });
     });
     ```
   - 如果你希望继续使用 `db.json` 作为兜底数据，可以在查询失败时捕获异常并回退到文件读取逻辑。

4. **使用 Navicat 进行数据维护**
   - Navicat 支持可视化新增、编辑、导入导出数据，所有操作都会直接更新数据库表。
   - Express 服务使用 SQL 查询实时读取最新数据，因此你在 Navicat 中的修改会立即反映到前端页面。

5. **常见调试问题**
   - 如果前端出现 404/500，请检查后端终端的报错信息，确认 SQL 是否正确、连接是否成功。
   - 若需要远程访问数据库，请在 Navicat 中确认数据库服务端已经开放外网访问，并在 Express 服务器中使用对应的 IP 和端口。
   - 推荐在 `server` 项目中运行 `npm run dev`，它使用 `nodemon` 监听文件变更，修改后端代码会自动重启服务。

## 示例 JSON 数据服务（快速演示）

在接入真实数据库前，也可以使用默认的 JSON 数据快速预览整体功能：

```bash
cd server
npm install
npm run dev   # 使用 nodemon 热更新
# 或 npm start # 以纯 Node.js 方式启动
```

默认会在 `http://localhost:3000` 暴露以下端点：

| 方法 | 路径 | 说明 |
| ---- | ---- | ---- |
| GET  | `/api/dashboard`        | 返回学生端看板数据，含课程、题单、日程等 |
| GET/POST | `/api/practice`     | 获取或创建专项训练题单，支持前端自定义生成 |
| GET/POST | `/api/schedule`     | 获取或创建学习日程，自动同步到首页时间轴 |
| GET/POST | `/api/admin/*`      | 管理员端驾驶舱所需的统计、课程草稿与同步动作 |

后端会将新增的日程、题单写回 `server/data/db.json`，刷新页面即可看到更新。
