import LockOpenIcon from '@mui/icons-material/LockOpen';
import PhoneIphoneIcon from '@mui/icons-material/PhoneIphone';
import {
  Alert,
  Box,
  Button,
  Chip,
  Divider,
  Grid,
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
        py: { xs: 5, md: 8 },
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        bgcolor: '#f3f6f2',
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
          maxWidth: 1180,
          borderRadius: 4,
          overflow: 'hidden',
          position: 'relative',
          zIndex: 1,
          border: '1px solid',
          borderColor: 'divider',
          boxShadow: '0 28px 80px rgba(30, 60, 43, 0.16)',
        }}
      >
        <Grid container>
          <Grid
            item
            xs={12}
            md={6}
            sx={{
              p: { xs: 3, md: 5 },
              bgcolor: 'white',
            }}
          >
            <Stack spacing={3} height="100%">
              <Stack spacing={0.5} alignItems="flex-start">
                <Chip label="安全登录" color="success" variant="filled" sx={{ borderRadius: 1 }} />
                <Typography variant="h4" fontWeight={800} color="success.dark">
                  登录
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Sign in
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  没有账号？<Button component={RouterLink} to="/register" size="small">创建一个</Button>
                </Typography>
              </Stack>

              <Box
                sx={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid',
                  borderColor: 'divider',
                  borderRadius: 2,
                  p: 1.5,
                  bgcolor: '#f9fbf8',
                }}
              >
                <Stack spacing={0.5}>
                  <Typography variant="subtitle2" color="text.primary" fontWeight={700}>
                    输入数据库已有账号密码
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    系统不会自动生成账号或修改表结构，所有身份信息均由后端数据库维护。
                  </Typography>
                </Stack>
                <Box
                  sx={{
                    width: 44,
                    height: 44,
                    borderRadius: 2,
                    bgcolor: 'success.light',
                    color: 'success.dark',
                    display: 'grid',
                    placeItems: 'center',
                  }}
                >
                  <LockOpenIcon />
                </Box>
              </Box>

              {error ? <Alert severity="error">{error}</Alert> : null}

              <Stack spacing={1.5}>
                <ToggleButtonGroup
                  exclusive
                  value="username"
                  aria-label="登录方式"
                  fullWidth
                  onChange={() => undefined}
                >
                  <ToggleButton
                    value="username"
                    sx={{
                      '&.Mui-selected': {
                        bgcolor: '#e8f3ec',
                        color: 'success.dark',
                      },
                    }}
                  >
                    手机/用户名登录
                  </ToggleButton>
                  <ToggleButton value="email" disabled>
                    邮箱登录
                  </ToggleButton>
                </ToggleButtonGroup>

                <Box
                  component="form"
                  onSubmit={handleSubmit}
                  noValidate
                  sx={{
                    borderRadius: 2,
                    p: { xs: 2, md: 2.5 },
                    border: '1px solid',
                    borderColor: 'divider',
                    bgcolor: 'white',
                    boxShadow: '0 20px 40px rgba(0,0,0,0.04)',
                  }}
                >
                  <Stack spacing={2.5}>
                    <TextField
                      label="用户名 / 手机号"
                      value={username}
                      onChange={(event) => setUsername(event.target.value)}
                      required
                      autoFocus
                      autoComplete="username"
                      fullWidth
                      InputProps={{
                        startAdornment: (
                          <InputAdornment position="start">
                            <PhoneIphoneIcon color="success" />
                          </InputAdornment>
                        ),
                        sx: { borderRadius: 2.5 },
                      }}
                    />
                    <TextField
                      label="密码"
                      type="password"
                      value={password}
                      onChange={(event) => setPassword(event.target.value)}
                      required
                      autoComplete="current-password"
                      fullWidth
                      InputProps={{
                        sx: { borderRadius: 2.5 },
                      }}
                    />
                    <Stack direction={{ xs: 'column', sm: 'row' }} spacing={1.5} alignItems="center">
                      <Button
                        type="submit"
                        variant="contained"
                        color="success"
                        size="large"
                        disabled={loading}
                        fullWidth
                        sx={{
                          borderRadius: 2,
                          boxShadow: '0 12px 24px rgba(60,128,89,0.25)',
                        }}
                      >
                        {loading ? '正在登录…' : '登录'}
                      </Button>
                      <Button
                        component={RouterLink}
                        to="/"
                        variant="outlined"
                        color="success"
                        fullWidth
                        sx={{ borderRadius: 2 }}
                        disabled={loading}
                      >
                        返回首页
                      </Button>
                    </Stack>
                    <Divider flexItem>
                      <Typography variant="caption" color="text.secondary">
                        体验账号
                      </Typography>
                    </Divider>
                    <Box
                      sx={{
                        borderRadius: 2,
                        border: '1px dashed',
                        borderColor: 'success.light',
                        bgcolor: '#f7fbf6',
                        p: 2,
                      }}
                    >
                      <Typography variant="subtitle2" color="success.dark" fontWeight={700} sx={{ mb: 1 }}>
                        体验账号一键填充
                      </Typography>
                      <Typography variant="body2" color="text.secondary" sx={{ mb: 1.5 }}>
                        点击下方卡片即可填充对应的用户名与密码。
                      </Typography>
                      <Box
                        sx={{
                          display: 'grid',
                          gridTemplateColumns: { xs: '1fr', sm: 'repeat(2, minmax(0, 1fr))' },
                          gap: 1.25,
                        }}
                      >
                        {demoAccounts.map((account) => (
                          <Stack
                            key={account.key}
                            spacing={0.75}
                            sx={{
                              p: 1.5,
                              borderRadius: 2,
                              bgcolor: 'white',
                              border: '1px solid',
                              borderColor: 'divider',
                              boxShadow: '0 16px 40px rgba(0,0,0,0.06)',
                              transition: 'all 0.2s ease',
                              '&:hover': {
                                borderColor: 'success.main',
                                boxShadow: '0 18px 44px rgba(64,122,90,0.16)',
                                transform: 'translateY(-2px)',
                              },
                            }}
                          >
                            <Typography variant="subtitle1" fontWeight={700} color="text.primary">
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
                              color="success"
                              onClick={() => handleUseAccount(account)}
                              disabled={loading}
                              sx={{ alignSelf: 'flex-start', borderRadius: 1.5 }}
                            >
                              一键填充
                            </Button>
                          </Stack>
                        ))}
                      </Box>
                    </Box>
                  </Stack>
                </Box>
              </Stack>
            </Stack>
          </Grid>

          <Grid
            item
            xs={12}
            md={6}
            sx={{
              position: 'relative',
              background:
                'linear-gradient(120deg, rgba(31, 86, 57, 0.92), rgba(50, 118, 83, 0.88)), url(https://images.unsplash.com/photo-1500530855697-b586d89ba3ee?auto=format&fit=crop&w=1400&q=80) center/cover no-repeat',
              color: '#f4fbf6',
              p: { xs: 3, md: 5 },
              display: 'flex',
              alignItems: 'center',
            }}
          >
            <Stack spacing={2.5} sx={{ zIndex: 1 }}>
              <Typography variant="h4" fontWeight={800} lineHeight={1.2}>
                更贴近 Web 端的考研学习平台
              </Typography>
              <Typography variant="body1" sx={{ maxWidth: 440 }} color="rgba(244,251,246,0.9)">
                统一账号支持学生、教研管理员、院校官方。搭配后台管理、课程资源与院校动态，让每次登录都快速进入需要的工作区。
              </Typography>
              <Stack spacing={1.5}>
                {['刷题与课程资源同步', '院校公告与学生关注', '后台审核与数据面板'].map((text) => (
                  <Stack
                    key={text}
                    direction="row"
                    spacing={1.5}
                    alignItems="center"
                    sx={{
                      p: 1.5,
                      borderRadius: 2,
                      bgcolor: 'rgba(255,255,255,0.08)',
                      border: '1px solid rgba(255,255,255,0.14)',
                    }}
                  >
                    <Box
                      sx={{
                        width: 32,
                        height: 32,
                        borderRadius: '10px',
                        bgcolor: 'rgba(255,255,255,0.18)',
                        display: 'grid',
                        placeItems: 'center',
                        fontWeight: 700,
                        color: '#e7f5ea',
                      }}
                    >
                      •
                    </Box>
                    <Typography variant="body1" fontWeight={600} color="#f4fbf6">
                      {text}
                    </Typography>
                  </Stack>
                ))}
              </Stack>
            </Stack>
            <Box
              sx={{
                position: 'absolute',
                inset: 0,
                bgcolor: 'linear-gradient(160deg, rgba(0,0,0,0.08), rgba(0,0,0,0.35))',
                zIndex: 0,
              }}
            />
          </Grid>
        </Grid>
      </Paper>
    </Box>
  );
};

export default Login;
