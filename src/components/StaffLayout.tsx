'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  AppBar,
  Toolbar,
  Typography,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Divider,
  Avatar,
  Button,
  CircularProgress,
  BottomNavigation,
  BottomNavigationAction,
  Paper,
  useMediaQuery,
  useTheme,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard as DashboardIcon,
  CalendarMonth as CalendarIcon,
  Route as RouteIcon,
  PhotoCamera as CameraIcon,
  Message as MessageIcon,
  Logout as LogoutIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { signOut } from 'next-auth/react';

interface StaffLayoutProps {
  children: React.ReactNode;
}

export default function StaffLayout({ children }: StaffLayoutProps) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [navValue, setNavValue] = useState(0);
  
  // Redirect if not authenticated or not staff
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (session?.user?.role !== 'STAFF') {
      // If user is not staff, redirect to appropriate dashboard
      router.push('/');
    }
  }, [status, session, router]);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const handleNavigation = (path: string) => {
    router.push(path);
    setDrawerOpen(false);
  };

  const handleSignOut = async () => {
    await signOut({ redirect: false });
    router.push('/login');
  };

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/staff/dashboard' },
    { text: 'My Schedule', icon: <CalendarIcon />, path: '/staff/schedule' },
    { text: 'Route Planner', icon: <RouteIcon />, path: '/staff/route' },
    { text: 'Job Photos', icon: <CameraIcon />, path: '/staff/photos' },
    { text: 'Messages', icon: <MessageIcon />, path: '/staff/messages' },
  ];

  const drawer = (
    <Box sx={{ width: 250 }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', gap: 2 }}>
        <Avatar sx={{ bgcolor: theme.palette.primary.main }}>
          {session?.user?.name?.[0] || 'S'}
        </Avatar>
        <Box>
          <Typography variant="subtitle1">{session?.user?.name || 'Staff User'}</Typography>
          <Typography variant="body2" color="text.secondary">Field Staff</Typography>
        </Box>
      </Box>
      <Divider />
      <List>
        {menuItems.map((item, index) => (
          <ListItem key={item.text} disablePadding>
            <ListItemButton onClick={() => handleNavigation(item.path)}>
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText primary={item.text} />
            </ListItemButton>
          </ListItem>
        ))}
      </List>
      <Divider />
      <List>
        <ListItem disablePadding>
          <ListItemButton onClick={handleSignOut}>
            <ListItemIcon><LogoutIcon /></ListItemIcon>
            <ListItemText primary="Sign Out" />
          </ListItemButton>
        </ListItem>
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="fixed" sx={{ zIndex: (theme) => theme.zIndex.drawer + 1 }}>
        <Toolbar>
          <IconButton
            color="inherit"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" noWrap component="div" sx={{ flexGrow: 1 }}>
            YardBase Staff
          </Typography>
          <IconButton color="inherit" onClick={() => router.push('/staff/profile')}>
            <PersonIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      
      {/* Desktop drawer */}
      <Drawer
        variant="temporary"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{ keepMounted: true }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { width: 250, boxSizing: 'border-box' },
        }}
      >
        {drawer}
      </Drawer>
      
      {/* Desktop drawer - permanent on larger screens */}
      <Drawer
        variant="permanent"
        sx={{
          display: { xs: 'none', sm: 'block' },
          width: 250,
          flexShrink: 0,
          [`& .MuiDrawer-paper`]: { width: 250, boxSizing: 'border-box' },
        }}
        open
      >
        <Toolbar /> {/* This creates space for the AppBar */}
        {drawer}
      </Drawer>
      
      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - 250px)` },
          ml: { sm: `250px` },
          mt: { xs: '56px', sm: '64px' },
          mb: { xs: '56px', sm: 0 },
        }}
      >
        {children}
      </Box>
      
      {/* Mobile bottom navigation */}
      {isMobile && (
        <Paper
          elevation={3}
          sx={{ position: 'fixed', bottom: 0, left: 0, right: 0, zIndex: 1100 }}
        >
          <BottomNavigation
            value={navValue}
            onChange={(_, newValue) => {
              setNavValue(newValue);
              handleNavigation(menuItems[newValue].path);
            }}
            showLabels
          >
            {menuItems.map((item, index) => (
              <BottomNavigationAction key={item.text} label={item.text} icon={item.icon} />
            ))}
          </BottomNavigation>
        </Paper>
      )}
    </Box>
  );
} 