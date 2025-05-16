// Schedule Page - Manages and displays job scheduling and calendar functionality
'use client';

import { useState, useEffect, useMemo } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Button,
  IconButton,
  Alert,
  Snackbar,
  Tooltip,
  Avatar,
  AvatarGroup,
  Chip,
  Tab,
  Tabs,
  CircularProgress
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
  CalendarMonth as CalendarIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion, AnimatePresence } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { UserRole, JobStatus, JobType } from '@prisma/client';

// Import new components
import RouteOptimizer from './components/maps/RouteOptimizer';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import StaffPanel from './components/StaffPanel';
import JobForm from './components/JobForm';
import TaskForm from './components/TaskForm';
import SkeletonLoader from '@/components/SkeletonLoader';
import { useJobs, useCreateJob, useUpdateJob, useDeleteJob } from '@/hooks/useJobsData';
import { useClients } from '@/hooks/useClientsData';

const MotionPaper = motion.create(Paper);
const MotionBox = motion.create(Box);

interface Filters {
  employeeId?: string;
  clientId?: string;
  jobType?: JobType;
  jobStatus?: JobStatus;
  searchTerm?: string;
}

export default function Schedule() {
  const theme = useTheme();
  const router = useRouter();
  const { data: session, status } = useSession();
  
  // State
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<'month' | 'week' | 'day'>('month');
  const [filters, setFilters] = useState<Filters>({});
  const [selectedEmployeeId, setSelectedEmployeeId] = useState<string>('');
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [routeOptimizerOpen, setRouteOptimizerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [showStaffPanel, setShowStaffPanel] = useState(false);
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [editingJob, setEditingJob] = useState<any | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  
  // Date range for fetching jobs
  const dateRange = useMemo(() => {
    let startDate, endDate;
    
    switch (viewType) {
      case 'month':
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
        break;
      case 'week':
        startDate = new Date(currentDate);
        startDate.setDate(currentDate.getDate() - currentDate.getDay());
        endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);
        break;
      case 'day':
        startDate = currentDate;
        endDate = currentDate;
        break;
      default:
        startDate = startOfMonth(currentDate);
        endDate = endOfMonth(currentDate);
    }
    
    return {
      startDate: startDate.toISOString(),
      endDate: endDate.toISOString()
    };
  }, [currentDate, viewType]);
  
  // React Query hooks
  const { 
    data: jobs = [], 
    isLoading: jobsLoading, 
    error: jobsError 
  } = useJobs({
    startDate: dateRange.startDate,
    endDate: dateRange.endDate,
    employeeId: filters.employeeId
  });
  
  const { 
    data: clients = [], 
    isLoading: clientsLoading 
  } = useClients();
  
  const createJobMutation = useCreateJob();
  const updateJobMutation = useUpdateJob();
  const deleteJobMutation = useDeleteJob();
  
  // Filter jobs based on criteria
  const filteredJobs = useMemo(() => {
    return jobs.filter(job => {
      // Filter by employee
      if (filters.employeeId && job.assignedToId !== filters.employeeId) {
        return false;
      }
      
      // Filter by client
      if (filters.clientId && job.clientId !== filters.clientId) {
        return false;
      }
      
      // Filter by job type
      if (filters.jobType && job.type !== filters.jobType) {
        return false;
      }
      
      // Filter by job status
      if (filters.jobStatus && job.status !== filters.jobStatus) {
        return false;
      }
      
      // Filter by search term
      if (filters.searchTerm) {
        const searchLower = filters.searchTerm.toLowerCase();
        return (
          job.title.toLowerCase().includes(searchLower) ||
          (job.description && job.description.toLowerCase().includes(searchLower)) ||
          (job.client && job.client.name.toLowerCase().includes(searchLower))
        );
      }
      
      return true;
    });
  }, [jobs, filters]);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Add keyboard shortcut to toggle staff panel
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.altKey && e.key === 's') {
        setShowStaffPanel(prev => !prev);
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  // Update selected employee in filters
  useEffect(() => {
    if (selectedEmployeeId) {
      setFilters({
        ...filters,
        employeeId: selectedEmployeeId
      });
    }
  }, [selectedEmployeeId]);

  // Handle day click - open appropriate dialog
  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setEditingJob(null);
    setEditingTask(null);
    setOpenJobDialog(true);
  };

  // Handle edit job
  const handleEditJob = (job: any) => {
    setEditingJob(job);
    setSelectedDate(null); // Clear selected date when editing a job
    setOpenJobDialog(true);
  };

  // Handle job click in calendar/list view
  const handleJobClick = (jobId: string) => {
    const job = jobs.find(j => j.id === jobId);
    if (job) {
      // Determine if this is a task (owner task) or regular job
      if (job.title.startsWith('[OWNER]')) {
        setEditingTask(job);
        setOpenTaskDialog(true);
      } else {
        setEditingJob(job);
        setOpenJobDialog(true);
      }
    }
  };

  // Toggle staff panel visibility
  const toggleStaffPanel = () => {
    setShowStaffPanel(prev => !prev);
  };

  // Handle job form submission
  const handleSubmitJob = async (jobData: any) => {
    try {
      if (editingJob) {
        // Update existing job
        await updateJobMutation.mutateAsync({
          id: editingJob.id,
          data: jobData
        });
        
        setSnackbar({
          open: true,
          message: 'Job updated successfully',
          severity: 'success',
        });
      } else {
        // Create new job
        await createJobMutation.mutateAsync(jobData);
        
        setSnackbar({
          open: true,
          message: 'Job added successfully',
          severity: 'success',
        });
      }
      setOpenJobDialog(false);
      setEditingJob(null);
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to ${editingJob ? 'update' : 'add'} job: ${err}`,
        severity: 'error',
      });
    }
  };

  // Handle delete job
  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJobMutation.mutateAsync(id);
      
      setSnackbar({
        open: true,
        message: 'Job deleted successfully',
        severity: 'success',
      });
      
      if (openJobDialog) {
        setOpenJobDialog(false);
      }
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to delete job: ${err}`,
        severity: 'error',
      });
    }
  };

  // Handle opening/closing route optimizer
  const handleOpenRouteOptimizer = () => {
    setRouteOptimizerOpen(true);
  };
  
  const handleCloseRouteOptimizer = () => {
    setRouteOptimizerOpen(false);
  };

  // If still loading the session, show loading indicator
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
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
          Schedule
        </Typography>
        <Typography 
          variant="body1"
          component={motion.p}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.3, delay: 0.1 }}
          sx={{ color: theme.palette.text.secondary, mb: 3 }}
        >
          Manage your job schedule and assignments.
        </Typography>
      </Box>
      
      {/* Schedule Toolbar Component - keeping as inline for simplicity */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3, delay: 0.2 }}
      >
        <Paper 
          elevation={0} 
          sx={{ 
            p: 2, 
            mb: 3, 
            borderRadius: 2,
            border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
            display: 'flex',
            flexWrap: 'wrap',
            justifyContent: 'space-between',
            gap: 2
          }}
        >
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <IconButton onClick={() => setCurrentDate(prev => 
              viewType === 'month' ? subMonths(prev, 1) : 
              viewType === 'week' ? new Date(prev.setDate(prev.getDate() - 7)) :
              new Date(prev.setDate(prev.getDate() - 1))
            )}>
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h6" sx={{ fontWeight: 600, minWidth: 180, textAlign: 'center' }}>
              {viewType === 'month' && format(currentDate, 'MMMM yyyy')}
              {viewType === 'week' && `Week of ${format(currentDate, 'MMM d, yyyy')}`}
              {viewType === 'day' && format(currentDate, 'EEEE, MMM d, yyyy')}
            </Typography>
            
            <IconButton onClick={() => setCurrentDate(prev => 
              viewType === 'month' ? addMonths(prev, 1) : 
              viewType === 'week' ? new Date(prev.setDate(prev.getDate() + 7)) :
              new Date(prev.setDate(prev.getDate() + 1))
            )}>
              <ChevronRightIcon />
            </IconButton>
            
            <Button 
              variant="outlined" 
              size="small"
              onClick={() => setCurrentDate(new Date())}
            >
              Today
            </Button>
          </Box>
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <Tabs 
              value={viewType} 
              onChange={(_, value) => setViewType(value)}
              sx={{ minHeight: 'unset' }}
            >
              <Tab value="month" label="Month" />
              <Tab value="week" label="Week" />
              <Tab value="day" label="Day" />
            </Tabs>
            
            <Button
              variant="outlined"
              startIcon={<PersonIcon />}
              onClick={toggleStaffPanel}
              sx={{ ml: 1 }}
            >
              Staff
            </Button>
            
            <Button
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => handleDayClick(new Date())}
            >
              Add Job
            </Button>
          </Box>
        </Paper>
      </motion.div>
      
      <Box sx={{ display: 'flex', gap: 3 }}>
        {/* Main Calendar Area */}
        <Box sx={{ flex: 1 }}>
          <AnimatePresence mode="wait">
            {jobsLoading ? (
              <SkeletonLoader type="card" count={5} />
            ) : jobsError ? (
              <Box sx={{ p: 4, textAlign: 'center' }}>
                <Typography variant="h6" color="error">Error loading schedule</Typography>
                <Typography variant="body2">Please try refreshing the page</Typography>
              </Box>
            ) : (
              <motion.div
                key={`${viewType}-${currentDate.toString()}`}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 0.2 }}
              >
                {viewType === 'month' && (
                  <CalendarView 
                    jobs={filteredJobs} 
                    date={currentDate} 
                    onDayClick={handleDayClick}
                    onJobClick={handleJobClick}
                  />
                )}
                
                {(viewType === 'week' || viewType === 'day') && (
                  <ListView 
                    jobs={filteredJobs} 
                    date={currentDate} 
                    viewType={viewType}
                    onDayClick={handleDayClick}
                    onJobClick={handleJobClick}
                  />
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </Box>
        
        {/* Staff Side Panel */}
        <AnimatePresence>
          {showStaffPanel && (
            <MotionBox
              initial={{ x: 300, opacity: 0 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: 300, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 500 }}
              sx={{ 
                width: 280, 
                minWidth: 280,
                overflow: 'hidden',
              }}
            >
              <StaffPanel 
                onEmployeeSelect={setSelectedEmployeeId}
                selectedEmployeeId={selectedEmployeeId}
                onClose={toggleStaffPanel}
              />
            </MotionBox>
          )}
        </AnimatePresence>
      </Box>
      
      {/* Job Form Dialog */}
      <JobForm
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        onSubmit={handleSubmitJob}
        onDelete={handleDeleteJob}
        job={editingJob}
        selectedDate={selectedDate}
        clients={clients}
      />
      
      {/* Task Form Dialog */}
      <TaskForm
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        onSubmit={() => {}}
        task={editingTask}
      />
      
      {/* Route Optimizer Dialog */}
      <Dialog
        open={routeOptimizerOpen}
        onClose={handleCloseRouteOptimizer}
        fullWidth
        maxWidth="md"
      >
        <DialogTitle>
          Optimize Routes
          <IconButton
            onClick={handleCloseRouteOptimizer}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent>
          <RouteOptimizer 
            jobs={filteredJobs} 
            date={currentDate}
            employeeId={selectedEmployeeId} 
          />
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
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