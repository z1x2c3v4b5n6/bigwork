# bigwork

毕业设计 - 考研学习平台前后端项目。本次提交新增了基于 React + Vite + Material UI 的前端原型，涵盖学习概览、课程体系、刷题训练、日程规划、数据分析以及个人中心等核心页面，便于与现有后端接口对接。

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
