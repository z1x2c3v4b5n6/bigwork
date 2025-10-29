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
                      讲师：{draft.teacher} · 状态：{draft.status === 'published' ? '已发布' : '待发布'} · {draft.releaseWindow ?? '待排期'}
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
        </>
      )}
    </Stack>
  );
};

export default Home;
