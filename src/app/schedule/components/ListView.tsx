import { useState } from 'react';
import { 
  Box, 
  Table, 
  TableBody, 
  TableCell, 
  TableContainer, 
  TableHead, 
  TableRow, 
  Paper, 
  Chip, 
  IconButton, 
  Avatar,
  Tooltip,
  Typography,
  TableSortLabel,
  Badge
} from '@mui/material';
import { 
  Edit as EditIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  Person as PersonIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { format, parseISO } from 'date-fns';
import { JobStatus, JobType } from '@prisma/client';
import { ExtendedJob, formatTime, getJobConflicts } from '../utils/scheduleHelpers';
import { motion } from 'framer-motion';

interface ListViewProps {
  jobs: ExtendedJob[];
  onJobClick: (jobId: string) => void;
  onEditJob: (jobId: string) => void;
  onDeleteJob: (jobId: string) => void;
  onDragStart: (job: ExtendedJob, event: React.MouseEvent) => void;
  onDragEnd: (event: React.MouseEvent) => void;
}

type Order = 'asc' | 'desc';
type SortableField = 'title' | 'startDate' | 'client' | 'assignedTo' | 'status' | 'type';

const ListView = ({
  jobs,
  onJobClick,
  onEditJob,
  onDeleteJob,
  onDragStart,
  onDragEnd
}: ListViewProps) => {
  const theme = useTheme();
  const [order, setOrder] = useState<Order>('asc');
  const [orderBy, setOrderBy] = useState<SortableField>('startDate');

  // Handle sorting
  const handleRequestSort = (property: SortableField) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // Sort function
  const sortJobs = (a: ExtendedJob, b: ExtendedJob) => {
    let valueA: any;
    let valueB: any;

    switch (orderBy) {
      case 'title':
        valueA = a.title.toLowerCase();
        valueB = b.title.toLowerCase();
        break;
      case 'startDate':
        valueA = a.startDate ? new Date(a.startDate).getTime() : 0;
        valueB = b.startDate ? new Date(b.startDate).getTime() : 0;
        break;
      case 'client':
        valueA = a.client?.name?.toLowerCase() || '';
        valueB = b.client?.name?.toLowerCase() || '';
        break;
      case 'assignedTo':
        valueA = a.assignedTo?.name?.toLowerCase() || '';
        valueB = b.assignedTo?.name?.toLowerCase() || '';
        break;
      case 'status':
        valueA = a.status;
        valueB = b.status;
        break;
      case 'type':
        valueA = a.type || '';
        valueB = b.type || '';
        break;
      default:
        valueA = a.startDate ? new Date(a.startDate).getTime() : 0;
        valueB = b.startDate ? new Date(b.startDate).getTime() : 0;
    }

    if (valueA < valueB) {
      return order === 'asc' ? -1 : 1;
    }
    if (valueA > valueB) {
      return order === 'asc' ? 1 : -1;
    }
    return 0;
  };

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

  const sortedJobs = [...jobs].sort(sortJobs);

  return (
    <Box>
      <TableContainer 
        component={Paper}
        sx={{ mb: 4, borderRadius: 2, overflow: 'hidden' }}
      >
        <Table sx={{ minWidth: 650 }} aria-label="jobs table">
          <TableHead sx={{ bgcolor: alpha(theme.palette.primary.main, 0.05) }}>
            <TableRow>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'title'}
                  direction={orderBy === 'title' ? order : 'asc'}
                  onClick={() => handleRequestSort('title')}
                >
                  Job Title
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'type'}
                  direction={orderBy === 'type' ? order : 'asc'}
                  onClick={() => handleRequestSort('type')}
                >
                  Type
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'startDate'}
                  direction={orderBy === 'startDate' ? order : 'asc'}
                  onClick={() => handleRequestSort('startDate')}
                >
                  Date & Time
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'client'}
                  direction={orderBy === 'client' ? order : 'asc'}
                  onClick={() => handleRequestSort('client')}
                >
                  Client
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'assignedTo'}
                  direction={orderBy === 'assignedTo' ? order : 'asc'}
                  onClick={() => handleRequestSort('assignedTo')}
                >
                  Assigned To
                </TableSortLabel>
              </TableCell>
              <TableCell>
                <TableSortLabel
                  active={orderBy === 'status'}
                  direction={orderBy === 'status' ? order : 'asc'}
                  onClick={() => handleRequestSort('status')}
                >
                  Status
                </TableSortLabel>
              </TableCell>
              <TableCell align="right">Actions</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {sortedJobs.map((job) => {
              const hasConflicts = getJobConflicts(job, jobs).length > 0;
              
              return (
                <TableRow
                  key={job.id}
                  hover
                  component={motion.tr}
                  whileHover={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.04),
                    transition: { duration: 0.1 }
                  }}
                  sx={{ 
                    '&:last-child td, &:last-child th': { border: 0 },
                    cursor: 'pointer'
                  }}
                  onClick={() => onJobClick(job.id)}
                  onMouseDown={(e) => onDragStart(job, e)}
                  onMouseUp={onDragEnd}
                >
                  <TableCell component="th" scope="row">
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      {hasConflicts && (
                        <Tooltip title="Schedule conflict detected">
                          <WarningIcon 
                            color="error" 
                            fontSize="small" 
                            sx={{ mr: 1 }}
                          />
                        </Tooltip>
                      )}
                      <Typography sx={{ fontWeight: 500 }}>
                        {job.title}
                      </Typography>
                    </Box>
                  </TableCell>
                  <TableCell>
                    {job.type && (
                      <Chip 
                        size="small" 
                        label={job.type.replace(/_/g, ' ')} 
                        sx={{ 
                          bgcolor: alpha(theme.palette.primary.main, 0.1),
                          color: theme.palette.primary.main,
                          fontWeight: 500
                        }}
                      />
                    )}
                  </TableCell>
                  <TableCell>
                    {job.startDate ? (
                      <Box>
                        <Typography variant="body2">
                          {format(parseISO(job.startDate), 'MMM d, yyyy')}
                        </Typography>
                        <Typography variant="caption" color="text.secondary">
                          {formatTime(job.startDate)}
                          {job.endDate && ` - ${formatTime(job.endDate)}`}
                        </Typography>
                        {job.duration && (
                          <Typography variant="caption" color="text.secondary" sx={{ display: 'block' }}>
                            Duration: {Math.floor(job.duration / 60)}h {job.duration % 60}m
                          </Typography>
                        )}
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="caption">
                        Not scheduled
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.client ? (
                      <Typography>{job.client.name}</Typography>
                    ) : (
                      <Typography color="text.secondary" variant="caption">
                        No client assigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    {job.assignedTo ? (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 24, height: 24, mr: 1 }}>
                          <PersonIcon fontSize="small" />
                        </Avatar>
                        <Typography>{job.assignedTo.name}</Typography>
                      </Box>
                    ) : (
                      <Typography color="text.secondary" variant="caption">
                        Unassigned
                      </Typography>
                    )}
                  </TableCell>
                  <TableCell>
                    <Chip 
                      size="small" 
                      label={job.status.replace(/_/g, ' ')} 
                      sx={{ 
                        bgcolor: alpha(getStatusColor(job.status), 0.15),
                        color: getStatusColor(job.status),
                        fontWeight: 500
                      }}
                    />
                  </TableCell>
                  <TableCell align="right">
                    <Box sx={{ display: 'flex', justifyContent: 'flex-end' }}>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onEditJob(job.id);
                        }}
                      >
                        <EditIcon fontSize="small" />
                      </IconButton>
                      <IconButton 
                        size="small" 
                        onClick={(e) => {
                          e.stopPropagation();
                          onDeleteJob(job.id);
                        }}
                      >
                        <DeleteIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </TableCell>
                </TableRow>
              );
            })}
            {sortedJobs.length === 0 && (
              <TableRow>
                <TableCell colSpan={7} align="center" sx={{ py: 4 }}>
                  <Typography variant="body1" color="text.secondary">
                    No jobs found for the selected period.
                  </Typography>
                  <Typography variant="body2" color="text.secondary">
                    Try changing your filters or date range.
                  </Typography>
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </TableContainer>
    </Box>
  );
};

export default ListView; 