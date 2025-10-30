import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  IconButton,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbUpAltIcon from '@mui/icons-material/ThumbUpAlt';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import forumService, { ForumPost, ForumTopic } from '../services/forumService';

const formatDateTime = (value: string | null | undefined) => {
  if (!value) {
    return '刚刚';
  }

  const date = new Date(value);
  if (Number.isNaN(date.getTime())) {
    return value;
  }

  return date.toLocaleString('zh-CN', { hour12: false });
};

const Forum = () => {
  const queryClient = useQueryClient();
  const [selectedTopicId, setSelectedTopicId] = useState<number | null>(null);
  const [topicTitle, setTopicTitle] = useState('');
  const [topicDescription, setTopicDescription] = useState('');
  const [postContent, setPostContent] = useState('');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const {
    data: topics = [],
    isLoading: topicsLoading,
    isError: topicsError,
    refetch: refetchTopics,
  } = useQuery<ForumTopic[]>({
    queryKey: ['forum-topics'],
    queryFn: forumService.fetchForumTopics,
  });

  const selectedTopic = useMemo(
    () => topics.find((topic) => topic.id === selectedTopicId) ?? null,
    [selectedTopicId, topics],
  );

  const {
    data: posts = [],
    isLoading: postsLoading,
    isError: postsError,
    refetch: refetchPosts,
  } = useQuery<ForumPost[]>({
    queryKey: ['forum-posts', selectedTopicId],
    queryFn: () => forumService.fetchForumPosts(selectedTopicId as number),
    enabled: selectedTopicId !== null,
  });

  useEffect(() => {
    if (topics.length === 0) {
      setSelectedTopicId(null);
      return;
    }

    if (selectedTopicId === null || !topics.some((topic) => topic.id === selectedTopicId)) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);

  const createTopicMutation = useMutation({
    mutationFn: forumService.createForumTopic,
    onSuccess: async (topic) => {
      setTopicTitle('');
      setTopicDescription('');
      await queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
      if (topic?.id) {
        setSelectedTopicId(topic.id);
      }
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '创建话题失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const createPostMutation = useMutation({
    mutationFn: (payload: { content: string }) => forumService.createForumPost(selectedTopicId as number, payload),
    onSuccess: async () => {
      setPostContent('');
      if (selectedTopicId !== null) {
        await queryClient.invalidateQueries({ queryKey: ['forum-posts', selectedTopicId] });
      }
      await queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '发送帖子失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const toggleLikeMutation = useMutation({
    mutationFn: (topicId: number) => forumService.toggleTopicLike(topicId),
    onSuccess: ({ likes, liked }, topicId) => {
      queryClient.setQueryData<ForumTopic[]>(['forum-topics'], (previous = []) =>
        previous.map((topic) =>
          topic.id === topicId ? { ...topic, likes, likedByMe: liked } : topic,
        ),
      );
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '点赞失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const deletePostMutation = useMutation({
    mutationFn: ({ topicId, postId }: { topicId: number; postId: number }) =>
      forumService.deleteForumPost(topicId, postId),
    onSuccess: async (_data, variables) => {
      await queryClient.invalidateQueries({ queryKey: ['forum-posts', variables.topicId] });
      await queryClient.invalidateQueries({ queryKey: ['forum-topics'] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '删除帖子失败，请稍后再试';
      setErrorMessage(message);
    },
  });

  const handleCreateTopic = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (!topicTitle.trim()) {
      setErrorMessage('请输入话题标题');
      return;
    }

    await createTopicMutation.mutateAsync({
      title: topicTitle.trim(),
      description: topicDescription.trim() || undefined,
    });
  };

  const handleCreatePost = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setErrorMessage(null);

    if (selectedTopicId === null) {
      setErrorMessage('请先选择一个话题');
      return;
    }

    if (!postContent.trim()) {
      setErrorMessage('请输入帖子内容');
      return;
    }

    await createPostMutation.mutateAsync({ content: postContent.trim() });
  };

  const handleToggleLike = async () => {
    if (selectedTopicId === null) {
      setErrorMessage('请先选择一个话题');
      return;
    }

    setErrorMessage(null);
    await toggleLikeMutation.mutateAsync(selectedTopicId);
  };

  const handleDeletePost = async (postId: number) => {
    if (selectedTopicId === null) {
      return;
    }

    setErrorMessage(null);
    const confirmed = typeof window !== 'undefined' ? window.confirm('确定要删除这条回复吗？') : true;
    if (!confirmed) {
      return;
    }

    await deletePostMutation.mutateAsync({ topicId: selectedTopicId, postId });
  };

  return (
    <Stack spacing={4}>
      <Box>
        <Typography variant="h4" fontWeight={700} gutterBottom>
          考研交流论坛
        </Typography>
        <Typography variant="body1" color="text.secondary">
          这里汇聚了研友们的备考经验、院校资讯与复习心得。你可以新建话题或在现有话题下进行交流，所有内容都会实时写入数据库。
        </Typography>
      </Box>

      {errorMessage ? <Alert severity="error">{errorMessage}</Alert> : null}

      <Grid container spacing={3}>
        <Grid item xs={12} md={4}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', height: '100%' }}>
            <Stack spacing={2} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  话题列表
                </Typography>
                {topicsError ? (
                  <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => refetchTopics()}>重试</Button>}>
                    无法加载话题，请检查后端接口。
                  </Alert>
                ) : null}
              </Box>
              <Divider />
              <List sx={{ flexGrow: 1, overflow: 'auto' }}>
                {topicsLoading ? (
                  <ListItem>加载中…</ListItem>
                ) : topics.length === 0 ? (
                  <ListItem>暂无话题，欢迎率先发起讨论。</ListItem>
                ) : (
                  topics.map((topic) => (
                    <ListItem disablePadding key={topic.id}>
                      <ListItemButton
                        selected={selectedTopicId === topic.id}
                        onClick={() => {
                          setSelectedTopicId(topic.id);
                          setErrorMessage(null);
                        }}
                        sx={{ alignItems: 'flex-start', py: 1.5 }}
                      >
                        <ListItemText
                          primary={
                            <Stack direction="row" justifyContent="space-between" alignItems="center" gap={1}>
                              <Typography variant="subtitle1" fontWeight={600} sx={{ pr: 1 }}>
                                {topic.title}
                              </Typography>
                              <Stack direction="row" spacing={1}>
                                <Chip
                                  icon={<ChatBubbleOutlineIcon fontSize="small" />}
                                  label={topic.replies}
                                  size="small"
                                />
                                <Chip
                                  icon={<ThumbUpAltOutlinedIcon fontSize="small" />}
                                  label={topic.likes}
                                  size="small"
                                  color={topic.likedByMe ? 'primary' : 'default'}
                                />
                              </Stack>
                            </Stack>
                          }
                          secondary={
                            <Typography variant="body2" color="text.secondary">
                              {`${topic.author || '匿名用户'} · ${formatDateTime(topic.updatedAt ?? topic.createdAt)}`}
                            </Typography>
                          }
                        />
                      </ListItemButton>
                    </ListItem>
                  ))
                )}
              </List>
              <Box component="form" onSubmit={handleCreateTopic}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    新建话题
                  </Typography>
                  <TextField
                    label="话题标题"
                    value={topicTitle}
                    onChange={(event) => setTopicTitle(event.target.value)}
                    required
                  />
                  <TextField
                    label="话题描述（可选）"
                    value={topicDescription}
                    onChange={(event) => setTopicDescription(event.target.value)}
                    multiline
                    minRows={2}
                  />
                  <Button type="submit" variant="contained" disabled={createTopicMutation.isPending}>
                    {createTopicMutation.isPending ? '创建中…' : '发布话题'}
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Paper>
        </Grid>
        <Grid item xs={12} md={8}>
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 520 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Box>
                <Stack spacing={1}>
                  <Typography variant="h6" fontWeight={600}>
                    {selectedTopic ? selectedTopic.title : '请选择一个话题'}
                  </Typography>
                  {selectedTopic ? (
                    <>
                      <Typography variant="body2" color="text.secondary">
                        {selectedTopic.description || '该话题暂无描述。'}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${selectedTopic.author || '匿名用户'} · ${formatDateTime(selectedTopic.updatedAt ?? selectedTopic.createdAt)}`}
                      </Typography>
                      <Stack
                        direction={{ xs: 'column', sm: 'row' }}
                        spacing={1.5}
                        mt={1}
                        alignItems={{ xs: 'flex-start', sm: 'center' }}
                      >
                        <Stack direction="row" spacing={1}>
                          <Chip
                            icon={<ChatBubbleOutlineIcon fontSize="small" />}
                            label={`回复 ${selectedTopic.replies}`}
                            size="small"
                          />
                          <Chip
                            icon={<ThumbUpAltOutlinedIcon fontSize="small" />}
                            label={`点赞 ${selectedTopic.likes}`}
                            size="small"
                            color={selectedTopic.likedByMe ? 'primary' : 'default'}
                          />
                        </Stack>
                        <Button
                          type="button"
                          variant={selectedTopic.likedByMe ? 'contained' : 'outlined'}
                          color={selectedTopic.likedByMe ? 'primary' : 'inherit'}
                          startIcon={selectedTopic.likedByMe ? <ThumbUpAltIcon /> : <ThumbUpAltOutlinedIcon />}
                          onClick={handleToggleLike}
                          disabled={toggleLikeMutation.isPending}
                        >
                          {toggleLikeMutation.isPending
                            ? '更新中…'
                            : selectedTopic.likedByMe
                            ? `已赞 ${selectedTopic.likes}`
                            : `点赞 ${selectedTopic.likes}`}
                        </Button>
                      </Stack>
                    </>
                  ) : null}
                  {postsError ? (
                    <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => refetchPosts()}>重试</Button>}>
                      无法加载帖子内容。
                    </Alert>
                  ) : null}
                </Stack>
              </Box>
              <Divider />
              <Stack spacing={2} sx={{ flexGrow: 1, overflow: 'auto' }}>
                {postsLoading ? (
                  <Typography variant="body2" color="text.secondary">
                    正在加载帖子…
                  </Typography>
                ) : posts.length === 0 ? (
                  <Typography variant="body2" color="text.secondary">
                    暂无帖子，快来抢沙发吧！
                  </Typography>
                ) : (
                  posts.map((post) => (
                    <Box key={post.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50', border: '1px solid', borderColor: 'divider' }}>
                      <Stack direction="row" justifyContent="space-between" alignItems="flex-start" spacing={1}>
                        <Typography variant="body1" sx={{ whiteSpace: 'pre-wrap' }}>
                          {post.content}
                        </Typography>
                        {post.canDelete ? (
                          <Tooltip title="删除回复">
                            <span>
                              <IconButton
                                size="small"
                                onClick={() => handleDeletePost(post.id)}
                                disabled={deletePostMutation.isPending}
                              >
                                <DeleteOutlineIcon fontSize="small" />
                              </IconButton>
                            </span>
                          </Tooltip>
                        ) : null}
                      </Stack>
                      <Typography variant="caption" color="text.secondary">
                        {`${post.author || '匿名用户'} · ${formatDateTime(post.updatedAt ?? post.createdAt)}`}
                        {post.isAuthor ? '（我的发言）' : ''}
                      </Typography>
                    </Box>
                  ))
                )}
              </Stack>
              <Box component="form" onSubmit={handleCreatePost}>
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary">
                    发表回复
                  </Typography>
                  <TextField
                    label="帖子内容"
                    value={postContent}
                    onChange={(event) => setPostContent(event.target.value)}
                    multiline
                    minRows={3}
                    disabled={selectedTopicId === null}
                  />
                  <Button
                    type="submit"
                    variant="contained"
                    disabled={createPostMutation.isPending || selectedTopicId === null}
                  >
                    {createPostMutation.isPending ? '发送中…' : '发送'}
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

export default Forum;
