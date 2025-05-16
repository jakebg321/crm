'use client';

import { useState, useEffect } from 'react';
import {
  AppBar,
  Box,
  Drawer,
  IconButton,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Button,
  Avatar,
  Menu,
  MenuItem,
} from '@mui/material';
import {
  Menu as MenuIcon,
  Dashboard,
  Work,
  People,
  CalendarMonth,
  Receipt,
  Person,
  Email,
  Settings,
  Logout,
  AccountCircle,
} from '@mui/icons-material';
import Link from 'next/link';
import { alpha, useTheme } from '@mui/material/styles';
import { useSession, signOut } from 'next-auth/react';
import { motion } from 'framer-motion';
import { usePathname, useRouter } from 'next/navigation';
import { useQueryClient } from '@tanstack/react-query';
import { fetchJobs } from '@/hooks/useJobsData';
import { fetchClients } from '@/hooks/useClientsData';

const MotionAppBar = motion.create(AppBar);
const MotionToolbar = motion.create(Toolbar);
const MotionBox = motion.create(Box);
const MotionAvatar = motion.create(Avatar);

const drawerWidth = 240;

const menuItems = [
  { text: 'Dashboard', icon: <Dashboard />, path: '/' },
  { text: 'Jobs', icon: <Work />, path: '/jobs' },
  { text: 'Clients', icon: <People />, path: '/clients' },
  { text: 'Schedule', icon: <CalendarMonth />, path: '/schedule' },
  { text: 'Estimates', icon: <Receipt />, path: '/estimates' },
  { text: 'Employees', icon: <Person />, path: '/employees' },
  { text: 'Messages', icon: <Email />, path: '/messages' },
];

const adminMenuItems = [
  { text: 'Settings', icon: <Settings />, path: '/settings' },
];

