import { createTheme, alpha } from '@mui/material/styles';

// Helper function to get CSS variable with fallback
const cssVar = (name: string, fallback: string) => {
  if (typeof window !== 'undefined') {
    const cssVariable = getComputedStyle(document.documentElement)
      .getPropertyValue(`--mui-palette-${name}`)
      .trim();
    
    return cssVariable || fallback;
  }
  return fallback;
};

const theme = createTheme({
  palette: {
    primary: {
      main: cssVar('primary-main', '#2a724a'),
      light: cssVar('primary-light', '#3d8a5e'),
      dark: cssVar('primary-dark', '#1e5a39'),
      contrastText: cssVar('primary-contrastText', '#ffffff'),
    },
    secondary: {
      main: cssVar('secondary-main', '#f6f5f0'),
      light: cssVar('secondary-light', '#f2f1ed'),
      dark: cssVar('secondary-dark', '#f8f7f2'),
      contrastText: cssVar('secondary-contrastText', '#2a724a'),
    },
    success: {
      main: cssVar('success-main', '#389758'),
      light: cssVar('success-light', '#4ca76a'),
      dark: cssVar('success-dark', '#2d7f46'),
    },
    warning: {
      main: cssVar('warning-main', '#f8f772'),
      light: cssVar('warning-light', '#faf88a'),
      dark: cssVar('warning-dark', '#e5e45a'),
    },
    error: {
      main: cssVar('error-main', '#f44336'),
      light: cssVar('error-light', '#f6685e'),
      dark: cssVar('error-dark', '#d32f2f'),
    },
    info: {
      main: cssVar('info-main', '#3d8a5e'),
      light: cssVar('info-light', '#2a724a'),
      dark: cssVar('info-dark', '#1e5a39'),
    },
    text: {
      primary: cssVar('text-primary', '#2c2c2c'),
      secondary: cssVar('text-secondary', '#2a724a'),
    },
    background: {
      default: cssVar('background-default', '#f6f5f0'),
      paper: cssVar('background-paper', '#f2f1ed'),
    },
    divider: cssVar('divider', '#f8f7f2'),
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
    borderRadius: 3,
  },
  shadows: [
    'none',
    '0px 1px 3px rgba(0,0,0,0.2), 0px 1px 1px rgba(0,0,0,0.14), 0px 2px 1px rgba(0,0,0,0.12)',
    '0px 1.5px 5px rgba(0,0,0,0.2), 0px 2px 2px rgba(0,0,0,0.14), 0px 3px 1px rgba(0,0,0,0.12)',
    '0px 1.5px 8px rgba(0,0,0,0.2), 0px 3px 4px rgba(0,0,0,0.14), 0px 3px 3px rgba(0,0,0,0.12)',
    '0px 2px 10px rgba(0,0,0,0.2), 0px 4px 5px rgba(0,0,0,0.14), 0px 1.5px 10px rgba(0,0,0,0.12)',
    '0px 3px 14px rgba(0,0,0,0.2), 0px 5px 8px rgba(0,0,0,0.14), 0px 1.5px 14px rgba(0,0,0,0.12)',
    '0px 4px 18px rgba(0,0,0,0.2), 0px 6px 10px rgba(0,0,0,0.14), 0px 2px 16px rgba(0,0,0,0.12)',
    '0px 5px 22px rgba(0,0,0,0.2), 0px 7px 12px rgba(0,0,0,0.14), 0px 2.5px 18px rgba(0,0,0,0.12)',
    '0px 6px 26px rgba(0,0,0,0.2), 0px 8px 14px rgba(0,0,0,0.14), 0px 3px 20px rgba(0,0,0,0.12)',
    '0px 7px 30px rgba(0,0,0,0.2), 0px 9px 16px rgba(0,0,0,0.14), 0px 3.5px 22px rgba(0,0,0,0.12)',
    '0px 8px 34px rgba(0,0,0,0.2), 0px 10px 18px rgba(0,0,0,0.14), 0px 4px 24px rgba(0,0,0,0.12)',
    '0px 9px 38px rgba(0,0,0,0.2), 0px 11px 20px rgba(0,0,0,0.14), 0px 4.5px 26px rgba(0,0,0,0.12)',
    '0px 10px 42px rgba(0,0,0,0.2), 0px 12px 22px rgba(0,0,0,0.14), 0px 5px 28px rgba(0,0,0,0.12)',
    '0px 11px 46px rgba(0,0,0,0.2), 0px 13px 24px rgba(0,0,0,0.14), 0px 5.5px 30px rgba(0,0,0,0.12)',
    '0px 12px 50px rgba(0,0,0,0.2), 0px 14px 26px rgba(0,0,0,0.14), 0px 6px 32px rgba(0,0,0,0.12)',
    '0px 13px 54px rgba(0,0,0,0.2), 0px 15px 28px rgba(0,0,0,0.14), 0px 6.5px 34px rgba(0,0,0,0.12)',
    '0px 14px 58px rgba(0,0,0,0.2), 0px 16px 30px rgba(0,0,0,0.14), 0px 7px 36px rgba(0,0,0,0.12)',
    '0px 15px 62px rgba(0,0,0,0.2), 0px 17px 32px rgba(0,0,0,0.14), 0px 7.5px 38px rgba(0,0,0,0.12)',
    '0px 16px 66px rgba(0,0,0,0.2), 0px 18px 34px rgba(0,0,0,0.14), 0px 8px 40px rgba(0,0,0,0.12)',
    '0px 17px 70px rgba(0,0,0,0.2), 0px 19px 36px rgba(0,0,0,0.14), 0px 8.5px 42px rgba(0,0,0,0.12)',
    '0px 18px 74px rgba(0,0,0,0.2), 0px 20px 38px rgba(0,0,0,0.14), 0px 9px 44px rgba(0,0,0,0.12)',
    '0px 19px 78px rgba(0,0,0,0.2), 0px 21px 40px rgba(0,0,0,0.14), 0px 9.5px 46px rgba(0,0,0,0.12)',
    '0px 20px 82px rgba(0,0,0,0.2), 0px 22px 42px rgba(0,0,0,0.14), 0px 10px 48px rgba(0,0,0,0.12)',
    '0px 21px 86px rgba(0,0,0,0.2), 0px 23px 44px rgba(0,0,0,0.14), 0px 10.5px 50px rgba(0,0,0,0.12)',
    '0px 22px 90px rgba(0,0,0,0.2), 0px 24px 46px rgba(0,0,0,0.14), 0px 11px 52px rgba(0,0,0,0.12)'
  ],
  components: {
    MuiPaper: {
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          boxShadow: 'none',
          borderRadius: 3,
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0px 8px 20px ${alpha(cssVar('primary-main', '#2a724a'), 0.12)}`,
          },
        },
        elevation1: {
          boxShadow: 'none',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          padding: '8px 16px',
          fontSize: '0.875rem',
          fontWeight: 600,
          letterSpacing: '0.02em',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-2px)',
            boxShadow: `0px 4px 12px ${alpha(cssVar('primary-main', '#2a724a'), 0.15)}`,
          },
        },
        contained: {
          boxShadow: 'none',
          background: cssVar('primary-main', '#2a724a'),
          color: cssVar('primary-contrastText', '#ffffff'),
          '&:hover': {
            boxShadow: `0px 6px 16px ${alpha(cssVar('primary-main', '#2a724a'), 0.2)}`,
            background: cssVar('primary-dark', '#1e5a39'),
          },
        },
        outlined: {
          borderColor: cssVar('primary-main', '#2a724a'),
          color: cssVar('primary-main', '#2a724a'),
          '&:hover': {
            borderColor: cssVar('primary-dark', '#1e5a39'),
            background: `rgba(${parseInt(cssVar('primary-main', '#2a724a').slice(1, 3), 16)}, ${parseInt(cssVar('primary-main', '#2a724a').slice(3, 5), 16)}, ${parseInt(cssVar('primary-main', '#2a724a').slice(5, 7), 16)}, 0.04)`,
          },
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 3,
          boxShadow: 'none',
          border: 'none',
          transition: 'all 0.2s ease-in-out',
          '&:hover': {
            transform: 'translateY(-4px)',
            boxShadow: `0px 8px 20px ${alpha(cssVar('primary-main', '#2a724a'), 0.12)}`,
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 2,
          margin: '4px 8px',
          transition: 'all 0.2s ease-in-out',
          '&.Mui-selected': {
            backgroundColor: alpha(cssVar('primary-main', '#2a724a'), 0.12),
            '&:hover': {
              backgroundColor: alpha(cssVar('primary-main', '#2a724a'), 0.18),
            },
          },
          '&:hover': {
            backgroundColor: alpha(cssVar('primary-main', '#2a724a'), 0.06),
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          minWidth: 40,
          color: cssVar('primary-main', '#2a724a'),
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRight: 'none',
          boxShadow: `4px 0px 16px ${alpha(cssVar('primary-main', '#2a724a'), 0.06)}`,
          backgroundColor: cssVar('secondary-main', '#f6f5f0'),
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          backgroundColor: cssVar('secondary-light', '#f2f1ed'),
          color: cssVar('text-primary', '#2c2c2c'),
          boxShadow: `0px 2px 8px ${alpha(cssVar('primary-main', '#2a724a'), 0.04)}`,
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          backgroundColor: cssVar('secondary-main', '#f6f5f0'),
          '& .MuiTableCell-root': {
            color: cssVar('primary-main', '#2a724a'),
            fontWeight: 600,
            letterSpacing: '0.02em',
          },
        },
      },
    },
    MuiTableCell: {
      styleOverrides: {
        root: {
          borderBottom: `1px solid ${cssVar('secondary-dark', '#f8f7f2')}`,
          padding: '16px',
        },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 4,
          height: '32px',
          padding: '0 12px',
          fontSize: '0.85rem',
          fontWeight: 500,
          letterSpacing: '0.02em',
          '&.MuiChip-filled': {
            backgroundColor: alpha('#2a724a', 0.12),
            color: '#2a724a',
          },
        },
        outlined: {
          borderColor: '#2a724a',
          color: '#2a724a',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 2,
            '& fieldset': {
              borderColor: '#f8f7f2',
            },
            '&:hover fieldset': {
              borderColor: '#2a724a',
            },
            '&.Mui-focused fieldset': {
              borderColor: '#2a724a',
            },
          },
        },
      },
    },
    MuiInputBase: {
      styleOverrides: {
        root: {
          borderRadius: 2,
        },
      },
    },
    MuiSelect: {
      styleOverrides: {
        select: {
          borderRadius: 2,
        },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          fontWeight: 600,
          '&.Mui-selected': {
            color: '#2a724a',
          },
        },
      },
    },
    MuiTabs: {
      styleOverrides: {
        indicator: {
          backgroundColor: '#389758',
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