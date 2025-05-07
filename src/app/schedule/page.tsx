'use client';

import { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton,
  Chip
} from '@mui/material';
import { 
  ChevronLeft as ChevronLeftIcon, 
  ChevronRight as ChevronRightIcon,
  Add as AddIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { format, addMonths, subMonths, startOfMonth, endOfMonth, eachDayOfInterval, isSameMonth, isToday, isSameDay } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);

// Sample events for the calendar
const events = [
  { id: 1, title: 'Lawn Maintenance - Anderson', date: new Date(2023, new Date().getMonth(), 10), status: 'confirmed' },
  { id: 2, title: 'Tree Service - Williams', date: new Date(2023, new Date().getMonth(), 15), status: 'pending' },
  { id: 3, title: 'Landscape Design - Johnson', date: new Date(2023, new Date().getMonth(), 18), status: 'confirmed' },
  { id: 4, title: 'Cleanup - Davis', date: new Date(2023, new Date().getMonth(), 22), status: 'confirmed' },
  { id: 5, title: 'Irrigation - Wilson', date: new Date(2023, new Date().getMonth(), 28), status: 'pending' },
];

export default function Schedule() {
  const theme = useTheme();
  const [currentDate, setCurrentDate] = useState(new Date());
  
  const handlePreviousMonth = () => {
    setCurrentDate(prevDate => subMonths(prevDate, 1));
  };
  
  const handleNextMonth = () => {
    setCurrentDate(prevDate => addMonths(prevDate, 1));
  };
  
  const monthStart = startOfMonth(currentDate);
  const monthEnd = endOfMonth(currentDate);
  const daysInMonth = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  const getEventForDate = (date) => {
    return events.filter(event => isSameDay(event.date, date));
  };
  
  const getStatusColor = (status) => {
    if (status === 'confirmed') return theme.palette.success.main;
    if (status === 'pending') return theme.palette.info.main;
    return theme.palette.grey[500];
  };

  return (
    <Layout>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 4 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary
            }}
          >
            Schedule
          </Typography>
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            sx={{
              boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0px 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
              }
            }}
          >
            New Appointment
          </Button>
        </Box>
        
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          View and manage your landscaping schedule
        </Typography>
        
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
          sx={{ 
            p: 3,
            position: 'relative',
            mb: 4,
            borderRadius: 3,
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            }
          }}
        >
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
            <IconButton onClick={handlePreviousMonth} color="primary">
              <ChevronLeftIcon />
            </IconButton>
            
            <Typography variant="h5" sx={{ fontWeight: 600 }}>
              {format(currentDate, 'MMMM yyyy')}
            </Typography>
            
            <IconButton onClick={handleNextMonth} color="primary">
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
              const dayEvents = getEventForDate(day);
              const isCurrentMonth = isSameMonth(day, currentDate);
              const isCurrentDay = isToday(day);
              
              return (
                <Grid item xs={12/7} key={i}>
                  <MotionPaper
                    whileHover={{ scale: 1.03 }}
                    transition={{ duration: 0.2 }}
                    sx={{
                      p: 1,
                      height: 100,
                      display: 'flex',
                      flexDirection: 'column',
                      opacity: isCurrentMonth ? 1 : 0.4,
                      border: isCurrentDay ? `2px solid ${theme.palette.primary.main}` : 'none',
                      background: isCurrentDay ? alpha(theme.palette.primary.main, 0.05) : theme.palette.background.paper,
                      overflow: 'hidden',
                      position: 'relative',
                      borderRadius: 2,
                      boxShadow: 'none'
                    }}
                  >
                    <Typography 
                      variant="body2" 
                      sx={{ 
                        fontWeight: isCurrentDay ? 700 : 400,
                        color: isCurrentDay ? theme.palette.primary.main : theme.palette.text.primary,
                        mb: 1
                      }}
                    >
                      {format(day, 'd')}
                    </Typography>
                    
                    {dayEvents.length > 0 && dayEvents.slice(0, 2).map((event, index) => (
                      <Chip 
                        key={event.id}
                        label={event.title.length > 12 ? `${event.title.substring(0, 12)}...` : event.title}
                        size="small"
                        sx={{ 
                          mb: 0.5, 
                          backgroundColor: alpha(getStatusColor(event.status), 0.1),
                          color: getStatusColor(event.status),
                          borderRadius: '4px',
                          height: '20px',
                          fontSize: '0.7rem',
                          transition: 'all 0.2s ease-in-out',
                          '&:hover': {
                            backgroundColor: alpha(getStatusColor(event.status), 0.2),
                          }
                        }}
                      />
                    ))}
                    
                    {dayEvents.length > 2 && (
                      <Typography variant="caption" color="text.secondary">
                        +{dayEvents.length - 2} more
                      </Typography>
                    )}
                  </MotionPaper>
                </Grid>
              );
            })}
          </Grid>
        </MotionPaper>
        
        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
          sx={{ 
            p: 3,
            position: 'relative',
            borderRadius: 3,
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            }
          }}
        >
          <Typography 
            variant="h6" 
            gutterBottom 
            sx={{ 
              mb: 3,
              color: theme.palette.text.primary,
              fontWeight: 600
            }}
          >
            Upcoming Appointments
          </Typography>
          
          {events
            .filter(event => event.date >= new Date())
            .sort((a, b) => a.date - b.date)
            .slice(0, 5)
            .map(event => (
              <Box 
                key={event.id}
                component={motion.div}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ duration: 0.3 }}
                sx={{ 
                  p: 2, 
                  mb: 2, 
                  borderRadius: 2,
                  border: `1px solid ${alpha(theme.palette.divider, 0.7)}`,
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  transition: 'all 0.2s ease-in-out',
                  '&:hover': {
                    backgroundColor: alpha(theme.palette.primary.main, 0.03),
                    transform: 'translateX(4px)'
                  }
                }}
              >
                <Box>
                  <Typography variant="subtitle1" sx={{ fontWeight: 600 }}>
                    {event.title}
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    {format(event.date, 'EEEE, MMMM d, yyyy')}
                  </Typography>
                </Box>
                <Chip 
                  label={event.status} 
                  size="small"
                  sx={{ 
                    backgroundColor: alpha(getStatusColor(event.status), 0.1),
                    color: getStatusColor(event.status),
                  }}
                />
              </Box>
            ))}
        </MotionPaper>
      </Box>
    </Layout>
  );
} 