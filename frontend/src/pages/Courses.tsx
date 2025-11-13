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
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import { FormEvent, useEffect, useMemo, useState } from 'react';
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
  const [tagsInput, setTagsInput] = useState('');
  const [selectedMathSubjects, setSelectedMathSubjects] = useState<string[]>([]);
  const [selectedEnglishSubjects, setSelectedEnglishSubjects] = useState<string[]>([]);
  const [selectedMajorIds, setSelectedMajorIds] = useState<string[]>([]);
  const [createDialogOpen, setCreateDialogOpen] = useState(false);

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
        setSelectedMajorIds([user.majorId]);
      } else if (majorsQuery.data && majorsQuery.data.length > 0) {
        const fallbackMajorId = majorsQuery.data[0].id;
        setMajorId(fallbackMajorId);
        setSelectedMajorIds(fallbackMajorId ? [fallbackMajorId] : []);
      }
    }
  }, [majorId, majorsQuery.data, user?.majorId]);

  const majors = majorsQuery.data ?? [];
  const majorNameMap = useMemo(() => new Map(majors.map((item) => [item.id, item.name])), [majors]);
  const majorHelperText = majorsQuery.isError ? '无法加载专业列表，请稍后重试。' : '选择课程所属专业方向';
  const mathSubjectOptions = ['数学一', '数学二', '数学三', '不考数学'];
  const englishSubjectOptions = ['英语一', '英语二', '不考英语'];

  const resetForm = () => {
    setTitle('');
    setTeacher('');
    setCategory('公共课');
    setProgress(0);
    setNextTask('');
    setDescription('');
    const defaultMajorId = user?.majorId ?? majorsQuery.data?.[0]?.id ?? '';
    setMajorId(defaultMajorId);
    setTagsInput('');
    setSelectedMathSubjects([]);
    setSelectedEnglishSubjects([]);
    setSelectedMajorIds(defaultMajorId ? [defaultMajorId] : []);
  };

  const createCourseMutation = useMutation({
    mutationFn: learningService.createCourse,
    onSuccess: async () => {
      resetForm();
      setCreateDialogOpen(false);
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

    const normalizeList = (values: string[]) =>
      Array.from(new Set(values.map((value) => value.trim()).filter((value) => value.length > 0)));

    const tagList = normalizeList(
      tagsInput
        .split(/[，,]/)
        .map((tag) => tag.trim())
        .filter((tag) => tag.length > 0),
    );
    const majorNames = normalizeList(
      selectedMajorIds.map((id) => (id === '__other__' ? '其他专业' : majorNameMap.get(id) ?? id)),
    );
    const majorIdsPayload = normalizeList(selectedMajorIds.filter((id) => id !== '__other__'));
    const mathSubjectsPayload = normalizeList(selectedMathSubjects);
    const englishSubjectsPayload = normalizeList(selectedEnglishSubjects);

    await createCourseMutation.mutateAsync({
      title: title.trim(),
      teacher: teacher.trim() || undefined,
      category: category.trim() || undefined,
      progress: Number.isNaN(progress) ? 0 : progress,
      nextTask: nextTask.trim() || undefined,
      description: description.trim() || undefined,
      majorId: majorId || undefined,
      tags: tagList.length > 0 ? tagList : undefined,
      mathSubjects: mathSubjectsPayload.length > 0 ? mathSubjectsPayload : undefined,
      englishSubjects: englishSubjectsPayload.length > 0 ? englishSubjectsPayload : undefined,
      visibleMajorIds: majorIdsPayload.length > 0 ? majorIdsPayload : undefined,
      visibleMajorNames: majorNames.length > 0 ? majorNames : undefined,
    });
  };

  const handleOpenDialog = () => {
    setErrorMessage(null);
    if (
      !title &&
      !teacher &&
      !description &&
      !nextTask &&
      !majorId &&
      !tagsInput &&
      selectedMathSubjects.length === 0 &&
      selectedEnglishSubjects.length === 0 &&
      selectedMajorIds.length === 0
    ) {
      resetForm();
    }
    setCreateDialogOpen(true);
  };

  const handleCloseDialog = () => {
    if (createCourseMutation.isPending) {
      return;
    }
    resetForm();
    setCreateDialogOpen(false);
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
                  <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                    <Chip label={course.category || '公共课'} color="primary" variant="outlined" />
                    {course.intensity ? (
                      <Chip label={course.intensity} color="secondary" variant="outlined" />
                    ) : null}
                  </Stack>
                  {course.tags && course.tags.length > 0 ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {course.tags.map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  ) : null}
                  {course.highlight ? (
                    <Typography variant="body2" color="text.secondary">
                      {course.highlight}
                    </Typography>
                  ) : null}
                  {course.suitability &&
                  (course.suitability.mathSubjects?.length ||
                    course.suitability.englishSubjects?.length ||
                    course.suitability.majors?.length ||
                    course.suitability.majorIds?.length) ? (
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      {course.suitability.mathSubjects?.length ? (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`数学：${course.suitability.mathSubjects.join(' / ')}`}
                        />
                      ) : null}
                      {course.suitability.englishSubjects?.length ? (
                        <Chip
                          size="small"
                          color="info"
                          variant="outlined"
                          label={`英语：${course.suitability.englishSubjects.join(' / ')}`}
                        />
                      ) : null}
                      {(() => {
                        const majorsFromIds = (course.suitability?.majorIds || [])
                          .map((id) => majorNameMap.get(id) ?? id)
                          .filter((name) => !!name);
                        const majorsFromNames = (course.suitability?.majors || []).filter(
                          (name) => name !== '其他专业',
                        );
                        const merged = Array.from(new Set([...majorsFromIds, ...majorsFromNames]));
                        const includeOthers = course.suitability?.majors?.includes('其他专业');
                        if (merged.length === 0 && !includeOthers) {
                          return null;
                        }
                        const labelParts = [];
                        if (merged.length > 0) {
                          labelParts.push(merged.join('、'));
                        }
                        if (includeOthers) {
                          labelParts.push('其他专业');
                        }
                        return (
                          <Chip
                            size="small"
                            color="success"
                            variant="outlined"
                            label={`专业：${labelParts.join('，')}`}
                          />
                        );
                      })()}
                    </Stack>
                  ) : null}
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
            <Stack spacing={2}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  课程管理
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  点击按钮打开弹窗表单后新增课程并同步到课程体系。
                </Typography>
              </Box>
              <Button
                startIcon={<AddCircleOutlineIcon />}
                variant="contained"
                onClick={handleOpenDialog}
                disabled={majorsQuery.isLoading}
              >
                新增课程
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={createDialogOpen} onClose={handleCloseDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreateCourse}>
          <DialogTitle>新增课程</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField label="课程名称" value={title} onChange={(event) => setTitle(event.target.value)} required fullWidth />
              <TextField label="讲师" value={teacher} onChange={(event) => setTeacher(event.target.value)} fullWidth />
              <TextField label="课程类型" value={category} onChange={(event) => setCategory(event.target.value)} fullWidth />
              <TextField
                label="所属专业"
                value={majorId}
                onChange={(event) => setMajorId(event.target.value)}
                select
                helperText={majorHelperText}
                disabled={majorsQuery.isLoading || majors.length === 0}
                required
                fullWidth
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
                fullWidth
              />
              <TextField
                label="下一步任务"
                value={nextTask}
                onChange={(event) => setNextTask(event.target.value)}
                placeholder="例如：完成第 3 讲课后习题"
                fullWidth
              />
              <TextField
                label="课程标签（可选）"
                value={tagsInput}
                onChange={(event) => setTagsInput(event.target.value)}
                placeholder="例如：英语二, 听力提升"
                helperText="用逗号分隔，便于前台展示课程特色"
                fullWidth
              />
              <TextField
                label="适用数学科目"
                value={selectedMathSubjects}
                onChange={(event) =>
                  setSelectedMathSubjects(
                    typeof event.target.value === 'string'
                      ? event.target.value.split(',')
                      : (event.target.value as string[]),
                  )
                }
                select
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) =>
                    (selected as string[]).length > 0
                      ? (selected as string[]).join('、')
                      : '不限',
                }}
                helperText="不选择表示对所有数学科目开放"
                fullWidth
              >
                {mathSubjectOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="适用英语科目"
                value={selectedEnglishSubjects}
                onChange={(event) =>
                  setSelectedEnglishSubjects(
                    typeof event.target.value === 'string'
                      ? event.target.value.split(',')
                      : (event.target.value as string[]),
                  )
                }
                select
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) =>
                    (selected as string[]).length > 0
                      ? (selected as string[]).join('、')
                      : '不限',
                }}
                helperText="不选择表示对所有英语科目开放"
                fullWidth
              >
                {englishSubjectOptions.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                label="适用专业范围"
                value={selectedMajorIds}
                onChange={(event) =>
                  setSelectedMajorIds(
                    typeof event.target.value === 'string'
                      ? event.target.value.split(',')
                      : (event.target.value as string[]),
                  )
                }
                select
                SelectProps={{
                  multiple: true,
                  renderValue: (selected) => {
                    const values = selected as string[];
                    if (values.length === 0) {
                      return '不限';
                    }
                    return values
                      .map((value) => (value === '__other__' ? '其他专业' : majorNameMap.get(value) ?? value))
                      .join('、');
                  },
                }}
                helperText="不选择表示适合所有专业，可加入“其他专业”覆盖跨考人群"
                fullWidth
              >
                {majors.map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
                <MenuItem value="__other__">其他专业</MenuItem>
              </TextField>
              <TextField
                label="备注（可选）"
                value={description}
                onChange={(event) => setDescription(event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseDialog} disabled={createCourseMutation.isPending}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={createCourseMutation.isPending}>
              {createCourseMutation.isPending ? '保存中…' : '保存课程'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default Courses;
