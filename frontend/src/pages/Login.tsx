import LockOpenIcon from '@mui/icons-material/LockOpen';
import {
  Alert,
  Box,
  Button,
  Paper,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
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
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 420,
          p: 4,
          borderRadius: 3,
          border: '1px solid',
          borderColor: 'divider',
        }}
      >
        <Stack spacing={3}>
          <Stack spacing={1} alignItems="center">
            <Box
              sx={{
                width: 56,
                height: 56,
                borderRadius: '50%',
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
              管理后台登录
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              使用在后端创建的管理员账号登录。账户信息将由服务端和数据库维护，我们不会自动创建。
            </Typography>
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
              >
                {loading ? '正在登录…' : '登录'}
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Login;
