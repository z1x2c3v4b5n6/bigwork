import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  FormControlLabel,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Switch,
  TextField,
  Typography,
} from '@mui/material';
import AccessTimeFilledIcon from '@mui/icons-material/AccessTimeFilled';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import AlarmOnIcon from '@mui/icons-material/AlarmOn';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import EventAvailableIcon from '@mui/icons-material/EventAvailable';
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

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            学习日程
          </Typography>
          <Typography variant="body1" color="text.secondary">
            通过日程规划实现复习节奏可视化，可同步导入日历并设置番茄钟提醒。
          </Typography>
        </Box>
        <Button startIcon={<AddCircleIcon />} variant="contained" onClick={() => setDialogOpen(true)}>
          新增学习安排
        </Button>
      </Stack>

      {successMessage && (
        <Alert severity="success" onClose={() => setSuccessMessage(null)}>
          {successMessage}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                本周规划总时长
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {totalHours} 小时
              </Typography>
              <Typography variant="body2" color="text.secondary">
                包含直播课、自习与模拟考，自动同步到番茄钟节奏。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                自习安排
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {focusCount} 场
              </Typography>
              <Typography variant="body2" color="text.secondary">
                系统将自动提醒复盘错题并生成学习日志。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                直播课程
              </Typography>
              <Typography variant="h4" fontWeight={700}>
                {liveSessions} 节
              </Typography>
              <Typography variant="body2" color="text.secondary">
                建议课前 15 分钟预习大纲，确保课堂吸收度。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                下一场安排
              </Typography>
              {upcomingEvent ? (
                <>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {upcomingEvent.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {dayjs(upcomingEvent.start).format('MM月DD日 HH:mm')} · {upcomingEvent.type}
                  </Typography>
                  {upcomingEvent.focus && (
                    <Typography variant="body2" color="text.secondary">
                      重点：{upcomingEvent.focus}
                    </Typography>
                  )}
                  <Stack direction="row" spacing={1} flexWrap="wrap">
                    {(upcomingEvent.tags ?? []).map((tag) => (
                      <Chip key={tag} label={tag} size="small" />
                    ))}
                  </Stack>
                </>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  暂无未来 24 小时内的学习安排，可在右上角添加新的日程。
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={600}>
                高频标签与复习主题
              </Typography>
              {tagFrequency.length > 0 ? (
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {tagFrequency.map(([tag, count]) => (
                    <Chip key={tag} label={`${tag} ×${count}`} color="primary" variant="outlined" />
                  ))}
                </Stack>
              ) : (
                <Typography variant="body2" color="text.secondary">
                  还没有打标签的日程，添加标签可获得更精准的学习建议。
                </Typography>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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

      <ScheduleTimeline items={timelineItems} />

      <Dialog open={isDialogOpen} onClose={() => setDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>新增学习安排</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="事件名称"
              value={formState.title}
              onChange={(event) => setFormState((prev) => ({ ...prev, title: event.target.value }))}
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="日期"
                type="date"
                value={formState.date}
                onChange={(event) => setFormState((prev) => ({ ...prev, date: event.target.value }))}
                fullWidth
              />
              <TextField
                label="开始时间"
                type="time"
                value={formState.startTime}
                onChange={(event) => setFormState((prev) => ({ ...prev, startTime: event.target.value }))}
                fullWidth
              />
              <TextField
                label="结束时间"
                type="time"
                value={formState.endTime}
                onChange={(event) => setFormState((prev) => ({ ...prev, endTime: event.target.value }))}
                fullWidth
              />
            </Stack>
            <TextField
              label="地点（可选）"
              value={formState.location}
              onChange={(event) => setFormState((prev) => ({ ...prev, location: event.target.value }))}
            />
            <TextField
              label="重点内容"
              value={formState.focus}
              onChange={(event) => setFormState((prev) => ({ ...prev, focus: event.target.value }))}
            />
            <TextField
              label="标签（逗号分隔）"
              value={formState.tags}
              onChange={(event) => setFormState((prev) => ({ ...prev, tags: event.target.value }))}
              helperText="可用于筛选：如 晚自习,英语"
            />
            <TextField
              label="事件类型"
              value={formState.type}
              select
              onChange={(event) =>
                setFormState((prev) => ({ ...prev, type: event.target.value as ScheduleItem['type'] }))
              }
            >
              <MenuItem value="自习">自习</MenuItem>
              <MenuItem value="直播课">直播课</MenuItem>
              <MenuItem value="模拟考试">模拟考试</MenuItem>
              <MenuItem value="教练辅导">教练辅导</MenuItem>
            </TextField>
            <Alert severity="info" icon={<EventAvailableIcon />}>
              该日程会同步到移动端日历，并与 AI 训练营保持一致的学习提醒。
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateSchedule} disabled={isCreating}>
            {isCreating ? '创建中…' : '添加到日程'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Schedule;
