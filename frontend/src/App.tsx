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
import AdminDashboard from './pages/AdminDashboard';
import RequireAdmin from './components/RequireAdmin';
import Login from './pages/Login';

const App = () => {
  const [mode, setMode] = useState<'light' | 'dark'>('light');
  const theme = useMemo(() => createTheme(mode), [mode]);

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AppLayout mode={mode} onToggleMode={() => setMode(mode === 'light' ? 'dark' : 'light')}>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/courses" element={<Courses />} />
          <Route path="/practice" element={<Practice />} />
          <Route path="/schedule" element={<Schedule />} />
          <Route path="/analytics" element={<Analytics />} />
          <Route path="/profile" element={<Profile />} />
          <Route path="/login" element={<Login />} />
          <Route
            path="/admin"
            element={(
              <RequireAdmin>
                <AdminDashboard />
              </RequireAdmin>
            )}
          />
          <Route path="*" element={<NotFound />} />
        </Routes>
      </AppLayout>
    </ThemeProvider>
  );
};

export default App;
