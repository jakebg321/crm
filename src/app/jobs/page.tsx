// Jobs Page - Manages and displays job listings and job-related operations
'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Button,
  TextField,
  InputAdornment,
  IconButton,
  Snackbar,
  Alert,
  CircularProgress,
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterListIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import JobList from './components/JobList';
import AddJobDialog from './components/AddJobDialog';
import JobStatusMenu from './components/JobStatusMenu';
import JobStats from './components/JobStats';

interface Client {
  id: string;
  name: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  startDate: string;
  endDate?: string;
  price: number;
  client: {
    name: string;
    address: string;
  };
}

export default function Jobs() {
  const { status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status]);

  useEffect(() => {
    if (openDialog) fetchClients();
  }, [openDialog]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedule?startDate=2000-01-01&endDate=2100-01-01");
      if (!res.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await res.json();
      const jobsArray = Array.isArray(data) ? data : [];
      setJobs(jobsArray);
      
      // Update status counts
      const counts = {
        total: jobsArray.length,
        scheduled: jobsArray.filter(job => job.status?.toLowerCase() === 'scheduled').length,
        inProgress: jobsArray.filter(job => job.status?.toLowerCase() === 'in progress').length,
        completed: jobsArray.filter(job => job.status?.toLowerCase() === 'completed').length,
        pending: jobsArray.filter(job => job.status?.toLowerCase() === 'pending').length,
      };
      setStatusCounts(counts);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to fetch jobs', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to fetch clients', 
        severity: 'error' 
      });
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleAddJob = async (jobData: any) => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(jobData),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add job');
      }
      setOpenDialog(false);
      setSnackbar({ open: true, message: 'Job added successfully', severity: 'success' });
      fetchJobs();
    } catch (err) {
      let message = 'Failed to add job';
      if (err instanceof Error) message = err.message;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleMenuClick = (event: React.MouseEvent<HTMLElement>, jobId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedJobId(jobId);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJobId(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedJobId) return;
    
    try {
      const response = await fetch(`/api/schedule/${selectedJobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job status');
      }
      
      setSnackbar({ open: true, message: 'Status updated successfully', severity: 'success' });
      fetchJobs();
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to update status', 
        severity: 'error' 
      });
    }
  };

  if (loading) return <Layout><Box sx={{ p: 6, textAlign: 'center' }}><CircularProgress /></Box></Layout>;

  return (
    <Layout>
      <Box sx={{ mb: 5 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
          <TextField
            placeholder="Search jobs..."
            variant="outlined"
            size="small"
            sx={{ width: 300 }}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon />
                </InputAdornment>
              ),
            }}
          />
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Button
              variant="outlined"
              startIcon={<FilterListIcon />}
            >
              Filter
            </Button>
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => setOpenDialog(true)}
            >
              Add Job
            </Button>
          </Box>
        </Box>

        <JobStats stats={statusCounts} />
        <JobList
          jobs={jobs}
          onStatusChange={handleStatusChange}
          onMenuClick={handleMenuClick}
        />
      </Box>

      <AddJobDialog
        open={openDialog}
        onClose={() => setOpenDialog(false)}
        onSave={handleAddJob}
        clients={clients}
      />

      <JobStatusMenu
        anchorEl={anchorEl}
        onClose={handleMenuClose}
        onStatusChange={handleStatusChange}
      />

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