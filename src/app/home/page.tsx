"use client";

import { useState } from "react";
import { 
  Box, 
  Button, 
  Container, 
  Typography, 
  Grid, 
  Card, 
  CardContent, 
  CardMedia,
  AppBar,
  Toolbar,
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { Check, Schedule, People, Description, CalendarMonth, Settings } from "@mui/icons-material";

export default function HomePage() {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const features = [
    {
      title: "Job Management",
      description: "Track and manage all your landscaping jobs in one place",
      icon: <Check sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Client Database",
      description: "Store client information and manage relationships",
      icon: <People sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Estimate Creation",
      description: "Create professional estimates with custom templates",
      icon: <Description sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Employee Scheduling",
      description: "Schedule and assign jobs to your team members",
      icon: <CalendarMonth sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Company Branding",
      description: "Customize with your logo, colors and brand identity",
      icon: <Settings sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Real-time Scheduling",
      description: "View and manage your business calendar in real-time",
      icon: <Schedule sx={{ color: theme.palette.primary.main }} />,
    },
  ];

  return (
    <>
      <AppBar position="static" color="transparent" elevation={0}>
        <Toolbar sx={{ flexWrap: 'wrap' }}>
          <Typography 
            variant="h6" 
            component="div" 
            sx={{ 
              flexGrow: 1, 
              fontWeight: 700, 
              color: theme.palette.primary.main,
              fontSize: { xs: '1.25rem', sm: '1.5rem' }
            }}
          >
            GreenLead
          </Typography>
          <Box sx={{ display: 'flex', gap: { xs: 1, sm: 2 } }}>
            <Button 
              color="primary" 
              onClick={() => router.push("/login")}
              size={isMobile ? "small" : "medium"}
            >
              Login
            </Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={() => router.push("/auth/register")}
              size={isMobile ? "small" : "medium"}
            >
              Sign Up
            </Button>
          </Box>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ 
        background: theme.palette.background.default,
        minHeight: "calc(100vh - 64px)",
        py: { xs: 4, sm: 6, md: 8 }
      }}>
        <Container maxWidth="lg" sx={{ px: { xs: 2, sm: 3, md: 4 } }}>
          {/* Hero Section */}
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center" sx={{ mb: { xs: 5, sm: 6, md: 8 } }}>
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h2" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2rem', sm: '2.5rem', md: '3.5rem' },
                  color: theme.palette.text.primary,
                  lineHeight: { xs: 1.2, md: 1.3 }
                }}
              >
                Landscaping Business Management Made Simple
              </Typography>
              <Typography 
                variant="h6" 
                component="p" 
                sx={{ 
                  mb: 4,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                  fontSize: { xs: '1rem', sm: '1.25rem' }
                }}
              >
                GreenLead is the complete solution for lawn care and landscaping businesses to manage clients, jobs, estimates, and schedules all in one place.
              </Typography>
              <Box sx={{ display: 'flex', gap: 2, flexWrap: "wrap" }}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => router.push("/auth/register")}
                  sx={{ 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 3, sm: 4 }, 
                    fontWeight: 600,
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Get Started
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  onClick={() => router.push("/login")}
                  sx={{ 
                    py: { xs: 1, sm: 1.5 }, 
                    px: { xs: 3, sm: 4 }, 
                    fontWeight: 600,
                    width: { xs: '100%', sm: 'auto' }
                  }}
                >
                  Login
                </Button>
              </Box>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: { xs: '250px', sm: '300px', md: '400px' },
                  backgroundColor: theme.palette.primary.main + '33',
                  borderRadius: { xs: 3, md: 4 },
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  color: theme.palette.primary.main,
                  fontSize: { xs: '1.25rem', md: '1.5rem' },
                  fontWeight: 500,
                  mt: { xs: 2, md: 0 }
                }}
              >
                Dashboard Preview
              </Box>
            </Grid>
          </Grid>
          
          {/* Features Section */}
          <Box sx={{ mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: { xs: 4, md: 6 }, 
                textAlign: "center",
                color: theme.palette.text.primary,
                fontSize: { xs: '1.75rem', sm: '2rem', md: '2.25rem' }
              }}
            >
              Features Designed for Landscaping Businesses
            </Typography>
            
            <Grid container spacing={{ xs: 2, sm: 3, md: 4 }}>
              {features.map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Card 
                    elevation={0} 
                    sx={{ 
                      height: '100%',
                      borderRadius: 3,
                      background: theme.palette.background.paper,
                      border: `1px solid ${theme.palette.divider}`,
                      transition: 'transform 0.3s, box-shadow 0.3s',
                      '&:hover': {
                        transform: 'translateY(-5px)',
                        boxShadow: '0px 8px 24px rgba(0, 0, 0, 0.1)'
                      }
                    }}
                  >
                    <CardContent sx={{ p: { xs: 2, sm: 3 } }}>
                      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                        <Box sx={{ mr: 1.5 }}>
                          {feature.icon}
                        </Box>
                        <Typography variant="h6" component="h3" sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1rem', sm: '1.1rem', md: '1.25rem' }
                        }}>
                          {feature.title}
                        </Typography>
                      </Box>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </CardContent>
                  </Card>
                </Grid>
              ))}
            </Grid>
          </Box>
          
          {/* CTA Section */}
          <Box 
            sx={{ 
              py: { xs: 4, sm: 5, md: 6 }, 
              px: { xs: 2, sm: 3, md: 4 }, 
              borderRadius: { xs: 3, md: 4 }, 
              textAlign: 'center',
              background: theme.palette.primary.main,
              color: theme.palette.primary.contrastText
            }}
          >
            <Typography 
              variant="h4" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.5rem', sm: '1.75rem', md: '2rem' }
              }}
            >
              Ready to streamline your landscaping business?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                maxWidth: '700px', 
                mx: 'auto',
                fontSize: { xs: '0.9rem', sm: '1rem' }
              }}
            >
              Join landscaping businesses that have improved their operations with GreenLead.
            </Typography>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push("/auth/register")}
              sx={{ 
                py: { xs: 1, sm: 1.5 }, 
                px: { xs: 3, sm: 4 }, 
                fontWeight: 600, 
                backgroundColor: 'white',
                color: theme.palette.primary.main,
                '&:hover': {
                  backgroundColor: 'rgba(255,255,255,0.9)'
                },
                width: { xs: '100%', sm: 'auto' }
              }}
            >
              Start Free Trial
            </Button>
          </Box>
        </Container>
      </Box>
      
      {/* Footer */}
      <Box sx={{ p: { xs: 3, md: 4 }, textAlign: 'center', borderTop: `1px solid ${theme.palette.divider}` }}>
        <Typography variant="body2" color="text.secondary">
          © {new Date().getFullYear()} GreenLead. All rights reserved.
        </Typography>
      </Box>
    </>
  );
} 