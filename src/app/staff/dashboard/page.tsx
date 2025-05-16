'use client';

import React, { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  Button,
  Card,
  CardContent,
  CardActions,
  Chip,
  Divider,
  CircularProgress,
  Alert,
  List,
  ListItem,
  ListItemText,
  ListItemAvatar,
  Avatar,
} from '@mui/material';
import {
  CalendarToday as CalendarIcon,
  Map as MapIcon,
  LocationOn as LocationIcon,
  AccessTime as TimeIcon,
  Assignment as JobIcon,
  ArrowForward as ArrowForwardIcon,
} from '@mui/icons-material';
import { format, isSameDay } from 'date-fns';
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
  client: {
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
}

export default function StaffDashboard() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [todayJobs, setTodayJobs] = useState<Job[]>([]);
  const [upcomingJobs, setUpcomingJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchJobs();
    }
  }, [status]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      // Define a wide date range for fetching jobs
      const startDate = new Date('2000-01-01').toISOString();
      const endDate = new Date('2100-01-01').toISOString();
      
      const response = await fetch(`/api/staff/jobs?startDate=${startDate}&endDate=${endDate}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }
      
      const jobs = await response.json();
      
      // Filter today's jobs
      const today = new Date();
      const todayJobs = jobs.filter((job: Job) => 
        job.startDate && isSameDay(new Date(job.startDate), today)
      );
      
      // Filter upcoming jobs (not today)
      const upcoming = jobs.filter((job: Job) => 
        job.startDate && !isSameDay(new Date(job.startDate), today) && 
        new Date(job.startDate) > today
      );
      
      setTodayJobs(todayJobs);
      setUpcomingJobs(upcoming.slice(0, 5)); // Only show next 5 upcoming jobs
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load your schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  // Helper to get status color
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

  if (loading) {
    return (
      <StaffLayout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </StaffLayout>
    );
  }

  return (
    <StaffLayout>
      <Box>
        <Typography variant="h5" gutterBottom>
          Welcome, {session?.user?.name || 'Staff Member'}
        </Typography>
        <Typography variant="subtitle1" color="text.secondary" gutterBottom>
          {format(new Date(), 'EEEE, MMMM d, yyyy')}
        </Typography>

        {/* Quick Actions */}
        <Typography variant="h6" gutterBottom>
          Quick Actions
        </Typography>
        <Grid container spacing={2} sx={{ mb: 3 }}>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<CalendarIcon />}
              onClick={() => router.push('/staff/schedule')}
              sx={{ 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Box sx={{ mt: 1 }}>My Schedule</Box>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="contained" 
              fullWidth 
              startIcon={<MapIcon />}
              onClick={() => router.push('/staff/route')}
              sx={{ 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Box sx={{ mt: 1 }}>Route Map</Box>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="contained" 
              fullWidth 
              color="success"
              onClick={() => router.push('/staff/jobs/next')}
              sx={{ 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Box sx={{ mt: 1 }}>Next Job</Box>
            </Button>
          </Grid>
          <Grid item xs={6} sm={3}>
            <Button 
              variant="contained" 
              fullWidth 
              color="info"
              onClick={() => router.push('/staff/photos')}
              sx={{ 
                py: 2, 
                display: 'flex', 
                flexDirection: 'column', 
                alignItems: 'center',
                height: '100%'
              }}
            >
              <Box sx={{ mt: 1 }}>Job Photos</Box>
            </Button>
          </Grid>
        </Grid>

        {/* Today's Schedule */}
        <Typography variant="h6" gutterBottom>
          Today's Jobs
        </Typography>
        {todayJobs.length > 0 ? (
          <Box sx={{ mb: 3 }}>
            {todayJobs.map((job) => (
              <Card key={job.id} sx={{ mb: 2, borderRadius: 2 }}>
                <CardContent>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Typography variant="h6">{job.title}</Typography>
                    <Chip 
                      label={job.status.replace('_', ' ')} 
                      color={getStatusColor(job.status)}
                      size="small"
                    />
                  </Box>
                  
                  <Typography variant="body2" color="text.secondary" sx={{ mb: 1 }}>
                    {job.description?.substring(0, 100)}
                    {job.description && job.description.length > 100 ? '...' : ''}
                  </Typography>
                  
                  <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                    <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                    <Typography variant="body2" color="text.secondary">
                      {job.startDate ? format(new Date(job.startDate), 'h:mm a') : 'No time specified'}
                      {job.endDate ? ` - ${format(new Date(job.endDate), 'h:mm a')}` : ''}
                    </Typography>
                  </Box>
                  
                  {job.client && (
                    <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                      <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.25, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.client.address}, {job.client.city}, {job.client.state} {job.client.zipCode}
                      </Typography>
                    </Box>
                  )}
                </CardContent>
                <CardActions>
                  <Button 
                    size="small" 
                    endIcon={<ArrowForwardIcon />}
                    onClick={() => router.push(`/staff/jobs/${job.id}`)}
                  >
                    View Details
                  </Button>
                </CardActions>
              </Card>
            ))}
          </Box>
        ) : (
          <Alert severity="info" sx={{ mb: 3 }}>
            You have no jobs scheduled for today.
          </Alert>
        )}

        {/* Upcoming Jobs */}
        <Typography variant="h6" gutterBottom>
          Upcoming Jobs
        </Typography>
        {upcomingJobs.length > 0 ? (
          <Paper elevation={1} sx={{ borderRadius: 2 }}>
            <List sx={{ width: '100%' }}>
              {upcomingJobs.map((job, index) => (
                <React.Fragment key={job.id}>
                  <ListItem 
                    alignItems="flex-start"
                    button
                    onClick={() => router.push(`/staff/jobs/${job.id}`)}
                  >
                    <ListItemAvatar>
                      <Avatar>
                        <JobIcon />
                      </Avatar>
                    </ListItemAvatar>
                    <ListItemText
                      primary={job.title}
                      secondary={
                        <>
                          <Typography
                            component="span"
                            variant="body2"
                            color="text.primary"
                          >
                            {job.startDate ? format(new Date(job.startDate), 'EEE, MMM d') : 'No date'}
                          </Typography>
                          {" — "}
                          {job.client?.name}
                        </>
                      }
                    />
                    <Chip 
                      label={job.status.replace('_', ' ')} 
                      color={getStatusColor(job.status)}
                      size="small"
                      sx={{ alignSelf: 'center' }}
                    />
                  </ListItem>
                  {index < upcomingJobs.length - 1 && <Divider variant="inset" component="li" />}
                </React.Fragment>
              ))}
            </List>
          </Paper>
        ) : (
          <Alert severity="info">
            You have no upcoming jobs scheduled.
          </Alert>
        )}
      </Box>
    </StaffLayout>
  );
} 