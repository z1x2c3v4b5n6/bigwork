import {
  AppBar,
  Avatar,
  Box,
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
  Tooltip,
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
import { MouseEvent, ReactNode, useMemo, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth, UserRole } from '../context/AuthContext';

const baseNavItems = [
  { label: '概览', path: '/', icon: <SchoolIcon /> },
  { label: '课程体系', path: '/courses', icon: <AssignmentIcon /> },
  { label: '刷题训练', path: '/practice', icon: <QuizIcon /> },
  { label: '学习日程', path: '/schedule', icon: <EventIcon /> },
  { label: '学习分析', path: '/analytics', icon: <TimelineIcon /> },
  { label: '个人中心', path: '/profile', icon: <PersonIcon /> },
];

const adminNavItem = { label: '后台管理', path: '/admin', icon: <AdminPanelSettingsIcon /> };

interface AppLayoutProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
  children: ReactNode;
}

const drawerWidth = 240;

const AppLayout = ({ mode, onToggleMode, children }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, login, logout, updateRole } = useAuth();

  const navigationItems = useMemo(() => {
    if (user?.role === 'admin') {
      return [...baseNavItems, adminNavItem];
    }
    return baseNavItems;
  }, [user]);

  const handleOpenAccountMenu = (event: MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = () => {
    logout();
    handleCloseAccountMenu();
    if (location.pathname.startsWith('/admin')) {
      navigate('/');
    }
  };

  const handleSwitchRole = (role: UserRole) => {
    updateRole(role);
    handleCloseAccountMenu();
    if (role !== 'admin' && location.pathname.startsWith('/admin')) {
      navigate('/');
    }
  };

  const handleLoginAsStudent = () => {
    login({ id: 'u-001', name: '张同学', role: 'student' });
    handleCloseAccountMenu();
  };

  const userInitial = user?.name?.[0] ?? '访';

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
          {navigationItems.map((item) => (
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
    [location.pathname, navigate, navigationItems],
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
          <Typography variant="h6" sx={{ flexGrow: 1 }}>
            考研学习平台
          </Typography>
          <IconButton color="primary" onClick={onToggleMode}>
            {mode === 'light' ? <DarkModeIcon /> : <LightModeIcon />}
          </IconButton>
          <Tooltip title={user ? `${user.name}（${user.role === 'admin' ? '管理员' : '学员'}）` : '未登录'}>
            <IconButton onClick={handleOpenAccountMenu} size="small" sx={{ ml: 2 }}>
              <Avatar sx={{ width: 36, height: 36 }}>{userInitial}</Avatar>
            </IconButton>
          </Tooltip>
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
          {children}
        </Container>
      </Box>

      <Menu
        anchorEl={accountMenuAnchor}
        open={Boolean(accountMenuAnchor)}
        onClose={handleCloseAccountMenu}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        {user ? (
          <Box component="li" sx={{ px: 2, py: 1.5, listStyle: 'none' }}>
            <Typography variant="subtitle2" fontWeight={600}>
              {user.name}
            </Typography>
            <Typography variant="body2" color="text.secondary">
              {user.role === 'admin' ? '管理员' : '学员'}身份
            </Typography>
          </Box>
        ) : null}
        {user ? <Divider component="li" sx={{ my: 0.5 }} /> : null}
        {user ? (
          <>
            {user.role === 'admin' ? (
              <MenuItem onClick={() => handleSwitchRole('student')}>切换为学员视角</MenuItem>
            ) : (
              <MenuItem onClick={() => handleSwitchRole('admin')}>切换为管理员视角</MenuItem>
            )}
            <MenuItem onClick={handleLogout}>退出登录</MenuItem>
          </>
        ) : (
          <MenuItem onClick={handleLoginAsStudent}>登录为学员</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AppLayout;
