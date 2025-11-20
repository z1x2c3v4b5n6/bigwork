import {
  Alert,
  Box,
  Button,
  Chip,
  Paper,
  Stack,
  TextField,
  Typography,
  CircularProgress,
  List,
  ListItem,
  ListItemText,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useState } from 'react';
import dayjs from 'dayjs';
import {
  fetchMyInstitutionProfile,
  publishInstitutionBrochure,
} from '../services/institutionService';

const PROFILE_QUERY_KEY = ['institution-profile'];

const InstitutionBrochureManager = () => {
  const queryClient = useQueryClient();
  const { data, isLoading, isError, refetch } = useQuery({
    queryKey: PROFILE_QUERY_KEY,
    queryFn: fetchMyInstitutionProfile,
  });

  const publishMutation = useMutation({
    mutationFn: publishInstitutionBrochure,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: PROFILE_QUERY_KEY });
    },
  });

  const [title, setTitle] = useState('');
  const [summary, setSummary] = useState('');
  const [link, setLink] = useState('');
  const [formError, setFormError] = useState<string | null>(null);
  const [syncToFeed, setSyncToFeed] = useState(true);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!title.trim()) {
      setFormError('请填写招生简章标题');
      return;
    }
    setFormError(null);
    publishMutation.mutate({
      title: title.trim(),
      summary: summary.trim() || undefined,
      link: link.trim() || undefined,
      publishedAt: new Date().toISOString(),
      featured: syncToFeed,
      status: 'published',
    });
    setTitle('');
    setSummary('');
    setLink('');
    setSyncToFeed(true);
  };

  if (isLoading) {
    return (
      <Box sx={{ py: 3, display: 'flex', justifyContent: 'center' }}>
        <CircularProgress />
      </Box>
    );
  }

  if (isError || !data) {
    return (
      <Alert
        severity="error"
        action={
          <Button color="inherit" size="small" onClick={() => refetch()}>
            重新加载
          </Button>
        }
        sx={{ borderRadius: 3 }}
      >
        无法加载院校信息，请稍后再试。
      </Alert>
    );
  }

  const { profile, brochures, followerCount } = data;

  if (!profile) {
    return (
      <Alert severity="info" sx={{ borderRadius: 3 }}>
        注册信息已同步，完成首次发布后即可在院校目录中展示。
      </Alert>
    );
  }

  return (
    <Stack spacing={3}>
      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1.2}>
          <Typography variant="h6" fontWeight={700}>
            {profile.name}
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.location ?? '全国'} · 当前关注 {followerCount} 人
          </Typography>
          <Typography variant="body2" color="text.secondary">
            {profile.focus ?? '欢迎向考生分享招生亮点与复试要求。'}
          </Typography>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack component="form" spacing={2} onSubmit={handleSubmit}>
          <Typography variant="subtitle1" fontWeight={600}>
            发布最新招生简章
          </Typography>
          {formError ? <Alert severity="warning">{formError}</Alert> : null}
          {publishMutation.isError ? (
            <Alert severity="error">
              {(publishMutation.error as Error).message || '发布失败，请稍后再试。'}
            </Alert>
          ) : null}
          <TextField
            label="标题"
            value={title}
            onChange={(event) => setTitle(event.target.value)}
            required
          />
          <TextField
            label="简要说明"
            value={summary}
            onChange={(event) => setSummary(event.target.value)}
            multiline
            minRows={3}
            placeholder="示例：新增调剂名额、复试流程、奖学金政策等"
          />
          <TextField
            label="外部链接（可选）"
            value={link}
            onChange={(event) => setLink(event.target.value)}
            placeholder="https://"
          />
          <Stack direction="row" spacing={1} alignItems="center">
            <Typography variant="body2" color="text.secondary">
              是否同步到推荐区
            </Typography>
            <Button variant={syncToFeed ? 'contained' : 'outlined'} onClick={() => setSyncToFeed((prev) => !prev)} size="small">
              {syncToFeed ? '已同步首页' : '暂不同步'}
            </Button>
          </Stack>
          <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 1.5 }}>
            <Button type="submit" variant="contained" disabled={publishMutation.isPending}>
              {publishMutation.isPending ? '发布中…' : '发布简章'}
            </Button>
          </Box>
        </Stack>
      </Paper>

      <Paper variant="outlined" sx={{ p: 3, borderRadius: 3 }}>
        <Stack spacing={1.5}>
          <Typography variant="subtitle1" fontWeight={600}>
            已发布的招生简章
          </Typography>
          {brochures.length === 0 ? (
            <Typography variant="body2" color="text.secondary">
              暂无发布记录。
            </Typography>
          ) : (
            <List sx={{ width: '100%', bgcolor: 'transparent', p: 0 }}>
              {brochures.map((item) => (
                <ListItem key={item.id} sx={{ px: 0 }}>
                  <ListItemText
                    primary={item.title}
                    secondary={`${dayjs(item.publishedAt).format('YYYY-MM-DD')} · ${item.summary ?? '暂无简介'}`}
                  />
                  <Stack direction="row" spacing={1} alignItems="center">
                    {item.link ? (
                      <Button href={item.link} target="_blank" rel="noreferrer" size="small">
                        查看
                      </Button>
                    ) : null}
                    <Typography variant="caption" color="text.secondary">
                      {item.status === 'offline' ? '已下架' : '已发布'}
                    </Typography>
                    {item.featured ? <Chip label="同步推荐区" size="small" color="primary" variant="outlined" /> : null}
                  </Stack>
                </ListItem>
              ))}
            </List>
          )}
        </Stack>
      </Paper>
    </Stack>
  );
};

export default InstitutionBrochureManager;
