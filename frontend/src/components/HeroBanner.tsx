import { Box, Button, Chip, Paper, Stack, Typography } from '@mui/material';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import CalendarMonthIcon from '@mui/icons-material/CalendarMonth';
import { Link as RouterLink } from 'react-router-dom';

interface HeroBannerProps {
  greeting: string;
  userName: string;
  onCheckIn?: () => void;
  checkedIn?: boolean;
  nextStepLabel?: string;
  nextStepLink?: string;
}

const HeroBanner = ({ greeting, userName, onCheckIn, checkedIn, nextStepLabel, nextStepLink }: HeroBannerProps) => {
  return (
    <Paper
      elevation={0}
      sx={{
        position: 'relative',
        overflow: 'hidden',
        borderRadius: 4,
        background: 'linear-gradient(135deg, #1976d2, #42a5f5)',
        color: 'common.white',
        px: { xs: 3, md: 6 },
        py: { xs: 4, md: 6 },
      }}
    >
      <Stack direction={{ xs: 'column', md: 'row' }} spacing={4} alignItems="center">
        <Box sx={{ flex: 1 }}>
          <Typography variant="overline" fontWeight={600} letterSpacing={2}>
            2025 考研冲刺 · 高效学习系统
          </Typography>
          <Typography variant="h4" fontWeight={700} mt={1}>
            {greeting}，{userName}
          </Typography>
          <Typography variant="body1" mt={2} sx={{ maxWidth: 480 }}>
            我们根据你的复习进度生成了今日学习计划，集中突破重难点，并同步更新错题回顾清单。
          </Typography>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} mt={4}>
            <Button
              variant="contained"
              color="secondary"
              startIcon={<RocketLaunchIcon />}
              size="large"
              component={RouterLink}
              to="/practice"
            >
              开始今日计划
            </Button>
            <Button
              variant="outlined"
              color="inherit"
              startIcon={<CalendarMonthIcon />}
              size="large"
              component={RouterLink}
              to="/schedule"
            >
              查看一周安排
            </Button>
            {nextStepLabel && nextStepLink ? (
              <Button
                variant="outlined"
                color="inherit"
                endIcon={<RocketLaunchIcon />}
                component={RouterLink}
                to={nextStepLink}
              >
                {nextStepLabel}
              </Button>
            ) : null}
          </Stack>
        </Box>
        <Box
          sx={{
            flex: 1,
            display: 'grid',
            placeItems: 'center',
            bgcolor: 'rgba(255,255,255,0.1)',
            borderRadius: 4,
            p: 4,
            minHeight: 220,
          }}
        >
          <Typography variant="h6" fontWeight={600}>
            今日目标
          </Typography>
          <Stack direction="row" spacing={1} alignItems="center" mt={1}>
            <Button
              variant={checkedIn ? 'outlined' : 'contained'}
              color="secondary"
              size="small"
              onClick={onCheckIn}
              disabled={checkedIn}
              sx={{ borderRadius: 999 }}
            >
              {checkedIn ? '已完成今日学习' : '完成今日学习'}
            </Button>
            {checkedIn ? <Chip label="今日已打卡" color="success" size="small" /> : null}
          </Stack>
          <Typography variant="body1" mt={2}>
            · 完成 2 讲数学高频题精练
          </Typography>
          <Typography variant="body1">· 回顾昨日错题 15 题</Typography>
          <Typography variant="body1">· 晚间进行英语完形填空专项测试</Typography>
        </Box>
      </Stack>
    </Paper>
  );
};

export default HeroBanner;
