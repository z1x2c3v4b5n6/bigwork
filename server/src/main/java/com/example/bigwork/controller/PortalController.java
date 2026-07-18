package com.example.bigwork.controller;

import com.example.bigwork.exception.BusinessException;
import com.example.bigwork.model.ScheduleEvent;
import com.example.bigwork.model.StudyTask;
import com.example.bigwork.model.User;
import com.example.bigwork.repository.*;
import com.example.bigwork.support.SessionUser;
import jakarta.servlet.http.HttpSession;
import org.springframework.http.HttpStatus;
import org.springframework.transaction.annotation.Transactional;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.*;

@RestController
@RequestMapping("/api/portal")
public class PortalController {
    private static final String KEY = "AUTH_USER";
    private final CourseRepository courses;
    private final CourseMaterialRepository materials;
    private final StudyTaskRepository tasks;
    private final ScheduleEventRepository events;
    private final UserRepository users;

    public PortalController(CourseRepository courses, CourseMaterialRepository materials,
                            StudyTaskRepository tasks, ScheduleEventRepository events, UserRepository users) {
        this.courses = courses;
        this.materials = materials;
        this.tasks = tasks;
        this.events = events;
        this.users = users;
    }

    private SessionUser user(HttpSession session) {
        SessionUser user = (SessionUser) session.getAttribute(KEY);
        if (user == null) throw new BusinessException(HttpStatus.UNAUTHORIZED, "请先登录");
        return user;
    }

    @GetMapping("/courses")
    public Map<String, Object> courses(HttpSession session) {
        user(session);
        return Map.of("courses", courses.findAll(), "materials", materials.findAll());
    }

    @GetMapping("/tasks")
    public Map<String, Object> tasks(HttpSession session) {
        return Map.of("tasks", tasks.findByUserIdOrderByIdDesc(user(session).getId()));
    }

    @PostMapping("/tasks")
    @Transactional
    public StudyTask addTask(@RequestBody Map<String, String> body, HttpSession session) {
        SessionUser current = user(session);
        String title = body.getOrDefault("title", "").trim();
        if (title.isEmpty()) throw new BusinessException(HttpStatus.BAD_REQUEST, "任务名称不能为空");
        StudyTask task = new StudyTask();
        task.setUserId(current.getId());
        task.setTitle(title);
        return tasks.save(task);
    }

    @PatchMapping("/tasks/{id}/toggle")
    @Transactional
    public StudyTask toggle(@PathVariable Long id, HttpSession session) {
        SessionUser current = user(session);
        StudyTask task = tasks.findById(id).filter(x -> x.getUserId().equals(current.getId()))
                .orElseThrow(() -> new BusinessException(HttpStatus.NOT_FOUND, "任务不存在"));
        task.setCompleted(!task.isCompleted());
        task.setCompletedAt(task.isCompleted() ? LocalDateTime.now() : null);
        return tasks.save(task);
    }

    @GetMapping("/schedule")
    public Map<String, Object> schedule(HttpSession session) {
        return Map.of("events", events.findByUserIdOrderByEventDateAsc(user(session).getId()));
    }

    @PostMapping("/schedule")
    @Transactional
    public ScheduleEvent addEvent(@RequestBody Map<String, String> body, HttpSession session) {
        ScheduleEvent event = new ScheduleEvent();
        event.setUserId(user(session).getId());
        event.setTitle(body.getOrDefault("title", "学习计划"));
        event.setEventDate(LocalDate.parse(body.get("date")));
        event.setType(body.getOrDefault("type", "study"));
        return events.save(event);
    }

