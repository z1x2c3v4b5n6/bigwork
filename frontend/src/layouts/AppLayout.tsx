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
import ForumIcon from '@mui/icons-material/Forum';
import { MouseEvent, useMemo, useState } from 'react';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const baseNavItems = [
  { label: '概览', path: '/', icon: <SchoolIcon /> },
  { label: '课程体系', path: '/courses', icon: <AssignmentIcon /> },
  { label: '刷题训练', path: '/practice', icon: <QuizIcon /> },
  { label: '学习日程', path: '/schedule', icon: <EventIcon /> },
  { label: '学习分析', path: '/analytics', icon: <TimelineIcon /> },
  { label: '考研论坛', path: '/forum', icon: <ForumIcon /> },
  { label: '个人中心', path: '/profile', icon: <PersonIcon /> },
];

const adminNavItem = { label: '后台管理', path: '/admin', icon: <AdminPanelSettingsIcon /> };

interface AppLayoutProps {
  mode: 'light' | 'dark';
  onToggleMode: () => void;
}

const drawerWidth = 240;

const AppLayout = ({ mode, onToggleMode }: AppLayoutProps) => {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountMenuAnchor, setAccountMenuAnchor] = useState<null | HTMLElement>(null);
  const isDesktop = useMediaQuery('(min-width:1024px)');
  const location = useLocation();
  const navigate = useNavigate();
  const { user, loading: authLoading, logout } = useAuth();

  const isAdmin = useMemo(() => user?.role === 'admin', [user?.role]);

  const navigationItems = useMemo(() => {
    if (isAdmin) {
      return [...baseNavItems, adminNavItem];
    }
    return baseNavItems;
  }, [isAdmin]);

  const handleOpenAccountMenu = (event: MouseEvent<HTMLElement>) => {
    setAccountMenuAnchor(event.currentTarget);
  };

  const handleCloseAccountMenu = () => {
    setAccountMenuAnchor(null);
  };

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('退出登录失败', error);
    } finally {
      handleCloseAccountMenu();
      navigate('/login', { replace: true });
    }
  };

  const handleNavigateToLogin = () => {
    handleCloseAccountMenu();
    navigate('/login');
  };

  const userInitial = user?.name?.[0] ?? (authLoading ? '…' : '访');
  const avatarSrc = user?.avatar ?? undefined;

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
          <Tooltip
            title={
              user
                ? `${user.name}（${isAdmin ? '管理员' : '学员'}）`
                : authLoading
                ? '正在加载账号信息'
                : '未登录'
            }
          >
            <IconButton onClick={handleOpenAccountMenu} size="small" sx={{ ml: 2 }}>
              <Avatar sx={{ width: 36, height: 36 }} src={avatarSrc} alt={user?.name}>
                {userInitial}
              </Avatar>
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
          <Outlet />
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
              {isAdmin ? '管理员' : '学员'}身份
            </Typography>
          </Box>
        ) : null}
        {user ? <Divider component="li" sx={{ my: 0.5 }} /> : null}
        {authLoading ? (
          <MenuItem disabled>正在加载账号信息…</MenuItem>
        ) : user ? (
          <MenuItem onClick={() => { void handleLogout(); }}>退出登录</MenuItem>
        ) : (
          <MenuItem onClick={handleNavigateToLogin}>前往登录</MenuItem>
        )}
      </Menu>
    </Box>
  );
};

export default AppLayout;
