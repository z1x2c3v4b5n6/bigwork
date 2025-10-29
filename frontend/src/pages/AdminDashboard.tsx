import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';

interface DashboardMetrics {
  activeStudents: number;
  tasksCompletedToday: number;
  followUpsPending: number;
  systemAlerts: number;
}

interface StudentProgress {
  id?: string;
  name: string;
  university: string;
  studyHours: number;
  completion: number;
}

interface AuditLogEntry {
  id?: string;
  title: string;
  description?: string;
  createdAt: string;
  actor?: string;
}

interface AdminDashboardResponse {
  metrics: DashboardMetrics;
  studentProgress: StudentProgress[];
  auditLogs: AuditLogEntry[];
  administrators: string[];
  securityNote?: string;
}

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL?.replace(/\/?$/, '') ?? '';

const fetchAdminDashboard = async (): Promise<AdminDashboardResponse> => {
  const response = await fetch(`${API_BASE_URL}/api/admin/dashboard`, {
    credentials: 'include',
  });

  if (!response.ok) {
    const message = (await response.text()) || '无法加载后台数据';
    throw new Error(message);
  }

  return (await response.json()) as AdminDashboardResponse;
};

const numberFormatter = new Intl.NumberFormat('zh-CN');

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch,
    isFetching,
  } = useQuery<AdminDashboardResponse>({
    queryKey: ['admin-dashboard'],
    queryFn: fetchAdminDashboard,
    enabled: !authLoading && user?.role === 'admin',
    staleTime: 60 * 1000,
  });

  const metricsCards = useMemo(
    () => [
      {
        key: 'activeStudents',
        label: '活跃学员',
        value: data?.metrics?.activeStudents ?? 0,
        icon: <GroupIcon />,
        color: 'primary.main',
      },
      {
        key: 'tasksCompletedToday',
        label: '今日完成任务',
        value: data?.metrics?.tasksCompletedToday ?? 0,
        icon: <AssessmentIcon />,
        color: 'success.main',
      },
      {
        key: 'followUpsPending',
        label: '跟进提醒',
        value: data?.metrics?.followUpsPending ?? 0,
        icon: <InsightsIcon />,
        color: 'warning.main',
      },
      {
        key: 'systemAlerts',
        label: '系统告警',
        value: data?.metrics?.systemAlerts ?? 0,
        icon: <SecurityIcon />,
        color: 'secondary.main',
      },
    ],
    [data?.metrics?.activeStudents, data?.metrics?.followUpsPending, data?.metrics?.systemAlerts, data?.metrics?.tasksCompletedToday],
  );

  if (authLoading || isLoading) {
    return (
      <Box sx={{ py: 8, display: 'flex', justifyContent: 'center' }}>
        <Stack spacing={2} alignItems="center">
          <LinearProgress sx={{ width: 160 }} />
          <Typography variant="body2" color="text.secondary">
            正在加载后台数据…
          </Typography>
        </Stack>
      </Box>
    );
  }

  if (isError) {
    const message = error instanceof Error ? error.message : '无法加载后台数据';
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => { void refetch(); }} startIcon={<RefreshIcon />}>
            重试
          </Button>
        }
      >
        {message}
      </Alert>
    );
  }

  if (!data) {
    return (
      <Alert severity="info">暂未获取到后台数据，请确认服务端接口已连接数据库并返回数据。</Alert>
    );
  }

  const students = data.studentProgress ?? [];
  const auditLogs = data.auditLogs ?? [];
  const administrators = data.administrators ?? [];
  const securityNote = data.securityNote ?? '建议启用双因素认证，并定期复审管理员账户权限，确保敏感数据安全。';

  return (
    <Stack spacing={4}>
      <Stack direction="row" alignItems="center" justifyContent="space-between" spacing={2}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            管理员控制台
          </Typography>
          <Typography variant="body1" color="text.secondary">
            审视平台整体运营情况、管理学员账号及监控关键指标。
          </Typography>
        </Box>
        <Button
          variant="outlined"
          startIcon={<RefreshIcon />}
          onClick={() => {
            void refetch();
          }}
          disabled={isFetching}
        >
          {isFetching ? '刷新中…' : '刷新数据'}
        </Button>
      </Stack>

      <Grid container spacing={3}>
        {metricsCards.map((item) => (
          <Grid item xs={12} md={3} key={item.key}>
            <Paper
              elevation={0}
              sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
            >
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar sx={{ bgcolor: item.color }}>{item.icon}</Avatar>
                <Box>
                  <Typography variant="subtitle2" color="text.secondary">
                    {item.label}
                  </Typography>
                  <Typography variant="h5" fontWeight={700}>
                    {numberFormatter.format(item.value)}
                  </Typography>
                </Box>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
          >
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  学员学习进度
                </Typography>
                <Chip label="本周" color="primary" variant="outlined" />
              </Box>
              {students.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    暂无学员进度数据，请在数据库中新增相关记录。
                  </Typography>
                </Box>
              ) : (
                <Table size="small" sx={{ flexGrow: 1 }}>
                  <TableHead>
                    <TableRow>
                      <TableCell>学员</TableCell>
                      <TableCell>目标院校</TableCell>
                      <TableCell>本周学习时长（h）</TableCell>
                      <TableCell align="right">完成率</TableCell>
                    </TableRow>
                  </TableHead>
                  <TableBody>
                    {students.map((student) => (
                      <TableRow key={student.id ?? student.name} hover>
                        <TableCell>
                          <Stack direction="row" spacing={2} alignItems="center">
                            <Avatar>{student.name?.charAt(0) ?? '学'}</Avatar>
                            <Typography variant="subtitle2">{student.name}</Typography>
                          </Stack>
                        </TableCell>
                        <TableCell>{student.university}</TableCell>
                        <TableCell>{student.studyHours}</TableCell>
                        <TableCell align="right" sx={{ minWidth: 160 }}>
                          <Stack spacing={1}>
                            <Typography variant="body2" fontWeight={600}>
                              {Math.round((student.completion ?? 0) * 100)}%
                            </Typography>
                            <LinearProgress
                              variant="determinate"
                              value={Math.max(0, Math.min(100, (student.completion ?? 0) * 100))}
                              sx={{ height: 6, borderRadius: 999 }}
                            />
                          </Stack>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              )}
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper
            elevation={0}
            sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}
          >
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Typography variant="h6" fontWeight={600}>
                最新操作日志
              </Typography>
              {auditLogs.length === 0 ? (
                <Box sx={{ py: 8, textAlign: 'center' }}>
                  <Typography variant="body2" color="text.secondary">
                    暂无日志记录，执行操作后日志将展示在此处。
                  </Typography>
                </Box>
              ) : (
                <List disablePadding sx={{ flexGrow: 1 }}>
                  {auditLogs.map((item) => (
                    <ListItem key={item.id ?? item.title} disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
                      <ListItemAvatar>
                        <Avatar variant="rounded" sx={{ bgcolor: 'grey.100', color: 'text.primary' }}>
                          <SecurityIcon fontSize="small" />
                        </Avatar>
                      </ListItemAvatar>
                      <ListItemText
                        primary={
                          <Typography variant="subtitle2" fontWeight={600}>
                            {item.title}
                          </Typography>
                        }
                        secondary={
                          <Stack spacing={0.5}>
                            {item.description ? (
                              <Typography variant="body2" color="text.secondary">
                                {item.description}
                              </Typography>
                            ) : null}
                            <Typography variant="caption" color="text.secondary">
                              {`${item.actor ? `${item.actor} · ` : ''}${dayjs(item.createdAt).format('YYYY-MM-DD HH:mm')}`}
                            </Typography>
                          </Stack>
                        }
                      />
                    </ListItem>
                  ))}
                </List>
              )}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={2}>
          <Typography variant="h6" fontWeight={600}>
            权限审计
          </Typography>
          <Divider />
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between">
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                当前管理员
              </Typography>
              {administrators.length === 0 ? (
                <Typography variant="body2" color="text.secondary">
                  暂未设置管理员账号，请在数据库或后台服务中添加具有管理员角色的用户。
                </Typography>
              ) : (
                <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                  {administrators.map((name) => (
                    <Chip key={name} label={name} color="primary" variant="outlined" />
                  ))}
                </Stack>
              )}
            </Stack>
            <Stack spacing={1} maxWidth={420}>
              <Typography variant="subtitle2" color="text.secondary">
                安全提示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {securityNote}
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
