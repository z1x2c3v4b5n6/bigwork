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
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import practiceService, { PracticeQuestion, PracticeSetSummary } from '../services/practiceService';

const Practice = () => {
  const queryClient = useQueryClient();
  const [selectedSetId, setSelectedSetId] = useState<string | null>(null);
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [setTags, setSetTags] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [questionTags, setQuestionTags] = useState('');
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [setDialogOpen, setSetDialogOpen] = useState(false);
  const [questionDialogOpen, setQuestionDialogOpen] = useState(false);
  const [isPracticing, setIsPracticing] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [practiceResult, setPracticeResult] = useState<
    | null
    | {
        total: number;
        correct: number;
        accuracy: number;
        suggestion: string;
        details: Array<{
          questionId: string;
          questionText: string;
          userAnswer: string;
          correctAnswer: string;
          explanation: string;
          tags: string[];
          isCorrect: boolean;
        }>;
      }
  >(null);

  const {
    data: sets = [],
    isLoading: setsLoading,
    isError: setsError,
    refetch: refetchSets,
  } = useQuery<PracticeSetSummary[]>({
    queryKey: ['practice-sets'],
    queryFn: practiceService.fetchPracticeSets,
  });

  useEffect(() => {
    if (sets.length > 0 && selectedSetId === null) {
      setSelectedSetId(sets[0].id);
    }
  }, [sets, selectedSetId]);

  useEffect(() => {
    if (selectedSetId === null) {
      setQuestionDialogOpen(false);
    }
  }, [selectedSetId]);

  useEffect(() => {
    setIsPracticing(false);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setPracticeResult(null);
  }, [selectedSetId]);


  const selectedSet = useMemo(
    () => sets.find((set) => set.id === selectedSetId) ?? null,
    [selectedSetId, sets],
  );

  const {
    data: questions = [],
    isLoading: questionsLoading,
    isError: questionsError,
    refetch: refetchQuestions,
  } = useQuery<PracticeQuestion[]>({
    queryKey: ['practice-questions', selectedSetId],
    queryFn: () => practiceService.fetchPracticeQuestions(selectedSetId as string),
    enabled: selectedSetId !== null,
  });

  useEffect(() => {
    if (currentQuestionIndex > 0 && currentQuestionIndex >= questions.length) {
      setCurrentQuestionIndex(Math.max(questions.length - 1, 0));
    }
  }, [currentQuestionIndex, questions.length]);

  const createSetMutation = useMutation({
    mutationFn: practiceService.createPracticeSet,
    onSuccess: async () => {
      setSetTitle('');
      setSetDescription('');
      setSetTags('');
      setSetDialogOpen(false);
      await queryClient.invalidateQueries({ queryKey: ['practice-sets'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '创建题单失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const createQuestionMutation = useMutation({
    mutationFn: (payload: {
      questionText: string;
      answerText?: string;
      explanation?: string;
      tags?: string[];
    }) => practiceService.createPracticeQuestion(selectedSetId as string, payload),
    onSuccess: async () => {
      setQuestionText('');
      setAnswerText('');
      setQuestionTags('');
      setQuestionExplanation('');
      await queryClient.invalidateQueries({ queryKey: ['practice-questions', selectedSetId] });
      await queryClient.invalidateQueries({ queryKey: ['practice-sets'] });
      setQuestionDialogOpen(false);
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '录入题目失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const handleCreateSet = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!setTitle.trim()) {
      setErrorMessage('请输入题单标题');
      return;
    }

    const tags = setTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    await createSetMutation.mutateAsync({
      title: setTitle.trim(),
      description: setDescription.trim() || undefined,
      tags,
    });
  };

  const handleCreateQuestion = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (selectedSetId === null) {
      setErrorMessage('请先选择题单');
      return;
    }

    if (!questionText.trim()) {
      setErrorMessage('请输入题干内容');
      return;
    }

    const tags = questionTags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);

    await createQuestionMutation.mutateAsync({
      questionText: questionText.trim(),
      answerText: answerText.trim() || undefined,
      explanation: questionExplanation.trim() || undefined,
      tags,
    });
  };

  const openSetDialog = () => {
    setErrorMessage(null);
    setSetDialogOpen(true);
  };

  const closeSetDialog = () => {
    if (createSetMutation.isPending) {
      return;
    }
    setSetDialogOpen(false);
    setSetTitle('');
    setSetDescription('');
    setSetTags('');
  };

  const openQuestionDialog = () => {
    if (selectedSetId === null) {
      setErrorMessage('请先选择题单');
      return;
    }
    setErrorMessage(null);
    setQuestionDialogOpen(true);
  };

  const closeQuestionDialog = () => {
    if (createQuestionMutation.isPending) {
      return;
    }
    setQuestionDialogOpen(false);
    setQuestionText('');
    setAnswerText('');
    setQuestionTags('');
    setQuestionExplanation('');
  };

  const startPractice = () => {
    if (!selectedSetId) {
      setErrorMessage('请先选择题单');
      return;
    }
    if (questions.length === 0) {
      setErrorMessage('当前题单暂无题目，无法开始答题。');
      return;
    }
    setErrorMessage(null);
    setIsPracticing(true);
    setCurrentQuestionIndex(0);
    setUserAnswers({});
    setPracticeResult(null);
  };

  const handleAnswerChange = (questionId: string, value: string) => {
    setUserAnswers((prev) => ({
      ...prev,
      [questionId]: value,
    }));
  };

  const goToPreviousQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.max(prev - 1, 0));
  };

  const goToNextQuestion = () => {
    setCurrentQuestionIndex((prev) => Math.min(prev + 1, Math.max(questions.length - 1, 0)));
  };

  const normalizeAnswer = (value: string) => value.replace(/\s+/g, '').toLowerCase();

  const handleSubmitPractice = () => {
    if (questions.length === 0) {
      return;
    }

    const details = questions.map((question) => {
      const answer = userAnswers[question.id] ?? '';
      const reference = question.answerText ?? '';
      const isComparable = Boolean(reference);
      const isCorrect = isComparable
        ? normalizeAnswer(answer) === normalizeAnswer(reference)
        : Boolean(answer.trim());

      return {
        questionId: question.id,
        questionText: question.questionText,
        userAnswer: answer.trim(),
        correctAnswer: reference,
        explanation: question.explanation,
        tags: question.tags,
        isCorrect,
      };
    });

    const correct = details.filter((detail) => detail.isCorrect).length;
    const total = details.length;
    const accuracy = total === 0 ? 0 : correct / total;

    let suggestion = '';
    if (accuracy >= 0.9) {
      suggestion = '正确率超过 90%，保持当前节奏，并尝试挑战更高难度的套卷。';
    } else if (accuracy >= 0.75) {
      suggestion = '整体表现不错，可针对错题进行巩固，并安排一次计时模拟以提升速度。';
    } else if (accuracy >= 0.5) {
      suggestion = '正确率有提升空间，建议先复习错题涉及的考点，再重新练习本套题目。';
    } else {
      suggestion = '正确率偏低，建议回顾教材或课程笔记，优先突破高频考点后再刷题。';
    }

    const weakTags = Array.from(
      new Set(
        details
          .filter((detail) => !detail.isCorrect)
          .flatMap((detail) => detail.tags)
          .filter(Boolean),
      ),
    );

    if (weakTags.length > 0) {
      suggestion += ` 可重点复习：${weakTags.join('、')}。`;
    }

    setPracticeResult({
      total,
      correct,
      accuracy,
      suggestion,
      details,
    });
    setIsPracticing(false);
  };

  const retryPractice = () => {
    setUserAnswers({});
    setPracticeResult(null);
    if (questions.length > 0) {
      setIsPracticing(true);
      setCurrentQuestionIndex(0);
    }
  };

  const currentQuestion = isPracticing && questions.length > 0 ? questions[currentQuestionIndex] : null;
  const totalQuestions = questions.length;

  return (
    <Stack spacing={4}>
      {(setsLoading || createSetMutation.isPending || createQuestionMutation.isPending) && (
        <LinearProgress color="secondary" />
      )}

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      {setsError ? (
        <Alert severity="error" action={<Button color="inherit" onClick={() => refetchSets()}>重试</Button>}>
          无法加载题单列表，请检查后端接口。
        </Alert>
      ) : null}

      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          刷题训练营
        </Typography>
        <Typography variant="body1" color="text.secondary">
          创建个性化题单、整理错题并邀请队友共同参与。所有练习记录都会即时保存到数据库，刷新页面也不会丢失。
        </Typography>
      </Box>

      <Grid container spacing={3} alignItems="stretch">
        <Grid item xs={12} lg={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Stack
                direction={{ xs: 'column', sm: 'row' }}
                spacing={2}
                alignItems={{ xs: 'flex-start', sm: 'center' }}
                justifyContent="space-between"
              >
                <Box>
                  <Typography variant="h6" fontWeight={600}>
                    题单列表
                  </Typography>
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    点击查看题目详情并继续添加练习内容。
                  </Typography>
                </Box>
                <Button
                  startIcon={<AddCircleOutlineIcon />}
                  variant="contained"
                  onClick={openSetDialog}
                  size="small"
                >
                  新建题单
                </Button>
              </Stack>
              <Divider />
              <Stack spacing={1.5} sx={{ flexGrow: 1, overflow: 'auto' }}>
                {sets.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无题单，快来创建你的第一套训练吧。
                  </Typography>
                ) : (
                  sets.map((set) => (
                    <Paper
                      key={set.id}
                      variant={selectedSetId === set.id ? 'outlined' : 'elevation'}
                      sx={{
                        p: 2,
                        borderRadius: 2,
                        borderColor: selectedSetId === set.id ? 'primary.main' : 'divider',
                        cursor: 'pointer',
                      }}
                      onClick={() => {
                        setSelectedSetId(set.id);
                        setErrorMessage(null);
                      }}
                    >
                      <Stack spacing={1}>
                        <Stack direction="row" justifyContent="space-between" alignItems="center">
                          <Typography variant="subtitle1" fontWeight={600}>
                            {set.title}
                          </Typography>
                          <Chip label={`共 ${set.questionCount} 题`} size="small" color="primary" variant="outlined" />
                        </Stack>
                        <Typography variant="body2" color="text.secondary">
                          {set.description || '暂无题单描述。'}
                        </Typography>
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {set.tags.length > 0
                            ? set.tags.map((tag) => <Chip key={tag} label={tag} size="small" variant="outlined" />)
                            : null}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 520 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Box>
                <Stack spacing={1.5}>
                  <Stack
                    direction={{ xs: 'column', sm: 'row' }}
                    spacing={2}
                    justifyContent="space-between"
                    alignItems={{ xs: 'flex-start', sm: 'center' }}
                  >
                    <Typography variant="h6" fontWeight={600}>
                      {selectedSet ? selectedSet.title : '选择题单查看题目'}
                    </Typography>
                    <Button
                      startIcon={<AddCircleOutlineIcon />}
                      variant="contained"
                      color="secondary"
                      onClick={openQuestionDialog}
                      disabled={selectedSetId === null}
                      size="small"
                    >
                      录入题目
                    </Button>
                  </Stack>
                  {selectedSet ? (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {selectedSet.description || '暂无题单描述，可在左侧修改。'}
                    </Typography>
                  ) : (
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      从左侧选择题单以查看题目列表或录入新题目。
                    </Typography>
                  )}
                </Stack>
                {questionsError ? (
                  <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => refetchQuestions()}>重试</Button>}>
                    无法加载题目列表。
                  </Alert>
                ) : null}
              </Box>
              <Divider />
              <Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
                {questionsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    正在加载题目…
                  </Typography>
                ) : questions.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无题目内容，请在下方添加。
                  </Typography>
                ) : (
                  questions.map((question) => (
                    <Paper key={question.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                      <Stack spacing={1}>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {question.questionText}
                        </Typography>
                        {question.answerText ? (
                          <Typography variant="body2" color="text.secondary">
                            正确答案：{question.answerText}
                          </Typography>
                        ) : null}
                        {question.explanation ? (
                          <Typography variant="body2" color="text.secondary">
                            解题思路：{question.explanation}
                          </Typography>
                        ) : null}
                        <Stack direction="row" spacing={1} flexWrap="wrap">
                          {question.tags.map((tag) => (
                            <Chip key={tag} label={tag} size="small" variant="outlined" />
                          ))}
                        </Stack>
                      </Stack>
                    </Paper>
                  ))
                )}
              </Stack>
              {selectedSet ? (
                <Box
                  sx={{
                    borderRadius: 2,
                    border: '1px dashed',
                    borderColor: 'divider',
                    p: { xs: 2, md: 3 },
                    bgcolor: 'grey.50',
                  }}
                >
                  <Stack spacing={2}>
                    <Stack
                      direction={{ xs: 'column', sm: 'row' }}
                      alignItems={{ xs: 'flex-start', sm: 'center' }}
                      justifyContent="space-between"
                      spacing={2}
                    >
                      <Box>
                        <Typography variant="subtitle1" fontWeight={600}>
                          在线刷题
                        </Typography>
                        <Typography variant="body2" color="text.secondary" mt={0.5}>
                          输入你的作答内容，系统会在提交后展示标准答案并生成学习建议。
                        </Typography>
                      </Box>
                      <Chip
                        color="secondary"
                        variant="outlined"
                        label={
                          practiceResult
                            ? `正确率 ${(practiceResult.accuracy * 100).toFixed(0)}%`
                            : `共 ${totalQuestions} 题`
                        }
                      />
                    </Stack>

                    {questionsLoading ? (
                      <Typography variant="body2" color="text.secondary">
                        题目数据加载中…
                      </Typography>
                    ) : totalQuestions === 0 ? (
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          当前题单暂无题目，请先录入题目后再开始刷题。
                        </Typography>
                        <Button variant="contained" disabled>
                          开始答题
                        </Button>
                      </Stack>
                    ) : practiceResult ? (
                      <Stack spacing={2}>
                        <Alert
                          severity={
                            practiceResult.accuracy >= 0.75
                              ? 'success'
                              : practiceResult.accuracy >= 0.5
                              ? 'info'
                              : 'warning'
                          }
                        >
                          {`本次共答对 ${practiceResult.correct}/${practiceResult.total} 题。`}
                        </Alert>
                        <Stack spacing={1}>
                          <Typography variant="body2" color="text.secondary">
                            正确率进度
                          </Typography>
                          <LinearProgress
                            variant="determinate"
                            value={Math.round(practiceResult.accuracy * 100)}
                            color={practiceResult.accuracy >= 0.75 ? 'success' : 'warning'}
                          />
                        </Stack>
                        <Typography variant="body1">{practiceResult.suggestion}</Typography>
                        <Divider />
                        <Stack spacing={1.5}>
                          {practiceResult.details.map((detail) => (
                            <Paper
                              key={detail.questionId}
                              variant="outlined"
                              sx={{ p: 2, borderRadius: 2, borderColor: detail.isCorrect ? 'success.light' : 'warning.light' }}
                            >
                              <Stack spacing={0.75}>
                                <Stack direction="row" spacing={1} alignItems="center">
                                  <Chip
                                    size="small"
                                    color={detail.isCorrect ? 'success' : 'warning'}
                                    label={detail.isCorrect ? '答对' : '待巩固'}
                                  />
                                  <Typography variant="subtitle2" fontWeight={600}>
                                    {detail.questionText}
                                  </Typography>
                                </Stack>
                                <Typography variant="body2" color="text.secondary">
                                  我的作答：{detail.userAnswer || '（未填写）'}
                                </Typography>
                                {detail.correctAnswer ? (
                                  <Typography variant="body2" color="text.secondary">
                                    标准答案：{detail.correctAnswer}
                                  </Typography>
                                ) : null}
                                {detail.explanation ? (
                                  <Typography variant="body2" color="text.secondary">
                                    解题思路：{detail.explanation}
                                  </Typography>
                                ) : null}
                              </Stack>
                            </Paper>
                          ))}
                        </Stack>
                        <Stack direction="row" spacing={2} justifyContent="flex-end">
                          <Button variant="outlined" onClick={retryPractice}>
                            再练一次
                          </Button>
                        </Stack>
                      </Stack>
                    ) : isPracticing && currentQuestion ? (
                      <Stack spacing={2}>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <Chip
                            label={`第 ${currentQuestionIndex + 1}/${totalQuestions} 题`}
                            color="primary"
                            variant="outlined"
                            size="small"
                          />
                          <Typography variant="body2" color="text.secondary">
                            完成所有题目后点击提交即可查看标准答案。
                          </Typography>
                        </Stack>
                        <Typography variant="subtitle1" fontWeight={600}>
                          {currentQuestion.questionText}
                        </Typography>
                        <TextField
                          label="输入你的答案"
                          value={userAnswers[currentQuestion.id] ?? ''}
                          onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)}
                          multiline
                          minRows={3}
                          fullWidth
                        />
                        <Stack direction="row" spacing={2} justifyContent="space-between" flexWrap="wrap">
                          <Button variant="text" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>
                            上一题
                          </Button>
                          <Stack direction="row" spacing={2}>
                            <Button
                              variant="text"
                              onClick={goToNextQuestion}
                              disabled={currentQuestionIndex === totalQuestions - 1}
                            >
                              下一题
                            </Button>
                            <Button variant="contained" onClick={handleSubmitPractice}>
                              提交答卷
                            </Button>
                          </Stack>
                        </Stack>
                      </Stack>
                    ) : (
                      <Stack spacing={2}>
                        <Typography variant="body2" color="text.secondary">
                          立即开始练习，系统会自动保存作答并生成个性化建议。
                        </Typography>
                        <Stack direction="row" spacing={2}>
                          <Button variant="contained" onClick={startPractice}>
                            开始答题
                          </Button>
                          {practiceResult ? (
                            <Button variant="text" onClick={retryPractice}>
                              重练当前题单
                            </Button>
                          ) : null}
                        </Stack>
                      </Stack>
                    )}
                  </Stack>
                </Box>
              ) : null}
            </Stack>
          </Paper>
        </Grid>
      </Grid>

      <Dialog open={setDialogOpen} onClose={closeSetDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreateSet}>
          <DialogTitle>新建题单</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="题单标题"
                value={setTitle}
                onChange={(event) => setSetTitle(event.target.value)}
                required
                fullWidth
              />
              <TextField
                label="题单描述（可选）"
                value={setDescription}
                onChange={(event) => setSetDescription(event.target.value)}
                multiline
                minRows={3}
                fullWidth
              />
              <TextField
                label="标签（逗号分隔）"
                value={setTags}
                onChange={(event) => setSetTags(event.target.value)}
                helperText="例如：高数, 线性代数"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeSetDialog} disabled={createSetMutation.isPending}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={createSetMutation.isPending}>
              {createSetMutation.isPending ? '创建中…' : '保存题单'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>

      <Dialog open={questionDialogOpen} onClose={closeQuestionDialog} fullWidth maxWidth="sm">
        <Box component="form" onSubmit={handleCreateQuestion}>
          <DialogTitle>录入新题目</DialogTitle>
          <DialogContent dividers>
            <Stack spacing={2.5}>
              <TextField
                label="题干"
                value={questionText}
                onChange={(event) => setQuestionText(event.target.value)}
                multiline
                minRows={3}
                required
                fullWidth
              />
              <TextField
                label="标准答案（可选）"
                value={answerText}
                onChange={(event) => setAnswerText(event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                label="解题思路（可选）"
                value={questionExplanation}
                onChange={(event) => setQuestionExplanation(event.target.value)}
                multiline
                minRows={2}
                fullWidth
              />
              <TextField
                label="标签（逗号分隔）"
                value={questionTags}
                onChange={(event) => setQuestionTags(event.target.value)}
                helperText="例如：概率论, 高频错题"
                fullWidth
              />
            </Stack>
          </DialogContent>
          <DialogActions>
            <Button onClick={closeQuestionDialog} disabled={createQuestionMutation.isPending}>
              取消
            </Button>
            <Button type="submit" variant="contained" disabled={createQuestionMutation.isPending || selectedSetId === null}>
              {createQuestionMutation.isPending ? '保存中…' : '添加题目'}
            </Button>
          </DialogActions>
        </Box>
      </Dialog>
    </Stack>
  );
};

export default Practice;
