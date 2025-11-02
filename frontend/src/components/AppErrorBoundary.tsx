import { Component, ErrorInfo, ReactNode } from 'react';
import { Box, Button, Paper, Stack, Typography } from '@mui/material';

interface AppErrorBoundaryProps {
  children: ReactNode;
}

interface AppErrorBoundaryState {
  hasError: boolean;
  error?: Error | null;
}

class AppErrorBoundary extends Component<AppErrorBoundaryProps, AppErrorBoundaryState> {
  public state: AppErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('未捕获的界面错误', error, errorInfo);
  }

  private handleReload = () => {
    this.setState({ hasError: false, error: null });
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <Box sx={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', bgcolor: 'background.default', p: 3 }}>
          <Paper elevation={3} sx={{ maxWidth: 480, p: 4, textAlign: 'center' }}>
            <Stack spacing={2}>
              <Typography variant="h5" fontWeight={700}>
                页面开小差了
              </Typography>
              <Typography variant="body2" color="text.secondary">
                {this.state.error?.message || '发生未知错误，请刷新页面或稍后重试。'}
              </Typography>
              <Button variant="contained" color="primary" onClick={this.handleReload}>
                刷新页面
              </Button>
            </Stack>
          </Paper>
        </Box>
      );
    }

    return this.props.children;
  }
}

export default AppErrorBoundary;
