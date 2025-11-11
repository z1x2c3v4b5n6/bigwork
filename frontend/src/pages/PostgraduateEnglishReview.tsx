import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import LightbulbIcon from '@mui/icons-material/Lightbulb';
import QuizIcon from '@mui/icons-material/Quiz';
import ReplayIcon from '@mui/icons-material/Replay';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { scoreBandGuides } from '../data/postgraduateResources';

const weeklyPlan = [
  {
    day: 'Day 1',
    focus: '定位差距',
    tasks: ['录制 2 段 1 分钟英文自我介绍与项目阐述', '整理听力或发音问题，建立“错误词库”'],
  },
  {
    day: 'Day 2',
    focus: '核心表达',
    tasks: ['精背 20 个专业高频表达，搭配中英文例句', '使用“观点-论据-总结”结构，写 3 段 80 词短文并朗读'],
  },
  {
    day: 'Day 3',
    focus: '情景问答',
    tasks: ['模拟导师追问 5 轮，练习补充数据与观点', '准备 3 个失败经历故事，突出复盘与改进'],
  },
  {
    day: 'Day 4',
    focus: '学术表达',
    tasks: ['整理研究计划或实验设计的英文关键词', '尝试用英文解释 2 个专业模型或理论'],
  },
  {
    day: 'Day 5',
    focus: '现场应变',
    tasks: ['练习 10 个高频突发问题，如“换导师怎么办”', '训练“听-记-答”闭环，回应前先复述问题确认'],
  },
  {
    day: 'Day 6',
    focus: '全真模拟',
    tasks: ['与同伴或教练进行 20 分钟全英文模拟面试', '记录反馈并更新应答卡片'],
  },
  {
    day: 'Day 7',
    focus: '放松调节',
    tasks: ['回顾一周进步点与待改进项', '进行 15 分钟轻松口语输出（描述电影/书籍）'],
  },
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

const PostgraduateEnglishReview = () => {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          英语口语快速复盘清单
        </Typography>
        <Typography variant="body1" color="text.secondary">
          结合分数段策略，7 天内完成高频表达梳理、语音纠错与全真模拟，帮助你在复试口语环节“快定位、快修正、快输出”。
        </Typography>
      </Stack>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <RecordVoiceOverIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                分数段应对策略
              </Typography>
              <Typography variant="body2" color="text.secondary">
                对应 score band 选择演练重点：高分段强化深度表达，中间段补齐基础与连贯性，国家线以下建议调整节奏，积累素材准备下一轮。
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            {scoreBandGuides.map((guide) => (
              <Grid item xs={12} md={4} key={guide.key}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', height: '100%' }}>
                  <Stack spacing={1.5}>
                    <Chip
                      label={guide.title}
                      color={guide.key === 'low' ? 'warning' : 'primary'}
                      variant="outlined"
                      sx={{ alignSelf: 'flex-start' }}
                    />
                    <Typography variant="body2" color="text.secondary">
                      {guide.subtitle}
                    </Typography>
                    <Divider sx={{ borderStyle: 'dotted' }} />
                    <List dense>
                      {guide.actionSteps.map((step) => (
                        <ListItem key={step} sx={{ alignItems: 'flex-start', px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <PsychologyIcon color={guide.key === 'low' ? 'warning' : 'secondary'} fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={step} />
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <AccessTimeIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                7 天快冲口语复盘计划
              </Typography>
              <Typography variant="body2" color="text.secondary">
                每天 60-80 分钟，涵盖输入、输出与自我纠错。若仅能抽出 30 分钟，可保留当日第 1 项任务，次日补齐其余项目。
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            {weeklyPlan.map((item) => (
              <Grid item xs={12} md={4} key={item.day}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', height: '100%' }}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      {item.day} · {item.focus}
                    </Typography>
                    <List dense>
                      {item.tasks.map((task) => (
                        <ListItem key={task} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            <ReplayIcon color="primary" fontSize="small" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={task} />
                        </ListItem>
                      ))}
                    </List>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2.5}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <LightbulbIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                纠错与强化流程
              </Typography>
              <Typography variant="body2" color="text.secondary">
                使用“听录音 → 标错误 → 二次输出”的三步循环，确保每一次练习都有可量化的改进指标。
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', height: '100%' }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    错误标注四步法
                  </Typography>
                  <List dense>
                    {[
                      'Step 1：听原音并打字记录，标出停顿与重复位置。',
                      'Step 2：对照官方/导师推荐表达，找出语法或词汇的可替换项。',
                      'Step 3：用不同颜色高亮“必须修正”与“可以升级”的句子。',
                      'Step 4：重新录制，确保修正项全部消失，如仍存在则重复 Step 2-4。',
                    ].map((item) => (
                      <ListItem key={item} sx={{ px: 0 }}>
                        <ListItemIcon sx={{ minWidth: 28 }}>
                          <QuizIcon color="secondary" fontSize="small" />
                        </ListItemIcon>
                        <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', height: '100%' }}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    紧急应对模板
                  </Typography>
                  <List dense>
                    {emergencyResponses.map((item) => (
                      <ListItem key={item.scenario} alignItems="flex-start" sx={{ px: 0 }}>
                        <ListItemText
                          primaryTypographyProps={{ variant: 'subtitle2', fontWeight: 600 }}
                          secondaryTypographyProps={{ variant: 'body2', color: 'text.secondary', component: 'div' }}
                          primary={item.scenario}
                          secondary={<Typography variant="body2">{item.answer}</Typography>}
                        />
                      </ListItem>
                    ))}
                  </List>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

    </Stack>
  );
};

export default PostgraduateEnglishReview;
