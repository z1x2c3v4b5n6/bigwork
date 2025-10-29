import {
  Avatar,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import EditIcon from '@mui/icons-material/Edit';
import CloudUploadIcon from '@mui/icons-material/CloudUpload';
import { useMemo } from 'react';
import { useAuth } from '../context/AuthContext';

const Profile = () => {
  const { user } = useAuth();
  const isAdmin = user?.role === 'admin';

  const tagChips = useMemo(() => {
    if (isAdmin) {
      return ['教学教研', '题库管理', '督学服务'];
    }
    return ['高效', '自律', '冲刺'];
  }, [isAdmin]);

  return (
    <Stack spacing={4}>
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

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}>
                {user?.avatar ?? '研'}
              </Avatar>
              <Typography variant="h6" fontWeight={600}>
                {user?.name ?? '未登录用户'}
              </Typography>
              <Chip
                label={isAdmin ? '教学管理员' : '2025 考研学员'}
                color={isAdmin ? 'warning' : 'primary'}
                variant="outlined"
              />
              <Button variant="outlined" startIcon={<CloudUploadIcon />}>上传头像</Button>
              <Divider flexItem />
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  {isAdmin ? '负责课程方向' : '目标专业'}
                </Typography>
                <Typography variant="body1">
                  {isAdmin ? '数学冲刺班、英语写作密训营' : '计算机科学与技术 · 北京理工大学'}
                </Typography>
                <Typography variant="subtitle2" color="text.secondary" mt={2}>
                  {isAdmin ? '擅长领域' : '备考关键词'}
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
                  <TextField label="手机号" value={isAdmin ? '135****8888' : '138****5678'} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="邮箱" value={user?.email ?? 'example@email.com'} fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={isAdmin ? '所在团队' : '目标院校'}
                    value={isAdmin ? user?.organization ?? '研学进阶教研组' : '北京理工大学'}
                    fullWidth
                  />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField
                    label={isAdmin ? '负责学科' : '目标专业'}
                    value={isAdmin ? '数学、英语、政治' : '计算机科学与技术'}
                    fullWidth
                  />
                </Grid>
              </Grid>
              <Button variant="contained" startIcon={<EditIcon />} sx={{ alignSelf: 'flex-end' }}>
                {isAdmin ? '保存教研档案' : '保存修改'}
              </Button>
            </Stack>
          </Paper>

          {isAdmin ? (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={600}>
                  团队协作速记
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="本周重点项目" value="政治冲刺班资料校对" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="即将上线课程" value="408 算法拔高营" fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="需要支持" value="题库 AI 评测权重调整" fullWidth />
                  </Grid>
                </Grid>
                <Button variant="outlined" sx={{ alignSelf: 'flex-end' }}>
                  更新协作记录
                </Button>
              </Stack>
            </Paper>
          ) : (
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', mt: 3 }}>
              <Stack spacing={2}>
                <Typography variant="h6" fontWeight={600}>
                  学习偏好设置
                </Typography>
                <Grid container spacing={2}>
                  <Grid item xs={12} sm={6}>
                    <TextField label="每日目标时长" value="6 小时" fullWidth />
                  </Grid>
                  <Grid item xs={12} sm={6}>
                    <TextField label="偏好学习时段" value="上午、晚间" fullWidth />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField label="当前难点" value="数据结构-图、政治主观题" fullWidth />
                  </Grid>
                </Grid>
                <Button variant="outlined" sx={{ alignSelf: 'flex-end' }}>
                  更新偏好
                </Button>
              </Stack>
            </Paper>
          )}
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Profile;
