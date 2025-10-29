import {
  Alert,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Drawer,
  FormControl,
  Grid,
  InputLabel,
  LinearProgress,
  MenuItem,
  Paper,
  Select,
  SelectChangeEvent,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import TimerIcon from '@mui/icons-material/Timer';
import FlagIcon from '@mui/icons-material/Flag';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import InsightsIcon from '@mui/icons-material/Insights';
import PsychologyIcon from '@mui/icons-material/Psychology';
import { useMemo, useState } from 'react';
import useDashboardData from '../hooks/useDashboardData';
import type { PracticeSet } from '../data/dashboard';

interface TrainingFormState {
  name: string;
  duration: string;
  focus: string;
  difficulty: '基础' | '进阶' | '冲刺';
}

const initialForm: TrainingFormState = {
  name: '强化算法与数据结构薄弱点',
  duration: '45',
  focus: '图论、动态规划、英语完形填空',
  difficulty: '进阶',
};

const Practice = () => {
  const { data, isFetching, isError, refetch } = useDashboardData();
  const [customSets, setCustomSets] = useState<PracticeSet[]>([]);
  const [formState, setFormState] = useState(initialForm);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDiagnosisOpen, setDiagnosisOpen] = useState(false);
  const [creationHint, setCreationHint] = useState<{ type: 'info' | 'error'; message: string } | null>(null);

  const practiceSets = useMemo(() => {
    const presets = data?.practiceSets ?? [];
    return [...customSets, ...presets];
  }, [customSets, data?.practiceSets]);

  const diagnosisItems = useMemo(
    () => [
      {
        title: '数学 · 线性代数',
        weakness: '行列式求值、特征值题型正确率 46%',
        suggestion: '安排 3 次 30 分钟短测，重点回顾基础公式与矩阵运算。',
      },
      {
        title: '英语 · 长难句翻译',
        weakness: '语法结构分析失误率 38%',
        suggestion: '每日精读 1 篇真题文章，并在训练中开启 AI 语法点评。',
      },
      {
        title: '408 · 数据结构',
        weakness: '图论最短路径算法遗忘率高',
        suggestion: '新增「算法可视化演练」模块，使用 2 次主观题强化。',
      },
    ],
    [],
  );

  const handleDifficultyChange = (event: SelectChangeEvent<TrainingFormState['difficulty']>) => {
    setFormState((prev) => ({ ...prev, difficulty: event.target.value as TrainingFormState['difficulty'] }));
  };

  const handleCreateTraining = () => {
    if (!formState.name.trim()) {
      setCreationHint({ type: 'error', message: '请填写专项训练名称' });
      return;
    }
    const newSet: PracticeSet = {
      id: `custom-${Date.now()}`,
      name: formState.name,
      questions: 25,
      accuracy: 0.5,
      lastAttempt: new Date().toISOString(),
    };
    setCustomSets((prev) => [newSet, ...prev]);
    setCreateDialogOpen(false);
    setCreationHint({ type: 'info', message: '已生成专项训练草稿，可在题库列表中查看。' });
    setFormState(initialForm);
  };

  return (
    <Stack spacing={4}>
      {isFetching && <LinearProgress color="secondary" />}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              重试
            </Button>
          }
        >
          刷题数据暂时不可用，当前为示例内容。
        </Alert>
      )}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          刷题训练营
        </Typography>
        <Typography variant="body1" color="text.secondary">
          自适应刷题系统会根据你的错题记录与掌握度调整题目难度，帮助你高效夯实薄弱环节。
        </Typography>
      </Box>

      {creationHint && (
        <Alert
          severity={creationHint.type === 'error' ? 'error' : 'info'}
          onClose={() => setCreationHint(null)}
          icon={<PsychologyIcon />}
        >
          {creationHint.message}
        </Alert>
      )}

      <Grid container spacing={3}>
        {practiceSets.map((practice) => (
          <Grid item xs={12} md={4} key={practice.id}>
            <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {practice.name}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    题量 {practice.questions} · 正确率 {(practice.accuracy * 100).toFixed(0)}%
                  </Typography>
                  <Typography variant="caption" color="text.secondary">
                    最近训练：{practice.lastAttempt}
                  </Typography>
                </Box>
                <Stack direction="row" spacing={1}>
                  <Chip label="智能组卷" color="primary" variant="outlined" />
                  <Chip label="错题回顾" color="secondary" variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button variant="contained" startIcon={<TimerIcon />} fullWidth>
                    30 分钟冲刺
                  </Button>
                  <Button variant="outlined" startIcon={<FlagIcon />} fullWidth>
                    攻克考点
                  </Button>
                </Stack>
                <Button startIcon={<RestartAltIcon />} color="inherit">
                  重新练习该套题
                </Button>
              </Stack>
            </Paper>
          </Grid>
        ))}
      </Grid>

      <Paper elevation={0} sx={{ p: 4, borderRadius: 4, background: 'linear-gradient(120deg, #fff8e1, #ffe0b2)' }}>
        <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} alignItems="center">
          <Box sx={{ flex: 1 }}>
            <Typography variant="h5" fontWeight={700}>
              AI 自适应训练
            </Typography>
            <Typography variant="body1" color="text.secondary" mt={1}>
              系统自动识别薄弱知识点，为你分配分层练习题单，并实时评估掌握度。
            </Typography>
          </Box>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
            <Button variant="contained" color="secondary" startIcon={<PsychologyIcon />} onClick={() => setCreateDialogOpen(true)}>
              创建专项训练
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<InsightsIcon />} onClick={() => setDiagnosisOpen(true)}>
              查看错题诊断
            </Button>
          </Stack>
        </Stack>
      </Paper>

      <Dialog open={isCreateDialogOpen} onClose={() => setCreateDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>生成新的专项训练</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="专项名称"
              value={formState.name}
              onChange={(event) => setFormState((prev) => ({ ...prev, name: event.target.value }))}
              helperText="例如：数据结构图论提分、英语阅读长难句"
            />
            <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2}>
              <TextField
                label="计划训练时长（分钟）"
                type="number"
                value={formState.duration}
                onChange={(event) => setFormState((prev) => ({ ...prev, duration: event.target.value }))}
              />
              <FormControl fullWidth>
                <InputLabel id="difficulty">难度</InputLabel>
                <Select
                  labelId="difficulty"
                  label="难度"
                  value={formState.difficulty}
                  onChange={handleDifficultyChange}
                >
                  <MenuItem value="基础">基础</MenuItem>
                  <MenuItem value="进阶">进阶</MenuItem>
                  <MenuItem value="冲刺">冲刺</MenuItem>
                </Select>
              </FormControl>
            </Stack>
            <TextField
              label="重点突破内容"
              value={formState.focus}
              multiline
              minRows={3}
              onChange={(event) => setFormState((prev) => ({ ...prev, focus: event.target.value }))}
              helperText="可一次输入多个知识点，系统会自动拆解为多轮训练。"
            />
            <Alert severity="info">
              创建成功后，系统会为你生成预估正确率与推荐复盘节奏，可在训练列表中查看。
            </Alert>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setCreateDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateTraining}>
            生成训练题单
          </Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={isDiagnosisOpen} onClose={() => setDiagnosisOpen(false)} sx={{ '& .MuiDrawer-paper': { width: { xs: '100%', sm: 420 } } }}>
        <Stack spacing={3} sx={{ p: 4 }}>
          <Stack direction="row" justifyContent="space-between" alignItems="center">
            <Typography variant="h6" fontWeight={700}>
              错题诊断报告
            </Typography>
            <Button onClick={() => setDiagnosisOpen(false)}>关闭</Button>
          </Stack>
          <Typography variant="body2" color="text.secondary">
            以下诊断来源于近 14 天的刷题数据与课堂测评，系统已根据掌握度排序薄弱模块。
          </Typography>
          <Stack spacing={2}>
            {diagnosisItems.map((item) => (
              <Paper key={item.title} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
                <Stack spacing={1}>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="error.main">
                    薄弱点：{item.weakness}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    建议：{item.suggestion}
                  </Typography>
                </Stack>
              </Paper>
            ))}
          </Stack>
          <Alert severity="success" icon={<InsightsIcon />}>
            建议立即转化为专项训练计划，系统已为每项薄弱点生成对应题单模版。
          </Alert>
        </Stack>
      </Drawer>
    </Stack>
  );
};

export default Practice;
