"use client";

import React, { useState } from 'react';
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
  Stack,
  Switch,
  FormControlLabel,
  Tooltip
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Check,
  InfoOutlined,
  HelpOutline,
  Star
} from '@mui/icons-material';
import MarketingLayout from '@/components/MarketingLayout';
import { useRouter } from 'next/navigation';

export default function PricingPage() {
  const theme = useTheme();
  const router = useRouter();
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('monthly');

  const toggleBillingCycle = () => {
    setBillingCycle(billingCycle === 'monthly' ? 'yearly' : 'monthly');
  };

  // Calculate savings percentage for annual billing
  const annualDiscount = 20; // 20% discount for annual billing

  // Pricing plans data
  const pricingPlans = [
    {
      title: "Starter",
      subtitle: "For small landscape businesses",
      monthlyPrice: 49,
      yearlyPrice: 39,
      features: [
        { name: "Up to 5 team members", included: true },
        { name: "Client management", included: true },
        { name: "Basic estimating tools", included: true },
        { name: "Simple job scheduling", included: true },
        { name: "Mobile app access", included: true },
        { name: "Email support", included: true },
        { name: "Basic reporting", included: true },
        { name: "Photo storage (250 MB)", included: true },
        { name: "Advanced automation", included: false },
        { name: "Route optimization", included: false },
        { name: "Custom branding", included: false },
        { name: "API access", included: false }
      ],
      popular: false,
      cta: "Start Free Trial"
    },
    {
      title: "Professional",
      subtitle: "For growing landscape companies",
      monthlyPrice: 99,
      yearlyPrice: 79,
      features: [
        { name: "Up to 15 team members", included: true },
        { name: "Client management", included: true },
        { name: "Advanced estimating tools", included: true },
        { name: "Interactive calendar", included: true },
        { name: "Mobile app access", included: true },
        { name: "Priority email support", included: true },
        { name: "Advanced reporting", included: true },
        { name: "Photo storage (1 GB)", included: true },
        { name: "Workflow automation", included: true },
        { name: "Route optimization", included: true },
        { name: "Custom branding", included: true },
        { name: "API access", included: false }
      ],
      popular: true,
      cta: "Start Free Trial"
    },
    {
      title: "Enterprise",
      subtitle: "For established landscape businesses",
      monthlyPrice: 199,
      yearlyPrice: 159,
      features: [
        { name: "Unlimited team members", included: true },
        { name: "Client management", included: true },
        { name: "Advanced estimating tools", included: true },
        { name: "Interactive calendar", included: true },
        { name: "Mobile app access", included: true },
        { name: "24/7 priority support", included: true },
        { name: "Custom reporting", included: true },
        { name: "Photo storage (5 GB)", included: true },
        { name: "Workflow automation", included: true },
        { name: "Route optimization", included: true },
        { name: "Custom branding", included: true },
        { name: "API access", included: true }
      ],
      popular: false,
      cta: "Start Free Trial"
    }
  ];

  // FAQs data
  const faqs = [
    {
      question: "Do you offer a free trial?",
      answer: "Yes, we offer a 14-day free trial on all plans. No credit card required to get started."
    },
    {
      question: "Can I change plans later?",
      answer: "Absolutely! You can upgrade or downgrade your plan at any time. If you upgrade, the new pricing will be prorated for the remainder of your billing cycle."
    },
    {
      question: "Is there a setup fee?",
      answer: "No, there are no setup fees on any of our plans. You only pay the advertised subscription price."
    },
    {
      question: "Do you offer any discounts?",
      answer: "We offer a 20% discount when you choose annual billing. We also offer special pricing for non-profits and educational institutions - please contact us for details."
    },
    {
      question: "What payment methods do you accept?",
      answer: "We accept all major credit cards (Visa, Mastercard, American Express, Discover) as well as ACH bank transfers for annual plans."
    },
    {
      question: "Can I cancel my subscription at any time?",
      answer: "Yes, you can cancel your subscription at any time. For monthly plans, your service will continue until the end of your current billing cycle. For annual plans, we do not offer prorated refunds for unused time."
    }
  ];

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 8 }}>
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
              Simple, Transparent Pricing
            </Typography>
            <Typography 
              variant="h5" 
              sx={{ 
                mb: 4,
                color: theme.palette.text.secondary,
                maxWidth: 700,
                mx: 'auto'
              }}
            >
              Choose the plan that's right for your landscaping business
            </Typography>
            
            {/* Billing Toggle */}
            <Box sx={{ display: 'flex', justifyContent: 'center', mb: 2 }}>
              <FormControlLabel
                control={
                  <Switch 
                    checked={billingCycle === 'yearly'} 
                    onChange={toggleBillingCycle} 
                    color="primary"
                  />
                }
                label={
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <Typography 
                      variant="body1" 
                      sx={{ mr: 1, fontWeight: billingCycle === 'yearly' ? 600 : 400 }}
                    >
                      Bill yearly (save {annualDiscount}%)
                    </Typography>
                  </Box>
                }
                labelPlacement="end"
              />
            </Box>
          </Box>

          {/* Pricing Cards */}
          <Grid container spacing={4} justifyContent="center">
            {pricingPlans.map((plan, index) => (
              <Grid item xs={12} md={4} key={index}>
                <Card 
                  elevation={0} 
                  sx={{ 
                    height: '100%',
                    position: 'relative',
                    border: `1px solid ${plan.popular ? theme.palette.primary.main : theme.palette.divider}`,
                    borderRadius: 4,
                    transition: 'all 0.3s ease',
                    '&:hover': {
                      transform: 'translateY(-8px)',
                      boxShadow: `0px 8px 40px ${theme.palette.primary.main}20`,
                    },
                    ...(plan.popular && {
                      boxShadow: `0px 8px 40px ${theme.palette.primary.main}30`,
                      borderWidth: 2,
                    })
                  }}
                >
                  {plan.popular && (
                    <Chip 
                      label="MOST POPULAR" 
                      color="primary" 
                      size="small"
                      sx={{ 
                        position: 'absolute', 
                        top: -12, 
                        left: '50%', 
                        transform: 'translateX(-50%)',
                        fontWeight: 600,
                        px: 1
                      }} 
                    />
                  )}
                  <CardContent sx={{ p: 4 }}>
                    <Typography variant="h5" component="h2" fontWeight={700} gutterBottom>
                      {plan.title}
                    </Typography>
                    <Typography variant="body2" color="text.secondary" sx={{ mb: 3, height: 40 }}>
                      {plan.subtitle}
                    </Typography>
                    
                    <Box sx={{ display: 'flex', alignItems: 'baseline', mb: 3 }}>
                      <Typography variant="h3" component="span" fontWeight={800} color="primary">
                        ${billingCycle === 'monthly' ? plan.monthlyPrice : plan.yearlyPrice}
                      </Typography>
                      <Typography variant="body1" component="span" sx={{ ml: 1 }}>
                        / month
                      </Typography>
                    </Box>
                    
                    {billingCycle === 'yearly' && (
                      <Box sx={{ mb: 3 }}>
                        <Chip 
                          label={`Save $${(plan.monthlyPrice - plan.yearlyPrice) * 12} per year`} 
                          size="small" 
                          color="success" 
                          sx={{ fontWeight: 500 }}
                        />
                      </Box>
                    )}
                    
                    <Button 
                      variant={plan.popular ? "contained" : "outlined"} 
                      color="primary"
                      fullWidth
                      size="large"
                      onClick={() => router.push("/auth/register")}
                      sx={{ 
                        py: 1.5, 
                        mb: 3, 
                        fontWeight: 600 
                      }}
                    >
                      {plan.cta}
                    </Button>
                    
                    <Divider sx={{ my: 3 }} />
                    
                    <Typography variant="subtitle2" fontWeight={600} gutterBottom>
                      Plan includes:
                    </Typography>
                    <List disablePadding>
                      {plan.features.map((feature, i) => (
                        <ListItem key={i} disablePadding sx={{ py: 1 }}>
                          <ListItemIcon sx={{ minWidth: 28 }}>
                            {feature.included ? (
                              <Check color="primary" fontSize="small" />
                            ) : (
                              <Check color="disabled" fontSize="small" />
                            )}
                          </ListItemIcon>
                          <ListItemText 
                            primary={feature.name} 
                            primaryTypographyProps={{ 
                              variant: 'body2',
                              color: feature.included ? 'textPrimary' : 'text.disabled'
                            }} 
                          />
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

      {/* Custom Plan Section */}
      <Box sx={{ py: { xs: 8, md: 10 } }}>
        <Container maxWidth="md">
          <Paper
            elevation={0}
            sx={{
              p: { xs: 4, md: 5 },
              borderRadius: 4,
              textAlign: 'center',
              backgroundColor: theme.palette.background.paper,
              border: `1px solid ${theme.palette.divider}`,
            }}
          >
            <Grid container spacing={4} alignItems="center">
              <Grid item xs={12} md={7} sx={{ textAlign: { xs: 'center', md: 'left' } }}>
                <Typography variant="h4" component="h2" fontWeight={700} gutterBottom>
                  Need a custom solution?
                </Typography>
                <Typography variant="body1" color="text.secondary" paragraph>
                  If your landscaping business has specific needs or you're looking for custom integrations, our team can help create a tailored solution just for you.
                </Typography>
                <List disablePadding>
                  {[
                    "White-label customization",
                    "Custom integrations with your existing tools",
                    "Dedicated account manager",
                    "Personalized onboarding and training",
                    "Custom feature development"
                  ].map((item, i) => (
                    <ListItem key={i} disablePadding sx={{ py: 0.75 }}>
                      <ListItemIcon sx={{ minWidth: 28 }}>
                        <Check color="primary" fontSize="small" />
                      </ListItemIcon>
                      <ListItemText primary={item} primaryTypographyProps={{ variant: 'body2' }} />
                    </ListItem>
                  ))}
                </List>
              </Grid>
              <Grid item xs={12} md={5}>
                <Button 
                  variant="contained" 
                  color="primary" 
                  size="large"
                  onClick={() => router.push("/contact")}
                  sx={{ 
                    py: 1.75, 
                    px: 4, 
                    fontWeight: 600,
                    fontSize: '1.1rem'
                  }}
                >
                  Contact Sales
                </Button>
                <Typography variant="body2" color="text.secondary" sx={{ mt: 2 }}>
                  Our team will respond within 24 hours
                </Typography>
              </Grid>
            </Grid>
          </Paper>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 8, md: 10 }, backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="md">
          <Box sx={{ textAlign: 'center', mb: 6 }}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary">
              Everything you need to know about our pricing and policies
            </Typography>
          </Box>
          
          <Grid container spacing={3}>
            {faqs.map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box sx={{ mb: 3 }}>
                  <Typography variant="h6" fontWeight={600} gutterBottom>
                    {faq.question}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {faq.answer}
                  </Typography>
                </Box>
              </Grid>
            ))}
          </Grid>
          
          <Box sx={{ mt: 6, p: 3, backgroundColor: theme.palette.primary.main + '10', borderRadius: 2, textAlign: 'center' }}>
            <Typography variant="body2" fontWeight={500}>
              Have more questions? <Button color="primary" onClick={() => router.push("/contact")}>Contact our sales team</Button>
            </Typography>
          </Box>
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
              Start growing your landscape business today
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
                onClick={() => router.push("/features")}
                sx={{ 
                  py: 1.5, 
                  px: 4, 
                  fontWeight: 600
                }}
              >
                Explore Features
              </Button>
            </Stack>
          </Paper>
        </Container>
      </Box>
    </MarketingLayout>
  );
} 