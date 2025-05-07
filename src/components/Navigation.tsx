'use client';

import { useState } from 'react';
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
} from '@mui/icons-material';
import Link from 'next/link';
import { alpha, useTheme } from '@mui/material/styles';

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
  const theme = useTheme();

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawer = (
    <div>
      <Toolbar sx={{ 
        px: 2,
        py: 1.5,
      }}>
        <Typography variant="logo" noWrap component="div" sx={{ color: theme.palette.primary.main }}>
          YardBase CRM
        </Typography>
      </Toolbar>
      <List sx={{ px: 1 }}>
        {menuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            href={item.path}
            sx={{
              borderRadius: 1,
              my: 0.5,
              px: 1.5,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>
      <Divider sx={{ mx: 2, my: 1, borderColor: alpha(theme.palette.primary.main, 0.08) }} />
      <List sx={{ px: 1 }}>
        {adminMenuItems.map((item) => (
          <ListItem 
            button 
            key={item.text} 
            component={Link} 
            href={item.path}
            sx={{
              borderRadius: 1,
              my: 0.5,
              px: 1.5,
              py: 1,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.08),
              },
            }}
          >
            <ListItemIcon sx={{ color: theme.palette.primary.main, minWidth: 36 }}>
              {item.icon}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              primaryTypographyProps={{ 
                fontWeight: 500,
                fontSize: '0.95rem',
              }}
            />
          </ListItem>
        ))}
      </List>
    </div>
  );

  return (
    <Box sx={{ display: 'flex' }}>
      <AppBar
        position="fixed"
        sx={{
          width: { sm: `calc(100% - ${drawerWidth}px)` },
          ml: { sm: `${drawerWidth}px` },
          boxShadow: 'none',
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.08)}`,
        }}
      >
        <Toolbar>
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
            YardBase CRM
          </Typography>
        </Toolbar>
      </AppBar>
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