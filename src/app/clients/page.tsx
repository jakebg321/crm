'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
  TextField,
  InputAdornment,
  Chip,
  Divider,
} from '@mui/material';
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
  ArrowForward as ArrowForwardIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const MotionCard = motion(Card);
const MotionBox = motion(Box);

const clients = [
  {
    id: 1,
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '(555) 123-4567',
    address: '4350 Harden Park, Seattle, WA',
    activeJobs: 2,
    totalJobs: 8,
    type: 'Residential',
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '(555) 234-5678',
    address: '4029 Anderson Ave, Seattle, WA',
    activeJobs: 1,
    totalJobs: 5,
    type: 'Commercial',
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    phone: '(555) 345-6789',
    address: '4235 Westbrook land, Seattle, WA',
    activeJobs: 0,
    totalJobs: 3,
    type: 'Residential',
  },
  {
    id: 4,
    name: 'Emily Davis',
    email: 'emily.d@email.com',
    phone: '(555) 456-7890',
    address: '1820 Lakeside Drive, Seattle, WA',
    activeJobs: 1,
    totalJobs: 4,
    type: 'Residential',
  },
  {
    id: 5,
    name: 'Robert Wilson',
    email: 'rob.wilson@email.com',
    phone: '(555) 567-8901',
    address: '3294 Pine Avenue, Seattle, WA',
    activeJobs: 3,
    totalJobs: 7,
    type: 'Commercial',
  },
  {
    id: 6,
    name: 'Jennifer Thomas',
    email: 'jen.t@email.com',
    phone: '(555) 678-9012',
    address: '4572 Maple Street, Seattle, WA',
    activeJobs: 0,
    totalJobs: 2,
    type: 'Residential',
  },
];

const clientStats = {
  total: clients.length,
  active: clients.filter(client => client.activeJobs > 0).length,
  residential: clients.filter(client => client.type === 'Residential').length,
  commercial: clients.filter(client => client.type === 'Commercial').length,
};

export default function Clients() {
  const theme = useTheme();

  return (
    <Layout>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary
            }}
          >
            Clients
          </Typography>
          <Button 
            variant="contained" 
            startIcon={<AddIcon />}
            sx={{
              boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0px 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            Add Client
          </Button>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Manage your client relationships and view their job history
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Total Clients', 
              value: clientStats.total, 
              color: theme.palette.secondary.main, 
              background: theme.palette.primary.main
            },
            { 
              title: 'Active Clients', 
              value: clientStats.active, 
              color: theme.palette.success.main, 
              background: theme.palette.secondary.main
            },
            { 
              title: 'Residential', 
              value: clientStats.residential, 
              color: theme.palette.info.main, 
              background: theme.palette.secondary.main
            },
            { 
              title: 'Commercial', 
              value: clientStats.commercial, 
              color: theme.palette.warning.main, 
              background: theme.palette.secondary.main
            }
          ].map((item, index) => (
            <Grid item xs={6} sm={3} key={item.title}>
              <MotionBox
                component={motion.div}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  background: item.background,
                  minHeight: 90,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: index === 0 ? theme.palette.secondary.main : item.color,
                    mb: 1,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {item.value}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: index === 0 ? theme.palette.secondary.main : theme.palette.text.secondary,
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: 500
                  }}
                >
                  {item.title}
                </Typography>
              </MotionBox>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search clients..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
              }
            }}
          />
          <Button 
            startIcon={<FilterListIcon />}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            Filters
          </Button>
        </Box>

        <Grid container spacing={3}>
          {clients.map((client, index) => (
            <Grid item xs={12} md={6} lg={4} key={client.id}>
              <MotionCard
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, delay: 0.1 + index * 0.05 }}
                sx={{ 
                  cursor: 'pointer',
                  transition: 'all 0.2s ease-in-out',
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                  }
                }}
              >
                <CardContent sx={{ p: 3 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <Avatar
                      sx={{
                        width: 56,
                        height: 56,
                        bgcolor: theme.palette.primary.main,
                        color: theme.palette.secondary.main,
                        mr: 2,
                        boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.3)}`,
                        fontWeight: 'bold'
                      }}
                    >
                      {client.name.split(' ').map(n => n[0]).join('')}
                    </Avatar>
                    <Box>
                      <Typography variant="h6" sx={{ fontWeight: 600 }}>{client.name}</Typography>
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5 }}>
                        <Chip 
                          label={client.type} 
                          size="small"
                          sx={{ 
                            height: 20,
                            fontSize: '0.7rem',
                            mr: 1,
                            backgroundColor: client.type === 'Residential' 
                              ? alpha(theme.palette.info.main, 0.1)
                              : alpha(theme.palette.warning.main, 0.1),
                            color: client.type === 'Residential'
                              ? theme.palette.info.main
                              : theme.palette.warning.main,
                          }}
                        />
                        <Typography variant="body2" color="text.secondary">
                          {client.activeJobs} Active • {client.totalJobs} Total
                        </Typography>
                      </Box>
                    </Box>
                  </Box>
                  
                  <Divider sx={{ my: 2, opacity: 0.6 }} />

                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <LocationIcon sx={{ color: alpha(theme.palette.text.secondary, 0.7), mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {client.address}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1.5 }}>
                    <EmailIcon sx={{ color: alpha(theme.palette.text.secondary, 0.7), mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {client.email}
                    </Typography>
                  </Box>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <PhoneIcon sx={{ color: alpha(theme.palette.text.secondary, 0.7), mr: 1, fontSize: 18 }} />
                    <Typography variant="body2" color="text.secondary" sx={{ fontSize: '0.875rem' }}>
                      {client.phone}
                    </Typography>
                  </Box>

                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mt: 2 }}>
                    <Box sx={{ display: 'flex', gap: 1 }}>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          }
                        }}
                      >
                        <PhoneIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        sx={{ 
                          color: theme.palette.primary.main,
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                          '&:hover': {
                            backgroundColor: alpha(theme.palette.primary.main, 0.15),
                          }
                        }}
                      >
                        <EmailIcon fontSize="small" />
                      </IconButton>
                    </Box>
                    <Button
                      endIcon={<ArrowForwardIcon fontSize="small" />}
                      sx={{ 
                        color: theme.palette.primary.main,
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.08),
                        }
                      }}
                    >
                      View Details
                    </Button>
                  </Box>
                </CardContent>
              </MotionCard>
            </Grid>
          ))}
        </Grid>
      </Box>
    </Layout>
  );
} 