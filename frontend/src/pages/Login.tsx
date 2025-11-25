import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { Link as RouterLink, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface LocationState {
  from?: {
    pathname?: string;
  };
}

interface DemoAccount {
  key: string;
  label: string;
  username: string;
  password: string;
  description: string;
}

const demoAccounts: DemoAccount[] = [
  {
    key: 'student',
    label: '普通学生体验账号',
    username: 'student',
    password: 'study2025',
    description: '进入学习首页、刷题、课程和日程等全部学生功能。',
  },
  {
    key: 'admin',
    label: '教研管理员体验账号',
    username: 'admin',
    password: 'admin123',
    description: '可访问后台管理面板，体验课程、题库与论坛审核流程。',
  },
  {
    key: 'institution',
    label: '院校官方体验账号',
    username: 'institution',
    password: 'admit2024',
    description: '发布院校招生简章、查看关注考生并推送最新动态。',
  },
];

const Login = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const redirectPath = state.from?.pathname;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const handleUseAccount = (account: DemoAccount) => {
    setUsername(account.username);
    setPassword(account.password);
    setError(null);
  };

  useEffect(() => {
    if (user) {
      const target = redirectPath ?? (user.role === 'admin' ? '/admin' : '/');
      navigate(target, { replace: true });
    }
  }, [navigate, redirectPath, user]);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    try {
      await login({ username, password });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后重试');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        px: { xs: 2, md: 6 },
        py: { xs: 6, md: 10 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'background.default',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 10% 20%, rgba(70, 140, 255, 0.1), transparent 30%), radial-gradient(circle at 80% 0%, rgba(118, 190, 255, 0.12), transparent 25%), linear-gradient(135deg, rgba(255,255,255,0.6), rgba(245,248,255,0.7))',
          filter: 'blur(0px)',
          zIndex: 0,
        }}
      />

      <Paper
        elevation={3}
        sx={{
          width: '100%',
          maxWidth: 1100,
          borderRadius: 4,
          p: { xs: 3, md: 5 },
          position: 'relative',
          zIndex: 1,
          backdropFilter: 'blur(10px)',
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 20px 60px rgba(15, 23, 42, 0.15)',
        }}
      >
        <Grid container spacing={4} alignItems="stretch">
          <Grid item xs={12} md={5}>
            <Stack
              spacing={3}
              sx={{
                height: '100%',
                borderRadius: 3,
                background:
                  'linear-gradient(180deg, rgba(33, 150, 243, 0.12) 0%, rgba(21, 101, 192, 0.08) 100%)',
                p: { xs: 3, md: 4 },
                border: '1px solid',
                borderColor: 'primary.light',
              }}
            >
              <Chip label="Web 端专业体验" color="primary" variant="filled" sx={{ width: 'fit-content' }} />
              <Stack spacing={1}>
                <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                  考研学习平台
                  <Box component="span" color="primary.main"> · 登录</Box>
                </Typography>
                <Typography variant="body1" color="text.secondary">
                  统一的账号体系覆盖学生、教研管理员与院校官方。安全的数据存储、桌面级的排版与留白，带来更像 Web 端的专业体验。
                </Typography>
              </Stack>
              <Divider light />
              <Stack spacing={2}>
                {[`刷题与课程资源随时更新`, `院校动态与公告实时同步`, `后台管理支持审核与数据面板`].map(
                  (text) => (
                    <Stack
                      key={text}
                      direction="row"
                      spacing={1.5}
                      alignItems="center"
                      sx={{
                        p: 1.5,
                        borderRadius: 2,
                        bgcolor: 'background.paper',
                        border: '1px solid',
                        borderColor: 'divider',
                        boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                      }}
                    >
                      <Box
                        sx={{
                          width: 36,
                          height: 36,
                          borderRadius: '12px',
                          bgcolor: 'primary.light',
                          display: 'grid',
                          placeItems: 'center',
                          color: 'primary.main',
                          fontWeight: 700,
                        }}
                      >
                        •
                      </Box>
                      <Typography variant="body1" fontWeight={600} color="text.primary">
                        {text}
                      </Typography>
                    </Stack>
                  ),
                )}
              </Stack>
            </Stack>
          </Grid>

          <Grid item xs={12} md={7}>
            <Stack spacing={3} sx={{ height: '100%' }}>
              <Stack spacing={1} alignItems="flex-start">
                <Box
                  sx={{
                    width: 54,
                    height: 54,
                    borderRadius: 2,
                    bgcolor: 'primary.light',
                    color: 'primary.main',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                  }}
                >
                  <LockOpenIcon />
                </Box>
                <Typography variant="h5" fontWeight={700}>
                  输入数据库已有账号密码
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  系统不会自动生成账号或修改表结构，所有身份信息均由后端数据库维护。
                </Typography>
              </Stack>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Box
                sx={{
                  border: '1px dashed',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 2.5,
                  bgcolor: 'background.paper',
                }}
              >
                <Stack spacing={1.5}>
                  <Typography variant="subtitle2" color="text.secondary" fontWeight={700}>
                    体验账号一键填充
                  </Typography>
                  <Box
                    sx={{
                      display: 'grid',
                      gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                      gap: 1.5,
                    }}
                  >
                    {demoAccounts.map((account) => (
                      <Stack
                        key={account.key}
                        spacing={0.5}
                        sx={{
                          borderRadius: 1.5,
                          border: '1px solid',
                          borderColor: 'divider',
                          p: 1.5,
                          bgcolor: 'background.default',
                          transition: 'border-color 0.2s, box-shadow 0.2s',
                          '&:hover': {
                            borderColor: 'primary.main',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.06)',
                          },
                        }}
                      >
                        <Typography variant="body1" fontWeight={700}>
                          {account.label}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          用户名 <strong>{account.username}</strong> · 密码 <strong>{account.password}</strong>
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ minHeight: 40 }}>
                          {account.description}
                        </Typography>
                        <Button
                          variant="outlined"
                          size="small"
                          onClick={() => handleUseAccount(account)}
                          disabled={loading}
                          sx={{ alignSelf: 'flex-start', mt: 0.5 }}
                        >
                          一键填充
                        </Button>
                      </Stack>
                    ))}
                  </Box>
                </Stack>
              </Box>

              <Box
                component="form"
                onSubmit={handleSubmit}
                noValidate
                sx={{
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: { xs: 2.5, md: 3 },
                  boxShadow: '0 10px 30px rgba(0,0,0,0.04)',
                }}
              >
                <Stack spacing={2}>
                  <TextField
                    label="用户名"
                    value={username}
                    onChange={(event) => setUsername(event.target.value)}
                    required
                    autoFocus
                    autoComplete="username"
                    fullWidth
                  />
                  <TextField
                    label="密码"
                    type="password"
                    value={password}
                    onChange={(event) => setPassword(event.target.value)}
                    required
                    autoComplete="current-password"
                    fullWidth
                  />
                  <Button type="submit" variant="contained" size="large" disabled={loading}>
                    {loading ? '正在登录…' : '登录'}
                  </Button>
                  <Button component={RouterLink} to="/register" disabled={loading}>
                    没有账号？立即注册
                  </Button>
                </Stack>
              </Box>
            </Stack>
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;
