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
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(25,118,210,0.14)',
        background: 'linear-gradient(135deg, rgba(227,242,253,0.9), rgba(250,250,255,0.86))',
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
        boxShadow: '0 22px 60px rgba(15, 23, 42, 0.08)',
        transition: 'transform 0.3s ease, box-shadow 0.3s ease',
        '&:hover': {
          transform: 'translateY(-6px)',
          boxShadow: '0 30px 80px rgba(15, 23, 42, 0.12)',
        },
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Avatar
          sx={{
            bgcolor: theme.palette.primary.main,
            background: `linear-gradient(145deg, ${theme.palette.primary.main}, ${theme.palette.secondary.main})`,
            color: '#fff',
          }}
        >
          {course.title.charAt(0)}
        </Avatar>
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
      <Box sx={{
        p: 2,
        borderRadius: 3,
        background: 'rgba(255,255,255,0.6)',
        border: '1px dashed rgba(25,118,210,0.2)',
      }}>
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
