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
import ChecklistIcon from '@mui/icons-material/Checklist';
import EmojiEventsIcon from '@mui/icons-material/EmojiEvents';
import TimelineIcon from '@mui/icons-material/Timeline';
import AssessmentIcon from '@mui/icons-material/Assessment';
import { useMemo, useState } from 'react';
import type { PracticeSet } from '../data/dashboard';
import usePracticeSets from '../hooks/usePracticeSets';

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
  const {
    data: practiceSets = [],
    isFetching,
    isError,
    refetch,
    createPractice,
    isCreating,
  } = usePracticeSets();
  const [formState, setFormState] = useState(initialForm);
  const [isCreateDialogOpen, setCreateDialogOpen] = useState(false);
  const [isDiagnosisOpen, setDiagnosisOpen] = useState(false);
  const [creationHint, setCreationHint] = useState<{ type: 'info' | 'error'; message: string } | null>(null);
  const [activePractice, setActivePractice] = useState<PracticeSet | null>(null);
  const [isSprintDrawerOpen, setSprintDrawerOpen] = useState(false);
  const [isFocusDialogOpen, setFocusDialogOpen] = useState(false);
  const [retakeMessage, setRetakeMessage] = useState<string | null>(null);

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

  const totalQuestions = useMemo(
    () => practiceSets.reduce((sum, set) => sum + (set.questions ?? 0), 0),
    [practiceSets],
  );

  const averageAccuracy = useMemo(() => {
    if (practiceSets.length === 0) {
      return 0;
    }
    const total = practiceSets.reduce((sum, set) => sum + (set.accuracy ?? 0), 0);
    return Math.round((total / practiceSets.length) * 100);
  }, [practiceSets]);

  const customCount = useMemo(
    () => practiceSets.filter((set) => set.source === '自定义').length,
    [practiceSets],
  );

  const handleDifficultyChange = (event: SelectChangeEvent<TrainingFormState['difficulty']>) => {
    setFormState((prev) => ({ ...prev, difficulty: event.target.value as TrainingFormState['difficulty'] }));
  };

  const handleCreateTraining = async () => {
    if (!formState.name.trim()) {
      setCreationHint({ type: 'error', message: '请填写专项训练名称' });
      return;
    }
    await createPractice({
      name: formState.name,
      duration: Number(formState.duration) || 45,
      focus: formState.focus,
      difficulty: formState.difficulty,
    });
    setCreateDialogOpen(false);
    setCreationHint({ type: 'info', message: '已生成专项训练草稿，可在题库列表中查看。' });
    setFormState(initialForm);
  };

  const handleOpenSprint = (practice: PracticeSet) => {
    setActivePractice(practice);
    setSprintDrawerOpen(true);
    setRetakeMessage(null);
  };

  const handleOpenFocus = (practice: PracticeSet) => {
    setActivePractice(practice);
    setFocusDialogOpen(true);
  };

  const handleRetake = (practice: PracticeSet) => {
    setActivePractice(practice);
    setRetakeMessage(`已为你重置「${practice.name}」的错题训练，将根据最新诊断重新排列题序。`);
  };

  return (
    <Stack spacing={4}>
      {(isFetching || isCreating) && <LinearProgress color="secondary" />}
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
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <TimelineIcon color="primary" />
                <Typography variant="subtitle2" color="text.secondary">
                  本周累计刷题
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700}>
                {totalQuestions} 题
              </Typography>
              <Typography variant="body2" color="text.secondary">
                包含系统推荐与自定义题单，自动同步到学习日程。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <AssessmentIcon color="secondary" />
                <Typography variant="subtitle2" color="text.secondary">
                  平均正确率
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700}>
                {averageAccuracy}%
              </Typography>
              <Typography variant="body2" color="text.secondary">
                正确率将同步到学习分析页面，用于追踪提分效果。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={1}>
              <Stack direction="row" spacing={1.5} alignItems="center">
                <PsychologyIcon color="warning" />
                <Typography variant="subtitle2" color="text.secondary">
                  自定义训练
                </Typography>
              </Stack>
              <Typography variant="h4" fontWeight={700}>
                {customCount} 套
              </Typography>
              <Typography variant="body2" color="text.secondary">
                自定义题单可在管理员端审核后纳入公共题库。
              </Typography>
            </Stack>
          </Paper>
        </Grid>
      </Grid>

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
                <Stack direction="row" spacing={1} flexWrap="wrap">
                  {practice.focus && <Chip label={practice.focus} color="primary" variant="outlined" />}
                  <Chip label={practice.difficulty ?? '进阶'} color="secondary" variant="outlined" />
                  <Chip label={practice.source ?? '系统推荐'} variant="outlined" />
                </Stack>
                <Stack direction="row" spacing={2}>
                  <Button
                    variant="contained"
                    startIcon={<TimerIcon />}
                    fullWidth
                    onClick={() => handleOpenSprint(practice)}
                  >
                    30 分钟冲刺
                  </Button>
                  <Button
                    variant="outlined"
                    startIcon={<FlagIcon />}
                    fullWidth
                    onClick={() => handleOpenFocus(practice)}
                  >
                    攻克考点
                  </Button>
                </Stack>
                <Button startIcon={<RestartAltIcon />} color="inherit" onClick={() => handleRetake(practice)}>
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
            <Button
              variant="contained"
              color="secondary"
              startIcon={<PsychologyIcon />}
              onClick={() => setCreateDialogOpen(true)}
            >
              创建专项训练
            </Button>
            <Button variant="outlined" color="inherit" startIcon={<InsightsIcon />} onClick={() => setDiagnosisOpen(true)}>
              查看错题诊断
            </Button>
          </Stack>
        </Stack>
      </Paper>

      {retakeMessage && (
        <Alert severity="success" icon={<EmojiEventsIcon />} onClose={() => setRetakeMessage(null)}>
          {retakeMessage}
        </Alert>
      )}

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
          <Button variant="contained" onClick={handleCreateTraining} disabled={isCreating}>
            {isCreating ? '生成中…' : '生成训练题单'}
          </Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isDiagnosisOpen} onClose={() => setDiagnosisOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>错题诊断报告</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
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
          <Alert severity="success" icon={<InsightsIcon />} sx={{ mt: 3 }}>
            建议立即转化为专项训练计划，系统已为每项薄弱点生成对应题单模版。
          </Alert>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setDiagnosisOpen(false)}>关闭</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={isFocusDialogOpen} onClose={() => setFocusDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>考点拆解 · {activePractice?.name}</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <Alert severity="info" icon={<ChecklistIcon />}>
              已根据你的错题记录拆分三轮训练计划，完成后会刷新掌握度曲线。
            </Alert>
            <Typography variant="subtitle2">阶段 1：温习基础</Typography>
            <Typography variant="body2" color="text.secondary">
              回顾教材对应章节，并完成 {activePractice?.questions ? Math.ceil(activePractice.questions / 3) : 10} 道基础题。
            </Typography>
            <Typography variant="subtitle2">阶段 2：强化演练</Typography>
            <Typography variant="body2" color="text.secondary">
              聚焦 {activePractice?.focus ?? '系统推荐考点'}，开启 AI 讲解，着重梳理错题原因。
            </Typography>
            <Typography variant="subtitle2">阶段 3：计时模考</Typography>
            <Typography variant="body2" color="text.secondary">
              使用 30 分钟计时器完成整套训练，并记录正确率以评估提升幅度。
            </Typography>
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFocusDialogOpen(false)}>知道了</Button>
        </DialogActions>
      </Dialog>

      <Drawer anchor="right" open={isSprintDrawerOpen} onClose={() => setSprintDrawerOpen(false)}>
        <Box sx={{ width: { xs: 320, sm: 380 }, p: 3 }}>
          <Stack spacing={2}>
            <Typography variant="h6" fontWeight={700}>
              冲刺模式 · {activePractice?.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              已为你生成 {activePractice?.duration ?? 30} 分钟冲刺计划，含热身题、主攻题与复盘总结。
            </Typography>
            <Stack spacing={1}>
              <Chip label="热身 5 分钟" color="primary" variant="outlined" />
              <Typography variant="body2">快速浏览知识点，确保记忆唤醒。</Typography>
              <Chip label="主攻 20 分钟" color="secondary" variant="outlined" />
              <Typography variant="body2">集中突破 {activePractice?.focus ?? '薄弱考点'}，错题立即记录。</Typography>
              <Chip label="复盘 5 分钟" variant="outlined" />
              <Typography variant="body2">梳理错因，写下 2 条改进措施。</Typography>
            </Stack>
            <Button variant="contained" onClick={() => setSprintDrawerOpen(false)}>
              开始计时
            </Button>
          </Stack>
        </Box>
      </Drawer>
    </Stack>
  );
};

export default Practice;
