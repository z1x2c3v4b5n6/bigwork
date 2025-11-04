const scoreBandGuides = [
  {
    key: 'high',
    title: '360 分以上：冲击名校的精修阶段',
    subtitle: '利用“复试加分项”在激烈竞争中拔尖。',
    actionSteps: [
      '准备双语自我介绍，突出科研成果、竞赛奖项与跨学科经历，强调“我能为导师课题组带来什么”。',
      '针对目标院校复试大纲，整理三分钟内能概述的研究计划，并准备 1-2 个可延伸的技术细节以应对追问。',
      '模拟中英文问答各不少于 3 轮，重点练习专业英文术语的准确发音与转换速度。',
    ],
  },
  {
    key: 'mid',
    title: '国家线-360 分：稳扎稳打的提分策略',
    subtitle: '突出可塑性与实践经验，缩小与高分段的差距。',
    actionSteps: [
      '自我介绍强调学习进步曲线、项目落地能力以及与目标导师方向的匹配度。',
      '针对近三年真题整理“高频知识点-经典例题-解题思路”三段式卡片，每日快速复盘。',
      '英语口语聚焦在专业词汇的准确表达，准备 5 个常见突发问答以展示临场反应。',
    ],
  },
  {
    key: 'low',
    title: '国家线以下：暂停冲刺，重新规划',
    subtitle: '评估自身状态，结合调剂窗口或准备下次备考。',
    actionSteps: [
      '结合下方院校推荐，筛选调剂机会或锁定下一轮冲刺的目标梯队。',
      '寻找实习、科研助理或公开课学习机会，保持学习节奏，为下一轮备考积累素材。',
      '保持身体与心理健康，避免盲目报名复试，腾出时间充电与调整。',
    ],
  },
];

const bilingualTemplate = [
  {
    title: '开场问候 / Opening',
    chinese: '导师好，我是来自【本科院校】的【姓名】，本科专业是【专业名称】。非常感谢今天能有机会向各位老师展示我在【方向关键词】方面的积累与热情。',
    english:
      'Good morning, professors. My name is 【Name】 from 【Undergraduate University】, majoring in 【Major】. Thank you for giving me this chance to present my dedication and experience in 【Research Focus】.',
  },
  {
    title: '学业与能力亮点 / Academic Highlights',
    chinese:
      '在本科阶段，我保持了【成绩表现】的成绩，并通过【核心课程或项目】强化了对【关键知识点】的理解。我的毕业设计聚焦于【项目主题】，最终实现了【量化成果】。',
    english:
      'During my undergraduate studies, I maintained a 【Performance Description】 GPA and deepened my command of 【Key Concepts】 through 【Signature Course or Project】. My capstone project explored 【Topic】 and delivered 【Quantified Outcome】.',
  },
  {
    title: '科研或实践经历 / Research & Practice',
    chinese:
      '我曾在【实验室/公司】参与【项目名称】，负责【主要任务】，最终解决了【痛点问题】。这段经历不仅提升了我在【相关技能】上的能力，也让我更坚定投入【目标研究方向】的决心。',
    english:
      'I joined 【Lab/Company】 for the project 【Project Name】, where I took charge of 【Core Responsibilities】 and addressed 【Pain Point】. This experience sharpened my expertise in 【Relevant Skills】 and reinforced my commitment to pursue 【Target Direction】.',
  },
  {
    title: '个性化亮点 / Personal Edge',
    chinese:
      '除专业学习之外，我持续在【竞赛/志愿/社团】中输出成果，例如【具体成果】。这些经历让我具备【软技能】，能够在团队协作中扮演【角色定位】。',
    english:
      'Beyond academics, I stay active in 【Competition/Volunteering/Organization】 and achieved 【Concrete Result】. These experiences helped me cultivate 【Soft Skills】 and take on the role of 【Team Role】 in collaborative settings.',
  },
  {
    title: '未来规划 / Future Plan',
    chinese:
      '若有幸进入贵院学习，我希望在【导师团队或研究方向】继续深入探索【研究议题】，短期目标是【近期规划】，长期希望能【长期愿景】，并在团队合作中贡献【个人价值】。',
    english:
      'If admitted, I look forward to delving into 【Research Topic】 with 【Supervisor or Group】. In the near term, I plan to 【Short-term Plan】, while in the long run I hope to 【Long-term Vision】 and contribute 【Unique Value】 to the team.',
  },
  {
    title: '结尾致谢 / Closing',
    chinese: '以上是我的自我介绍，再次感谢各位老师的聆听，我期待后续的交流。',
    english: 'That is my self-introduction. Thank you for listening, and I look forward to further discussion.',
  },
];

