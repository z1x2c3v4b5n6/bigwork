import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  Alert,
  Box,
  Button,
  Divider,
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

const Login = () => {
  const { login, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const redirectPath = state.from?.pathname;

  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  const quickAccounts = [
    {
      title: '考研学习平台考生账号',
      description: '刷题、学习进度与课程资源同步。',
      username: 'student',
      password: 'study2025',
    },
    {
      title: '考研教研管理员账号',
      description: '课程、题库与学员管理。',
      username: 'admin',
      password: 'admin123',
    },
    {
      title: '院校官方账号',
      description: '发布院校公告与复试动态。',
      username: 'institution',
      password: 'admit2024',
    },
  ];

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

  const handleFill = (fillUsername: string, fillPassword: string) => {
    setUsername(fillUsername);
    setPassword(fillPassword);
    setError(null);
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: 'linear-gradient(135deg, #f0f5ff 0%, #f9fcff 40%, #f5f7fb 100%)',
        '&::before': {
          content: '""',
          position: 'absolute',
          inset: -120,
          background:
            'radial-gradient(circle at 20% 20%, rgba(57, 130, 255, 0.12), transparent 40%),' +
            'radial-gradient(circle at 80% 30%, rgba(0, 200, 180, 0.12), transparent 38%),' +
            'radial-gradient(circle at 40% 80%, rgba(255, 163, 102, 0.12), transparent 36%)',
          zIndex: 0,
        },
        '&::after': {
          content: '""',
          position: 'absolute',
          width: 520,
          height: 520,
          borderRadius: '50%',
          background:
            'linear-gradient(145deg, rgba(57, 130, 255, 0.08), rgba(0, 200, 180, 0.06))',
          filter: 'blur(60px)',
          top: { xs: -180, sm: -140 },
          right: { xs: -220, sm: -160 },
          zIndex: 0,
        },
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        p: { xs: 2, sm: 4 },
      }}
    >
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
          p: { xs: 3, sm: 4 },
          borderRadius: 4,
          border: '1px solid',
          borderColor: 'divider',
          bgcolor: '#ffffff',
          boxShadow: '0 18px 48px rgba(0,0,0,0.06)',
          position: 'relative',
          zIndex: 1,
        }}
      >
        <Stack spacing={3.5}>
          <Stack spacing={1.5} alignItems="center" textAlign="center">
            <Box
              sx={{
                width: 64,
                height: 64,
                borderRadius: '50%',
                bgcolor: 'primary.light',
                color: 'primary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LockOpenIcon fontSize="medium" />
            </Box>
            <Stack spacing={0.5}>
              <Typography variant="h5" fontWeight={700}>
                欢迎登录考研学习平台
              </Typography>
              <Typography variant="body2" color="text.secondary">
                更贴近 Web 端的考研学习平台，统一账号支持学生、教研管理员、院校官方。
              </Typography>
              <Typography variant="body2" color="text.secondary">
                账号在数据库中保持唯一，请勿随意删除。
              </Typography>
            </Stack>
          </Stack>

          <Stack spacing={1.5}>
            {quickAccounts.map((item) => (
              <Paper
                key={item.username}
                variant="outlined"
                sx={{
                  p: 2.25,
                  borderRadius: 3,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2,
                  borderColor: 'divider',
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="subtitle1" fontWeight={700}>
                    {item.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                    {item.description}
                  </Typography>
                  <Stack direction="row" spacing={2} sx={{ mt: 1.25 }}>
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        用户名
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        {item.username}
                      </Typography>
                    </Stack>
                    <Divider flexItem orientation="vertical" />
                    <Stack spacing={0.25}>
                      <Typography variant="caption" color="text.secondary">
                        密码
                      </Typography>
                      <Typography variant="body2" fontWeight={600}>
                        ••••••
                      </Typography>
                    </Stack>
                  </Stack>
                </Box>
                <Button
                  variant="outlined"
                  size="small"
                  onClick={() => handleFill(item.username, item.password)}
                  sx={{ minWidth: 96, borderRadius: 2 }}
                >
                  填入
                </Button>
              </Paper>
            ))}
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <TextField
                label="用户名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoFocus
                autoComplete="username"
              />
              <TextField
                label="密码"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="current-password"
              />
              <Button
                type="submit"
                variant="contained"
                size="large"
                disabled={loading}
                sx={{ borderRadius: 2, py: 1.4 }}
              >
                {loading ? '正在登录…' : '登录'}
              </Button>
              <Button
                component={RouterLink}
                to="/register"
                disabled={loading}
                sx={{ borderRadius: 2 }}
              >
                没有账号？立即注册
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
