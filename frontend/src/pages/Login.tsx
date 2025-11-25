import LockOpenIcon from '@mui/icons-material/LockOpen';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  InputAdornment,
  Paper,
  Stack,
  TextField,
  ToggleButton,
  ToggleButtonGroup,
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
        py: { xs: 5, md: 8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f5f7f4',
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          inset: 0,
          background:
            'radial-gradient(circle at 10% 20%, rgba(58, 147, 100, 0.14), transparent 30%), radial-gradient(circle at 80% 0%, rgba(72, 139, 93, 0.12), transparent 24%), linear-gradient(135deg, rgba(239,245,239,0.9), rgba(226,237,228,0.95))',
          zIndex: 0,
        }}
      />

      <Paper
        elevation={6}
        sx={{
          width: '100%',
          maxWidth: 840,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 28px 80px rgba(30, 60, 43, 0.16)',
          p: { xs: 3, md: 5 },
          bgcolor: 'white',
        }}
      >
        <Stack spacing={3} height="100%">
          <Stack spacing={0.5} alignItems="flex-start">
            <Chip label="安全登录" color="success" variant="filled" sx={{ borderRadius: 1 }} />
            <Typography variant="h4" fontWeight={800} color="success.dark">
              更贴近 Web 端的考研学习平台
            </Typography>
            <Typography variant="body2" color="text.secondary">
              统一账号支持学生、教研管理员、院校官方。搭配后台管理、课程资源与院校动态，让每次登录都快速进入需要的工作区。
            </Typography>
            <Typography variant="body2" color="text.secondary">
              没有账号？<Button component={RouterLink} to="/register" size="small">创建一个</Button>
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
              <Button component={RouterLink} to="/register" disabled={loading}>
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
