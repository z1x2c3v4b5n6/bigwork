import { Routes, Route, Navigate, Outlet, useLocation } from 'react-router-dom';
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
import { useAuth } from './context/AuthContext';

interface AppShellProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const AppShell = ({ mode, onToggleMode }: AppShellProps) => (
  <AppLayout mode={mode} onToggleMode={onToggleMode}>
    <Outlet />
  </AppLayout>
);

const RequireAuth = () => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return <Outlet />;
};

const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createTheme(mode), [mode]);
  const toggleMode = () => setMode((prev) => (prev === 'light' ? 'dark' : 'light'));

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route element={<RequireAuth />}>
          <Route
            element={<AppShell mode={mode} onToggleMode={toggleMode} />}
          >
            <Route index element={<Home />} />
            <Route path="courses" element={<Courses />} />
            <Route path="practice" element={<Practice />} />
            <Route path="schedule" element={<Schedule />} />
            <Route path="analytics" element={<Analytics />} />
            <Route path="profile" element={<Profile />} />
            <Route path="*" element={<NotFound />} />
          </Route>
        </Route>
      </Routes>
    </ThemeProvider>
  );
};

export default App;
