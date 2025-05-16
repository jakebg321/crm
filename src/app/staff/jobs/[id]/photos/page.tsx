'use client';

import { useState, useEffect, useRef } from 'react';
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
  TextField,
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
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Snackbar,
  FormHelperText,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  ArrowBack as ArrowBackIcon,
  Delete as DeleteIcon,
  AddAPhoto as AddAPhotoIcon,
  Close as CloseIcon,
  DateRange as DateIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday, isSameDay, parseISO } from 'date-fns';
import StaffLayout from '@/components/StaffLayout';
import { JobStatus } from '@prisma/client';

// Interface for photo data
interface Photo {
  id: string;
  url: string;
  fileName: string;
  caption: string | null;
  createdAt: string;
  photoType: 'BEFORE' | 'AFTER' | 'PROGRESS' | 'OTHER';
  jobId: string;
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
  photos: Photo[];
}

export default function JobPhotos() {
  const { data: session, status: sessionStatus } = useSession();
  const params = useParams();
  const router = useRouter();
  const jobId = params.id as string;
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const [job, setJob] = useState<Job | null>(null);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [openUploadDialog, setOpenUploadDialog] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [photoType, setPhotoType] = useState<'BEFORE' | 'AFTER' | 'PROGRESS' | 'OTHER'>('PROGRESS');
  const [caption, setCaption] = useState('');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [snackbarOpen, setSnackbarOpen] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');
  const [currentDate, setCurrentDate] = useState<string>(new Date().toISOString().split('T')[0]);

  useEffect(() => {
    if (sessionStatus === 'authenticated') {
      fetchJobWithPhotos();
    }
  }, [sessionStatus, jobId]);

  const fetchJobWithPhotos = async () => {
    try {
      setLoading(true);
      // This API endpoint will need to be implemented
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

  const handleOpenUploadDialog = () => {
    setOpenUploadDialog(true);
    setSelectedFile(null);
    setPreviewUrl(null);
    setCaption('');
    setPhotoType('PROGRESS');
    setCurrentDate(new Date().toISOString().split('T')[0]);
  };

  const handleCloseUploadDialog = () => {
    setOpenUploadDialog(false);
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      const file = event.target.files[0];
      setSelectedFile(file);
      
      // Create a preview URL
      const reader = new FileReader();
      reader.onload = (e) => {
        setPreviewUrl(e.target?.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const triggerFileInput = () => {
    fileInputRef.current?.click();
  };

  const handlePhotoTypeChange = (event: any) => {
    setPhotoType(event.target.value);
  };

  const handleCaptionChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCaption(event.target.value);
  };

  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setCurrentDate(event.target.value);
  };

  const handleUploadPhoto = async () => {
    if (!selectedFile) {
      setSnackbarMessage('Please select a file first');
      setSnackbarOpen(true);
      return;
    }

    try {
      setUploading(true);
      
      // Create form data for upload
      const formData = new FormData();
      formData.append('file', selectedFile);
      formData.append('photoType', photoType);
      formData.append('caption', caption);
      formData.append('date', currentDate); // Add the selected date
      
      // This API endpoint will need to be implemented
      const response = await fetch(`/api/staff/jobs/${jobId}/photos`, {
        method: 'POST',
        body: formData,
      });
      
      if (!response.ok) {
        throw new Error('Failed to upload photo');
      }
      
      // Refresh the job data to show the new photo
      await fetchJobWithPhotos();
      
      setSnackbarMessage('Photo uploaded successfully');
      setSnackbarOpen(true);
      handleCloseUploadDialog();
    } catch (err) {
      console.error('Error uploading photo:', err);
      setSnackbarMessage('Failed to upload photo. Please try again.');
      setSnackbarOpen(true);
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!confirm('Are you sure you want to delete this photo?')) {
      return;
    }

    try {
      // This API endpoint will need to be implemented
      const response = await fetch(`/api/staff/photos/${photoId}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete photo');
      }
      
      // Refresh the job data to reflect the deletion
      await fetchJobWithPhotos();
      
      setSnackbarMessage('Photo deleted successfully');
      setSnackbarOpen(true);
    } catch (err) {
      console.error('Error deleting photo:', err);
      setSnackbarMessage('Failed to delete photo. Please try again.');
      setSnackbarOpen(true);
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
    const date = new Date(dateStr);
    if (isToday(date)) {
      return 'Today';
    } else if (isYesterday(date)) {
      return 'Yesterday';
    } else {
      return format(date, 'EEEE, MMMM d, yyyy');
    }
  };

  const handleCloseSnackbar = () => {
    setSnackbarOpen(false);
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
        <Button
          startIcon={<ArrowBackIcon />}
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        <Alert severity="error">{error || 'Job not found'}</Alert>
      </StaffLayout>
    );
  }

  const photosByDate = getPhotosByDate();

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
        
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', mb: 3 }}>
          <Box>
            <Typography variant="h5">{job.title}</Typography>
            <Typography variant="body2" color="text.secondary">
              Client: {job.client?.name || 'No client'}
            </Typography>
            {job.startDate && (
              <Typography variant="body2" color="text.secondary">
                Date: {format(new Date(job.startDate), 'MMM d, yyyy')}
              </Typography>
            )}
          </Box>
          <Button
            variant="contained"
            startIcon={<AddAPhotoIcon />}
            onClick={handleOpenUploadDialog}
          >
            Add Daily Photos
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
            No photos found. Use the "Add Daily Photos" button to upload photos documenting your work on this job.
          </Alert>
        ) : (
          <Box>
            {photosByDate.size === 0 ? (
              <Alert severity="info" sx={{ mb: 3 }}>
                No photos match the selected filter.
              </Alert>
            ) : (
              Array.from(photosByDate.entries()).map(([date, photos]) => {
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
                                objectFit: 'cover' 
                              }}
                            />
                            <CardContent sx={{ pb: 1 }}>
                              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                                <Typography variant="body2" fontWeight="bold" gutterBottom>
                                  {photo.photoType.charAt(0) + photo.photoType.slice(1).toLowerCase()}
                                </Typography>
                                <IconButton 
                                  size="small" 
                                  color="error"
                                  onClick={() => handleDeletePhoto(photo.id)}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Box>
                              {photo.caption && (
                                <Typography variant="body2" gutterBottom>
                                  {photo.caption}
                                </Typography>
                              )}
                              <Typography variant="caption" color="text.secondary">
                                {format(new Date(photo.createdAt), 'h:mm a')}
                              </Typography>
                            </CardContent>
                          </Card>
                        </Grid>
                      ))}
                    </Grid>
                  </Box>
                );
              })
            )}
          </Box>
        )}

        {/* Upload Photo Dialog */}
        <Dialog open={openUploadDialog} onClose={handleCloseUploadDialog} maxWidth="sm" fullWidth>
          <DialogTitle>
            Add Daily Work Photos
            <IconButton
              aria-label="close"
              onClick={handleCloseUploadDialog}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
              }}
            >
              <CloseIcon />
            </IconButton>
          </DialogTitle>
          <DialogContent>
            <Box sx={{ mb: 3, mt: 1 }}>
              <Typography variant="body2" color="text.secondary" gutterBottom>
                Document your daily work on this job by uploading photos at the end of each workday.
              </Typography>
            </Box>
            
            <Grid container spacing={2}>
              <Grid item xs={12}>
                <TextField
                  label="Date"
                  type="date"
                  fullWidth
                  value={currentDate}
                  onChange={handleDateChange}
                  InputLabelProps={{
                    shrink: true,
                  }}
                  helperText="Select the date when this photo was taken"
                />
              </Grid>
              
              <Grid item xs={12}>
                {previewUrl ? (
                  <Box sx={{ position: 'relative', mb: 2 }}>
                    <img
                      src={previewUrl}
                      alt="Preview"
                      style={{ 
                        width: '100%', 
                        maxHeight: '300px', 
                        objectFit: 'contain',
                        borderRadius: '4px'
                      }}
                    />
                    <IconButton
                      sx={{
                        position: 'absolute',
                        top: 8,
                        right: 8,
                        bgcolor: 'rgba(0,0,0,0.5)',
                        color: 'white',
                        '&:hover': {
                          bgcolor: 'rgba(0,0,0,0.7)',
                        }
                      }}
                      onClick={() => {
                        setSelectedFile(null);
                        setPreviewUrl(null);
                      }}
                    >
                      <CloseIcon />
                    </IconButton>
                  </Box>
                ) : (
                  <Button
                    variant="outlined"
                    startIcon={<CameraIcon />}
                    onClick={triggerFileInput}
                    fullWidth
                    sx={{ height: '100px' }}
                  >
                    Select Photo
                  </Button>
                )}
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleFileSelect}
                  style={{ display: 'none' }}
                  ref={fileInputRef}
                />
              </Grid>
              
              <Grid item xs={12}>
                <FormControl fullWidth>
                  <InputLabel id="photo-type-label">Photo Type</InputLabel>
                  <Select
                    labelId="photo-type-label"
                    value={photoType}
                    label="Photo Type"
                    onChange={handlePhotoTypeChange}
                  >
                    <MenuItem value="BEFORE">Before Work Started</MenuItem>
                    <MenuItem value="PROGRESS">Work In Progress</MenuItem>
                    <MenuItem value="AFTER">Completed Work</MenuItem>
                    <MenuItem value="OTHER">Other</MenuItem>
                  </Select>
                  <FormHelperText>Categorize what this photo shows</FormHelperText>
                </FormControl>
              </Grid>
              
              <Grid item xs={12}>
                <TextField
                  label="Description"
                  fullWidth
                  multiline
                  rows={2}
                  value={caption}
                  onChange={handleCaptionChange}
                  placeholder="Describe the work shown in this photo..."
                  helperText="Add details about what was done, materials used, etc."
                />
              </Grid>
            </Grid>
          </DialogContent>
          <DialogActions>
            <Button onClick={handleCloseUploadDialog}>Cancel</Button>
            <Button 
              variant="contained" 
              onClick={handleUploadPhoto}
              disabled={!selectedFile || uploading}
              startIcon={uploading ? <CircularProgress size={20} /> : null}
            >
              {uploading ? 'Uploading...' : 'Upload Photo'}
            </Button>
          </DialogActions>
        </Dialog>

        {/* Snackbar for notifications */}
        <Snackbar
          open={snackbarOpen}
          autoHideDuration={6000}
          onClose={handleCloseSnackbar}
          message={snackbarMessage}
          action={
            <IconButton
              size="small"
              aria-label="close"
              color="inherit"
              onClick={handleCloseSnackbar}
            >
              <CloseIcon fontSize="small" />
            </IconButton>
          }
        />
      </Box>
    </StaffLayout>
  );
} 