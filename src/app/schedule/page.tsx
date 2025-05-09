// Schedule Page - Manages and displays job scheduling and calendar functionality
'use client';

import { useState, useEffect } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Alert,
  Snackbar,
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";

const MotionPaper = motion(Paper);

interface Job {
  id: string;
  title: string;
  description: string;
  type: string;
  status: string;
  startDate: string;
  endDate?: string;
  price: number;
  client: {
    id: string;
    name: string;
  };
  assignedTo: {
    id: string;
    name: string;
  };
}

export default function Schedule() {
  const theme = useTheme();
  const router = useRouter();
  const { status } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    price: '',
    clientId: '',
    assignedToId: '',
  });

  // Fetch jobs for the current month
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    fetchJobs();
  }, [currentDate]);

  const fetchJobs = async () => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const response = await fetch(
        `/api/schedule?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`
      );
      
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError('Failed to load schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add job');
      }

      const newJob = await response.json();
      setJobs(prev => [...prev, newJob]);
      setOpenDialog(false);
      setFormData({
        title: '',
        description: '',
        type: '',
        startDate: '',
        endDate: '',
        price: '',
        clientId: '',
        assignedToId: '',
      });
      setSnackbar({
        open: true,
        message: 'Job added successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: err.message || 'Failed to add job',
        severity: 'error',
      });
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');

      setJobs(prev => prev.filter(job => job.id !== id));
      setSnackbar({
        open: true,
        message: 'Job deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete job',
        severity: 'error',
      });
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => isSameDay(parseISO(job.startDate), date));
  };
  
  const getStatusColor = (status: string) => {
    switch (status) {
      case 'SCHEDULED':
        return theme.palette.info.main;
      case 'IN_PROGRESS':
        return theme.palette.warning.main;
      case 'COMPLETED':
        return theme.palette.success.main;
      case 'CANCELLED':
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <Layout>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary
            }}
          >
            Schedule
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={() => setOpenDialog(true)}
            sx={{
              boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0px 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            New Job
          </Button>
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          View and manage your landscaping schedule
        </Typography>
        
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            p: 3,
            position: 'relative',
            mb: 4,
            borderRadius: 3,
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handlePreviousMonth} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            
            <IconButton onClick={handleNextMonth} color="primary">
              <ChevronRightIcon />
            </IconButton>
          </Box>
          
          <Grid container spacing={1}>
            {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
              <Grid item xs={12/7} key={day}>
                <Box 
                  sx={{ 
                    textAlign: 'center', 
                    p: 1,
                    fontWeight: 600,
                    color: theme.palette.text.secondary
                  }}
                >
                  {day}
                </Box>
              </Grid>
            ))}
            
            {daysInMonth.map((day, i) => {
              const dayJobs = getJobsForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <Grid item xs={12/7} key={i}>
                  <MotionPaper
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    sx={{
                      p: 1,
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: isCurrentMonth ? 1 : 0.4,
                      border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : 'none',
                      background: isCurrentDay ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isCurrentDay ? 700 : 400,
                        color: isCurrentDay ? theme.palette.primary.main : theme.palette.text.primary,
                        mb: 1
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    
                    {dayJobs.length > 0 && dayJobs.slice(0, 2).map((job) => (
                      <Chip 
                        key={job.id}
                        label={job.title.length > 12 ? `${job.title.substring(0, 12)}...` : job.title}
                        size="small"
                        sx={{ 
                          mb: 0.5, 
                          backgroundColor: alpha(getStatusColor(job.status), 0.1),
                          color: getStatusColor(job.status),
                          borderRadius: '4px',
                          height: '20px',
                          fontSize: '0.7rem',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(getStatusColor(job.status), 0.2),
                          }
                        }}
                      />
                    ))}
                    {dayJobs.length > 2 && (
                      <Typography 
                        variant="caption" 
                        sx={{ 
                          color: theme.palette.text.secondary,
                          mt: 0.5
                        }}
                      >
                        +{dayJobs.length - 2} more
                      </Typography>
                    )}
                  </MotionPaper>
                </Grid>
              );
            })}
          </Grid>
        </MotionPaper>
      </Box>

      {/* Add Job Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Job</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Title"
              value={formData.title}
              onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))}
              required
            />
            <TextField
              label="Description"
              multiline
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
            />
            <FormControl required>
              <InputLabel>Type</InputLabel>
              <Select
                value={formData.type}
                label="Type"
                onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
              >
                <MenuItem value="LAWN_MAINTENANCE">Lawn Maintenance</MenuItem>
                <MenuItem value="LANDSCAPE_DESIGN">Landscape Design</MenuItem>
                <MenuItem value="TREE_SERVICE">Tree Service</MenuItem>
                <MenuItem value="IRRIGATION">Irrigation</MenuItem>
                <MenuItem value="HARDSCAPING">Hardscaping</MenuItem>
                <MenuItem value="CLEANUP">Cleanup</MenuItem>
                <MenuItem value="PLANTING">Planting</MenuItem>
                <MenuItem value="FERTILIZATION">Fertilization</MenuItem>
              </Select>
            </FormControl>
            <TextField
              label="Start Date"
              type="datetime-local"
              value={formData.startDate}
              onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
              required
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="End Date"
              type="datetime-local"
              value={formData.endDate}
              onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
              InputLabelProps={{ shrink: true }}
            />
            <TextField
              label="Price"
              type="number"
              value={formData.price}
              onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
              required
              InputProps={{
                startAdornment: <Typography sx={{ mr: 1 }}>$</Typography>,
              }}
            />
            <FormControl required>
              <InputLabel>Client</InputLabel>
              <Select
                value={formData.clientId}
                label="Client"
                onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
              >
                {/* We'll need to fetch clients for this */}
                <MenuItem value="1">John Doe</MenuItem>
                <MenuItem value="2">Jane Smith</MenuItem>
              </Select>
            </FormControl>
            <FormControl required>
              <InputLabel>Assigned To</InputLabel>
              <Select
                value={formData.assignedToId}
                label="Assigned To"
                onChange={(e) => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
              >
                {/* We'll need to fetch staff for this */}
                <MenuItem value="1">Staff Member 1</MenuItem>
                <MenuItem value="2">Staff Member 2</MenuItem>
              </Select>
            </FormControl>
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleAddJob}
            disabled={!formData.title || !formData.type || !formData.startDate || !formData.price || !formData.clientId || !formData.assignedToId}
          >
            Add Job
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 