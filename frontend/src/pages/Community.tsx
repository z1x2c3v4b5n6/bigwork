import {
  Alert,
  Avatar,
  Box,
  Button,
  Chip,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
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
import { useMemo, useState } from 'react';
import dayjs from 'dayjs';
import { useAuth } from '../context/AuthContext';
import useForum from '../hooks/useForum';
import type { ForumTopic } from '../services/forumService';

const Community = () => {
  const { user } = useAuth();
  const { topicsQuery, createTopicMutation, createCommentMutation, toggleLikeMutation } = useForum(user);
  const { data: topics = [], isFetching, isError, refetch } = topicsQuery;

  const [isTopicDialogOpen, setTopicDialogOpen] = useState(false);
  const [topicForm, setTopicForm] = useState({ title: '', content: '', tags: '' });
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const sortedTopics = useMemo<ForumTopic[]>(
    () => topics.slice().sort((a, b) => dayjs(b.createdAt ?? 0).valueOf() - dayjs(a.createdAt ?? 0).valueOf()),
    [topics],
  );

  const handleCreateTopic = async () => {
    if (!user || !topicForm.title.trim() || !topicForm.content.trim()) {
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
        content: topicForm.content,
        tags,
      });
      setTopicDialogOpen(false);
      setTopicForm({ title: '', content: '', tags: '' });
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
      setCommentDrafts((prev) => ({ ...prev, [topicId]: '' }));
    } catch (error) {
      setFeedback({ type: 'error', message: '发表评论失败，请稍后重试。' });
    }
  };

  const handleToggleLike = async (topicId: string) => {
    if (!user) return;
    try {
      await toggleLikeMutation.mutateAsync(topicId);
    } catch (error) {
      setFeedback({ type: 'error', message: '点赞失败，请稍后再试。' });
    }
  };

  return (
    <Stack spacing={4}>
      {(isFetching || createTopicMutation.isPending || createCommentMutation.isPending || toggleLikeMutation.isPending) && (
        <LinearProgress color="secondary" />
      )}
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
        <Button startIcon={<ForumIcon />} variant="contained" onClick={() => setTopicDialogOpen(true)}>
          发布新话题
        </Button>
      </Stack>

      {feedback && (
        <Alert severity={feedback.type} onClose={() => setFeedback(null)}>
          {feedback.message}
        </Alert>
      )}

      <Stack spacing={3}>
        {sortedTopics.map((topic) => (
          <Paper key={topic.id} elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider' }}>
            <Stack spacing={2}>
              <Stack direction="row" spacing={2} alignItems="center">
                <Avatar>{topic.author.avatar}</Avatar>
                <Box>
                  <Typography variant="subtitle1" fontWeight={600}>
                    {topic.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {topic.author.name} · {topic.createdAt ? dayjs(topic.createdAt).format('MM月DD日 HH:mm') : '刚刚'}
                  </Typography>
                </Box>
                {topic.needsModeration && <Chip label="待审核" color="warning" size="small" sx={{ ml: 'auto' }} />}
              </Stack>

              <Typography variant="body1" color="text.primary">
                {topic.content}
              </Typography>

              <Stack direction="row" spacing={1} flexWrap="wrap">
                {topic.tags.map((tag) => (
                  <Chip key={tag} label={`#${tag}`} size="small" variant="outlined" />
                ))}
              </Stack>

              <Stack direction="row" spacing={2} alignItems="center">
                <IconButton
                  color={topic.likedByUser ? 'error' : 'default'}
                  onClick={() => handleToggleLike(topic.id)}
                  aria-label="like"
                >
                  {topic.likedByUser ? <FavoriteIcon /> : <FavoriteBorderIcon />}
                </IconButton>
                <Typography variant="body2" color="text.secondary">
                  {topic.likes}
                </Typography>
                <Chip icon={<ChatBubbleOutlineIcon />} label={`${topic.comments.length} 条回复`} variant="outlined" />
              </Stack>

              <Stack spacing={1.5}>
                {topic.comments.map((comment) => (
                  <Paper key={comment.id} variant="outlined" sx={{ p: 2, borderRadius: 2 }}>
                    <Stack direction="row" spacing={2}>
                      <Avatar sx={{ width: 36, height: 36 }}>{comment.author.avatar}</Avatar>
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
                ))}

                <Stack direction={{ xs: 'column', md: 'row' }} spacing={2} alignItems={{ md: 'center' }}>
                  <TextField
                    fullWidth
                    placeholder="写下你的想法..."
                    value={commentDrafts[topic.id] ?? ''}
                    onChange={(event) => setCommentDrafts((prev) => ({ ...prev, [topic.id]: event.target.value }))}
                    size="small"
                  />
                  <Button
                    variant="contained"
                    onClick={() => handleSubmitComment(topic.id)}
                    disabled={!commentDrafts[topic.id]?.trim()}
                  >
                    发表评论
                  </Button>
                </Stack>
              </Stack>
            </Stack>
          </Paper>
        ))}

        {sortedTopics.length === 0 && !isFetching && (
          <Alert severity="info">圈子暂时还没有动态，成为第一位分享经验的同学吧！</Alert>
        )}
      </Stack>

      <Dialog open={isTopicDialogOpen} onClose={() => setTopicDialogOpen(false)} fullWidth maxWidth="sm">
        <DialogTitle>发布新话题</DialogTitle>
        <DialogContent dividers>
          <Stack spacing={3}>
            <TextField
              label="话题标题"
              value={topicForm.title}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, title: event.target.value }))}
              placeholder="例如：408 算法如何高效复习？"
            />
            <TextField
              label="内容"
              value={topicForm.content}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, content: event.target.value }))}
              multiline
              minRows={4}
              placeholder="分享你的备考经验、遇到的难题或求助信息。"
            />
            <TextField
              label="标签"
              value={topicForm.tags}
              onChange={(event) => setTopicForm((prev) => ({ ...prev, tags: event.target.value }))}
              helperText="使用逗号分隔多个标签，例如：数学,英语,专业课"
            />
          </Stack>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setTopicDialogOpen(false)}>取消</Button>
          <Button variant="contained" onClick={handleCreateTopic} disabled={createTopicMutation.isPending}>
            {createTopicMutation.isPending ? '发布中…' : '发布话题'}
          </Button>
        </DialogActions>
      </Dialog>
    </Stack>
  );
};

export default Community;
