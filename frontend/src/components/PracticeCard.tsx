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
        borderRadius: 4,
        border: '1px solid',
        borderColor: 'rgba(25,118,210,0.14)',
        background: 'linear-gradient(135deg, rgba(245,245,255,0.95), rgba(232,245,253,0.82))',
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
        <Box
          sx={{
            background: 'linear-gradient(145deg, rgba(94,53,177,0.2), rgba(123,31,162,0.25))',
            color: 'secondary.main',
            p: 1,
            borderRadius: 2,
            border: '1px solid rgba(123,31,162,0.2)',
          }}
        >
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
      <Stack
        direction="row"
        spacing={1}
        alignItems="center"
        sx={{
          p: 1.5,
          borderRadius: 3,
          background: 'rgba(255,255,255,0.6)',
          border: '1px dashed rgba(94,53,177,0.24)',
        }}
      >
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
