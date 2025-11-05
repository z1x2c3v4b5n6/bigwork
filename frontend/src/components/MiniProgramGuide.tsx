import {
  Box,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AppShortcutIcon from '@mui/icons-material/AppShortcut';
import LaptopMacIcon from '@mui/icons-material/LaptopMac';
import CodeIcon from '@mui/icons-material/Code';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import ConstructionIcon from '@mui/icons-material/Construction';
import type { FC } from 'react';

const requiredTools = [
  {
    icon: <LaptopMacIcon color="primary" fontSize="small" />,
    title: '微信开发者工具（WeChat DevTools）',
    description: '用于创建/预览/上传小程序，建议使用官方 1.06 及以上版本并使用同一微信号登录。',
  },
  {
    icon: <CodeIcon color="secondary" fontSize="small" />,
    title: 'Visual Studio Code 或 WebStorm',
    description: '编辑小程序源代码，便于同步本项目中的数据结构与 TypeScript/JSON 文件。',
  },
  {
    icon: <ConstructionIcon color="success" fontSize="small" />,
    title: 'Node.js & npm',
    description: '保持与本仓库一致的依赖版本，可在小程序端复用 JSON 数据或通过云函数调用后端接口。',
  },
];

const setupSteps = [
  '注册微信小程序账号并在微信公众平台获取 AppID，选择“教育培训”或符合业务的服务类目。',
  '在微信开发者工具中新建项目，选择 “小程序” 模板，将仓库克隆至本地并指定 miniprogram 目录。',
  '拷贝 frontend/src/data/postgraduateResources.ts 中的 scoreBandGuides 与 majorRecommendations，转为 JSON 存入 miniprogram/data/ 以便页面直接引用。',
  '为自我介绍/专业课/英语复盘分别创建页面（如 pages/intro/index）并使用 tabBar 或导航按钮实现页面切换，WXML 中可使用 scroll-view + rich-text 呈现列表内容。',
  '如需与现有推荐服务打通，可在 miniprogram/cloudfunctions 中创建云函数，调用服务器 recommendUniversities 接口实现分数段智能推荐。',
  '完成样式后通过“编译-预览”在真机测试，确认长列表滚动与富文本排版在小屏幕上展示正常。',
];

const releaseChecklist = [
  '在微信开发者工具内运行 npm install && npm run lint（如使用框架）确保无语法错误。',
  '配置业务域名：若直接嵌入 H5 页面，请在公众平台配置 web-view 业务域名；若使用云函数，请绑定云开发环境。',
  '填写版本信息、上传代码，并在“提交审核”时附上各功能页面的操作录屏与说明，审核通过后即可发布。',
];

const MiniProgramGuide: FC = () => {
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 3,
        border: '1px solid',
        borderColor: 'divider',
        background: 'linear-gradient(135deg, rgba(224,242,241,0.6), rgba(255,255,255,0.95))',
      }}
    >
      <Stack spacing={3}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
          <AppShortcutIcon color="primary" fontSize="large" />
          <Box>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              小程序同步指引
            </Typography>
            <Typography variant="body2" color="text.secondary">
              根据下方步骤，即可把复试资料区迁移到微信小程序：先准备开发工具，再按照步骤导入数据、搭建页面、提交审核。
            </Typography>
          </Box>
        </Stack>

        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            必备软件
          </Typography>
          <List dense>
            {requiredTools.map((tool) => (
              <ListItem key={tool.title} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>{tool.icon}</ListItemIcon>
                <ListItemText
                  primaryTypographyProps={{ variant: 'body2', fontWeight: 600 }}
                  secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary' }}
                  primary={tool.title}
                  secondary={tool.description}
                />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            操作步骤
          </Typography>
          <List dense>
            {setupSteps.map((step) => (
              <ListItem key={step} sx={{ alignItems: 'flex-start', px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <AutoFixHighIcon color="primary" fontSize="small" />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={step} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Divider sx={{ borderStyle: 'dashed' }} />

        <Box>
          <Typography variant="subtitle2" fontWeight={600} gutterBottom>
            发布前检查
          </Typography>
          <List dense>
            {releaseChecklist.map((item) => (
              <ListItem key={item} sx={{ px: 0 }}>
                <ListItemIcon sx={{ minWidth: 32 }}>
                  <CheckCircleIcon color="success" fontSize="small" />
                </ListItemIcon>
                <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
              </ListItem>
            ))}
          </List>
        </Box>

        <Typography variant="body2" color="text.secondary">
          提示：若希望快速上线，可直接在小程序中使用 web-view 组件嵌入本系统的 H5 页面；后续再逐步替换为原生组件，即可兼顾时效与体验。
        </Typography>
      </Stack>
    </Paper>
  );
};

export default MiniProgramGuide;
