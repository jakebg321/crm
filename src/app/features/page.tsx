"use client";

import React from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  Card, 
  CardContent,
  Button,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Divider,
  Paper,
  Chip,
  Stack
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Schedule,
  People,
  Description,
  CalendarMonth,
  Settings,
  AutoAwesome,
  Speed,
  Payment,
  TrendingUp,
  Analytics,
  Notifications,
  Storage,
  Security,
  Support,
  Devices,
  Check,
  ViewTimeline,
  Phone
} from '@mui/icons-material';
import MarketingLayout from '@/components/MarketingLayout';
import { useRouter } from 'next/navigation';

export default function FeaturesPage() {
  const theme = useTheme();
  const router = useRouter();

  // Main feature categories
  const featureCategories = [
    {
      title: "Client Management",
      description: "Build stronger relationships with comprehensive client tracking and management tools.",
      icon: <People fontSize="large" color="primary" />,
      features: [
        "Detailed client profiles with contact information, job history, and preferences",
        "Automated follow-up reminders based on client activity",
        "Custom tags and categorization for efficient client segmentation",
        "Document storage for contracts, attachments, and important files",
        "Communication history tracking for all client interactions"
      ]
    },
    {
      title: "Estimating & Invoicing",
      description: "Create professional estimates and invoices in minutes, not hours.",
      icon: <Description fontSize="large" color="primary" />,
      features: [
        "Customizable estimate and invoice templates",
        "Digital signature capture for client approval",
        "Automatic conversion from estimate to job",
        "Line item catalogs with saved services and products",
        "Markup and profit margin calculations"
      ]
    },
    {
      title: "Scheduling & Dispatch",
      description: "Optimize your team's time with powerful scheduling and routing tools.",
      icon: <CalendarMonth fontSize="large" color="primary" />,
      features: [
        "Drag-and-drop visual calendar interface",
        "Team member assignment and availability tracking",
        "Route optimization for multiple job sites",
        "Automated scheduling based on service frequency",
        "Real-time updates and notifications for schedule changes"
      ]
    },
    {
      title: "Mobile App Access",
      description: "Run your business from anywhere with full-featured mobile capabilities.",
      icon: <Phone fontSize="large" color="primary" />,
      features: [
        "Native mobile app for iOS and Android",
        "Offline mode for areas with poor connectivity",
        "Photo capture and annotation in the field",
        "GPS tracking and navigation to job sites",
        "Mobile time tracking and job completion reporting"
      ]
    },
    {
      title: "Business Intelligence",
      description: "Make data-driven decisions with comprehensive reporting and analytics.",
      icon: <Analytics fontSize="large" color="primary" />,
      features: [
        "Real-time dashboard with key performance indicators",
        "Revenue and profit tracking by service, client, and team",
        "Lead source analysis and conversion reporting",
        "Custom report builder for specific business needs",
        "Data export for accounting and tax preparation"
      ]
    },
    {
      title: "Automation & Workflows",
      description: "Save time and reduce errors with intelligent automation.",
      icon: <AutoAwesome fontSize="large" color="primary" />,
      features: [
        "Automated follow-up sequences for new leads",
        "Custom workflow triggers based on job status changes",
        "Recurring job and maintenance contract setup",
        "Automatic invoice generation and payment reminders",
        "Weather-based scheduling adjustments"
      ]
    }
  ];

  // Hero section features
  const highlightFeatures = [
    { 
      title: "Customer Communication", 
      description: "Automatic follow-ups, appointment reminders, and customer updates", 
      icon: <Notifications sx={{ fontSize: 40, color: theme.palette.primary.main }} /> 
    },
    { 
      title: "Team Efficiency", 
      description: "Smart scheduling, route planning, and mobile updates for your crew", 
      icon: <Speed sx={{ fontSize: 40, color: theme.palette.primary.main }} /> 
    },
    { 
      title: "Business Growth", 
      description: "Lead tracking, conversion tools, and performance analytics", 
      icon: <TrendingUp sx={{ fontSize: 40, color: theme.palette.primary.main }} /> 
    }
  ];

  // Complete list of benefits for the comparison table
  const allBenefits = [
    "Client Profile Management",
    "Automated Follow-ups",
    "Estimate Creation",
    "Digital Signatures",
    "Invoicing & Payments",
    "Scheduling Calendar",
    "Route Optimization",
    "Mobile App Access",
    "Photo Documentation",
    "Customer Portal",
    "Team Management",
    "Performance Analytics",
    "Service History Tracking",
    "Email & SMS Integration",
    "Document Storage"
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} alignItems="center">
            <Grid item xs={12} md={7}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  color: theme.palette.text.primary,
                  lineHeight: 1.2
                }}
              >
                Features Built for<br />
                Landscape Professionals
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: theme.palette.text.secondary,
                  fontSize: { xs: '1rem', md: '1.125rem' },
                  maxWidth: 600
                }}
              >
                GreenLead CRM delivers the tools you need to grow your landscaping business, 
                designed specifically for the unique challenges of service-based field operations.
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => router.push("/auth/register")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  mr: 2,
                  mb: { xs: 2, sm: 0 }
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => router.push("/pricing")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600,
                  fontSize: '1.1rem'
                }}
              >
                View Pricing
              </Button>
            </Grid>
            <Grid item xs={12} md={5}>
              <Grid container spacing={3}>
                {highlightFeatures.map((feature, index) => (
                  <Grid item xs={12} key={index}>
                    <Paper 
                      elevation={1}
                      sx={{ 
                        p: 3, 
                        borderRadius: 3, 
                        display: 'flex',
                        alignItems: 'center',
                        gap: 3,
                        transition: 'transform 0.2s',
                        '&:hover': {
                          transform: 'translateY(-5px)',
                          boxShadow: `0px 8px 24px ${theme.palette.primary.main}20`
                        }
                      }}
                    >
                      {feature.icon}
                      <Box>
                        <Typography variant="h6" fontWeight={600} gutterBottom>
                          {feature.title}
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          {feature.description}
                        </Typography>
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Main Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 8, textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              Everything You Need to Succeed
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              One platform to manage clients, create estimates, schedule jobs, and grow your landscape business
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {featureCategories.map((category, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    p: 1,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      boxShadow: `0px 8px 24px ${theme.palette.primary.main}15`,
                      borderColor: theme.palette.primary.main + '40'
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3, gap: 2 }}>
                      {category.icon}
                      <Typography variant="h5" component="h3" fontWeight={700}>
                        {category.title}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      color="text.secondary" 
                      sx={{ mb: 3 }}
                    >
                      {category.description}
                    </Typography>
                    <Divider sx={{ mb: 3 }} />
                    <List disablePadding>
                      {category.features.map((feature, i) => (
                        <ListItem key={i} disablePadding sx={{ mb: 1.5 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check color="primary" />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Comparison Section */}
      <Box 
        sx={{ 
          py: { xs: 8, md: 12 }, 
          background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.background.paper} 100%)`
        }}
      >
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
            <Chip 
              label="COMPARISON" 
              color="primary" 
              size="small" 
              sx={{ mb: 2, fontWeight: 600 }} 
            />
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem' }
              }}
            >
              Why Choose GreenLead?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              See how GreenLead compares to traditional methods and generic CRM solutions
            </Typography>
          </Box>

          <Paper
            elevation={0}
            sx={{
              borderRadius: 4,
              overflow: 'hidden',
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            {/* Table Header */}
            <Grid container>
              <Grid item xs={4} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="h6" fontWeight={600}>
                  Features
                </Typography>
              </Grid>
              <Grid item xs={2.6666} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
                <Typography variant="h6" fontWeight={600}>
                  Traditional Methods
                </Typography>
              </Grid>
              <Grid item xs={2.6666} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}`, backgroundColor: theme.palette.background.default }}>
                <Typography variant="h6" fontWeight={600}>
                  Generic CRM
                </Typography>
              </Grid>
              <Grid item xs={2.6666} sx={{ p: 3, backgroundColor: theme.palette.primary.main + '15' }}>
                <Typography variant="h6" fontWeight={700} color="primary">
                  GreenLead
                </Typography>
              </Grid>
            </Grid>

            {/* Table Rows */}
            {allBenefits.map((benefit, index) => (
              <Grid container key={index} sx={{ 
                borderTop: `1px solid ${theme.palette.divider}`,
                '&:hover': { backgroundColor: theme.palette.action.hover }
              }}>
                <Grid item xs={4} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}` }}>
                  <Typography variant="body2">
                    {benefit}
                  </Typography>
                </Grid>
                <Grid item xs={2.6666} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                  {index < 3 || index === 7 ? (
                    <Check sx={{ color: theme.palette.warning.light, opacity: 0.5 }} />
                  ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                  )}
                </Grid>
                <Grid item xs={2.6666} sx={{ p: 3, borderRight: `1px solid ${theme.palette.divider}`, textAlign: 'center' }}>
                  {index < 8 || index === 10 || index === 11 ? (
                    <Check color="primary" sx={{ opacity: 0.6 }} />
                  ) : (
                    <Typography variant="body2" color="text.disabled">—</Typography>
                  )}
                </Grid>
                <Grid item xs={2.6666} sx={{ p: 3, textAlign: 'center', backgroundColor: index % 2 === 0 ? theme.palette.primary.main + '05' : 'transparent' }}>
                  <Check color="primary" />
                </Grid>
              </Grid>
            ))}
          </Paper>
        </Container>
      </Box>

      {/* Call to Action */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 6 },
              borderRadius: 4,
              textAlign: 'center',
              backgroundColor: theme.palette.primary.main + '08',
              border: `1px solid ${theme.palette.primary.main}20`,
            }}
          >
            <Typography 
              variant="h3" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '1.75rem', sm: '2.25rem' }
              }}
            >
              Ready to transform your<br />landscaping business?
            </Typography>
            <Typography 
              variant="body1" 
              sx={{ 
                mb: 4, 
                maxWidth: 600, 
                mx: 'auto',
                color: theme.palette.text.secondary
              }}
            >
              Join thousands of landscape professionals who are saving time, closing more deals, and growing their business with GreenLead.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }}
              spacing={2}
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                color="primary" 
                size="large"
                onClick={() => router.push("/auth/register")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600
                }}
              >
                Start Your 14-Day Free Trial
              </Button>
              <Button 
                variant="outlined" 
                color="primary" 
                size="large"
                onClick={() => router.push("/contact")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600
                }}
              >
                Schedule a Demo
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </MarketingLayout>
  );
} 