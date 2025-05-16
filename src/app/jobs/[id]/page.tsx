// Job Details Route - Displays and manages individual job information and its associated details
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import Layout from '../../../components/Layout';
import {
  Box, Typography, TextField, Button, MenuItem, Select, InputLabel, FormControl, Snackbar, Alert, CircularProgress,
  Divider, Paper, Tab, Tabs, Grid, Chip
} from '@mui/material';
import { AlertColor, SelectChangeEvent } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import JobNotes from '../components/JobNotes';
import JobPhotos from '../components/JobPhotos';
import { useJob, useUpdateJob } from '@/hooks/useJobsData';
import SkeletonLoader from '@/components/SkeletonLoader';
import { JobStatus, JobType } from '@prisma/client';

const JOB_TYPES = Object.values(JobType);
const JOB_STATUSES = Object.values(JobStatus);

export default function JobDetails() {
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const theme = useTheme();
  const jobId = params.id as string;
  
  const [activeTab, setActiveTab] = useState(0);
  const [form, setForm] = useState({
    title: '',
    description: '',
    type: '',
    status: '',
    startDate: '',
    endDate: '',
    price: '',
    clientId: '',
    assignedToId: '',
  });
  const [saving, setSaving] = useState(false);
  const [snackbar, setSnackbar] = useState<{ open: boolean; message: string; severity: AlertColor }>({ 
    open: false, message: '', severity: 'success' 
  });

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Use React Query to fetch job data
  const { 
    data: job, 
    isLoading, 
    error, 
    isError 
  } = useJob(jobId);

  // Update form when job data is loaded
  useEffect(() => {
    if (job) {
      setForm({
        title: job.title || '',
        description: job.description || '',
        type: job.type || '',
        status: job.status || '',
        startDate: job.startDate ? job.startDate.slice(0, 10) : '',
        endDate: job.endDate ? job.endDate.slice(0, 10) : '',
        price: job.price?.toString() || '',
        clientId: job.clientId || '',
        assignedToId: job.assignedToId || '',
      });
    }
  }, [job]);

  // Use React Query mutation for updating the job
  const updateJobMutation = useUpdateJob();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name]: value });
  };
  
  const handleSelectChange = (e: SelectChangeEvent<string>) => {
    const { name, value } = e.target;
    setForm({ ...form, [name as string]: value });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateJobMutation.mutateAsync({
        id: jobId,
        data: {
          ...form,
          price: form.price ? parseFloat(form.price) : null,
        }
      });
      
      setSnackbar({ open: true, message: 'Job updated successfully', severity: 'success' });
    } catch (err: any) {
      setSnackbar({ open: true, message: err.message, severity: 'error' });
    } finally {
      setSaving(false);
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: number) => {
    setActiveTab(newValue);
  };

  if (status === 'loading') {
    return <CircularProgress />;
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 1 }}>
          <Button 
            variant="outlined" 
            onClick={() => router.back()}
            sx={{ mb: 1 }}
          >
            Back
          </Button>
          <Typography 
            variant="h4" 
            component={motion.h1}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            sx={{ fontWeight: 700 }}
          >
            {isLoading ? 'Loading Job...' : job?.title || 'Job Details'}
          </Typography>
          
          {job && (
            <Chip 
              label={job.status} 
              color={
                job.status === 'COMPLETED' ? 'success' :
                job.status === 'IN_PROGRESS' ? 'primary' :
                job.status === 'SCHEDULED' ? 'info' :
                job.status === 'CANCELLED' ? 'error' : 'warning'
              }
              sx={{ fontWeight: 500 }}
            />
          )}
        </Box>
        
        {job?.client && (
          <Typography 
            variant="body1"
            component={motion.p}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.3, delay: 0.1 }}
            sx={{ color: theme.palette.text.secondary, mb: 4 }}
          >
            Client: {job.client.name} | Address: {job.client.address || 'No address provided'}
          </Typography>
        )}
      </Box>

      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        sx={{ 
          mb: 3, 
          borderBottom: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
          '& .MuiTabs-indicator': {
            height: 3,
          }
        }}
      >
        <Tab label="Details" />
        <Tab label="Notes" />
        <Tab label="Photos" />
      </Tabs>

      <AnimatePresence mode="wait">
        {isLoading ? (
          <SkeletonLoader type="job" />
        ) : isError ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">Error loading job</Typography>
            <Typography variant="body2">Please try refreshing the page</Typography>
          </Box>
        ) : (
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.2 }}
          >
            {activeTab === 0 && (
              <Paper 
                elevation={0} 
                sx={{ 
                  p: 3, 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`
                }}
              >
                <Grid container spacing={3}>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Job Title"
                      name="title"
                      value={form.title}
                      onChange={handleInputChange}
                      variant="outlined"
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Type</InputLabel>
                      <Select
                        name="type"
                        value={form.type}
                        onChange={handleSelectChange}
                        label="Type"
                      >
                        <MenuItem value="">No Type</MenuItem>
                        {JOB_TYPES.map(type => (
                          <MenuItem key={type} value={type}>
                            {type.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <FormControl fullWidth>
                      <InputLabel>Status</InputLabel>
                      <Select
                        name="status"
                        value={form.status}
                        onChange={handleSelectChange}
                        label="Status"
                      >
                        {JOB_STATUSES.map(status => (
                          <MenuItem key={status} value={status}>
                            {status.replace('_', ' ')}
                          </MenuItem>
                        ))}
                      </Select>
                    </FormControl>
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Start Date"
                      name="startDate"
                      type="date"
                      value={form.startDate}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="End Date"
                      name="endDate"
                      type="date"
                      value={form.endDate}
                      onChange={handleInputChange}
                      InputLabelProps={{
                        shrink: true,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12} md={6}>
                    <TextField
                      fullWidth
                      label="Price"
                      name="price"
                      type="number"
                      value={form.price}
                      onChange={handleInputChange}
                      InputProps={{
                        startAdornment: <Box component="span" sx={{ mr: 1 }}>$</Box>,
                      }}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <TextField
                      fullWidth
                      label="Description"
                      name="description"
                      multiline
                      rows={4}
                      value={form.description}
                      onChange={handleInputChange}
                    />
                  </Grid>
                  <Grid item xs={12}>
                    <Button
                      variant="contained"
                      onClick={handleSave}
                      disabled={saving || updateJobMutation.isPending}
                      sx={{ mt: 2 }}
                    >
                      {saving || updateJobMutation.isPending ? <CircularProgress size={24} /> : 'Save Changes'}
                    </Button>
                  </Grid>
                </Grid>
              </Paper>
            )}
            
            {activeTab === 1 && <JobNotes jobId={jobId} />}
            
            {activeTab === 2 && <JobPhotos jobId={jobId} />}
          </motion.div>
        )}
      </AnimatePresence>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert
          severity={snackbar.severity}
          onClose={() => setSnackbar({ ...snackbar, open: false })}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 