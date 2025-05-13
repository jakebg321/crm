'use client';

import { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Typography,
  Grid,
  Chip,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  CircularProgress,
  Alert,
} from '@mui/material';
import { useSession } from 'next-auth/react';
import Layout from '@/components/Layout';
import { UserRole, JobStatus } from '@prisma/client';

interface Employee {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  createdAt: string;
  updatedAt: string;
  assignedJobs: number;
  completedJobs: number;
}

interface Job {
  id: string;
  title: string;
  description: string | null;
  status: JobStatus;
  type: string | null;
  startDate: string | null;
  endDate: string | null;
  client: {
    name: string;
    address: string;
  } | null;
}

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`employee-tabpanel-${index}`}
      aria-labelledby={`employee-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 3 }}>{children}</Box>}
    </div>
  );
}

export default function EmployeeDetails({
  params,
}: {
  params: { id: string };
}) {
  const { data: session } = useSession();
  const [employee, setEmployee] = useState<Employee | null>(null);
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [tabValue, setTabValue] = useState(0);

  useEffect(() => {
    fetchEmployeeData();
  }, [params.id]);

  const fetchEmployeeData = async () => {
    try {
      // Fetch employee details
      const employeeResponse = await fetch(`/api/employees/${params.id}`);
      if (!employeeResponse.ok) throw new Error('Failed to fetch employee details');
      const employeeData = await employeeResponse.json();
      setEmployee(employeeData);

      // Fetch employee's jobs
      const jobsResponse = await fetch(`/api/employees/${params.id}/jobs`);
      if (!jobsResponse.ok) throw new Error('Failed to fetch employee jobs');
      const jobsData = await jobsResponse.json();
      setJobs(jobsData);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data');
    } finally {
      setLoading(false);
    }
  };

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  if (loading) {
    return (
      <Layout>
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 3 }}>
          <CircularProgress />
        </Box>
      </Layout>
    );
  }

  if (error) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">{error}</Alert>
        </Box>
      </Layout>
    );
  }

  if (!employee) {
    return (
      <Layout>
        <Box sx={{ p: 3 }}>
          <Alert severity="error">Employee not found</Alert>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box sx={{ p: 3 }}>
        <Paper sx={{ p: 3, mb: 3 }}>
          <Grid container spacing={3}>
            <Grid item xs={12} md={6}>
              <Typography variant="h4" component="h1" gutterBottom>
                {employee.name}
              </Typography>
              <Typography variant="body1" color="text.secondary" gutterBottom>
                {employee.email}
              </Typography>
              <Chip
                label={employee.role}
                color={
                  employee.role === UserRole.ADMIN
                    ? 'error'
                    : employee.role === UserRole.MANAGER
                    ? 'warning'
                    : 'primary'
                }
                sx={{ mt: 1 }}
              />
            </Grid>
            <Grid item xs={12} md={6}>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <Typography variant="body2" color="text.secondary">
                  Assigned Jobs: {employee.assignedJobs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Completed Jobs: {employee.completedJobs}
                </Typography>
                <Typography variant="body2" color="text.secondary">
                  Member since: {new Date(employee.createdAt).toLocaleDateString()}
                </Typography>
              </Box>
            </Grid>
          </Grid>
        </Paper>

        <Paper sx={{ width: '100%' }}>
          <Tabs
            value={tabValue}
            onChange={handleTabChange}
            aria-label="employee tabs"
          >
            <Tab label="Assigned Jobs" />
            <Tab label="Schedule" />
          </Tabs>

          <TabPanel value={tabValue} index={0}>
            <TableContainer>
              <Table>
                <TableHead>
                  <TableRow>
                    <TableCell>Title</TableCell>
                    <TableCell>Status</TableCell>
                    <TableCell>Type</TableCell>
                    <TableCell>Client</TableCell>
                    <TableCell>Start Date</TableCell>
                    <TableCell>End Date</TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {jobs.map((job) => (
                    <TableRow key={job.id}>
                      <TableCell>{job.title}</TableCell>
                      <TableCell>
                        <Chip
                          label={job.status}
                          color={
                            job.status === JobStatus.COMPLETED
                              ? 'success'
                              : job.status === JobStatus.CANCELLED
                              ? 'error'
                              : job.status === JobStatus.IN_PROGRESS
                              ? 'warning'
                              : 'default'
                          }
                          size="small"
                        />
                      </TableCell>
                      <TableCell>{job.type || 'N/A'}</TableCell>
                      <TableCell>
                        {job.client ? (
                          <>
                            {job.client.name}
                            <Typography variant="caption" display="block">
                              {job.client.address}
                            </Typography>
                          </>
                        ) : (
                          'N/A'
                        )}
                      </TableCell>
                      <TableCell>
                        {job.startDate
                          ? new Date(job.startDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                      <TableCell>
                        {job.endDate
                          ? new Date(job.endDate).toLocaleDateString()
                          : 'N/A'}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </TableContainer>
          </TabPanel>

          <TabPanel value={tabValue} index={1}>
            {/* TODO: Implement schedule view */}
            <Typography variant="body1" color="text.secondary">
              Schedule view coming soon...
            </Typography>
          </TabPanel>
        </Paper>
      </Box>
    </Layout>
  );
} 