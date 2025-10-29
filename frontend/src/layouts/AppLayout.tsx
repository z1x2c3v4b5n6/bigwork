import {
  AppBar,
  Avatar,
  Box,
  Chip,
  Container,
  Divider,
  Drawer,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Menu,
  MenuItem,
  Toolbar,
  Typography,
  useMediaQuery,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import SchoolIcon from '@mui/icons-material/School';
import AssignmentIcon from '@mui/icons-material/Assignment';
import QuizIcon from '@mui/icons-material/Quiz';
import EventIcon from '@mui/icons-material/Event';
import TimelineIcon from '@mui/icons-material/Timeline';
import PersonIcon from '@mui/icons-material/Person';
import DarkModeIcon from '@mui/icons-material/DarkMode';
import LightModeIcon from '@mui/icons-material/LightMode';
import AdminPanelSettingsIcon from '@mui/icons-material/AdminPanelSettings';
import LogoutIcon from '@mui/icons-material/Logout';
import { useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

interface AppLayoutProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const drawerWidth = 240;

const baseNavItems = [
  { label: '概览', path: '/', icon: <SchoolIcon /> },
  { label: '课程体系', path: '/courses', icon: <AssignmentIcon /> },
  { label: '刷题训练', path: '/practice', icon: <QuizIcon /> },
  { label: '学习日程', path: '/schedule', icon: <EventIcon /> },
  { label: '学习分析', path: '/analytics', icon: <TimelineIcon /> },
  { label: '个人中心', path: '/profile', icon: <PersonIcon /> },
];

const AppLayout = ({ mode, onToggleMode }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [profileAnchor, setProfileAnchor] = useState<null | HTMLElement>(null);
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, logout } = useAuth();

  const navItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [
        baseNavItems[0],
        { label: '教研管理', path: '/admin', icon: <AdminPanelSettingsIcon /> },
        ...baseNavItems.slice(1),
      ];
    }
    return baseNavItems;
  }, [user]);

  const drawerContent = useMemo(
    () => (
      <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
        <Toolbar sx={{ gap: 2 }}>
          <Avatar sx={{ bgcolor: 'primary.main' }}>研</Avatar>
          <Box>
            <Typography variant="subtitle1" fontWeight={700}>
              研学进阶
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Kaoyan Mastery Platform
            </Typography>
          </Box>
        </Toolbar>
        <Divider />
        <List sx={{ flexGrow: 1 }}>
          {navItems.map((item) => (
            <ListItemButton
              key={item.path}
              selected={location.pathname === item.path}
              onClick={() => {
                navigate(item.path);
                setMobileOpen(false);
              }}
              sx={{ borderRadius: 2, mx: 1, my: 0.5 }}
            >
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.label} />
            </ListItemButton>
          ))}
        </List>
        <Divider />
        <Box sx={{ p: 2, textAlign: 'center' }}>
          <Typography variant="body2" color="text.secondary">
            一起保持进步，不负考研热忱。
          </Typography>
        </Box>
      </Box>
    ),
    [location.pathname, navigate, navItems],
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar position="fixed" color="inherit" sx={{ boxShadow: 'none', borderBottom: 1, borderColor: 'divider' }}>
        <Toolbar>
          {!isDesktop && (
            <IconButton color="primary" edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 2 }}>
              <MenuIcon />
            </IconButton>
          )}
          <Box sx={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
            <Typography variant="h6">考研学习平台</Typography>
            {user && (
              <Typography variant="caption" color="text.secondary">
                {user.organization}
              </Typography>
            )}
          </Box>
          <IconButton color="primary" onClick={onToggleMode}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          {user && (
            <>
              <Chip
                label={user.role === 'admin' ? '管理员' : '普通学员'}
                size="small"
                color={user.role === 'admin' ? 'warning' : 'default'}
                sx={{ ml: 2 }}
              />
              <IconButton onClick={(event) => setProfileAnchor(event.currentTarget)}>
                <Avatar sx={{ ml: 1, bgcolor: 'primary.main' }}>{user.avatar}</Avatar>
              </IconButton>
              <Menu
                anchorEl={profileAnchor}
                open={Boolean(profileAnchor)}
                onClose={() => setProfileAnchor(null)}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                transformOrigin={{ vertical: 'top', horizontal: 'right' }}
              >
                <MenuItem disabled>{user.name}</MenuItem>
                <MenuItem disabled sx={{ maxWidth: 220, whiteSpace: 'normal', lineHeight: 1.4 }}>
                  {user.email}
                </MenuItem>
                <Divider sx={{ my: 1 }} />
                <MenuItem
                  onClick={() => {
                    setProfileAnchor(null);
                    logout();
                    navigate('/login');
                  }}
                >
                  <ListItemIcon>
                    <LogoutIcon fontSize="small" />
                  </ListItemIcon>
                  退出登录
                </MenuItem>
              </Menu>
            </>
          )}
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { lg: drawerWidth }, flexShrink: { lg: 0 } }}>
        <Drawer
          variant={isDesktop ? 'permanent' : 'temporary'}
          open={isDesktop ? true : mobileOpen}
          onClose={() => setMobileOpen(false)}
          ModalProps={{ keepMounted: true }}
          sx={{
            '& .MuiDrawer-paper': {
              boxSizing: 'border-box',
              width: drawerWidth,
            },
          }}
        >
          {drawerContent}
        </Drawer>
      </Box>

      <Box component="main" sx={{ flexGrow: 1, bgcolor: 'background.default' }}>
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: 4 }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
};

export default AppLayout;
