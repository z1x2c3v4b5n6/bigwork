import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import dayjs from 'dayjs';
import { FormEvent, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import learningService, { ScheduleEntry } from '../services/learningService';

const Schedule = () => {
  const queryClient = useQueryClient();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [type, setType] = useState('自习');
  const [start, setStart] = useState('');
  const [end, setEnd] = useState('');
  const [location, setLocation] = useState('');
  const [allDay, setAllDay] = useState(false);

  const {
    data: schedule = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<ScheduleEntry[]>({
    queryKey: ['learning-schedule'],
    queryFn: learningService.fetchSchedule,
  });

  const createScheduleMutation = useMutation({
    mutationFn: learningService.createScheduleEntry,
    onSuccess: async () => {
      setTitle('');
      setType('自习');
      setStart('');
      setEnd('');
      setLocation('');
      setAllDay(false);
      await queryClient.invalidateQueries({ queryKey: ['learning-schedule'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '创建日程失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const handleCreateSchedule = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim() || !start || !end) {
      setErrorMessage('请填写日程标题、开始时间与结束时间');
      return;
    }

    await createScheduleMutation.mutateAsync({
      title: title.trim(),
      type: type.trim() || '自习',
      start,
      end,
      allDay,
      location: location.trim() || undefined,
    });
  };

  return (
    <Stack spacing={4}>
      {(isLoading || createScheduleMutation.isPending) && <LinearProgress color="secondary" />}
      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 280 }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              本周任务清单
            </Typography>
            <List>
              {schedule.length === 0 ? (
                <ListItem sx={{ borderRadius: 2 }}>
                  <ListItemText primary="暂未记录日程，欢迎在右侧快速添加学习计划。" />
                </ListItem>
              ) : (
                schedule.map((item) => (
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
                ))
              )}
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

            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2} component="form" onSubmit={handleCreateSchedule}>
                <Typography variant="subtitle1" fontWeight={600}>
                  快速添加日程
                </Typography>
                <TextField label="日程标题" value={title} onChange={(event) => setTitle(event.target.value)} required />
                <TextField label="日程类型" value={type} onChange={(event) => setType(event.target.value)} />
                <TextField
                  label="开始时间"
                  type="datetime-local"
                  value={start}
                  onChange={(event) => setStart(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField
                  label="结束时间"
                  type="datetime-local"
                  value={end}
                  onChange={(event) => setEnd(event.target.value)}
                  InputLabelProps={{ shrink: true }}
                  required
                />
                <TextField label="学习地点（可选）" value={location} onChange={(event) => setLocation(event.target.value)} />
                <FormControlLabel
                  control={<Switch checked={allDay} onChange={(event) => setAllDay(event.target.checked)} />}
                  label="全天任务"
                />
                <Button type="submit" variant="contained" disabled={createScheduleMutation.isPending}>
                  {createScheduleMutation.isPending ? '保存中…' : '保存日程'}
                </Button>
              </Stack>
            </Paper>
          </Stack>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Schedule;
