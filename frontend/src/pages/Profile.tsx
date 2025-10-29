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

const Profile = () => {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          个人中心
        </Typography>
        <Typography variant="body1" color="text.secondary">
          管理账号信息、学习偏好及目标院校。完善信息可获得更精准的学习规划推荐。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ width: 88, height: 88, bgcolor: 'primary.main', fontSize: 32 }}>张</Avatar>
              <Typography variant="h6" fontWeight={600}>
                张同学
              </Typography>
              <Chip label="24 考研" color="primary" variant="outlined" />
              <Button variant="outlined" startIcon={<CloudUploadIcon />}>上传头像</Button>
              <Divider flexItem />
              <Stack spacing={1} sx={{ width: '100%' }}>
                <Typography variant="subtitle2" color="text.secondary">
                  目标专业
                </Typography>
                <Typography variant="body1">计算机科学与技术 · 北京理工大学</Typography>
                <Typography variant="subtitle2" color="text.secondary" mt={2}>
                  备考关键词
                </Typography>
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  <Chip label="高效" size="small" />
                  <Chip label="自律" size="small" />
                  <Chip label="冲刺" size="small" />
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={3}>
              <Typography variant="h6" fontWeight={600}>
                基础信息
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                  <TextField label="手机号" value="138****5678" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="邮箱" value="zhangxx@email.com" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="目标院校" value="北京理工大学" fullWidth />
                </Grid>
                <Grid item xs={12} sm={6}>
                  <TextField label="目标专业" value="计算机科学与技术" fullWidth />
                </Grid>
              </Grid>
              <Button variant="contained" startIcon={<EditIcon />} sx={{ alignSelf: 'flex-end' }}>
                保存修改
              </Button>
            </Stack>
          </Paper>

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
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Profile;
