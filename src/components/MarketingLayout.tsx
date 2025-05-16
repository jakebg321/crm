"use client";

import React from 'react';
import { 
  AppBar, 
  Toolbar, 
  Typography, 
  Button, 
  Box, 
  Container,
  useMediaQuery,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemText,
  Divider
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { Menu as MenuIcon } from '@mui/icons-material';
import Link from 'next/link';
import { useRouter, usePathname } from 'next/navigation';

const navItems = [
  { name: 'Home', path: '/home' },
  { name: 'Features', path: '/features' },
  { name: 'Pricing', path: '/pricing' },
  { name: 'Contact', path: '/contact' },
];

export default function MarketingLayout({ children }: { children: React.ReactNode }) {
  const theme = useTheme();
  const router = useRouter();
  const pathname = usePathname();
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const [drawerOpen, setDrawerOpen] = React.useState(false);

  const handleDrawerToggle = () => {
    setDrawerOpen(!drawerOpen);
  };

  const isActive = (path: string) => {
    return pathname === path;
  };

  const drawer = (
    <Box onClick={handleDrawerToggle} sx={{ textAlign: 'center' }}>
      <Typography 
        variant="h6" 
        component="div" 
        sx={{ 
          my: 2, 
          fontWeight: 700, 
          color: theme.palette.primary.main 
        }}
      >
        GreenLead
      </Typography>
      <Divider />
      <List>
        {navItems.map((item) => (
          <ListItem 
            key={item.name} 
            disablePadding 
            component={Link} 
            href={item.path}
            sx={{ 
              textAlign: 'center',
              color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
              fontWeight: isActive(item.path) ? 600 : 400,
            }}
          >
            <ListItemText primary={item.name} />
          </ListItem>
        ))}
      </List>
      <Box sx={{ mt: 2, p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
        <Button 
          color="primary" 
          onClick={() => router.push("/login")}
          fullWidth
        >
          Login
        </Button>
        <Button 
          variant="contained" 
          color="primary" 
          onClick={() => router.push("/auth/register")}
          fullWidth
        >
          Sign Up
        </Button>
      </Box>
    </Box>
  );

  return (
    <>
      <AppBar 
        position="sticky" 
        color="default" 
        elevation={0}
        sx={{ 
          borderBottom: `1px solid ${theme.palette.divider}`,
          backgroundColor: theme.palette.background.default,
        }}
      >
        <Container maxWidth="lg">
          <Toolbar sx={{ padding: { xs: '0.5rem 0', md: '0.5rem 0' } }}>
            <Typography 
              variant="h5" 
              component={Link}
              href="/home"
              sx={{ 
                flexGrow: 1, 
                fontWeight: 700, 
                color: theme.palette.primary.main,
                textDecoration: 'none',
              }}
            >
              GreenLead
            </Typography>
            
            {/* Desktop Navigation */}
            {!isMobile && (
              <>
                <Box sx={{ display: 'flex', mx: 4 }}>
                  {navItems.map((item) => (
                    <Button 
                      key={item.name}
                      component={Link}
                      href={item.path}
                      sx={{ 
                        mx: 1, 
                        color: isActive(item.path) ? theme.palette.primary.main : theme.palette.text.primary,
                        fontWeight: isActive(item.path) ? 600 : 400,
                        '&:hover': {
                          color: theme.palette.primary.main,
                          backgroundColor: 'transparent'
                        }
                      }}
                    >
                      {item.name}
                    </Button>
                  ))}
                </Box>
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <Button 
                    color="primary" 
                    onClick={() => router.push("/login")}
                  >
                    Login
                  </Button>
                  <Button 
                    variant="contained" 
                    color="primary" 
                    onClick={() => router.push("/auth/register")}
                  >
                    Sign Up
                  </Button>
                </Box>
              </>
            )}
            
            {/* Mobile Navigation */}
            {isMobile && (
              <IconButton
                color="inherit"
                aria-label="open drawer"
                edge="end"
                onClick={handleDrawerToggle}
              >
                <MenuIcon />
              </IconButton>
            )}
          </Toolbar>
        </Container>
      </AppBar>
      
      {/* Mobile Navigation Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={handleDrawerToggle}
        ModalProps={{
          keepMounted: true, // Better open performance on mobile
        }}
        sx={{
          display: { xs: 'block', sm: 'none' },
          '& .MuiDrawer-paper': { boxSizing: 'border-box', width: 240 },
        }}
      >
        {drawer}
      </Drawer>
      
      <Box component="main">
        {children}
      </Box>
      
      {/* Footer */}
      <Box 
        component="footer" 
        sx={{ 
          py: 6, 
          px: 2,
          mt: 'auto',
          backgroundColor: theme.palette.background.paper,
          borderTop: `1px solid ${theme.palette.divider}`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ 
            display: 'flex', 
            flexDirection: { xs: 'column', md: 'row' },
            justifyContent: 'space-between',
            alignItems: { xs: 'center', md: 'flex-start' },
            textAlign: { xs: 'center', md: 'left' },
            gap: 4
          }}>
            <Box sx={{ maxWidth: '350px' }}>
              <Typography 
                variant="h6" 
                gutterBottom
                sx={{ fontWeight: 700, color: theme.palette.primary.main }}
              >
                GreenLead
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                The complete client management solution built specifically for landscaping businesses.
              </Typography>
            </Box>
            
            <Box sx={{ 
              display: 'flex', 
              flexDirection: { xs: 'column', sm: 'row' },
              gap: { xs: 4, sm: 8 }
            }}>
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Product
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding component={Link} href="/features">
                    <ListItemText primary="Features" />
                  </ListItem>
                  <ListItem disablePadding component={Link} href="/pricing">
                    <ListItemText primary="Pricing" />
                  </ListItem>
                </List>
              </Box>
              
              <Box>
                <Typography variant="subtitle1" gutterBottom sx={{ fontWeight: 600 }}>
                  Company
                </Typography>
                <List dense disablePadding>
                  <ListItem disablePadding component={Link} href="/contact">
                    <ListItemText primary="Contact" />
                  </ListItem>
                  <ListItem disablePadding component={Link} href="/login">
                    <ListItemText primary="Login" />
                  </ListItem>
                </List>
              </Box>
            </Box>
          </Box>
          
          <Box sx={{ 
            mt: 4, 
            pt: 3, 
            borderTop: `1px solid ${theme.palette.divider}`,
            display: 'flex',
            flexDirection: { xs: 'column', sm: 'row' },
            justifyContent: 'space-between',
            alignItems: 'center',
            gap: 2
          }}>
            <Typography variant="body2" color="text.secondary">
              © {new Date().getFullYear()} GreenLead. All rights reserved.
            </Typography>
            <Box>
              <Button size="small" color="inherit">Privacy</Button>
              <Button size="small" color="inherit">Terms</Button>
            </Box>
          </Box>
        </Container>
      </Box>
    </>
  );
} 