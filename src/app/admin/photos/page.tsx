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
  TextField,
  InputAdornment,
  MenuItem,
  Select,
  FormControl,
  InputLabel,
  IconButton,
} from '@mui/material';
import {
  PhotoCamera as CameraIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Person as PersonIcon,
  DateRange as DateIcon,
  Work as WorkIcon,
} from '@mui/icons-material';
import { format, isToday, isYesterday, parseISO, subDays } from 'date-fns';
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
  assignedTo: {
    id: string;
    name: string;
  } | null;
}

export default function AdminPhotos() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [jobs, setJobs] = useState<JobWithPhotos[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');
  const [staffFilter, setStaffFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState('all');
  
  // Map to store staff members for filtering
  const [staffMembers, setStaffMembers] = useState<Map<string, string>>(new Map());

  useEffect(() => {
    if (status === 'authenticated') {
      // Only admins and managers should access this page
      if (session?.user?.role !== 'ADMIN' && session?.user?.role !== 'MANAGER') {
        router.push('/');
        return;
      }
      
      fetchJobsWithPhotos();
    }
  }, [status, session]);

  const fetchJobsWithPhotos = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/staff/photos?hasPhotos=true');
      
      if (!response.ok) {
        throw new Error('Failed to fetch job photos');
      }
      
      const data = await response.json();
      setJobs(data);
      
      // Build a map of staff members for filtering
      const staffMap = new Map();
      data.forEach(job => {
        if (job.assignedTo) {
          staffMap.set(job.assignedTo.id, job.assignedTo.name);
        }
      });
      setStaffMembers(staffMap);
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

  // Filter jobs based on search, staff, and date
  const filteredJobs = () => {
    return jobs.filter(job => {
      // Search filter
      const searchMatch = searchTerm === '' || 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.client?.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.assignedTo?.name || '').toLowerCase().includes(searchTerm.toLowerCase());
      
      // Staff filter
      const staffMatch = staffFilter === 'all' || 
        (job.assignedTo && job.assignedTo.id === staffFilter);
      
      // Date filter for photos
      let dateMatch = true;
      if (dateFilter !== 'all' && job.photos.length > 0) {
        const now = new Date();
        let cutoffDate;
        
        if (dateFilter === 'today') {
          cutoffDate = new Date(now.setHours(0, 0, 0, 0));
        } else if (dateFilter === 'week') {
          cutoffDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 7);
        } else if (dateFilter === 'month') {
          cutoffDate = subDays(new Date(now.setHours(0, 0, 0, 0)), 30);
        }
        
        // Check if any photos are within the date range
        dateMatch = job.photos.some(photo => {
          const photoDate = new Date(photo.createdAt);
          return photoDate >= cutoffDate;
        });
      }
      
      return searchMatch && staffMatch && dateMatch;
    });
  };

  // Group photos by date and staff
  const getAllPhotos = () => {
    const allPhotos: Photo[] = [];
    filteredJobs().forEach(job => {
      job.photos.forEach(photo => {
        // Add job info to each photo for easier display
        allPhotos.push({
          ...photo,
          job: job
        } as any);
      });
    });
    
    // Sort by newest first
    return allPhotos.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
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

  // Group photos by date
  const getPhotosByDate = (photos: Photo[]) => {
    const photosByDate = new Map();
    
    photos.forEach(photo => {
      const photoDate = new Date(photo.createdAt).toISOString().split('T')[0];
      if (!photosByDate.has(photoDate)) {
        photosByDate.set(photoDate, []);
      }
      photosByDate.get(photoDate).push(photo);
    });
    
    return photosByDate;
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

  if (error) {
    return (
      <AdminLayout>
        <Alert severity="error" sx={{ mb: 3 }}>
          {error}
        </Alert>
      </AdminLayout>
    );
  }

  // Get all filtered photos
  const allPhotos = getAllPhotos();
  const photosByDate = getPhotosByDate(allPhotos);

  return (
    <AdminLayout>
      <Box>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <Typography variant="h5">Staff Photo Uploads</Typography>
          <Button 
            variant="outlined" 
            onClick={() => fetchJobsWithPhotos()}
          >
            Refresh Data
          </Button>
        </Box>

        {/* Search and filters */}
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search jobs, clients or staff..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                InputProps={{
                  startAdornment: (
                    <InputAdornment position="start">
                      <SearchIcon />
                    </InputAdornment>
                  ),
                }}
                size="small"
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="staff-filter-label">Staff Member</InputLabel>
                <Select
                  labelId="staff-filter-label"
                  value={staffFilter}
                  label="Staff Member"
                  onChange={(e) => setStaffFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <PersonIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Staff</MenuItem>
                  {Array.from(staffMembers).map(([id, name]) => (
                    <MenuItem key={id} value={id}>{name}</MenuItem>
                  ))}
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="date-filter-label">Date Range</InputLabel>
                <Select
                  labelId="date-filter-label"
                  value={dateFilter}
                  label="Date Range"
                  onChange={(e) => setDateFilter(e.target.value)}
                  startAdornment={
                    <InputAdornment position="start">
                      <DateIcon fontSize="small" />
                    </InputAdornment>
                  }
                >
                  <MenuItem value="all">All Time</MenuItem>
                  <MenuItem value="today">Today</MenuItem>
                  <MenuItem value="week">Last 7 Days</MenuItem>
                  <MenuItem value="month">Last 30 Days</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Typography variant="body2" color="text.secondary">
                {allPhotos.length} photos found
              </Typography>
            </Grid>
          </Grid>
        </Paper>

        {allPhotos.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No photos found matching your search criteria.
          </Alert>
        ) : (
          <Box>
            {/* Display photos grouped by date */}
            {Array.from(photosByDate.entries()).map(([date, photos]) => (
              <Paper key={date} sx={{ mb: 4, p: 3, overflow: 'hidden' }}>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
                  <DateIcon sx={{ mr: 1, color: 'primary.main' }} />
                  <Typography variant="h6">
                    {formatDateHeading(date)}
                  </Typography>
                  <Typography variant="body2" color="text.secondary" sx={{ ml: 2 }}>
                    {photos.length} photos
                  </Typography>
                </Box>
                
                <Grid container spacing={2}>
                  {photos.map((photo: any) => (
                    <Grid item xs={12} sm={6} md={4} lg={3} key={photo.id}>
                      <Card sx={{ height: '100%' }}>
                        <CardActionArea 
                          onClick={() => router.push(`/admin/jobs/${photo.job.id}/photos`)}
                        >
                          <CardMedia
                            component="img"
                            image={photo.url}
                            alt={photo.caption || "Job photo"}
                            sx={{ height: 200 }}
                          />
                        </CardActionArea>
                        <CardContent>
                          <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 1 }}>
                            <Chip 
                              label={photo.photoType.replace('_', ' ')} 
                              color={getPhotoTypeColor(photo.photoType)}
                              size="small"
                            />
                            <Typography variant="caption" color="text.secondary">
                              {format(new Date(photo.createdAt), 'h:mm a')}
                            </Typography>
                          </Box>
                          
                          {photo.caption && (
                            <Typography variant="body2" gutterBottom noWrap>
                              {photo.caption}
                            </Typography>
                          )}
                          
                          <Divider sx={{ my: 1 }} />
                          
                          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                            <WorkIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                            <Typography variant="body2" fontWeight="medium" noWrap>
                              {photo.job.title}
                            </Typography>
                          </Box>
                          
                          <Box sx={{ display: 'flex', justifyContent: 'space-between' }}>
                            <Typography variant="caption" color="text.secondary">
                              Client: {photo.job.client?.name}
                            </Typography>
                            <Typography variant="caption" color="text.secondary">
                              By: {photo.uploader.name}
                            </Typography>
                          </Box>
                        </CardContent>
                      </Card>
                    </Grid>
                  ))}
                </Grid>
              </Paper>
            ))}
          </Box>
        )}
      </Box>
    </AdminLayout>
  );
} 