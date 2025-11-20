import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import {
  fetchMajors,
  fetchUserProfile,
  updateUserProfile,
  updateExamProfile,
  type MajorOption,
  type UserProfile,
} from '../services/userService';
import uploadService from '../services/uploadService';
import { readFileAsDataUrl } from '../utils/fileUtils';
import { resolveAssetUrl } from '../utils/url';
import InstitutionBrochureManager from '../components/InstitutionBrochureManager';

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
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarUploading, setAvatarUploading] = useState(false);
  const [examDialogOpen, setExamDialogOpen] = useState(false);
  const [examDialogError, setExamDialogError] = useState<string | null>(null);
  const [examForm, setExamForm] = useState({
    totalScore: '',
    targetMajor: '',
    mathSubject: '',
    englishSubject: '',
    majorId: '',
  });

  const profileQuery = useQuery<UserProfile>({
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
      setAvatarPreview(resolveAssetUrl(profile.avatar ?? user?.avatar ?? null));
    }
  }, [profileQuery.data, user?.avatar]);

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

  const avatarMutation = useMutation({
    mutationFn: (payload: { avatar: string }) => updateUserProfile(user!.id, payload),
    onSuccess: (updated) => {
      setFeedback({ type: 'success', message: '头像已更新。' });
      refreshUser(updated);
      queryClient.setQueryData(['profile', user?.id], updated);
    },
    onError: () => {
      setFeedback({ type: 'error', message: '上传头像失败，请稍后重试。' });
    },
  });

  const updateExamProfileMutation = useMutation({
    mutationFn: (payload: Parameters<typeof updateExamProfile>[1]) => updateExamProfile(user!.id, payload),
    onSuccess: (updated) => {
      setFeedback({ type: 'success', message: '考试档案已更新。' });
      refreshUser(updated);
      queryClient.setQueryData(['profile', user?.id], updated);
      setExamDialogError(null);
      setExamDialogOpen(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '更新考试档案失败，请稍后重试。';
      setExamDialogError(message);
    },
  });

  const handleAvatarChange = async (event: ChangeEvent<HTMLInputElement>) => {
    if (!user) {
      return;
    }

    const file = event.target.files?.[0];
    if (!file) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      setFeedback({ type: 'error', message: '请上传图片格式的头像文件。' });
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      setFeedback({ type: 'error', message: '头像大小不能超过 2MB。' });
      return;
    }

    try {
      setAvatarUploading(true);
      const dataUrl = await readFileAsDataUrl(file);
      const result = await uploadService.uploadAvatar({ dataUrl, filename: file.name });
      const absoluteUrl = resolveAssetUrl(result.url) ?? result.url;
      setAvatarPreview(absoluteUrl);
      await avatarMutation.mutateAsync({ avatar: result.url });
    } catch (error) {
      setFeedback({ type: 'error', message: '上传头像失败，请稍后重试。' });
    } finally {
      setAvatarUploading(false);
      if (event.target) {
        event.target.value = '';
      }
    }
  };

  const handleOpenExamDialog = () => {
    if (!user) {
      return;
    }
    setExamDialogError(null);
    setExamForm({
      totalScore: examProfile?.totalScore != null ? String(examProfile.totalScore) : '',
      targetMajor: examProfile?.targetMajor ?? '',
      mathSubject: examProfile?.mathSubject ?? '',
      englishSubject: examProfile?.englishSubject ?? '',
      majorId: examProfile?.majorId ?? formState.majorId ?? '',
    });
    setExamDialogOpen(true);
  };

  const handleCloseExamDialog = () => {
    if (updateExamProfileMutation.isPending) {
      return;
    }
    setExamDialogOpen(false);
  };

  const handleSubmitExamProfile = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setExamDialogError(null);

    const trimmedScore = examForm.totalScore.trim();
    if (trimmedScore) {
      const numeric = Number(trimmedScore);
      if (!Number.isFinite(numeric) || numeric < 0) {
        setExamDialogError('请输入有效的初试总分');
        return;
      }
    }

    await updateExamProfileMutation.mutateAsync({
      totalScore: trimmedScore ? Number(trimmedScore) : null,
      targetMajor: examForm.targetMajor.trim() ? examForm.targetMajor.trim() : null,
      mathSubject: examForm.mathSubject || null,
      englishSubject: examForm.englishSubject || null,
      majorId: examForm.majorId || null,
    });
  };

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

  const profile = profileQuery.data ?? (user as UserProfile | null);
  const isAdmin = (profile?.role ?? user?.role) === 'admin';
  const isInstitution = (profile?.role ?? user?.role) === 'institution';
  const majors = majorsQuery.data ?? [];
  const examProfile = profile?.examProfile ?? user?.examProfile ?? null;
  const mathSubjectOptions = ['数学一', '数学二', '数学三', '不考数学'];
  const englishSubjectOptions = ['英语一', '英语二', '不考英语'];

  const goalLabel = isAdmin ? '教研重点' : isInstitution ? '招生重点' : '备考目标';
  const organizationLabel = isAdmin
    ? '所在团队 / 目标院校'
    : isInstitution
    ? '院校简称 / 办学单位'
    : '目标院校';
  const majorLabel = isAdmin ? '负责专业' : isInstitution ? '重点招生专业' : '目标专业';
  const bioLabel = isAdmin ? '个人简介' : isInstitution ? '院校亮点介绍' : '学习自述';

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
    if (isAdmin) {
      return ['教学教研', '题库管理', '督学服务'];
    }
    if (isInstitution) {
      return ['招生咨询', '复试指南', '宣讲活动'];
    }
    return ['效率提升', '自律打卡', '冲刺提分'];
  }, [formState.goal, isAdmin, isInstitution, profile?.goal]);

  const profileDescription = isAdmin
    ? '管理教研账号信息、设置负责的课程与题库范围，并同步团队协作进度。'
    : isInstitution
    ? '完善院校介绍、招生重点与最新简章，系统将向关注的考生推送更新提醒。'
    : '管理账号信息、学习偏好及目标院校。完善信息可获得更精准的学习规划推荐。';

  const infoCompleteness = useMemo(() => {
    const fields = [formState.name, formState.email, formState.phone, formState.organization, formState.goal, formState.majorId];
    const filled = fields.filter((value) => Boolean(value && String(value).trim())).length;
    return Math.round((filled / fields.length) * 100);
  }, [formState.email, formState.goal, formState.majorId, formState.name, formState.organization, formState.phone]);

  const goalTarget = 390;
  const currentScore = examProfile?.totalScore ?? 365;
  const goalProgress = Math.min(100, Math.round((currentScore / goalTarget) * 100));

  return (
    <Stack spacing={4}>
      {(profileQuery.isLoading || updateProfileMutation.isPending || avatarMutation.isPending || avatarUploading || majorsQuery.isLoading) && <LinearProgress />}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          个人中心
        </Typography>
        <Typography variant="body1" color="text.secondary">
          {profileDescription}
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
              <Avatar
                sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}
                src={avatarPreview ?? undefined}
                alt={profile?.name ?? '用户头像'}
              >
                {profile?.name?.slice(0, 1) ?? '研'}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {profile?.name ?? '未登录用户'}
              </Typography>
              <Chip
                label={isAdmin ? '教学管理员' : isInstitution ? '院校官方号' : '考研学员'}
                color={isAdmin ? 'warning' : isInstitution ? 'secondary' : 'primary'}
                variant="outlined"
              />
              <Button
                variant="outlined"
                startIcon={<CloudUploadIcon />}
                component="label"
                disabled={avatarUploading || avatarMutation.isPending}
              >
                {avatarUploading || avatarMutation.isPending ? '上传中…' : '上传头像'}
                <input type="file" accept="image/*" hidden onChange={handleAvatarChange} />
              </Button>
              <Typography variant="caption" color="text.secondary">
                支持 JPG/PNG 等图片格式，建议尺寸 400×400，大小不超过 2MB。
              </Typography>
              <Divider flexItem />
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {majorLabel}
                </Typography>
                <Typography variant="body1">
                  {profile?.majorName || '暂未选择专业'}
                </Typography>
                <Stack spacing={1} mt={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      目标完成进度
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      目标 {goalTarget}+ · 当前 {currentScore}
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={goalProgress}
                    sx={{ height: 8, borderRadius: 999 }}
                    color={goalProgress >= 80 ? 'success' : 'primary'}
                  />
                </Stack>
                <Stack spacing={1} mt={1.5}>
                  <Stack direction="row" justifyContent="space-between" alignItems="center">
                    <Typography variant="subtitle2" color="text.secondary">
                      资料完整度
                    </Typography>
                    <Typography variant="caption" color="text.secondary">
                      {infoCompleteness}%
                    </Typography>
                  </Stack>
                  <LinearProgress
                    variant="determinate"
                    value={infoCompleteness}
                    sx={{ height: 8, borderRadius: 999 }}
                    color={infoCompleteness > 80 ? 'success' : 'warning'}
                  />
                  <Typography variant="caption" color="text.secondary">
                    补充学校、专业、联系方式等信息，可提升推荐准确度。
                  </Typography>
                </Stack>
                <Typography variant="subtitle2" color="text.secondary" mt={2}>
                  {goalLabel}
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {tagChips.map((tag) => (
                    <Chip key={tag} label={tag} size="small" />
                  ))}
                </Stack>
                <Divider flexItem sx={{ my: 2 }} />
                <Stack spacing={1}>
                  <Stack direction="row" alignItems="center" justifyContent="space-between">
                    <Typography variant="subtitle2" color="text.secondary">
                      我的考试档案
                    </Typography>
                    <Button
                      size="small"
                      variant="outlined"
                      startIcon={<EditIcon fontSize="small" />}
                      onClick={handleOpenExamDialog}
                      disabled={updateExamProfileMutation.isPending}
                    >
                      {examProfile ? '编辑档案' : '完善档案'}
                    </Button>
                  </Stack>
                  {examProfile ? (
                    <Stack spacing={1}>
                      <Typography variant="h6" fontWeight={600}>
                        {examProfile.totalScore != null ? `${examProfile.totalScore} 分` : '尚未填写分数'}
                      </Typography>
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {examProfile.mathSubject ? (
                          <Chip label={`数学：${examProfile.mathSubject}`} size="small" variant="outlined" />
                        ) : null}
                        {examProfile.englishSubject ? (
                          <Chip label={`英语：${examProfile.englishSubject}`} size="small" variant="outlined" />
                        ) : null}
                        {examProfile.targetMajor ? (
                          <Chip label={`目标专业：${examProfile.targetMajor}`} size="small" variant="outlined" />
                        ) : null}
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        填写的成绩与科目信息将同步到首页推荐与院校顾问中，便于系统自动筛选院校与课程。
                      </Typography>
                    </Stack>
                  ) : (
                    <Typography variant="body2" color="text.secondary">
                      暂无考试档案信息，可在注册时填写或联系管理员补充以获取更精准推荐。
                    </Typography>
                  )}
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

      <Dialog open={examDialogOpen} onClose={handleCloseExamDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleSubmitExamProfile}>
          <DialogTitle>更新考试档案</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="初试总分"
                type="number"
                value={examForm.totalScore}
                onChange={(event) =>
                  setExamForm((prev) => ({ ...prev, totalScore: event.target.value }))
                }
                inputProps={{ min: 0, max: 500 }}
                helperText="可输入最近一次统考成绩，留空表示暂未填写"
                fullWidth
              />
              <TextField
                label="目标专业（可选）"
                value={examForm.targetMajor}
                onChange={(event) =>
                  setExamForm((prev) => ({ ...prev, targetMajor: event.target.value }))
                }
                placeholder="如 计算机科学、金融等"
                fullWidth
              />
              <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
                <TextField
                  select
                  label="数学科目"
                  value={examForm.mathSubject}
                  onChange={(event) =>
                    setExamForm((prev) => ({ ...prev, mathSubject: event.target.value }))
                  }
                  helperText="选择报考的数学类别"
                  fullWidth
                >
                  <MenuItem value="">不限</MenuItem>
                  {mathSubjectOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
                <TextField
                  select
                  label="英语科目"
                  value={examForm.englishSubject}
                  onChange={(event) =>
                    setExamForm((prev) => ({ ...prev, englishSubject: event.target.value }))
                  }
                  helperText="选择报考的英语类别"
                  fullWidth
                >
                  <MenuItem value="">不限</MenuItem>
                  {englishSubjectOptions.map((option) => (
                    <MenuItem key={option} value={option}>
                      {option}
                    </MenuItem>
                  ))}
                </TextField>
              </Stack>
              <TextField
                select
                label="目标专业方向"
                value={examForm.majorId}
                onChange={(event) =>
                  setExamForm((prev) => ({ ...prev, majorId: event.target.value }))
                }
                helperText="同步到课程与推荐系统使用的目标专业，可留空"
                fullWidth
              >
                <MenuItem value="">未选择</MenuItem>
                {majors.map((major) => (
                  <MenuItem key={major.id} value={major.id}>
                    {major.name}
                  </MenuItem>
                ))}
              </TextField>
            </Stack>
            {examDialogError ? (
              <Alert severity="error" sx={{ mt: 2 }}>
                {examDialogError}
              </Alert>
            ) : null}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseExamDialog} disabled={updateExamProfileMutation.isPending}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={updateExamProfileMutation.isPending}>
              {updateExamProfileMutation.isPending ? '保存中…' : '保存档案'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      {isInstitution && <InstitutionBrochureManager />}
    </Stack>
  );
};

export default Profile;
