import { Alert, Box, Button, Chip, Grid, LinearProgress, Paper, Stack, Typography } from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import FlagIcon from '@mui/icons-material/Flag';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import useDashboardData from '../hooks/useDashboardData';

const Practice = () => {
  const { data, isFetching, isError, refetch } = useDashboardData();
  const practiceSets = data?.practiceSets ?? [];

  return (
    <Stack spacing={4}>
      {isFetching && <LinearProgress color="secondary" />}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              重试
            </Button>
          }
        >
          刷题数据暂时不可用，当前为示例内容。
        </Alert>
      )}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          刷题训练营
        </Typography>
        <Typography variant="body1" color="text.secondary">
          自适应刷题系统会根据你的错题记录与掌握度调整题目难度，帮助你高效夯实薄弱环节。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {practiceSets.map((practice) => (
          <Grid item xs={12} md={4} key={practice.id}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {practice.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    题量 {practice.questions} · 正确率 {(practice.accuracy * 100).toFixed(0)}%
                  </Typography>
                </Box>
                <LinearProgress variant="determinate" value={practice.accuracy * 100} sx={{ borderRadius: 999 }} />
                <Stack direction="row" spacing={1}>
                  <Chip label="智能组卷" color="primary" variant="outlined" />
                  <Chip label="错题回顾" color="secondary" variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" startIcon={<TimerIcon />} fullWidth>
                    30 分钟冲刺
                  </Button>
                  <Button variant="outlined" startIcon={<FlagIcon />} fullWidth>
                    攻克考点
                  </Button>
                </Stack>
                <Button startIcon={<RestartAltIcon />} color="inherit">
                  重新练习该套题
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(120deg, #fff8e1, #ffe0b2)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              AI 自适应训练
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              系统自动识别薄弱知识点，为你分配分层练习题单，并实时评估掌握度。
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" color="secondary">
              创建专项训练
            </Button>
            <Button variant="outlined" color="inherit">
              查看错题诊断
            </Button>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default Practice;
