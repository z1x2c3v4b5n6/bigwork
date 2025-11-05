import { Routes, Route, Navigate } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import createTheme from './theme';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Practice from './pages/Practice';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Advisor from './pages/Advisor';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/RequireAdmin';
import Login from './pages/Login';
import Register from './pages/Register';
import RequireAuth from './components/RequireAuth';
import Forum from './pages/Forum';
import PostgraduateIntroTemplates from './pages/PostgraduateIntroTemplates';
import PostgraduateSubjectTopics from './pages/PostgraduateSubjectTopics';
import PostgraduateEnglishReview from './pages/PostgraduateEnglishReview';
import { useAuth } from './context/AuthContext';

const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const { user } = useAuth();
  const theme = useMemo(() => createTheme(mode), [mode]);
  const normalizedRole = user?.role?.toLowerCase() ?? '';
  const hideRetakeToolkit = normalizedRole === 'admin';

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/"
          element={(
            <RequireAuth>
              <AppLayout mode={mode} onToggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')} />
            </RequireAuth>
          )}
        >
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="practice" element={<Practice />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="advisor" element={<Advisor />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="forum" element={<Forum />} />
          {!hideRetakeToolkit && (
            <>
              <Route path="retake-intro" element={<PostgraduateIntroTemplates />} />
              <Route path="retake-subjects" element={<PostgraduateSubjectTopics />} />
              <Route path="retake-english" element={<PostgraduateEnglishReview />} />
            </>
          )}
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={(
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<Navigate to="/login" replace />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
