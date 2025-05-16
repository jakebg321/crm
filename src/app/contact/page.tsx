"use client";

import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Container, 
  Grid, 
  TextField,
  Button,
  MenuItem,
  Paper,
  Divider,
  Alert,
  FormControl,
  FormLabel,
  RadioGroup,
  FormControlLabel,
  Radio,
  Checkbox,
  CircularProgress
} from '@mui/material';
import { useTheme } from '@mui/material/styles';
import {
  Email,
  Phone,
  LocationOn,
  Send,
  Check
} from '@mui/icons-material';
import MarketingLayout from '@/components/MarketingLayout';

export default function ContactPage() {
  const theme = useTheme();
  
  // Form state
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    phone: '',
    company: '',
    employees: '',
    message: '',
    interest: 'general',
    subscribe: false
  });
  
  const [errors, setErrors] = useState<{[key: string]: string}>({});
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  
  const companySize = [
    { value: '1-5', label: '1-5 employees' },
    { value: '6-15', label: '6-15 employees' },
    { value: '16-50', label: '16-50 employees' },
    { value: '51+', label: '51+ employees' }
  ];
  
  const interestOptions = [
    { value: 'general', label: 'General information' },
    { value: 'demo', label: 'Request a demo' },
    { value: 'pricing', label: 'Custom pricing' },
    { value: 'support', label: 'Support' },
    { value: 'partnership', label: 'Partnership opportunity' }
  ];

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    // Clear error when field is edited
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };
  
  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData({
      ...formData,
      [name]: checked
    });
  };

  const validateForm = () => {
    const newErrors: {[key: string]: string} = {};
    
    if (!formData.firstName) newErrors.firstName = 'First name is required';
    if (!formData.lastName) newErrors.lastName = 'Last name is required';
    
    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }
    
    if (!formData.message) newErrors.message = 'Message is required';
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      setSubmitting(true);
      
      // Simulate API call
      setTimeout(() => {
        setSubmitting(false);
        setSubmitted(true);
        
        // Reset form after successful submission
        setFormData({
          firstName: '',
          lastName: '',
          email: '',
          phone: '',
          company: '',
          employees: '',
          message: '',
          interest: 'general',
          subscribe: false
        });
      }, 1500);
    }
  };

  return (
    <MarketingLayout>
      {/* Hero Section */}
      <Box sx={{ 
        py: { xs: 6, md: 10 },
        background: `linear-gradient(180deg, ${theme.palette.primary.main}15 0%, ${theme.palette.background.default} 100%)`
      }}>
        <Container maxWidth="lg">
          <Grid container spacing={4} justifyContent="center">
            <Grid item xs={12} md={10} lg={8}>
              <Typography 
                variant="h1" 
                component="h1" 
                align="center"
                sx={{ 
                  fontWeight: 800,
                  mb: 2,
                  fontSize: { xs: '2.5rem', sm: '3.5rem' },
                  color: theme.palette.text.primary,
                  lineHeight: 1.2
                }}
              >
                Get in Touch
              </Typography>
              <Typography 
                variant="h5" 
                align="center"
                sx={{ 
                  mb: 6,
                  color: theme.palette.text.secondary,
                  maxWidth: 700,
                  mx: 'auto'
                }}
              >
                We'd love to hear from you. Contact our team for any questions about our product.
              </Typography>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* Contact Form & Info Section */}
      <Box sx={{ py: { xs: 6, md: 10 } }}>
        <Container maxWidth="lg">
          <Grid container spacing={6}>
            {/* Contact Form */}
            <Grid item xs={12} md={8}>
              <Paper 
                elevation={0} 
                sx={{ 
                  p: { xs: 3, md: 5 }, 
                  borderRadius: 4,
                  border: `1px solid ${theme.palette.divider}`
                }}
              >
                {submitted ? (
                  <Box sx={{ textAlign: 'center', py: 4 }}>
                    <Check sx={{ fontSize: 60, color: theme.palette.success.main, mb: 2 }} />
                    <Typography variant="h4" gutterBottom fontWeight={700}>
                      Thank You!
                    </Typography>
                    <Typography variant="body1" paragraph>
                      Your message has been sent. Our team will get back to you soon.
                    </Typography>
                    <Button 
                      variant="outlined" 
                      color="primary"
                      onClick={() => setSubmitted(false)}
                      sx={{ mt: 2 }}
                    >
                      Send Another Message
                    </Button>
                  </Box>
                ) : (
                  <>
                    <Typography variant="h4" component="h2" gutterBottom fontWeight={700}>
                      Contact Us
                    </Typography>
                    <Typography variant="body1" sx={{ mb: 4, color: theme.palette.text.secondary }}>
                      Fill out the form below and we'll get back to you as soon as possible.
                    </Typography>
                    
                    <form onSubmit={handleSubmit}>
                      <Grid container spacing={3}>
                        {/* First Name */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="First Name"
                            name="firstName"
                            value={formData.firstName}
                            onChange={handleChange}
                            error={!!errors.firstName}
                            helperText={errors.firstName}
                            required
                          />
                        </Grid>
                        
                        {/* Last Name */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Last Name"
                            name="lastName"
                            value={formData.lastName}
                            onChange={handleChange}
                            error={!!errors.lastName}
                            helperText={errors.lastName}
                            required
                          />
                        </Grid>
                        
                        {/* Email */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Email"
                            name="email"
                            type="email"
                            value={formData.email}
                            onChange={handleChange}
                            error={!!errors.email}
                            helperText={errors.email}
                            required
                          />
                        </Grid>
                        
                        {/* Phone */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Phone Number (optional)"
                            name="phone"
                            value={formData.phone}
                            onChange={handleChange}
                          />
                        </Grid>
                        
                        {/* Company */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            fullWidth
                            label="Company Name (optional)"
                            name="company"
                            value={formData.company}
                            onChange={handleChange}
                          />
                        </Grid>
                        
                        {/* Company Size */}
                        <Grid item xs={12} sm={6}>
                          <TextField
                            select
                            fullWidth
                            label="Company Size (optional)"
                            name="employees"
                            value={formData.employees}
                            onChange={handleChange}
                          >
                            <MenuItem value="">Select...</MenuItem>
                            {companySize.map((option) => (
                              <MenuItem key={option.value} value={option.value}>
                                {option.label}
                              </MenuItem>
                            ))}
                          </TextField>
                        </Grid>
                        
                        {/* Interest */}
                        <Grid item xs={12}>
                          <FormControl component="fieldset">
                            <FormLabel component="legend">I'm interested in:</FormLabel>
                            <RadioGroup
                              name="interest"
                              value={formData.interest}
                              onChange={handleChange}
                              row
                            >
                              {interestOptions.map((option) => (
                                <FormControlLabel
                                  key={option.value}
                                  value={option.value}
                                  control={<Radio />}
                                  label={option.label}
                                />
                              ))}
                            </RadioGroup>
                          </FormControl>
                        </Grid>
                        
                        {/* Message */}
                        <Grid item xs={12}>
                          <TextField
                            fullWidth
                            label="Message"
                            name="message"
                            multiline
                            rows={4}
                            value={formData.message}
                            onChange={handleChange}
                            error={!!errors.message}
                            helperText={errors.message}
                            required
                          />
                        </Grid>
                        
                        {/* Checkbox */}
                        <Grid item xs={12}>
                          <FormControlLabel
                            control={
                              <Checkbox 
                                name="subscribe" 
                                checked={formData.subscribe}
                                onChange={handleCheckboxChange}
                                color="primary"
                              />
                            }
                            label="Subscribe to our newsletter for landscaping tips and product updates"
                          />
                        </Grid>
                        
                        {/* Submit Button */}
                        <Grid item xs={12}>
                          <Button
                            type="submit"
                            variant="contained"
                            color="primary"
                            size="large"
                            startIcon={submitting ? <CircularProgress size={20} color="inherit" /> : <Send />}
                            disabled={submitting}
                            sx={{ 
                              py: 1.5, 
                              px: 4, 
                              fontWeight: 600,
                              fontSize: '1rem'
                            }}
                          >
                            {submitting ? 'Sending...' : 'Send Message'}
                          </Button>
                        </Grid>
                      </Grid>
                    </form>
                  </>
                )}
              </Paper>
            </Grid>
            
            {/* Contact Info */}
            <Grid item xs={12} md={4}>
              <Box sx={{ height: '100%' }}>
                <Paper 
                  elevation={0} 
                  sx={{ 
                    p: { xs: 3, md: 4 }, 
                    borderRadius: 4,
                    height: '100%',
                    border: `1px solid ${theme.palette.divider}`,
                    background: `linear-gradient(180deg, ${theme.palette.background.paper} 0%, ${theme.palette.background.default} 100%)`
                  }}
                >
                  <Typography variant="h5" component="h3" gutterBottom fontWeight={700}>
                    Contact Information
                  </Typography>
                  <Typography variant="body2" sx={{ mb: 4, color: theme.palette.text.secondary }}>
                    Reach out to us directly using any of the methods below.
                  </Typography>
                  
                  <Box sx={{ mb: 4 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Email sx={{ color: theme.palette.primary.main, mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Email
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          support@greenlead.com
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                      <Phone sx={{ color: theme.palette.primary.main, mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Phone
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          (555) 123-4567
                        </Typography>
                      </Box>
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <LocationOn sx={{ color: theme.palette.primary.main, mr: 2 }} />
                      <Box>
                        <Typography variant="subtitle2" fontWeight={600}>
                          Office
                        </Typography>
                        <Typography variant="body2" color="text.secondary">
                          123 Green Street<br />
                          Suite 200<br />
                          Austin, TX 78701
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 3 }} />
                  
                  <Typography variant="h6" gutterBottom fontWeight={600}>
                    Business Hours
                  </Typography>
                  <Box sx={{ mb: 1 }}>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Monday - Friday
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      9:00 AM - 6:00 PM EST
                    </Typography>
                  </Box>
                  <Box>
                    <Typography variant="subtitle2" fontWeight={600}>
                      Saturday - Sunday
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Closed
                    </Typography>
                  </Box>
                </Paper>
              </Box>
            </Grid>
          </Grid>
        </Container>
      </Box>

      {/* FAQ Section */}
      <Box sx={{ py: { xs: 6, md: 10 }, backgroundColor: theme.palette.background.paper }}>
        <Container maxWidth="lg">
          <Box sx={{ mb: 6, textAlign: 'center' }}>
            <Typography variant="h3" component="h2" fontWeight={700} gutterBottom>
              Frequently Asked Questions
            </Typography>
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 700, mx: 'auto' }}>
              Find quick answers to common questions about GreenLead
            </Typography>
          </Box>
          
          <Grid container spacing={4}>
            {[
              {
                question: "How long does it take to implement GreenLead?",
                answer: "Most users are up and running with GreenLead in just a few hours. Our user-friendly interface and onboarding process make it easy to get started, and our support team is always available to help if needed."
              },
              {
                question: "Do you offer onboarding assistance?",
                answer: "Yes, all plans include basic onboarding assistance. Our Professional and Enterprise plans include personalized onboarding sessions with a dedicated implementation specialist."
              },
              {
                question: "Can I import my existing client data?",
                answer: "Absolutely! GreenLead makes it easy to import your existing client data from spreadsheets or other CRM systems. We provide import templates and guides to help you through the process."
              },
              {
                question: "Is there a mobile app?",
                answer: "Yes, GreenLead offers a fully-featured mobile app for both iOS and Android devices, allowing you to manage your landscape business from anywhere."
              }
            ].map((faq, index) => (
              <Grid item xs={12} md={6} key={index}>
                <Box>
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
        </Container>
      </Box>
    </MarketingLayout>
  );
} 