const rehearsalChecklist = [
  '中文稿与英文稿分别控制在 90-120 秒内，突出关键词并留出停顿呼吸。',
  '使用“数据信息 + 角色贡献”的句式描述项目成果，避免空泛形容词。',
  '针对不同导师风格准备 3 份可互换的亮点素材（科研/竞赛/实践）。',
  '录制 2 次视频自检发音与表情，用标注工具勾出需要强化的句段。',
  '准备 3 个过渡句，便于被打断时快速回到主线，例如“针对这个问题，我可以补充…”。',
];

const majorRecommendations = [
  {
    major: '计算机科学与技术',
    coreTopics: ['数据结构与算法设计', '操作系统与并发控制', '计算机网络安全机制'],
    questionAngles: ['请解释一次项目中处理高并发的方案', '如何在算法题中平衡时间与空间复杂度'],
    practiceTasks: ['复盘至少两道图论或动态规划真题并给出多种解法', '准备英文描述一个你主导的开发项目'],
    recommendedSchools: {
      high: ['清华大学计算机系', '北京大学信息科学技术学院', '上海交通大学计算机科学与工程系'],
      mid: ['华中科技大学计算机学院', '东南大学计算机科学与工程学院', '西安电子科技大学计算机学院'],
      low: ['北京信息科技大学计算机学院', '南京信息工程大学计算机科学与技术学院', '广东工业大学计算机学院'],
    },
  },
  {
    major: '软件工程',
    coreTopics: ['需求工程与架构设计', '软件测试与质量保障', '敏捷开发与持续交付'],
    questionAngles: ['描述一次需求变更时的架构调整策略', '如何设计回归测试确保质量稳定'],
    practiceTasks: ['以时间线梳理一个复杂项目的迭代过程', '准备英文演示持续集成流水线的搭建思路'],
    recommendedSchools: {
      high: ['北京航空航天大学软件学院', '南京大学软件学院', '浙江大学软件学院'],
      mid: ['四川大学软件学院', '大连理工大学软件学院', '华东师范大学软件工程学院'],
      low: ['深圳大学计算机与软件学院', '浙江工业大学软件学院', '中国地质大学（武汉）信息工程学院'],
    },
  },
  {
    major: '人工智能',
    coreTopics: ['机器学习模型优化', '计算机视觉与深度学习', '智能感知与人机交互'],
    questionAngles: ['举例说明如何避免模型过拟合', '分享一次多模态任务的特征融合方案'],
    practiceTasks: ['整理一份 Transformer 模型应用清单', '准备英文解读你的 AI 项目成果'],
    recommendedSchools: {
      high: ['中国科学院大学人工智能学院', '上海交通大学人工智能研究院', '中国科学技术大学信息科学技术学院'],
      mid: ['北京理工大学人工智能学院', '哈尔滨工业大学（深圳）人工智能学院', '天津大学智能与计算学部'],
      low: ['南昌大学人工智能学院', '合肥工业大学智能科学与工程学院', '北京联合大学智能制造学院'],
    },
  },
  {
    major: '数据科学与大数据技术',
    coreTopics: ['统计学习方法', '分布式计算与数据仓库', '数据治理与可视化'],
    questionAngles: ['请阐述一次数据清洗流程设计', '如何在企业场景落地实时分析系统'],
    practiceTasks: ['准备展示一份你搭建的数据仪表盘', '用英文解释数据隐私合规方案'],
    recommendedSchools: {
      high: ['复旦大学大数据学院', '北京大学信息工程学院', '浙江大学数据科学研究中心'],
      mid: ['中南大学大数据研究院', '重庆大学大数据与软件学院', '北京交通大学计算机与信息技术学院'],
      low: ['广东财经大学数据科学学院', '河南工业大学大数据学院', '云南大学信息学院'],
    },
  },
  {
    major: '电子信息工程',
    coreTopics: ['信号与系统', '数字电路设计', '嵌入式系统与物联网'],
    questionAngles: ['叙述一次高频电路调试经验', '谈谈物联网项目的安全加固策略'],
    practiceTasks: ['分析一道通信原理复试题并给出推导过程', '准备英文介绍你设计的嵌入式系统'],
    recommendedSchools: {
      high: ['北京邮电大学信息与通信工程学院', '电子科技大学信息与通信工程学院', '东南大学信息科学与工程学院'],
      mid: ['北京工业大学电子信息学部', '西南交通大学信息科学与技术学院', '燕山大学信息科学与工程学院'],
      low: ['福州大学电子信息与电气工程学院', '桂林电子科技大学信息与通信学院', '河北工业大学电子信息工程学院'],
    },
  },
  {
    major: '通信工程',
    coreTopics: ['信道编码与调制', '移动通信系统规划', '网络协议与路由'],
    questionAngles: ['请比较 OFDM 与 CDMA 的优势', '如何规划 5G 小区部署'],
    practiceTasks: ['梳理 5G NR 协议栈的关键模块', '准备英文回答“未来通信的发展趋势”'],
    recommendedSchools: {
      high: ['清华大学电子工程系', '上海交通大学电子信息与电气工程学院', '华中科技大学光学与电子信息学院'],
      mid: ['南京邮电大学通信工程学院', '西安电子科技大学通信工程学院', '杭州电子科技大学通信工程学院'],
      low: ['南京信息工程大学通信工程学院', '长沙理工大学信息工程学院', '河北大学电子信息工程学院'],
    },
  },
  {
    major: '控制工程',
    coreTopics: ['现代控制理论', '运动控制系统设计', '工业自动化与 PLC'],
    questionAngles: ['举例说明 PID 参数整定经验', '如何在机器人控制中应用状态空间法'],
    practiceTasks: ['手写推导一个典型系统的稳定性分析', '用英文描述你参与的自动化项目'],
    recommendedSchools: {
      high: ['上海交通大学自动化系', '浙江大学控制科学与工程学院', '哈尔滨工业大学控制科学与工程学院'],
      mid: ['北京化工大学信息科学与技术学院', '华南理工大学自动化科学与工程学院', '天津大学电气与自动化工程学院'],
      low: ['华北电力大学自动化系', '郑州大学控制科学与工程学院', '沈阳工业大学信息科学与工程学院'],
    },
  },
  {
    major: '机械工程',
    coreTopics: ['机械设计基础', '制造工艺与数字化生产', '流体传动与控制'],
    questionAngles: ['介绍一次复杂机械结构的优化过程', '如何提升加工精度与生产效率'],
    practiceTasks: ['准备展示一份机械零件三维建模案例', '用英文阐述绿色制造的实践'],
    recommendedSchools: {
      high: ['清华大学机械工程系', '上海交通大学机械与动力工程学院', '华中科技大学机械科学与工程学院'],
      mid: ['大连理工大学机械工程学院', '重庆大学机械工程学院', '燕山大学机械工程学院'],
      low: ['河北工业大学机械工程学院', '重庆理工大学机械工程学院', '兰州理工大学机电工程学院'],
    },
  },
  {
    major: '材料科学与工程',
    coreTopics: ['材料热处理与性能测试', '先进功能材料设计', '材料失效分析'],
    questionAngles: ['请谈谈相变强化的机理', '分享一次材料表征实验的难点'],
    practiceTasks: ['整理不同材料测试手段的对比表', '准备英文说明你参与的材料改性课题'],
    recommendedSchools: {
      high: ['北京航空航天大学材料学院', '上海交通大学材料科学与工程学院', '北京理工大学材料学院'],
      mid: ['东北大学材料科学与工程学院', '天津大学材料科学与工程学院', '华南理工大学材料科学与工程学院'],
      low: ['福州大学材料科学与工程学院', '昆明理工大学材料科学与工程学院', '广西大学材料科学与工程学院'],
    },
  },
  {
    major: '土木工程',
    coreTopics: ['结构力学与设计', '工程材料与施工技术', 'BIM 与项目管理'],
    questionAngles: ['描述一次复杂结构受力分析', '如何在项目中应用 BIM 提升效率'],
    practiceTasks: ['绘制一个桥梁结构受力示意并解释设计思路', '准备英文陈述施工安全控制措施'],
    recommendedSchools: {
      high: ['同济大学土木工程学院', '东南大学土木工程学院', '哈尔滨工业大学土木工程学院'],
      mid: ['重庆大学土木工程学院', '长沙理工大学土木工程学院', '福州大学土木工程学院'],
      low: ['青岛理工大学土木工程学院', '辽宁工程技术大学土木工程学院', '西南科技大学土木工程与建筑学院'],
    },
  },
  {
    major: '建筑学',
    coreTopics: ['建筑设计原理', '城市设计与更新', '建筑历史与理论'],
    questionAngles: ['如何平衡建筑美学与功能需求', '谈谈你对可持续建筑的理解'],
    practiceTasks: ['准备一个作品集重点项目的讲解稿', '用英文描述城市更新案例的设计亮点'],
    recommendedSchools: {
      high: ['清华大学建筑学院', '东南大学建筑学院', '同济大学建筑与城市规划学院'],
      mid: ['华南理工大学建筑学院', '天津大学建筑学院', '重庆大学建筑城规学院'],
      low: ['昆明理工大学建筑与城市规划学院', '长沙理工大学建筑学院', '福州大学建筑学院'],
    },
  },
  {
    major: '金融学',
    coreTopics: ['公司金融与估值', '金融市场与投资组合', '宏观经济与货币政策'],
    questionAngles: ['谈谈近期货币政策对资本市场的影响', '如何评价一次投资决策的风险与收益'],
    practiceTasks: ['复盘一份上市公司财报并提炼要点', '准备英文阐述一个资产配置策略'],
    recommendedSchools: {
      high: ['清华大学五道口金融学院', '中国人民大学财政金融学院', '复旦大学经济学院'],
      mid: ['对外经济贸易大学金融学院', '中央财经大学金融学院', '厦门大学经济学院'],
      low: ['江西财经大学金融学院', '东北财经大学金融学院', '中南财经政法大学金融学院'],
    },
  },
  {
    major: '会计学',
    coreTopics: ['财务报表分析', '管理会计与成本控制', '审计流程与风险管理'],
    questionAngles: ['请分享一次复杂成本核算的处理方式', '面对审计证据不足时如何应对'],
    practiceTasks: ['准备一份跨期比较的财务分析报告', '用英文解释内部控制设计思路'],
    recommendedSchools: {
      high: ['上海财经大学会计学院', '中山大学管理学院', '南京大学商学院'],
      mid: ['东北财经大学会计学院', '对外经济贸易大学会计学院', '中南财经政法大学会计学院'],
      low: ['西南财经大学会计学院', '浙江工商大学会计学院', '江西财经大学会计学院'],
    },
  },
  {
    major: '工商管理',
    coreTopics: ['战略管理与商业模式', '组织行为与领导力', '营销管理与品牌策略'],
    questionAngles: ['如何评估一个新业务的市场进入策略', '分享一次团队管理冲突的解决经验'],
    practiceTasks: ['撰写一份商业模式画布并准备路演稿', '用英文描述一次市场调研的流程与发现'],
    recommendedSchools: {
      high: ['北京大学光华管理学院', '清华大学经济管理学院', '上海交通大学安泰经济与管理学院'],
      mid: ['中山大学管理学院', '华东理工大学商学院', '西南财经大学工商管理学院'],
      low: ['云南大学工商管理与旅游管理学院', '河南大学商学院', '东北大学秦皇岛分校工商管理学院'],
    },
  },
  {
    major: '公共管理',
    coreTopics: ['公共政策分析', '政府治理与绩效评估', '公共经济与社会保障'],
    questionAngles: ['如何评估一项公共政策的实施效果', '谈谈基层治理中的协同问题'],
    practiceTasks: ['准备一份政策案例分析并提出改进建议', '用英文阐述公共项目评估框架'],
    recommendedSchools: {
      high: ['清华大学公共管理学院', '中国人民大学公共管理学院', '北京大学政府管理学院'],
      mid: ['华中科技大学公共管理学院', '厦门大学公共事务学院', '东北大学文法学院公共管理系'],
      low: ['中南财经政法大学公共管理学院', '山东大学政治学与公共管理学院', '西南财经大学公共管理学院'],
    },
  },
  {
    major: '教育学',
    coreTopics: ['教育心理学', '课程与教学论', '教育评价与测量'],
    questionAngles: ['如何在课堂中实施差异化教学', '请谈谈一次教育评估项目的设计'],
    practiceTasks: ['制作一份课堂观察记录并提炼改进点', '用英文介绍一次教学设计的成果'],
    recommendedSchools: {
      high: ['北京师范大学教育学部', '华东师范大学教育学部', '华中师范大学教育学院'],
      mid: ['南京师范大学教育科学学院', '首都师范大学教育学院', '东北师范大学教育学部'],
      low: ['陕西师范大学教育学院', '福建师范大学教育学院', '西南大学教育学部'],
    },
  },
  {
    major: '心理学',
    coreTopics: ['认知心理学', '发展与教育心理', '心理测量与统计'],
    questionAngles: ['描述一次心理测验的编制流程', '如何处理咨询中的伦理困境'],
    practiceTasks: ['准备一个心理实验设计并说明变量控制', '用英文阐述一次心理咨询个案的干预思路'],
    recommendedSchools: {
      high: ['北京大学心理与认知科学学院', '华南师范大学心理学院', '中国科学院心理研究所'],
      mid: ['西南大学心理学部', '南京师范大学心理学院', '浙江大学心理与行为科学系'],
      low: ['首都师范大学心理学院', '华中师范大学心理学院', '暨南大学心理学系'],
    },
  },
  {
    major: '法学',
    coreTopics: ['宪法与行政法', '民商法与案例分析', '国际法与比较法'],
    questionAngles: ['请评析一个热点案件的法律适用', '谈谈你对数字经济下隐私保护的看法'],
    practiceTasks: ['准备一份庭审陈述稿并进行辩论演练', '用英文总结一个跨国法律问题的研究'],
    recommendedSchools: {
      high: ['中国政法大学', '北京大学法学院', '清华大学法学院'],
      mid: ['中南财经政法大学法学院', '华东政法大学', '西南政法大学'],
      low: ['浙江工商大学法学院', '云南大学法学院', '河北大学政法学院'],
    },
  },
  {
    major: '新闻与传播',
    coreTopics: ['新闻写作与编辑', '新媒体运营与数据分析', '品牌传播与危机公关'],
    questionAngles: ['分析一次品牌危机的应对策略', '如何提升短视频内容的传播效果'],
    practiceTasks: ['策划一份热点事件的多平台传播方案', '用英文介绍你的媒体作品集亮点'],
    recommendedSchools: {
      high: ['中国人民大学新闻学院', '复旦大学新闻学院', '清华大学新闻与传播学院'],
      mid: ['北京师范大学新闻传播学院', '华中科技大学新闻与信息传播学院', '厦门大学新闻传播学院'],
      low: ['上海大学新闻传播学院', '暨南大学新闻与传播学院', '陕西师范大学新闻与传播学院'],
    },
  },
  {
    major: '汉语言文学',
    coreTopics: ['文学理论与批评', '古代文学与文献整理', '现代汉语与写作'],
    questionAngles: ['请评析一部文学作品的主题与手法', '谈谈你对语言规范与语言变体的看法'],
    practiceTasks: ['准备一篇 800 字文学评论并提炼观点', '用英文介绍中国古典文学的代表作品'],
    recommendedSchools: {
      high: ['北京大学中文系', '复旦大学中文系', '北京师范大学文学院'],
      mid: ['南京大学文学院', '四川大学文学与新闻学院', '华东师范大学中文系'],
      low: ['河南大学文学院', '山东大学文学院', '云南大学文学院'],
    },
  },
  {
    major: '外国语言文学',
    coreTopics: ['翻译理论与实践', '跨文化交际', '语言学与语料库分析'],
    questionAngles: ['谈谈一次高难度笔译或口译经验', '如何处理跨文化交流中的误解'],
    practiceTasks: ['准备中英互译的术语表并熟练背诵', '用英文分享一次跨文化团队协作的经历'],
    recommendedSchools: {
      high: ['北京外国语大学英语学院', '上海外国语大学高级翻译学院', '广东外语外贸大学高级翻译学院'],
      mid: ['对外经济贸易大学外语学院', '山东大学外国语学院', '华东理工大学外国语学院'],
      low: ['天津外国语大学英语学院', '南京师范大学外国语学院', '西安外国语大学高级翻译学院'],
    },
  },
  {
    major: '临床医学',
    coreTopics: ['诊断学与病史采集', '临床技能操作', '病例分析与决策'],
    questionAngles: ['如何制定一份疑难病例的诊疗方案', '谈谈你对医学人文关怀的实践'],
    practiceTasks: ['准备一个典型病例的汇报模板', '用英文描述一次多学科会诊的经历'],
    recommendedSchools: {
      high: ['北京协和医学院', '复旦大学上海医学院', '中山大学中山医学院'],
      mid: ['华中科技大学同济医学院', '四川大学华西临床医学院', '浙江大学医学院'],
      low: ['昆明医科大学第一临床医学院', '福建医科大学临床医学院', '南昌大学第一临床医学院'],
    },
  },
  {
    major: '护理学',
    coreTopics: ['重症护理与评估', '护理科研方法', '社区护理与健康管理'],
    questionAngles: ['描述一次重症护理中的团队协作', '如何设计护理科研的问卷与访谈'],
    practiceTasks: ['整理一个典型护理案例的 SOP', '用英文演示健康宣教要点'],
    recommendedSchools: {
      high: ['北京大学护理学院', '中山大学护理学院', '复旦大学护理学院'],
      mid: ['首都医科大学护理学院', '重庆医科大学护理学院', '哈尔滨医科大学护理学院'],
      low: ['温州医科大学护理学院', '广州医科大学护理学院', '云南中医药大学护理学院'],
    },
  },
];

