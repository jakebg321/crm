// Client Details Route - Displays and manages individual client information and their associated jobs
'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Layout from '../../../components/Layout';
import { 
  Box, 
  Typography, 
  Paper, 
  Grid, 
  Button, 
  IconButton, 
  Divider,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Alert,
  Snackbar,
  Chip,
  Card,
  CardContent,
} from '@mui/material';
import {
  Edit as EditIcon,
  Delete as DeleteIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
  CalendarToday as CalendarIcon,
  AttachMoney as MoneyIcon,
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { useSession } from 'next-auth/react';

interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  jobs: Job[];
  estimates: Estimate[];
  _count: {
    jobs: number;
    estimates: number;
  };
}

interface Job {
  id: string;
  title: string;
  description: string;
  status: 'PENDING' | 'SCHEDULED' | 'IN_PROGRESS' | 'COMPLETED' | 'CANCELLED';
  type: 'LAWN_MAINTENANCE' | 'LANDSCAPE_DESIGN' | 'TREE_SERVICE' | 'IRRIGATION' | 'HARDSCAPING' | 'CLEANUP' | 'PLANTING' | 'FERTILIZATION';
  startDate: string;
  endDate?: string;
  price: number;
}

interface Estimate {
  id: string;
  title: string;
  description: string;
  status: string;
  price: number;
  validUntil: string;
}

