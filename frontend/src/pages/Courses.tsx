import {
  Box,
  Chip,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  Paper,
  Stack,
  Typography,
} from '@mui/material';
import PlayCircleIcon from '@mui/icons-material/PlayCircle';
import AutoStoriesIcon from '@mui/icons-material/AutoStories';
import SchoolIcon from '@mui/icons-material/School';
import { courseProgressData } from '../data/dashboard';

const Courses = () => {
  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          课程体系
        </Typography>
        <Typography variant="body1" color="text.secondary">
          覆盖公共课与专业课的系统课程，结合阶段性冲刺班、直播答疑与资料下载，助你构建完整知识网络。
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {courseProgressData.map((course) => (
          <Grid item xs={12} md={4} key={course.id}>
            <Paper elevation={0} sx={{ p: 3, border: '1px solid', borderColor: 'divider', borderRadius: 3 }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {course.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    讲师：{course.teacher}
                  </Typography>
                </Box>
                <Chip label={course.category} color="primary" variant="outlined" sx={{ alignSelf: 'flex-start' }} />
                <Typography variant="body2">当前进度：{course.progress}%</Typography>
                <Divider />
                <Stack spacing={1}>
                  <Typography variant="subtitle2" color="text.secondary">
                    推荐学习路径
                  </Typography>
                  <Typography variant="body2">· 课前预习知识框架，列出疑问点</Typography>
                  <Typography variant="body2">· 课中关注例题拆解与解题策略</Typography>
                  <Typography variant="body2">· 课后完成配套练习并整理错题本</Typography>
                </Stack>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

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
    </Stack>
  );
};

export default Courses;
