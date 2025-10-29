import { Grid, Stack, Typography } from '@mui/material';
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
import { courseProgressData, practiceSets, schedule } from '../data/dashboard';

const Home = () => {
  const greeting = useGreeting();

  return (
    <Stack spacing={4}>
      <HeroBanner greeting={greeting} userName="张同学" />

      <Grid container spacing={3}>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="本周学习时长"
            value="26.5 小时"
            helperText="比上周提升 12%"
            icon={<AccessTimeIcon fontSize="inherit" />}
            accent="rgba(25, 118, 210, 0.2)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="累计刷题"
            value="860 题"
            helperText="连续 12 天完成每日计划"
            icon={<QuizIcon fontSize="inherit" />}
            accent="rgba(255, 112, 67, 0.25)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="重点突破课"
            value="8 门"
            helperText="新上线 2 门冲刺小班"
            icon={<SchoolIcon fontSize="inherit" />}
            accent="rgba(102, 187, 106, 0.25)"
          />
        </Grid>
        <Grid item xs={12} sm={6} md={3}>
          <StatCard
            title="阶段模考排名"
            value="TOP 12%"
            helperText="保持冲刺节奏，继续巩固弱项"
            icon={<EmojiEventsIcon fontSize="inherit" />}
            accent="rgba(255, 213, 79, 0.35)"
          />
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        {courseProgressData.map((course) => (
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
          结合你的练习记录，建议本周重点回顾线性代数特征值章节，并安排一次政治时事热点速记。周末尝试进行一次 3 小时完整模拟，提前适应考试节奏。
        </Typography>
      </Stack>
    </Stack>
  );
};

export default Home;
