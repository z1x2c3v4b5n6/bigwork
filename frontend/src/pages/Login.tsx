import {
  Alert,
  Box,
  Button,
  MenuItem,
  Paper,
  TextField,
  Typography,
} from '@mui/material';
import { FormEvent, useEffect, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const credentialPresets = [
  { label: 'Admin', username: 'admin', password: 'admin123' },
  { label: 'Student', username: 'student', password: 'student123' },
];

const Login = () => {
  const { user, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [selectedPreset, setSelectedPreset] = useState('');
  const [error, setError] = useState('');

  const redirectPath = useMemo(() => {
    const state = location.state as { from?: { pathname: string } } | undefined;

    if (state?.from?.pathname) {
      return state.from.pathname;
    }

    if (user?.role === 'admin') {
      return '/analytics';
    }

    return '/';
  }, [location.state, user?.role]);

  useEffect(() => {
    if (user) {
      navigate(redirectPath, { replace: true });
    }
  }, [navigate, redirectPath, user]);

  const handlePresetChange = (value: string) => {
    setSelectedPreset(value);
    const preset = credentialPresets.find((option) => option.username === value);

    if (preset) {
      setUsername(preset.username);
      setPassword(preset.password);
    } else {
      setUsername('');
      setPassword('');
    }
  };

  const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError('');

    try {
      const authenticatedUser = login(username, password);
      const fallbackPath = authenticatedUser.role === 'admin' ? '/analytics' : '/';
      navigate(redirectPath || fallbackPath, { replace: true });
    } catch (loginError) {
      setError(loginError instanceof Error ? loginError.message : 'Unable to login');
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        px: 2,
      }}
    >
      <Paper component="form" onSubmit={handleSubmit} elevation={6} sx={{ maxWidth: 420, width: '100%', p: 4 }}>
        <Typography variant="h4" component="h1" fontWeight={700} gutterBottom>
          登录账户
        </Typography>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          选择预设账号或输入用户名与密码以访问平台。
        </Typography>

        <TextField
          select
          label="快速选择账号"
          value={selectedPreset}
          onChange={(event) => handlePresetChange(event.target.value)}
          fullWidth
          margin="normal"
        >
          <MenuItem value="">
            <em>手动输入</em>
          </MenuItem>
          {credentialPresets.map((preset) => (
            <MenuItem key={preset.username} value={preset.username}>
              {preset.label}（{preset.username}）
            </MenuItem>
          ))}
        </TextField>

        <TextField
          label="用户名"
          value={username}
          onChange={(event) => setUsername(event.target.value)}
          autoComplete="username"
          required
          fullWidth
          margin="normal"
        />
        <TextField
          label="密码"
          type="password"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
          autoComplete="current-password"
          required
          fullWidth
          margin="normal"
        />

        {error && (
          <Alert severity="error" sx={{ mt: 2 }}>
            {error}
          </Alert>
        )}

        <Button type="submit" variant="contained" size="large" fullWidth sx={{ mt: 3 }}>
          登录
        </Button>
      </Paper>
    </Box>
  );
};

export default Login;
