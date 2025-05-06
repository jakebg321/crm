'use client';

import { Box } from '@mui/material';
import Navigation from './Navigation';
import ThemeDebuggerModal from './ThemeDebuggerModal';

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <Box sx={{ display: 'flex' }}>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 240px)` },
          mt: 8,
        }}
      >
        {children}
      </Box>
      <ThemeDebuggerModal />
    </Box>
  );
} 