import {
  Alert,
  Box,
  Button,
  Chip,
  Container,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import QuizIcon from '@mui/icons-material/Quiz';
import SchoolIcon from '@mui/icons-material/School';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import GroupIcon from '@mui/icons-material/Group';
import UpdateIcon from '@mui/icons-material/Update';
import TipsAndUpdatesIcon from '@mui/icons-material/TipsAndUpdates';
import TextSnippetIcon from '@mui/icons-material/TextSnippet';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import RecordVoiceOverIcon from '@mui/icons-material/RecordVoiceOver';
import ArrowForwardIcon from '@mui/icons-material/ArrowForward';
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import PracticeCard from '../components/PracticeCard';
import ScheduleTimeline from '../components/ScheduleTimeline';
import SectionCard from '../components/SectionCard';
import UniversityAdvisorPanel from '../components/UniversityAdvisorPanel';
import useGreeting from '../hooks/useGreeting';
import useDashboardData from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';
import { Link as RouterLink } from 'react-router-dom';

const statIconMap: Record<string, JSX.Element> = {
  studyTime: <AccessTimeIcon fontSize="inherit" />,
  questionDrill: <QuizIcon fontSize="inherit" />,
  courseFocus: <SchoolIcon fontSize="inherit" />,
  mockRank: <EmojiEventsIcon fontSize="inherit" />,
};

const retakeResources = [
  {
    title: '复试自我介绍模板',
    description: '分数段策略 + 中英双语段落模板，60 秒内定制专属稿件。',
    icon: <TextSnippetIcon color="primary" fontSize="large" />, 
    to: '/retake-intro',
  },
  {
    title: '专业课高频题整理表',
    description: '20 个热门专业高频考点、追问角度与练习任务一图掌握。',
    icon: <LibraryBooksIcon color="secondary" fontSize="large" />, 
    to: '/retake-subjects',
  },
  {
    title: '英语口语快速复盘',
    description: '7 天快冲计划 + 突发问答模板，强化口语纠错与输出。',
    icon: <RecordVoiceOverIcon color="success" fontSize="large" />, 
    to: '/retake-english',
  },
];

const Home = () => {
  const greeting = useGreeting();
  const { user } = useAuth();
  const { data, isFetching, isError, refetch } = useDashboardData(user);
  const isAdmin = user?.role?.toLowerCase() === 'admin';

  const stats = data?.stats ?? [];
  const courses = data?.courses ?? [];
  const practiceSets = data?.practiceSets ?? [];
  const schedule = data?.schedule ?? [];
  const recommendation = data?.recommendation ?? '';
  const userName = user?.name ?? data?.userName ?? '同学';
  const adminFocus = isAdmin ? data?.adminFocus : undefined;
  const courseDrafts = adminFocus?.courseDrafts ?? [];
  const reviewQueue = adminFocus?.reviewQueue ?? [];
  const recentRegistrations = adminFocus?.recentRegistrations ?? [];
  const pushMessages = data?.pushMessages ?? [];
  const followedInstitutions = data?.followedInstitutions ?? [];
  const subjectHighlights = data?.subjectHighlights ?? [];

  return (
    <Box
      sx={{
        position: 'relative',
        minHeight: '100%',
        py: { xs: 4, md: 6 },
        background: 'linear-gradient(180deg, rgba(226,239,255,0.7) 0%, #ffffff 55%)',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          pointerEvents: 'none',
          backgroundImage:
            'radial-gradient(circle at 20% 15%, rgba(33,150,243,0.18), transparent 55%), radial-gradient(circle at 85% 10%, rgba(156,39,176,0.12), transparent 45%), radial-gradient(circle at 50% 100%, rgba(3,169,244,0.08), transparent 45%)',
          opacity: 0.9,
        }}
      />
      <Container maxWidth="lg" sx={{ position: 'relative' }}>
        <Stack spacing={5}>
          {isFetching && <LinearProgress />}
          {isError && (
            <Alert
              severity="error"
              action={
                <Button color="inherit" size="small" onClick={() => refetch()}>
                  重新获取
                </Button>
              }
              sx={{ borderRadius: 3 }}
            >
              暂时无法从后端加载最新看板数据，以下展示的是内置示例数据。
            </Alert>
          )}

          <HeroBanner greeting={greeting} userName={userName} />

          {pushMessages.length > 0 && (
            <SectionCard
              title="最新院校推送"
              subtitle="关注的院校发布招生简章或更新复试要求时，将在此提醒你及时查看。"
            >
              <Stack spacing={2}>
                {pushMessages.map((message) => (
                  <Alert
                    key={message.id}
                    severity="info"
                    action={
                      message.action?.url ? (
                        <Button
                          color="inherit"
                          size="small"
                          href={message.action.url}
                          target="_blank"
                          rel="noreferrer"
                        >
                          {message.action.label ?? '查看详情'}
                        </Button>
                      ) : null
                    }
                    sx={{ borderRadius: 3 }}
                  >
                    <Stack spacing={0.5}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {message.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {message.content}
                      </Typography>
                      <Typography variant="caption" color="text.disabled">
                        {new Date(message.createdAt).toLocaleString()}
                      </Typography>
                    </Stack>
                  </Alert>
                ))}
              </Stack>
            </SectionCard>
          )}

          {subjectHighlights.length > 0 && (
            <SectionCard
              title="科目匹配建议"
              subtitle="基于你填写的考试科目，为你匹配适合的专业方向与备考提示。"
            >
              <Stack spacing={2}>
                {subjectHighlights.map((highlight) => (
                  <Paper
                    key={highlight.combination}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 3, background: 'rgba(255,255,255,0.85)' }}
                  >
                    <Stack spacing={1.2}>
                      <Stack direction="row" spacing={1} alignItems="center" flexWrap="wrap" useFlexGap>
                        <Chip label={highlight.combination} color="primary" variant="outlined" />
                        {highlight.recommendedMajors.slice(0, 3).map((major) => (
                          <Chip key={major} label={major} size="small" variant="outlined" />
                        ))}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {highlight.suggestion}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </SectionCard>
          )}

          {followedInstitutions.length > 0 && (
            <SectionCard
              title="已关注院校动态"
              subtitle="查看院校最新招生简章与历年分数线，保持与官方要求同步。"
            >
              <Stack spacing={2.5}>
                {followedInstitutions.map((institution) => (
                  <Paper
                    key={institution.id}
                    variant="outlined"
                    sx={{ p: 2.5, borderRadius: 3, background: 'linear-gradient(135deg, rgba(232,244,253,0.45), #fff)' }}
                  >
                    <Stack spacing={1.5}>
                      <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={1.5}>
                        <Box>
                          <Typography variant="h6" fontWeight={700}>
                            {institution.name}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {institution.location} · 已关注 {institution.followerCount} 人
                          </Typography>
                        </Box>
                        <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                          {institution.tags.slice(0, 4).map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                          {institution.officialWebsite && (
                            <Button
                              size="small"
                              variant="outlined"
                              color="primary"
                              href={institution.officialWebsite}
                              target="_blank"
                              rel="noreferrer"
                            >
                              官网
                            </Button>
                          )}
                        </Stack>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {institution.focus}
                      </Typography>
                      {institution.latestBrochure && (
                        <Alert
                          severity="success"
                          sx={{ borderRadius: 2 }}
                          action={
                            institution.latestBrochure.link ? (
                              <Button
                                color="inherit"
                                size="small"
                                href={institution.latestBrochure.link}
                                target="_blank"
                                rel="noreferrer"
                              >
                                查阅简章
                              </Button>
                            ) : null
                          }
                        >
                          <Typography variant="subtitle2" fontWeight={600}>
                            {institution.latestBrochure.title}
                          </Typography>
                          <Typography variant="body2">{institution.latestBrochure.summary}</Typography>
                        </Alert>
                      )}
                      <Stack spacing={1}>
                        <Typography variant="subtitle2" color="text.secondary">
                          历年数据速览
                        </Typography>
                        <Stack direction="row" spacing={2} flexWrap="wrap" useFlexGap>
                          {institution.historicalData.slice(0, 3).map((record) => (
                            <Paper
                              key={`${institution.id}-${record.year}`}
                              variant="outlined"
                              sx={{ p: 1.5, borderRadius: 2, minWidth: 160 }}
                            >
                              <Typography variant="subtitle2" fontWeight={600}>
                                {record.year} 年
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                录取人数：{record.enrollment ?? '—'} · 分数线：{record.scoreLine ?? '—'}
                              </Typography>
                              {record.note && (
                                <Typography variant="caption" color="text.secondary">
                                  {record.note}
                                </Typography>
                              )}
                            </Paper>
                          ))}
                        </Stack>
                      </Stack>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </SectionCard>
          )}

          {isAdmin ? (
            <Stack spacing={4}>
              <SectionCard title="平台运营总览" subtitle="实时掌握课程与论坛的关键指标，识别最需要关注的任务。">
                <Grid container spacing={3}>
                  {stats.map((stat) => (
                    <Grid item xs={12} md={3} key={stat.id}>
                      <StatCard
                        title={stat.title}
                        value={stat.value}
                        helperText={stat.helperText}
                        icon={statIconMap[stat.id] ?? <TrendingUpIcon />}
                        accent={stat.accent}
                      />
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard
                title="待发布课程"
                subtitle="快速确认课程草稿并完善关键信息，让优质内容尽快上线。"
                action={<Chip label={`待发布 ${courseDrafts.length} 门`} color="warning" variant="outlined" />}
              >
                {courseDrafts.length > 0 ? (
                  <Stack spacing={2.5}>
                    {courseDrafts.map((draft) => (
                      <Box
                        key={draft.id}
                        sx={{
                          p: 2.5,
                          borderRadius: 3,
                          background: 'rgba(255,255,255,0.7)',
                          border: '1px solid rgba(25,118,210,0.12)',
                        }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {draft.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          讲师：{draft.teacher ?? '待补充'} · 专业：{draft.majorName ?? '未指定'} · 学分：
                          {draft.credit != null ? draft.credit : '待定'}
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={1}>
                          {draft.description ?? '课程简介尚未完善，建议补充课程亮点与适合人群。'}
                        </Typography>
                      </Box>
                    ))}
                  </Stack>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    当前没有待发布课程。
                  </Typography>
                )}
              </SectionCard>

              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <SectionCard title="待处理论坛反馈" subtitle="优先回复高优先级和待审核的讨论，维护学习氛围。">
                    {reviewQueue.length > 0 ? (
                      <Stack spacing={2}>
                        {reviewQueue.map((item) => (
                          <Box
                            key={item.id}
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'rgba(255,255,255,0.65)',
                              border: '1px solid rgba(25,118,210,0.1)',
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={600}>
                              {item.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" mt={0.5}>
                              {item.content}
                            </Typography>
                          </Box>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        没有待审核的论坛内容。
                      </Typography>
                    )}
                  </SectionCard>
                </Grid>
                <Grid item xs={12} md={6}>
                  <SectionCard title="最新学员" subtitle="欢迎新加入的同学并安排首次学习任务。">
                    {recentRegistrations.length > 0 ? (
                      <Stack spacing={2}>
                        {recentRegistrations.map((item) => (
                          <Stack
                            key={item.id}
                            direction="row"
                            justifyContent="space-between"
                            alignItems="center"
                            sx={{
                              p: 2,
                              borderRadius: 3,
                              background: 'rgba(255,255,255,0.65)',
                              border: '1px solid rgba(25,118,210,0.1)',
                            }}
                          >
                            <Box>
                              <Typography variant="subtitle1" fontWeight={600}>
                                {item.name}
                              </Typography>
                              <Typography variant="body2" color="text.secondary">
                                {item.majorName || '未分配专业'}
                              </Typography>
                            </Box>
                            {item.createdAt && (
                              <Typography variant="caption" color="text.secondary">
                                {new Date(item.createdAt).toLocaleString()}
                              </Typography>
                            )}
                          </Stack>
                        ))}
                      </Stack>
                    ) : (
                      <Typography variant="body2" color="text.secondary">
                        暂无新的学员注册。
                      </Typography>
                    )}
                  </SectionCard>
                </Grid>
              </Grid>

              {adminFocus?.dataQuality && (
                <SectionCard title="数据总览" subtitle="核心资源一目了然，便于统筹教研与内容运营。">
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <Chip label={`专业 ${adminFocus.dataQuality.majors}`} color="primary" variant="outlined" />
                    <Chip label={`题库 ${adminFocus.dataQuality.practiceSets}`} color="primary" variant="outlined" />
                    <Chip label={`论坛 ${adminFocus.dataQuality.forumTopics}`} color="primary" variant="outlined" />
                  </Stack>
                </SectionCard>
              )}
            </Stack>
          ) : (
            <Stack spacing={4}>
              <SectionCard title="学习进度总览" subtitle="近期学习表现与提升趋势概览。">
                {stats.length > 0 ? (
                  <Grid container spacing={3}>
                    {stats.map((stat) => (
                      <Grid item xs={12} sm={6} md={3} key={stat.id}>
                        <StatCard
                          title={stat.title}
                          value={stat.value}
                          helperText={stat.helperText}
                          icon={statIconMap[stat.id] ?? <AccessTimeIcon fontSize="inherit" />}
                          accent={stat.accent}
                        />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    暂无可展示的统计数据。
                  </Typography>
                )}
              </SectionCard>

              <SectionCard title="正在学习的课程" subtitle="继续保持节奏，完成系统推荐的任务。">
                {courses.length > 0 ? (
                  <Grid container spacing={3}>
                    {courses.map((course) => (
                      <Grid item xs={12} md={4} key={course.id}>
                        <CourseCard course={course} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    还没有加入课程，去课程库选择合适的内容开始学习吧。
                  </Typography>
                )}
              </SectionCard>

              <SectionCard title="巩固练习" subtitle="针对薄弱环节的专项训练。">
                {practiceSets.length > 0 ? (
                  <Grid container spacing={3}>
                    {practiceSets.map((practice) => (
                      <Grid item xs={12} md={4} key={practice.id}>
                        <PracticeCard practice={practice} />
                      </Grid>
                    ))}
                  </Grid>
                ) : (
                  <Typography variant="body2" color="text.secondary">
                    暂无推荐的练习集，完成诊断后将生成专属训练。
                  </Typography>
                )}
              </SectionCard>

              <SectionCard
                title="复试冲刺资料区"
                subtitle="按分数段挑选自我介绍、专业课与英语复盘三大工具，快速进入复试状态。"
              >
                <Grid container spacing={3}>
                  {retakeResources.map((resource) => (
                    <Grid item xs={12} md={4} key={resource.title}>
                      <Paper
                        elevation={0}
                        sx={{
                          p: 3,
                          borderRadius: 3,
                          height: '100%',
                          border: '1px solid',
                          borderColor: 'divider',
                          background: 'rgba(255,255,255,0.8)',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: 2,
                        }}
                      >
                        <Box sx={{ width: 56, height: 56, borderRadius: 3, display: 'grid', placeItems: 'center', bgcolor: 'background.default' }}>
                          {resource.icon}
                        </Box>
                        <Stack spacing={1} sx={{ flexGrow: 1 }}>
                          <Typography variant="subtitle1" fontWeight={600}>
                            {resource.title}
                          </Typography>
                          <Typography variant="body2" color="text.secondary">
                            {resource.description}
                          </Typography>
                        </Stack>
                        <Button
                          variant="contained"
                          endIcon={<ArrowForwardIcon />}
                          component={RouterLink}
                          to={resource.to}
                          sx={{ alignSelf: 'flex-start', borderRadius: 999 }}
                        >
                          查看详情
                        </Button>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              </SectionCard>

              <SectionCard title="学习日程" subtitle="按照计划推进，提高执行效率。">
                <ScheduleTimeline items={schedule} variant="plain" />
              </SectionCard>

              <SectionCard
                title="智能院校推荐"
                subtitle="输入初试总分，系统将结合院校分数线生成冲刺、稳妥、保底组合，并给出复试准备路线。"
              >
                <UniversityAdvisorPanel />
              </SectionCard>

              <SectionCard title="今日学习建议" subtitle="根据你的刷题记录与日程生成。">
                <Stack
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={2}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                >
                  <Box
                    sx={{
                      width: 56,
                      height: 56,
                      borderRadius: '50%',
                      background: 'linear-gradient(145deg, rgba(255,193,7,0.25), rgba(255,152,0,0.35))',
                      display: 'grid',
                      placeItems: 'center',
                      color: 'warning.dark',
                    }}
                  >
                    <TipsAndUpdatesIcon />
                  </Box>
                  <Typography variant="body1" color="text.secondary" sx={{ lineHeight: 1.8 }}>
                    {recommendation}
                  </Typography>
                </Stack>
              </SectionCard>
            </Stack>
          )}
        </Stack>
      </Container>
    </Box>
  );
};

export default Home;
