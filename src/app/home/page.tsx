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
  useMediaQuery,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Stack,
  Avatar,
  Divider,
  Chip,
  Paper
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import { useRouter } from "next/navigation";
import { 
  Check, 
  Schedule, 
  People, 
  Description, 
  CalendarMonth, 
  Settings,
  PlayArrow,
  AutoAwesome,
  Speed,
  Payment,
  TrendingUp,
  Star,
  ArrowForward,
  Security,
  Support,
  Devices,
  Analytics,
  IntegrationInstructions,
  VerifiedUser,
  LocalOffer
} from "@mui/icons-material";
import MarketingLayout from "@/components/MarketingLayout";

export default function HomePage() {
  const theme = useTheme();
  const router = useRouter();
  const isMobile = useMediaQuery(theme.breakpoints.down("sm"));
  
  const features = [
    {
      title: "Automated Follow-Ups",
      description: "Never forget to check in. Trigger texts, emails, and reminders effortlessly.",
      icon: <AutoAwesome sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Client Profiles & Job History",
      description: "Everything you need at your fingertips—from quotes to cleanups.",
      icon: <People sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Mobile-Friendly Dashboard",
      description: "Run your business from the truck, the shop, or the couch.",
      icon: <Speed sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Estimates & Invoices in One Click",
      description: "Win jobs and get paid faster, all from one place.",
      icon: <Payment sx={{ color: theme.palette.primary.main }} />,
    },
    {
      title: "Lead Tracking & Conversion Tools",
      description: "See where your clients come from and how to close more of them.",
      icon: <TrendingUp sx={{ color: theme.palette.primary.main }} />,
    },
  ];

  const testimonials = [
    {
      quote: "[Placeholder for customer testimonial]",
      author: "Example Customer",
      role: "Business Owner",
      avatar: "E",
      note: "Real testimonials coming soon"
    },
    {
      quote: "[Placeholder for customer testimonial]",
      author: "Example Customer",
      role: "Service Provider",
      avatar: "E",
      note: "Real testimonials coming soon"
    }
  ];

  const stats = [
    { value: "80%", label: "of users report higher customer retention" },
    { value: "2.5h", label: "saved per day on admin work" },
    { value: "5x", label: "average ROI in the first 90 days" }
  ];

  const benefits = [
    {
      title: "Automated Workflows",
      description: "Set up custom automation rules to handle repetitive tasks and follow-ups",
      icon: <AutoAwesome />
    },
    {
      title: "Mobile-First Design",
      description: "Access your business from anywhere with our responsive mobile app",
      icon: <Devices />
    },
    {
      title: "Advanced Analytics",
      description: "Make data-driven decisions with comprehensive business insights",
      icon: <Analytics />
    },
    {
      title: "Seamless Integrations",
      description: "Connect with your favorite tools and services",
      icon: <IntegrationInstructions />
    }
  ];

  const pricingPlans = [
    {
      name: "Starter",
      price: "$49",
      period: "per month",
      description: "Perfect for small service businesses",
      features: [
        "Up to 5 team members",
        "Basic automation",
        "Mobile app access",
        "Email support"
      ],
      cta: "Start Free Trial",
      popular: false
    },
    {
      name: "Professional",
      price: "$99",
      period: "per month",
      description: "Best for growing businesses",
      features: [
        "Up to 15 team members",
        "Advanced automation",
        "Priority support",
        "Custom integrations",
        "Analytics dashboard"
      ],
      cta: "Start Free Trial",
      popular: true
    },
    {
      name: "Enterprise",
      price: "Custom",
      period: "contact us",
      description: "For large service organizations",
      features: [
        "Unlimited team members",
        "Custom automation",
        "24/7 support",
        "API access",
        "Custom development"
      ],
      cta: "Contact Sales",
      popular: false
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 6, sm: 8, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={{ xs: 4, md: 6 }} alignItems="center">
            <Grid item xs={12} md={6}>
              <Typography 
                variant="h1" 
                component="h1" 
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', sm: '3rem', md: '3.5rem' },
                  color: theme.palette.text.primary,
                  lineHeight: 1.2
                }}
              >
                Grow Smarter. Serve Faster. Close More.
              </Typography>
              <Typography 
                variant="h5" 
                component="p" 
                sx={{ 
                  mb: 4,
                  color: theme.palette.text.secondary,
                  lineHeight: 1.6,
                  fontSize: { xs: '1.1rem', sm: '1.25rem' }
                }}
              >
                Your all-in-one CRM built for service-based businesses.
              </Typography>
              <Typography 
                variant="body1" 
                sx={{ 
                  mb: 4,
                  color: theme.palette.text.secondary,
                  maxWidth: '600px'
                }}
              >
                Automate your follow-ups, manage customers with ease, and grow your profits without extra staff or tech headaches.
              </Typography>
              <Stack 
                direction={{ xs: 'column', sm: 'row' }} 
                spacing={2}
                sx={{ mb: 4 }}
              >
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => router.push("/auth/register")}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  Start Free Trial
                </Button>
                <Button 
                  variant="outlined" 
                  color="primary" 
                  size="large"
                  startIcon={<PlayArrow />}
                  sx={{ 
                    py: 1.5, 
                    px: 4, 
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  Watch 90-Second Demo
                </Button>
              </Stack>
            </Grid>
            <Grid item xs={12} md={6}>
              <Box 
                sx={{ 
                  width: '100%', 
                  height: { xs: '300px', sm: '400px', md: '500px' },
                  backgroundColor: theme.palette.background.paper,
                  borderRadius: 4,
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  overflow: 'hidden',
                  boxShadow: `0 20px 40px ${theme.palette.primary.main}20`,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {/* Mockup Header */}
                <Box sx={{ 
                  p: 2, 
                  borderBottom: `1px solid ${theme.palette.divider}`,
                  display: 'flex',
                  alignItems: 'center',
                  gap: 2
                }}>
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.error.main 
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.warning.main 
                  }} />
                  <Box sx={{ 
                    width: 8, 
                    height: 8, 
                    borderRadius: '50%', 
                    backgroundColor: theme.palette.success.main 
                  }} />
                </Box>

                {/* Mockup Content */}
                <Box sx={{ 
                  p: 3, 
                  display: 'flex', 
                  flexDirection: 'column',
                  gap: 2,
                  flex: 1
                }}>
                  {/* Stats Row */}
                  <Grid container spacing={2}>
                    {[1, 2, 3].map((i) => (
                      <Grid item xs={4} key={i}>
                        <Box sx={{ 
                          p: 2, 
                          borderRadius: 2,
                          backgroundColor: theme.palette.primary.main + '10',
                          height: '80px'
                        }} />
                      </Grid>
                    ))}
                  </Grid>

                  {/* Chart Area */}
                  <Box sx={{ 
                    flex: 1,
                    borderRadius: 2,
                    backgroundColor: theme.palette.background.default,
                    p: 2,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    <Box sx={{ 
                      height: '60%',
                      display: 'flex',
                      alignItems: 'flex-end',
                      gap: 1,
                      px: 2
                    }}>
                      {[30, 45, 60, 40, 75, 50, 65].map((height, i) => (
                        <Box 
                          key={i}
                          sx={{ 
                            flex: 1,
                            height: `${height}%`,
                            backgroundColor: theme.palette.primary.main,
                            borderRadius: '4px 4px 0 0',
                            opacity: 0.8
                          }} 
                        />
                      ))}
                    </Box>
                    <Box sx={{ 
                      display: 'flex',
                      justifyContent: 'space-between',
                      px: 2,
                      color: theme.palette.text.secondary,
                      fontSize: '0.75rem'
                    }}>
                      <span>Mon</span>
                      <span>Tue</span>
                      <span>Wed</span>
                      <span>Thu</span>
                      <span>Fri</span>
                      <span>Sat</span>
                      <span>Sun</span>
                    </Box>
                  </Box>

                  {/* Recent Activity */}
                  <Box sx={{ 
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 1
                  }}>
                    {[1, 2, 3].map((i) => (
                      <Box 
                        key={i}
                        sx={{ 
                          height: '40px',
                          borderRadius: 1,
                          backgroundColor: theme.palette.background.default,
                          display: 'flex',
                          alignItems: 'center',
                          px: 2,
                          gap: 2
                        }}
                      >
                        <Box sx={{ 
                          width: 24, 
                          height: 24, 
                          borderRadius: '50%',
                          backgroundColor: theme.palette.primary.main + '20'
                        }} />
                        <Box sx={{ 
                          flex: 1,
                          height: 8,
                          borderRadius: 1,
                          backgroundColor: theme.palette.primary.main + '10'
                        }} />
                      </Box>
                    ))}
                  </Box>
                </Box>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Trust Badges Section */}
      <Box sx={{ 
        py: 4,
        borderTop: `1px solid ${theme.palette.divider}`,
        borderBottom: `1px solid ${theme.palette.divider}`
      }}>
        <Container maxWidth="lg">
          <Stack 
            direction={{ xs: 'column', sm: 'row' }}
            spacing={4}
            alignItems="center"
            justifyContent="space-around"
          >
            <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center' }}>
              Trusted by 10,000+ service businesses
            </Typography>
            <Stack 
              direction="row" 
              spacing={4}
              divider={<Divider orientation="vertical" flexItem />}
            >
              {['Security', 'Support', 'Uptime'].map((badge) => (
                <Box key={badge} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <VerifiedUser sx={{ color: theme.palette.primary.main }} />
                  <Typography variant="body2" color="text.secondary">
                    {badge}
                  </Typography>
                </Box>
              ))}
            </Stack>
          </Stack>
        </Container>
      </Box>
        
      {/* Features Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Built for the way you work
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Everything you need to run your service business efficiently
            </Typography>
          </Box>
          
          <Grid container spacing={{ xs: 3, md: 4 }}>
            {features.map((feature, index) => (
              <Grid item xs={12} sm={6} md={4} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${theme.palette.primary.main}15`
                    }
                  }}
                >
                  <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: theme.palette.primary.main
                    }}>
                      <Box sx={{ 
                        mr: 2,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: theme.palette.primary.main + '15'
                      }}>
                        {feature.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ 
                          fontWeight: 600,
                          fontSize: { xs: '1.1rem', sm: '1.25rem' }
                        }}
                      >
                        {feature.title}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {feature.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>

          <Box sx={{ textAlign: 'center', mt: 6 }}>
            <Button 
              variant="outlined" 
              color="primary" 
              size="large"
              onClick={() => router.push("/features")}
              sx={{ 
                py: 1.5, 
                px: 4, 
                fontWeight: 600,
                fontSize: '1.1rem'
              }}
            >
              Explore All Features
            </Button>
          </Box>
        </Container>
      </Box>

      {/* Benefits Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}08 100%)`
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Why Choose GreenLead?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Everything you need to scale your service business
            </Typography>
          </Box>
        
          <Grid container spacing={4}>
            {benefits.map((benefit, index) => (
              <Grid item xs={12} sm={6} md={3} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${theme.palette.primary.main}15`
                    }
                  }}
                >
                  <CardContent sx={{ p: 3 }}>
                    <Box sx={{ 
                      display: 'flex', 
                      alignItems: 'center', 
                      mb: 2,
                      color: theme.palette.primary.main
                    }}>
                      <Box sx={{ 
                        mr: 2,
                        p: 1,
                        borderRadius: 2,
                        backgroundColor: theme.palette.primary.main + '15'
                      }}>
                        {benefit.icon}
                      </Box>
                      <Typography 
                        variant="h6" 
                        component="h3" 
                        sx={{ fontWeight: 600 }}
                      >
                        {benefit.title}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ lineHeight: 1.6 }}
                    >
                      {benefit.description}
                    </Typography>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Testimonials Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: `linear-gradient(180deg, ${theme.palette.background.default} 0%, ${theme.palette.primary.main}08 100%)`
      }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              What Our Users Are Saying
            </Typography>
          </Box>

          <Grid container spacing={4}>
            {testimonials.map((testimonial, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    p: 4
                  }}
                >
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                    <Avatar 
                      sx={{ 
                        bgcolor: theme.palette.primary.main,
                        width: 56,
                        height: 56,
                        mr: 2
                      }}
                    >
                      {testimonial.avatar}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>
                        {testimonial.author}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {testimonial.role}
                      </Typography>
                    </Box>
                  </Box>
                  <Typography 
                    variant="body1" 
                    sx={{ 
                      fontSize: '1.1rem',
                      lineHeight: 1.6,
                      color: theme.palette.text.primary,
                      fontStyle: 'italic'
                    }}
                  >
                    "{testimonial.quote}"
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                    {testimonial.note}
                  </Typography>
                </Card>
              </Grid>
            ))}
          </Grid>

          {/* Stats Section */}
          <Box sx={{ mt: 8 }}>
            <Grid container spacing={4} justifyContent="center">
              {stats.map((stat, index) => (
                <Grid item xs={12} sm={4} key={index}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography 
                      variant="h3" 
                      sx={{ 
                        fontWeight: 700,
                        color: theme.palette.primary.main,
                        mb: 1
                      }}
                    >
                      {stat.value}
                    </Typography>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ fontSize: '1.1rem' }}
                    >
                      {stat.label}
                    </Typography>
                  </Box>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Container>
      </Box>

      {/* Pricing Section */}
      <Box sx={{ py: { xs: 8, md: 12 } }}>
        <Container maxWidth="lg">
          <Box sx={{ textAlign: 'center', mb: { xs: 6, md: 8 } }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 2,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                color: theme.palette.text.secondary,
                maxWidth: '800px',
                mx: 'auto'
              }}
            >
              Choose the plan that's right for your business
            </Typography>
          </Box>

          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    borderRadius: 4,
                    background: theme.palette.background.paper,
                    border: `1px solid ${theme.palette.divider}`,
                    position: 'relative',
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0 20px 40px ${theme.palette.primary.main}15`
                    }
                  }}
                >
                  {plan.popular && (
                    <Chip
                      label="Most Popular"
                      color="primary"
                      sx={{
                        position: 'absolute',
                        top: -12,
                        right: 24,
                        fontWeight: 600
                      }}
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography 
                      variant="h5" 
                      component="h3" 
                      sx={{ 
                        fontWeight: 700,
                        mb: 1
                      }}
                    >
                      {plan.name}
                    </Typography>
                    <Box sx={{ mb: 3 }}>
                      <Typography 
                        variant="h3" 
                        component="div" 
                        sx={{ 
                          fontWeight: 800,
                          color: theme.palette.primary.main
                        }}
                      >
                        {plan.price}
                      </Typography>
                      <Typography 
                        variant="body2" 
                        color="text.secondary"
                      >
                        {plan.period}
                      </Typography>
                    </Box>
                    <Typography 
                      variant="body1" 
                      color="text.secondary"
                      sx={{ mb: 3 }}
                    >
                      {plan.description}
                    </Typography>
                    <List sx={{ mb: 3 }}>
                      {plan.features.map((feature, i) => (
                        <ListItem key={i} sx={{ px: 0 }}>
                          <ListItemIcon sx={{ minWidth: 36 }}>
                            <Check sx={{ color: theme.palette.primary.main }} />
                          </ListItemIcon>
                          <ListItemText primary={feature} />
                        </ListItem>
                      ))}
                    </List>
                    <Button
                      variant={plan.popular ? "contained" : "outlined"}
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => router.push("/pricing")}
                      sx={{ 
                        py: 1.5,
                        fontWeight: 600
                      }}
                    >
                      {plan.cta}
                    </Button>
                  </CardContent>
                </Card>
              </Grid>
            ))}
          </Grid>
        </Container>
      </Box>

      {/* Final CTA Section */}
      <Box sx={{ 
        py: { xs: 8, md: 12 },
        background: theme.palette.primary.main,
        color: theme.palette.primary.contrastText
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center' }}>
            <Typography 
              variant="h2" 
              component="h2" 
              sx={{ 
                fontWeight: 700, 
                mb: 3,
                fontSize: { xs: '2rem', sm: '2.5rem', md: '3rem' }
              }}
            >
              Ready to grow without burnout?
            </Typography>
            <Typography 
              variant="h6" 
              sx={{ 
                mb: 4, 
                opacity: 0.9,
                maxWidth: '600px',
                mx: 'auto'
              }}
            >
              Start free and see why hundreds of service pros rely on GreenLead daily.
            </Typography>
            <Stack 
              direction={{ xs: 'column', sm: 'row' }} 
              spacing={2}
              justifyContent="center"
            >
              <Button 
                variant="contained" 
                color="secondary" 
                size="large"
                onClick={() => router.push("/auth/register")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600, 
                  fontSize: '1.1rem'
                }}
              >
                Start Free Trial
              </Button>
              <Button 
                variant="outlined" 
                color="inherit" 
                size="large"
                onClick={() => router.push("/contact")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600,
                  fontSize: '1.1rem',
                  borderColor: 'rgba(255,255,255,0.5)',
                  '&:hover': {
                    borderColor: 'white',
                    backgroundColor: 'rgba(255,255,255,0.1)'
                  }
                }}
              >
                Book a Demo
              </Button>
            </Stack>
          </Box>
        </Container>
      </Box>
    </MarketingLayout>
  );
} 