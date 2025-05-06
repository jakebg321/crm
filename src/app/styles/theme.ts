import { createTheme, alpha } from '@mui/material/styles';

const theme = createTheme({
  palette: {
    primary: {
      main: '#253944',
      light: '#293f4c',
      dark: '#243843',
      contrastText: '#f6f5f0',
    },
    secondary: {
      main: '#f6f5f0',
      light: '#f2f1ed',
      dark: '#f8f7f2',
      contrastText: '#253944',
    },
    success: {
      main: '#389757',
      light: '#389758',
      dark: '#7f6f1',
    },
    warning: {
      main: '#f8f7f2',
      light: '#f6f5f0',
      dark: '#f2f1ed',
    },
    error: {
      main: '#f8f7f2',
      light: '#f6f5f0',
      dark: '#f2f1ed',
    },
    info: {
      main: '#293f4c',
      light: '#253944',
      dark: '#243843',
    },
    text: {
      primary: '#000000',
      secondary: '#253944',
    },
    background: {
      default: '#f6f5f0',
      paper: '#f2f1ed',
    },
    divider: '#f8f7f2',
  },
  typography: {
    fontFamily: '"Plus Jakarta Sans", -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 700,
      letterSpacing: '-0.02em',
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 700,
      letterSpacing: '-0.01em',
    },
    h3: {
      fontSize: '2.25rem',
      fontWeight: 600,
      letterSpacing: '-0.02em',
      lineHeight: 1.2,
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      letterSpacing: '-0.01em',
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
    },
    h6: {
      fontSize: '1.1rem',
      fontWeight: 600,
      letterSpacing: '0.02em',
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 500,
      letterSpacing: '0.01em',
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
    },
    body1: {
      fontSize: '1rem',
      lineHeight: 1.6,
      letterSpacing: '0.01em',
    },
    body2: {
      fontSize: '0.875rem',
      lineHeight: 1.57,
    },
    button: {
      fontWeight: 600,
      textTransform: 'none',
      letterSpacing: '0.02em',
    },
    logo: {
      fontFamily: 'Fraunces, serif',
      fontWeight: 700,
      fontSize: '1.75rem',
      letterSpacing: '-0.03em',
    },
  },
  shape: {
    borderRadius: 20,
  },
  shadows: [
    'none',
    '0px 2px 8px rgba(37, 57, 68, 0.06)',
    '0px 4px 16px rgba(37, 57, 68, 0.08)',
    '0px 8px 24px rgba(37, 57, 68, 0.10)',
    '0px 12px 32px rgba(37, 57, 68, 0.12)',
    ...Array(19).fill('none'),
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: '0px 2px 8px rgba(37, 57, 68, 0.06)',
          borderRadius: 20,
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 16px rgba(37, 57, 68, 0.12)',
          },
        },
        elevation1: {
          boxShadow: '0px 2px 8px rgba(37, 57, 68, 0.06)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          padding: '12px 24px',
          fontSize: '0.95rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-1px)',
          },
        },
        contained: {
          boxShadow: 'none',
          background: '#253944',
          color: '#f6f5f0',
          '&:hover': {
            boxShadow: '0px 4px 16px rgba(37, 57, 68, 0.2)',
            background: '#243843',
          },
        },
        outlined: {
          borderColor: '#253944',
          color: '#253944',
          '&:hover': {
            borderColor: '#243843',
            background: 'rgba(37, 57, 68, 0.04)',
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 20,
          boxShadow: '0px 2px 8px rgba(37, 57, 68, 0.06)',
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: '0px 4px 16px rgba(37, 57, 68, 0.12)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: alpha('#253944', 0.12),
            '&:hover': {
              backgroundColor: alpha('#253944', 0.18),
            },
          },
          '&:hover': {
            backgroundColor: alpha('#253944', 0.06),
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: '#253944',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: '4px 0px 16px rgba(37, 57, 68, 0.06)',
          backgroundColor: '#f6f5f0',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: '#f2f1ed',
          color: '#000000',
          boxShadow: '0px 2px 8px rgba(37, 57, 68, 0.04)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: '#f6f5f0',
          '& .MuiTableCell-root': {
            color: '#253944',
            fontWeight: 600,
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: '1px solid #f8f7f2',
          padding: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          height: '32px',
          padding: '0 12px',
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          '&.MuiChip-filled': {
            backgroundColor: alpha('#253944', 0.12),
            color: '#253944',
          },
        },
        outlined: {
          borderColor: '#253944',
          color: '#253944',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 16,
            '& fieldset': {
              borderColor: '#f8f7f2',
            },
            '&:hover fieldset': {
              borderColor: '#253944',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#253944',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 16,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: 16,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          '&.Mui-selected': {
            color: '#253944',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#389757',
        },
      },
    },
    MuiLink: {
      styleOverrides: {
        root: {
          color: '#389757',
          textDecoration: 'none',
          '&:hover': {
            textDecoration: 'underline',
          },
        },
      },
    },
  },
});

export default theme; 