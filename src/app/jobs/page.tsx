'use client';

import {
  Box,
  Button,
  Chip,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Typography,
  IconButton,
  InputAdornment,
  TextField,
  Grid,
  Divider
} from '@mui/material';
import { 
  Add as AddIcon,
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon
} from '@mui/icons-material';
import Layout from '../../components/Layout';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';

const MotionPaper = motion(Paper);
const MotionTableRow = motion(TableRow);

const jobs = [
  {
    id: 'JOB-457-813',
    client: 'John Anderson',
    address: '4350 Harden Park',
    type: 'Lawn Maintenance',
    status: 'Scheduled',
    date: '13 Jul',
    time: '10:30am',
  },
  {
    id: 'JOB-835-020',
    client: 'Sarah Williams',
    address: '4029 Anderson Ave',
    type: 'Landscape Design',
    status: 'In Progress',
    date: '14 Jul',
    time: '2:00pm',
  },
  {
    id: 'JOB-146-557',
    client: 'Mike Johnson',
    address: '4235 Westbrook land',
    type: 'Tree Removal',
    status: 'Completed',
    date: '15 Jul',
    time: '9:00am',
  },
  {
    id: 'JOB-386-192',
    client: 'Emily Davis',
    address: '1820 Lakeside Drive',
    type: 'Irrigation',
    status: 'Scheduled',
    date: '16 Jul',
    time: '1:00pm',
  },
  {
    id: 'JOB-725-901',
    client: 'Robert Wilson',
    address: '3294 Pine Avenue',
    type: 'Hardscaping',
    status: 'Pending',
    date: '17 Jul',
    time: '11:00am',
  },
];

const statusCounts = {
  total: jobs.length,
  scheduled: jobs.filter(job => job.status.toLowerCase() === 'scheduled').length,
  inProgress: jobs.filter(job => job.status.toLowerCase() === 'in progress').length,
  completed: jobs.filter(job => job.status.toLowerCase() === 'completed').length,
  pending: jobs.filter(job => job.status.toLowerCase() === 'pending').length,
};

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'info';
    case 'in progress':
      return 'warning';
    case 'completed':
      return 'success';
    case 'pending':
      return 'default';
    default:
      return 'default';
  }
};