export default function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const theme = useTheme();
  const { data: session, status } = useSession();
  const pathname = usePathname();
  const queryClient = useQueryClient();
  const router = useRouter();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleLogout = () => {
    handleMenuClose();
    signOut({ callbackUrl: '/login' });
  };

  // Prefetch data when hovering over menu items
  const prefetchData = (path: string) => {
    // Don't refetch if we're already on the page
    if (pathname === path) return;

    if (path === '/jobs' || path === '/schedule') {
      // Prefetch jobs data
      queryClient.prefetchQuery({
        queryKey: ['jobs', {}],
        queryFn: () => fetchJobs({}),
      });
    }

    if (path === '/clients') {
      // Prefetch clients data
      queryClient.prefetchQuery({
        queryKey: ['clients'],
        queryFn: fetchClients,
      });
    }
  };

  // Ensure all key data is loaded on initial navigation
  useEffect(() => {
    // Preload common data that most pages need
    queryClient.prefetchQuery({
      queryKey: ['clients'],
      queryFn: fetchClients,
    });

    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 7);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    queryClient.prefetchQuery({
      queryKey: ['jobs', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
      queryFn: () => fetchJobs({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
    });
  }, [queryClient]);

  const drawer = (
    <div>
      <Toolbar sx={{ 
        px: 2,
        py: 1.5,
      }}>
        <Typography variant="logo" noWrap component="div" sx={{ color: theme.palette.primary.main }}>
          GreenLead
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => {
          const isActive = pathname === item.path || pathname?.startsWith(`${item.path}/`);
          
          return (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              href={item.path}
              prefetch={true}
              onMouseEnter={() => prefetchData(item.path)}
              onFocus={() => prefetchData(item.path)}
              sx={{
                borderRadius: 1,
                my: 0.5,
                px: 1.5,
                py: 1,
                backgroundColor: isActive 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary, 
                minWidth: 36 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          );
        })}
      </List>
      <Divider sx={{ mx: 2, my: 1, borderColor: alpha(theme.palette.primary.main, 0.08) }} />
      <List sx={{ px: 1 }}>
        {adminMenuItems.map((item) => {
          const isActive = pathname === item.path;
          
          return (
            <ListItem 
              button 
              key={item.text} 
              component={Link} 
              href={item.path}
              prefetch={true}
              sx={{
                borderRadius: 1,
                my: 0.5,
                px: 1.5,
                py: 1,
                backgroundColor: isActive 
                  ? alpha(theme.palette.primary.main, 0.1)
                  : 'transparent',
                color: isActive
                  ? theme.palette.primary.main
                  : theme.palette.text.primary,
                '&:hover': {
                  backgroundColor: isActive
                    ? alpha(theme.palette.primary.main, 0.15)
                    : alpha(theme.palette.primary.main, 0.08),
                },
              }}
            >
              <ListItemIcon sx={{ 
                color: isActive ? theme.palette.primary.main : theme.palette.text.secondary, 
                minWidth: 36 
              }}>
                {item.icon}
              </ListItemIcon>
              <ListItemText 
                primary={item.text} 
                primaryTypographyProps={{ 
                  fontWeight: isActive ? 600 : 500,
                  fontSize: '0.95rem',
                }}
              />
            </ListItem>
          );
        })}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <MotionAppBar
        position="fixed"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
          backgroundColor: theme.palette.background.paper,
        }}
      >
        <MotionToolbar 
          sx={{ justifyContent: 'space-between', minHeight: 64 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.2 }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <IconButton
              color="inherit"
              aria-label="open drawer"
              edge="start"
              onClick={handleDrawerToggle}
              sx={{ mr: 2, display: { sm: 'none' } }}
            >
              <MenuIcon />
            </IconButton>
            <Typography variant="h6" noWrap component="div" sx={{ fontWeight: 600 }}>
              GreenLead
            </Typography>
          </Box>
          
          {status === 'authenticated' && session?.user && (
            <MotionBox 
              sx={{ display: 'flex', alignItems: 'center', gap: 2 }}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3 }}
            >
              <Box 
                sx={{ 
                  display: 'flex', 
                  alignItems: 'center', 
                  gap: 1,
                  cursor: 'pointer',
                  p: 1,
                  borderRadius: 1,
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.08),
                  }
                }}
                onClick={handleMenuOpen}
              >
                <MotionAvatar 
                  sx={{ 
                    width: 32, 
                    height: 32,
                    bgcolor: theme.palette.primary.main,
                    fontSize: '0.875rem',
                  }}
                  whileHover={{ scale: 1.1 }}
                  transition={{ duration: 0.2 }}
                >
                  {session.user.name?.[0]?.toUpperCase() || session.user.email?.[0]?.toUpperCase()}
                </MotionAvatar>
                <Box sx={{ display: { xs: 'none', sm: 'block' } }}>
                  <Typography variant="subtitle2" sx={{ color: theme.palette.text.primary, fontWeight: 600 }}>
                    {session.user.name || session.user.email}
                  </Typography>
                  <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                    {session.user.role || 'User'}
                  </Typography>
                </Box>
              </Box>
              <Menu
                anchorEl={anchorEl}
                open={Boolean(anchorEl)}
                onClose={handleMenuClose}
                PaperProps={{
                  sx: {
                    mt: 1,
                    minWidth: 200,
                    boxShadow: `0px 4px 20px ${alpha(theme.palette.primary.main, 0.15)}`,
                    borderRadius: 2,
                  }
                }}
              >
                <MenuItem onClick={handleMenuClose} component={Link} href="/profile">
                  <ListItemIcon>
                    <AccountCircle fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Profile</ListItemText>
                </MenuItem>
                <MenuItem onClick={handleMenuClose} component={Link} href="/settings">
                  <ListItemIcon>
                    <Settings fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Settings</ListItemText>
                </MenuItem>
                <Divider />
                <MenuItem onClick={handleLogout}>
                  <ListItemIcon>
                    <Logout fontSize="small" />
                  </ListItemIcon>
                  <ListItemText>Logout</ListItemText>
                </MenuItem>
              </Menu>
            </MotionBox>
          )}
        </MotionToolbar>
      </MotionAppBar>
      <Box
        component="nav"
        sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
      >
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{
            keepMounted: true, // Better open performance on mobile.
          }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: `4px 0px 16px ${alpha(theme.palette.primary.main, 0.06)}`,
            },
          }}
        >
          {drawer}
        </Drawer>
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { 
              boxSizing: 'border-box', 
              width: drawerWidth,
              borderRight: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
              boxShadow: 'none',
            },
          }}
          open
        >
          {drawer}
        </Drawer>
      </Box>
    </Box>
  );
} 