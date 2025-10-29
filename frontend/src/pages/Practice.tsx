import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import practiceService, { PracticeQuestion, PracticeSetSummary } from '../services/practiceService';

const Practice = () => {
  const queryClient = useQueryClient();
  const [selectedSetId, setSelectedSetId] = useState<number | null>(null);
  const [setTitle, setSetTitle] = useState('');
  const [setDescription, setSetDescription] = useState('');
  const [setTags, setSetTags] = useState('');
  const [questionText, setQuestionText] = useState('');
  const [answerText, setAnswerText] = useState('');
  const [questionTags, setQuestionTags] = useState('');
  const [questionExplanation, setQuestionExplanation] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

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
    queryFn: () => practiceService.fetchPracticeQuestions(selectedSetId as number),
    enabled: selectedSetId !== null,
  });

  const createSetMutation = useMutation({
    mutationFn: practiceService.createPracticeSet,
    onSuccess: async () => {
      setSetTitle('');
      setSetDescription('');
      setSetTags('');
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
    }) => practiceService.createPracticeQuestion(selectedSetId as number, payload),
    onSuccess: async () => {
      setQuestionText('');
      setAnswerText('');
      setQuestionTags('');
      setQuestionExplanation('');
      await queryClient.invalidateQueries({ queryKey: ['practice-questions', selectedSetId] });
      await queryClient.invalidateQueries({ queryKey: ['practice-sets'] });
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
      description: setSetDescription.trim() || undefined,
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
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  题单列表
                </Typography>
                <Typography variant="body2" color="text.secondary" mt={0.5}>
                  点击查看题目详情并继续添加练习内容。
                </Typography>
              </Box>
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
              <Box component="form" onSubmit={handleCreateSet}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    新建题单
                  </Typography>
                  <TextField label="题单标题" value={setTitle} onChange={(event) => setSetTitle(event.target.value)} required />
                  <TextField
                    label="题单描述（可选）"
                    value={setDescription}
                    onChange={(event) => setSetDescription(event.target.value)}
                    multiline
                    minRows={2}
                  />
                  <TextField
                    label="标签（逗号分隔）"
                    value={setTags}
                    onChange={(event) => setSetTags(event.target.value)}
                    helperText="例如：高数, 线性代数"
                  />
                  <Button type="submit" variant="contained" disabled={createSetMutation.isPending}>
                    {createSetMutation.isPending ? '创建中…' : '保存题单'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} lg={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 520 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedSet ? selectedSet.title : '选择题单查看题目'}
                </Typography>
                {selectedSet ? (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    {selectedSet.description || '暂无题单描述，可在左侧修改。'}
                  </Typography>
                ) : (
                  <Typography variant="body2" color="text.secondary" mt={0.5}>
                    从左侧选择题单以查看题目列表或录入新题目。
                  </Typography>
                )}
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
              <Box component="form" onSubmit={handleCreateQuestion}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    录入新题目
                  </Typography>
                  <TextField
                    label="题干"
                    value={questionText}
                    onChange={(event) => setQuestionText(event.target.value)}
                    multiline
                    minRows={3}
                    disabled={selectedSetId === null}
                  />
                  <TextField
                    label="标准答案（可选）"
                    value={answerText}
                    onChange={(event) => setAnswerText(event.target.value)}
                    multiline
                    minRows={2}
                    disabled={selectedSetId === null}
                  />
                  <TextField
                    label="解题思路（可选）"
                    value={questionExplanation}
                    onChange={(event) => setQuestionExplanation(event.target.value)}
                    multiline
                    minRows={2}
                    disabled={selectedSetId === null}
                  />
                  <TextField
                    label="标签（逗号分隔）"
                    value={questionTags}
                    onChange={(event) => setQuestionTags(event.target.value)}
                    helperText="例如：概率论, 高频错题"
                    disabled={selectedSetId === null}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createQuestionMutation.isPending || selectedSetId === null}
                  >
                    {createQuestionMutation.isPending ? '保存中…' : '添加题目'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
      </Grid>
    </Stack>
  );
};

export default Practice;
