import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {
  Alert,
  Box,
  Button,
  MenuItem,
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

const Register = () => {
  const { register, loading, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state as LocationState) ?? {};
  const redirectPath = state.from?.pathname;

  const [displayName, setDisplayName] = useState('');
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<'student' | 'institution'>('student');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [totalScore, setTotalScore] = useState('');
  const [targetMajor, setTargetMajor] = useState('');
  const [mathSubject, setMathSubject] = useState('');
  const [englishSubject, setEnglishSubject] = useState('');
  const [officialWebsite, setOfficialWebsite] = useState('');
  const [institutionLocation, setInstitutionLocation] = useState('');
  const [institutionTags, setInstitutionTags] = useState('');
  const [institutionFocus, setInstitutionFocus] = useState('');
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

    if (password !== confirmPassword) {
      setError('两次输入的密码不一致');
      return;
    }

    try {
      const payload = {
        username,
        password,
        displayName,
        email: email || undefined,
        role,
      } as const;

      const requestPayload: Parameters<typeof register>[0] = { ...payload };

      if (role === 'student') {
        requestPayload.totalScore = totalScore ? Number(totalScore) : undefined;
        requestPayload.targetMajor = targetMajor || undefined;
        requestPayload.mathSubject = mathSubject || undefined;
        requestPayload.englishSubject = englishSubject || undefined;
      } else {
        requestPayload.officialWebsite = officialWebsite || undefined;
        requestPayload.institutionLocation = institutionLocation || undefined;
        requestPayload.institutionFocus = institutionFocus || undefined;
        requestPayload.institutionTags = institutionTags
          ? institutionTags
              .split(',')
              .map((tag) => tag.trim())
              .filter((tag) => tag.length > 0)
          : undefined;
      }

      await register(requestPayload);
    } catch (err) {
      setError(err instanceof Error ? err.message : '注册失败，请稍后重试');
    }
  };

  return (
    <Box sx={{ display: 'flex', justifyContent: 'center', py: 8 }}>
      <Paper
        elevation={0}
        sx={{
          width: '100%',
          maxWidth: 520,
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
                bgcolor: 'secondary.light',
                color: 'secondary.main',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <PersonAddIcon />
            </Box>
            <Typography variant="h5" fontWeight={700}>
              注册新账号
            </Typography>
            <Typography variant="body2" color="text.secondary" textAlign="center">
              请填写真实的个人信息。账号数据将直接写入数据库，平台不会自动创建或更改任何表结构。
            </Typography>
          </Stack>

          {error ? <Alert severity="error">{error}</Alert> : null}

          <Box component="form" onSubmit={handleSubmit} noValidate>
            <Stack spacing={2}>
              <ToggleButtonGroup
                exclusive
                color="primary"
                value={role}
                onChange={(_, value) => {
                  if (value) {
                    setRole(value);
                    setError(null);
                  }
                }}
                sx={{ alignSelf: 'center' }}
              >
                <ToggleButton value="student">考生注册</ToggleButton>
                <ToggleButton value="institution">院校注册</ToggleButton>
              </ToggleButtonGroup>
              <TextField
                label="姓名"
                value={displayName}
                onChange={(event) => setDisplayName(event.target.value)}
                required
                autoComplete="name"
              />
              <TextField
                label="用户名"
                value={username}
                onChange={(event) => setUsername(event.target.value)}
                required
                autoComplete="username"
              />
              <TextField
                label="邮箱（可选）"
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                autoComplete="email"
              />
              {role === 'student' && (
                <>
                  <TextField
                    label="初试总分"
                    type="number"
                    value={totalScore}
                    onChange={(event) => setTotalScore(event.target.value)}
                    inputProps={{ min: 0, max: 500, step: 1 }}
                    helperText="用于生成个性化院校与科目推荐，可选"
                  />
                  <TextField
                    label="目标专业（可选）"
                    value={targetMajor}
                    onChange={(event) => setTargetMajor(event.target.value)}
                    helperText="填写后可匹配更精准的推荐"
                  />
                  <Stack direction={{ xs: 'column', md: 'row' }} spacing={2}>
                    <TextField
                      select
                      fullWidth
                      label="报考数学科目"
                      value={mathSubject}
                      onChange={(event) => setMathSubject(event.target.value)}
                      helperText="若不考数学可选择“无”"
                    >
                      <MenuItem value="">未填写</MenuItem>
                      <MenuItem value="数学一">数学一</MenuItem>
                      <MenuItem value="数学二">数学二</MenuItem>
                      <MenuItem value="数学三">数学三</MenuItem>
                      <MenuItem value="不考数学">不考数学</MenuItem>
                    </TextField>
                    <TextField
                      select
                      fullWidth
                      label="报考英语科目"
                      value={englishSubject}
                      onChange={(event) => setEnglishSubject(event.target.value)}
                      helperText="若不区分可保持默认"
                    >
                      <MenuItem value="">未填写</MenuItem>
                      <MenuItem value="英语一">英语一</MenuItem>
                      <MenuItem value="英语二">英语二</MenuItem>
                    </TextField>
                  </Stack>
                </>
              )}
              {role === 'institution' && (
                <>
                  <TextField
                    label="院校官网链接"
                    value={officialWebsite}
                    onChange={(event) => setOfficialWebsite(event.target.value)}
                    helperText="用于跳转至院校官方网站，可选"
                  />
                  <TextField
                    label="所在地区"
                    value={institutionLocation}
                    onChange={(event) => setInstitutionLocation(event.target.value)}
                    helperText="例如 北京·海淀区"
                  />
                  <TextField
                    label="院校特色标签"
                    value={institutionTags}
                    onChange={(event) => setInstitutionTags(event.target.value)}
                    helperText="多个标签以逗号分隔，如 985, 计算机, 创新实验室"
                  />
                  <TextField
                    label="招生关注方向（可选）"
                    multiline
                    minRows={2}
                    value={institutionFocus}
                    onChange={(event) => setInstitutionFocus(event.target.value)}
                    helperText="简要描述院校重点专业或复试要求"
                  />
                </>
              )}
              <TextField
                label="密码"
                type="password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                required
                autoComplete="new-password"
              />
              <TextField
                label="确认密码"
                type="password"
                value={confirmPassword}
                onChange={(event) => setConfirmPassword(event.target.value)}
                required
                autoComplete="new-password"
              />
              <Button type="submit" variant="contained" size="large" disabled={loading}>
                {loading ? '正在提交…' : '注册'}
              </Button>
              <Button component={RouterLink} to="/login" disabled={loading}>
                已有账号？立即登录
              </Button>
            </Stack>
          </Box>
        </Stack>
      </Paper>
    </Box>
  );
};

export default Register;
