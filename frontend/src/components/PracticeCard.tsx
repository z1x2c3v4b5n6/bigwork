import { Box, Chip, Divider, Paper, Stack, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import SchoolIcon from '@mui/icons-material/School';
import type { PracticeSet } from '../data/dashboard';
import dayjs from 'dayjs';

interface PracticeCardProps {
  practice: PracticeSet;
}

const PracticeCard = ({ practice }: PracticeCardProps) => {
  const lastAttempt = practice.lastAttempt ? dayjs(practice.lastAttempt).format('MM月DD日 HH:mm') : '待开始';
  const accuracyPercent = Number.isFinite(practice.accuracy)
    ? Math.round(practice.accuracy * 100)
    : 0;

  return (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        border: '1px solid',
        borderColor: 'divider',
        display: 'flex',
        flexDirection: 'column',
        gap: 2,
      }}
    >
      <Stack direction="row" spacing={2} alignItems="center">
        <Box sx={{ bgcolor: 'secondary.light', color: 'secondary.main', p: 1, borderRadius: 2 }}>
          <QuizIcon />
        </Box>
        <Box>
          <Typography variant="subtitle1" fontWeight={600}>
            {practice.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            题量：{practice.questions} · 最近一次 {lastAttempt}
          </Typography>
        </Box>
        <Chip
          label={`正确率 ${accuracyPercent}%`}
          icon={<TrendingUpIcon />}
          color={practice.accuracy > 0.75 ? 'success' : practice.accuracy > 0.6 ? 'warning' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Stack>
      <Stack direction="row" spacing={1} alignItems="center">
        <SchoolIcon color="primary" fontSize="small" />
        <Typography variant="body2" color="text.secondary">
          {practice.focus ?? '建议针对错题进行归类整理，强化薄弱环节。'}
        </Typography>
      </Stack>
      <Stack direction="row" spacing={1}>
        {practice.difficulty && <Chip label={practice.difficulty} size="small" color="primary" variant="outlined" />}
        {practice.source && <Chip label={practice.source} size="small" variant="outlined" />}
        {practice.duration && <Chip label={`${practice.duration} 分钟`} size="small" variant="outlined" />}
        {practice.latestScore != null && <Chip label={`上次得分 ${practice.latestScore}`} size="small" variant="outlined" />}
      </Stack>
      {practice.latestSummary && (
        <>
          <Divider />
          <Typography variant="body2" color="text.secondary">
            {practice.latestSummary}
          </Typography>
        </>
      )}
    </Paper>
  );
};

export default PracticeCard;
