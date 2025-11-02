import { useMemo } from 'react';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
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
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import PracticeCard from '../components/PracticeCard';
import ScheduleTimeline from '../components/ScheduleTimeline';
import useGreeting from '../hooks/useGreeting';
import useDashboardData from '../hooks/useDashboardData';
import { useAuth } from '../context/AuthContext';

const statIconMap: Record<string, JSX.Element> = {
  studyTime: <AccessTimeIcon fontSize="inherit" />,
  questionDrill: <QuizIcon fontSize="inherit" />,
  courseFocus: <SchoolIcon fontSize="inherit" />,
  mockRank: <EmojiEventsIcon fontSize="inherit" />,
};

const Home = () => {
  const greeting = useGreeting();
  const { user } = useAuth();
  const { data, isFetching, isError, refetch } = useDashboardData(user);
  const isAdmin = user?.role === 'admin';

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

  const recommendedMajors = useMemo(
    () => [
      { name: '计算机科学与技术', highlights: '算法 + 工程双线进阶，配套竞赛真题与项目复盘。' },
      { name: '电子信息', highlights: '信号分析、集成电路、自动化控制全链路复习路径。' },
      { name: '临床医学', highlights: '系统梳理生理病理与临床案例，强化诊断思维。' },
    ],
    [],
  );

  const recommendedUniversities = useMemo(
    () => [
      { name: '北京大学', tags: ['信息科学', '新闻传播', '法学发展'] },
      { name: '上海交通大学', tags: ['人工智能', '生物医学工程', '管理科学'] },
      { name: '中山大学', tags: ['药学突破', '公共管理', '外国语言'] },
    ],
    [],
  );

  const englishTrainingIdeas = useMemo(
    () => [
      { title: '长难句拆解', detail: '每日精读 2 段真题长难句，标注主干与从句结构。' },
      { title: '口语跟读', detail: '选取听力材料进行 10 分钟跟读，录音对比纠音。' },
      { title: '词汇巩固', detail: '结合艾宾浩斯曲线复习昨日背诵的 30 个核心词汇。' },
    ],
    [],
  );

  return (
    <Stack spacing={4}>
      {isFetching && <LinearProgress />}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              重新获取
            </Button>
          }
        >
          暂时无法从后端加载最新看板数据，以下展示的是内置示例数据。
        </Alert>
      )}

      <HeroBanner greeting={greeting} userName={userName} />

      {isAdmin ? (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            {stats.map((stat) => (
              <Grid item xs={12} md={3} key={stat.id}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      <Box sx={{ color: 'primary.main' }}>{statIconMap[stat.id] ?? <TrendingUpIcon />}</Box>
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {stat.title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {stat.value}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {stat.helperText}
                    </Typography>
                  </Stack>
                </Paper>
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }}>
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    待发布课程
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    快速查看尚未上线的课程草稿并完成确认。
                  </Typography>
                </Box>
                <Chip label={`待发布 ${courseDrafts.length} 门`} color="warning" variant="outlined" />
              </Stack>
              <Divider />
              <Stack spacing={2}>
                {courseDrafts.map((draft) => (
                  <Box key={draft.id}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {draft.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      讲师：{draft.teacher ?? '待补充'} · 专业：{draft.majorName ?? '未指定'} · 学分：
                      {draft.credit != null ? draft.credit : '待定'}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {draft.description ?? '课程简介尚未完善，建议补充课程亮点与适合人群。'}
                    </Typography>
                  </Box>
                ))}
                {courseDrafts.length === 0 && (
                  <Typography variant="body2" color="text.secondary">
                    当前没有待发布课程。
                  </Typography>
                )}
              </Stack>
            </Stack>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  待处理圈子反馈
                </Typography>
                <Stack spacing={2}>
                  {reviewQueue.map((item) => (
                    <Box key={item.id}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {item.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {item.content}
                      </Typography>
                    </Box>
                  ))}
                  {reviewQueue.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      没有待审核的圈子内容。
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
            <Grid item xs={12} md={6}>
              <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Typography variant="h6" fontWeight={600} mb={2}>
                  最新学员
                </Typography>
                <Stack spacing={2}>
                  {recentRegistrations.map((item) => (
                    <Stack key={item.id} direction="row" justifyContent="space-between" alignItems="center">
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
                  {recentRegistrations.length === 0 && (
                    <Typography variant="body2" color="text.secondary">
                      暂无新的学员注册。
                    </Typography>
                  )}
                </Stack>
              </Paper>
            </Grid>
          </Grid>

          {adminFocus?.dataQuality && (
            <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="h6" fontWeight={600} mb={2}>
                数据总览
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                <Chip label={`专业 ${adminFocus.dataQuality.majors}`} />
                <Chip label={`题库 ${adminFocus.dataQuality.practiceSets}`} />
                <Chip label={`圈子 ${adminFocus.dataQuality.forumTopics}`} />
              </Stack>
            </Paper>
          )}
        </Stack>
      ) : (
        <>
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

          <Grid container spacing={3}>
            {courses.map((course) => (
              <Grid item xs={12} md={4} key={course.id}>
                <CourseCard course={course} />
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            {practiceSets.map((practice) => (
              <Grid item xs={12} md={4} key={practice.id}>
                <PracticeCard practice={practice} />
              </Grid>
            ))}
          </Grid>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              学习日程
            </Typography>
            <ScheduleTimeline items={schedule} />
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              今日学习建议
            </Typography>
            <Typography variant="body1" color="text.secondary">
              {recommendation}
            </Typography>
          </Paper>

          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(103,155,255,0.18), rgba(187,222,251,0.35))',
                  border: '1px solid rgba(79,119,227,0.2)',
                  height: '100%',
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  热门专业推荐
                </Typography>
                <Stack spacing={2}>
                  {recommendedMajors.map((major) => (
                    <Box key={major.name}>
                      <Typography variant="subtitle1" fontWeight={600}>
                        {major.name}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {major.highlights}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12} md={6}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(0,184,170,0.16), rgba(128,222,234,0.35))',
                  border: '1px solid rgba(0,171,178,0.2)',
                  height: '100%',
                }}
              >
                <Typography variant="h6" fontWeight={700} mb={2}>
                  目标院校灵感
                </Typography>
                <Stack spacing={2}>
                  {recommendedUniversities.map((university) => (
                    <Box key={university.name}>
                      <Stack direction="row" justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" fontWeight={600}>
                          {university.name}
                        </Typography>
                        <Chip label="Hot" color="primary" variant="outlined" size="small" />
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {university.tags.join(' · ')}
                      </Typography>
                    </Box>
                  ))}
                </Stack>
              </Paper>
            </Grid>

            <Grid item xs={12}>
              <Paper
                elevation={0}
                sx={{
                  p: 4,
                  borderRadius: 3,
                  background: 'linear-gradient(135deg, rgba(123,97,255,0.16), rgba(206,147,216,0.3))',
                  border: '1px solid rgba(123,97,255,0.25)',
                }}
              >
                <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" spacing={3}>
                  <Box>
                    <Typography variant="h6" fontWeight={700}>
                      英语专项提升
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      结合每日计划分解词汇、语法、听说读写练习，打造英语高分闭环。
                    </Typography>
                  </Box>
                  <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                    {englishTrainingIdeas.map((idea) => (
                      <Paper
                        key={idea.title}
                        elevation={0}
                        sx={{ p: 3, borderRadius: 2, backgroundColor: 'rgba(255,255,255,0.72)', minWidth: 200 }}
                      >
                        <Typography variant="subtitle1" fontWeight={600}>
                          {idea.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {idea.detail}
                        </Typography>
                      </Paper>
                    ))}
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          </Grid>
        </>
      )}
    </Stack>
  );
};

export default Home;
