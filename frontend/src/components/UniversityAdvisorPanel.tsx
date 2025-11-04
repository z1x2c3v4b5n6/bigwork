import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  LinearProgress,
  MenuItem,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import type { ChipProps } from '@mui/material/Chip';
import { useMutation } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import SchoolIcon from '@mui/icons-material/School';
import InsightsIcon from '@mui/icons-material/Insights';
import TaskAltIcon from '@mui/icons-material/TaskAlt';
import InfoIcon from '@mui/icons-material/Info';
import LaunchIcon from '@mui/icons-material/Launch';
import type { RecommendationRequest, UniversityRecommendationResponse } from '../services/recommendationService';
import { recommendUniversities } from '../services/recommendationService';
import { majorRecommendations } from '../data/postgraduateResources';

const matchLevelColor: Record<
  UniversityRecommendationResponse['recommendedUniversities'][number]['matchLevel'],
  ChipProps['color']
> = {
  稳妥: 'success',
  冲刺: 'warning',
  保底: 'info',
  高风险: 'default',
};

const UniversityAdvisorPanel = () => {
  const [score, setScore] = useState('');
  const [major, setMajor] = useState('');
  const [mathSubject, setMathSubject] = useState('');
  const [englishSubject, setEnglishSubject] = useState('');
  const [inputError, setInputError] = useState<string | null>(null);

  const mutation = useMutation({
    mutationFn: recommendUniversities,
  });

  const majorOptions = useMemo(() => majorRecommendations.map((item) => item.major), []);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const parsed = Number(score);
    if (!Number.isFinite(parsed) || parsed <= 0) {
      setInputError('请输入有效的初试总分（大于 0 的数字）。');
      return;
    }

    setInputError(null);
    if (mutation.isError) {
      mutation.reset();
    }
    const payload: RecommendationRequest = {
      totalScore: parsed,
      targetMajor: major.trim() ? major.trim() : undefined,
    };

    const mathValue = mathSubject.trim();
    const englishValue = englishSubject.trim();
    if (mathValue || englishValue) {
      payload.examSubjects = {
        math: mathValue || undefined,
        english: englishValue || undefined,
      };
    }

    mutation.mutate(payload);
  };

  const recommendation = mutation.data;

  const focusTopics = useMemo(
    () => recommendation?.interviewPreparation.focusTopics ?? [],
    [recommendation?.interviewPreparation.focusTopics],
  );

  return (
    <Stack spacing={3}>
      <Box component="form" onSubmit={handleSubmit}>
        <Grid container spacing={2}>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              label="初试总分"
              type="number"
              value={score}
              onChange={(event) => setScore(event.target.value)}
              placeholder="例如 398"
              inputProps={{ min: 0, step: 1 }}
              error={Boolean(inputError)}
              helperText={inputError ?? '输入后将智能匹配冲刺/稳妥/保底院校'}
            />
          </Grid>
          <Grid item xs={12} md={4}>
            <TextField
              fullWidth
              select
              label="目标专业（可选）"
              value={major}
              onChange={(event) => setMajor(event.target.value)}
              helperText="选择后可优先匹配对应专业的院校组合"
            >
              <MenuItem value="">不限专业（系统自动匹配）</MenuItem>
              {majorOptions.map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="数学科目"
              value={mathSubject}
              onChange={(event) => setMathSubject(event.target.value)}
              helperText="选择报考的数学类别"
            >
              <MenuItem value="">不限</MenuItem>
              <MenuItem value="数学一">数学一</MenuItem>
              <MenuItem value="数学二">数学二</MenuItem>
              <MenuItem value="数学三">数学三</MenuItem>
              <MenuItem value="不考数学">不考数学</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={12} md={2}>
            <TextField
              fullWidth
              select
              label="英语科目"
              value={englishSubject}
              onChange={(event) => setEnglishSubject(event.target.value)}
              helperText="选择报考的英语类别"
            >
              <MenuItem value="">不限</MenuItem>
              <MenuItem value="英语一">英语一</MenuItem>
              <MenuItem value="英语二">英语二</MenuItem>
            </TextField>
          </Grid>
          <Grid
            item
            xs={12}
            md={4}
            sx={{ display: 'flex', alignItems: { md: 'stretch' }, justifyContent: 'flex-start' }}
          >
            <Button
              type="submit"
              variant="contained"
              color="primary"
              size="large"
              sx={{ minWidth: 180, flexGrow: 1 }}
              disabled={mutation.isPending}
            >
              {mutation.isPending ? '智能分析中…' : '生成推荐'}
            </Button>
          </Grid>
        </Grid>
      </Box>

      {mutation.isPending && <LinearProgress />}

      {mutation.isError && (
        <Alert severity="error">
          {(mutation.error as Error).message || '暂时无法生成推荐，请稍后再试。'}
        </Alert>
      )}

      {recommendation && (
        <Stack spacing={3}>
          <Paper
            variant="outlined"
            sx={{
              p: 3,
              borderRadius: 3,
              background: 'linear-gradient(135deg, rgba(227,242,253,0.45), rgba(255,255,255,0.95))',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="h6" fontWeight={700}>
                {recommendation.scoreBand}
              </Typography>
              <Typography variant="body1" color="text.secondary">
                {recommendation.summary}
              </Typography>
              <Stack direction={{ xs: 'column', md: 'row' }} spacing={1} alignItems={{ md: 'center' }}>
                <Chip icon={<InsightsIcon />} color="primary" variant="outlined" label={`总分：${recommendation.totalScore}`} />
                {focusTopics.length > 0 && (
                  <Chip
                    icon={<TaskAltIcon />}
                    color="success"
                    variant="outlined"
                    label={`复试重点：${focusTopics.slice(0, 3).join('、')}`}
                  />
                )}
              </Stack>
            </Stack>
          </Paper>

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              推荐院校组合
            </Typography>
            <Grid container spacing={2}>
              {recommendation.recommendedUniversities.map((item) => (
                <Grid item xs={12} md={6} key={item.id}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1.5,
                      background: 'linear-gradient(160deg, rgba(255,255,255,0.95), rgba(232,244,253,0.72))',
                    }}
                  >
                    <Stack direction="row" spacing={1.5} alignItems="center">
                      <Box
                        sx={{
                          width: 48,
                          height: 48,
                          borderRadius: '50%',
                          display: 'grid',
                          placeItems: 'center',
                          background: 'rgba(25,118,210,0.12)',
                          color: 'primary.main',
                        }}
                      >
                        <SchoolIcon />
                      </Box>
                      <Box>
                        <Typography variant="subtitle1" fontWeight={700}>
                          {item.name}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {item.province} · {item.level} · {item.category}
                        </Typography>
                      </Box>
                    </Stack>
                    <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                      <Chip
                        label={item.matchLevel}
                        color={matchLevelColor[item.matchLevel] as any}
                        size="small"
                      />
                      <Chip label={item.scoreWindow} size="small" variant="outlined" />
                      {item.tags.slice(0, 3).map((tag) => (
                        <Chip key={tag} label={tag} size="small" variant="outlined" />
                      ))}
                    </Stack>
                    {(item.examSubjects.math ||
                      item.examSubjects.english ||
                      item.examSubjects.politics ||
                      item.examSubjects.professional) && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {item.examSubjects.math && (
                          <Chip label={`数学：${item.examSubjects.math}`} size="small" color="secondary" variant="outlined" />
                        )}
                        {item.examSubjects.english && (
                          <Chip label={`英语：${item.examSubjects.english}`} size="small" color="secondary" variant="outlined" />
                        )}
                        {item.examSubjects.politics && (
                          <Chip
                            label={`政治：${item.examSubjects.politics}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                        {item.examSubjects.professional && (
                          <Chip
                            label={`专业课：${item.examSubjects.professional}`}
                            size="small"
                            color="secondary"
                            variant="outlined"
                          />
                        )}
                      </Stack>
                    )}
                    <Typography variant="body2" color="text.secondary">
                      {item.highlights}
                    </Typography>
                    <Stack spacing={1}>
                      <Alert severity="info" icon={<InfoIcon fontSize="small" />} sx={{ borderRadius: 2 }}>
                        {item.matchReason}
                      </Alert>
                      <Alert severity={item.subjectMatch ? 'success' : 'warning'} sx={{ borderRadius: 2 }}>
                        {item.subjectAdvice}
                      </Alert>
                    </Stack>
                    {item.interviewFocus.length > 0 && (
                      <Stack direction="row" spacing={1} flexWrap="wrap" useFlexGap>
                        {item.interviewFocus.map((topic) => (
                          <Chip key={topic} label={`复试：${topic}`} size="small" color="primary" variant="outlined" />
                        ))}
                      </Stack>
                    )}
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>

          {recommendation.strategy.length > 0 && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                备考策略
              </Typography>
              <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
                {recommendation.strategy.map((tip, index) => (
                  <ListItem key={index} sx={{ px: 0 }}>
                    <ListItemIcon sx={{ minWidth: 36 }}>
                      <InsightsIcon color="primary" />
                    </ListItemIcon>
                    <ListItemText primary={tip} />
                  </ListItem>
                ))}
              </List>
            </Stack>
          )}

          <Divider flexItem />

          <Stack spacing={2}>
            <Typography variant="subtitle1" fontWeight={600}>
              复试准备路线图
            </Typography>
            <Grid container spacing={2}>
              {recommendation.interviewPreparation.timeline.map((step) => (
                <Grid item xs={12} md={4} key={step.stage}>
                  <Paper
                    variant="outlined"
                    sx={{
                      p: 2.5,
                      borderRadius: 3,
                      height: '100%',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 1,
                    }}
                  >
                    <Typography variant="subtitle1" fontWeight={700}>
                      {step.stage}
                    </Typography>
                    <List dense sx={{ p: 0 }}>
                      {step.items.map((item) => (
                        <ListItem key={item} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 32 }}>
                            <TaskAltIcon color="success" />
                          </ListItemIcon>
                          <ListItemText primaryTypographyProps={{ variant: 'body2' }} primary={item} />
                        </ListItem>
                      ))}
                    </List>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Stack>

          {recommendation.interviewPreparation.resources.length > 0 && (
            <Stack spacing={1.5}>
              <Typography variant="subtitle1" fontWeight={600}>
                工具与资料
              </Typography>
              <Grid container spacing={2}>
                {recommendation.interviewPreparation.resources.map((resource) => (
                  <Grid item xs={12} md={4} key={resource.name}>
                    <Paper
                      variant="outlined"
                      sx={{ p: 2, borderRadius: 3, height: '100%', display: 'flex', flexDirection: 'column', gap: 1 }}
                    >
                      <Stack direction="row" spacing={1} alignItems="center">
                        <LaunchIcon color="primary" />
                        <Typography variant="subtitle1" fontWeight={600}>
                          {resource.name}
                        </Typography>
                      </Stack>
                      <Typography variant="body2" color="text.secondary">
                        {resource.description}
                      </Typography>
                      <Button
                        href={resource.url}
                        target="_blank"
                        rel="noreferrer"
                        variant="text"
                        endIcon={<LaunchIcon fontSize="small" />}
                        sx={{ mt: 'auto', alignSelf: 'flex-start' }}
                      >
                        查看详情
                      </Button>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Stack>
          )}
        </Stack>
      )}
    </Stack>
  );
};

export default UniversityAdvisorPanel;
