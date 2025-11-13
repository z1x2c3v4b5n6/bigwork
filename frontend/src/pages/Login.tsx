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
              欢迎登录考研学习平台
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              请输入数据库中已存在的账号密码。所有身份信息均由后端数据库维护，我们不会自动创建或修改表结构。
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box
            sx={{
              border: '1px dashed',
              borderColor: 'divider',
              borderRadius: 2,
              p: 2,
              bgcolor: 'background.default',
            }}
          >
            <Stack spacing={1.5}>
              <Typography variant="subtitle2" color="text.secondary" fontWeight={600}>
                一键填充体验账号
              </Typography>
              {demoAccounts.map((account) => (
                <Stack
                  key={account.key}
                  direction={{ xs: 'column', sm: 'row' }}
                  spacing={1}
                  alignItems={{ xs: 'flex-start', sm: 'center' }}
                  justifyContent="space-between"
                  sx={{
                    borderRadius: 1.5,
                    border: '1px solid',
                    borderColor: 'divider',
                    p: 1.5,
                    bgcolor: 'background.paper',
                  }}
                >
                  <Box>
                    <Typography variant="body1" fontWeight={600}>
                      {account.label}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
                      用户名 <strong>{account.username}</strong> · 密码 <strong>{account.password}</strong>
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {account.description}
                    </Typography>
                  </Box>
                  <Button
                    variant="outlined"
                    size="small"
                    onClick={() => handleUseAccount(account)}
                    disabled={loading}
                  >
                    一键填充
                  </Button>
                </Stack>
              ))}
            </Stack>
          </Box>

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
