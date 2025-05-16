'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
  Alert,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Grid,
  TextField,
  InputAdornment,
} from '@mui/material';
import {
  PhotoCamera as PhotoCameraIcon,
  Search as SearchIcon,
  FilterList as FilterIcon,
  Assignment as AssignmentIcon,
  ArrowBack as ArrowBackIcon,
} from '@mui/icons-material';
import { format, formatDistanceToNow } from 'date-fns';
import AdminLayout from '@/components/AdminLayout';

interface NotificationData {
  photoId?: string;
  jobId?: string;
  photoType?: string;
  photoUrl?: string;
  staffId?: string;
  staffName?: string;
  jobTitle?: string;
}

interface Notification {
  id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  data: NotificationData;
  read: boolean;
}

export default function AdminNotificationsPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filter, setFilter] = useState('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [timeframe, setTimeframe] = useState('7days');

  useEffect(() => {
    fetchNotifications();
  }, [timeframe]);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      
      // Calculate timestamp based on timeframe
      let timestamp = new Date();
      switch (timeframe) {
        case '24hours':
          timestamp = new Date(Date.now() - 24 * 60 * 60 * 1000);
          break;
        case '7days':
          timestamp = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          break;
        case '30days':
          timestamp = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
          break;
        case 'all':
          timestamp = new Date(0); // Beginning of time
          break;
      }
      
      const response = await fetch(`/api/admin/notifications?lastChecked=${timestamp.toISOString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      setNotifications(data.notifications);
    } catch (err) {
      console.error('Error fetching notifications:', err);
      setError('Failed to load notifications. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleNotificationClick = (notification: Notification) => {
    // Handle different notification types
    if (notification.type === 'PHOTO_UPLOAD' && notification.data.jobId) {
      router.push(`/admin/jobs/${notification.data.jobId}/photos`);
    }
  };

  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'PHOTO_UPLOAD':
        return <PhotoCameraIcon />;
      default:
        return <AssignmentIcon />;
    }
  };

  const getNotificationAvatarColor = (type: string) => {
    switch (type) {
      case 'PHOTO_UPLOAD':
        return 'primary.main';
      default:
        return 'secondary.main';
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return formatDistanceToNow(new Date(timestamp), { addSuffix: true });
  };

  const formatPreciseTimestamp = (timestamp: string) => {
    return format(new Date(timestamp), 'PPpp');
  };

  const filteredNotifications = notifications.filter(notification => {
    const matchesType = filter === 'all' || notification.type === filter;
    const matchesSearch = 
      searchTerm === '' || 
      notification.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      notification.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (notification.data.staffName && notification.data.staffName.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (notification.data.jobTitle && notification.data.jobTitle.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesType && matchesSearch;
  });

  return (
    <AdminLayout>
      <Box sx={{ mb: 4 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => router.back()}
          sx={{ mb: 2 }}
        >
          Back
        </Button>
        
        <Typography variant="h4" sx={{ mb: 3 }}>
          Notifications
        </Typography>
        
        <Paper sx={{ p: 2, mb: 3 }}>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                placeholder="Search notifications..."
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
                <InputLabel id="notification-type-label">Type</InputLabel>
                <Select
                  labelId="notification-type-label"
                  value={filter}
                  label="Type"
                  onChange={(e) => setFilter(e.target.value)}
                >
                  <MenuItem value="all">All Notifications</MenuItem>
                  <MenuItem value="PHOTO_UPLOAD">Photo Uploads</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={3}>
              <FormControl fullWidth size="small">
                <InputLabel id="timeframe-label">Timeframe</InputLabel>
                <Select
                  labelId="timeframe-label"
                  value={timeframe}
                  label="Timeframe"
                  onChange={(e) => setTimeframe(e.target.value)}
                >
                  <MenuItem value="24hours">Last 24 Hours</MenuItem>
                  <MenuItem value="7days">Last 7 Days</MenuItem>
                  <MenuItem value="30days">Last 30 Days</MenuItem>
                  <MenuItem value="all">All Time</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            <Grid item xs={12} sm={2}>
              <Button 
                variant="outlined" 
                startIcon={<FilterIcon />}
                onClick={fetchNotifications}
                fullWidth
              >
                Refresh
              </Button>
            </Grid>
          </Grid>
        </Paper>
        
        {loading ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress />
          </Box>
        ) : error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : filteredNotifications.length === 0 ? (
          <Alert severity="info" sx={{ mb: 3 }}>
            No notifications found matching your criteria.
          </Alert>
        ) : (
          <Paper>
            <List sx={{ width: '100%', bgcolor: 'background.paper' }}>
              {filteredNotifications.map((notification) => (
                <Box key={notification.id}>
                  <ListItem 
                    button 
                    onClick={() => handleNotificationClick(notification)}
                    sx={{ 
                      py: 2,
                      '&:hover': {
                        bgcolor: 'action.hover',
                      }
                    }}
                  >
                    <ListItemAvatar>
                      <Avatar sx={{ bgcolor: getNotificationAvatarColor(notification.type) }}>
                        {getNotificationIcon(notification.type)}
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={
                        <Typography variant="subtitle1">
                          {notification.title}
                        </Typography>
                      }
                      secondary={
                        <>
                          <Typography 
                            component="span" 
                            variant="body2" 
                            color="text.primary" 
                            sx={{ display: 'block', mb: 0.5 }}
                          >
                            {notification.message}
                          </Typography>
                          <Typography component="span" variant="caption" color="text.secondary">
                            {formatTimestamp(notification.timestamp)} • {formatPreciseTimestamp(notification.timestamp)}
                          </Typography>
                        </>
                      }
                    />
                  </ListItem>
                  <Divider component="li" />
                </Box>
              ))}
            </List>
          </Paper>
        )}
      </Box>
    </AdminLayout>
  );
} 