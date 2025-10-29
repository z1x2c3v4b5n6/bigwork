import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import InsightsIcon from '@mui/icons-material/Insights';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import GroupsIcon from '@mui/icons-material/Groups';
import InventoryIcon from '@mui/icons-material/Inventory';
import ForumIcon from '@mui/icons-material/Forum';
import PlaylistAddCheckIcon from '@mui/icons-material/PlaylistAddCheck';
import AddCircleIcon from '@mui/icons-material/AddCircle';
import PublishIcon from '@mui/icons-material/Publish';
import { useMemo, useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import useAdminOverview from '../hooks/useAdminOverview';
import {
  createMajor,
  createMaterial,
  type CreateMaterialPayload,
  type AdminCourse,
} from '../services/adminService';
import { ADMIN_OVERVIEW_QUERY_KEY } from '../hooks/useAdminOverview';

const AdminDashboard = () => {
  const queryClient = useQueryClient();
  const {
    overviewQuery: { data, isLoading, isError, refetch },
    createCourseMutation,
    publishCourseMutation,
  } = useAdminOverview();

  const [majorForm, setMajorForm] = useState({ name: '', description: '' });
  const [courseForm, setCourseForm] = useState({ name: '', category: '公共课', teacher: '', majorId: '', releaseWindow: '', summary: '' });
  const [materialForm, setMaterialForm] = useState<CreateMaterialPayload>({ courseId: '', title: '', type: '资料', url: '', description: '' });

  const createMajorMutation = useMutation({
    mutationFn: createMajor,
    onSuccess: () => {
      setMajorForm({ name: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });

  const createMaterialMutation = useMutation({
    mutationFn: createMaterial,
    onSuccess: () => {
      setMaterialForm({ courseId: '', title: '', type: '资料', url: '', description: '' });
      queryClient.invalidateQueries({ queryKey: ADMIN_OVERVIEW_QUERY_KEY });
    },
  });

  const summaryCards = useMemo(
    () => [
      {
        label: '活跃学员',
        value: data?.totals.students ?? 0,
        icon: <GroupsIcon color="primary" />,
      },
      {
        label: '开设专业',
        value: data?.totals.majors ?? 0,
        icon: <InsightsIcon color="secondary" />,
      },
      {
        label: '课程数量',
        value: data?.totals.courses ?? 0,
        icon: <LibraryBooksIcon color="success" />,
      },
      {
        label: '资料资源',
        value: data?.totals.materials ?? 0,
        icon: <InventoryIcon color="warning" />,
      },
      {
        label: '论坛话题',
        value: data?.totals.forumTopics ?? 0,
        icon: <ForumIcon color="info" />,
      },
    ],
    [data?.totals],
  );

  const handleCreateCourse = async () => {
    if (!courseForm.name || !courseForm.teacher) {
      return;
    }
    await createCourseMutation.mutateAsync({
      name: courseForm.name,
      category: courseForm.category,
      teacher: courseForm.teacher,
      majorId: courseForm.majorId || undefined,
      releaseWindow: courseForm.releaseWindow || undefined,
      summary: courseForm.summary || undefined,
    });
    setCourseForm({ name: '', category: '公共课', teacher: '', majorId: '', releaseWindow: '', summary: '' });
  };

  const handleCreateMajor = async () => {
    if (!majorForm.name.trim()) {
      return;
    }
    await createMajorMutation.mutateAsync(majorForm);
  };

  const handleCreateMaterial = async () => {
    if (!materialForm.courseId || !materialForm.title) {
      return;
    }
    await createMaterialMutation.mutateAsync(materialForm);
  };

  const handlePublishCourse = async (course: AdminCourse) => {
    await publishCourseMutation.mutateAsync(course.id);
  };

  return (
    <Stack spacing={4}>
      {isLoading && <LinearProgress color="secondary" />}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          教研管理驾驶舱
        </Typography>
        <Typography variant="body1" color="text.secondary">
          统筹专业、课程、资料与圈子，随时掌握学员动态并快速处理待办。
        </Typography>
      </Box>

      {isError && (
        <Alert severity="error" action={<Button color="inherit" onClick={() => refetch()}>重试</Button>}>
          管理数据暂时不可用，请确认后端服务是否启动。
        </Alert>
      )}

      <Grid container spacing={3}>
        {summaryCards.map((card) => (
          <Grid item xs={12} md={4} lg={2} key={card.label}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  {card.icon}
                  <Box>
                    <Typography variant="subtitle2" color="text.secondary">
                      {card.label}
                    </Typography>
                    <Typography variant="h5" fontWeight={700}>
                      {card.value}
                    </Typography>
                  </Box>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={600}>
            专业管理
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="新增专业名称"
              value={majorForm.name}
              onChange={(event) => setMajorForm((prev) => ({ ...prev, name: event.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="专业描述"
              value={majorForm.description}
              onChange={(event) => setMajorForm((prev) => ({ ...prev, description: event.target.value }))}
              sx={{ flex: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleCreateMajor}
              disabled={createMajorMutation.isPending}
            >
              新增专业
            </Button>
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>专业名称</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.majors ?? []).map((major) => (
                <TableRow key={major.id}>
                  <TableCell>{major.name}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} justifyContent="space-between" alignItems={{ md: 'center' }}>
            <Typography variant="h6" fontWeight={600}>
              课程管理
            </Typography>
            <Chip
              icon={<PlaylistAddCheckIcon />}
              label={`待发布 ${data?.courseDrafts.length ?? 0} 门`}
              color="warning"
              variant="outlined"
            />
          </Stack>

          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="课程名称"
              value={courseForm.name}
              onChange={(event) => setCourseForm((prev) => ({ ...prev, name: event.target.value }))}
              sx={{ flex: 2 }}
            />
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="course-category-label">课程类型</InputLabel>
              <Select
                labelId="course-category-label"
                label="课程类型"
                value={courseForm.category}
                onChange={(event) => setCourseForm((prev) => ({ ...prev, category: event.target.value }))}
              >
                <MenuItem value="公共课">公共课</MenuItem>
                <MenuItem value="专业课">专业课</MenuItem>
                <MenuItem value="选修课">选修课</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="授课老师"
              value={courseForm.teacher}
              onChange={(event) => setCourseForm((prev) => ({ ...prev, teacher: event.target.value }))}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="course-major-label">所属专业</InputLabel>
              <Select
                labelId="course-major-label"
                label="所属专业"
                value={courseForm.majorId}
                onChange={(event) => setCourseForm((prev) => ({ ...prev, majorId: event.target.value }))}
              >
                <MenuItem value="">全部</MenuItem>
                {(data?.majors ?? []).map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="上线时间窗口"
              value={courseForm.releaseWindow}
              onChange={(event) => setCourseForm((prev) => ({ ...prev, releaseWindow: event.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="课程简介"
              value={courseForm.summary}
              onChange={(event) => setCourseForm((prev) => ({ ...prev, summary: event.target.value }))}
              sx={{ flex: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleCreateCourse}
              disabled={createCourseMutation.isPending}
            >
              新建课程
            </Button>
          </Stack>

          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>课程名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>讲师</TableCell>
                <TableCell>进度</TableCell>
                <TableCell>状态</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.courses ?? []).map((course) => (
                <TableRow key={course.id}>
                  <TableCell>{course.title}</TableCell>
                  <TableCell>{course.category}</TableCell>
                  <TableCell>{course.teacher}</TableCell>
                  <TableCell>{course.progress}%</TableCell>
                  <TableCell>
                    <Chip
                      label={course.status === 'published' ? '已发布' : '待发布'}
                      color={course.status === 'published' ? 'success' : 'warning'}
                      size="small"
                    />
                  </TableCell>
                  <TableCell align="right">
                    {course.status !== 'published' && (
                      <Button
                        size="small"
                        variant="outlined"
                        startIcon={<PublishIcon />}
                        onClick={() => handlePublishCourse(course)}
                        disabled={publishCourseMutation.isPending}
                      >
                        发布
                      </Button>
                    )}
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Typography variant="h6" fontWeight={600}>
            资料管理
          </Typography>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <FormControl sx={{ flex: 1 }}>
              <InputLabel id="material-course-label">所属课程</InputLabel>
              <Select
                labelId="material-course-label"
                label="所属课程"
                value={materialForm.courseId}
                onChange={(event) => setMaterialForm((prev) => ({ ...prev, courseId: event.target.value }))}
              >
                {(data?.courses ?? []).map((course) => (
                  <MenuItem key={course.id} value={course.id}>
                    {course.title}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <TextField
              label="资料标题"
              value={materialForm.title}
              onChange={(event) => setMaterialForm((prev) => ({ ...prev, title: event.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="类型"
              value={materialForm.type}
              onChange={(event) => setMaterialForm((prev) => ({ ...prev, type: event.target.value }))}
              sx={{ flex: 1 }}
            />
          </Stack>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
            <TextField
              label="资源地址"
              value={materialForm.url}
              onChange={(event) => setMaterialForm((prev) => ({ ...prev, url: event.target.value }))}
              sx={{ flex: 1 }}
            />
            <TextField
              label="资料描述"
              value={materialForm.description}
              onChange={(event) => setMaterialForm((prev) => ({ ...prev, description: event.target.value }))}
              sx={{ flex: 2 }}
            />
            <Button
              variant="contained"
              startIcon={<AddCircleIcon />}
              onClick={handleCreateMaterial}
              disabled={createMaterialMutation.isPending}
            >
              上传资料
            </Button>
          </Stack>
          <Divider />
          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>资料名称</TableCell>
                <TableCell>类型</TableCell>
                <TableCell>所属课程</TableCell>
                <TableCell>地址</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(data?.materials ?? []).map((material) => (
                <TableRow key={material.id}>
                  <TableCell>{material.title}</TableCell>
                  <TableCell>{material.type}</TableCell>
                  <TableCell>{material.courseName}</TableCell>
                  <TableCell>
                    <Typography variant="body2" color="primary">
                      {material.url || '—'}
                    </Typography>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              用户管理
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>姓名</TableCell>
                  <TableCell>角色</TableCell>
                  <TableCell>专业</TableCell>
                  <TableCell>联系方式</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.users ?? []).map((user) => (
                  <TableRow key={user.id}>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.role === 'admin' ? '管理员' : '学员'}</TableCell>
                    <TableCell>{user.majorName || '—'}</TableCell>
                    <TableCell>{user.phone || user.email}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Typography variant="h6" fontWeight={600} mb={2}>
              论坛管理
            </Typography>
            <Table size="small">
              <TableHead>
                <TableRow>
                  <TableCell>话题</TableCell>
                  <TableCell>评论数</TableCell>
                  <TableCell>状态</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {(data?.forum ?? []).map((topic) => (
                  <TableRow key={topic.id}>
                    <TableCell>{topic.title}</TableCell>
                    <TableCell>{topic.commentCount}</TableCell>
                    <TableCell>
                      <Chip
                        label={topic.needsModeration ? '待审核' : '正常'}
                        size="small"
                        color={topic.needsModeration ? 'warning' : 'success'}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default AdminDashboard;
