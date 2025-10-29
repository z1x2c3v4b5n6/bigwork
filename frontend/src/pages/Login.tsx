import {
  Alert,
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Divider,
  FormControl,
  InputLabel,
  MenuItem,
  Select,
  Stack,
  TextField,
  Typography,
} from '@mui/material';
import LockIcon from '@mui/icons-material/Lock';
import { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [username, setUsername] = useState('student');
  const [password, setPassword] = useState('study2025');
  const [error, setError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const from = (location.state as { from?: { pathname: string } } | null)?.from?.pathname ?? '/';

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);
    setIsSubmitting(true);

    try {
      await login({ username, password });
      navigate(from, { replace: true });
    } catch (err) {
      setError(err instanceof Error ? err.message : '登录失败，请稍后再试');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'grid',
        placeItems: 'center',
        bgcolor: 'linear-gradient(120deg, #e3f2fd, #f1f8e9)',
        px: 2,
      }}
    >
      <Card sx={{ maxWidth: 420, width: '100%', borderRadius: 4, boxShadow: 8 }}>
        <CardContent sx={{ p: 5 }}>
          <Stack spacing={3} component="form" onSubmit={handleSubmit}>
            <Stack spacing={2} alignItems="center">
              <Avatar sx={{ bgcolor: 'primary.main', width: 72, height: 72 }}>
                <LockIcon fontSize="large" />
              </Avatar>
              <Box textAlign="center">
                <Typography variant="h5" fontWeight={700} gutterBottom>
                  研学进阶登录中心
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  选择对应身份登录即可体验普通学员与管理员的不同功能模块。
                </Typography>
              </Box>
            </Stack>

            <Divider textAlign="left">快速体验账号</Divider>
            <FormControl fullWidth>
              <InputLabel id="login-role">账号类型</InputLabel>
              <Select
                labelId="login-role"
                label="账号类型"
                value={username}
                onChange={(event) => {
                  const value = event.target.value as 'student' | 'admin';
                  setUsername(value);
                  setPassword(value === 'student' ? 'study2025' : 'admin123');
                }}
              >
                <MenuItem value="student">普通学员：student / study2025</MenuItem>
                <MenuItem value="admin">教学管理员：admin / admin123</MenuItem>
              </Select>
            </FormControl>

            <TextField
              label="账号"
              placeholder="student 或 admin"
              value={username}
              onChange={(event) => setUsername(event.target.value)}
              fullWidth
              required
            />
            <TextField
              label="密码"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              fullWidth
              required
            />

            {error && <Alert severity="error">{error}</Alert>}

            <Button type="submit" variant="contained" size="large" disabled={isSubmitting}>
              {isSubmitting ? '登录中…' : '立即登录'}
            </Button>

            <Typography variant="caption" color="text.secondary" textAlign="center">
              登录即表示你同意平台的《用户协议》与《隐私政策》。
            </Typography>
          </Stack>
        </CardContent>
      </Card>
    </Box>
  );
};

export default Login;
