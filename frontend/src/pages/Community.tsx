import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Collapse,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  Divider,
  Grid,
  IconButton,
  LinearProgress,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import FavoriteIcon from '@mui/icons-material/Favorite';
import FavoriteBorderIcon from '@mui/icons-material/FavoriteBorder';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ForumIcon from '@mui/icons-material/Forum';
import SchoolIcon from '@mui/icons-material/School';
import MenuBookIcon from '@mui/icons-material/MenuBook';
import { Link as RouterLink } from 'react-router-dom';
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '../context/AuthContext';
import useForum, { FORUM_QUERY_KEY } from '../hooks/useForum';
import forumService, { ForumComment, ForumTopic } from '../services/forumService';

const Community = () => {
  const { user } = useAuth();
  const forumEnabled = Boolean(user?.id);
  const queryClient = useQueryClient();

  const { topicsQuery, createTopicMutation, toggleLikeMutation } = useForum(forumEnabled);
  const { data: topics = [], isFetching, isError, refetch } = topicsQuery;

  const [isTopicDialogOpen, setTopicDialogOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', description: '', tags: '' });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [activeTopicId, setActiveTopicId] = useState<string | null>(null);

  const postsQuery = useQuery<ForumComment[]>({
    queryKey: ['forum-posts', activeTopicId],
    queryFn: () => forumService.fetchForumPosts(activeTopicId as string),
    enabled: forumEnabled && Boolean(activeTopicId),
    staleTime: 30 * 1000,
  });

  const createCommentMutation = useMutation({
    mutationFn: ({ topicId, content }: { topicId: string; content: string }) =>
      forumService.createForumPost(topicId, { content }),
    onSuccess: async (_, { topicId }) => {
      setCommentDrafts((prev) => ({ ...prev, [topicId]: '' }));
      await Promise.all([
        queryClient.invalidateQueries({ queryKey: ['forum-posts', topicId] }),
        queryClient.invalidateQueries({ queryKey: FORUM_QUERY_KEY }),
      ]);
    },
    onError: () => {
      setFeedback({ type: 'error', message: '发表评论失败，请稍后重试。' });
    },
  });

  const sortedTopics = useMemo<ForumTopic[]>(
    () => topics.slice().sort((a, b) => dayjs(b.updatedAt ?? 0).valueOf() - dayjs(a.updatedAt ?? 0).valueOf()),
    [topics],
  );

  const handleCreateTopic = async () => {
    if (!user || !topicForm.title.trim() || !topicForm.description.trim()) {
      setFeedback({ type: 'error', message: '请完善标题和内容后再发帖。' });
      return;
    }
    const tags = topicForm.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean);
    try {
      await createTopicMutation.mutateAsync({
        title: topicForm.title,
        description: topicForm.description,
        tags,
      });
      setTopicDialogOpen(false);
      setTopicForm({ title: '', description: '', tags: '' });
      setFeedback({ type: 'success', message: '已发布新的圈子话题。' });
    } catch (error) {
      setFeedback({ type: 'error', message: '发帖失败，请稍后再试。' });
    }
  };

  const handleSubmitComment = async (topicId: string) => {
    if (!user) return;
    const content = commentDrafts[topicId]?.trim();
    if (!content) {
      return;
    }
    try {
      await createCommentMutation.mutateAsync({ topicId, content });
    } catch (error) {
      // 错误已在 onError 中处理
    }
  };

  const handleToggleLike = async (topicId: string) => {
    if (!user) {
      setFeedback({ type: 'error', message: '请登录后再进行点赞操作。' });
      return;
    }
    try {
      await toggleLikeMutation.mutateAsync(topicId);
    } catch (error) {
      setFeedback({ type: 'error', message: '点赞失败，请稍后再试。' });
    }
  };

  const isBusy =
    isFetching ||
    createTopicMutation.isPending ||
    toggleLikeMutation.isPending ||
    createCommentMutation.isPending ||
    postsQuery.isFetching;

  return (
    <Stack spacing={4}>
      {isBusy && <LinearProgress color="secondary" />}
      {isError && (
        <Alert
          severity="error"
          action={
            <Button color="inherit" size="small" onClick={() => refetch()}>
              重试
            </Button>
          }
        >
          圈子动态暂时不可用，稍后再试试吧。
        </Alert>
      )}

      <Stack direction={{ xs: 'column', md: 'row' }} spacing={3} justifyContent="space-between" alignItems={{ md: 'center' }}>
        <Box>
          <Typography variant="h4" fontWeight={700} gutterBottom>
            考研交流圈
          </Typography>
          <Typography variant="body1" color="text.secondary">
            分享备考心得、互相点赞鼓励，管理员会实时巡查敏感信息并协助维护学习氛围。
          </Typography>
        </Box>
        <Button startIcon={<ForumIcon />} variant="contained" disabled={!forumEnabled} onClick={() => setTopicDialogOpen(true)}>
          发布新话题
        </Button>
      </Stack>

      {!forumEnabled && (
        <Alert severity="info">请先登录体验圈子互动功能，可使用演示账号快速进入。</Alert>
      )}

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Stack spacing={3}>
        {sortedTopics.map((topic) => {
          const isExpanded = activeTopicId === topic.id;
          const topicPosts = isExpanded ? postsQuery.data ?? [] : [];

          return (
            <Paper key={topic.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
              <Stack spacing={2}>
                <Stack direction="row" spacing={2} alignItems="center">
                  <Avatar sx={{ bgcolor: 'primary.main' }}>{topic.author.name.charAt(0)}</Avatar>
                  <Box>
                    <Typography variant="subtitle1" fontWeight={600}>
                      {topic.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {topic.author.name} · {topic.createdAt ? dayjs(topic.createdAt).format('MM月DD日 HH:mm') : '刚刚'}
                    </Typography>
                  </Box>
                  {topic.tags.length > 0 && (
                    <Stack direction="row" spacing={1} sx={{ ml: 'auto' }}>
                      {topic.tags.map((tag) => (
                        <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                      ))}
                    </Stack>
                  )}
                </Stack>

                <Typography variant="body1" color="text.primary">
                  {topic.description}
                </Typography>

                <Stack direction="row" spacing={2} alignItems="center">
                  <IconButton color={topic.likedByUser ? 'error' : 'default'} onClick={() => handleToggleLike(topic.id)} aria-label="like">
                    {topic.likedByUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                  </IconButton>
                  <Typography variant="body2" color="text.secondary">
                    {topic.likes}
                  </Typography>
                  <Chip
                    icon={<ChatBubbleOutlineIcon />}
                    label={`${topic.replies} 条回复`}
                    variant="outlined"
                    onClick={() => {
                      setActiveTopicId((prev) => (prev === topic.id ? null : topic.id));
                    }}
                  />
                </Stack>

                <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                  <Stack spacing={1.5} mt={1.5}>
                    {topicPosts.length === 0 ? (
                      <Typography variant="body2" color="text.secondary">
                        还没有同学发表评论，抢先写下你的观点吧。
                      </Typography>
                    ) : (
                      topicPosts.map((comment) => (
                        <Paper key={comment.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                          <Stack direction="row" spacing={2}>
                            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main' }}>
                              {comment.author.name.charAt(0)}
                            </Avatar>
                            <Box>
                              <Typography variant="subtitle2">{comment.author.name}</Typography>
                              <Typography variant="caption" color="text.secondary">
                                {comment.createdAt ? dayjs(comment.createdAt).format('MM月DD日 HH:mm') : '刚刚'}
                              </Typography>
                              <Typography variant="body2" mt={1}>
                                {comment.content}
                              </Typography>
                            </Box>
                          </Stack>
                        </Paper>
                      ))
                    )}

                    <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                      <TextField
                        fullWidth
                        placeholder="写下你的想法..."
                        value={commentDrafts[topic.id] ?? ''}
                        onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [topic.id]: event.target.value }))}
                        size="small"
                        disabled={!forumEnabled}
                      />
                      <Button
                        variant="contained"
                        onClick={() => handleSubmitComment(topic.id)}
                        disabled={!forumEnabled || !commentDrafts[topic.id]?.trim()}
                      >
                        发表评论
                      </Button>
                    </Stack>
                  </Stack>
                </Collapse>
              </Stack>
            </Paper>
          );
        })}
      </Stack>

      <Dialog open={isTopicDialogOpen} onClose={() => setTopicDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>发布圈子话题</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={2}>
            <TextField
              label="话题标题"
              value={topicForm.title}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
              required
            />
            <TextField
              label="正文内容"
              value={topicForm.description}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, description: event.target.value }))}
              multiline
              minRows={4}
              required
            />
            <TextField
              label="标签（逗号分隔）"
              value={topicForm.tags}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, tags: event.target.value }))}
              helperText="示例：经验分享,复试,英语"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateTopic} disabled={createTopicMutation.isPending}>
            {createTopicMutation.isPending ? '发布中…' : '立即发布'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Community;
