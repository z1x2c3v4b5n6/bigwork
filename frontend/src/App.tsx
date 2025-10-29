import { Routes, Route } from 'react-router-dom';
import { CssBaseline, ThemeProvider } from '@mui/material';
import { useMemo, useState } from 'react';
import createTheme from './theme';
import AppLayout from './layouts/AppLayout';
import Home from './pages/Home';
import Courses from './pages/Courses';
import Practice from './pages/Practice';
import Schedule from './pages/Schedule';
import Analytics from './pages/Analytics';
import Profile from './pages/Profile';
import NotFound from './pages/NotFound';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import Community from './pages/Community';
import { RequireAdmin, RequireAuth } from './components/auth/RequireAuth';

const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route
          element={
            <RequireAuth>
              <AppLayout mode={mode} onToggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')} />
            </RequireAuth>
          }
        >
          <Route index element={<Home />} />
          <Route path="courses" element={<Courses />} />
          <Route path="practice" element={<Practice />} />
          <Route path="schedule" element={<Schedule />} />
          <Route path="community" element={<Community />} />
          <Route path="analytics" element={<Analytics />} />
          <Route path="profile" element={<Profile />} />
          <Route
            path="admin"
            element={
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            }
          />
          <Route path="*" element={<NotFound />} />
        </Route>
        <Route path="*" element={<NotFound />} />
      </Routes>
    </ThemeProvider>
  );
};

export default App;
