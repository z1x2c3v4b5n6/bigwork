import { createTheme as createMuiTheme } from '@mui/material';

const createTheme = (mode: 'light' | 'dark') =>
  createMuiTheme({
    palette: {
      mode,
      primary: {
        main: '#1976d2',
      },
      secondary: {
        main: '#ff7043',
      },
      background: {
        default: mode === 'light' ? '#f4f6fb' : '#0d1117',
        paper: mode === 'light' ? '#ffffff' : '#161b22',
      },
    },
    typography: {
      fontFamily: '"Noto Sans SC", "Roboto", sans-serif',
      h4: {
        fontWeight: 600,
      },
      h6: {
        fontWeight: 600,
      },
    },
    shape: {
      borderRadius: 16,
    },
    components: {
      MuiButton: {
        styleOverrides: {
          root: {
            borderRadius: 999,
            textTransform: 'none',
            paddingInline: '1.5rem',
            paddingBlock: '0.6rem',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            borderRadius: 20,
          },
        },
      },
    },
  });

export default createTheme;
