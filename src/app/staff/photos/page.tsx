'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Card,
  CardContent,
  CardMedia,
  CardActionArea,
  Button,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  Badge,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Snackbar
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  CalendarToday as CalendarIcon,
  ArrowBack as ArrowBackIcon,
  Add as AddIcon,
  DateRange as DateIcon,
  AddPhotoAlternate,
  Delete
} from '@mui/icons-material';
import { format, isToday, isYesterday } from 'date-fns';
import StaffLayout from '@/components/StaffLayout';
import { JobStatus, PhotoType } from '@prisma/client';

// Interface for photo data
interface Photo {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
  createdAt: string;
  photoType: 'BEFORE' | 'AFTER' | 'PROGRESS' | 'OTHER';
  jobId: string;
  uploader: {
    name: string;
  };
}

// Extended Job interface with photos
interface JobWithPhotos {
  id: string;
  title: string;
  status: JobStatus;
  startDate: string | null;
  client: {
    name: string;
  } | null;
  photos: Photo[];
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}

export default function StaffPhotos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [photoDialogOpen, setPhotoDialogOpen] = useState(false);
  const [snackbar, setSnackbar] = useState({
    open: false,
    message: '',
    severity: 'success' as 'success' | 'error' | 'info' | 'warning',
  });

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchJobPhotos();
    }
  }, [status, tabValue]);

  const fetchJobPhotos = async () => {
    setLoading(true);
    setError(null);
    
    try {
      // First, check if we should use staff or photos endpoint
      try {
        const debugResponse = await fetch('/api/debug');
        if (debugResponse.ok) {
          console.log('API Debug info:', await debugResponse.json());
        }
      } catch (e) {
        console.error('Debug endpoint error:', e);
      }
      
      // The 'hasPhotos' parameter will filter jobs based on whether they have photos
      const hasPhotos = tabValue === 0 ? 'true' : tabValue === 1 ? 'false' : null;
      
      // Try regular photos endpoint first
      const baseUrl = '/api/photos';
      const url = hasPhotos !== null 
        ? `${baseUrl}?jobId=${session?.user?.id}&hasPhotos=${hasPhotos}`
        : baseUrl;
        
      console.log('Fetching from URL:', url);
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error(`Error: ${response.status}`);
      }
      
      const data = await response.json();
      console.log('Fetched data:', data);
      setJobs(data);
    } catch (err) {
      console.error('Failed to fetch job photos:', err);
      setError('Failed to load photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhotoClick = (photo: Photo) => {
    setSelectedPhoto(photo);
    setPhotoDialogOpen(true);
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }
    
    try {
      const response = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      // Update UI
      setJobs(prevJobs => 
        prevJobs.map(job => ({
          ...job,
          photos: job.photos.filter(photo => photo.id !== photoId)
        }))
      );
      
      // Close dialog if the deleted photo was being viewed
      if (selectedPhoto?.id === photoId) {
        setPhotoDialogOpen(false);
      }
      
      setSnackbar({
        open: true,
        message: 'Photo deleted successfully',
        severity: 'success',
      });
    } catch (err) {
      console.error('Error deleting photo:', err);
      setSnackbar({
        open: true,
        message: 'Failed to delete photo',
        severity: 'error',
      });
    }
  };

  const handleTabChange = (_event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const getStatusColor = (status: JobStatus) => {
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

  // Filter jobs based on tab selection
  const filteredJobs = () => {
    if (tabValue === 0) return jobs; // All jobs
    if (tabValue === 1) return jobs.filter(job => job.photos.length > 0); // Jobs with photos
    return jobs.filter(job => job.photos.length === 0); // Jobs without photos
  };

  // Group photos by date for a job
  const getPhotosByDate = (photos: Photo[]) => {
    const photosByDate = new Map();
    
    // Sort photos by createdAt (newest first)
    const sortedPhotos = [...photos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Group photos by date
    sortedPhotos.forEach(photo => {
      const photoDate = new Date(photo.createdAt).toISOString().split('T')[0];
      if (!photosByDate.has(photoDate)) {
        photosByDate.set(photoDate, []);
      }
      photosByDate.get(photoDate).push(photo);
    });
    
    return photosByDate;
  };

  // Format date for display
  const formatDateHeading = (dateStr: string) => {
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  // Get latest photo date for a job
  const getLatestPhotoDate = (photos: Photo[]) => {
    if (photos.length === 0) return null;
    
    const dates = photos.map(photo => new Date(photo.createdAt).getTime());
    const latestTimestamp = Math.max(...dates);
    return new Date(latestTimestamp);
  };

  // For demo purposes, we'll show placeholder data if no real data is available
  const showPlaceholderData = jobs.length === 0 && !loading && !error;

  if (status === 'loading' || loading) {
    return (
      <StaffLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <Box sx={{ p: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Daily Job Photos</Typography>
          <Button 
            variant="contained" 
            startIcon={<DateIcon />}
            onClick={() => router.push('/staff/schedule')}
          >
            View Job Schedule
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="fullWidth"
          >
            <Tab label="All Jobs" />
            <Tab label="With Photos" />
            <Tab label="Need Photos" />
          </Tabs>
        </Paper>

        {error && (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        )}

        <Grid container spacing={3}>
          {showPlaceholderData ? (
            // Placeholder content for demonstration
            <Grid item xs={12}>
              <Alert severity="info" sx={{ mb: 3 }}>
                No jobs with photos found. Record your daily work by adding photos to your jobs.
              </Alert>
              
              <Typography variant="h6" gutterBottom>
                How to add daily job photos:
              </Typography>
              
              <Box component="ol" sx={{ pl: 2 }}>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    Open a job from your schedule
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    Click the "Add Daily Photos" button
                  </Typography>
                </Box>
                <Box component="li" sx={{ mb: 1 }}>
                  <Typography>
                    Take or upload photos of your work that day
                  </Typography>
                </Box>
                <Box component="li">
                  <Typography>
                    Add a description and submit
                  </Typography>
                </Box>
              </Box>
              
              <Box sx={{ mt: 3, display: 'flex', justifyContent: 'center' }}>
                <Button 
                  variant="contained" 
                  startIcon={<CalendarIcon />}
                  onClick={() => router.push('/staff/schedule')}
                  sx={{ mr: 2 }}
                >
                  Go to My Schedule
                </Button>
              </Box>
            </Grid>
          ) : (
            filteredJobs().map((job) => {
              // Get photos grouped by date
              const photosByDate = getPhotosByDate(job.photos);
              const latestPhotoDate = getLatestPhotoDate(job.photos);
              
              return (
              <Grid item xs={12} key={job.id}>
                <Card sx={{ mb: 3, borderRadius: 2 }}>
                  <CardContent>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 2 }}>
                      <Box>
                        <Typography variant="h6">{job.title}</Typography>
                        <Typography variant="body2" color="text.secondary">
                          Client: {job.client?.name || 'No client'}
                        </Typography>
                        {job.assignedTo && session?.user?.role !== 'STAFF' && (
                          <Typography variant="body2" color="text.secondary">
                            Assigned to: {job.assignedTo.name}
                          </Typography>
                        )}
                        {job.startDate && (
                          <Typography variant="body2" color="text.secondary">
                            Job Date: {format(new Date(job.startDate), 'MMM d, yyyy')}
                          </Typography>
                        )}
                        {latestPhotoDate && (
                          <Typography variant="body2" fontWeight="medium" color="primary.main">
                            Latest photos: {format(latestPhotoDate, 'MMM d, yyyy')}
                          </Typography>
                        )}
                      </Box>
                      <Box>
                        <Chip 
                          label={job.status.replace('_', ' ')} 
                          color={getStatusColor(job.status)}
                          size="small"
                          sx={{ mb: 1 }}
                        />
                        <Button
                          size="small"
                          variant="contained"
                          startIcon={<CameraIcon />}
                          onClick={() => router.push(`/staff/jobs/${job.id}/photos`)}
                          sx={{ display: 'block' }}
                        >
                          Add Daily Photos
                        </Button>
                      </Box>
                    </Box>

                    {job.photos.length > 0 ? (
                      <>
                        <Divider sx={{ mb: 2 }} />
                        <Typography variant="subtitle2" gutterBottom>
                          {job.photos.length} {job.photos.length === 1 ? 'Photo' : 'Photos'} from {photosByDate.size} {photosByDate.size === 1 ? 'Day' : 'Days'}
                        </Typography>
                        
                        {/* Display photos grouped by date */}
                        {Array.from(photosByDate.entries()).slice(0, 2).map(([date, photos]) => (
                          <Box key={date} sx={{ mb: 3 }}>
                            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                              <DateIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                              <Typography variant="body2" color="text.secondary" fontWeight="medium">
                                {formatDateHeading(date)}
                              </Typography>
                            </Box>
                            
                            <Grid container spacing={1}>
                              {photos.slice(0, 4).map((photo) => (
                                <Grid item xs={6} sm={3} key={photo.id}>
                                  <Card sx={{ height: '100%' }}>
                                    <CardActionArea 
                                      onClick={() => handlePhotoClick(photo)}
                                      sx={{ height: '100%' }}
                                    >
                                      <CardMedia
                                        component="img"
                                        image={photo.url}
                                        alt={photo.caption || "Job photo"}
                                        sx={{ 
                                          height: 120, 
                                          objectFit: 'cover' 
                                        }}
                                      />
                                      <CardContent sx={{ p: 1 }}>
                                        <Typography variant="caption" color="text.secondary">
                                          {photo.photoType.charAt(0) + photo.photoType.slice(1).toLowerCase()}
                                        </Typography>
                                      </CardContent>
                                    </CardActionArea>
                                  </Card>
                                </Grid>
                              ))}
                            </Grid>
                          </Box>
                        ))}
                        
                        {photosByDate.size > 2 && (
                          <Box sx={{ display: 'flex', justifyContent: 'center', mt: 1 }}>
                            <Button 
                              size="small" 
                              onClick={() => router.push(`/staff/jobs/${job.id}/photos`)}
                            >
                              View all {photosByDate.size} days of photos
                            </Button>
                          </Box>
                        )}
                      </>
                    ) : (
                      <Alert severity="info" sx={{ mt: 1 }}>
                        No daily photos added for this job yet.
                      </Alert>
                    )}
                  </CardContent>
                </Card>
              </Grid>
            )})
          )}
        </Grid>
      </Box>

      {/* Photo Detail Dialog */}
      <Dialog
        open={photoDialogOpen}
        onClose={() => setPhotoDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPhoto && (
          <>
            <DialogContent sx={{ p: 2 }}>
              <img 
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || selectedPhoto.fileName}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="subtitle1">
                  {selectedPhoto.caption || selectedPhoto.fileName}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Type: {selectedPhoto.photoType.replace(/_/g, ' ')}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Added by: {selectedPhoto.uploader.name} on {new Date(selectedPhoto.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setPhotoDialogOpen(false)}>
                Close
              </Button>
              <Button 
                startIcon={<Delete />}
                color="error"
                onClick={() => handleDeletePhoto(selectedPhoto.id)}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      
      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </StaffLayout>
  );
} 