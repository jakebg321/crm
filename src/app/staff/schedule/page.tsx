'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  Grid,
  IconButton,
  Chip,
  Card,
  CardContent,
  Divider,
  CircularProgress,
  Alert,
  ToggleButtonGroup,
  ToggleButton,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  CalendarMonth as CalendarIcon,
  ViewList as ListIcon,
  AccessTime as TimeIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import { 
  format, 
  startOfMonth, 
  endOfMonth, 
  startOfWeek, 
  endOfWeek, 
  addMonths, 
  subMonths,
  eachDayOfInterval, 
  isSameMonth, 
  isSameDay,
  isToday,
  parseISO
} from 'date-fns';
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

enum ViewType {
  CALENDAR = 'calendar',
  LIST = 'list',
}

export default function StaffSchedule() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>(ViewType.CALENDAR);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchJobs();
    }
  }, [status, currentDate]);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);

      // Always include date parameters with a fallback to a very wide range
      const response = await fetch(
        `/api/schedule?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}`
      );

      if (!response.ok) {
        throw new Error(`Failed to fetch schedule: ${response.status}`);
      }

      const data = await response.json();
      
      console.log('Fetched schedule data:', data);
      
      if (session?.user?.role === 'STAFF') {
        const filteredJobs = data.filter(
          (job: Job) => job.assignedTo && job.assignedTo.id === session.user?.id
        );
        setJobs(filteredJobs);
      } else {
        setJobs(data);
      }
    } catch (err) {
      console.error('Error fetching schedule:', err);
      setError('Failed to load your schedule. Please try again later.');
    } finally {
      setLoading(false);
    }
  };

  const handlePrevMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };

  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const handleViewChange = (
    event: React.MouseEvent<HTMLElement>,
    newView: ViewType | null
  ) => {
    if (newView !== null) {
      setViewType(newView);
    }
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => 
      job.startDate && isSameDay(parseISO(job.startDate), date)
    );
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

  const renderCalendarView = () => {
    const monthStart = startOfMonth(currentDate);
    const monthEnd = endOfMonth(currentDate);
    const startDate = startOfWeek(monthStart);
    const endDate = endOfWeek(monthEnd);

    const daysInMonth = eachDayOfInterval({
      start: startDate,
      end: endDate,
    });

    return (
      <Grid container spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
          <Grid item xs={12/7} key={day}>
            <Typography 
              variant="subtitle2" 
              align="center"
              sx={{ 
                fontWeight: 'bold',
                py: 1
              }}
            >
              {day}
            </Typography>
          </Grid>
        ))}

        {daysInMonth.map((day, i) => {
          const dayJobs = getJobsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <Grid item xs={12/7} key={i}>
              <Paper 
                elevation={isCurrentDay ? 3 : 1}
                sx={{
                  p: 1,
                  height: 120,
                  overflow: 'auto',
                  bgcolor: isCurrentDay 
                    ? 'rgba(25, 118, 210, 0.08)'
                    : isCurrentMonth 
                      ? 'background.paper' 
                      : 'rgba(0, 0, 0, 0.04)',
                  border: isCurrentDay ? '1px solid' : 'none',
                  borderColor: 'primary.main',
                  opacity: isCurrentMonth ? 1 : 0.7,
                  position: 'relative',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    fontWeight: isCurrentDay ? 'bold' : 'normal',
                    color: isCurrentMonth ? 'text.primary' : 'text.disabled',
                    mb: 1,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  {dayJobs.map((job) => (
                    <Chip
                      key={job.id}
                      label={job.title}
                      size="small"
                      color={getStatusColor(job.status)}
                      onClick={() => router.push(`/staff/jobs/${job.id}`)}
                      sx={{ 
                        mt: 0.5, 
                        width: '100%',
                        justifyContent: 'flex-start',
                        height: 'auto',
                        '& .MuiChip-label': {
                          display: 'block',
                          whiteSpace: 'nowrap',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          py: 0.5,
                        }
                      }}
                    />
                  ))}
                </Box>
              </Paper>
            </Grid>
          );
        })}
      </Grid>
    );
  };

  const renderListView = () => {
    // Group jobs by day
    const jobsByDay: { [key: string]: Job[] } = {};
    
    jobs.forEach(job => {
      if (job.startDate) {
        const dateStr = format(parseISO(job.startDate), 'yyyy-MM-dd');
        if (!jobsByDay[dateStr]) {
          jobsByDay[dateStr] = [];
        }
        jobsByDay[dateStr].push(job);
      }
    });

    // Sort days
    const sortedDays = Object.keys(jobsByDay).sort();

    if (sortedDays.length === 0) {
      return (
        <Alert severity="info">
          No jobs scheduled for this month.
        </Alert>
      );
    }

    return (
      <Box>
        {sortedDays.map(dateStr => {
          const date = parseISO(dateStr);
          const dayJobs = jobsByDay[dateStr];
          
          return (
            <Box key={dateStr} sx={{ mb: 3 }}>
              <Typography 
                variant="h6" 
                sx={{ 
                  mb: 1, 
                  display: 'flex', 
                  alignItems: 'center',
                  color: isToday(date) ? 'primary.main' : 'text.primary',
                }}
              >
                {format(date, 'EEEE, MMMM d, yyyy')}
                {isToday(date) && (
                  <Chip 
                    label="Today" 
                    size="small" 
                    color="primary" 
                    sx={{ ml: 1 }}
                  />
                )}
              </Typography>
              
              {dayJobs.map(job => (
                <Card 
                  key={job.id} 
                  sx={{ 
                    mb: 1, 
                    cursor: 'pointer',
                    '&:hover': {
                      boxShadow: 3,
                    },
                  }}
                  onClick={() => router.push(`/staff/jobs/${job.id}`)}
                >
                  <CardContent sx={{ pb: 2 }}>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                      <Typography variant="subtitle1">
                        {job.title}
                      </Typography>
                      <Chip 
                        label={job.status.replace('_', ' ')} 
                        size="small" 
                        color={getStatusColor(job.status)}
                      />
                    </Box>
                    
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                      <TimeIcon fontSize="small" sx={{ mr: 1, color: 'text.secondary' }} />
                      <Typography variant="body2" color="text.secondary">
                        {job.startDate ? format(parseISO(job.startDate), 'h:mm a') : 'No time specified'}
                        {job.endDate && ` - ${format(parseISO(job.endDate), 'h:mm a')}`}
                      </Typography>
                    </Box>
                    
                    {job.client && (
                      <Box sx={{ display: 'flex', alignItems: 'flex-start', mt: 1 }}>
                        <LocationIcon fontSize="small" sx={{ mr: 1, mt: 0.25, color: 'text.secondary' }} />
                        <Typography variant="body2" color="text.secondary">
                          {job.client.address}, {job.client.city}
                        </Typography>
                      </Box>
                    )}
                  </CardContent>
                </Card>
              ))}
            </Box>
          );
        })}
      </Box>
    );
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
        {/* Header with month navigation */}
        <Box sx={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          mb: 3
        }}>
          <Box>
            <Typography variant="h5">
              My Schedule
            </Typography>
            <Typography variant="subtitle1" color="text.secondary">
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <ToggleButtonGroup
              value={viewType}
              exclusive
              onChange={handleViewChange}
              aria-label="view type"
              size="small"
              sx={{ mr: 2 }}
            >
              <ToggleButton value={ViewType.CALENDAR} aria-label="calendar view">
                <CalendarIcon />
              </ToggleButton>
              <ToggleButton value={ViewType.LIST} aria-label="list view">
                <ListIcon />
              </ToggleButton>
            </ToggleButtonGroup>
            
            <IconButton onClick={handlePrevMonth}>
              <ChevronLeftIcon />
            </IconButton>
            <IconButton onClick={handleNextMonth}>
              <ChevronRightIcon />
            </IconButton>
          </Box>
        </Box>
        
        {error ? (
          <Alert severity="error" sx={{ mb: 3 }}>
            {error}
          </Alert>
        ) : (
          <Paper sx={{ p: 2, borderRadius: 2 }}>
            {viewType === ViewType.CALENDAR ? renderCalendarView() : renderListView()}
          </Paper>
        )}
      </Box>
    </StaffLayout>
  );
} 