    @GetMapping("/institutions")
    public Map<String, Object> institutions(HttpSession session) {
        SessionUser current = user(session);
        User profile = users.findById(current.getId()).orElseThrow();
        int score = profile.getExamScore() == null ? 0 : profile.getExamScore();
        String major = profile.getTargetMajor() == null || profile.getTargetMajor().isBlank() ? "未设置" : profile.getTargetMajor();

        List<Map<String, Object>> all = List.of(
                institution("清华大学", "985 / 双一流", 325, major, "2025 校级工学基本线",
                        "达到校线后仍须满足招生院系公布的专业复试线、单科线及复试要求。",
                        "https://yz.tsinghua.edu.cn/info/1024/2964.htm",
                        List.of("哲学", "应用经济学", "法学", "教育学", "新闻与传播", "数学", "物理学", "电子信息", "计算机科学与技术", "机械工程", "材料科学与工程", "建筑学", "临床医学", "公共管理", "设计")),
                institution("北京大学", "985 / 双一流", 310, major, "2025 校级工学基本线",
                        "院系可在学校基本线之上确定复试名单；具体考试科目与报考限制以当年目录为准。",
                        "https://admission.pku.edu.cn/zsxx/sszs/",
                        List.of("哲学", "理论经济学", "应用经济学", "法学", "政治学", "社会学", "心理学", "中国语言文学", "历史学", "数学", "物理学", "化学", "生物学", "电子信息", "计算机科学与技术", "临床医学", "公共卫生", "工商管理")),
                institution("复旦大学", "985 / 双一流", 310, major, "2025 工学参考基本线",
                        "考生须同时达到学校基本要求和院系专业要求，部分专业对本科背景或考试科目有说明。",
                        "https://gsao.fudan.edu.cn/",
                        List.of("哲学", "经济学", "金融", "法学", "政治学", "社会工作", "新闻传播学", "中国史", "数学", "物理学", "生物学", "电子信息", "计算机科学与技术", "临床医学", "药学", "公共管理")),
                institution("上海交通大学", "985 / 双一流", 325, major, "2025 工学参考基本线",
                        "各院系根据招生计划和生源情况确定复试名单，医科及管理类专业执行各自要求。",
                        "https://yzb.sjtu.edu.cn/",
                        List.of("应用经济学", "法学", "新闻与传播", "数学", "物理学", "机械工程", "材料科学与工程", "电气工程", "电子信息", "计算机科学与技术", "船舶与海洋工程", "临床医学", "口腔医学", "工商管理")),
                institution("浙江大学", "985 / 双一流", 320, major, "2025 工学参考基本线",
                        "学校线为最低要求，院系可提高总分或单科要求；招生专业及科目以专业目录为准。",
                        "https://grs.zju.edu.cn/yjszs/",
                        List.of("经济学", "法学", "教育学", "心理学", "文学", "历史学", "数学", "化学", "生物学", "机械工程", "光学工程", "电子信息", "计算机科学与技术", "软件工程", "农业", "临床医学", "管理科学与工程")),
                institution("南京大学", "985 / 双一流", 320, major, "2025 工学参考基本线",
                        "复试资格以院系细则为准，同等学力、专项计划等考生另按学校规定执行。",
                        "https://grawww.nju.edu.cn/",
                        List.of("哲学", "经济学", "法学", "社会学", "中国语言文学", "外国语言文学", "历史学", "数学", "物理学", "天文学", "地理学", "大气科学", "电子信息", "计算机科学与技术", "软件工程", "环境科学与工程", "工商管理")),
                institution("北京师范大学", "985 / 双一流", 350, major, "2025 教育学参考基本线",
                        "教育、心理、文学等专业分数要求不同，须查看学部院系复试方案与招生目录。",
                        "https://yz.bnu.edu.cn/",
                        List.of("哲学", "理论经济学", "法学", "政治学", "社会学", "马克思主义理论", "教育学", "心理学", "体育学", "中国语言文学", "外国语言文学", "新闻传播学", "中国史", "世界史", "数学", "地理学", "生态学", "公共管理", "艺术学")),
                institution("中国农业大学", "985 / 双一流", 300, major, "2025 农学参考基本线",
                        "农学、工学和专业学位执行不同复试要求，部分专业涉及实验技能或相关背景考核。",
                        "https://yz.cau.edu.cn/",
                        List.of("生物学", "农业工程", "食品科学与工程", "作物学", "园艺学", "农业资源与环境", "植物保护", "畜牧学", "兽医学", "农业", "兽医", "农林经济管理", "公共管理")),
                institution("华中科技大学", "985 / 双一流", 310, major, "2025 工学参考基本线",
                        "各院系在学校要求基础上制定复试细则；医学、管理和专项计划需分别核对。",
                        "https://gszs.hust.edu.cn/",
                        List.of("经济学", "法学", "社会学", "教育学", "新闻传播学", "数学", "物理学", "机械工程", "光学工程", "电气工程", "电子信息", "计算机科学与技术", "建筑学", "临床医学", "公共卫生", "工商管理", "公共管理")),
                institution("武汉大学", "985 / 双一流", 300, major, "2025 工学参考基本线",
                        "学院复试线可能高于学校参考要求，报考前应核对专业代码、研究方向和初试科目。",
                        "https://yz.whu.edu.cn/",
                        List.of("哲学", "经济学", "金融", "法学", "政治学", "马克思主义理论", "教育学", "新闻传播学", "历史学", "数学", "物理学", "地理学", "测绘科学与技术", "电子信息", "计算机科学与技术", "软件工程", "口腔医学", "药学", "图书情报")),
                institution("四川大学", "985 / 双一流", 310, major, "2025 工学参考基本线",
                        "各学科门类与专业学位基本线不同，口腔、临床、文学等优势专业须查看院系线。",
                        "https://yz.scu.edu.cn/",
                        List.of("哲学", "经济学", "法学", "中国语言文学", "外国语言文学", "新闻传播学", "历史学", "数学", "化学", "材料科学与工程", "电子信息", "计算机科学与技术", "软件工程", "临床医学", "口腔医学", "护理", "公共管理", "艺术学")),
                institution("北京邮电大学", "211 / 双一流", 273, major, "2025 国家 A 类工学线起点",
                        "学校明确由学院在国家线基础上按不低于 120% 差额比例确定专业复试要求。",
                        "https://yzb.bupt.edu.cn/info/1003/1182.htm",
                        List.of("应用经济学", "法学", "外国语言文学", "数学", "物理学", "电子科学与技术", "信息与通信工程", "电子信息", "计算机科学与技术", "软件工程", "网络空间安全", "工商管理", "公共管理")),
                institution("西南财经大学", "211 / 双一流", 323, major, "2025 保险专业学位复试基本线",
                        "保险专业代码 0255；2026 年初试科目调整为政治、英语二、396 经济类综合能力和 435 保险专业基础。",
                        "https://yz.swufe.edu.cn/info/1101/12451.htm",
                        List.of("理论经济学", "应用经济学", "金融", "应用统计", "税务", "国际商务", "保险", "资产评估", "数字经济", "工商管理", "会计", "审计")),
                institution("对外经济贸易大学", "211 / 双一流", 323, major, "2025 保险专业复试线参考",
                        "设有保险学院，具体总分、单科要求和招生人数应核对当年各专业复试线与招生目录。",
                        "https://yjsy.uibe.edu.cn/cms/infoSingleArticle.do?articleId=7527&columnId=2172",
                        List.of("应用经济学", "金融", "税务", "国际商务", "保险", "资产评估", "法学", "外国语言文学", "翻译", "工商管理", "会计")),
                institution("中央财经大学", "211 / 双一流", 323, major, "2025 经济类国家线参考起点",
                        "保险专业的实际复试线由学校和学院公布，须核对专业目录中的考试科目与研究方向。",
                        "https://gs.cufe.edu.cn/zsgz/sszs.htm",
                        List.of("理论经济学", "应用经济学", "金融", "应用统计", "税务", "国际商务", "保险", "资产评估", "法学", "社会工作", "工商管理", "公共管理", "会计", "审计")),
                institution("东北财经大学", "省重点", 323, major, "2025 经济类国家线参考起点",
                        "非自主划线院校，专业复试要求仍可能高于国家线，应查看学院复试实施细则。",
                        "https://graduate.dufe.edu.cn/",
                        List.of("理论经济学", "应用经济学", "金融", "应用统计", "税务", "国际商务", "保险", "资产评估", "工商管理", "公共管理", "会计", "旅游管理", "审计")),
                institution("山东财经大学", "省属重点", 323, major, "2025 经济类国家线参考起点",
                        "招生专业、计划和复试差额比例以学校当年硕士招生目录及学院细则为准。",
                        "https://yjszs.sdufe.edu.cn/",
                        List.of("理论经济学", "应用经济学", "金融", "应用统计", "税务", "国际商务", "保险", "资产评估", "法学", "工商管理", "公共管理", "会计", "旅游管理", "审计")),
                institution("河北经贸大学", "省属骨干", 323, major, "2025 经济类国家线参考起点",
                        "适合作为区域性院校备选，报考前须确认当年是否招生及具体初复试科目。",
                        "https://yjs.hueb.edu.cn/",
                        List.of("理论经济学", "应用经济学", "金融", "税务", "国际商务", "保险", "资产评估", "法学", "社会学", "新闻与传播", "工商管理", "公共管理", "会计", "旅游管理"))
        );

        List<Map<String, Object>> ranked = all.stream()
                .filter(item -> "未设置".equals(major) || ((List<?>) item.get("majors")).contains(major))
                .map(item -> {
            Map<String, Object> row = new LinkedHashMap<>(item);
            int line = (int) item.get("referenceScore");
            boolean offersMajor = "未设置".equals(major) || ((List<?>) item.get("majors")).contains(major);
            int match = score == 0 ? (offersMajor ? 78 : 60) : Math.max(45, Math.min(98, 84 + (score - line) / 4 + (offersMajor ? 10 : -18)));
            row.put("match", match);
            row.put("majorMatched", offersMajor);
            row.put("chance", score == 0 ? "请先填写成绩" : score >= line + 25 ? "较稳" : score >= line ? "可冲" : "需提升");
            return row;
        }).sorted((a, b) -> Integer.compare((int) b.get("match"), (int) a.get("match"))).toList();

        return Map.of(
                "institutions", ranked,
                "profile", Map.of("score", score, "major", major),
                "dataNote", ranked.isEmpty()
                        ? "当前数据中暂无明确开设“" + major + "”的院校，平台不会用无关专业代替推荐；请先通过研招网专业目录核对。"
                        : "仅展示当前数据中明确包含“" + major + "”的院校。参考线不等同于最终录取线，请以当年院系复试细则为准。"
        );
    }

