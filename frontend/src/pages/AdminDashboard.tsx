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
  ListItemText,
  MenuItem,
  Paper,
  Stack,
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableRow,
  TextField,
  Typography,
} from '@mui/material';
import AnalyticsIcon from '@mui/icons-material/Analytics';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import LibraryBooksIcon from '@mui/icons-material/LibraryBooks';
import UploadIcon from '@mui/icons-material/Upload';
import AddTaskIcon from '@mui/icons-material/AddTask';
import { useState } from 'react';

interface CourseDraft {
  id: string;
  name: string;
  category: string;
  status: '待发布' | '已发布' | '待完善';
  teacher: string;
  updatedAt: string;
}

const initialDrafts: CourseDraft[] = [
  {
    id: 'draft-001',
    name: '数学强化课 · 高频考点 50 讲',
    category: '数学',
    status: '待发布',
    teacher: '赵老师',
    updatedAt: '2024-04-10',
  },
  {
    id: 'draft-002',
    name: '政治主观题答题框架班',
    category: '政治',
    status: '待完善',
    teacher: '王老师',
    updatedAt: '2024-04-08',
  },
  {
    id: 'draft-003',
    name: '英语二冲刺模考密卷',
    category: '英语',
    status: '已发布',
    teacher: '刘老师',
    updatedAt: '2024-04-05',
  },
];

const AdminDashboard = () => {
  const [drafts, setDrafts] = useState(initialDrafts);
  const [newCourse, setNewCourse] = useState({ name: '', category: '', teacher: '' });
  const [syncing, setSyncing] = useState(false);

  const handlePublish = (draftId: string) => {
    setDrafts((prev) =>
      prev.map((draft) => (draft.id === draftId ? { ...draft, status: '已发布', updatedAt: '刚刚' } : draft)),
    );
  };

  const handleCreateCourse = () => {
    if (!newCourse.name || !newCourse.category || !newCourse.teacher) {
      return;
    }
    const draft: CourseDraft = {
      id: `draft-${Date.now()}`,
      name: newCourse.name,
      category: newCourse.category,
      status: '待发布',
      teacher: newCourse.teacher,
      updatedAt: '刚刚',
    };
    setDrafts((prev) => [draft, ...prev]);
    setNewCourse({ name: '', category: '', teacher: '' });
  };

  const handleSync = async () => {
    setSyncing(true);
    await new Promise((resolve) => setTimeout(resolve, 1200));
    setSyncing(false);
  };

  return (
    <Stack spacing={4}>
      {syncing && <LinearProgress color="secondary" />}

      <Stack spacing={1}>
        <Typography variant="h4" fontWeight={700}>
          教学管理驾驶舱
        </Typography>
        <Typography variant="body1" color="text.secondary">
          快速掌握课程发布、题库运营与学员学情的核心指标，构建以数据驱动的教学决策流程。
        </Typography>
      </Stack>

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <AnalyticsIcon color="primary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    学情数据同步
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    最近一次同步：2024-04-10 21:30
                  </Typography>
                </Box>
              </Stack>
              <Button variant="contained" onClick={handleSync} startIcon={<UploadIcon />} disabled={syncing}>
                {syncing ? '同步中…' : '同步后端数据仓'}
              </Button>
              <Alert severity="info" sx={{ bgcolor: 'primary.50' }}>
                已接入 5 个学院的智能学情上报接口，支持实时监控薄弱知识点分布。
              </Alert>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <PendingActionsIcon color="secondary" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    待处理事项
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    今日需审核 12 套题单与 4 项课程变更。
                  </Typography>
                </Box>
              </Stack>
              <List dense>
                <ListItem>
                  <ListItemText primary="数学冲刺题单 · 阶段性反馈" secondary="需复核 AI 评分准则" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="英语写作模板更新" secondary="待确认示例作文是否合规" />
                </ListItem>
                <ListItem>
                  <ListItemText primary="数据结构强化班新增章节" secondary="确认新增实验题答案" />
                </ListItem>
              </List>
            </Stack>
          </Paper>
        </Grid>

        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <LibraryBooksIcon color="success" />
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    资源规划
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    下周重点：上线《408 算法拔高营》与政治主观题密训。
                  </Typography>
                </Box>
              </Stack>
              <Stack direction="row" spacing={1} flexWrap="wrap">
                <Chip label="题库升级" color="primary" variant="outlined" />
                <Chip label="课件排期" color="secondary" variant="outlined" />
                <Chip label="督学运营" color="success" variant="outlined" />
              </Stack>
              <Typography variant="body2" color="text.secondary">
                可通过下方“课程产出”快速录入新课并安排教学团队上线节奏。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={3}>
          <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
            <Box sx={{ flex: 1 }}>
              <Typography variant="h6" fontWeight={700}>
                课程产出与发布排期
              </Typography>
              <Typography variant="body2" color="text.secondary">
                填写新课程信息后即可生成校审流程，AI 会根据往期数据匹配最佳上线窗口。
              </Typography>
            </Box>
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="课程名称"
                value={newCourse.name}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, name: event.target.value }))}
              />
              <TextField
                label="所属科目"
                select
                value={newCourse.category}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, category: event.target.value }))}
                sx={{ minWidth: 160 }}
              >
                <MenuItem value="数学">数学</MenuItem>
                <MenuItem value="政治">政治</MenuItem>
                <MenuItem value="英语">英语</MenuItem>
                <MenuItem value="专业课">专业课</MenuItem>
              </TextField>
              <TextField
                label="主讲老师"
                value={newCourse.teacher}
                onChange={(event) => setNewCourse((prev) => ({ ...prev, teacher: event.target.value }))}
                sx={{ minWidth: 160 }}
              />
              <Button variant="contained" startIcon={<AddTaskIcon />} onClick={handleCreateCourse}>
                新建课程草稿
              </Button>
            </Stack>
          </Stack>

          <Divider />

          <Table size="small">
            <TableHead>
              <TableRow>
                <TableCell>课程名称</TableCell>
                <TableCell>科目</TableCell>
                <TableCell>主讲老师</TableCell>
                <TableCell>状态</TableCell>
                <TableCell>更新时间</TableCell>
                <TableCell align="right">操作</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {drafts.map((draft) => (
                <TableRow key={draft.id} hover>
                  <TableCell>{draft.name}</TableCell>
                  <TableCell>{draft.category}</TableCell>
                  <TableCell>{draft.teacher}</TableCell>
                  <TableCell>
                    <Chip
                      size="small"
                      color={draft.status === '已发布' ? 'success' : draft.status === '待完善' ? 'warning' : 'default'}
                      label={draft.status}
                    />
                  </TableCell>
                  <TableCell>{draft.updatedAt}</TableCell>
                  <TableCell align="right">
                    <Stack direction="row" spacing={1} justifyContent="flex-end">
                      <Button variant="outlined" size="small">
                        校对
                      </Button>
                      <Button variant="contained" size="small" onClick={() => handlePublish(draft.id)}>
                        一键发布
                      </Button>
                    </Stack>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </Stack>
      </Paper>
    </Stack>
  );
};

export default AdminDashboard;
