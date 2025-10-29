import {
  Alert,
  Avatar,
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
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  fetchMajors,
  fetchUserProfile,
  updateUserProfile,
  type MajorOption,
} from '../services/userService';

const Profile = () => {
  const { user, refreshUser } = useAuth();
  const queryClient = useQueryClient();

  const [formState, setFormState] = useState({
    name: '',
    email: '',
    phone: '',
    organization: '',
    goal: '',
    majorId: '',
    bio: '',
  });
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error' | 'info'; message: string } | null>(null);

  const profileQuery = useQuery({
    queryKey: ['profile', user?.id],
    queryFn: () => fetchUserProfile(user!.id),
    enabled: Boolean(user?.id),
  });

  const majorsQuery = useQuery({
    queryKey: ['majors'],
    queryFn: fetchMajors,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    if (profileQuery.data) {
      const profile = profileQuery.data;
      setFormState({
        name: profile.name ?? '',
        email: profile.email ?? '',
        phone: profile.phone ?? '',
        organization: profile.organization ?? '',
        goal: profile.goal ?? '',
        majorId: profile.majorId ?? '',
        bio: profile.bio ?? '',
      });
    }
  }, [profileQuery.data]);

  const updateProfileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateUserProfile>[1]) => updateUserProfile(user!.id, payload),
    onSuccess: (updated) => {
      setFeedback({ type: 'success', message: '个人资料已更新。' });
      refreshUser(updated);
      queryClient.setQueryData(['profile', user?.id], updated);
    },
    onError: () => {
      setFeedback({ type: 'error', message: '保存失败，请稍后重试。' });
    },
  });

  const handleSave = async () => {
    if (!user) return;
    setFeedback(null);
    try {
      await updateProfileMutation.mutateAsync({
        name: formState.name,
        email: formState.email,
        phone: formState.phone,
        organization: formState.organization,
        goal: formState.goal,
        bio: formState.bio,
        majorId: formState.majorId || null,
      });
    } catch (error) {
      // 错误提示已在 onError 中处理
    }
  };

  const profile = profileQuery.data ?? user;
  const isAdmin = (profile?.role ?? user?.role) === 'admin';
  const majors = majorsQuery.data ?? [];

  const goalLabel = isAdmin ? '教研重点' : '备考目标';
  const organizationLabel = isAdmin ? '所在团队 / 目标院校' : '目标院校';
  const majorLabel = isAdmin ? '负责专业' : '目标专业';
  const bioLabel = isAdmin ? '个人简介' : '学习自述';

  const tagChips = useMemo(() => {
    const source = formState.goal || profile?.goal || '';
    const tokens = source
      .split(/[,，、\s]+/)
      .map((token) => token.trim())
      .filter(Boolean)
      .slice(0, 6);
    if (tokens.length > 0) {
      return tokens;
    }
    return isAdmin ? ['教学教研', '题库管理', '督学服务'] : ['效率提升', '自律打卡', '冲刺提分'];
  }, [formState.goal, isAdmin, profile?.goal]);

  return (
    <Stack spacing={4}>
      {(profileQuery.isLoading || updateProfileMutation.isPending || majorsQuery.isLoading) && <LinearProgress />}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          个人中心
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {isAdmin
            ? '管理教研账号信息、设置负责的课程与题库范围，并同步团队协作进度。'
            : '管理账号信息、学习偏好及目标院校。完善信息可获得更精准的学习规划推荐。'}
        </Typography>
      </Box>

      {profileQuery.isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => profileQuery.refetch()}>
              重试
            </Button>
          }
        >
          暂时无法加载个人资料，请检查网络后再试。
        </Alert>
      )}

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}>
                {profile?.avatar ?? profile?.name?.slice(0, 1) ?? '研'}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {profile?.name ?? '未登录用户'}
              </Typography>
              <Chip
                label={isAdmin ? '教学管理员' : '考研学员'}
                color={isAdmin ? 'warning' : 'primary'}
                variant="outlined"
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                onClick={() => setFeedback({ type: 'info', message: '头像上传功能即将开放，可暂时使用姓名首字。' })}
              >
                上传头像
              </Button>
              <Divider flexItem />
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {majorLabel}
                </Typography>
                <Typography variant="body1">
                  {profile?.majorName || '暂未选择专业'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" mt={2}>
                  {goalLabel}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {tagChips.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={600}>
                {isAdmin ? '教研账号信息' : '基础信息'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="姓名"
                    value={formState.name}
                    onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="邮箱"
                    value={formState.email}
                    onChange={(event) => setFormState((prev) => ({ ...prev, email: event.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label="手机号"
                    value={formState.phone}
                    onChange={(event) => setFormState((prev) => ({ ...prev, phone: event.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <FormControl fullWidth>
                    <InputLabel id="major-select">{majorLabel}</InputLabel>
                    <Select
                      labelId="major-select"
                      label={majorLabel}
                      value={formState.majorId}
                      onChange={(event) =>
                        setFormState((prev) => ({ ...prev, majorId: event.target.value as string }))
                      }
                    >
                      <MenuItem value="">未选择</MenuItem>
                      {majors.map((major: MajorOption) => (
                        <MenuItem key={major.id} value={major.id}>
                          {major.name}
                        </MenuItem>
                      ))}
                    </Select>
                  </FormControl>
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={organizationLabel}
                    value={formState.organization}
                    onChange={(event) => setFormState((prev) => ({ ...prev, organization: event.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={goalLabel}
                    value={formState.goal}
                    onChange={(event) => setFormState((prev) => ({ ...prev, goal: event.target.value }))}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={bioLabel}
                    value={formState.bio}
                    onChange={(event) => setFormState((prev) => ({ ...prev, bio: event.target.value }))}
                    multiline
                    minRows={3}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button
                variant="contained"
                startIcon={<EditIcon />}
                sx={{ alignSelf: 'flex-end' }}
                onClick={handleSave}
                disabled={updateProfileMutation.isPending}
              >
                {updateProfileMutation.isPending ? '保存中…' : '保存修改'}
              </Button>
            </Stack>
          </Paper>

          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                {isAdmin ? '协同备忘录' : '学习偏好设置'}
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={isAdmin ? '本周重点项目' : '每日目标时长'}
                    placeholder={isAdmin ? '例如：课程大纲复核' : '例如：6 小时'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={isAdmin ? '团队协作事项' : '偏好学习时段'}
                    placeholder={isAdmin ? '需要同事协助的事项' : '例如：上午、晚间'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12}>
                  <TextField
                    label={isAdmin ? '需要支持' : '当前难点'}
                    placeholder={isAdmin ? '如：题库评测策略调整' : '如：数据结构、政治主观题'}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button variant="outlined" sx={{ alignSelf: 'flex-end' }}>
                {isAdmin ? '记录协同事项' : '更新学习偏好'}
              </Button>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Profile;
