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
import AutoAwesomeIcon from '@mui/icons-material/AutoAwesome';
import TranslateIcon from '@mui/icons-material/Translate';
import ChecklistIcon from '@mui/icons-material/Checklist';
import BoltIcon from '@mui/icons-material/Bolt';
import BookmarkAddedIcon from '@mui/icons-material/BookmarkAdded';
import { scoreBandGuides } from '../data/postgraduateResources';
import MiniProgramGuide from '../components/MiniProgramGuide';

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

const PostgraduateIntroTemplates = () => {
  return (
    <Stack spacing={4}>
      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          复试自我介绍模板（中英双语）
        </Typography>
        <Typography variant="body1" color="text.secondary">
          以“结构分层 + 关键词填空”的方式快速定制，中文和英文一一对应，便于在复试现场灵活切换。先根据自己的分数段选择策略，再将核心素材填入模板中的占位符。
        </Typography>
      </Stack>

      <Grid container spacing={3}>
                {scoreBandGuides.map((guide) => (
                  <Grid item xs={12} md={4} key={guide.key}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
                      <Stack spacing={2}>
                        <Box>
                          <Chip
                            label={guide.title}
                            color={guide.key === 'low' ? 'warning' : 'primary'}
                            variant="outlined"
                            sx={{ mb: 1 }}
                          />
                          <Typography variant="body2" color="text.secondary">
                            {guide.subtitle}
                          </Typography>
                        </Box>
                <Divider sx={{ borderStyle: 'dashed' }} />
                <List dense>
                  {guide.actionSteps.map((step) => (
                    <ListItem key={step} sx={{ alignItems: 'flex-start', px: 0 }}>
                      <ListItemIcon sx={{ minWidth: 32 }}>
                        <BoltIcon color={guide.key === 'low' ? 'action' : 'primary'} fontSize="small" />
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

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <AutoAwesomeIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                双语段落模板：填入你的专属内容
              </Typography>
              <Typography variant="body2" color="text.secondary">
                参考下表逐段替换关键词，确保“中文先确认逻辑，英文再对应翻译”的顺序。可提前打印或导入提词器，方便现场查看。
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            {bilingualTemplate.map((section) => (
              <Grid item xs={12} md={6} key={section.title}>
                <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, border: '1px dashed', borderColor: 'divider', height: '100%' }}>
                  <Stack spacing={1.5}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {section.title}
                    </Typography>
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        中文
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.chinese}
                      </Typography>
                    </Box>
                    <Divider flexItem sx={{ borderStyle: 'dotted' }} />
                    <Box>
                      <Typography variant="body2" sx={{ fontWeight: 600, mb: 0.5 }}>
                        English
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {section.english}
                      </Typography>
                    </Box>
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
            <ChecklistIcon color="primary" fontSize="large" />
            <Box>
              <Typography variant="h6" fontWeight={600} gutterBottom>
                临场彩蛋素材清单
              </Typography>
              <Typography variant="body2" color="text.secondary">
                根据导师提问实时补充，提前准备好数据与故事点，确保随问随答。
              </Typography>
            </Box>
          </Stack>
          <Grid container spacing={2}>
            <Grid item xs={12} md={8}>
              <List>
                {rehearsalChecklist.map((item) => (
                  <ListItem key={item} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 32 }}>
                      <BookmarkAddedIcon color="success" fontSize="small" />
                    </ListItemIcon>
                    <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
                  </ListItem>
                ))}
              </List>
            </Grid>
            <Grid item xs={12} md={4}>
              <Paper elevation={0} sx={{ p: 2.5, borderRadius: 2, bgcolor: 'primary.50' }}>
                <Stack spacing={1}>
                  <TranslateIcon color="primary" />
                  <Typography variant="subtitle1" fontWeight={600}>
                    快速切换技巧
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    先用中文回答核心观点，再补一句英文总结亮点，例如：“核心经验是…… In short, it proves my capability in …”。在 15 秒内完成切换即可体现语言敏感度。
                  </Typography>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </Stack>
      </Paper>

      <MiniProgramGuide />
    </Stack>
  );
};

export default PostgraduateIntroTemplates;
