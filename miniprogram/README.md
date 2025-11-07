# 复试资料小程序模板

`miniprogram/` 目录已经包含可直接导入微信开发者工具的完整示例项目，复刻 Web 端全部学习功能：概览看板、课程体系、刷题训练、学习日程、院校推荐、学习分析、考研论坛、个人中心与后台管理，同时保留自我介绍、专业课、英语复盘三大资料页。所有数据均来自仓库内的最新整理，可在无后端依赖的情况下独立运行与演示。

## 目录结构

```
miniprogram/
├── app.json            # 小程序页面与 tabBar 配置
├── app.ts / app.wxss   # 全局脚本与样式，定义卡片风格
├── config.ts           # API 基地址配置，可在工具内快速切换端口
├── data/dashboard.ts   # 学习概览、课程、刷题、日程等默认数据
├── data/courses.ts     # 课程体系与精品小班模板
├── data/practice.ts    # 刷题训练默认题单与题目
├── data/analytics.ts   # 学习分析指标与知识图谱
├── data/forum.ts       # 论坛话题与回复示例
├── data/profile.ts     # 个人资料默认值
├── data/admin.ts       # 后台监控指标与常用院校网站
├── data/resources.ts   # 复试资料数据源，可直接修改后实时生效
├── data/universityProfiles.ts # 院校画像及初试科目要求
├── utils/storage.ts    # 本地存储封装（wx.setStorageSync）
├── utils/universityAdvisor.ts # 智能推荐算法（与服务端保持一致）
├── pages/
│   ├── home/           # 学习概览看板，与 Web 首页一致
│   ├── courses/        # 课程体系，支持本地新增课程
│   ├── practice/       # 刷题训练，支持本地题单/题目管理
│   ├── schedule/       # 学习日程，支持新增行程
│   ├── analytics/      # 学习分析，展示掌握度与知识图谱
│   ├── advisor/        # 院校推荐：总分+科目偏好智能匹配院校
│   ├── forum/          # 考研论坛，支持点赞与回复
│   ├── profile/        # 个人中心，可编辑资料
│   ├── admin/          # 后台管理，展示指标与资讯网站
│   ├── intro/          # 自我介绍分段策略 + 中英文模板
│   ├── professional/   # 各专业复试题纲与院校参考链接
│   └── english/        # 英语复盘计划与邮件模板
├── project.config.json # 微信开发者工具项目配置
├── sitemap.json
└── tsconfig.json
```

## 快速预览

1. 安装 **微信开发者工具**（1.06 及以上版本），使用项目成员微信号登录。如遇“下载基础库 2.31.0 失败”，可在“详情 → 本地设置”中手动选择 `2.33.0` 或更高稳定版；本项目的 `project.config.json` 已预置 `2.33.0` 作为最低兼容版本。
2. 选择“导入项目”，指向本仓库的 `miniprogram` 目录，AppID 可先填写 `touristappid` 进行本地调试。
3. 导入后建议执行一次“工具 → 清缓存 → 编译缓存”，再点击左下角 “编译” 或 “预览”，即可在真机或开发工具中体验全部功能页面。

> 全部页面基于 `scroll-view` 与响应式卡片样式构建，无需额外依赖。若需要调整字体、配色，可直接修改 `app.wxss` 或各页面的 `index.wxss`。

## 更新资料内容

- `data/resources.ts` 汇总了自我介绍、专业课、英语复盘、分数段策略与专业方向建议等数据。按照现有结构增删条目即可，保存后重新编译即可同步到界面。
- `data/universityProfiles.ts` 存放院校画像、分数线、复试亮点与初试科目要求，默认由 `utils/universityAdvisor.ts` 读取并生成推荐结果。
- `data/dashboard.ts` / `data/practice.ts` / `data/forum.ts` / `data/profile.ts` 等文件提供默认示例数据，页面会自动写入本地存储，可在小程序内编辑并即时保存。
- 如需与后端联动，可在页面的 `index.ts` 中改用 `wx.request` 或云函数，并结合 `config.ts` 调整接口基地址。

`config.ts` 默认指向 `http://localhost:3000/api`，可通过 `wx.setStorageSync('apiConfig', { baseUrl: 'http://你的域名/api', timeout: 8000 })` 在开发者工具 Console 中临时切换。确保服务端端口、跨域和 Cookie 设置与 Web 端一致，可避免 500 或跨域报错。

院校推荐页面完全复用了 Web 端的智能推荐逻辑，支持：

- 根据初试总分计算冲刺 / 稳妥 / 保底院校组合，并给出匹配理由；
- 解析数学、英语科目偏好，提醒与院校要求的差异；
- 输出复试时间线、备考策略与资料链接，实现资料库 + 推荐服务一站式体验。

## 与院校推荐服务联动（可选）

1. 在微信开发者工具中开启云开发或配置网络请求合法域名。
2. 新建 `cloudfunctions/recommendUniversities`，在其中请求服务端 `/api/learning/recommend-universities` 接口并返回结果。
3. 在页面中调用该云函数，将返回的冲刺/稳妥/保底院校信息渲染为卡片或弹窗提示。

## 发布前检查

- 在项目根目录执行 `npm install`（如启用 npm 构建）并保证 **工具 → 构建 npm** 无报错。
- 检查 `project.config.json` 中的 `appid`、`projectname` 是否与线上应用一致，必要时更新版本号与备注。
- 在“上传”页面填写版本描述，并附上三大功能页的操作录屏或截图，方便审核人员快速理解功能点。

如需快速上线，也可以在现有页面添加 `web-view` 组件嵌入本系统 H5 页面，后续再逐步替换为原生组件即可。
