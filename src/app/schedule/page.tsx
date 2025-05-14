// Schedule Page - Manages and displays job scheduling and calendar functionality
'use client';

import { useState, useEffect } from 'react';
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
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { UserRole, JobStatus, JobType } from '@prisma/client';

// Import new components
import RouteOptimizer from './components/maps/RouteOptimizer';
import { useScheduleData } from './hooks/useScheduleData';
import ScheduleToolbar from './components/ScheduleToolbar';
import CalendarView from './components/CalendarView';
import ListView from './components/ListView';
import StaffPanel from './components/StaffPanel';
import JobForm from './components/JobForm';
import TaskForm from './components/TaskForm';
import { ExtendedJob } from './utils/scheduleHelpers';

const MotionPaper = motion.create(Paper);

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface Job {
  id: string;
  title: string;
  description: string | null;
  type: JobType | null;
  status: JobStatus;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  client: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
}

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
  
  // Schedule data from custom hook
  const {
    jobs,
    filteredJobs,
    users,
    clients,
    loading,
    error,
    filters,
    setFilters,
    viewType,
    setViewType,
    currentDate,
    setCurrentDate,
    refreshData,
    addJob,
    updateJob,
    deleteJob
  } = useScheduleData();
  
  // UI state
  const [openJobDialog, setOpenJobDialog] = useState(false);
  const [openTaskDialog, setOpenTaskDialog] = useState(false);
  const [routeOptimizerOpen, setRouteOptimizerOpen] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [snackbar, setSnackbar] = useState({ 
    open: false, 
    message: '', 
    severity: 'success' as 'success' | 'error' 
  });
  const [editingJob, setEditingJob] = useState<ExtendedJob | null>(null);
  const [editingTask, setEditingTask] = useState<any | null>(null);
  const [draggedJob, setDraggedJob] = useState<ExtendedJob | null>(null);
  const [isDragging, setIsDragging] = useState(false);

  // Authentication check
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  // Update selected employee in filters
  useEffect(() => {
    if (selectedEmployee) {
      setFilters({
        ...filters,
        employeeId: selectedEmployee
      });
    }
  }, [selectedEmployee, filters, setFilters]);

  // Handle day click - open appropriate dialog
  const handleDayClick = (date: Date) => {
    console.log('Day clicked:', date);
    setSelectedDate(date);
    setEditingJob(null);
    setEditingTask(null);
    setOpenJobDialog(true);
  };

  // Handle edit job
  const handleEditJob = (job: ExtendedJob) => {
    console.log('Edit job:', job);
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

  // Handle drag start
  const handleDragStart = (job: ExtendedJob, event: React.MouseEvent) => {
    setDraggedJob(job);
    setIsDragging(true);
    console.log('Drag start:', job.id);
  };

  // Handle drag end
  const handleDragEnd = (event: React.MouseEvent) => {
    setIsDragging(false);
    setDraggedJob(null);
    console.log('Drag end');
  };

  // Handle drop on date
  const handleDateDrop = (date: Date) => {
    if (draggedJob && draggedJob.id) {
      handleJobDrop(draggedJob.id, date);
    }
  };

  // Handle drop on employee
  const handleEmployeeDrop = (employeeId: string) => {
    if (draggedJob && draggedJob.id) {
      handleEmployeeAssign(draggedJob.id, employeeId);
    }
  };

  // Handle job form submission
  const handleSubmitJob = async (jobData: any) => {
    try {
      if (editingJob) {
        // Update existing job
        await updateJob(editingJob.id, jobData);
        setSnackbar({
          open: true,
          message: 'Job updated successfully',
          severity: 'success',
        });
      } else {
        // Create new job
        await addJob(jobData);
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

  // Handle submit task
  const handleSubmitTask = async (taskData: any) => {
    try {
      // Format the task data with owner flag and priority flag
      const priority = taskData.priority || 'medium';
      
      let formattedTitle = `[OWNER] `;
      if (priority) {
        formattedTitle += `[FLAG:${priority}] `;
      }
      formattedTitle += taskData.title;
      
      const updatedTaskData = {
        ...taskData,
        title: formattedTitle,
      };

      if (editingTask) {
        await updateJob(editingTask.id, updatedTaskData);
        setSnackbar({
          open: true,
          message: 'Task updated successfully',
          severity: 'success',
        });
      } else {
        await addJob(updatedTaskData);
        setSnackbar({
          open: true,
          message: 'Task added successfully',
          severity: 'success',
        });
      }
      
      refreshData();
      setOpenTaskDialog(false);
    } catch (error) {
      console.error('Error saving task:', error);
      setSnackbar({
        open: true,
        message: `Failed to save task: ${error}`,
        severity: 'error',
      });
    }
  };

  // Handle delete job
  const handleDeleteJob = async (id: string) => {
    try {
      await deleteJob(id);
      setSnackbar({
        open: true,
        message: 'Job deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to delete job: ${err}`,
        severity: 'error',
      });
    }
  };

  // Handle job drop (for drag and drop)
  const handleJobDrop = async (jobId: string, newDate: Date) => {
    const job = jobs.find(j => j.id === jobId);
    if (!job) return;
    
    try {
      // Calculate new end date based on duration
      let newEndDate = null;
      if (job.startDate && job.endDate) {
        const startDate = new Date(job.startDate);
        const endDate = new Date(job.endDate);
        const duration = endDate.getTime() - startDate.getTime();
        
        newEndDate = new Date(newDate.getTime() + duration);
      }
      
      await updateJob(jobId, {
        startDate: newDate.toISOString(),
        endDate: newEndDate ? newEndDate.toISOString() : null
      });
      
      setSnackbar({
        open: true,
        message: 'Job rescheduled successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to reschedule job: ${err}`,
        severity: 'error',
      });
    }
  };

  // Handle employee assignment
  const handleEmployeeAssign = async (jobId: string, employeeId: string) => {
    try {
      await updateJob(jobId, { assignedToId: employeeId });
      
      setSnackbar({
        open: true,
        message: 'Job assigned successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: `Failed to assign job: ${err}`,
        severity: 'error',
      });
    }
  };

  // Handle opening route optimizer
  const handleOpenRouteOptimizer = () => {
    setRouteOptimizerOpen(true);
  };

  // Handle closing route optimizer
  const handleCloseRouteOptimizer = () => {
    setRouteOptimizerOpen(false);
  };

  if (status === "loading") return <div>Loading...</div>;

  return (
    <Layout>
      <Box sx={{ height: 'calc(100vh - 80px)', display: 'flex', flexDirection: 'column' }}>
        <ScheduleToolbar 
          currentDate={currentDate}
          setCurrentDate={setCurrentDate}
          viewType={viewType}
          setViewType={setViewType}
          openNewJobDialog={() => {
            setEditingJob(null);
            setOpenJobDialog(true);
          }}
          openNewTaskDialog={() => {
            setEditingTask(null);
            setOpenTaskDialog(true);
          }}
          openRouteOptimizer={handleOpenRouteOptimizer}
          users={users as any}
          clients={clients}
          filters={filters}
          setFilters={setFilters}
        />
      
        <Box sx={{ 
          display: 'flex', 
          flexGrow: 1,
          height: 'calc(100% - 100px)',
          gap: 2
        }}>
          {/* Staff panel */}
          {viewType !== 'list' && (
            <Box sx={{ width: 260, display: { xs: 'none', lg: 'block' } }}>
              <StaffPanel 
                jobs={filteredJobs}
                users={users as any}
                currentDate={currentDate}
                selectedEmployee={filters.employeeId}
                setSelectedEmployee={(id) => setFilters({ ...filters, employeeId: id })}
                onDrop={handleEmployeeDrop}
                isDragging={isDragging}
                openRouteOptimizer={handleOpenRouteOptimizer}
              />
            </Box>
          )}
          
          {/* Main schedule area */}
          <Box sx={{ flexGrow: 1, overflow: 'hidden' }}>
            {viewType === 'list' ? (
              <ListView 
                jobs={filteredJobs}
                onJobClick={handleJobClick}
                onEditJob={handleJobClick}
                onDeleteJob={handleDeleteJob}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
              />
            ) : (
              <CalendarView 
                jobs={filteredJobs}
                viewType={viewType}
                currentDate={currentDate}
                onDayClick={handleDayClick}
                onJobClick={handleJobClick}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
                onDrop={handleDateDrop}
                isDragging={isDragging}
                draggedJob={draggedJob}
              />
            )}
          </Box>
        </Box>
      </Box>
      
      {/* Job Form */}
      <JobForm 
        open={openJobDialog}
        onClose={() => setOpenJobDialog(false)}
        onSubmit={handleSubmitJob}
        initialData={editingJob}
        users={users}
        clients={clients}
        selectedDate={selectedDate}
        allJobs={jobs}
        isEdit={!!editingJob}
      />
      
      {/* Task Form */}
      <TaskForm 
        open={openTaskDialog}
        onClose={() => setOpenTaskDialog(false)}
        onSubmit={handleSubmitTask}
        initialData={editingTask}
        users={users}
        selectedDate={selectedDate}
        isEdit={!!editingTask}
      />

      {/* Route Optimizer Dialog */}
      <Dialog
        open={routeOptimizerOpen}
        onClose={handleCloseRouteOptimizer}
        fullWidth
        maxWidth="lg"
        sx={{
          '& .MuiDialog-paper': {
            height: '90vh',
          }
        }}
      >
        <DialogTitle sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', p: 2 }}>
          <Typography variant="h6">Route Optimization</Typography>
          <IconButton onClick={handleCloseRouteOptimizer}>
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        <DialogContent dividers sx={{ p: 0 }}>
          <RouteOptimizer
            jobs={jobs}
            employees={users}
            currentDate={currentDate}
          />
        </DialogContent>
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert 
          onClose={() => setSnackbar({ ...snackbar, open: false })} 
          severity={snackbar.severity} 
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 