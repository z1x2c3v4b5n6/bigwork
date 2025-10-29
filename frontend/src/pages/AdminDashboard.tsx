import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import UploadIcon from '@mui/icons-material/Upload';
import GroupsIcon from '@mui/icons-material/Groups';
import TaskIcon from '@mui/icons-material/Task';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import { useMemo, useState } from 'react';
import useAdminOverview from '../hooks/useAdminOverview';

const AdminDashboard = () => {
  const {
    overviewQuery: { data, isLoading, isError, refetch },
    syncMutation,
    createCourseMutation,
    publishCourseMutation,
  } = useAdminOverview();

  const [newCourse, setNewCourse] = useState({ name: '', category: '数学', teacher: '', releaseWindow: '' });

  const isSyncing = syncMutation.isPending;
  const isCreating = createCourseMutation.isPending;

  const highlightChips = useMemo(
    () =>
      (data?.stats ?? []).map((stat) => ({
        ...stat,
        color: stat.trend.startsWith('+') ? 'success' : stat.trend.startsWith('-') ? 'error' : 'default',
      })),
    [data?.stats],
  );

  const handleSync = async () => {
    await syncMutation.mutateAsync();
  };

  const handleCreateCourse = async () => {
    if (!newCourse.name || !newCourse.category || !newCourse.teacher) {
      return;
    }
    await createCourseMutation.mutateAsync(newCourse);
    setNewCourse({ name: '', category: '数学', teacher: '', releaseWindow: '' });
  };

  const handlePublish = async (draftId: string) => {
    await publishCourseMutation.mutateAsync(draftId);
  };

  return (
    <Stack spacing={4}>
      {(isLoading || isSyncing) && <LinearProgress color="secondary" />}

      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          教学管理驾驶舱
        </Typography>
        <Typography variant="body1" color="text.secondary">
          与学生端完全不同的管理视角，聚焦在学情监控、课程上新与题库质检，让你一站式掌控教学节奏。
        </Typography>
      </Stack>

      {isError && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => refetch()}>重试</Button>}>
          后端管理数据暂时不可用，稍后再试或检查服务是否启动。
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <UploadIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    学情数据同步
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最近一次同步：{data ? new Date(data.lastSyncAt).toLocaleString() : '—'}
                  </Typography>
                </Box>
              </Stack>
              <Button variant="contained" onClick={handleSync} startIcon={<RocketLaunchIcon />} disabled={isSyncing}>
                {isSyncing ? '同步中…' : '刷新学情大盘'}
              </Button>
              <Alert severity="info" sx={{ bgcolor: 'primary.50' }}>
                已接入学院学情 API，支持实时下发预警；同步后学生端即可看到最新学习建议。
              </Alert>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper
            elevation={0}
            sx={{
              p: 3,
              borderRadius: 3,
              border: '1px solid',
              borderColor: 'divider',
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              gap: 2,
            }}
          >
            <Stack direction="row" spacing={2} alignItems="center">
              <InsightsIcon color="secondary" />
              <Typography variant="subtitle1" fontWeight={600}>
                中台实时指标
              </Typography>
            </Stack>
            <Grid container spacing={2}>
              {highlightChips.map((stat) => (
                <Grid item xs={12} sm={4} key={stat.label}>
                  <Paper elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Typography variant="body2" color="text.secondary">
                      {stat.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700} sx={{ mt: 1 }}>
                      {stat.value}
                    </Typography>
                    <Stack direction="row" spacing={1} alignItems="center" sx={{ mt: 1 }}>
                      <Chip size="small" label={stat.trend} color={stat.color as 'success' | 'error' | 'default'} />
                      <Typography variant="caption" color="text.secondary">
                        {stat.helper}
                      </Typography>
                    </Stack>
                  </Paper>
                </Grid>
              ))}
            </Grid>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                AI 风险提示
              </Typography>
              <Grid container spacing={2}>
                {(data?.aiHighlights ?? []).map((item) => (
                  <Grid item xs={12} md={6} key={item.title}>
                    <Paper elevation={0} sx={{ p: 2, borderRadius: 2, border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" spacing={1.5} alignItems="flex-start">
                        <PriorityHighIcon color="warning" fontSize="small" />
                        <Box>
                          <Typography variant="subtitle2">{item.title}</Typography>
                          <Typography variant="body2" color="text.secondary">
                            {item.detail}
                          </Typography>
                        </Box>
                      </Stack>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <GroupsIcon color="primary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  审核待办清单
                </Typography>
              </Stack>
              <Stack spacing={2}>
                {(data?.reviewQueue ?? []).map((item) => (
                  <Paper key={item.id} elevation={0} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                    <Stack spacing={1}>
                      <Stack direction="row" alignItems="center" spacing={1}>
                        <Chip
                          size="small"
                          color={item.priority === '高' ? 'error' : item.priority === '中' ? 'warning' : 'default'}
                          label={`优先级 ${item.priority}`}
                        />
                        <Typography variant="subtitle2">{item.title}</Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {item.description}
                      </Typography>
                    </Stack>
                  </Paper>
                ))}
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <TaskIcon color="secondary" />
                <Typography variant="subtitle1" fontWeight={600}>
                  运营流程概览
                </Typography>
              </Stack>
              <Stack spacing={1}>
                <Typography variant="body2" color="text.secondary">
                  · AI 自动整理错题诊断，管理员审核后推送至学员端“AI 训练营”。
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  · 课程草稿通过后自动进入排期表，并生成督学提醒。
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  · 已发布课程会同步到直播排班与题库更新日程，学生端导航随即更新。
                </Typography>
              </Stack>
              <Alert severity="success" icon={<CheckCircleIcon />}>
                最新一轮迭代已让管理员专注任务缩短 36%，请持续维护 AI 规则以保持效果。
              </Alert>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                课程产出与发布排期
              </Typography>
              <Typography variant="body2" color="text.secondary">
                填写新课程信息后即可生成校审流程，AI 会根据往期数据匹配最佳上线窗口。
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="课程名称"
                value={newCourse.name}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, name: event.target.value }))}
              />
              <TextField
                label="所属科目"
                select
                value={newCourse.category}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, category: event.target.value }))}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="数学">数学</MenuItem>
                <MenuItem value="政治">政治</MenuItem>
                <MenuItem value="英语">英语</MenuItem>
                <MenuItem value="专业课">专业课</MenuItem>
              </TextField>
              <TextField
                label="主讲老师"
                value={newCourse.teacher}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, teacher: event.target.value }))}
                sx={{ minWidth: 160 }}
              />
              <TextField
                label="上线窗口"
                value={newCourse.releaseWindow}
                placeholder="如：5 月第 2 周"
                onChange={(event) => setNewCourse((prev) => ({ ...prev, releaseWindow: event.target.value }))}
                sx={{ minWidth: 160 }}
              />
              <Button
                variant="contained"
                startIcon={<PlaylistAddCheckIcon />}
                onClick={handleCreateCourse}
                disabled={isCreating}
              >
                {isCreating ? '生成中…' : '新建课程草稿'}
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>课程名称</TableCell>
                <TableCell>科目</TableCell>
                <TableCell>主讲老师</TableCell>
                <TableCell>上线窗口</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>更新时间</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.courseDrafts ?? []).map((draft) => (
                <TableRow key={draft.id} hover>
                  <TableCell>{draft.name}</TableCell>
                  <TableCell>{draft.category}</TableCell>
                  <TableCell>{draft.teacher}</TableCell>
                  <TableCell>{draft.releaseWindow ?? '待排期'}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={draft.status === '已发布' ? 'success' : draft.status === '待完善' ? 'warning' : 'default'}
                      label={draft.status}
                    />
                  </TableCell>
                  <TableCell>{draft.updatedAt}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Tooltip title="导出校审清单">
                        <Button variant="outlined" size="small">
                          导出
                        </Button>
                      </Tooltip>
                      <Button
                        variant="contained"
                        size="small"
                        onClick={() => handlePublish(draft.id)}
                        disabled={draft.status === '已发布' || publishCourseMutation.isPending}
                      >
                        一键发布
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
