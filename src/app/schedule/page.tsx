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
  Tooltip,
  Avatar,
  AvatarGroup,
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Add as AddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import Layout from '@/components/Layout';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import { useSession } from "next-auth/react";
import { UserRole, JobStatus, JobType } from '@prisma/client';

const MotionPaper = motion(Paper);

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

export default function Schedule() {
  const theme = useTheme();
  const router = useRouter();
  const { status } = useSession();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openDialog, setOpenDialog] = useState(false);
  const [selectedDate, setSelectedDate] = useState<Date | null>(null);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
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
    fetchUsers();
    fetchClients();
  }, [currentDate, selectedEmployee]);

  const fetchJobs = async () => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      let url = `/api/schedule?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`;
      if (selectedEmployee) {
        url += `&employeeId=${selectedEmployee}`;
      }
      
      const response = await fetch(url);
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

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Failed to fetch employees:', err);
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error('Failed to fetch clients:', err);
    }
  };

  const handleAddJob = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: formData.price ? parseFloat(formData.price) : null,
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
        message: err instanceof Error ? err.message : 'Failed to add job',
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
    return jobs.filter(job => job.startDate && isSameDay(parseISO(job.startDate), date));
  };
  
  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.SCHEDULED:
        return theme.palette.info.main;
      case JobStatus.IN_PROGRESS:
        return theme.palette.warning.main;
      case JobStatus.COMPLETED:
        return theme.palette.success.main;
      case JobStatus.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  const handleDayClick = (date: Date) => {
    setSelectedDate(date);
    setFormData(prev => ({
      ...prev,
      startDate: format(date, "yyyy-MM-dd'T'HH:mm"),
    }));
    setOpenDialog(true);
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
          <Box sx={{ display: 'flex', gap: 2 }}>
            <FormControl sx={{ minWidth: 200 }}>
              <InputLabel>Filter by Employee</InputLabel>
              <Select
                value={selectedEmployee}
                label="Filter by Employee"
                onChange={(e) => setSelectedEmployee(e.target.value)}
                displayEmpty
              >
                <MenuItem value="">All Employees</MenuItem>
                {users.map((user) => (
                  <MenuItem key={user.id} value={user.id}>
                    {user.name}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
            <Button 
              variant="contained"
              startIcon={<AddIcon />}
              onClick={() => {
                setSelectedDate(null);
                setOpenDialog(true);
              }}
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
        </Box>

        <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
          <IconButton onClick={handlePreviousMonth}>
            <ChevronLeftIcon />
          </IconButton>
          <Typography variant="h6" sx={{ mx: 2 }}>
            {format(currentDate, 'MMMM yyyy')}
          </Typography>
          <IconButton onClick={handleNextMonth}>
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
                  whileHover={{ scale: 1.02 }}
                  sx={{
                    p: 1,
                    minHeight: 120,
                    cursor: 'pointer',
                    bgcolor: isCurrentDay 
                      ? alpha(theme.palette.primary.main, 0.1)
                      : isCurrentMonth 
                        ? theme.palette.background.paper 
                        : alpha(theme.palette.grey[500], 0.1),
                    border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : 'none',
                  }}
                  onClick={() => handleDayClick(day)}
                >
                  <Typography
                    variant="body2"
                    sx={{
                      color: isCurrentDay 
                        ? theme.palette.primary.main 
                        : isCurrentMonth 
                          ? theme.palette.text.primary 
                          : theme.palette.text.disabled,
                      fontWeight: isCurrentDay ? 700 : 400,
                    }}
                  >
                    {format(day, 'd')}
                  </Typography>
                  
                  <Box sx={{ mt: 1 }}>
                    {dayJobs.map((job) => (
                      <Tooltip 
                        key={job.id}
                        title={
                          <Box>
                            <Typography variant="subtitle2">{job.title}</Typography>
                            {job.assignedTo && (
                              <Typography variant="caption">
                                Assigned to: {job.assignedTo.name}
                              </Typography>
                            )}
                          </Box>
                        }
                      >
                        <Chip
                          label={job.title}
                          size="small"
                          sx={{
                            mb: 0.5,
                            width: '100%',
                            justifyContent: 'flex-start',
                            bgcolor: getStatusColor(job.status),
                            color: 'white',
                            '&:hover': {
                              bgcolor: alpha(getStatusColor(job.status), 0.8),
                            },
                          }}
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/jobs/${job.id}`);
                          }}
                        />
                      </Tooltip>
                    ))}
                  </Box>
                </MotionPaper>
              </Grid>
            );
          })}
        </Grid>

        <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
          <DialogTitle>
            {selectedDate ? `Add Job for ${format(selectedDate, 'MMMM d, yyyy')}` : 'Add New Job'}
          </DialogTitle>
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
                helperText="Optional"
              />
              <FormControl>
                <InputLabel>Type</InputLabel>
                <Select
                  value={formData.type}
                  label="Type"
                  onChange={(e) => setFormData(prev => ({ ...prev, type: e.target.value }))}
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {Object.values(JobType).map((type) => (
                    <MenuItem key={type} value={type}>
                      {type.replace(/_/g, ' ')}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">Optional</Typography>
              </FormControl>
              
              <TextField
                label="Start Date"
                type="datetime-local"
                value={formData.startDate}
                onChange={(e) => setFormData(prev => ({ ...prev, startDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Optional"
              />
              <TextField
                label="End Date"
                type="datetime-local"
                value={formData.endDate}
                onChange={(e) => setFormData(prev => ({ ...prev, endDate: e.target.value }))}
                InputLabelProps={{ shrink: true }}
                helperText="Optional"
              />
              <TextField
                label="Price"
                type="number"
                value={formData.price}
                onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))}
                helperText="Optional"
              />
              <FormControl fullWidth>
                <InputLabel>Client</InputLabel>
                <Select
                  value={formData.clientId}
                  label="Client"
                  onChange={(e) => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {clients.map((client) => (
                    <MenuItem key={client.id} value={client.id}>
                      {client.name}
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">Optional</Typography>
              </FormControl>
              <FormControl fullWidth>
                <InputLabel>Assign To</InputLabel>
                <Select
                  value={formData.assignedToId}
                  label="Assign To"
                  onChange={(e) => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))}
                  displayEmpty
                >
                  <MenuItem value=""><em>None</em></MenuItem>
                  {users.map((user) => (
                    <MenuItem key={user.id} value={user.id}>
                      <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                        <Avatar sx={{ width: 24, height: 24 }}>
                          <PersonIcon />
                        </Avatar>
                        <Box>
                          <Typography variant="body2">{user.name}</Typography>
                          <Typography variant="caption" color="text.secondary">
                            {user.role}
                          </Typography>
                        </Box>
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
                <Typography variant="caption" color="text.secondary">Optional</Typography>
              </FormControl>
            </Box>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleAddJob}
              disabled={!formData.title}
            >
              Add Job
            </Button>
          </DialogActions>
        </Dialog>

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
      </Box>
    </Layout>
  );
} 