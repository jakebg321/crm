'use client';

import { Box, Drawer, List, ListItem, ListItemIcon, ListItemText, IconButton, Typography, useTheme, useMediaQuery } from '@mui/material';
import { useSession } from 'next-auth/react';
import { useRouter, usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PeopleIcon from '@mui/icons-material/People';
import AssignmentIcon from '@mui/icons-material/Assignment';
import DescriptionIcon from '@mui/icons-material/Description';
import PhotoIcon from '@mui/icons-material/Photo';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MenuIcon from '@mui/icons-material/Menu';

const drawerWidth = 240;

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { data: session, status } = useSession();
  const router = useRouter();
  const pathname = usePathname();
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [mobileOpen, setMobileOpen] = useState(false);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated' && session?.user?.role === 'STAFF') {
      router.push('/staff/dashboard');
    }
  }, [status, session, router]);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/admin/dashboard' },
    { text: 'Employees', icon: <PeopleIcon />, path: '/admin/employees' },
    { text: 'Jobs', icon: <AssignmentIcon />, path: '/admin/jobs' },
    { text: 'Estimates', icon: <DescriptionIcon />, path: '/admin/estimates' },
    { text: 'Photos', icon: <PhotoIcon />, path: '/admin/photos' },
    { text: 'Notifications', icon: <NotificationsIcon />, path: '/admin/notifications' },
  ];

  const drawer = (
    <Box sx={{ overflow: 'auto' }}>
      <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <Typography variant="h6" noWrap component="div">
          Admin Panel
        </Typography>
      </Box>
      <List>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            href={item.path}
            selected={pathname === item.path}
            sx={{
              '&.Mui-selected': {
                backgroundColor: theme.palette.primary.main,
                color: theme.palette.primary.contrastText,
                '&:hover': {
                  backgroundColor: theme.palette.primary.dark,
                },
                '& .MuiListItemIcon-root': {
                  color: theme.palette.primary.contrastText,
                },
              },
            }}
          >
            <ListItemIcon sx={{ color: pathname === item.path ? 'inherit' : 'text.primary' }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText primary={item.text} />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        Loading...
      </Box>
    );
  }

  return (
    <Box sx={{ display: 'flex' }}>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        {isMobile ? (
          <Drawer
            variant="temporary"
            open={mobileOpen}
            onClose={handleDrawerToggle}
            ModalProps={{
              keepMounted: true, // Better open performance on mobile.
            }}
            sx={{
              display: { xs: 'block', sm: 'none' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
          >
            {drawer}
          </Drawer>
        ) : (
          <Drawer
            variant="permanent"
            sx={{
              display: { xs: 'none', sm: 'block' },
              '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            }}
            open
          >
            {drawer}
          </Drawer>
        )}
      </Box>
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          minHeight: '100vh',
          backgroundColor: theme.palette.background.default,
        }}
      >
        {isMobile && (
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
        )}
        {children}
      </Box>
    </Box>
  );
} 