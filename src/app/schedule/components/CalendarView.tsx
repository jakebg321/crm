import React from 'react';
import { 
  Box, 
  Grid, 
  Paper, 
  Typography, 
  Chip, 
  Tooltip, 
  Badge,
  Avatar,
  AvatarGroup
} from '@mui/material';
import { 
  Warning as WarningIcon,
  AccessTime as TimeIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, isSameDay, isSameMonth, isToday, parseISO } from 'date-fns';
import { JobStatus } from '@prisma/client';
import { 
  ExtendedJob, 
  ViewType, 
  getDaysForView, 
  getJobsForDate, 
  formatTime,
  getHoursForDay,
  getJobConflicts
} from '../utils/scheduleHelpers';

const MotionPaper = motion.create(Paper);
const MotionChip = motion.create(Chip);

interface CalendarViewProps {
  viewType: ViewType;
  currentDate: Date;
  jobs: ExtendedJob[];
  onDayClick: (date: Date) => void;
  onJobClick: (jobId: string) => void;
  onDragStart: (job: ExtendedJob, event: React.MouseEvent) => void;
  onDragEnd: (event: React.MouseEvent) => void;
  onDrop: (date: Date) => void;
  isDragging: boolean;
  draggedJob: ExtendedJob | null;
}

const CalendarView = ({
  viewType,
  currentDate,
  jobs,
  onDayClick,
  onJobClick,
  onDragStart,
  onDragEnd,
  onDrop,
  isDragging,
  draggedJob
}: CalendarViewProps) => {
  const theme = useTheme();

  // Get the days to display based on the current view
  const days = getDaysForView(currentDate, viewType);

  // Get color based on job status
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

  // Monthly Calendar View
  const MonthView = () => {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={1} sx={{ minWidth: { xs: '800px', md: '100%' } }}>
          {/* Day Headers */}
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
          
          {/* Calendar Days */}
          {days.map((day, i) => {
            const dayJobs = getJobsForDate(jobs, day);
            const isCurrentMonth = isSameMonth(day, currentDate);
            const isCurrentDay = isToday(day);
            const hasDraggedJob = isDragging && 
              draggedJob && 
              draggedJob.startDate && 
              isSameDay(day, parseISO(draggedJob.startDate));
            
            return (
              <Grid item xs={12/7} key={i}>
                <MotionPaper
                  whileHover={{ scale: 1.02 }}
                  sx={{
                    p: 1,
                    minHeight: 120,
                    cursor: 'pointer',
                    bgcolor: isDragging
                      ? alpha(theme.palette.secondary.light, 0.05)
                      : isCurrentDay 
                        ? alpha(theme.palette.primary.main, 0.1)
                        : isCurrentMonth 
                          ? theme.palette.background.paper 
                          : alpha(theme.palette.grey[500], 0.1),
                    border: isCurrentDay 
                      ? `2px solid ${theme.palette.primary.main}` 
                      : hasDraggedJob && isDragging
                        ? `2px dashed ${theme.palette.secondary.main}`
                        : 'none',
                    boxShadow: hasDraggedJob && isDragging 
                      ? `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.3)}`
                      : 'none',
                    transition: 'all 0.2s ease'
                  }}
                  onClick={() => onDayClick(day)}
                  onMouseUp={() => isDragging && onDrop(day)}
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

                  {/* If we have more than 3 jobs, show count instead of all */}
                  {dayJobs.length > 3 ? (
                    <>
                      {dayJobs.slice(0, 2).map((job) => (
                        <JobChip 
                          key={job.id} 
                          job={job} 
                          onClick={onJobClick}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                        />
                      ))}
                      <Box 
                        sx={{ 
                          mt: 0.5, 
                          textAlign: 'center', 
                          fontSize: '0.75rem',
                          color: theme.palette.text.secondary,
                          bgcolor: alpha(theme.palette.grey[500], 0.1),
                          borderRadius: 1,
                          p: 0.5
                        }}
                      >
                        +{dayJobs.length - 2} more
                      </Box>
                    </>
                  ) : (
                    <Box sx={{ mt: 1 }}>
                      {dayJobs.map((job) => (
                        <JobChip 
                          key={job.id} 
                          job={job} 
                          onClick={onJobClick}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                        />
                      ))}
                    </Box>
                  )}
                </MotionPaper>
              </Grid>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Weekly Calendar View
  const WeekView = () => {
    return (
      <Box sx={{ overflowX: 'auto' }}>
        <Grid container spacing={1} sx={{ minWidth: { xs: '800px', md: '100%' } }}>
          {/* Day Headers */}
          {days.map((day, i) => (
            <Grid item xs={12/7} key={i}>
              <Box 
                sx={{ 
                  textAlign: 'center', 
                  p: 1,
                  fontWeight: isToday(day) ? 700 : 600,
                  color: isToday(day) 
                    ? theme.palette.primary.main 
                    : theme.palette.text.secondary,
                  borderBottom: `1px solid ${theme.palette.divider}`
                }}
              >
                <Typography variant="subtitle2">{format(day, 'EEE')}</Typography>
                <Typography variant="h6">{format(day, 'd')}</Typography>
              </Box>
            </Grid>
          ))}
          
          {/* Time Slots - 1 hour increments */}
          {getHoursForDay().map((hour) => (
            <React.Fragment key={hour}>
              {/* Time Label */}
              <Grid item xs={12} sx={{ pl: 2, py: 1, borderBottom: `1px solid ${theme.palette.divider}` }}>
                <Typography variant="caption" color="text.secondary">
                  {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                </Typography>
              </Grid>

              {/* Day Columns */}
              {days.map((day, dayIndex) => {
                const dayJobs = getJobsForDate(jobs, day).filter(job => {
                  if (!job.startDate) return false;
                  const jobDate = parseISO(job.startDate);
                  return jobDate.getHours() === hour;
                });
                
                const isCurrentDay = isToday(day);
                const hasDraggedJob = isDragging && 
                  draggedJob && 
                  draggedJob.startDate && 
                  isSameDay(day, parseISO(draggedJob.startDate)) &&
                  parseISO(draggedJob.startDate).getHours() === hour;
                
                return (
                  <Grid item xs={12/7} key={dayIndex}>
                    <Box 
                      sx={{
                        height: 100,
                        p: 1,
                        borderBottom: `1px solid ${theme.palette.divider}`,
                        borderRight: dayIndex < 6 ? `1px solid ${theme.palette.divider}` : 'none',
                        position: 'relative',
                        bgcolor: isDragging
                          ? alpha(theme.palette.secondary.light, 0.05)
                          : isCurrentDay 
                            ? alpha(theme.palette.primary.main, 0.03)
                            : 'transparent',
                        '&:hover': {
                          bgcolor: isDragging
                            ? alpha(theme.palette.secondary.light, 0.1)
                            : alpha(theme.palette.primary.main, 0.05),
                          cursor: 'pointer'
                        },
                        ...(hasDraggedJob && isDragging && {
                          border: `2px dashed ${theme.palette.secondary.main}`,
                          boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.3)}`
                        })
                      }}
                      onClick={() => {
                        const newDate = new Date(day);
                        newDate.setHours(hour);
                        onDayClick(newDate);
                      }}
                      onMouseUp={() => {
                        if (isDragging) {
                          const newDate = new Date(day);
                          newDate.setHours(hour);
                          onDrop(newDate);
                        }
                      }}
                    >
                      {dayJobs.map((job) => (
                        <JobChip 
                          key={job.id} 
                          job={job} 
                          onClick={onJobClick}
                          onDragStart={onDragStart}
                          onDragEnd={onDragEnd}
                          showTime
                        />
                      ))}
                    </Box>
                  </Grid>
                );
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    );
  };

  // Daily Calendar View
  const DayView = () => {
    return (
      <Box>
        <Typography 
          variant="h5" 
          align="center" 
          sx={{ 
            mb: 2, 
            fontWeight: 600,
            color: isToday(currentDate) ? theme.palette.primary.main : theme.palette.text.primary
          }}
        >
          {format(currentDate, 'EEEE, MMMM d, yyyy')}
        </Typography>
        
        <Grid container spacing={1}>
          {/* Time slots - hourly */}
          {getHoursForDay().map((hour) => {
            const hourJobs = jobs.filter(job => {
              if (!job.startDate) return false;
              const jobDate = parseISO(job.startDate);
              return isSameDay(jobDate, currentDate) && jobDate.getHours() === hour;
            });
            
            const hasDraggedJob = isDragging && 
              draggedJob && 
              draggedJob.startDate && 
              isSameDay(currentDate, parseISO(draggedJob.startDate)) && 
              parseISO(draggedJob.startDate).getHours() === hour;
            
            return (
              <React.Fragment key={hour}>
                {/* Time Column */}
                <Grid item xs={1}>
                  <Box sx={{ textAlign: 'right', pr: 2, pt: 2 }}>
                    <Typography variant="body2" color="text.secondary">
                      {hour === 12 ? '12 PM' : hour > 12 ? `${hour - 12} PM` : `${hour} AM`}
                    </Typography>
                  </Box>
                </Grid>
                
                {/* Jobs Column */}
                <Grid item xs={11}>
                  <Paper 
                    elevation={0}
                    sx={{
                      p: 1,
                      height: 120,
                      borderRadius: 1,
                      borderLeft: `4px solid ${theme.palette.divider}`,
                      bgcolor: isDragging
                        ? alpha(theme.palette.secondary.light, 0.05)
                        : 'transparent',
                      '&:hover': {
                        bgcolor: isDragging
                          ? alpha(theme.palette.secondary.light, 0.1)
                          : alpha(theme.palette.primary.main, 0.05),
                        cursor: 'pointer'
                      },
                      ...(hasDraggedJob && isDragging && {
                        border: `2px dashed ${theme.palette.secondary.main}`,
                        boxShadow: `0 0 0 2px ${alpha(theme.palette.secondary.main, 0.3)}`
                      })
                    }}
                    onClick={() => {
                      const newDate = new Date(currentDate);
                      newDate.setHours(hour);
                      onDayClick(newDate);
                    }}
                    onMouseUp={() => {
                      if (isDragging) {
                        const newDate = new Date(currentDate);
                        newDate.setHours(hour);
                        onDrop(newDate);
                      }
                    }}
                  >
                    {hourJobs.map((job) => (
                      <JobChip 
                        key={job.id} 
                        job={job} 
                        onClick={onJobClick}
                        onDragStart={onDragStart}
                        onDragEnd={onDragEnd}
                        expanded
                      />
                    ))}
                  </Paper>
                </Grid>
              </React.Fragment>
            );
          })}
        </Grid>
      </Box>
    );
  };

  // Render the appropriate view based on viewType
  return (
    <Box>
      {viewType === 'day' && <DayView />}
      {viewType === 'week' && <WeekView />}
      {viewType === 'month' && <MonthView />}
    </Box>
  );
};

// Job Chip Component
interface JobChipProps {
  job: ExtendedJob;
  onClick: (jobId: string) => void;
  onDragStart: (job: ExtendedJob, event: React.MouseEvent) => void;
  onDragEnd: (event: React.MouseEvent) => void;
  showTime?: boolean;
  expanded?: boolean;
}

const JobChip = ({ job, onClick, onDragStart, onDragEnd, showTime = false, expanded = false }: JobChipProps) => {
  const theme = useTheme();
  
  // Check for conflicts with other jobs
  const conflicts = getJobConflicts(job, []);
  const hasConflict = conflicts.length > 0;
  
  // Get color based on job status
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
  
  return (
    <MotionChip
      className="dragging"
      label={
        expanded ? (
          <Box component="span">
            <Typography variant="body2" component="span">{job.title}</Typography>
            <Box sx={{ display: 'flex', alignItems: 'center', mt: 0.5, gap: 1 }}>
              {job.client && (
                <Typography variant="caption" component="span" color="text.secondary">
                  {job.client.name}
                </Typography>
              )}
              {job.startDate && (
                <Box component="span" sx={{ display: 'flex', alignItems: 'center' }}>
                  <TimeIcon fontSize="inherit" sx={{ mr: 0.5 }} />
                  <Typography variant="caption" component="span">
                    {formatTime(job.startDate)}
                  </Typography>
                </Box>
              )}
            </Box>
          </Box>
        ) : (
          <Box component="span" sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', width: '100%' }}>
            <Typography 
              variant="caption" 
              component="span"
              noWrap 
              sx={{ 
                maxWidth: showTime ? 60 : 100,
                overflow: 'hidden',
                textOverflow: 'ellipsis'
              }}
            >
              {job.title}
            </Typography>
            {showTime && job.startDate && (
              <Typography variant="caption" component="span" sx={{ ml: 1 }}>
                {formatTime(job.startDate)}
              </Typography>
            )}
          </Box>
        )
      }
      size="small"
      onMouseDown={(e) => onDragStart(job, e)}
      onMouseUp={onDragEnd}
      onClick={(e) => {
        e.stopPropagation();
        onClick(job.id);
      }}
      sx={{
        mb: 0.5,
        width: '100%',
        height: expanded ? 'auto' : 24,
        justifyContent: 'flex-start',
        bgcolor: getStatusColor(job.status),
        color: 'white',
        '& .MuiChip-label': {
          px: 1,
          width: '100%'
        },
        '&:hover': {
          bgcolor: alpha(getStatusColor(job.status), 0.8),
          boxShadow: `0 2px 4px ${alpha(theme.palette.common.black, 0.15)}`,
          transform: 'translateY(-1px)'
        },
        transition: 'all 0.2s ease'
      }}
      icon={
        hasConflict ? (
          <Tooltip title="Schedule conflict detected">
            <WarningIcon fontSize="small" color="error" />
          </Tooltip>
        ) : null
      }
    />
  );
};

export default CalendarView; 