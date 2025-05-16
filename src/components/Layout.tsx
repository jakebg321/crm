'use client';

import { useState, useEffect } from 'react';
import { Box, LinearProgress } from '@mui/material';
import Navigation from './Navigation';
import ThemeDebuggerModal from './ThemeDebuggerModal';
import { alpha, useTheme } from '@mui/material/styles';
import { usePathname, useRouter } from 'next/navigation';

export default function Layout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const pathname = usePathname();
  const router = useRouter();
  const [isNavigating, setIsNavigating] = useState(false);
  const [prevPath, setPrevPath] = useState('');
  
  // Track navigation state changes
  useEffect(() => {
    if (prevPath !== '' && prevPath !== pathname) {
      // Path has changed, navigation has completed
      setIsNavigating(false);
    }
    
    setPrevPath(pathname);
  }, [pathname, prevPath]);
  
  // Listen for navigation start
  useEffect(() => {
    // Custom event listener for when navigation starts
    const handleNavigationStart = () => {
      setIsNavigating(true);
    };
    
    // We'll simulate this with click events on links
    const handleLinkClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest('a');
      
      if (link && link.href && link.href.startsWith(window.location.origin) && !link.target && !e.ctrlKey && !e.metaKey) {
        setIsNavigating(true);
      }
    };
    
    document.addEventListener('click', handleLinkClick);
    
    return () => {
      document.removeEventListener('click', handleLinkClick);
    };
  }, []);
  
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
        {isNavigating && (
          <LinearProgress 
            sx={{ 
              position: 'fixed', 
              top: 0, 
              left: 0, 
              right: 0, 
              zIndex: 9999,
              height: 3
            }} 
          />
        )}
        {children}
      </Box>
      <ThemeDebuggerModal />
    </Box>
  );
} 