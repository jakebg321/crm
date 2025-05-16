'use client';

import { Grid, Paper, Typography, Box, CircularProgress, Button, Dialog, DialogTitle, DialogContent, DialogActions, TextField, Snackbar, Alert, Stack, Slider } from '@mui/material';
import Layout from '../../../components/Layout';
import { BarChart } from '@mui/x-charts';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useEffect, useState } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import { Add as AddIcon, Dataset as DatasetIcon } from '@mui/icons-material';

interface DashboardStats {
  jobs: number;
  estimates: number;
  scheduled: number;
  revenue: number[];
}

export default function AdminDashboard() {
  const theme = useTheme();
  const { data: session, status } = useSession();
  const router = useRouter();
  const [stats, setStats] = useState<DashboardStats>({ 
    jobs: 0, 
    estimates: 0, 
    scheduled: 0, 
    revenue: Array(12).fill(0) 
  });
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [mockDataConfig, setMockDataConfig] = useState({
    employees: 3,
    clients: 5,
    jobsPerClient: 2,
    estimates: 3
  });
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error'
  });

  useEffect(() => {
    // If not authenticated, redirect to login page
    if (status === 'unauthenticated') {
      router.push('/login');
    } 
    // If authenticated but not admin/manager, redirect to appropriate dashboard
    else if (status === 'authenticated' && session?.user?.role) {
      if (session.user.role === 'STAFF') {
        router.push('/staff/dashboard');
      }
    }
  }, [status, session, router]);

  // Extract fetchStats as a standalone function
  const fetchStats = async () => {
    if (status !== 'authenticated') return;
    
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
  };

  // Call fetchStats when authenticated
  useEffect(() => {
    fetchStats();
  }, [status]);

  const handleGenerateMockData = async () => {
    try {
      setGenerating(true);
      const response = await fetch('/api/mock-data', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(mockDataConfig),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate mock data');
      }

      const data = await response.json();
      setSnackbar({
        open: true,
        message: `Success! Created ${data.results.employees} employees, ${data.results.clients} clients, ${data.results.jobs} jobs, and ${data.results.estimates} estimates.`,
        severity: 'success'
      });
      
      // Refresh dashboard data
      fetchStats();
      setOpenDialog(false);
    } catch (error) {
      setSnackbar({
        open: true,
        message: error instanceof Error ? error.message : 'Failed to generate mock data',
        severity: 'error'
      });
    } finally {
      setGenerating(false);
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbar({ ...snackbar, open: false });
  };

  // If still loading the session, show loading indicator
  if (status === 'loading' || status === 'unauthenticated') {
    return (
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column',
        alignItems: 'center', 
        justifyContent: 'center', 
        height: '100vh' 
      }}>
        <CircularProgress size={40} sx={{ mb: 2 }} />
        <Typography variant="body1" color="text.secondary">
          Loading your dashboard...
        </Typography>
      </Box>
    );
  }

  if (loading) return <Layout><Box sx={{ p: 6, textAlign: 'center' }}>Loading...</Box></Layout>;

  const hasData = stats.jobs > 0 || stats.estimates > 0;

  return (
    <Layout>
      <Box sx={{ mb: 5, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        <Box>
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
            Admin Dashboard
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
            Welcome to your admin dashboard. Here's an overview of your business.
          </Typography>
        </Box>

        <Button
          variant="contained"
          color="secondary"
          startIcon={<DatasetIcon />}
          onClick={() => setOpenDialog(true)}
          sx={{ mt: 1 }}
        >
          Generate Mock Data
        </Button>
      </Box>

      {hasData ? (
        <>
          <Grid container spacing={3} sx={{ mb: 4 }}>
            {[{
              title: 'Total Jobs',
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
              title: 'Scheduled Jobs',
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
              <Paper sx={{ p: 3, borderRadius: 3 }}>
                <Typography variant="h6" gutterBottom>
                  Monthly Revenue
                </Typography>
                <Box sx={{ height: 300 }}>
                  <BarChart
                    series={[
                      {
                        data: stats.revenue,
                        color: theme.palette.primary.main,
                      },
                    ]}
                    xAxis={[
                      {
                        data: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'],
                        scaleType: 'band',
                      },
                    ]}
                    height={300}
                  />
                </Box>
              </Paper>
            </Grid>
          </Grid>
        </>
      ) : (
        <Paper sx={{ p: 4, textAlign: 'center', borderRadius: 3 }}>
          <Typography variant="h6" gutterBottom>
            Welcome to Your Admin Dashboard
          </Typography>
          <Typography variant="body1" color="text.secondary">
            Get started by creating your first job or estimate.
          </Typography>
        </Paper>
      )}

      {/* Mock Data Generator Dialog */}
      <Dialog open={openDialog} onClose={() => !generating && setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Generate Mock Data</DialogTitle>
        <DialogContent>
          <Box sx={{ mt: 2 }}>
            <Typography gutterBottom>
              This will create sample data for your CRM with realistic addresses and information.
            </Typography>
            <Stack spacing={3} sx={{ mt: 3 }}>
              <Box>
                <Typography gutterBottom>Employees: {mockDataConfig.employees}</Typography>
                <Slider
                  value={mockDataConfig.employees}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(_, value) => setMockDataConfig({ ...mockDataConfig, employees: value as number })}
                  disabled={generating}
                />
              </Box>
              
              <Box>
                <Typography gutterBottom>Clients: {mockDataConfig.clients}</Typography>
                <Slider
                  value={mockDataConfig.clients}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(_, value) => setMockDataConfig({ ...mockDataConfig, clients: value as number })}
                  disabled={generating}
                />
              </Box>
              
              <Box>
                <Typography gutterBottom>Jobs per Client: {mockDataConfig.jobsPerClient}</Typography>
                <Slider
                  value={mockDataConfig.jobsPerClient}
                  min={1}
                  max={5}
                  step={1}
                  onChange={(_, value) => setMockDataConfig({ ...mockDataConfig, jobsPerClient: value as number })}
                  disabled={generating}
                />
              </Box>
              
              <Box>
                <Typography gutterBottom>Estimates: {mockDataConfig.estimates}</Typography>
                <Slider
                  value={mockDataConfig.estimates}
                  min={1}
                  max={10}
                  step={1}
                  onChange={(_, value) => setMockDataConfig({ ...mockDataConfig, estimates: value as number })}
                  disabled={generating}
                />
              </Box>
            </Stack>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)} disabled={generating}>
            Cancel
          </Button>
          <Button 
            onClick={handleGenerateMockData} 
            variant="contained" 
            color="primary"
            disabled={generating}
            startIcon={generating ? <CircularProgress size={20} /> : <AddIcon />}
          >
            {generating ? 'Generating...' : 'Generate Data'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for feedback */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={handleCloseSnackbar}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 