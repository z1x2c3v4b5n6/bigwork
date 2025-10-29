# bigwork

毕业设计 - 考研学习平台前后端项目。本次提交新增了基于 React + Vite + Material UI 的前端原型，涵盖学习概览、课程体系、刷题训练、日程规划、数据分析以及个人中心等核心页面，便于与现有后端接口对接。

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

## 如何上传到 GitHub

如果你希望把本仓库的前端代码直接发布到自己的 GitHub 仓库，可以在任意可以运行 Git 的环境（例如 Codespaces、云服务器或本地电脑）按照下面的步骤操作：

1. **初始化远程仓库**
   - 在 GitHub 上创建一个空仓库（不要勾选初始化 README 等选项）。
   - 复制该仓库的 HTTPS 或 SSH 地址。

2. **克隆当前代码**
   - 在可以运行 Git 的环境中执行：
     ```bash
     git clone <当前项目的下载地址或在此环境中将项目打包下载>
     cd bigwork
     ```
   - 如果你正在使用本环境，可以执行（确保当前位于 `bigwork/` 目录中）：
     ```bash
     tar czf bigwork.tar.gz -C .. bigwork
     ```
     这样 `tar` 会先切换到当前目录的上一级，再将整个 `bigwork/` 文件夹打包。然后下载 `bigwork.tar.gz`，在本地或其他服务器解压：
     ```bash
     tar xzf bigwork.tar.gz
     cd bigwork
     ```
   - 如果你在 **Windows PowerShell** 或 **CMD** 中操作，并且 `tar` 命令无法正常使用（常见错误如 `Program Files` 路径提示无法访问），可以改用内置的压缩命令：
     ```powershell
     Compress-Archive -Path bigwork -DestinationPath bigwork.zip
     ```
     解压时同样使用 PowerShell：
     ```powershell
     Expand-Archive -Path bigwork.zip -DestinationPath .
     ```
     如果你安装了 Git Bash 或 WSL，也可以在这些环境中运行上面的 `tar` 命令以避免 Windows 路径空格导致的问题。

3. **关联 GitHub 仓库**
   ```bash
   git remote remove origin 2>/dev/null || true
   git remote add origin <你的 GitHub 仓库地址>
   ```

4. **推送代码**
   ```bash
   git branch -M main
   git push -u origin main
   ```

完成后，你的 GitHub 仓库就会包含本项目的所有文件，其他人可以直接从 GitHub 上克隆或下载。
