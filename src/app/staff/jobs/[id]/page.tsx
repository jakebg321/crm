'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useSession } from 'next-auth/react';
import {
  Box,
  Typography,
  Paper,
  Chip,
  Button,
  TextField,
  Grid,
  Divider,
  CircularProgress,
  Alert,
  IconButton,
  Card,
  CardContent,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Stepper,
  Step,
  StepLabel,
  StepContent,
  FormControlLabel,
  Checkbox,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  InputAdornment,
} from '@mui/material';
import {
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Directions as DirectionsIcon,
  PhotoCamera as CameraIcon,
  Edit as EditIcon,
  Check as CheckIcon,
  Send as SendIcon,
  Phone as PhoneIcon,
  Person as PersonIcon,
  EventNote as EventNoteIcon,
  DeleteOutline as DeleteIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format } from 'date-fns';
import StaffLayout from '@/components/StaffLayout';
import { JobStatus, JobType } from '@prisma/client';

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: JobStatus;
  type: JobType | null;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  client: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
    phone: string;
    email: string;
  } | null;
  notes: Note[];
}

interface Note {
  id: string;
  content: string;
  completed: boolean;
  createdAt: string;
  completedAt: string | null;
}

export default function StaffJobDetail() {
  const { data: session, status } = useSession();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [note, setNote] = useState('');
  const [addingNote, setAddingNote] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [openStatusDialog, setOpenStatusDialog] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<JobStatus | ''>('');
  const [notesExpanded, setNotesExpanded] = useState(true);
  
  // Fetch job details when component mounts
  useEffect(() => {
    if (status === 'authenticated') {
      fetchJobDetails();
    }
  }, [status, jobId]);

  const fetchJobDetails = async () => {
    try {
      setLoading(true);
      // Use the main schedule API endpoint instead of the staff endpoint
      const response = await fetch(`/api/schedule/${jobId}`);
      
      if (!response.ok) {
        throw new Error(`Failed to fetch job details: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched job details:', data);
      setJob(data);
      setSelectedStatus(data.status);
    } catch (err) {
      console.error('Error fetching job details:', err);
      setError('Failed to load job details. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleAddNote = async () => {
    if (!note.trim()) return;
    
    try {
      setAddingNote(true);
      const response = await fetch(`/api/schedule/${jobId}/notes`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ content: note }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to add note: ${response.status}`);
      }
      
      const newNote = await response.json();
      console.log('Added note:', newNote);
      setJob(prevJob => {
        if (!prevJob) return null;
        return {
          ...prevJob,
          notes: [newNote, ...prevJob.notes],
        };
      });
      setNote('');
    } catch (err) {
      console.error('Error adding note:', err);
    } finally {
      setAddingNote(false);
    }
  };

  const handleStatusChange = async () => {
    if (!selectedStatus || selectedStatus === job?.status) {
      setOpenStatusDialog(false);
      return;
    }
    
    try {
      setUpdatingStatus(true);
      // Use the main schedule API endpoint instead
      const response = await fetch(`/api/schedule/${jobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status: selectedStatus }),
      });
      
      if (!response.ok) {
        throw new Error(`Failed to update job status: ${response.status}`);
      }
      
      const updatedJob = await response.json();
      console.log('Updated job:', updatedJob);
      setJob(prevJob => {
        if (!prevJob) return null;
        return {
          ...prevJob,
          status: updatedJob.status,
        };
      });
      setOpenStatusDialog(false);
    } catch (err) {
      console.error('Error updating job status:', err);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handleOpenStatusDialog = () => {
    setSelectedStatus(job?.status || '');
    setOpenStatusDialog(true);
  };

  const getMapUrl = () => {
    if (!job?.client) return '';
    const address = encodeURIComponent(
      `${job.client.address}, ${job.client.city}, ${job.client.state} ${job.client.zipCode}`
    );
    return `https://www.google.com/maps/dir/?api=1&destination=${address}`;
  };

  const getStatusChipColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.PENDING:
        return 'default';
      case JobStatus.SCHEDULED:
        return 'primary';
      case JobStatus.IN_PROGRESS:
        return 'warning';
      case JobStatus.COMPLETED:
        return 'success';
      case JobStatus.CANCELLED:
        return 'error';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <StaffLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </StaffLayout>
    );
  }

  if (error || !job) {
    return (
      <StaffLayout>
        <Box sx={{ p: 2 }}>
          <Button 
            startIcon={<ArrowBackIcon />} 
            onClick={() => router.push('/staff/dashboard')}
            sx={{ mb: 2 }}
          >
            Back to Dashboard
          </Button>
          <Alert severity="error">{error || 'Job not found'}</Alert>
        </Box>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <Box>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        {/* Job Header */}
        <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
            <Typography variant="h5" component="h1">
              {job.title}
            </Typography>
            <Chip 
              label={job.status.replace('_', ' ')} 
              color={getStatusChipColor(job.status)}
            />
          </Box>
          
          <Typography variant="body1" color="text.secondary" paragraph>
            {job.description}
          </Typography>
          
          <Grid container spacing={2} sx={{ mb: 2 }}>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  {job.startDate 
                    ? format(new Date(job.startDate), 'EEEE, MMMM d, yyyy h:mm a') 
                    : 'No start time specified'}
                </Typography>
              </Box>
              {job.endDate && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    End: {format(new Date(job.endDate), 'h:mm a')}
                  </Typography>
                </Box>
              )}
            </Grid>
            <Grid item xs={12} sm={6}>
              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                <PersonIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                <Typography variant="body2" color="text.secondary">
                  Client: {job.client?.name || 'No client specified'}
                </Typography>
              </Box>
              {job.type && (
                <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                  <EventNoteIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    Type: {job.type.replace(/_/g, ' ')}
                  </Typography>
                </Box>
              )}
            </Grid>
          </Grid>
          
          <Divider sx={{ my: 2 }} />
          
          {/* Action Buttons */}
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button 
                variant="contained" 
                color="primary"
                fullWidth
                startIcon={<EditIcon />}
                onClick={handleOpenStatusDialog}
                disabled={job.status === JobStatus.COMPLETED || job.status === JobStatus.CANCELLED}
              >
                Update Status
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button
                variant="outlined"
                color="secondary"
                fullWidth
                startIcon={<CameraIcon />}
                onClick={() => router.push(`/staff/jobs/${jobId}/photos`)}
              >
                Add Photos
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {/* Client Details */}
        {job.client && (
          <Paper sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <Typography variant="h6" gutterBottom>
              Client Details
            </Typography>
            
            <Grid container spacing={2}>
              <Grid item xs={12} sm={6}>
                <Typography variant="body2" color="text.secondary">
                  <strong>Name:</strong> {job.client.name}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Email:</strong> {job.client.email}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  <strong>Phone:</strong> {job.client.phone}
                </Typography>
              </Grid>
              <Grid item xs={12} sm={6}>
                <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                  <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.25, color: 'text.secondary' }} />
                  <Typography variant="body2" color="text.secondary">
                    {job.client.address}<br />
                    {job.client.city}, {job.client.state} {job.client.zipCode}
                  </Typography>
                </Box>
              </Grid>
            </Grid>
            
            <Box sx={{ mt: 2, display: 'flex', gap: 2 }}>
              <Button
                variant="contained"
                color="success"
                startIcon={<DirectionsIcon />}
                onClick={() => window.open(getMapUrl(), '_blank')}
              >
                Get Directions
              </Button>
              <Button
                variant="outlined"
                startIcon={<PhoneIcon />}
                onClick={() => window.open(`tel:${job.client.phone}`, '_blank')}
              >
                Call Client
              </Button>
            </Box>
          </Paper>
        )}
        
        {/* Job Notes */}
        <Paper sx={{ p: 3, borderRadius: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              cursor: 'pointer',
              mb: notesExpanded ? 2 : 0,
            }}
            onClick={() => setNotesExpanded(!notesExpanded)}
          >
            <Typography variant="h6">
              Notes & Updates
            </Typography>
            {notesExpanded ? 
              <IconButton size="small">-</IconButton> : 
              <IconButton size="small">+</IconButton>
            }
          </Box>
          
          {notesExpanded && (
            <>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  multiline
                  rows={3}
                  placeholder="Add a note or update about this job..."
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                  disabled={addingNote}
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="end">
                        <IconButton 
                          onClick={handleAddNote}
                          disabled={!note.trim() || addingNote}
                          color="primary"
                        >
                          <SendIcon />
                        </IconButton>
                      </InputAdornment>
                    ),
                  }}
                />
              </Box>
              
              {job.notes.length > 0 ? (
                <Box>
                  {job.notes.map((note) => (
                    <Card key={note.id} sx={{ mb: 2, borderLeft: '4px solid', borderColor: 'primary.main' }}>
                      <CardContent sx={{ pb: 1 }}>
                        <Typography variant="body1">
                          {note.content}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {format(new Date(note.createdAt), 'MMM d, yyyy h:mm a')}
                        </Typography>
                      </CardContent>
                    </Card>
                  ))}
                </Box>
              ) : (
                <Alert severity="info">No notes added yet</Alert>
              )}
            </>
          )}
        </Paper>
        
        {/* Job Photos */}
        <Paper sx={{ p: 3, mt: 3, borderRadius: 2 }}>
          <Box 
            sx={{ 
              display: 'flex', 
              justifyContent: 'space-between', 
              alignItems: 'center',
              mb: 2,
            }}
          >
            <Typography variant="h6">
              Job Photos
            </Typography>
          </Box>
          
          <Box sx={{ minHeight: '200px' }}>
            <iframe 
              src={`/jobs/${jobId}/photos`} 
              style={{ 
                width: '100%', 
                height: '600px', 
                border: 'none', 
                borderRadius: '8px',
                backgroundColor: '#f5f5f5'
              }}
              title="Job Photos"
            />
          </Box>
        </Paper>
      </Box>
      
      {/* Status Update Dialog */}
      <Dialog open={openStatusDialog} onClose={() => setOpenStatusDialog(false)}>
        <DialogTitle>Update Job Status</DialogTitle>
        <DialogContent>
          <Box sx={{ py: 2 }}>
            <FormControl fullWidth>
              <InputLabel id="status-label">Status</InputLabel>
              <Select
                labelId="status-label"
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value as JobStatus)}
                label="Status"
              >
                <MenuItem value={JobStatus.PENDING}>Pending</MenuItem>
                <MenuItem value={JobStatus.SCHEDULED}>Scheduled</MenuItem>
                <MenuItem value={JobStatus.IN_PROGRESS}>In Progress</MenuItem>
                <MenuItem value={JobStatus.COMPLETED}>Completed</MenuItem>
                <MenuItem value={JobStatus.CANCELLED}>Cancelled</MenuItem>
              </Select>
            </FormControl>
            
            {selectedStatus === JobStatus.COMPLETED && (
              <Box sx={{ mt: 2 }}>
                <Typography variant="body2" gutterBottom>
                  Completing this job will:
                </Typography>
                <ul style={{ paddingLeft: '1.5rem', margin: '0.5rem 0' }}>
                  <li><Typography variant="body2">Mark the job as finished</Typography></li>
                  <li><Typography variant="body2">Record completion time</Typography></li>
                  <li><Typography variant="body2">Notify the office of completion</Typography></li>
                </ul>
                <FormControlLabel
                  control={<Checkbox />}
                  label="I confirm that all work is complete"
                />
              </Box>
            )}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenStatusDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleStatusChange}
            disabled={updatingStatus || selectedStatus === job.status}
          >
            {updatingStatus ? 'Updating...' : 'Update Status'}
          </Button>
        </DialogActions>
      </Dialog>
    </StaffLayout>
  );
} 