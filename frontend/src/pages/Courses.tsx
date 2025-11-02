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
  ListItemAvatar,
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import { FormEvent, useEffect, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import learningService, { CourseItem } from '../services/learningService';
import { fetchMajors, type MajorOption } from '../services/userService';
import { useAuth } from '../context/AuthContext';

const Courses = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [title, setTitle] = useState('');
  const [teacher, setTeacher] = useState('');
  const [category, setCategory] = useState('公共课');
  const [progress, setProgress] = useState(0);
  const [nextTask, setNextTask] = useState('');
  const [description, setDescription] = useState('');
  const [majorId, setMajorId] = useState('');

  const {
    data: courses = [],
    isLoading,
    isError,
    refetch,
  } = useQuery<CourseItem[]>({
    queryKey: ['learning-courses'],
    queryFn: learningService.fetchCourses,
  });

  const majorsQuery = useQuery<MajorOption[]>({
    queryKey: ['learning-majors'],
    queryFn: fetchMajors,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (!majorId) {
      if (user?.majorId) {
        setMajorId(user.majorId);
      } else if (majorsQuery.data && majorsQuery.data.length > 0) {
        setMajorId(majorsQuery.data[0].id);
      }
    }
  }, [majorId, majorsQuery.data, user?.majorId]);

  const majors = majorsQuery.data ?? [];
  const majorHelperText = majorsQuery.isError ? '无法加载专业列表，请稍后重试。' : '选择课程所属专业方向';

  const createCourseMutation = useMutation({
    mutationFn: learningService.createCourse,
    onSuccess: async () => {
      setTitle('');
      setTeacher('');
      setCategory('公共课');
      setProgress(0);
      setNextTask('');
      setDescription('');
      setMajorId(user?.majorId ?? majorsQuery.data?.[0]?.id ?? '');
      await queryClient.invalidateQueries({ queryKey: ['learning-courses'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '创建课程失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const handleCreateCourse = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!title.trim()) {
      setErrorMessage('请输入课程标题');
      return;
    }

    if (!majorId) {
      setErrorMessage('请选择课程所属专业');
      return;
    }

    await createCourseMutation.mutateAsync({
      title: title.trim(),
      teacher: teacher.trim() || undefined,
      category: category.trim() || undefined,
      progress: Number.isNaN(progress) ? 0 : progress,
      nextTask: nextTask.trim() || undefined,
      description: description.trim() || undefined,
      majorId: majorId || undefined,
    });
  };

  return (
    <Stack spacing={4}>
      {(isLoading || createCourseMutation.isPending) && <LinearProgress />}
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
          暂时无法从后端同步课程，请检查后端接口。
        </Alert>
      )}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          课程体系
        </Typography>
        <Typography variant="body1" color="text.secondary">
          覆盖公共课与专业课的系统课程，结合阶段性冲刺班、直播答疑与资料下载，助你构建完整知识网络。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {courses.length === 0 ? (
          <Grid item xs={12}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
              <Typography variant="body2" color="text.secondary">
                暂无课程信息，欢迎在下方表单中录入你的专属课程体系。
              </Typography>
            </Paper>
          </Grid>
        ) : (
          courses.map((course) => (
            <Grid item xs={12} md={4} key={course.id}>
              <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
                <Stack spacing={2}>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {course.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      讲师：{course.teacher || '待补充'}
                    </Typography>
                  </Box>
                  <Chip label={course.category || '公共课'} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                  <Typography variant="body2">当前进度：{course.progress ?? 0}%</Typography>
                  <Divider />
                  <Stack spacing={1}>
                    <Typography variant="subtitle2" color="text.secondary">
                      下一步安排
                    </Typography>
                    <Typography variant="body2">{course.nextTask || '请为该课程设置复习计划。'}</Typography>
                  </Stack>
                </Stack>
              </Paper>
            </Grid>
          ))
        )}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} md={7}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px dashed', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                精品小班（下周开班）
              </Typography>
              <List>
                <ListItem>
                  <ListItemAvatar>
                    <PlayCircleIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText
                    primary="数学一-真题串讲营"
                    secondary="12 次直播串讲 + 高频题型训练，附带讲义与总结笔记"
                  />
                  <Chip label="限额 60 人" color="secondary" variant="outlined" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <AutoStoriesIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary="政治-冲刺押题班" secondary="核心考点提炼 + 模拟卷讲解 + 高频题背诵清单" />
                  <Chip label="赠预测资料包" color="success" variant="outlined" />
                </ListItem>
                <ListItem>
                  <ListItemAvatar>
                    <SchoolIcon color="primary" />
                  </ListItemAvatar>
                  <ListItemText primary="英语一-写作突破课" secondary="模板搭建 + 高频话题素材库 + 批改反馈" />
                  <Chip label="含作文批改" color="primary" variant="outlined" />
                </ListItem>
              </List>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={5}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} component="form" onSubmit={handleCreateCourse}>
              <Typography variant="h6" fontWeight={600}>
                新增课程
              </Typography>
              <TextField label="课程名称" value={title} onChange={(event) => setTitle(event.target.value)} required />
              <TextField label="讲师" value={teacher} onChange={(event) => setTeacher(event.target.value)} />
              <TextField label="课程类型" value={category} onChange={(event) => setCategory(event.target.value)} />
              <TextField
                label="所属专业"
                value={majorId}
                onChange={(event) => setMajorId(event.target.value)}
                select
                helperText={majorHelperText}
                disabled={majorsQuery.isLoading}
                required
              >
                {majors.map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="当前进度（0-100）"
                type="number"
                value={progress}
                inputProps={{ min: 0, max: 100 }}
                onChange={(event) => setProgress(Number(event.target.value))}
              />
              <TextField
                label="下一步任务"
                value={nextTask}
                onChange={(event) => setNextTask(event.target.value)}
                placeholder="例如：完成第 3 讲课后习题"
              />
              <TextField
                label="备注（可选）"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={2}
              />
              <Button type="submit" variant="contained" disabled={createCourseMutation.isPending}>
                {createCourseMutation.isPending ? '保存中…' : '保存课程'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Courses;
