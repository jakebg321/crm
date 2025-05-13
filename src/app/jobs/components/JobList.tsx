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
  Typography,
} from '@mui/material';
import { MoreVert as MoreVertIcon } from '@mui/icons-material';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  startDate: string;
  endDate?: string;
  price: number;
  client: {
    name: string;
    address: string;
  };
}

interface JobListProps {
  jobs: Job[];
  onStatusChange: (jobId: string, status: string) => void;
  onMenuClick: (event: React.MouseEvent<HTMLElement>, jobId: string) => void;
}

const MotionTableRow = motion(TableRow);

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

export default function JobList({ jobs, onStatusChange, onMenuClick }: JobListProps) {
  const router = useRouter();

  return (
    <TableContainer component={Paper}>
      <Table>
        <TableHead>
          <TableRow>
            <TableCell>Title</TableCell>
            <TableCell>Client</TableCell>
            <TableCell>Address</TableCell>
            <TableCell>Date</TableCell>
            <TableCell>Time</TableCell>
            <TableCell>Status</TableCell>
            <TableCell>Actions</TableCell>
          </TableRow>
        </TableHead>
        <TableBody>
          {jobs.map((job) => (
            <MotionTableRow
              key={job.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => router.push(`/jobs/${job.id}`)}
              sx={{ cursor: 'pointer' }}
            >
              <TableCell>{job.title}</TableCell>
              <TableCell>{job.client?.name}</TableCell>
              <TableCell>{job.client?.address}</TableCell>
              <TableCell>
                {job.startDate ? new Date(job.startDate).toLocaleDateString() : '-'}
              </TableCell>
              <TableCell>
                {job.startDate ? new Date(job.startDate).toLocaleTimeString() : '-'}
              </TableCell>
              <TableCell>
                <Chip
                  label={job.status}
                  color={getStatusColor(job.status)}
                  size="small"
                />
              </TableCell>
              <TableCell>
                <IconButton
                  size="small"
                  onClick={(e) => {
                    e.stopPropagation();
                    onMenuClick(e, job.id);
                  }}
                >
                  <MoreVertIcon />
                </IconButton>
              </TableCell>
            </MotionTableRow>
          ))}
        </TableBody>
      </Table>
    </TableContainer>
  );
} 