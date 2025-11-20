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
  IconButton,
} from '@mui/material';
import AddCircleOutlineIcon from '@mui/icons-material/AddCircleOutline';
import CloseIcon from '@mui/icons-material/Close';
import StarBorderIcon from '@mui/icons-material/StarBorder';
import StarIcon from '@mui/icons-material/Star';
import FeedbackIcon from '@mui/icons-material/Feedback';
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
  const [isPracticeViewOpen, setIsPracticeViewOpen] = useState(false);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<Record<string, string>>({});
  const [starredQuestions, setStarredQuestions] = useState<Record<string, PracticeQuestion>>({});
  const [feedbackDialog, setFeedbackDialog] = useState<{ open: boolean; questionId: string | null; content: string }>(
    {
      open: false,
      questionId: null,
      content: '',
    },
  );
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
      setIsPracticeViewOpen(true);
    }
    if (sets.length === 0) {
      setIsPracticeViewOpen(false);
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

  const openPracticeWorkspace = () => {
    if (!selectedSetId) {
      setErrorMessage('请先选择题单');
      return;
    }
    setErrorMessage(null);
    setIsPracticeViewOpen(true);
  };

  const closePracticeWorkspace = () => {
    setIsPracticeViewOpen(false);
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
    setIsPracticeViewOpen(true);
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

  const toggleStar = (question: PracticeQuestion) => {
    setStarredQuestions((prev) => {
      if (prev[question.id]) {
        const next = { ...prev };
        delete next[question.id];
        return next;
      }
      return { ...prev, [question.id]: question };
    });
  };

  const openFeedback = (questionId: string) => {
    setFeedbackDialog({ open: true, questionId, content: '' });
  };

  const submitFeedback = () => {
    setFeedbackDialog((prev) => ({ ...prev, open: false }));
    setErrorMessage('感谢反馈，已记录到题库质量维护清单。');
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
      setIsPracticeViewOpen(true);
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
        <Grid item xs={12} lg={4} sx={{ display: isPracticeViewOpen ? 'none' : 'block' }}>
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
                        setIsPracticeViewOpen(true);
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
        <Grid item xs={12} lg={isPracticeViewOpen ? 12 : 8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 520 }}>
            {isPracticeViewOpen && selectedSet ? (
              <Stack spacing={3} sx={{ height: '100%' }} >
                <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} >
                  <Box>
                    <Typography variant="h5" fontWeight={700}>
                      {selectedSet.title} · 写题模式
                    </Typography>
                    <Typography variant="body2" color="text.secondary" mt={0.5}>
                      {selectedSet.description || '进入专注模式，仅保留当前题单的答题体验。'}
                    </Typography>
                  </Box>
                  <Stack direction="row" spacing={1} alignItems="center">
                    <IconButton
                      onClick={closePracticeWorkspace}
                      color="primary"
                      sx={{ display: { xs: 'inline-flex', sm: 'none' } }}
                    >
                      <CloseIcon />
                    </IconButton>
                    <Button
                      variant="outlined"
                      onClick={closePracticeWorkspace}
                      sx={{ display: { xs: 'none', sm: 'inline-flex' } }}
                    >
                      返回题单
                    </Button>
                    <Button variant="contained" color="secondary" onClick={openQuestionDialog}>
                      录入题目
                    </Button>
                  </Stack>
                </Stack>
                <Divider />
                <Box sx={{ flexGrow: 1, overflow: 'auto' }}>
                  {questionsLoading ? (
                    <Typography variant="body2" color="text.secondary">正在加载题目…</Typography>
                  ) : questions.length === 0 ? (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">当前题单暂无题目，添加题目后即可进入刷题模式。</Typography>
                      <Button variant="contained" onClick={openQuestionDialog}>录入第一道题</Button>
                    </Stack>
                  ) : isPracticing && currentQuestion ? (
                    <Stack spacing={3}>
                      <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} justifyContent="space-between" alignItems="center">
                        <Typography variant="subtitle1" color="text.secondary">
                          当前进度：第 {currentQuestionIndex + 1} / {totalQuestions} 题
                        </Typography>
                        <Stack direction="row" spacing={1} alignItems="center">
                          <IconButton onClick={() => toggleStar(currentQuestion)} color={starredQuestions[currentQuestion.id] ? 'warning' : 'default'}>
                            {starredQuestions[currentQuestion.id] ? <StarIcon /> : <StarBorderIcon />}
                          </IconButton>
                          <Button
                            startIcon={<FeedbackIcon />}
                            onClick={() => openFeedback(currentQuestion.id)}
                            color="secondary"
                            variant="text"
                          >
                            题目有问题
                          </Button>
                          <Button variant="outlined" onClick={goToPreviousQuestion} disabled={currentQuestionIndex === 0}>上一题</Button>
                          <Button variant="outlined" onClick={goToNextQuestion} disabled={currentQuestionIndex >= totalQuestions - 1}>下一题</Button>
                        </Stack>
                      </Stack>
                      <Typography variant="h6" fontWeight={600}>{currentQuestion.questionText}</Typography>
                      <TextField multiline minRows={5} placeholder="在此输入你的答案" value={userAnswers[currentQuestion.id] ?? ''} onChange={(event) => handleAnswerChange(currentQuestion.id, event.target.value)} />
                      <Stack direction="row" spacing={1} flexWrap="wrap">
                        {currentQuestion.tags.map((tag) => (
                          <Chip key={tag} label={tag} size="small" />
                        ))}
                      </Stack>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between">
                        <Button variant="outlined" color="secondary" onClick={retryPractice}>清空作答</Button>
                        <Button variant="contained" onClick={handleSubmitPractice}>提交答卷</Button>
                      </Stack>
                    </Stack>
                  ) : practiceResult ? (
                    <Stack spacing={3}>
                      <Box>
                        <Typography variant="h6" fontWeight={600}>本次答题概览</Typography>
                        <Typography variant="body2" color="text.secondary">共作答 {practiceResult.total} 题，答对 {practiceResult.correct} 题，正确率 {(practiceResult.accuracy * 100).toFixed(1)}%</Typography>
                        <Typography variant="body2" mt={1}>{practiceResult.suggestion}</Typography>
                      </Box>
                      <Divider />
                      <Stack spacing={1.5}>
                        {practiceResult.details.map((detail) => (
                          <Paper key={detail.questionId} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                            <Stack spacing={1}>
                              <Stack direction={{ xs: 'column', sm: 'row' }} justifyContent="space-between" alignItems={{ sm: 'center' }}>
                                <Typography fontWeight={600}>{detail.questionText}</Typography>
                                <Chip label={detail.isCorrect ? '正确' : '待巩固'} color={detail.isCorrect ? 'success' : 'warning'} size="small" />
                              </Stack>
                              <Stack direction="row" spacing={1} alignItems="center">
                                <IconButton
                                  size="small"
                                  onClick={() => toggleStar({
                                    id: detail.questionId,
                                    questionText: detail.questionText,
                                    answerText: detail.correctAnswer,
                                    explanation: detail.explanation,
                                    tags: detail.tags,
                                  } as PracticeQuestion)}
                                  color={starredQuestions[detail.questionId] ? 'warning' : 'default'}
                                >
                                  {starredQuestions[detail.questionId] ? <StarIcon fontSize="small" /> : <StarBorderIcon fontSize="small" />}
                                </IconButton>
                                <Button size="small" startIcon={<FeedbackIcon />} onClick={() => openFeedback(detail.questionId)}>
                                  题目有问题
                                </Button>
                              </Stack>
                              <Typography variant="body2" color="text.secondary">你的答案：{detail.userAnswer || '未作答'}</Typography>
                              {detail.correctAnswer ? (
                                <Typography variant="body2" color="text.secondary">参考答案：{detail.correctAnswer}</Typography>
                              ) : null}
                              {detail.explanation ? (
                                <Typography variant="body2" color="text.secondary">解题思路：{detail.explanation}</Typography>
                              ) : null}
                              <Stack direction="row" spacing={1} flexWrap="wrap">
                                {detail.tags.map((tag) => (
                                  <Chip key={tag} label={tag} size="small" variant="outlined" />
                                ))}
                              </Stack>
                            </Stack>
                          </Paper>
                        ))}
                      </Stack>
                      <Stack direction="row" spacing={2}>
                        <Button variant="contained" onClick={retryPractice}>再练一次</Button>
                        <Button variant="text" onClick={() => setPracticeResult(null)}>关闭结果</Button>
                      </Stack>
                    </Stack>
                  ) : (
                    <Stack spacing={2}>
                      <Typography variant="body2" color="text.secondary">选择题单后立即开始刷题。点击“开始答题”进入沉浸式答题体验。</Typography>
                      <Button variant="contained" onClick={startPractice} disabled={questions.length === 0}>
                        开始答题
                      </Button>
                    </Stack>
                  )}
                </Box>
              </Stack>
            ) : (
              <Stack spacing={3} sx={{ height: '100%' }} >
                <Box>
                  <Stack spacing={1.5}>
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={2} justifyContent="space-between" alignItems={{ xs: 'flex-start', sm: 'center' }} >
                      <Typography variant="h6" fontWeight={600}>
                        {selectedSet ? selectedSet.title : '选择题单查看题目'}
                      </Typography>
                      <Stack direction="row" spacing={1}>
                        <Button startIcon={<AddCircleOutlineIcon />} variant="contained" color="secondary" onClick={openQuestionDialog} disabled={selectedSetId === null} size="small">录入题目</Button>
                        {selectedSet ? (
                          <Button variant="outlined" size="small" onClick={openPracticeWorkspace}>打开写题模式</Button>
                        ) : null}
                      </Stack>
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
                <Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }} >
                  {questionsLoading ? (
                    <Typography variant="body2" color="text.secondary">正在加载题目…</Typography>
                  ) : questions.length === 0 ? (
                    <Typography variant="body2" color="text.secondary">暂无题目内容，请在下方添加。</Typography>
                  ) : (
                    questions.map((question) => (
                      <Paper key={question.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                        <Stack spacing={1}>
                          <Typography variant="subtitle1" fontWeight={600}>{question.questionText}</Typography>
                          {question.answerText ? (
                            <Typography variant="body2" color="text.secondary">正确答案：{question.answerText}</Typography>
                          ) : null}
                          {question.explanation ? (
                            <Typography variant="body2" color="text.secondary">解题思路：{question.explanation}</Typography>
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
                  <Box sx={{ borderRadius: 2, border: '1px dashed', borderColor: 'divider', p: { xs: 2, md: 3 }, bgcolor: 'grey.50' }}>
                    <Stack spacing={2}>
                      <Typography variant="subtitle1" fontWeight={600}>写题模式</Typography>
                      <Typography variant="body2" color="text.secondary">
                        点击“打开写题模式”后，页面将专注展示刷题区域，不再显示题单列表和题目详情。
                      </Typography>
                      <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1}>
                        <Button variant="contained" onClick={openPracticeWorkspace} disabled={questions.length === 0}>
                          打开写题模式
                        </Button>
                        {practiceResult ? (
                          <Button variant="text" onClick={() => setIsPracticeViewOpen(true)}>
                            查看上次结果
                          </Button>
                        ) : null}
                      </Stack>
                    </Stack>
                  </Box>
                ) : null}
              </Stack>
            )}
          </Paper>
        </Grid>
      </Grid>

      <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
        <Stack spacing={1.5}>
          <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1} alignItems={{ sm: 'center' }} justifyContent="space-between">
            <Typography variant="h6" fontWeight={600}>
              重点题目清单
            </Typography>
            <Typography variant="body2" color="text.secondary">
              点击 ⭐ 收藏的题目会收录在此，方便复习或分享给队友。
            </Typography>
          </Stack>
          {Object.keys(starredQuestions).length === 0 ? (
            <Typography variant="body2" color="text.secondary">还没有收藏题目，做题时点击右上角的 ⭐ 即可收录。</Typography>
          ) : (
            <Stack spacing={1.5}>
              {Object.values(starredQuestions).map((question) => (
                <Paper key={question.id} variant="outlined" sx={{ p: 1.5, borderRadius: 2 }}>
                  <Stack spacing={0.5}>
                    <Stack direction="row" spacing={1} alignItems="center">
                      <StarIcon fontSize="small" color="warning" />
                      <Typography variant="subtitle2" fontWeight={600} sx={{ flex: 1 }}>
                        {question.questionText}
                      </Typography>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap">
                      {(question.tags ?? []).map((tag) => (
                        <Chip key={`${question.id}-${tag}`} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  </Stack>
                </Paper>
              ))}
            </Stack>
          )}
        </Stack>
      </Paper>

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

      <Dialog
        open={feedbackDialog.open}
        onClose={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}
        fullWidth
        maxWidth="sm"
      >
        <DialogTitle>题目有问题</DialogTitle>
        <DialogContent dividers>
          <Typography variant="body2" color="text.secondary" mb={2}>
            简要描述题目错误、答案争议或排版问题，教研团队会在后台汇总并追踪处理。
          </Typography>
          <TextField
            label="反馈内容"
            value={feedbackDialog.content}
            onChange={(event) => setFeedbackDialog((prev) => ({ ...prev, content: event.target.value }))}
            multiline
            minRows={3}
            fullWidth
            autoFocus
          />
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setFeedbackDialog((prev) => ({ ...prev, open: false }))}>取消</Button>
          <Button variant="contained" onClick={submitFeedback} disabled={!feedbackDialog.content.trim()}>
            提交反馈
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Practice;
