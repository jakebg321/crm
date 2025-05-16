'use client';

import { useState, useEffect } from 'react';
import {
  Box, Typography, Button, TextField, IconButton, Grid, Card, CardMedia, 
  CardContent, Dialog, DialogTitle, DialogContent, DialogActions,
  FormControl, InputLabel, MenuItem, Select, CircularProgress,
  CardActions, Snackbar, Alert
} from '@mui/material';
import { AddPhotoAlternate, Delete, Visibility } from '@mui/icons-material';
import { AlertColor } from '@mui/material';

interface Photo {
  id: string;
  url: string;
  fileName: string;
  caption?: string;
  photoType: string;
  createdAt: string;
  uploader?: {
    id: string;
    name: string;
  };
}

interface JobPhotosProps {
  jobId: string;
}

const PHOTO_TYPES = ['BEFORE', 'AFTER', 'PROGRESS', 'OTHER'];

export default function JobPhotos({ jobId }: JobPhotosProps) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploadDialogOpen, setUploadDialogOpen] = useState(false);
  const [viewDialogOpen, setViewDialogOpen] = useState(false);
  const [selectedPhoto, setSelectedPhoto] = useState<Photo | null>(null);
  const [uploadForm, setUploadForm] = useState({
    url: '',
    fileName: '',
    caption: '',
    photoType: 'OTHER',
  });
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: AlertColor;
  }>({
    open: false,
    message: '',
    severity: 'success',
  });
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    fetchPhotos();
  }, [jobId]);

  const fetchPhotos = async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/photos?jobId=${jobId}`);
      if (!res.ok) throw new Error('Failed to fetch photos');
      const data = await res.json();
      setPhotos(data);
    } catch (error) {
      console.error('Error fetching photos:', error);
      setSnackbar({
        open: true,
        message: 'Failed to load photos',
        severity: 'error',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setUploadForm({ ...uploadForm, [name]: value });
  };

  const handleSelectChange = (e: any) => {
    setUploadForm({ ...uploadForm, photoType: e.target.value });
  };

  const handleUploadPhoto = async () => {
    if (!uploadForm.url || !uploadForm.fileName) {
      setSnackbar({
        open: true,
        message: 'Image URL and filename are required',
        severity: 'error',
      });
      return;
    }

    setUploading(true);
    try {
      const res = await fetch('/api/photos', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...uploadForm,
          jobId,
        }),
      });

      if (!res.ok) throw new Error('Failed to upload photo');
      
      const newPhoto = await res.json();
      setPhotos([newPhoto, ...photos]);
      setUploadDialogOpen(false);
      setUploadForm({
        url: '',
        fileName: '',
        caption: '',
        photoType: 'OTHER',
      });
      setSnackbar({
        open: true,
        message: 'Photo uploaded successfully',
        severity: 'success',
      });
    } catch (error) {
      console.error('Error uploading photo:', error);
      setSnackbar({
        open: true,
        message: 'Failed to upload photo',
        severity: 'error',
      });
    } finally {
      setUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    try {
      const res = await fetch(`/api/photos/${photoId}`, {
        method: 'DELETE',
      });
      if (!res.ok) throw new Error('Failed to delete photo');
      
      setPhotos(photos.filter(photo => photo.id !== photoId));
      setSnackbar({
        open: true,
        message: 'Photo deleted successfully',
        severity: 'success',
      });
      
      if (viewDialogOpen && selectedPhoto?.id === photoId) {
        setViewDialogOpen(false);
      }
    } catch (error) {
      console.error('Error deleting photo:', error);
      setSnackbar({
        open: true,
        message: 'Failed to delete photo',
        severity: 'error',
      });
    }
  };

  const handleViewPhoto = (photo: Photo) => {
    setSelectedPhoto(photo);
    setViewDialogOpen(true);
  };

  return (
    <Box sx={{ mt: 4 }}>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h5">Job Photos</Typography>
        <Button 
          variant="contained" 
          startIcon={<AddPhotoAlternate />} 
          onClick={() => setUploadDialogOpen(true)}
        >
          Add Photo
        </Button>
      </Box>

      {loading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : photos.length === 0 ? (
        <Box sx={{ p: 4, textAlign: 'center', bgcolor: '#f5f5f5', borderRadius: 1 }}>
          <Typography>No photos added yet. Click "Add Photo" to upload job images.</Typography>
        </Box>
      ) : (
        <Grid container spacing={2}>
          {photos.map((photo) => (
            <Grid item xs={12} sm={6} md={4} key={photo.id}>
              <Card sx={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
                <CardMedia
                  component="img"
                  height="140"
                  image={photo.url}
                  alt={photo.caption || photo.fileName}
                  sx={{ objectFit: 'cover', cursor: 'pointer' }}
                  onClick={() => handleViewPhoto(photo)}
                />
                <CardContent sx={{ flexGrow: 1 }}>
                  <Typography variant="subtitle1" gutterBottom>
                    {photo.photoType.replace('_', ' ')}
                  </Typography>
                  {photo.caption && (
                    <Typography variant="body2" color="text.secondary">
                      {photo.caption}
                    </Typography>
                  )}
                  <Typography variant="caption" display="block" color="text.secondary">
                    Added: {new Date(photo.createdAt).toLocaleDateString()}
                  </Typography>
                </CardContent>
                <CardActions>
                  <IconButton size="small" onClick={() => handleViewPhoto(photo)}>
                    <Visibility />
                  </IconButton>
                  <IconButton size="small" onClick={() => handleDeletePhoto(photo.id)}>
                    <Delete />
                  </IconButton>
                </CardActions>
              </Card>
            </Grid>
          ))}
        </Grid>
      )}

      {/* Upload Dialog */}
      <Dialog open={uploadDialogOpen} onClose={() => setUploadDialogOpen(false)}>
        <DialogTitle>Upload New Photo</DialogTitle>
        <DialogContent>
          <TextField
            autoFocus
            name="url"
            label="Image URL"
            fullWidth
            variant="outlined"
            margin="normal"
            value={uploadForm.url}
            onChange={handleInputChange}
            helperText="Direct link to the image"
            required
          />
          <TextField
            name="fileName"
            label="File Name"
            fullWidth
            variant="outlined"
            margin="normal"
            value={uploadForm.fileName}
            onChange={handleInputChange}
            required
          />
          <TextField
            name="caption"
            label="Caption"
            fullWidth
            variant="outlined"
            margin="normal"
            value={uploadForm.caption}
            onChange={handleInputChange}
            multiline
            rows={2}
          />
          <FormControl fullWidth margin="normal">
            <InputLabel>Photo Type</InputLabel>
            <Select
              value={uploadForm.photoType}
              onChange={handleSelectChange}
              label="Photo Type"
            >
              {PHOTO_TYPES.map((type) => (
                <MenuItem key={type} value={type}>
                  {type.replace('_', ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setUploadDialogOpen(false)}>Cancel</Button>
          <Button 
            onClick={handleUploadPhoto} 
            variant="contained" 
            disabled={uploading || !uploadForm.url || !uploadForm.fileName}
          >
            {uploading ? <CircularProgress size={24} /> : 'Upload'}
          </Button>
        </DialogActions>
      </Dialog>

      {/* View Dialog */}
      <Dialog
        open={viewDialogOpen}
        onClose={() => setViewDialogOpen(false)}
        maxWidth="md"
        fullWidth
      >
        {selectedPhoto && (
          <>
            <DialogContent>
              <img
                src={selectedPhoto.url}
                alt={selectedPhoto.caption || selectedPhoto.fileName}
                style={{ width: '100%', maxHeight: '70vh', objectFit: 'contain' }}
              />
              <Box sx={{ mt: 2 }}>
                <Typography variant="h6">{selectedPhoto.fileName}</Typography>
                {selectedPhoto.caption && (
                  <Typography variant="body1" sx={{ mt: 1 }}>
                    {selectedPhoto.caption}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                  Type: {selectedPhoto.photoType.replace('_', ' ')}
                </Typography>
                {selectedPhoto.uploader && (
                  <Typography variant="body2" color="text.secondary">
                    Uploaded by: {selectedPhoto.uploader.name}
                  </Typography>
                )}
                <Typography variant="body2" color="text.secondary">
                  Date: {new Date(selectedPhoto.createdAt).toLocaleString()}
                </Typography>
              </Box>
            </DialogContent>
            <DialogActions>
              <Button onClick={() => setViewDialogOpen(false)}>Close</Button>
              <Button 
                color="error" 
                onClick={() => {
                  handleDeletePhoto(selectedPhoto.id);
                  setViewDialogOpen(false);
                }}
              >
                Delete
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>

      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
      >
        <Alert onClose={() => setSnackbar({ ...snackbar, open: false })} severity={snackbar.severity}>
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Box>
  );
} 