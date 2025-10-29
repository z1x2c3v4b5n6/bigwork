import { Alert, Box, Button, Chip, Divider, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import GroupIcon from '@mui/icons-material/Group';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import UpdateIcon from '@mui/icons-material/Update';
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import PracticeCard from '../components/PracticeCard';
import ScheduleTimeline from '../components/ScheduleTimeline';
import useGreeting from '../hooks/useGreeting';
import useDashboardData from '../hooks/useDashboardData';
import type { DashboardStatId } from '../data/dashboard';
import { useAuth } from '../context/AuthContext';

const statIconMap: Record<DashboardStatId, JSX.Element> = {
  studyTime: <AccessTimeIcon fontSize="inherit" />,
  questionDrill: <QuizIcon fontSize="inherit" />,
  courseFocus: <SchoolIcon fontSize="inherit" />,
  mockRank: <EmojiEventsIcon fontSize="inherit" />,
};

const Home = () => {
  const greeting = useGreeting();
  const { data, isFetching, isError, refetch } = useDashboardData();
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const stats = data?.stats ?? [];
  const courses = data?.courses ?? [];
  const practiceSets = data?.practiceSets ?? [];
  const schedule = data?.schedule ?? [];
  const recommendation = data?.recommendation ?? '';
  const userName = data?.userName ?? '同学';

  const adminSnapshots = [
    {
      title: '本周活跃学员',
      value: '1,280',
      helper: '较上周提升 12%',
      icon: <GroupIcon color="primary" />,
    },
    {
      title: '题单通过率',
      value: '87%',
      helper: 'AI 评估一致率 93%',
      icon: <TrendingUpIcon color="success" />,
    },
    {
      title: '最新课程更新',
      value: '16 节',
      helper: '包含 3 门冲刺班新增',
      icon: <UpdateIcon color="secondary" />,
    },
  ];

  const adminAnnouncements = [
    {
      title: '英语写作密训营脚本提交完成',
      detail: '等待你确认示例题点评语，预计周五上线。',
    },
    {
      title: '数学冲刺题库 AI 校验完成',
      detail: '共修正 42 道题解析，建议安排复盘直播课。',
    },
  ];

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

      <HeroBanner greeting={greeting} userName={user?.name ?? userName} />

      {isAdmin ? (
        <Stack spacing={4}>
          <Grid container spacing={3}>
            {adminSnapshots.map((item) => (
              <Grid item xs={12} md={4} key={item.title}>
                <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                  <Stack spacing={1}>
                    <Stack direction="row" spacing={2} alignItems="center">
                      {item.icon}
                      <Box>
                        <Typography variant="subtitle2" color="text.secondary">
                          {item.title}
                        </Typography>
                        <Typography variant="h5" fontWeight={700}>
                          {item.value}
                        </Typography>
                      </Box>
                    </Stack>
                    <Typography variant="body2" color="text.secondary">
                      {item.helper}
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
                    今日需要关注的事项
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    根据 AI 监控结果挑选出的重点待办，完成后会同步至管理面板。
                  </Typography>
                </Box>
                <Chip label="已同步后端" color="success" variant="outlined" />
              </Stack>
              <Divider />
              <Stack spacing={2}>
                {adminAnnouncements.map((item) => (
                  <Box key={item.title}>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {item.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {item.detail}
                    </Typography>
                  </Box>
                ))}
              </Stack>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={600}>
                学员分层跟进建议
              </Typography>
              <Grid container spacing={3}>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      高分冲刺组
                    </Typography>
                    <Typography variant="body1">推荐发布数学冲刺题单第 6 期，并安排周末答疑。</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12} md={6}>
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      稳步提升组
                    </Typography>
                    <Typography variant="body1">建议布置英语写作范文精讲，并督促提交周报。</Typography>
                  </Stack>
                </Grid>
                <Grid item xs={12}>
                  <Alert severity="info">
                    已为你生成《管理员周报》草稿，可在“教研管理”页面一键导出并发给团队。
                  </Alert>
                </Grid>
              </Grid>
            </Stack>
          </Paper>
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
            <Grid item xs={12} md={6}>
              <Stack spacing={3}>
                {practiceSets.map((practice) => (
                  <PracticeCard key={practice.id} practice={practice} />
                ))}
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <ScheduleTimeline items={schedule} />
            </Grid>
          </Grid>

          <Stack spacing={2}>
            <Typography variant="h6">备考锦囊</Typography>
            <Typography variant="body1" color="text.secondary">
              {recommendation}
            </Typography>
          </Stack>
        </>
      )}
    </Stack>
  );
};

export default Home;
