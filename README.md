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

## 系统结构图、E-R 图与流程图绘制清单

以下内容可直接复制到绘图工具的备注或论文附录，确保每张图的结构、节点命名与本项目模块保持一致。

### 第一部分：结构图类（系统结构图 + 各端结构图）

**图4-2 系统整体结构图**
- **用途**：展示“考研交流平台设计与实现”的三端协同结构，说明顶层系统与各端子系统的分层关系。
- **节点清单**：
  1. 顶部矩形：“考研交流平台设计与实现”。
  2. 第二层三个矩形：“用户端”“院校端”“管理员端”。
- **连接关系**：从顶部“考研交流平台设计与实现”垂直向下连三条箭头，分别指向三个子系统，表示 1:N 的从属关系；可在箭头旁补充“功能覆盖”“角色入口”等注解。
- **布局建议**：采用自上而下两层结构，顶层单个宽矩形，第二层三个矩形水平排列，间距一致，箭头采用等长直线，保持层级清晰。

**图4-3 用户端结构图**
- **用途**：列出用户端包含的全部功能模块，方便在产品说明或需求章节中逐一对照。
- **节点清单**：顶部“用户端”，下方依次为“首页看板”“专业与课程”“学习资料”“刷题与错题”“日程与每日任务”“论坛交流”“个人中心”。
- **连接关系**：从“用户端”向下延伸 7 条垂直或斜向直线到每个模块，表示 1:N 功能分派；可在连线末尾加简单箭头说明“入口→模块”。
- **布局建议**：采用两行或三行矩形网格，例如第一行放三个模块（首页看板、专业与课程、学习资料），第二行放四个模块（刷题与错题、日程与每日任务、论坛交流、个人中心）；各模块尺寸一致，整体置于“用户端”下方居中。

**图4-4 院校端结构图**
- **用途**：说明院校端负责的后台业务范围，用于论文中介绍院校角色权限。
- **节点清单**：顶部“院校端”；下方依次为“院校信息管理”“专业与招生信息管理”“公告与动态发布”。
- **连接关系**：从“院校端”向下分出三条直线至三个模块，表示 1:N 的管理范围，可在连线上写“发布/维护”字样强调操作方向。
- **布局建议**：保持上下两层布局，底部三个模块水平排列，必要时在画布左右留白放说明文字。

**图4-5 管理员端结构图**
- **用途**：概述管理员端覆盖的全局控制模块，便于展示权限最全的后台能力。
- **节点清单**：顶部“管理员端”；下方六个模块分别是“用户管理”“专业与课程管理”“学习资料管理”“题库与刷题管理”“论坛管理”“学习统计与分析”。
- **连接关系**：从“管理员端”向下拉出六条直线或箭头连接对应模块，表示 1:N 控制关系，可在箭头上标注“配置”“审批”等动作说明。
- **布局建议**：使用两行网格（如上排三个、下排三个）或放射状布局，确保六个模块均匀排列；整体居中，顶部“管理员端”居上。

### 第二部分：ER 图设计

**图4-6 基础信息 ER 图**
- **用途**：描述用户与院校/专业/课程/学习资料之间的数据组织结构，为数据库章节提供引用。
- **实体节点**：
  - 用户（User）
  - 院校（Institution）
  - 专业（Major）
  - 课程（Course）
  - 学习资料（Material）
- **主要联系与基数**：
  1. 院校（Institution）1:N 专业（Major）。
  2. 专业（Major）1:N 课程（Course）。
  3. 课程（Course）1:N 学习资料（Material）。
  4. 用户（User）N:1 专业（Major）（一个用户绑定一个主修专业）。
  5. 用户（User）N:M 课程（Course）（可通过选课中间表或备注表示多对多选修关系）。
- **布局建议**：建议从左到右排列“院校 → 专业 → 课程 → 学习资料”，用户实体放在上方偏左位置，通过连线下接专业与课程，保持箭头或基数标识清晰。

**图4-7 刷题相关 ER 图**
- **用途**：呈现刷题模块的题库、作答与错题记录关系，支撑刷题功能的数据设计说明。
- **实体节点**：用户（User）、刷题集合（PracticeSet）、刷题题目（PracticeQuestion）、刷题记录（PracticeAttempt）、错题记录（WrongQuestion）。
- **主要联系与基数**：
  1. 用户（User）1:N 刷题集合（PracticeSet）（用户可创建多个题集）。
  2. 刷题集合（PracticeSet）1:N 刷题题目（PracticeQuestion）。
  3. 刷题集合（PracticeSet）1:N 刷题记录（PracticeAttempt）。
  4. 用户（User）1:N 刷题记录（PracticeAttempt）。
  5. 用户（User）1:N 错题记录（WrongQuestion）。
  6. 刷题题目（PracticeQuestion）1:N 错题记录（WrongQuestion）（错题条目指向具体题目）。
