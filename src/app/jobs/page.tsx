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
  Typography,
  Card,
  CardContent,
  Chip,
  Grid,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Paper,
  MenuItem,
  Select,
  FormControl,
  InputLabel
} from '@mui/material';
import {
  Add as AddIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Clear as ClearIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import Link from 'next/link';
import { JobStatus, JobType } from '@prisma/client';
import { useJobs } from '@/hooks/useJobsData';
import SkeletonLoader from '@/components/SkeletonLoader';

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

// Utility to format date strings
const formatDate = (dateString: string | null) => {
  if (!dateString) return 'Not scheduled';
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};

// Utility to get status color
const getStatusColor = (status: JobStatus) => {
  switch (status) {
    case 'PENDING':
      return 'warning';
    case 'SCHEDULED':
      return 'info';
    case 'IN_PROGRESS':
      return 'primary';
    case 'COMPLETED':
      return 'success';
    case 'CANCELLED':
      return 'error';
    default:
      return 'default';
  }
};

export default function Jobs() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<JobStatus | ''>('');
  const [typeFilter, setTypeFilter] = useState<JobType | ''>('');

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Fetch jobs with React Query
  const { data: jobs = [], isLoading, error } = useJobs();
  
  // Local filtering
  const filteredJobs = jobs.filter(job => {
    const matchesSearch = 
      !searchTerm || 
      job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      job.client?.name.toLowerCase().includes(searchTerm.toLowerCase());
      
    const matchesStatus = !statusFilter || job.status === statusFilter;
    const matchesType = !typeFilter || job.type === typeFilter;
    
    return matchesSearch && matchesStatus && matchesType;
  });

  const clearFilters = () => {
    setSearchTerm('');
    setStatusFilter('');
    setTypeFilter('');
  };

  if (status === 'loading') {
    return <CircularProgress />;
  }

  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Typography 
          variant="h4" 
          component={motion.h1}
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3 }}
          sx={{ fontWeight: 700, mb: 1 }}
        >
          Jobs
        </Typography>
        <Typography 
          variant="body1"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{ color: theme.palette.text.secondary, mb: 4 }}
        >
          Manage your landscaping jobs and track their progress.
        </Typography>
      </Box>

      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3, flexWrap: 'wrap', gap: 2 }}>
          <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flex: 1 }}>
            <TextField
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
                endAdornment: searchTerm && (
                  <InputAdornment position="end">
                    <IconButton size="small" onClick={() => setSearchTerm('')}>
                      <ClearIcon fontSize="small" />
                    </IconButton>
                  </InputAdornment>
                )
              }}
              size="small"
              sx={{ minWidth: 220 }}
            />
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Status</InputLabel>
              <Select
                value={statusFilter}
                label="Status"
                onChange={(e) => setStatusFilter(e.target.value as JobStatus | '')}
              >
                <MenuItem value="">All Statuses</MenuItem>
                {Object.values(JobStatus).map((status) => (
                  <MenuItem key={status} value={status}>
                    {status.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            <FormControl size="small" sx={{ minWidth: 150 }}>
              <InputLabel>Type</InputLabel>
              <Select
                value={typeFilter}
                label="Type"
                onChange={(e) => setTypeFilter(e.target.value as JobType | '')}
              >
                <MenuItem value="">All Types</MenuItem>
                {Object.values(JobType).map((type) => (
                  <MenuItem key={type} value={type}>
                    {type.replace('_', ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            
            {(searchTerm || statusFilter || typeFilter) && (
              <Button 
                startIcon={<ClearIcon />} 
                onClick={clearFilters}
                size="small"
              >
                Clear
              </Button>
            )}
          </Box>
          
          <Button
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => router.push('/schedule')}
          >
            New Job
          </Button>
        </Box>
        
        {isLoading ? (
          <SkeletonLoader type="table" />
        ) : error ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography variant="h6" color="error">Error loading jobs</Typography>
            <Typography variant="body2">Please try refreshing the page</Typography>
          </Box>
        ) : filteredJobs.length === 0 ? (
          <Box sx={{ 
            p: 5, 
            textAlign: 'center', 
            border: `1px dashed ${alpha(theme.palette.primary.main, 0.2)}`,
            borderRadius: 2
          }}>
            <Typography variant="h6" gutterBottom>No jobs found</Typography>
            <Typography variant="body2" color="textSecondary" sx={{ mb: 3 }}>
              {searchTerm || statusFilter || typeFilter 
                ? 'Try adjusting your filters to see more results'
                : 'Create your first job to get started'}
            </Typography>
            
            {!(searchTerm || statusFilter || typeFilter) && (
              <Button
                variant="contained"
                startIcon={<AddIcon />}
                onClick={() => router.push('/schedule')}
              >
                Add New Job
              </Button>
            )}
          </Box>
        ) : (
          <TableContainer component={Paper} elevation={0} sx={{ border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}` }}>
            <Table>
              <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
                <TableRow>
                  <TableCell><Typography variant="subtitle2">Job</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Client</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Date</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Type</Typography></TableCell>
                  <TableCell><Typography variant="subtitle2">Status</Typography></TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredJobs.map((job) => (
                  <TableRow 
                    key={job.id}
                    hover
                    onClick={() => router.push(`/jobs/${job.id}`)}
                    sx={{ 
                      cursor: 'pointer',
                      '&:hover': {
                        bgcolor: alpha(theme.palette.primary.main, 0.05)
                      }
                    }}
                  >
                    <TableCell>
                      <Typography variant="body2" fontWeight={500}>{job.title}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{job.client?.name || 'No client'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{formatDate(job.startDate)}</Typography>
                    </TableCell>
                    <TableCell>
                      <Typography variant="body2">{job.type?.replace('_', ' ') || '-'}</Typography>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={job.status} 
                        size="small"
                        color={getStatusColor(job.status)}
                        sx={{ 
                          fontWeight: 500,
                          fontSize: '0.75rem',
                        }}
                      />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </motion.div>
    </Layout>
  );
} 