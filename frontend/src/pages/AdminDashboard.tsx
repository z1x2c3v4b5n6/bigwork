import RefreshIcon from '@mui/icons-material/Refresh';
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  FormHelperText,
  Grid,
  IconButton,
  InputLabel,
  LinearProgress,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Select,
  Stack,
  Tab,
  Tabs,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import dayjs from 'dayjs';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import adminService, {
  AdminDashboardResponse,
  AdminForumPost,
  AdminForumTopic,
  AdminUser,
  CourseRecord,
  MajorRecord,
  MaterialRecord,
  StatisticsOverview,
} from '../services/adminService';

const numberFormatter = new Intl.NumberFormat('zh-CN');

type AdminTab =
  | 'overview'
  | 'settings'
  | 'users'
  | 'majors'
  | 'courses'
  | 'materials'
  | 'forum'
  | 'statistics';

const AdminDashboard = () => {
  const { user, loading: authLoading } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [settingsDraft, setSettingsDraft] = useState<Record<string, string>>({});
  const [settingsMessage, setSettingsMessage] = useState<string | null>(null);
  const [userForm, setUserForm] = useState({ username: '', password: '', displayName: '', email: '', role: 'student' });
  const [majorForm, setMajorForm] = useState({ name: '', description: '' });
  const [courseForm, setCourseForm] = useState({ title: '', description: '', teacher: '', credit: '', majorId: '' });
  const [materialForm, setMaterialForm] = useState({ title: '', description: '', fileUrl: '', courseId: '' });
  const [statisticsSearch, setStatisticsSearch] = useState('');
  const [searchResult, setSearchResult] = useState<{
    users: AdminUser[];
    majors: MajorRecord[];
    courses: CourseRecord[];
    materials: MaterialRecord[];
    forumTopics: { id: number; title: string; description: string | null }[];
  } | null>(null);
  const [forumTopicId, setForumTopicId] = useState<number | null>(null);

  const dashboardQuery = useQuery<AdminDashboardResponse>({
    queryKey: ['admin-dashboard'],
    queryFn: adminService.fetchAdminDashboard,
    enabled: !authLoading && user?.role === 'admin',
    staleTime: 60 * 1000,
  });

  const metricsCards = useMemo(
    () => [
      {
        key: 'activeStudents',
        label: '活跃学员',
        value: dashboardQuery.data?.metrics?.activeStudents ?? 0,
        icon: <GroupIcon />,
        color: 'primary.main',
      },
      {
        key: 'tasksCompletedToday',
        label: '今日完成任务',
        value: dashboardQuery.data?.metrics?.tasksCompletedToday ?? 0,
        icon: <AssessmentIcon />,
        color: 'success.main',
      },
      {
        key: 'followUpsPending',
        label: '跟进提醒',
        value: dashboardQuery.data?.metrics?.followUpsPending ?? 0,
        icon: <InsightsIcon />,
        color: 'warning.main',
      },
      {
        key: 'systemAlerts',
        label: '系统告警',
        value: dashboardQuery.data?.metrics?.systemAlerts ?? 0,
        icon: <SecurityIcon />,
        color: 'secondary.main',
      },
    ],
    [
      dashboardQuery.data?.metrics?.activeStudents,
      dashboardQuery.data?.metrics?.followUpsPending,
      dashboardQuery.data?.metrics?.systemAlerts,
      dashboardQuery.data?.metrics?.tasksCompletedToday,
    ],
  );

  const settingsQuery = useQuery({
    queryKey: ['admin-settings'],
    queryFn: adminService.fetchAdminSettings,
    enabled: !authLoading && user?.role === 'admin' && activeTab === 'settings',
  });

  useEffect(() => {
    if (settingsQuery.data && Object.keys(settingsDraft).length === 0) {
      setSettingsDraft(settingsQuery.data);
    }
  }, [settingsDraft, settingsQuery.data]);

  const usersQuery = useQuery({
    queryKey: ['admin-users'],
    queryFn: adminService.fetchAdminUsers,
    enabled: !authLoading && user?.role === 'admin' && activeTab === 'users',
  });

  const shouldLoadMajors = ['majors', 'courses', 'materials'].includes(activeTab);
  const majorsQuery = useQuery({
    queryKey: ['admin-majors'],
    queryFn: adminService.fetchMajors,
    enabled: !authLoading && user?.role === 'admin' && shouldLoadMajors,
  });

  const shouldLoadCourses = ['courses', 'materials'].includes(activeTab);
  const coursesQuery = useQuery({
    queryKey: ['admin-courses'],
    queryFn: adminService.fetchCourses,
    enabled: !authLoading && user?.role === 'admin' && shouldLoadCourses,
  });

  const materialsQuery = useQuery({
    queryKey: ['admin-materials'],
    queryFn: adminService.fetchMaterials,
    enabled: !authLoading && user?.role === 'admin' && activeTab === 'materials',
  });

  const statisticsQuery = useQuery<StatisticsOverview>({
    queryKey: ['admin-statistics-overview'],
    queryFn: adminService.fetchAdminStatistics,
    enabled: !authLoading && user?.role === 'admin' && activeTab === 'statistics',
  });

  const forumTopicsQuery = useQuery<AdminForumTopic[]>({
    queryKey: ['admin-forum-topics'],
    queryFn: adminService.fetchAdminForumTopics,
    enabled: !authLoading && user?.role === 'admin' && activeTab === 'forum',
  });

  useEffect(() => {
    if (forumTopicsQuery.data && forumTopicsQuery.data.length > 0 && forumTopicId === null) {
      setForumTopicId(forumTopicsQuery.data[0].id);
    }
  }, [forumTopicsQuery.data, forumTopicId]);

  const forumPostsQuery = useQuery<AdminForumPost[]>({
    queryKey: ['admin-forum-posts', forumTopicId],
    queryFn: () => adminService.fetchAdminForumPosts(forumTopicId as number),
    enabled: activeTab === 'forum' && forumTopicId !== null,
  });

  const updateSettingsMutation = useMutation({
    mutationFn: adminService.updateAdminSettings,
    onSuccess: async () => {
      setSettingsMessage('设置保存成功');
      await queryClient.invalidateQueries({ queryKey: ['admin-settings'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '保存失败，请稍后再试';
      setSettingsMessage(message);
    },
  });

  const createUserMutation = useMutation({
    mutationFn: adminService.createAdminUser,
    onSuccess: async () => {
      setUserForm({ username: '', password: '', displayName: '', email: '', role: 'student' });
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const updateUserMutation = useMutation({
    mutationFn: ({ id, payload }: { id: number; payload: Partial<AdminUser> }) =>
      adminService.updateAdminUser(id, payload),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const deleteUserMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteAdminUser(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-users'] });
    },
  });

  const createMajorMutation = useMutation({
    mutationFn: adminService.createMajor,
    onSuccess: async () => {
      setMajorForm({ name: '', description: '' });
      await queryClient.invalidateQueries({ queryKey: ['admin-majors'] });
    },
  });

  const deleteMajorMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteMajor(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-majors'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });

  const createCourseMutation = useMutation({
    mutationFn: adminService.createCourse,
    onSuccess: async () => {
      setCourseForm({ title: '', description: '', teacher: '', credit: '', majorId: '' });
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
    },
  });

  const deleteCourseMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteCourse(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-courses'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: adminService.createMaterial,
    onSuccess: async () => {
      setMaterialForm({ title: '', description: '', fileUrl: '', courseId: '' });
      await queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
  });

  const deleteMaterialMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteMaterial(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-materials'] });
    },
  });

  const deleteForumTopicMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteAdminForumTopic(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-forum-topics'] });
      await queryClient.invalidateQueries({ queryKey: ['admin-forum-posts'] });
      setForumTopicId(null);
    },
  });

  const deleteForumPostMutation = useMutation({
    mutationFn: (id: number) => adminService.deleteAdminForumPost(id),
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['admin-forum-posts', forumTopicId] });
    },
  });

  const handleSettingsSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setSettingsMessage(null);
    await updateSettingsMutation.mutateAsync(settingsDraft);
  };

  const handleUserSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!userForm.username || !userForm.password || !userForm.displayName) {
      return;
    }

    await createUserMutation.mutateAsync({
      username: userForm.username,
      password: userForm.password,
      displayName: userForm.displayName,
      email: userForm.email || undefined,
      role: userForm.role,
    });
  };

  const handleMajorSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!majorForm.name) {
      return;
    }

    await createMajorMutation.mutateAsync({ name: majorForm.name, description: majorForm.description || undefined });
  };

  const handleCourseSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!courseForm.title) {
      return;
    }

    await createCourseMutation.mutateAsync({
      title: courseForm.title,
      description: courseForm.description || undefined,
      teacher: courseForm.teacher || undefined,
      credit: courseForm.credit ? Number(courseForm.credit) : undefined,
      majorId: courseForm.majorId ? Number(courseForm.majorId) : undefined,
    });
  };

  const handleMaterialSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!materialForm.title) {
      return;
    }

    await createMaterialMutation.mutateAsync({
      title: materialForm.title,
      description: materialForm.description || undefined,
      fileUrl: materialForm.fileUrl || undefined,
      courseId: materialForm.courseId ? Number(materialForm.courseId) : undefined,
    });
  };

  const handleStatisticsSearch = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!statisticsSearch.trim()) {
      setSearchResult(null);
      return;
    }

    const result = await adminService.searchAdminData(statisticsSearch.trim());
    setSearchResult(result);
  };

  if (authLoading || dashboardQuery.isLoading) {
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

  if (dashboardQuery.isError) {
    const message = dashboardQuery.error instanceof Error ? dashboardQuery.error.message : '无法加载后台数据';
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => dashboardQuery.refetch()} startIcon={<RefreshIcon />}>
            重试
          </Button>
        }
      >
        {message}
      </Alert>
    );
  }

  const dashboardData = dashboardQuery.data;

  if (!dashboardData) {
    return <Alert severity="info">暂未获取到后台数据，请确认服务端接口已连接数据库并返回数据。</Alert>;
  }

  const students = dashboardData.studentProgress ?? [];
  const auditLogs = dashboardData.auditLogs ?? [];
  const administrators = dashboardData.administrators ?? [];
  const securityNote = dashboardData.securityNote ?? '建议启用双因素认证，并定期复审管理员账户权限，确保敏感数据安全。';

  return (
    <Stack spacing={3}>
      <Stack direction={{ xs: 'column', md: 'row' }} alignItems={{ xs: 'flex-start', md: 'center' }} justifyContent="space-between" spacing={2}>
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
            void dashboardQuery.refetch();
          }}
          disabled={dashboardQuery.isFetching}
        >
          {dashboardQuery.isFetching ? '刷新中…' : '刷新数据'}
        </Button>
      </Stack>

      <Tabs
        value={activeTab}
        onChange={(_, value) => setActiveTab(value)}
        variant="scrollable"
        scrollButtons
        allowScrollButtonsMobile
      >
        <Tab label="总览" value="overview" />
        <Tab label="基本信息" value="settings" />
        <Tab label="用户管理" value="users" />
        <Tab label="专业管理" value="majors" />
        <Tab label="课程管理" value="courses" />
        <Tab label="资料管理" value="materials" />
        <Tab label="论坛管理" value="forum" />
        <Tab label="统计与查询" value="statistics" />
      </Tabs>

      {activeTab === 'overview' ? (
        <Stack spacing={3}>
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
            <Typography variant="subtitle2" color="text.secondary">
              安全提示
            </Typography>
            <Typography variant="body1" mt={1}>
              {securityNote}
            </Typography>
            {administrators.length > 0 ? (
              <Typography variant="body2" color="text.secondary" mt={2}>
                当前管理员：{administrators.join('、')}
              </Typography>
            ) : null}
          </Paper>
        </Stack>
      ) : null}

      {activeTab === 'settings' ? (
        <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
          <Stack spacing={3} component="form" onSubmit={handleSettingsSubmit}>
            <Typography variant="h6" fontWeight={600}>
              平台基础信息
            </Typography>
            {settingsMessage ? <Alert severity="info">{settingsMessage}</Alert> : null}
            <Grid container spacing={2}>
              {['platform_name', 'support_email', 'security_note'].map((key) => (
                <Grid item xs={12} md={key === 'security_note' ? 12 : 6} key={key}>
                  <TextField
                    label={
                      key === 'platform_name'
                        ? '平台名称'
                        : key === 'support_email'
                        ? '联系邮箱'
                        : '安全提示'
                    }
                    value={settingsDraft[key] ?? ''}
                    onChange={(event) =>
                      setSettingsDraft((prev) => ({
                        ...prev,
                        [key]: event.target.value,
                      }))
                    }
                    multiline={key === 'security_note'}
                    minRows={key === 'security_note' ? 3 : undefined}
                  />
                </Grid>
              ))}
            </Grid>
            <Button type="submit" variant="contained" disabled={updateSettingsMutation.isPending}>
              {updateSettingsMutation.isPending ? '保存中…' : '保存设置'}
            </Button>
          </Stack>
        </Paper>
      ) : null}

      {activeTab === 'users' ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleUserSubmit}>
              <Typography variant="h6" fontWeight={600}>
                新增用户
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="用户名"
                    value={userForm.username}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, username: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="姓名"
                    value={userForm.displayName}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, displayName: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="密码"
                    type="password"
                    value={userForm.password}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, password: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <TextField
                    label="邮箱（可选）"
                    value={userForm.email}
                    onChange={(event) => setUserForm((prev) => ({ ...prev, email: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={3}>
                  <FormControl fullWidth>
                    <InputLabel id="create-user-role-label">角色</InputLabel>
                    <Select
                      labelId="create-user-role-label"
                      label="角色"
                      value={userForm.role}
                      onChange={(event) => setUserForm((prev) => ({ ...prev, role: event.target.value }))}
                    >
                      <MenuItem value="student">学员</MenuItem>
                      <MenuItem value="admin">管理员</MenuItem>
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" disabled={createUserMutation.isPending}>
                {createUserMutation.isPending ? '创建中…' : '添加用户'}
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              用户列表
            </Typography>
            {usersQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                正在加载用户…
              </Typography>
            ) : usersQuery.data && usersQuery.data.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>用户名</TableCell>
                    <TableCell>姓名</TableCell>
                    <TableCell>邮箱</TableCell>
                    <TableCell>角色</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {usersQuery.data.map((item) => (
                    <TableRow key={item.id} hover>
                      <TableCell>{item.username}</TableCell>
                      <TableCell>{item.displayName}</TableCell>
                      <TableCell>{item.email ?? '—'}</TableCell>
                      <TableCell width={160}>
                        <FormControl fullWidth size="small">
                          <Select
                            value={item.role}
                            onChange={(event) =>
                              updateUserMutation.mutate({ id: item.id, payload: { role: event.target.value as string } })
                            }
                          >
                            <MenuItem value="student">学员</MenuItem>
                            <MenuItem value="admin">管理员</MenuItem>
                          </Select>
                          <FormHelperText>选择后自动保存</FormHelperText>
                        </FormControl>
                      </TableCell>
                      <TableCell align="right">
                        <Tooltip title="删除用户">
                          <span>
                            <IconButton
                              color="error"
                              onClick={() => deleteUserMutation.mutate(item.id)}
                              disabled={deleteUserMutation.isPending || user?.id === String(item.id)}
                              size="small"
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无用户数据。
              </Typography>
            )}
          </Paper>
        </Stack>
      ) : null}

      {activeTab === 'majors' ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleMajorSubmit}>
              <Typography variant="h6" fontWeight={600}>
                新增专业
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="专业名称"
                    value={majorForm.name}
                    onChange={(event) => setMajorForm((prev) => ({ ...prev, name: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="专业简介（可选）"
                    value={majorForm.description}
                    onChange={(event) => setMajorForm((prev) => ({ ...prev, description: event.target.value }))}
                    multiline
                    minRows={2}
                  />
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" disabled={createMajorMutation.isPending}>
                {createMajorMutation.isPending ? '创建中…' : '保存专业'}
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              专业列表
            </Typography>
            {majorsQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                正在加载专业…
              </Typography>
            ) : majorsQuery.data && majorsQuery.data.length > 0 ? (
              <List>
                {majorsQuery.data.map((major) => (
                  <ListItem
                    key={major.id}
                    secondaryAction={
                      <Tooltip title="删除专业">
                        <span>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => deleteMajorMutation.mutate(major.id)}
                            disabled={deleteMajorMutation.isPending}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={major.name}
                      secondary={major.description ?? '暂无描述'}
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无专业信息。
              </Typography>
            )}
          </Paper>
        </Stack>
      ) : null}

      {activeTab === 'courses' ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleCourseSubmit}>
              <Typography variant="h6" fontWeight={600}>
                新增课程
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="课程名称"
                    value={courseForm.title}
                    onChange={(event) => setCourseForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="授课老师（可选）"
                    value={courseForm.teacher}
                    onChange={(event) => setCourseForm((prev) => ({ ...prev, teacher: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="学分（可选）"
                    value={courseForm.credit}
                    onChange={(event) => setCourseForm((prev) => ({ ...prev, credit: event.target.value }))}
                    type="number"
                    inputProps={{ min: 0, step: 0.5 }}
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="课程简介（可选）"
                    value={courseForm.description}
                    onChange={(event) => setCourseForm((prev) => ({ ...prev, description: event.target.value }))}
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={4}>
                  <FormControl fullWidth>
                    <InputLabel id="course-major-label">所属专业</InputLabel>
                    <Select
                      labelId="course-major-label"
                      label="所属专业"
                      value={courseForm.majorId}
                      onChange={(event) => setCourseForm((prev) => ({ ...prev, majorId: event.target.value }))}
                    >
                      <MenuItem value="">未指定</MenuItem>
                      {(majorsQuery.data ?? []).map((major) => (
                        <MenuItem key={major.id} value={String(major.id)}>{major.name}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" disabled={createCourseMutation.isPending}>
                {createCourseMutation.isPending ? '创建中…' : '保存课程'}
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              课程列表
            </Typography>
            {coursesQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                正在加载课程…
              </Typography>
            ) : coursesQuery.data && coursesQuery.data.length > 0 ? (
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>课程名称</TableCell>
                    <TableCell>所属专业</TableCell>
                    <TableCell>授课教师</TableCell>
                    <TableCell>学分</TableCell>
                    <TableCell align="right">操作</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {coursesQuery.data.map((course) => (
                    <TableRow key={course.id} hover>
                      <TableCell>{course.title}</TableCell>
                      <TableCell>{course.majorName ?? '—'}</TableCell>
                      <TableCell>{course.teacher ?? '—'}</TableCell>
                      <TableCell>{course.credit ?? '—'}</TableCell>
                      <TableCell align="right">
                        <Tooltip title="删除课程">
                          <span>
                            <IconButton
                              color="error"
                              size="small"
                              onClick={() => deleteCourseMutation.mutate(course.id)}
                              disabled={deleteCourseMutation.isPending}
                            >
                              <DeleteOutlineIcon fontSize="small" />
                            </IconButton>
                          </span>
                        </Tooltip>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无课程数据。
              </Typography>
            )}
          </Paper>
        </Stack>
      ) : null}

      {activeTab === 'materials' ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleMaterialSubmit}>
              <Typography variant="h6" fontWeight={600}>
                新增资料
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} md={4}>
                  <TextField
                    label="资料标题"
                    value={materialForm.title}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, title: event.target.value }))}
                    required
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label="资料描述（可选）"
                    value={materialForm.description}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, description: event.target.value }))}
                    multiline
                    minRows={2}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <TextField
                    label="文件链接（可选）"
                    value={materialForm.fileUrl}
                    onChange={(event) => setMaterialForm((prev) => ({ ...prev, fileUrl: event.target.value }))}
                  />
                </Grid>
                <Grid item xs={12} md={6}>
                  <FormControl fullWidth>
                    <InputLabel id="material-course-label">关联课程</InputLabel>
                    <Select
                      labelId="material-course-label"
                      label="关联课程"
                      value={materialForm.courseId}
                      onChange={(event) => setMaterialForm((prev) => ({ ...prev, courseId: event.target.value }))}
                    >
                      <MenuItem value="">未指定</MenuItem>
                      {(coursesQuery.data ?? []).map((course) => (
                        <MenuItem key={course.id} value={String(course.id)}>{course.title}</MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
              </Grid>
              <Button type="submit" variant="contained" disabled={createMaterialMutation.isPending}>
                {createMaterialMutation.isPending ? '创建中…' : '保存资料'}
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              资料列表
            </Typography>
            {materialsQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                正在加载资料…
              </Typography>
            ) : materialsQuery.data && materialsQuery.data.length > 0 ? (
              <List>
                {materialsQuery.data.map((material) => (
                  <ListItem
                    key={material.id}
                    secondaryAction={
                      <Tooltip title="删除资料">
                        <span>
                          <IconButton
                            edge="end"
                            color="error"
                            onClick={() => deleteMaterialMutation.mutate(material.id)}
                            disabled={deleteMaterialMutation.isPending}
                          >
                            <DeleteOutlineIcon />
                          </IconButton>
                        </span>
                      </Tooltip>
                    }
                  >
                    <ListItemText
                      primary={material.title}
                      secondary={
                        material.courseTitle
                          ? `${material.courseTitle}${material.description ? ` · ${material.description}` : ''}`
                          : material.description ?? '暂无描述'
                      }
                    />
                  </ListItem>
                ))}
              </List>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无资料数据。
              </Typography>
            )}
          </Paper>
        </Stack>
      ) : null}

      {activeTab === 'forum' ? (
        <Grid container spacing={3}>
          <Grid item xs={12} md={4}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight={600}>
                  论坛话题
                </Typography>
                <Divider />
                <Stack spacing={1.5} sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {forumTopicsQuery.isLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      正在加载话题…
                    </Typography>
                  ) : forumTopicsQuery.data && forumTopicsQuery.data.length > 0 ? (
                    forumTopicsQuery.data.map((topic) => (
                      <Paper
                        key={topic.id}
                        variant={forumTopicId === topic.id ? 'outlined' : 'elevation'}
                        sx={{ p: 2, borderRadius: 2, cursor: 'pointer', borderColor: forumTopicId === topic.id ? 'primary.main' : 'divider' }}
                        onClick={() => setForumTopicId(topic.id)}
                      >
                        <Stack direction="row" justifyContent="space-between" alignItems="center" spacing={1}>
                          <Box>
                            <Typography variant="subtitle1" fontWeight={600}>
                              {topic.title}
                            </Typography>
                            <Typography variant="body2" color="text.secondary">
                              {topic.description ?? '暂无描述'}
                            </Typography>
                          </Box>
                          <Tooltip title="删除话题">
                            <span>
                              <IconButton
                                color="error"
                                onClick={(event) => {
                                  event.stopPropagation();
                                  deleteForumTopicMutation.mutate(topic.id);
                                }}
                                size="small"
                                disabled={deleteForumTopicMutation.isPending}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无论坛话题。
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
          <Grid item xs={12} md={8}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
              <Stack spacing={2} sx={{ height: '100%' }}>
                <Typography variant="h6" fontWeight={600}>
                  帖子内容
                </Typography>
                <Divider />
                <Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {forumTopicId === null ? (
                    <Typography variant="body2" color="text.secondary">
                      请选择一个话题查看帖子。
                    </Typography>
                  ) : forumPostsQuery.isLoading ? (
                    <Typography variant="body2" color="text.secondary">
                      正在加载帖子…
                    </Typography>
                  ) : forumPostsQuery.data && forumPostsQuery.data.length > 0 ? (
                    forumPostsQuery.data.map((post) => (
                      <Paper key={post.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack direction="row" justifyContent="space-between" alignItems="flex-start">
                          <Box>
                            <Typography variant="body1" mb={1}>
                              {post.content}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              {`${post.author ?? '匿名用户'} · ${post.created_at ?? '未知时间'}`}
                            </Typography>
                          </Box>
                          <Tooltip title="删除帖子">
                            <span>
                              <IconButton
                                size="small"
                                color="error"
                                onClick={() => deleteForumPostMutation.mutate(post.id)}
                                disabled={deleteForumPostMutation.isPending}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        </Stack>
                      </Paper>
                    ))
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      该话题暂无帖子。
                    </Typography>
                  )}
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        </Grid>
      ) : null}

      {activeTab === 'statistics' ? (
        <Stack spacing={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} gutterBottom>
              核心指标总览
            </Typography>
            {statisticsQuery.isLoading ? (
              <Typography variant="body2" color="text.secondary">
                正在加载统计数据…
              </Typography>
            ) : statisticsQuery.data ? (
              <Grid container spacing={3}>
                {[
                  { label: '注册用户', value: statisticsQuery.data.totalUsers },
                  { label: '开设专业', value: statisticsQuery.data.totalMajors },
                  { label: '课程数量', value: statisticsQuery.data.totalCourses },
                  { label: '学习资料', value: statisticsQuery.data.totalMaterials },
                  { label: '题单数量', value: statisticsQuery.data.totalPracticeSets },
                  { label: '论坛帖子', value: statisticsQuery.data.totalForumPosts },
                ].map((item) => (
                  <Grid item xs={12} md={4} key={item.label}>
                    <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                      <Typography variant="subtitle2" color="text.secondary">
                        {item.label}
                      </Typography>
                      <Typography variant="h5" fontWeight={700}>
                        {numberFormatter.format(item.value)}
                      </Typography>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            ) : (
              <Typography variant="body2" color="text.secondary">
                暂无统计数据。
              </Typography>
            )}
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleStatisticsSearch}>
              <Typography variant="h6" fontWeight={600}>
                关键字查询
              </Typography>
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} alignItems={{ xs: 'stretch', sm: 'center' }}>
                <TextField
                  label="输入关键字（支持用户、课程、资料、论坛话题）"
                  value={statisticsSearch}
                  onChange={(event) => setStatisticsSearch(event.target.value)}
                  fullWidth
                />
                <Button type="submit" variant="contained">
                  查询
                </Button>
              </Stack>
              {searchResult ? (
                <Stack spacing={2}>
                  <Typography variant="subtitle2">用户匹配：{searchResult.users.length} 条</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.users.map((item) => item.displayName).join('、') || '无'}
                  </Typography>
                  <Typography variant="subtitle2">专业匹配：{searchResult.majors.length} 条</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.majors.map((item) => item.name).join('、') || '无'}
                  </Typography>
                  <Typography variant="subtitle2">课程匹配：{searchResult.courses.length} 条</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.courses.map((item) => item.title).join('、') || '无'}
                  </Typography>
                  <Typography variant="subtitle2">资料匹配：{searchResult.materials.length} 条</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.materials.map((item) => item.title).join('、') || '无'}
                  </Typography>
                  <Typography variant="subtitle2">论坛话题匹配：{searchResult.forumTopics.length} 条</Typography>
                  <Typography variant="body2" color="text.secondary">
                    {searchResult.forumTopics.map((item) => item.title).join('、') || '无'}
                  </Typography>
                </Stack>
              ) : null}
            </Stack>
          </Paper>
        </Stack>
      ) : null}
    </Stack>
  );
};

export default AdminDashboard;
