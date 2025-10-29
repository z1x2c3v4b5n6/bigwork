import { Box, Chip, Paper, Stack, Typography } from '@mui/material';
import QuizIcon from '@mui/icons-material/Quiz';
import TrendingUpIcon from '@mui/icons-material/TrendingUp';
import type { PracticeSet } from '../data/dashboard';
import dayjs from 'dayjs';

interface PracticeCardProps {
  practice: PracticeSet;
}

const PracticeCard = ({ practice }: PracticeCardProps) => {
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
            题量：{practice.questions} · 最近一次 {dayjs(practice.lastAttempt).format('MM月DD日')}
          </Typography>
        </Box>
        <Chip
          label={`正确率 ${(practice.accuracy * 100).toFixed(0)}%`}
          icon={<TrendingUpIcon />}
          color={practice.accuracy > 0.75 ? 'success' : practice.accuracy > 0.6 ? 'warning' : 'default'}
          sx={{ ml: 'auto' }}
        />
      </Stack>
      <Typography variant="body2" color="text.secondary">
        建议：针对错题进行归类整理，强化薄弱环节。
      </Typography>
    </Paper>
  );
};

export default PracticeCard;
