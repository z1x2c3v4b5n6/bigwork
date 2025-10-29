import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import dayjs from 'dayjs';
import useDashboardData from '../hooks/useDashboardData';

const Schedule = () => {
  const { data, isFetching, isError, refetch } = useDashboardData();
  const schedule = data?.schedule ?? [];

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
          暂时无法同步后端日程，以下为示例计划。
        </Alert>
      )}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          学习日程
        </Typography>
        <Typography variant="body1" color="text.secondary">
          通过日程规划实现复习节奏可视化，可同步导入日历并设置番茄钟提醒。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              本周任务清单
            </Typography>
            <List>
              {schedule.map((item) => (
                <ListItem key={item.id} sx={{ borderRadius: 2, mb: 1 }}>
                  <ListItemIcon>
                    <AccessTimeFilledIcon color="primary" />
                  </ListItemIcon>
                  <ListItemText
                    primary={item.title}
                    secondary={`${dayjs(item.start).format('MM月DD日 HH:mm')} - ${dayjs(item.end).format('HH:mm')}`}
                  />
                  <Chip label={item.type} color="primary" variant="outlined" />
                </ListItem>
              ))}
            </List>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Stack spacing={3}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Typography variant="subtitle1" fontWeight={600}>
                番茄学习法
              </Typography>
              <Typography variant="body2" color="text.secondary" mt={1}>
                推荐每日 6 组番茄钟（25min 学习 + 5min 休息），系统将自动记录专注时长并生成效率报告。
              </Typography>
              <Chip label="今日已完成 4 组" color="success" variant="outlined" sx={{ mt: 2 }} />
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  晚间复盘清单
                </Typography>
                <Divider />
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleIcon color="primary" />
                  <Typography variant="body2">回顾今日错题 15 题</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleIcon color="primary" />
                  <Typography variant="body2">总结英语作文素材 5 个</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <CheckCircleIcon color="primary" />
                  <Typography variant="body2">规划明日复习重点</Typography>
                </Stack>
              </Stack>
            </Paper>

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Typography variant="subtitle1" fontWeight={600}>
                  智能提醒
                </Typography>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AlarmOnIcon color="secondary" />
                  <Typography variant="body2">直播课前 15 分钟推送通知至手机</Typography>
                </Stack>
                <Stack direction="row" spacing={1} alignItems="center">
                  <AlarmOnIcon color="secondary" />
                  <Typography variant="body2">每日 22:30 提醒整理错题</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Schedule;