    private Map<String, Object> institution(String name, String level, int score, String preferred,
                                             String scoreLabel, String requirement, String sourceUrl,
                                             List<String> majors) {
        String direction = majors.contains(preferred) ? preferred : majors.get(0);
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("name", name);
        result.put("level", level);
        result.put("referenceScore", score);
        result.put("scoreLabel", scoreLabel);
        result.put("direction", direction);
        result.put("majors", majors);
        result.put("requirement", requirement);
        result.put("sourceUrl", sourceUrl);
        return result;
    }

    @GetMapping("/profile")
    public Map<String, Object> profile(HttpSession session) {
        User current = users.findById(user(session).getId()).orElseThrow();
        Map<String, Object> result = new LinkedHashMap<>();
        result.put("username", current.getUsername());
        result.put("displayName", current.getDisplayName());
        result.put("email", current.getEmail());
        result.put("examScore", current.getExamScore());
        result.put("targetMajor", current.getTargetMajor());
        return result;
    }

    @PutMapping("/profile")
    @Transactional
    public Map<String, Object> profile(@RequestBody Map<String, String> body, HttpSession session) {
        User current = users.findById(user(session).getId()).orElseThrow();
        current.setDisplayName(body.getOrDefault("displayName", current.getDisplayName()));
        current.setEmail(body.getOrDefault("email", current.getEmail()));
        String raw = body.get("examScore");
        if (raw != null && !raw.isBlank()) {
            int score = Integer.parseInt(raw);
            if (score < 0 || score > 500) throw new BusinessException(HttpStatus.BAD_REQUEST, "成绩应在 0 到 500 之间");
            current.setExamScore(score);
        }
        current.setTargetMajor(body.getOrDefault("targetMajor", current.getTargetMajor()));
        current.setUpdatedAt(LocalDateTime.now());
        users.save(current);
        return Map.of("saved", true);
    }

    @GetMapping("/resources")
    public Map<String, Object> resources(HttpSession session) {
        user(session);
        return Map.of("groups", List.of(
                resource("复试自我介绍模板", "从个人背景到研究计划，形成 3 分钟完整表达。", "身份背景—项目经历—报考动机—研究计划", "用问题、行动、结果、反思四步介绍项目", "控制在 2—3 分钟并多次录音复盘"),
                resource("专业课复试重点", "按目标专业准备基础知识、热点问题与项目追问。", "整理专业核心课程知识图谱", "准备毕业设计与项目的追问清单", "关注目标院系导师近年的研究方向"),
                resource("复试英语复习", "准备英文自我介绍、日常问答和专业英语。", "每日跟读并录音 15 分钟", "积累目标专业高频英文词汇", "准备家乡、兴趣、优缺点和读研规划"),
                resource("导师联系与邮件", "用简洁专业的方式联系意向导师。", "标题写明姓名、报考专业与咨询意图", "正文突出研究兴趣与导师方向的契合点", "附件仅放一页简历并规范命名")
        ));
    }

    private Map<String, Object> resource(String title, String summary, String... items) {
        return Map.of("title", title, "summary", summary, "items", List.of(items));
    }
}
