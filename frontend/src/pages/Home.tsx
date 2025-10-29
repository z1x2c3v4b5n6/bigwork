import { Alert, Button, Grid, LinearProgress, Stack, Typography } from '@mui/material';
import SchoolIcon from '@mui/icons-material/School';
import QuizIcon from '@mui/icons-material/Quiz';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import AccessTimeIcon from '@mui/icons-material/AccessTime';
import HeroBanner from '../components/HeroBanner';
import StatCard from '../components/StatCard';
import CourseCard from '../components/CourseCard';
import PracticeCard from '../components/PracticeCard';
import ScheduleTimeline from '../components/ScheduleTimeline';
import useGreeting from '../hooks/useGreeting';
import useDashboardData from '../hooks/useDashboardData';
import type { DashboardStatId } from '../data/dashboard';

const statIconMap: Record<DashboardStatId, JSX.Element> = {
  studyTime: <AccessTimeIcon fontSize="inherit" />,
  questionDrill: <QuizIcon fontSize="inherit" />,
  courseFocus: <SchoolIcon fontSize="inherit" />,
  mockRank: <EmojiEventsIcon fontSize="inherit" />,
};

const Home = () => {
  const greeting = useGreeting();
  const { data, isFetching, isError, refetch } = useDashboardData();

  const stats = data?.stats ?? [];
  const courses = data?.courses ?? [];
  const practiceSets = data?.practiceSets ?? [];
  const schedule = data?.schedule ?? [];
  const recommendation = data?.recommendation ?? '';
  const userName = data?.userName ?? '同学';

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
    </Stack>
  );
};

export default Home;