export default function ClientDetails() {
  const theme = useTheme();
  const params = useParams();
  const router = useRouter();
  const { status } = useSession();
  const [client, setClient] = useState<Client | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [openEditDialog, setOpenEditDialog] = useState(false);
  const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
  const [snackbar, setSnackbar] = useState({ open: false, message: '', severity: 'success' as 'success' | 'error' });
  
  // Form state
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });

  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    } else if (status === "authenticated") {
      fetchClient();
    }
  }, [status, params.id]);

  const fetchClient = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`);
      if (!response.ok) throw new Error('Failed to fetch client');
      const data = await response.json();
      setClient(data);
      setFormData({
        name: data.name,
        email: data.email,
        phone: data.phone,
        address: data.address,
        city: data.city,
        state: data.state,
        zipCode: data.zipCode,
        notes: data.notes || '',
      });
    } catch (err) {
      setError('Failed to load client details');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleEdit = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      if (!response.ok) throw new Error('Failed to update client');

      const updatedClient = await response.json();
      setClient(updatedClient);
      setOpenEditDialog(false);
      setSnackbar({
        open: true,
        message: 'Client updated successfully',
        severity: 'success',
      });
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to update client',
        severity: 'error',
      });
    }
  };

  const handleDelete = async () => {
    try {
      const response = await fetch(`/api/clients/${params.id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete client');

      setSnackbar({
        open: true,
        message: 'Client deleted successfully',
        severity: 'success',
      });
      router.push('/clients');
    } catch (err) {
      setSnackbar({
        open: true,
        message: 'Failed to delete client',
        severity: 'error',
      });
    }
  };

  if (loading) return <Layout><Box sx={{ p: 6, textAlign: 'center' }}>Loading...</Box></Layout>;
  if (error) return <Layout><Box sx={{ p: 6, textAlign: 'center', color: 'error.main' }}>{error}</Box></Layout>;
  if (!client) return <Layout><Box sx={{ p: 6, textAlign: 'center' }}>Client not found</Box></Layout>;

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
            {client.name}
          </Typography>
          <Box>
            <Button
              variant="outlined"
              startIcon={<EditIcon />}
              onClick={() => setOpenEditDialog(true)}
              sx={{ mr: 1 }}
            >
              Edit
            </Button>
            <Button
              variant="outlined"
              color="error"
              startIcon={<DeleteIcon />}
              onClick={() => setOpenDeleteDialog(true)}
            >
              Delete
            </Button>
          </Box>
        </Box>

        <Grid container spacing={3}>
          {/* Client Information */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 'none',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Contact Information
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <EmailIcon color="action" />
                  <Typography variant="body1">{client.email}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <PhoneIcon color="action" />
                  <Typography variant="body1">{client.phone}</Typography>
                </Box>
                <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                  <LocationIcon color="action" />
                  <Typography variant="body1">
                    {client.address}, {client.city}, {client.state} {client.zipCode}
                  </Typography>
                </Box>
                {client.notes && (
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" color="text.secondary" gutterBottom>
                      Notes
                    </Typography>
                    <Typography variant="body2">{client.notes}</Typography>
                  </Box>
                )}
              </Box>
            </Paper>
          </Grid>

          {/* Statistics */}
          <Grid item xs={12} md={6}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 'none',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Statistics
              </Typography>
              <Grid container spacing={2}>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="primary" sx={{ fontWeight: 700 }}>
                      {client._count.jobs}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Jobs
                    </Typography>
                  </Box>
                </Grid>
                <Grid item xs={6}>
                  <Box sx={{ textAlign: 'center' }}>
                    <Typography variant="h4" color="secondary" sx={{ fontWeight: 700 }}>
                      {client._count.estimates}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      Total Estimates
                    </Typography>
                  </Box>
                </Grid>
              </Grid>
            </Paper>
          </Grid>

          {/* Recent Jobs */}
          <Grid item xs={12}>
            <Paper
              sx={{
                p: 3,
                borderRadius: 3,
                boxShadow: 'none',
                border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              }}
            >
              <Typography variant="h6" gutterBottom sx={{ fontWeight: 600 }}>
                Recent Jobs
              </Typography>
              <Grid container spacing={2}>
                {(client.jobs || []).map((job) => (
                  <Grid item xs={12} sm={6} md={4} key={job.id}>
                    <Card
                      sx={{
                        height: '100%',
                        boxShadow: 'none',
                        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
                        '&:hover': {
                          boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.12)}`,
                        },
                      }}
                    >
                      <CardContent>
                        <Typography variant="h6" gutterBottom>
                          {job.title}
                        </Typography>
                        <Box sx={{ display: 'flex', gap: 1, mb: 1 }}>
                          <Chip 
                            label={job.status} 
                            size="small"
                            color={
                              job.status === 'COMPLETED' ? 'success' :
                              job.status === 'IN_PROGRESS' ? 'primary' :
                              job.status === 'SCHEDULED' ? 'info' :
                              job.status === 'CANCELLED' ? 'error' :
                              'default'
                            }
                          />
                          <Chip 
                            label={job.type} 
                            size="small"
                            variant="outlined"
                          />
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
                          <CalendarIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            {new Date(job.startDate).toLocaleDateString()}
                          </Typography>
                        </Box>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                          <MoneyIcon fontSize="small" color="action" />
                          <Typography variant="body2">
                            ${job.price.toLocaleString()}
                          </Typography>
                        </Box>
                      </CardContent>
                    </Card>
                  </Grid>
                ))}
              </Grid>
            </Paper>
          </Grid>
        </Grid>
      </Box>

      {/* Edit Dialog */}
      <Dialog open={openEditDialog} onClose={() => setOpenEditDialog(false)} maxWidth="sm" fullWidth>
        <DialogTitle>Edit Client</DialogTitle>
        <DialogContent>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 2 }}>
            <TextField
              label="Name"
              value={formData.name}
              onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
              required
            />
            <TextField
              label="Email"
              type="email"
              value={formData.email}
              onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
              required
            />
            <TextField
              label="Phone"
              value={formData.phone}
              onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
              required
            />
            <TextField
              label="Address"
              value={formData.address}
              onChange={(e) => setFormData(prev => ({ ...prev, address: e.target.value }))}
              required
            />
            <Box sx={{ display: 'flex', gap: 2 }}>
              <TextField
                label="City"
                value={formData.city}
                onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                required
                sx={{ flex: 1 }}
              />
              <TextField
                label="State"
                value={formData.state}
                onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                required
                sx={{ width: '30%' }}
              />
              <TextField
                label="ZIP Code"
                value={formData.zipCode}
                onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                required
                sx={{ width: '30%' }}
              />
            </Box>
            <TextField
              label="Notes"
              multiline
              rows={3}
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
            />
          </Box>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenEditDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            onClick={handleEdit}
            disabled={!formData.name || !formData.email || !formData.phone || !formData.address || !formData.city || !formData.state || !formData.zipCode}
          >
            Save Changes
          </Button>
        </DialogActions>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={openDeleteDialog} onClose={() => setOpenDeleteDialog(false)}>
        <DialogTitle>Delete Client</DialogTitle>
        <DialogContent>
          <Typography>
            Are you sure you want to delete this client? This action cannot be undone.
          </Typography>
        </DialogContent>
        <DialogActions>
          <Button onClick={() => setOpenDeleteDialog(false)}>Cancel</Button>
          <Button 
            variant="contained" 
            color="error" 
            onClick={handleDelete}
          >
            Delete
          </Button>
        </DialogActions>
      </Dialog>

      {/* Snackbar for notifications */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={6000}
        onClose={() => setSnackbar(prev => ({ ...prev, open: false }))}
      >
        <Alert 
          onClose={() => setSnackbar(prev => ({ ...prev, open: false }))} 
          severity={snackbar.severity}
          sx={{ width: '100%' }}
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </Layout>
  );
} 