# 研友汇考研交流平台（Spring Boot 单体版）

项目已经收敛为 Spring Boot 单体应用。页面、接口、会话认证和数据持久化均由 `server/` 提供，运行时不再依赖 React 或 Node.js。原 `frontend/` 与 Node 源码仅作为历史代码保留，不参与启动。

## 已恢复的功能

- 首页学习看板与今日任务
- 课程体系与学习资料
- 刷题、自动判分、练习记录和错题本
- 学习任务与重要日程
- 院校匹配助手
- 学习数据分析与成绩趋势
- 研友论坛话题与回复
- 复试自我介绍、专业课和英语工具箱
- 个人资料维护
- 管理员用户、课程、论坛与统计后台

## 核心学习闭环

1. 使用测试账号登录。
2. 选择题单并完成全部题目。
3. 提交后由服务端判分。
4. 在同一事务中保存练习记录，并新增或清除对应错题。
5. 页面立即刷新练习次数、平均分、错题数、练习历史和错题本。

## 测试账号

| 角色 | 账号 | 密码 |
| --- | --- | --- |
| 管理员 | `admin` | `admin123` |
| 普通用户 | `user` | `user123` |

系统不提供注册入口，首次启动会自动创建以上账号和一套示例题目。

## 启动

需要 JDK 17 和 Maven 3.9+。

```bash
cd server
mvn spring-boot:run
```

浏览器访问 `http://localhost:8080`。

默认使用项目内的 H2 文件数据库，数据保存在 `server/data/`，重启后不会丢失。若要改用 MySQL，可设置：

```text
DB_URL=jdbc:mysql://localhost:3306/bigwork?useUnicode=true&characterEncoding=UTF-8&serverTimezone=Asia/Shanghai
DB_DRIVER=com.mysql.cj.jdbc.Driver
DB_USER=root
DB_PASSWORD=你的密码
```

## 构建

```bash
cd server
mvn clean package
java -jar target/bigwork-server-0.0.1-SNAPSHOT.jar
```

主要实现位于：

- `server/src/main/java/com/example/bigwork/`
- `server/src/main/resources/static/`
- `server/src/main/resources/application.properties`
