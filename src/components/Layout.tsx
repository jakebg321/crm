'use client';

import { Box } from '@mui/material';
import Navigation from './Navigation';
import ThemeDebuggerModal from './ThemeDebuggerModal';
import { alpha, useTheme } from '@mui/material/styles';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  
  return (
    <Box sx={{ display: 'flex', bgcolor: theme.palette.background.default, minHeight: '100vh' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: { xs: 2, sm: 3, md: 4 },
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
          position: 'relative',
        }}
      >
        {children}
      </Box>
      <ThemeDebuggerModal />
    </Box>
  );
} 