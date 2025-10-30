import {
  Alert,
  Box,
  Button,
  Divider,
  Grid,
  List,
  ListItem,
  ListItemButton,
  ListItemText,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import forumService, { ForumPost, ForumTopic } from '../services/forumService';

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
      await queryClient.invalidateQueries({ queryKey: ['forum-posts', selectedTopicId] });
    },
    onError: (error) => {
      const message = error instanceof Error ? error.message : '发送帖子失败，请稍后再试';
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

    await createTopicMutation.mutateAsync({ title: topicTitle.trim(), description: topicDescription.trim() || undefined });
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
                      >
                        <ListItemText
                          primary={topic.title}
                          secondary={`${topic.author} · ${topic.updatedAt ?? '刚刚更新'}`}
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
          <Paper elevation={0} sx={{ p: 3, borderRadius: 3, border: '1px solid', borderColor: 'divider', minHeight: 480 }}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Box>
                <Typography variant="h6" fontWeight={600}>
                  {selectedTopic ? selectedTopic.title : '请选择一个话题'}
                </Typography>
                {selectedTopic ? (
                  <Typography variant="body2" color="text.secondary" mt={1}>
                    {selectedTopic.description || '该话题暂无描述。'}
                  </Typography>
                ) : null}
                {postsError ? (
                  <Alert severity="error" sx={{ mt: 2 }} action={<Button color="inherit" onClick={() => refetchPosts()}>重试</Button>}>
                    无法加载帖子内容。
                  </Alert>
                ) : null}
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
                    <Box key={post.id} sx={{ p: 2, borderRadius: 2, bgcolor: 'grey.50' }}>
                      <Typography variant="body1" mb={1}>
                        {post.content}
                      </Typography>
                      <Typography variant="caption" color="text.secondary">
                        {`${post.author} · ${post.createdAt ?? '刚刚发布'}`}
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
                  <Button type="submit" variant="contained" disabled={createPostMutation.isPending || selectedTopicId === null}>
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
  useEffect(() => {
    if (topics.length === 0) {
      return;
    }

    if (selectedTopicId === null || !topics.some((topic) => topic.id === selectedTopicId)) {
      setSelectedTopicId(topics[0].id);
    }
  }, [topics, selectedTopicId]);
