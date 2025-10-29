import {
  Avatar,
  Box,
  Chip,
  LinearProgress,
  Paper,
  Stack,
  Typography,
  useTheme,
} from '@mui/material';
import PlayArrowIcon from '@mui/icons-material/PlayArrow';
import type { CourseProgress } from '../data/dashboard';

interface CourseCardProps {
  course: CourseProgress;
}

const CourseCard = ({ course }: CourseCardProps) => {
  const theme = useTheme();
  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>{course.title.charAt(0)}</Avatar>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {course.title}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {course.teacher} · {course.category}
          </Typography>
        </Box>
        <Chip label={course.progress >= 60 ? '进阶中' : '打基础'} color="primary" variant="outlined" sx={{ ml: 'auto' }} />
      </Stack>
      <Box>
        <Typography variant="body2" color="text.secondary">
          下一个任务
        </Typography>
        <Typography variant="body1" mt={0.5}>
          {course.nextTask}
        </Typography>
      </Box>
      <Box>
        <Stack direction="row" alignItems="center" spacing={1} mb={1}>
          <PlayArrowIcon fontSize="small" color="primary" />
          <Typography variant="body2" color="text.secondary">
            学习进度
          </Typography>
          <Typography variant="body2" fontWeight={600}>
            {course.progress}%
          </Typography>
        </Stack>
        <LinearProgress variant="determinate" value={course.progress} sx={{ borderRadius: 999 }} />
      </Box>
    </Paper>
  );
};

export default CourseCard;
