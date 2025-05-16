'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import {
  Badge,
  IconButton,
  Popover,
  Box,
  Typography,
  List,
  ListItem,
  ListItemAvatar,
  Avatar,
  ListItemText,
  Divider,
  Button,
  CircularProgress,
} from '@mui/material';
import {
  Notifications as NotificationsIcon,
  PhotoCamera as PhotoCameraIcon,
  Assignment as AssignmentIcon,
  Person as PersonIcon,
} from '@mui/icons-material';
import { formatDistanceToNow } from 'date-fns';

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

interface AdminNotificationsProps {
  onNewNotifications?: (count: number) => void;
}

export default function AdminNotifications({ onNewNotifications }: AdminNotificationsProps) {
  const router = useRouter();
  const [anchorEl, setAnchorEl] = useState<HTMLButtonElement | null>(null);
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);

  useEffect(() => {
    // Load last checked timestamp from localStorage
    const savedLastChecked = localStorage.getItem('adminLastNotificationCheck');
    if (savedLastChecked) {
      setLastChecked(new Date(savedLastChecked));
    }

    // Initial fetch of notifications
    fetchNotifications();

    // Set up polling for new notifications (every 5 minutes)
    const interval = setInterval(fetchNotifications, 5 * 60 * 1000);

    return () => clearInterval(interval);
  }, []);

  const fetchNotifications = async () => {
    try {
      setLoading(true);
      const url = lastChecked 
        ? `/api/admin/notifications?lastChecked=${lastChecked.toISOString()}`
        : '/api/admin/notifications';
      
      const response = await fetch(url);
      
      if (!response.ok) {
        throw new Error('Failed to fetch notifications');
      }
      
      const data = await response.json();
      
      // Update notifications
      setNotifications(data.notifications);
      
      // Update last checked timestamp
      setLastChecked(new Date(data.lastChecked));
      localStorage.setItem('adminLastNotificationCheck', data.lastChecked);
      
      // Notify parent component
      if (onNewNotifications && data.unreadCount > 0) {
        onNewNotifications(data.unreadCount);
      }
    } catch (error) {
      console.error('Error fetching notifications:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    setAnchorEl(event.currentTarget);
    fetchNotifications(); // Refresh on open
  };

  const handleClose = () => {
    setAnchorEl(null);
  };

  const handleNotificationClick = (notification: Notification) => {
    // Handle different notification types
    if (notification.type === 'PHOTO_UPLOAD' && notification.data.jobId) {
      router.push(`/admin/jobs/${notification.data.jobId}/photos`);
      handleClose();
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

  const open = Boolean(anchorEl);
  const id = open ? 'notifications-popover' : undefined;

  return (
    <>
      <IconButton color="inherit" onClick={handleClick}>
        <Badge badgeContent={notifications.length} color="error">
          <NotificationsIcon />
        </Badge>
      </IconButton>
      
      <Popover
        id={id}
        open={open}
        anchorEl={anchorEl}
        onClose={handleClose}
        anchorOrigin={{
          vertical: 'bottom',
          horizontal: 'right',
        }}
        transformOrigin={{
          vertical: 'top',
          horizontal: 'right',
        }}
        PaperProps={{
          sx: {
            width: 360,
            maxHeight: 500,
            overflow: 'auto',
          }
        }}
      >
        <Box sx={{ p: 2, bgcolor: 'primary.main', color: 'primary.contrastText' }}>
          <Typography variant="h6">Notifications</Typography>
        </Box>
        
        {loading && notifications.length === 0 ? (
          <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
            <CircularProgress size={30} />
          </Box>
        ) : notifications.length === 0 ? (
          <Box sx={{ p: 3, textAlign: 'center' }}>
            <Typography color="text.secondary">No new notifications</Typography>
          </Box>
        ) : (
          <List sx={{ p: 0 }}>
            {notifications.map((notification) => (
              <Box key={notification.id}>
                <ListItem 
                  button 
                  onClick={() => handleNotificationClick(notification)}
                  sx={{ 
                    bgcolor: notification.read ? 'transparent' : 'action.hover',
                    '&:hover': {
                      bgcolor: 'action.selected',
                    }
                  }}
                >
                  <ListItemAvatar>
                    <Avatar sx={{ bgcolor: getNotificationAvatarColor(notification.type) }}>
                      {getNotificationIcon(notification.type)}
                    </Avatar>
                  </ListItemAvatar>
                  <ListItemText
                    primary={notification.title}
                    secondary={
                      <>
                        <Typography 
                          component="span" 
                          variant="body2" 
                          color="text.primary" 
                          display="block"
                        >
                          {notification.message}
                        </Typography>
                        <Typography component="span" variant="caption" color="text.secondary">
                          {formatTimestamp(notification.timestamp)}
                        </Typography>
                      </>
                    }
                    primaryTypographyProps={{ fontWeight: notification.read ? 'regular' : 'bold' }}
                  />
                </ListItem>
                <Divider />
              </Box>
            ))}
          </List>
        )}
        
        <Box sx={{ p: 1, display: 'flex', justifyContent: 'space-between' }}>
          <Button size="small" onClick={fetchNotifications}>
            Refresh
          </Button>
          <Button 
            size="small" 
            onClick={() => router.push('/admin/notifications')}
          >
            View All
          </Button>
        </Box>
      </Popover>
    </>
  );
} 