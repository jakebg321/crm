'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useParams, useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardMedia,
  Chip,
  CircularProgress,
  Alert,
  Tabs,
  Tab,
  Divider,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  DateRange as DateIcon,
  Person as PersonIcon,
  Close as CloseIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday, parseISO } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';
import { JobStatus, PhotoType } from '@prisma/client';

// Interface for photo data
interface Photo {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
  createdAt: string;
  photoType: PhotoType;
  jobId: string;
  uploader: {
    name: string;
  };
}

// Job interface
interface Job {
  id: string;
  title: string;
  status: JobStatus;
  startDate: string | null;
  client: {
    name: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  photos: Photo[];
}

export default function AdminJobPhotos() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [viewImageDialog, setViewImageDialog] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      // Ensure only admins and managers can access this page
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        router.push('/');
        return;
      }
      fetchJobWithPhotos();
    }
  }, [sessionStatus, jobId, session]);

  const fetchJobWithPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch(`/api/staff/jobs/${jobId}/photos`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch job photos');
      }
      
      const data = await response.json();
      setJob(data);
    } catch (err) {
      console.error('Error fetching job photos:', err);
      setError('Failed to load job photos. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewImageDialog(true);
  };

  const handleCloseViewDialog = () => {
    setViewImageDialog(false);
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const response = await fetch(`/api/staff/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      // Refresh the job data to reflect the deletion
      await fetchJobWithPhotos();
      setDeleteConfirmOpen(false);
    } catch (err) {
      console.error('Error deleting photo:', err);
      alert('Failed to delete photo. Please try again.');
    }
  };

  // Group photos by date
  const getPhotosByDate = () => {
    if (!job || !job.photos) return new Map();
    
    const photosByDate = new Map();
    
    // Sort photos by createdAt (newest first)
    const sortedPhotos = [...job.photos].sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
    
    // Group photos by date
    sortedPhotos.forEach(photo => {
      // Get the date portion of the createdAt timestamp
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
    const date = parseISO(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  const getPhotoTypeColor = (photoType: PhotoType) => {
    switch (photoType) {
      case PhotoType.BEFORE:
        return 'info';
      case PhotoType.PROGRESS:
        return 'warning';
      case PhotoType.AFTER:
        return 'success';
      default:
        return 'default';
    }
  };

  if (loading) {
    return (
      <AdminLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </AdminLayout>
    );
  }

  if (error || !job) {
    return (
      <AdminLayout>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{error || 'Job not found'}</Alert>
      </AdminLayout>
    );
  }

  const photosByDate = getPhotosByDate();

  return (
    <AdminLayout>
      <Box>
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5">{job.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Client: {job.client?.name || 'No client'}
            </Typography>
            {job.assignedTo && (
              <Typography variant="body2" color="text.secondary">
                Assigned to: {job.assignedTo.name}
              </Typography>
            )}
            {job.startDate && (
              <Typography variant="body2" color="text.secondary">
                Date: {format(new Date(job.startDate), 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            onClick={() => router.push(`/admin/jobs/${jobId}`)}
          >
            View Job Details
          </Button>
        </Box>

        <Paper sx={{ mb: 3 }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            indicatorColor="primary"
            textColor="primary"
            variant="scrollable"
            scrollButtons="auto"
          >
            <Tab label="All Photos" />
            <Tab label="Before" />
            <Tab label="Progress" />
            <Tab label="After" />
            <Tab label="Other" />
          </Tabs>
        </Paper>

        {job.photos.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No photos found for this job.
          </Alert>
        ) : (
          <Box>
            {Array.from(photosByDate.entries()).map(([date, photos]) => {
              // Filter photos based on tab selection
              const filteredPhotos = tabValue === 0 
                ? photos 
                : photos.filter(photo => {
                    const photoTypes = ['BEFORE', 'PROGRESS', 'AFTER', 'OTHER'];
                    return photo.photoType === photoTypes[tabValue - 1];
                  });

              // Only show date groups that have photos after filtering
              if (filteredPhotos.length === 0) return null;

              return (
                <Box key={date} sx={{ mb: 4 }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                    <DateIcon sx={{ mr: 1, color: 'primary.main' }} />
                    <Typography variant="h6">
                      {formatDateHeading(date)}
                    </Typography>
                  </Box>
                  
                  <Grid container spacing={2}>
                    {filteredPhotos.map((photo) => (
                      <Grid item xs={12} sm={6} md={4} key={photo.id}>
                        <Card sx={{ height: '100%' }}>
                          <CardMedia
                            component="img"
                            image={photo.url}
                            alt={photo.caption || "Job photo"}
                            sx={{ 
                              height: 200, 
                              objectFit: 'cover',
                              cursor: 'pointer'
                            }}
                            onClick={() => handleViewPhoto(photo)}
                          />
                          <CardContent sx={{ pb: 1 }}>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 1 }}>
                              <Chip 
                                label={photo.photoType} 
                                color={getPhotoTypeColor(photo.photoType)}
                                size="small"
                              />
                              <IconButton 
                                size="small" 
                                color="error"
                                onClick={() => {
                                  setSelectedPhoto(photo);
                                  setDeleteConfirmOpen(true);
                                }}
                              >
                                <DeleteIcon fontSize="small" />
                              </IconButton>
                            </Box>
                            {photo.caption && (
                              <Typography variant="body2" gutterBottom>
                                {photo.caption}
                              </Typography>
                            )}
                            <Divider sx={{ my: 1 }} />
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(photo.createdAt), 'h:mm a')}
                              </Typography>
                              <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                <PersonIcon fontSize="small" sx={{ mr: 0.5, color: 'text.secondary', fontSize: 14 }} />
                                <Typography variant="caption" color="text.secondary">
                                  {photo.uploader.name}
                                </Typography>
                              </Box>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                </Box>
              );
            })}
          </Box>
        )}

        {/* View Image Dialog */}
        <Dialog
          open={viewImageDialog}
          onClose={handleCloseViewDialog}
          maxWidth="md"
          fullWidth
        >
          {selectedPhoto && (
            <>
              <DialogTitle>
                <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Typography variant="h6">
                    {selectedPhoto.photoType} Photo
                  </Typography>
                  <IconButton
                    edge="end"
                    color="inherit"
                    onClick={handleCloseViewDialog}
                    aria-label="close"
                  >
                    <CloseIcon />
                  </IconButton>
                </Box>
              </DialogTitle>
              <DialogContent>
                <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center' }}>
                  <img
                    src={selectedPhoto.url}
                    alt={selectedPhoto.caption || "Job photo"}
                    style={{
                      maxWidth: '100%',
                      maxHeight: '70vh',
                      objectFit: 'contain',
                      marginBottom: '16px'
                    }}
                  />
                  {selectedPhoto.caption && (
                    <Typography variant="body1" sx={{ mb: 2 }}>
                      {selectedPhoto.caption}
                    </Typography>
                  )}
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
                    <Typography variant="body2" color="text.secondary">
                      Uploaded by: {selectedPhoto.uploader.name}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      {format(new Date(selectedPhoto.createdAt), 'PPpp')}
                    </Typography>
                  </Box>
                </Box>
              </DialogContent>
              <DialogActions>
                <Button onClick={handleCloseViewDialog}>Close</Button>
              </DialogActions>
            </>
          )}
        </Dialog>

        {/* Delete Confirmation Dialog */}
        <Dialog
          open={deleteConfirmOpen}
          onClose={() => setDeleteConfirmOpen(false)}
        >
          <DialogTitle>Delete Photo</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete this photo? This action cannot be undone.
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setDeleteConfirmOpen(false)}>Cancel</Button>
            <Button 
              onClick={() => selectedPhoto && handleDeletePhoto(selectedPhoto.id)} 
              color="error"
            >
              Delete
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </AdminLayout>
  );
} 