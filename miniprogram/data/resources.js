"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resources = exports.majorRecommendations = exports.scoreBandGuides = exports.englishReviewGuides = exports.professionalMaterials = exports.introTemplates = void 0;
exports.introTemplates = [
    {
        id: 'cn-structured',
        title: '中文结构化自我介绍',
        description: '复试面试通用模板，可结合 STAR 法则展示学习、实践与科研成果。',
        structure: [
            '开场问候 + 基本信息：姓名、本科院校、专业排名或成绩亮点。',
            '核心经历：挑选 2-3 个课程项目或科研经历，说明任务、行动与成果。',
            '实践与竞赛：突出实践能力、竞赛获奖或实习成果，体现综合素质。',
            '报考动机：阐述选择该院校与专业的原因，结合导师方向或科研兴趣。',
            '未来规划：说明研究计划与职业目标，突出持续学习和自驱力。',
        ],
        highlights: [
            '使用量化数据支撑成果，如“项目覆盖 1200+ 用户，命中率提升 18%”。',
            '强调与目标院校方向的匹配度，点名课程、实验室或导师成果。',
            '落点在“能为院校带来什么”，展示自身价值与发展潜力。',
        ],
        checklist: [
            '时长控制在 90-120 秒，语速平稳、逻辑清晰。',
            '准备常见追问（项目细节、角色分工、遇到的挑战）。',
            '与英文自我介绍内容呼应，保持核心信息一致。',
        ],
    },
    {
        id: 'en-compact',
        title: '英文自我介绍精简版',
        description: '适用于复试英文问答或导师要求英文开场的场景。',
        structure: [
            'Greeting + Name + Major：简洁介绍个人信息与专业背景。',
            'Academic Highlights：概述科研、课程或论文成果，突出量化指标。',
            'Research Interest：说明未来研究方向，与目标导师课题对应。',
            'Closing：表达期待与感谢，邀请面试官进一步提问。',
        ],
        highlights: [
            '使用简洁句型与行业关键词，避免逐字翻译中文稿。',
            '提前准备过渡语句（For example, In addition, What impresses me most is…）。',
            '确保专业名词读音准确，可在稿件旁标注音标或重音。',
        ],
        checklist: [
            '控制在 60-80 秒，保证语速稳定、语调自然。',
            '提前录音纠正发音与重音，必要时请英语老师点评。',
            '准备常见英文追问，如 research plan、career goal、teamwork experience。',
        ],
    },
];
exports.professionalMaterials = [
    {
        id: 'cs-academic',
        title: '计算机学硕复试核心题纲',
        major: '计算机科学与技术',
        focus: ['数据结构与算法设计思想', '操作系统进程与内存管理', '计算机网络性能调优'],
        preparation: [
            '梳理408真题高频知识点，整理错题本并总结解题思路。',
            '针对导师方向（人工智能/系统结构等）准备 1-2 个项目案例。',
            '模拟上机或白板写代码，训练代码风格与时间复杂度分析。',
        ],
        resources: [
            { name: '王道考研复试机试题库', url: 'https://cs.wangdao.com/' },
            { name: '浙大数据结构公开课', url: 'https://www.icourse163.org/course/ZJU-93001' },
            { name: 'MIT 6.S081 Operating System', url: 'https://pdos.csail.mit.edu/6.828/2023/' },
        ],
    },
    {
        id: 'finance-special',
        title: '金融专硕复试热点框架',
        major: '应用金融/金融专硕',
        focus: ['宏观经济趋势解读', '金融监管与风险防控案例', '量化与数理基础'],
        preparation: [
            '围绕 GDP、货币政策、就业数据撰写 2023-2024 经济形势分析。',
            '准备 2 个金融市场风险管理案例，突出对监管政策的理解。',
            '复盘数理统计与计量经济学公式，熟悉模型假设与适用场景。',
        ],
        resources: [
            { name: '央行货币政策执行报告', url: 'http://www.pbc.gov.cn/tiaofasi/144941/144959/index.html' },
            { name: '中国金融稳定报告', url: 'http://www.pbc.gov.cn/huobizhengceersi/214481/214511/index.html' },
            { name: 'Wind 金融终端体验版', url: 'https://www.wind.com.cn/product/WFT.html' },
        ],
    },
    {
        id: 'education',
        title: '教育学复试资料清单',
        major: '教育学原理/学科教学',
        focus: ['教育心理学理论与案例', '课程与教学论热点', '教育研究方法设计'],
        preparation: [
            '提炼维果茨基、布鲁纳等核心理论观点，并结合课堂案例说明。',
            '关注“双减”“人工智能+教育”等政策，准备观点与实践结合。',
            '熟练掌握问卷、访谈、行动研究等方法的步骤与注意事项。',
        ],
        resources: [
            { name: '中国知网教育学期刊', url: 'https://navi.cnki.net/knavi/JournalDetail?pcode=CJFD&pykm=JYYJ' },
            { name: '国家教育行政学院公开课', url: 'https://www.naea.edu.cn/' },
            { name: '人民教育出版社教材资源', url: 'https://www.pep.com.cn/xxgk/zxzlk/' },
        ],
    },
];
exports.englishReviewGuides = [
    {
        id: 'replay',
        title: '英语复盘提效计划',
        scenario: '适用于复试英语问答、听力材料复述等环节。',
        warmup: [
            '每日跟读近三年目标院校英语听力材料，练习语音语调。',
            '使用 1.5 分钟计时复述新闻、政策解读或专业英文摘要。',
        ],
        drills: [
            '围绕导师常问问题（自我介绍、研究计划、实习经历）准备英文卡片。',
            '使用“问题-观点-论据-总结”结构组织回答，保持 4-5 句完整表达。',
            '模拟面试时加入回问环节（例如：Could you share the current research focus of your lab?）。',
        ],
        resources: [
            { name: 'China Daily 双语新闻', url: 'https://language.chinadaily.com.cn/' },
            { name: 'TED-ED 科技教育演讲', url: 'https://www.ted.com/watch/ted-ed' },
            { name: 'BBC Learning English', url: 'https://www.bbc.co.uk/learningenglish/' },
        ],
    },
    {
        id: 'writing',
        title: '复试写作与邮件模板',
        scenario: '联系导师、提交材料或复试后致谢邮件场景。',
        warmup: [
            '准备联络导师邮件模板，包括主题、个人优势与研究匹配。',
            '整理复试后致谢与进度跟进邮件，强调礼貌与核心信息。',
        ],
        drills: [
            '练习常见邮件表达（appreciate、enclose、further information 等）。',
            '使用 Grammarly 或 LanguageTool 进行语法自查，避免基本错误。',
        ],
        resources: [
            { name: '普林斯顿写作中心邮件指南', url: 'https://writing.princeton.edu/resource/email-etiquette' },
            { name: 'LanguageTool 英文校对', url: 'https://languagetool.org/' },
        ],
    },
];
exports.scoreBandGuides = [
    {
        band: '420+',
        summary: '具备冲击顶尖院校的硬实力。',
        action: '以目标导师课题为核心打磨科研亮点，同时准备 1 所985保底院校以防极端情况。',
    },
    {
        band: '400-419',
        summary: '大部分 985 / 热门专业具备竞争力。',
        action: '冲刺 A 类高校，复试重点在专业深度与创新能力呈现，补充稳妥梯队。',
    },
    {
        band: '380-399',
        summary: '兼顾冲刺与稳妥院校的黄金分段。',
        action: '以 211 / 双一流院校为主，强调综合素质与实战经历，保留 1-2 个保底志愿。',
    },
    {
        band: '360-379',
        summary: '重点院校需突出亮点，建议搭配保底。',
        action: '突出科研/竞赛特长提升复试权重，同时关注调剂信息与区域性院校。',
    },
    {
        band: '360 以下',
        summary: '建议选择稳妥与保底院校组合。',
        action: '同步准备调剂材料，强化公共课与专业课薄弱项，提前关注开放学院。',
    },
];
exports.majorRecommendations = [
    {
        major: '计算机类',
        strengths: ['算法工程、分布式系统、人工智能方向需求旺盛', '复试强调代码实现与科研潜力'],
        interviewFocus: ['项目实践的技术细节与难点突破', '科研论文或竞赛成果的创新点', '对目标实验室课题的理解与规划'],
        references: [
            { name: 'CCF 推荐国际会议列表', url: 'https://www.ccf.org.cn/Academic_Evaluation/By_category/' },
            { name: 'GitHub Awesome 系列', url: 'https://github.com/sindresorhus/awesome' },
        ],
    },
    {
        major: '金融类',
        strengths: ['政策与市场变动快，具备跨学科素养优势', '复试关注数据分析、风控思维与宏观视角'],
        interviewFocus: ['宏观经济事件分析', '金融产品或项目实践复盘', '定量模型或编程工具的应用能力'],
        references: [
            { name: '中国证监会研究报告', url: 'http://www.csrc.gov.cn/' },
            { name: 'World Bank Data Catalog', url: 'https://datacatalog.worldbank.org/' },
        ],
    },
    {
        major: '教育学类',
        strengths: ['国家政策支持力度大，就业方向多样', '复试考察教育理念、课程设计与课堂实操'],
        interviewFocus: ['教学设计与课堂活动组织', '教育技术与信息化实践', '教育公平与政策理解'],
        references: [
            { name: 'UNESCO Education Reports', url: 'https://www.unesco.org/en/education/reports' },
            { name: '中国教育报-教育理论版', url: 'http://paper.jyb.cn/' },
        ],
    },
];
exports.resources = {
    introTemplates: exports.introTemplates,
    professionalMaterials: exports.professionalMaterials,
    englishReviewGuides: exports.englishReviewGuides,
    scoreBandGuides: exports.scoreBandGuides,
    majorRecommendations: exports.majorRecommendations,
};
