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
} from '@mui/material';
import { Add as AddIcon } from '@mui/icons-material';
import Layout from '../../components/Layout';

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
];

const getStatusColor = (status: string) => {
  switch (status.toLowerCase()) {
    case 'scheduled':
      return 'info';
    case 'in progress':
      return 'warning';
    case 'completed':
      return 'success';
    default:
      return 'default';
  }
};

export default function Jobs() {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Jobs</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            New Job
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage and track all your landscaping jobs
        </Typography>
      </Box>

      <TableContainer component={Paper}>
        <Table sx={{ minWidth: 650 }} aria-label="jobs table">
          <TableHead>
            <TableRow>
              <TableCell>Job ID</TableCell>
              <TableCell>Client</TableCell>
              <TableCell>Address</TableCell>
              <TableCell>Type</TableCell>
              <TableCell>Status</TableCell>
              <TableCell>Date</TableCell>
              <TableCell>Time</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {jobs.map((job) => (
              <TableRow
                key={job.id}
                sx={{ '&:last-child td, &:last-child th': { border: 0 } }}
              >
                <TableCell component="th" scope="row">
                  {job.id}
                </TableCell>
                <TableCell>{job.client}</TableCell>
                <TableCell>{job.address}</TableCell>
                <TableCell>{job.type}</TableCell>
                <TableCell>
                  <Chip
                    label={job.status}
                    color={getStatusColor(job.status)}
                    size="small"
                  />
                </TableCell>
                <TableCell>{job.date}</TableCell>
                <TableCell>{job.time}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Layout>
  );
} 