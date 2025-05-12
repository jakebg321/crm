// Jobs Page - Manages and displays job listings and job-related operations
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
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import Dialog from '@mui/material/Dialog';
import DialogTitle from '@mui/material/DialogTitle';
import DialogContent from '@mui/material/DialogContent';
import DialogActions from '@mui/material/DialogActions';
import FormControl from '@mui/material/FormControl';
import InputLabel from '@mui/material/InputLabel';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';
import CircularProgress from '@mui/material/CircularProgress';
import Menu from '@mui/material/Menu';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: string;
  type: string;
  startDate: string;
  endDate?: string;
  price: number;
  client: Client;
  address: string;
  date?: string;
  time?: string;
}

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

const MotionTableRow = motion(TableRow);

export default function Jobs() {
  const { status, data: session } = useSession();
  const router = useRouter();
  const theme = useTheme();
  const [jobs, setJobs] = useState<Job[]>([]);
  const [loading, setLoading] = useState(true);
  const [openDialog, setOpenDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    type: '',
    startDate: '',
    endDate: '',
    price: '',
    clientId: '',
    assignedToId: '',
  });
  const [clients, setClients] = useState<Client[]>([]);
  const [clientsLoading, setClientsLoading] = useState(false);
  const [openClientDialog, setOpenClientDialog] = useState(false);
  const [newClient, setNewClient] = useState({ name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' });
  const [clientError, setClientError] = useState('');
  const [clientLoading, setClientLoading] = useState(false);
  const [statusCounts, setStatusCounts] = useState({
    total: 0,
    scheduled: 0,
    inProgress: 0,
    completed: 0,
    pending: 0,
  });
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const [selectedJobId, setSelectedJobId] = useState<string | null>(null);
  const openMenu = Boolean(anchorEl);

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  useEffect(() => {
    if (status === "authenticated") {
      fetchJobs();
    }
  }, [status]);

  useEffect(() => {
    if (openDialog) fetchClients();
  }, [openDialog]);

  const fetchJobs = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/schedule?startDate=2000-01-01&endDate=2100-01-01");
      if (!res.ok) {
        throw new Error('Failed to fetch jobs');
      }
      const data = await res.json();
      const jobsArray = Array.isArray(data) ? data : [];
      setJobs(jobsArray);
      
      // Update status counts
      const counts = {
        total: jobsArray.length,
        scheduled: jobsArray.filter(job => job.status?.toLowerCase() === 'scheduled').length,
        inProgress: jobsArray.filter(job => job.status?.toLowerCase() === 'in progress').length,
        completed: jobsArray.filter(job => job.status?.toLowerCase() === 'completed').length,
        pending: jobsArray.filter(job => job.status?.toLowerCase() === 'pending').length,
      };
      setStatusCounts(counts);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to fetch jobs', 
        severity: 'error' 
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchClients = async () => {
    setClientsLoading(true);
    try {
      const res = await fetch('/api/clients');
      if (!res.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await res.json();
      setClients(Array.isArray(data) ? data : []);
    } catch (error) {
      setSnackbar({ 
        open: true, 
        message: error instanceof Error ? error.message : 'Failed to fetch clients', 
        severity: 'error' 
      });
      setClients([]);
    } finally {
      setClientsLoading(false);
    }
  };

  const handleAddJob = async () => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
        }),
      });
      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add job');
      }
      setOpenDialog(false);
      setFormData({
        title: '',
        description: '',
        type: '',
        startDate: '',
        endDate: '',
        price: '',
        clientId: '',
        assignedToId: '',
      });
      setSnackbar({ open: true, message: 'Job added successfully', severity: 'success' });
      fetchJobs();
    } catch (err) {
      let message = 'Failed to add job';
      if (err instanceof Error) message = err.message;
      setSnackbar({ open: true, message, severity: 'error' });
    }
  };

  const handleAddClient = async () => {
    setClientError('');
    setClientLoading(true);
    if (!newClient.name || !newClient.email || !newClient.phone || !newClient.address || !newClient.city || !newClient.state || !newClient.zipCode) {
      setClientError('All fields are required.');
      setClientLoading(false);
      return;
    }
    try {
      const res = await fetch('/api/clients', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(newClient),
      });
      if (!res.ok) {
        let errMsg = 'Failed to add client';
        try {
          const err = await res.json();
          errMsg = err.error || errMsg;
        } catch (e) {}
        setClientError(errMsg);
        setClientLoading(false);
        return;
      }
      const client = await res.json();
      setClients(prev => [...prev, client]);
      setFormData(prev => ({ ...prev, clientId: client.id }));
      setOpenClientDialog(false);
      setNewClient({ name: '', email: '', phone: '', address: '', city: '', state: '', zipCode: '' });
      setClientError('');
    } catch (e) {
      setClientError('Failed to add client (network error)');
    } finally {
      setClientLoading(false);
    }
  };

  const handleMenuOpen = (event: React.MouseEvent<HTMLElement>, jobId: string) => {
    setAnchorEl(event.currentTarget);
    setSelectedJobId(jobId);
  };
  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedJobId(null);
  };

  const handleStatusChange = async (status: string) => {
    if (!selectedJobId) return;
    try {
      const res = await fetch(`/api/schedule/${selectedJobId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });
      if (!res.ok) throw new Error('Failed to update job status');
      setSnackbar({ open: true, message: `Job marked as ${status.replace('_', ' ').toLowerCase()}`, severity: 'success' });
      fetchJobs();
    } catch (err) {
      setSnackbar({ open: true, message: 'Failed to update job status', severity: 'error' });
    } finally {
      handleMenuClose();
    }
  };

  if (status === "loading" || loading) return <div>Loading...</div>;

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
            onClick={() => setOpenDialog(true)}
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
              <motion.div><Paper
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
              </Paper></motion.div>
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

        <motion.div><Paper
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
                {jobs.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={8} sx={{ textAlign: 'center' }}>
                      <Typography variant="h6" sx={{ mb: 2 }}>No jobs yet</Typography>
                      <Typography variant="body1">Get started by creating your first job!</Typography>
                    </TableCell>
                  </TableRow>
                ) : (
                  jobs.map((job, index) => (
                    <TableRow
                      key={job.id}
                      sx={{ 
                        '&:last-child td, &:last-child th': { border: 0 },
                        '&:hover': {
                          backgroundColor: alpha(theme.palette.primary.main, 0.04),
                        },
                        cursor: 'pointer',
                        transition: 'all 0.2s'
                      }}
                      onClick={() => router.push(`/jobs/${job.id}`)}
                      tabIndex={0}
                      role="button"
                      aria-label={`Edit job ${job.id}`}
                    >
                      <TableCell 
                        component="th" 
                        scope="row"
                        sx={{ fontWeight: 600, color: theme.palette.primary.main }}
                      >
                        {job.id}
                      </TableCell>
                      <TableCell sx={{ fontWeight: 500 }}>{job.client?.name || 'N/A'}</TableCell>
                      <TableCell>{job.client?.address || 'N/A'}</TableCell>
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
                      <TableCell>{job.startDate ? new Date(job.startDate).toLocaleDateString() : 'N/A'}</TableCell>
                      <TableCell>{job.startDate ? new Date(job.startDate).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'N/A'}</TableCell>
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
                          onClick={e => { e.stopPropagation(); handleMenuOpen(e, job.id); }}
                        >
                          <MoreVertIcon fontSize="small" />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>
        </Paper></motion.div>
      </Box>
      {/* Add Job Dialog */}
      <Dialog open={openDialog} onClose={() => setOpenDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Job</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Title" value={formData.title} onChange={e => setFormData(prev => ({ ...prev, title: e.target.value }))} required />
            <TextField label="Description" multiline rows={3} value={formData.description} onChange={e => setFormData(prev => ({ ...prev, description: e.target.value }))} helperText="Optional" />
            <FormControl>
              <InputLabel>Type</InputLabel>
              <Select value={formData.type} label="Type" onChange={e => setFormData(prev => ({ ...prev, type: e.target.value }))} displayEmpty>
                <MenuItem value=""><em>None</em></MenuItem>
                <MenuItem value="LAWN_MAINTENANCE">Lawn Maintenance</MenuItem>
                <MenuItem value="LANDSCAPE_DESIGN">Landscape Design</MenuItem>
                <MenuItem value="TREE_SERVICE">Tree Service</MenuItem>
                <MenuItem value="IRRIGATION">Irrigation</MenuItem>
                <MenuItem value="HARDSCAPING">Hardscaping</MenuItem>
                <MenuItem value="CLEANUP">Cleanup</MenuItem>
                <MenuItem value="PLANTING">Planting</MenuItem>
                <MenuItem value="FERTILIZATION">Fertilization</MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary">Optional</Typography>
            </FormControl>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField label="Start Date" type="datetime-local" value={formData.startDate} onChange={e => setFormData(prev => ({ ...prev, startDate: e.target.value }))} InputLabelProps={{ shrink: true }} helperText="Optional" fullWidth />
              {formData.startDate && (
                <Button onClick={() => setFormData(prev => ({ ...prev, startDate: '' }))} size="small">Clear</Button>
              )}
            </Box>
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <TextField label="End Date" type="datetime-local" value={formData.endDate} onChange={e => setFormData(prev => ({ ...prev, endDate: e.target.value }))} InputLabelProps={{ shrink: true }} helperText="Optional" fullWidth />
              {formData.endDate && (
                <Button onClick={() => setFormData(prev => ({ ...prev, endDate: '' }))} size="small">Clear</Button>
              )}
            </Box>
            <TextField label="Price" type="number" value={formData.price} onChange={e => setFormData(prev => ({ ...prev, price: e.target.value }))} helperText="Optional" />
            <FormControl fullWidth>
              <InputLabel>Client</InputLabel>
              <Select
                value={formData.clientId}
                label="Client"
                onChange={e => setFormData(prev => ({ ...prev, clientId: e.target.value }))}
                endAdornment={clientsLoading ? <CircularProgress size={20} /> : null}
                displayEmpty
              >
                <MenuItem value=""><em>None</em></MenuItem>
                {clients.map(client => (
                  <MenuItem key={client.id} value={client.id}>{client.name} ({client.email})</MenuItem>
                ))}
                <MenuItem value="" disabled divider />
                <MenuItem value="__add_new__" onClick={() => setOpenClientDialog(true)}>
                  + Add New Client
                </MenuItem>
              </Select>
              <Typography variant="caption" color="text.secondary">Optional</Typography>
            </FormControl>
            <TextField label="Assigned To (User ID)" value={formData.assignedToId} onChange={e => setFormData(prev => ({ ...prev, assignedToId: e.target.value }))} placeholder="Leave blank for none" helperText="Optional" />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddJob} disabled={!formData.title}>
            Add Job
          </Button>
        </DialogActions>
      </Dialog>
      {/* Add New Client Dialog */}
      <Dialog open={openClientDialog} onClose={() => setOpenClientDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Add New Client</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField label="Name" value={newClient.name} onChange={e => setNewClient(prev => ({ ...prev, name: e.target.value }))} required />
            <TextField label="Email" value={newClient.email} onChange={e => setNewClient(prev => ({ ...prev, email: e.target.value }))} required />
            <TextField label="Phone" value={newClient.phone} onChange={e => setNewClient(prev => ({ ...prev, phone: e.target.value }))} required />
            <TextField label="Address" value={newClient.address} onChange={e => setNewClient(prev => ({ ...prev, address: e.target.value }))} required />
            <TextField label="City" value={newClient.city} onChange={e => setNewClient(prev => ({ ...prev, city: e.target.value }))} required />
            <TextField label="State" value={newClient.state} onChange={e => setNewClient(prev => ({ ...prev, state: e.target.value }))} required />
            <TextField label="Zip Code" value={newClient.zipCode} onChange={e => setNewClient(prev => ({ ...prev, zipCode: e.target.value }))} required />
            {clientError && <Alert severity="error">{clientError}</Alert>}
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenClientDialog(false)}>Cancel</Button>
          <Button variant="contained" onClick={handleAddClient} disabled={clientLoading || !newClient.name || !newClient.email || !newClient.phone || !newClient.address || !newClient.city || !newClient.state || !newClient.zipCode}>
            {clientLoading ? 'Adding...' : 'Add Client'}
          </Button>
        </DialogActions>
      </Dialog>
      {/* Snackbar for notifications */}
      <Snackbar open={snackbar.open} autoHideDuration={6000} onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}>
        <Alert onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} severity={snackbar.severity} sx={{ width: '100%' }}>
          {snackbar.message}
        </Alert>
      </Snackbar>
      <Menu
        anchorEl={anchorEl}
        open={openMenu}
        onClose={handleMenuClose}
        anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
        transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      >
        <MenuItem onClick={() => handleStatusChange('COMPLETED')}>Mark as Complete</MenuItem>
        <MenuItem onClick={() => handleStatusChange('CANCELLED')}>Mark as Cancelled</MenuItem>
      </Menu>
    </Layout>
  );
} 