- **布局建议**：以刷题集合为中心放置，左侧连接用户，右侧连接刷题题目，下方放刷题记录与错题记录，使用上下交叉线标注基数，体现自顶向下的作答流程。

**图4-8 日程与论坛相关 ER 图**
- **用途**：展示用户在日程与论坛两大域的实体关系，便于拆分子系统时引用。
- **实体节点**：用户（User）、日程事件（ScheduleEvent）、每日学习任务（DailyLearningTask）、任务完成记录（DailyTaskCompletion）、论坛话题（ForumTopic）、论坛评论（ForumComment）、论坛点赞（ForumLike）。
- **主要联系与基数**：
  1. 用户（User）1:N 日程事件（ScheduleEvent）。
  2. 用户（User）1:N 每日学习任务（DailyLearningTask）。
  3. 每日学习任务（DailyLearningTask）1:N 任务完成记录（DailyTaskCompletion），同时任务完成记录与用户是 N:1（记录由用户完成）。
  4. 用户（User）1:N 论坛话题（ForumTopic）。
  5. 论坛话题（ForumTopic）1:N 论坛评论（ForumComment），评论与用户为 N:1（评论由用户创建）。
  6. 论坛话题（ForumTopic）1:N 论坛点赞（ForumLike），点赞与用户为 N:1（用户可点赞多个话题）。
- **布局建议**：在画布左侧放“用户”，右上区域布置日程事件与每日学习任务、任务完成记录形成一条纵向链路；右下区域布置论坛话题、论坛评论、论坛点赞形成树状结构，并让所有线条回连至用户，突出中心角色。

### 第三部分：流程图设计

**图4-9 用户登录流程图**
- **用途**：阐明从用户输入账号到进入不同端首页的完整认证流程。
- **步骤与形状**：
  1. 椭圆“开始”。
  2. 矩形“输入账号密码”。
  3. 菱形“账号或密码是否为空？”（是 → 矩形“提示补全信息” → 返回输入；否 → 下一步）。
  4. 矩形“调用后端认证接口”。
  5. 菱形“校验是否通过？”（否 → 矩形“提示账号或密码错误” → 返回输入；是 → 下一步）。
  6. 菱形“判断用户角色（用户端/院校端/管理员端）”。
  7. 三个矩形分别表示“跳转用户端首页”“跳转院校端首页”“跳转管理员端首页”。
  8. 椭圆“结束”。
- **连接关系与布局**：建议自上而下排列，所有判断（菱形）向右连接失败分支形成回路，成功分支保持垂直向下，角色判断后的三个矩形水平排布后再汇聚到结束节点。

**图4-10 刷题流程图**
- **用途**：描绘用户在刷题模块的操作与系统记录过程，便于说明题库交互逻辑。
- **步骤与形状**：
  1. 椭圆“开始”。
  2. 矩形“选择刷题集合”。
  3. 矩形“加载刷题题目列表”。
  4. 菱形“是否还有未完成题目？”（是 → 矩形“呈现题目并等待作答”；否 → 跳至步骤 9）。
  5. 矩形“用户作答并提交答案”。
  6. 菱形“判断答案是否正确？”（是 → 矩形“记录正确次数”；否 → 矩形“记录错题并写入错题记录”）。
  7. 矩形“追加本题作答详情至刷题记录”。
  8. 回到步骤 4 继续循环。
  9. 矩形“生成统计结果（正确率、用时）”。
 10. 矩形“展示错题列表与解析”。
 11. 椭圆“结束”。
- **连接关系与布局**：使用自上而下主链路，循环部分（步骤 4-8）可在右侧构成回路，错题记录节点与刷题记录节点并列放置以突出同时写入的数据。

**图4-11 每日学习任务处理流程图**
- **用途**：描述用户从加载任务到查看完成统计的全流程，以支持任务模块设计说明。
- **步骤与形状**：
  1. 椭圆“开始”。
  2. 矩形“加载今日任务列表（每日学习任务）”。
  3. 菱形“是否存在任务？”（否 → 矩形“提示暂无任务” → 椭圆“结束”；是 → 下一步）。
  4. 矩形“用户选择任务并开始执行”。
  5. 矩形“记录执行进度（过程可选）”。
  6. 矩形“完成任务并提交结果”。
  7. 矩形“写入任务完成记录”。
  8. 菱形“是否所有任务已完成？”（否 → 返回步骤 4 继续；是 → 下一步）。
  9. 矩形“汇总完成情况并展示统计（完成率、用时）”。
 10. 椭圆“结束”。
- **连接关系与布局**：主流程纵向排列，判断节点将“否”分支回连到执行步骤，“是”分支继续向下；在“任务完成记录”附近可加注说明指向数据库实体 `daily_task_completions`，保持标注一致。

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
