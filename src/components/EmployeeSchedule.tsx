'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  IconButton,
  Grid,
  Chip,
  Tooltip,
  CircularProgress,
  Alert,
} from '@mui/material';
import {
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
} from '@mui/icons-material';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay, parseISO } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { JobStatus, JobType } from '@prisma/client';

const MotionPaper = motion.create(Paper);

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
  } | null;
}

interface EmployeeScheduleProps {
  employeeId: string;
}

export default function EmployeeSchedule({ employeeId }: EmployeeScheduleProps) {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchJobs();
  }, [currentDate, employeeId]);

  const fetchJobs = async () => {
    try {
      const monthStart = startOfMonth(currentDate);
      const monthEnd = endOfMonth(currentDate);
      
      const apiUrl = `/api/schedule?startDate=${monthStart.toISOString()}&endDate=${monthEnd.toISOString()}&employeeId=${employeeId}`;
      console.log('EmployeeSchedule requesting URL:', apiUrl);
      
      const response = await fetch(apiUrl);
      
      if (!response.ok) throw new Error('Failed to fetch jobs');
      const data = await response.json();
      setJobs(data);
    } catch (err) {
      setError('Failed to load schedule');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };

  const getJobsForDate = (date: Date) => {
    return jobs.filter(job => job.startDate && isSameDay(parseISO(job.startDate), date));
  };

  const getStatusColor = (status: JobStatus) => {
    switch (status) {
      case JobStatus.SCHEDULED:
        return theme.palette.info.main;
      case JobStatus.IN_PROGRESS:
        return theme.palette.warning.main;
      case JobStatus.COMPLETED:
        return theme.palette.success.main;
      case JobStatus.CANCELLED:
        return theme.palette.error.main;
      default:
        return theme.palette.grey[500];
    }
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
        <CircularProgress />
      </Box>
    );
  }

  if (error) {
    return (
      <Box sx={{ p: 3 }}>
        <Alert severity="error">{error}</Alert>
      </Box>
    );
  }

  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });

  return (
    <Box>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'center', mb: 2 }}>
        <IconButton onClick={handlePreviousMonth}>
          <ChevronLeftIcon />
        </IconButton>
        <Typography variant="h6" sx={{ mx: 2 }}>
          {format(currentDate, 'MMMM yyyy')}
        </Typography>
        <IconButton onClick={handleNextMonth}>
          <ChevronRightIcon />
        </IconButton>
      </Box>

      <Grid container spacing={1}>
        {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => (
          <Grid item xs={12/7} key={day}>
            <Box 
              sx={{ 
                textAlign: 'center', 
                p: 1,
                fontWeight: 600,
                color: theme.palette.text.secondary
              }}
            >
              {day}
            </Box>
          </Grid>
        ))}
        
        {daysInMonth.map((day, i) => {
          const dayJobs = getJobsForDate(day);
          const isCurrentMonth = isSameMonth(day, currentDate);
          const isCurrentDay = isToday(day);
          
          return (
            <Grid item xs={12/7} key={i}>
              <MotionPaper
                whileHover={{ scale: 1.02 }}
                sx={{
                  p: 1,
                  minHeight: 120,
                  bgcolor: isCurrentDay 
                    ? alpha(theme.palette.primary.main, 0.1)
                    : isCurrentMonth 
                      ? theme.palette.background.paper 
                      : alpha(theme.palette.grey[500], 0.1),
                  border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : 'none',
                }}
              >
                <Typography
                  variant="body2"
                  sx={{
                    color: isCurrentDay 
                      ? theme.palette.primary.main 
                      : isCurrentMonth 
                        ? theme.palette.text.primary 
                        : theme.palette.text.disabled,
                    fontWeight: isCurrentDay ? 700 : 400,
                  }}
                >
                  {format(day, 'd')}
                </Typography>
                
                <Box sx={{ mt: 1 }}>
                  {dayJobs.map((job) => (
                    <Tooltip
                      key={job.id}
                      title={
                        <Box>
                          <Typography variant="body2">{job.title}</Typography>
                          {job.client && (
                            <Typography variant="caption">
                              {job.client.name}
                            </Typography>
                          )}
                        </Box>
                      }
                    >
                      <Chip
                        label={job.title}
                        size="small"
                        sx={{
                          mb: 0.5,
                          width: '100%',
                          justifyContent: 'flex-start',
                          backgroundColor: alpha(getStatusColor(job.status), 0.2),
                          color: getStatusColor(job.status),
                          '&:hover': {
                            backgroundColor: alpha(getStatusColor(job.status), 0.3),
                          },
                        }}
                      />
                    </Tooltip>
                  ))}
                </Box>
              </MotionPaper>
            </Grid>
          );
        })}
      </Grid>
    </Box>
  );
} 