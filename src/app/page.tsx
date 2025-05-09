// Main Dashboard Page - Displays overview of business metrics and statistics
'use client';

import { Grid, Paper, Typography, Box, IconButton } from '@mui/material';
import Layout from '../components/Layout';
import { BarChart } from '@mui/x-charts';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';

interface DashboardStats {
  jobs: number;
  estimates: number;
  scheduled: number;
  revenue: number[];
}

export default function Dashboard() {
  const theme = useTheme();
  const { status } = useSession();
  const [stats, setStats] = useState<DashboardStats>({ 
    jobs: 0, 
    estimates: 0, 
    scheduled: 0, 
    revenue: Array(12).fill(0) 
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (status !== 'authenticated') return;
    async function fetchStats() {
      setLoading(true);
      // Fetch jobs
      const jobsRes = await fetch('/api/schedule?startDate=2000-01-01&endDate=2100-01-01');
      let jobs = [];
      try {
        const jobsData = await jobsRes.json();
        jobs = Array.isArray(jobsData) ? jobsData : [];
      } catch {
        jobs = [];
      }
      // Fetch estimates
      let estimates = [];
      try {
        const estimatesRes = await fetch('/api/estimates');
        const estimatesData = estimatesRes.ok ? await estimatesRes.json() : [];
        estimates = Array.isArray(estimatesData) ? estimatesData : [];
      } catch {
        estimates = [];
      }
      // Calculate revenue by month
      const revenue = Array(12).fill(0);
      jobs.forEach(job => {
        if (job.startDate) {
          const month = new Date(job.startDate).getMonth();
          revenue[month] += job.price || 0;
        }
      });
      setStats({
        jobs: jobs.length,
        estimates: estimates.length,
        scheduled: jobs.filter(j => j.status === 'SCHEDULED').length,
        revenue,
      });
      setLoading(false);
    }
    fetchStats();
  }, [status]);

  if (loading) return <Layout><Box sx={{ p: 6, textAlign: 'center' }}>Loading...</Box></Layout>;

  const hasData = stats.jobs > 0 || stats.estimates > 0;

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

      {hasData ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[{
              title: 'Open Jobs',
              value: stats.jobs,
              color: theme.palette.text.primary,
              background: theme.palette.secondary.main,
              border: 'none',
            }, {
              title: 'Pending Estimates',
              value: stats.estimates,
              color: theme.palette.success.main,
              background: theme.palette.secondary.main,
              border: 'none',
            }, {
              title: 'Scheduled',
              value: stats.scheduled,
              color: theme.palette.secondary.main,
              background: theme.palette.primary.main,
              border: 'none',
            }].map((item, index) => (
              <Grid item xs={12} sm={4} md={4} key={item.title}>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                >
                  <Paper
                    sx={{
                      p: 3,
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'flex-start',
                      background: item.background,
                      minHeight: 140,
                      borderRadius: 3,
                      position: 'relative',
                      overflow: 'hidden',
                      border: item.border,
                      boxShadow: 'none',
                      '&:hover': {
                        transform: 'translateY(-4px)',
                        boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
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
                        zIndex: 1,
                        fontWeight: 500
                      }}
                    >
                      {item.title}
                    </Typography>
                  </Paper>
                </motion.div>
              </Grid>
            ))}
          </Grid>

          <Grid container spacing={3}>
            <Grid item xs={12}>
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.4 }}
              >
                <Paper
                  sx={{ 
                    p: 3,
                    borderRadius: 3,
                    position: 'relative',
                    boxShadow: 'none',
                    '&:hover': {
                      transform: 'translateY(-4px)',
                      boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
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
                        data: stats.revenue.map(v => v / 1000),
                        color: theme.palette.success.main,
                        label: 'Revenue',
                      }]}
                      xAxis={[{
                        scaleType: 'band',
                        data: ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'],
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
                      axisHighlight={{
                        x: 'none',
                        y: 'none',
                      }}
                      tooltip={{
                        trigger: 'item',
                      }}
                      sx={{
                        '.MuiBarElement-root': {
                          fill: theme.palette.success.main,
                          rx: 4,
                          '&:hover': {
                            fill: theme.palette.success.dark,
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
                </Paper>
              </motion.div>
            </Grid>
          </Grid>
        </>
      ) : (
        <Box sx={{ textAlign: 'center', mt: 8 }}>
          <Typography variant="h5" sx={{ mb: 2 }}>
            No data yet
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get started by adding your first job or estimate!
          </Typography>
        </Box>
      )}
    </Layout>
  );
} 