export default function Jobs() {
  const theme = useTheme();

  return (
    <Layout>
      <Box
        component={motion.div}
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        sx={{ mb: 5 }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography 
            variant="h4"
            sx={{ 
              fontWeight: 700, 
              color: theme.palette.text.primary 
            }}
          >
            Jobs
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
            New Job
          </Button>
        </Box>
        <Typography 
          variant="body1" 
          color="text.secondary"
          sx={{ mb: 4 }}
        >
          Manage and track all your landscaping jobs
        </Typography>

        <Grid container spacing={3} sx={{ mb: 4 }}>
          {[
            { 
              title: 'Total Jobs', 
              value: statusCounts.total, 
              color: theme.palette.text.primary, 
              background: theme.palette.secondary.main,
              border: 'none'
            },
            { 
              title: 'Scheduled', 
              value: statusCounts.scheduled, 
              color: theme.palette.info.main, 
              background: theme.palette.secondary.main,
              border: 'none'
            },
            { 
              title: 'In Progress', 
              value: statusCounts.inProgress, 
              color: theme.palette.warning.main, 
              background: theme.palette.secondary.main,
              border: 'none'
            },
            { 
              title: 'Completed', 
              value: statusCounts.completed, 
              color: theme.palette.success.main, 
              background: theme.palette.secondary.main,
              border: 'none'
            },
          ].map((item, index) => (
            <Grid item xs={6} sm={3} key={item.title}>
              <MotionPaper
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                sx={{
                  p: 2,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'flex-start',
                  background: index === 0 ? theme.palette.primary.main : theme.palette.secondary.main,
                  minHeight: 90,
                  position: 'relative',
                  overflow: 'hidden',
                  borderRadius: 3,
                  boxShadow: 'none',
                  '&:hover': {
                    transform: 'translateY(-4px)',
                    boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                  }
                }}
              >
                <Typography 
                  variant="h5" 
                  sx={{ 
                    fontWeight: 700, 
                    color: index === 0 ? theme.palette.secondary.main : item.color,
                    mb: 1,
                    position: 'relative',
                    zIndex: 1
                  }}
                >
                  {item.value}
                </Typography>
                <Typography 
                  variant="subtitle2" 
                  sx={{ 
                    color: index === 0 ? theme.palette.secondary.main : theme.palette.text.secondary,
                    position: 'relative',
                    zIndex: 1,
                    fontWeight: 500
                  }}
                >
                  {item.title}
                </Typography>
              </MotionPaper>
            </Grid>
          ))}
        </Grid>

        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
          <TextField
            placeholder="Search jobs..."
            size="small"
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ 
              width: 250,
              '& .MuiOutlinedInput-root': {
                borderRadius: 2,
                transition: 'all 0.2s ease-in-out',
                '&:hover': {
                  boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                }
              }
            }}
          />
          <Button 
            startIcon={<FilterListIcon />}
            variant="outlined"
            sx={{ 
              borderRadius: 2,
              '&:hover': {
                boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
              }
            }}
          >
            Filters
          </Button>
        </Box>

        <MotionPaper
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          sx={{ 
            overflow: 'hidden',
            borderRadius: 3,
            boxShadow: 'none',
            '&:hover': {
              transform: 'translateY(-4px)',
              boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
            }
          }}
        >
          <TableContainer>
            <Table sx={{ minWidth: 650 }} aria-label="jobs table">
              <TableHead>
                <TableRow
                  sx={{ 
                    backgroundColor: alpha(theme.palette.primary.main, 0.05),
                    '& th': {
                      fontWeight: 600,
                      color: theme.palette.text.primary,
                      borderBottom: `2px solid ${theme.palette.divider}`
                    }
                  }}
                >
                  <TableCell>Job ID</TableCell>
                  <TableCell>Client</TableCell>
                  <TableCell>Address</TableCell>
                  <TableCell>Type</TableCell>
                  <TableCell>Status</TableCell>
                  <TableCell>Date</TableCell>
                  <TableCell>Time</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {jobs.map((job, index) => (
                  <MotionTableRow
                    key={job.id}
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.3, delay: index * 0.05 }}
                    sx={{ 
                      '&:last-child td, &:last-child th': { border: 0 },
                      '&:hover': {
                        backgroundColor: alpha(theme.palette.primary.main, 0.02),
                      },
                      cursor: 'pointer',
                      transition: 'all 0.2s'
                    }}
                  >
                    <TableCell 
                      component="th" 
                      scope="row"
                      sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                    >
                      {job.id}
                    </TableCell>
                    <TableCell sx={{ fontWeight: 500 }}>{job.client}</TableCell>
                    <TableCell>{job.address}</TableCell>
                    <TableCell>{job.type}</TableCell>
                    <TableCell>
                      <Chip
                        label={job.status}
                        color={getStatusColor(job.status)}
                        size="small"
                        sx={{ 
                          fontWeight: 500,
                          '&:hover': {
                            transform: 'translateY(-2px)',
                            boxShadow: `0px 4px 8px ${alpha(theme.palette.primary.main, 0.1)}`,
                          }
                        }}
                      />
                    </TableCell>
                    <TableCell>{job.date}</TableCell>
                    <TableCell>{job.time}</TableCell>
                    <TableCell align="right">
                      <IconButton 
                        size="small"
                        sx={{ 
                          color: theme.palette.text.secondary,
                          '&:hover': {
                            color: theme.palette.primary.main,
                            backgroundColor: alpha(theme.palette.primary.main, 0.1),
                          }
                        }}
                      >
                        <MoreVertIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </MotionTableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        </MotionPaper>
      </Box>
    </Layout>
  );
} 