'use client';

import { Grid, Paper, Typography, Box, IconButton } from '@mui/material';
import Layout from '../components/Layout';
import { BarChart } from '@mui/x-charts';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

const earnings = [
  { date: 'Jan', value: 45000 },
  { date: 'Feb', value: 46200 },
  { date: 'Mar', value: 48500 },
  { date: 'Apr', value: 47800 },
  { date: 'May', value: 49100 },
  { date: 'Jun', value: 48900 },
  { date: 'Jul', value: 50200 },
  { date: 'Aug', value: 51500 },
  { date: 'Sep', value: 52800 },
  { date: 'Oct', value: 53100 },
  { date: 'Nov', value: 54500 },
  { date: 'Dec', value: 55800 },
];

export default function Dashboard() {
  const theme = useTheme();

  return (
    <Layout>
      <Box sx={{ mb: 5 }}>
        <Typography 
          variant="h4" 
          component={motion.h1}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            mb: 1
          }}
        >
          Dashboard
        </Typography>
        <Typography 
          variant="body1" 
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            color: theme.palette.text.secondary,
            mb: 4
          }}
        >
          Welcome back! Here's what's happening with your business.
        </Typography>
      </Box>

      <Grid container spacing={3} sx={{ mb: 4 }}>
        {[
          { title: 'Open Jobs', value: '40', color: theme.palette.primary.main, background: theme.palette.secondary.main },
          { title: 'Pending Estimates', value: '16', color: theme.palette.success.main, background: theme.palette.secondary.main },
          { title: 'Scheduled', value: '25', color: theme.palette.secondary.main, background: theme.palette.primary.main }
        ].map((item, index) => (
          <Grid item xs={12} sm={4} md={4} key={item.title}>
            <MotionPaper
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                background: item.background,
                minHeight: 140,
                position: 'relative',
                overflow: 'hidden',
                '&::after': {
                  content: '""',
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: '30%',
                  height: '100%',
                  background: `linear-gradient(90deg, ${alpha(item.color, 0)} 0%, ${alpha(item.color, 0.1)} 100%)`,
                  transform: 'translateX(50%)',
                },
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0px 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
                }
              }}
            >
              <Typography 
                variant="h3" 
                sx={{ 
                  fontWeight: 700, 
                  color: item.color,
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {item.value}
              </Typography>
              <Typography 
                variant="subtitle1" 
                sx={{ 
                  color: item.background === theme.palette.primary.main ? theme.palette.secondary.main : theme.palette.text.secondary,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {item.title}
              </Typography>
            </MotionPaper>
          </Grid>
        ))}
      </Grid>

      <Grid container spacing={3}>
        <Grid item xs={12}>
          <MotionPaper
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
            sx={{ 
              p: 3,
              position: 'relative',
              '&:hover': {
                transform: 'translateY(-4px)',
                boxShadow: `0px 8px 24px ${alpha(theme.palette.primary.main, 0.15)}`,
              }
            }}
          >
            <Typography 
              variant="h6" 
              gutterBottom 
              sx={{ 
                mb: 3,
                color: theme.palette.text.primary,
                fontWeight: 600
              }}
            >
              Monthly Revenue
            </Typography>
            <Box sx={{ width: '100%', height: 300 }}>
              <BarChart
                series={[{
                  data: earnings.map(item => item.value / 1000),
                  color: theme.palette.success.light,
                  label: 'Revenue',
                }]}
                xAxis={[{
                  scaleType: 'band',
                  data: earnings.map(item => item.date),
                  tickLabelStyle: {
                    color: theme.palette.text.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                  },
                }]}
                yAxis={[{
                  tickLabelStyle: {
                    color: theme.palette.text.secondary,
                    fontSize: 12,
                    fontWeight: 500,
                  },
                  valueFormatter: (value) => `${value}k`,
                }]}
                grid={{ horizontal: false, vertical: false }}
                sx={{
                  '.MuiBarElement-root': {
                    fill: theme.palette.success.light,
                    rx: 6,
                    '&:hover': {
                      fill: theme.palette.success.main,
                    },
                  },
                  '.MuiChartsAxis-tickLabel': {
                    fontWeight: 500,
                  },
                }}
                height={300}
                margin={{ left: 50, right: 20, top: 20, bottom: 30 }}
              />
            </Box>
          </MotionPaper>
        </Grid>
      </Grid>
    </Layout>
  );
} 