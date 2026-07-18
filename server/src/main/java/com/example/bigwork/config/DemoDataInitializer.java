package com.example.bigwork.config;

import com.example.bigwork.model.PracticeQuestion;
import com.example.bigwork.model.PracticeSet;
import com.example.bigwork.model.User;
import com.example.bigwork.model.Course;
import com.example.bigwork.model.CourseMaterial;
import com.example.bigwork.model.Institution;
import com.example.bigwork.repository.PracticeQuestionRepository;
import com.example.bigwork.repository.PracticeSetRepository;
import com.example.bigwork.repository.UserRepository;
import com.example.bigwork.repository.CourseRepository;
import com.example.bigwork.repository.CourseMaterialRepository;
import com.example.bigwork.repository.InstitutionRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;
import java.time.LocalDateTime;

@Component
public class DemoDataInitializer implements CommandLineRunner {
    private final UserRepository users; private final PracticeSetRepository sets; private final PracticeQuestionRepository questions;
    private final CourseRepository courses; private final CourseMaterialRepository materials;
    private final InstitutionRepository institutions;
    public DemoDataInitializer(UserRepository users, PracticeSetRepository sets, PracticeQuestionRepository questions, CourseRepository courses, CourseMaterialRepository materials, InstitutionRepository institutions) {
        this.users = users; this.sets = sets; this.questions = questions; this.courses=courses; this.materials=materials;this.institutions=institutions;
    }
    @Override @Transactional public void run(String... args) {
        createUser("admin", "admin123", "管理员", "admin");
        createUser("user", "user123", "测试用户", "student");
        if (sets.count() == 0) {
            LocalDateTime now = LocalDateTime.now();
            PracticeSet set = new PracticeSet(); set.setTitle("考研基础知识测试");
            set.setDescription("完成答题后自动生成成绩、练习记录和错题本。"); set.setDifficulty("easy");
            set.setTags("考研,基础"); set.setCreatedAt(now); set.setUpdatedAt(now); set = sets.save(set);
            add(set.getId(), "Spring Boot 默认内嵌的 Web 容器是什么？", "Tomcat", "默认使用 Tomcat，也可替换为 Jetty 或 Undertow", now);
            add(set.getId(), "HTTP 状态码 200 表示什么？", "请求成功", "200 OK 表示请求已成功处理", now);
            add(set.getId(), "JPA 的全称是什么？", "Java Persistence API", "JPA 是 Java 持久化 API 规范", now);
        }
        if(courses.count()==0){
            Course c1=course("数据结构", "线性表、树、图与常用算法", "王老师", 4.0);
            Course c2=course("计算机组成原理", "CPU、存储系统与指令系统", "李老师", 3.5);
            course("考研英语", "阅读、翻译、写作系统复习", "陈老师", 3.0);
            material(c1.getId(),"数据结构核心知识导图","覆盖树、图、排序与查找");
            material(c2.getId(),"组成原理高频考点","历年高频题型整理");
        }
        if(institutions.count()==0){
            school("西南财经大学","211 / 双一流","四川",323,"保险专业学位复试基本线","金融,保险,应用统计,税务,国际商务,资产评估,应用经济学,工商管理,会计,审计","https://yz.swufe.edu.cn/info/1101/12451.htm");
            school("对外经济贸易大学","211 / 双一流","北京",323,"经济类专业复试线参考","金融,保险,税务,国际商务,资产评估,法学,翻译,工商管理,会计","https://yjsy.uibe.edu.cn/");
            school("东北财经大学","省重点","辽宁",323,"经济类国家线参考起点","金融,保险,应用统计,税务,国际商务,资产评估,工商管理,公共管理,会计,审计","https://graduate.dufe.edu.cn/");
            school("山东财经大学","省属重点","山东",323,"经济类国家线参考起点","金融,保险,应用统计,税务,国际商务,资产评估,法学,工商管理,会计,审计","https://yjszs.sdufe.edu.cn/");
            school("北京师范大学","985 / 双一流","北京",350,"教育学参考基本线","政治学,教育学,心理学,体育学,中国语言文学,历史学,数学,地理学,公共管理,艺术学","https://yz.bnu.edu.cn/");
            school("武汉大学","985 / 双一流","湖北",300,"工学参考基本线","政治学,法学,金融,新闻传播学,历史学,数学,地理学,测绘科学与技术,计算机科学与技术,口腔医学,图书情报","https://yz.whu.edu.cn/");
            school("河南大学","双一流","河南",300,"学科门类参考线","政治学,教育学,心理学,中国语言文学,新闻传播学,历史学,地理学,生物学,药学,艺术学","https://grs.henu.edu.cn/");
            school("河北经贸大学","省属骨干","河北",323,"经济类国家线参考起点","金融,保险,税务,国际商务,资产评估,法学,社会学,新闻与传播,工商管理,公共管理,会计,旅游管理","https://yjs.hueb.edu.cn/");
            school("昆明理工大学","省重点","云南",263,"B 类工学国家线参考","机械工程,材料科学与工程,冶金工程,电气工程,计算机科学与技术,建筑学,土木工程,环境科学与工程,交通运输","https://yjs.kmust.edu.cn/");
            school("广西师范大学","省重点","广西",340,"B 类教育学参考线","教育学,心理学,体育学,中国语言文学,外国语言文学,历史学,数学,物理学,化学,生物学,音乐,美术与书法","https://www.yz.gxnu.edu.cn/");
        }
    }
    private void createUser(String username, String password, String name, String role) {
        if (users.existsByUsername(username)) return;
        User user = new User(); user.setUsername(username); user.setPassword(new BCryptPasswordEncoder().encode(password));
        user.setDisplayName(name); user.setRole(role); user.setEmail(username + "@demo.local");
        user.setCreatedAt(LocalDateTime.now()); user.setUpdatedAt(LocalDateTime.now()); users.save(user);
    }
    private void add(Long setId, String text, String answer, String explanation, LocalDateTime now) {
        PracticeQuestion q = new PracticeQuestion(); q.setPracticeSetId(setId); q.setQuestionText(text); q.setAnswerText(answer);
        q.setExplanation(explanation); q.setDifficulty("easy"); q.setCreatedAt(now); q.setUpdatedAt(now); questions.save(q);
    }
    private Course course(String title,String description,String teacher,double credit){Course c=new Course();c.setTitle(title);c.setDescription(description);c.setTeacher(teacher);c.setCredit(credit);c.setCreatedAt(LocalDateTime.now());c.setUpdatedAt(LocalDateTime.now());return courses.save(c);}
    private void material(Long courseId,String title,String description){CourseMaterial m=new CourseMaterial();m.setCourseId(courseId);m.setTitle(title);m.setDescription(description);m.setCreatedAt(LocalDateTime.now());m.setUpdatedAt(LocalDateTime.now());materials.save(m);}
    private void school(String name,String level,String region,int score,String label,String majors,String url){Institution i=new Institution();i.setName(name);i.setLevel(level);i.setRegion(region);i.setReferenceScore(score);i.setScoreYear(2025);i.setScoreLabel(label);i.setMajors(majors);i.setRequirement("须同时满足当年学校基本线、院系专业线、单科线和招生目录中的报考条件。");i.setSourceUrl(url);i.setCreatedAt(LocalDateTime.now());i.setUpdatedAt(LocalDateTime.now());institutions.save(i);}
}
