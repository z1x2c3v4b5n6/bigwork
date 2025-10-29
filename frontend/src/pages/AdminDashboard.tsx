import {
  Avatar,
  Box,
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
import SecurityIcon from '@mui/icons-material/Security';
import GroupIcon from '@mui/icons-material/Group';
import AssessmentIcon from '@mui/icons-material/Assessment';
import InsightsIcon from '@mui/icons-material/Insights';

const students = [
  {
    name: '刘亦',
    university: '北京理工大学',
    studyHours: '18h',
    completion: 0.82,
  },
  {
    name: '王琪',
    university: '华中科技大学',
    studyHours: '21h',
    completion: 0.91,
  },
  {
    name: '陈思',
    university: '上海交通大学',
    studyHours: '15h',
    completion: 0.68,
  },
];

const auditLogs = [
  {
    title: '手动开启强化训练营',
    description: '学习运营 · 5 分钟前',
  },
  {
    title: '导出 2024 级学员学习数据',
    description: '系统 · 20 分钟前',
  },
  {
    title: '新增管理员账户「李老师」',
    description: '超级管理员 · 1 小时前',
  },
];

const AdminDashboard = () => {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          管理员控制台
        </Typography>
        <Typography variant="body1" color="text.secondary">
          审视平台整体运营情况、管理学员账号及监控关键指标。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main' }}>
                <GroupIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  活跃学员
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  2,348
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'success.main' }}>
                <AssessmentIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  今日完成任务
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  864
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'warning.main' }}>
                <InsightsIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  跟进提醒
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  37
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={3}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack direction="row" spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'secondary.main' }}>
                <SecurityIcon />
              </Avatar>
              <Box>
                <Typography variant="subtitle2" color="text.secondary">
                  系统告警
                </Typography>
                <Typography variant="h5" fontWeight={700}>
                  5
                </Typography>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack spacing={2}>
              <Box display="flex" alignItems="center" justifyContent="space-between">
                <Typography variant="h6" fontWeight={600}>
                  学员学习进度
                </Typography>
                <Chip label="本周" color="primary" variant="outlined" />
              </Box>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <TableCell>学员</TableCell>
                    <TableCell>目标院校</TableCell>
                    <TableCell>本周学习时长</TableCell>
                    <TableCell align="right">完成率</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {students.map((student) => (
                    <TableRow key={student.name} hover>
                      <TableCell>
                        <Stack direction="row" spacing={2} alignItems="center">
                          <Avatar>{student.name.charAt(0)}</Avatar>
                          <Typography variant="subtitle2">{student.name}</Typography>
                        </Stack>
                      </TableCell>
                      <TableCell>{student.university}</TableCell>
                      <TableCell>{student.studyHours}</TableCell>
                      <TableCell align="right" sx={{ minWidth: 140 }}>
                        <Stack spacing={1}>
                          <Typography variant="body2" fontWeight={600}>
                            {(student.completion * 100).toFixed(0)}%
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={student.completion * 100}
                            sx={{ height: 6, borderRadius: 999 }}
                          />
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack spacing={2}>
              <Typography variant="h6" fontWeight={600}>
                最新操作日志
              </Typography>
              <List disablePadding>
                {auditLogs.map((item) => (
                  <ListItem key={item.title} disableGutters sx={{ alignItems: 'flex-start', py: 1.5 }}>
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
                        <Typography variant="body2" color="text.secondary">
                          {item.description}
                        </Typography>
                      }
                    />
                  </ListItem>
                ))}
              </List>
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
              <Stack direction="row" spacing={1}>
                <Chip label="李老师" color="primary" />
                <Chip label="赵老师" color="primary" variant="outlined" />
                <Chip label="孙老师" color="primary" variant="outlined" />
              </Stack>
            </Stack>
            <Stack spacing={1}>
              <Typography variant="subtitle2" color="text.secondary">
                安全提示
              </Typography>
              <Typography variant="body2" color="text.secondary">
                建议启用双因素认证，并定期复审管理员账户权限，确保敏感数据安全。
              </Typography>
            </Stack>
          </Stack>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