const weeklyPlan = [
  { day: 'Day 1', focus: '定位差距', tasks: ['录制 2 段 1 分钟英文自我介绍与项目阐述', '整理听力或发音问题，建立“错误词库”'] },
  { day: 'Day 2', focus: '核心表达', tasks: ['精背 20 个专业高频表达，搭配中英文例句', '使用“观点-论据-总结”结构，写 3 段 80 词短文并朗读'] },
  { day: 'Day 3', focus: '情景问答', tasks: ['模拟导师追问 5 轮，练习补充数据与观点', '准备 3 个失败经历故事，突出复盘与改进'] },
  { day: 'Day 4', focus: '学术表达', tasks: ['整理研究计划或实验设计的英文关键词', '尝试用英文解释 2 个专业模型或理论'] },
  { day: 'Day 5', focus: '现场应变', tasks: ['练习 10 个高频突发问题，如“换导师怎么办”', '训练“听-记-答”闭环，回应前先复述问题确认'] },
  { day: 'Day 6', focus: '全真模拟', tasks: ['与同伴或教练进行 20 分钟全英文模拟面试', '记录反馈并更新应答卡片'] },
  { day: 'Day 7', focus: '放松调节', tasks: ['回顾一周进步点与待改进项', '进行 15 分钟轻松口语输出（描述电影/书籍）'] },
];

const emergencyResponses = [
  {
    scenario: '导师突然提到你未准备的术语',
    answer: 'Thanks for pointing it out. I understand it as …, and in my project I related it to …. May I also share a quick example from my internship?',
  },
  {
    scenario: '被质疑科研成果含金量不足',
    answer: 'I appreciate the question. The project is still at an early stage, so I focused on building a reproducible baseline. The next step is to collaborate with … to validate it on larger datasets.',
  },
  {
    scenario: '需要临场转换到中文回答',
    answer: '这部分我想先用中文说明核心结论：……。If needed, I can further elaborate the methodology in English afterward.',
  },
  {
    scenario: '导师连续追问细节导致卡壳',
    answer: 'Let me double-check the figures to ensure accuracy. To the best of my knowledge, the result was …. I would be happy to provide the full report after the interview.',
  },
];

module.exports = {
  scoreBandGuides,
  bilingualTemplate,
  rehearsalChecklist,
  majorRecommendations,
  weeklyPlan,
  emergencyResponses,
};
