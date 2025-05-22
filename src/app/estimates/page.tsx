'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Button,
  CircularProgress,
  Paper,
  Grid,
  Chip,
  IconButton,
  Tooltip,
  Card,
  CardContent,
  TextField,
  InputAdornment,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Container,
} from '@mui/material';
import AddIcon from '@mui/icons-material/Add';
import SearchIcon from '@mui/icons-material/Search';
import VisibilityIcon from '@mui/icons-material/Visibility';
import EditIcon from '@mui/icons-material/Edit';
import ContentCopyIcon from '@mui/icons-material/ContentCopy';
import DeleteIcon from '@mui/icons-material/Delete';
import EmailIcon from '@mui/icons-material/Email';
import CategoryIcon from '@mui/icons-material/Category';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import AddEstimateDialog from './components/AddEstimateDialog';
import { formatCurrency, formatDate } from '@/utils/formatters';
import Navigation from '@/components/Navigation';

const statusColors = {
  DRAFT: 'warning',
  SENT: 'info',
  ACCEPTED: 'success',
  REJECTED: 'error',
  EXPIRED: 'default',
};

export default function EstimatesPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [estimates, setEstimates] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchQuery, setSearchQuery] = useState('');
  const [openAddDialog, setOpenAddDialog] = useState(false);
  const [openEmailDialog, setOpenEmailDialog] = useState(false);
  const [selectedEstimate, setSelectedEstimate] = useState(null);
  const [emailData, setEmailData] = useState({
    to: '',
    subject: '',
    message: '',
    sendCopy: true,
  });
  const [sendingEmail, setSendingEmail] = useState(false);

  // Fetch estimates from the API
  useEffect(() => {
    if (status === 'authenticated') {
      fetchEstimates();
    }
  }, [status]);

  const fetchEstimates = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/estimates');
      if (!response.ok) {
        throw new Error('Failed to fetch estimates');
      }
      const data = await response.json();
      setEstimates(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleAddEstimate = () => {
    setOpenAddDialog(true);
  };

  const handleCloseDialog = (refresh = false) => {
    setOpenAddDialog(false);
    if (refresh) {
      fetchEstimates();
    }
  };

  const handleViewEstimate = (id) => {
    router.push(`/estimates/${id}`);
  };

  const handleEditEstimate = (id) => {
    router.push(`/estimates/${id}/edit`);
  };

  const handleDeleteEstimate = async (id) => {
    if (window.confirm('Are you sure you want to delete this estimate?')) {
      try {
        const response = await fetch(`/api/estimates/${id}`, {
          method: 'DELETE',
        });
        if (!response.ok) {
          throw new Error('Failed to delete estimate');
        }
        fetchEstimates();
      } catch (err) {
        setError(err.message);
      }
    }
  };

  const handleDuplicateEstimate = async (id) => {
    try {
      const response = await fetch(`/api/estimates/${id}/duplicate`, {
        method: 'POST',
      });
      if (!response.ok) {
        throw new Error('Failed to duplicate estimate');
      }
      fetchEstimates();
    } catch (err) {
      setError(err.message);
    }
  };

  const handleEmailEstimate = (estimate) => {
    setSelectedEstimate(estimate);
    setEmailData({
      to: estimate.client?.email || '',
      subject: `Estimate: ${estimate.title}`,
      message: `Dear ${estimate.client?.name},\n\nAttached is our estimate (${estimate.title}) for your review.\n\nThe total amount is ${formatCurrency(estimate.price)}.\n\nPlease let us know if you have any questions.\n\nThank you,\n${session?.user?.name}`,
      sendCopy: true,
    });
    setOpenEmailDialog(true);
  };

  const handleEmailInputChange = (e) => {
    const { name, value, checked } = e.target;
    setEmailData({
      ...emailData,
      [name]: name === 'sendCopy' ? checked : value,
    });
  };

  const handleSendEmail = async () => {
    if (!selectedEstimate || !emailData.to || !emailData.subject) return;
    
    setSendingEmail(true);
    
    try {
      // This will need to be implemented in the API
      const response = await fetch(`/api/estimates/${selectedEstimate.id}/email`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(emailData),
      });
      
      if (!response.ok) {
        throw new Error('Failed to send email');
      }
      
      // Success - close dialog and maybe update status
      setOpenEmailDialog(false);
      
      // If you want to update estimate status to SENT
      if (selectedEstimate.status === 'DRAFT') {
        await fetch(`/api/estimates/${selectedEstimate.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ status: 'SENT' }),
        });
      }
      
      // Refresh the list
      fetchEstimates();
      alert('Email sent successfully!');
    } catch (err) {
      setError(err.message);
    } finally {
      setSendingEmail(false);
    }
  };

  const filteredEstimates = estimates.filter(
    (estimate) =>
      estimate.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      estimate.client?.name?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (status === 'unauthenticated') {
    router.push('/login');
    return null;
  }

  return (
    <>
      <Navigation />
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          p: 3,
          pt: { xs: 8, sm: 8 },
          pb: 3,
          ml: { xs: 0, sm: '240px' },
          width: { xs: '100%', sm: 'calc(100% - 240px)' },
          minHeight: '100vh',
          background: '#f5f5f5',
          position: 'relative',
          zIndex: 0
        }}
      >
        <Container maxWidth="xl" sx={{ mt: 2 }}>
          <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 4 }}>
            <Typography variant="h4" component="h1">
              Estimates
            </Typography>
            <Box>
              <Button
                variant="outlined"
                color="primary"
                startIcon={<AutoFixHighIcon />}
                onClick={() => router.push('/estimates/ai')}
                sx={{ mr: 2 }}
              >
                AI Estimate
              </Button>
              <Button
                variant="outlined"
                startIcon={<AutoFixHighIcon />}
                onClick={() => router.push('/estimates/materials/ai')}
                sx={{ mr: 2 }}
              >
                AI Materials
              </Button>
              <Button
                variant="outlined"
                startIcon={<CategoryIcon />}
                onClick={() => router.push('/estimates/materials')}
                sx={{ mr: 2 }}
              >
                Manage Materials
              </Button>
              <Button
                variant="contained"
                color="primary"
                startIcon={<AddIcon />}
                onClick={handleAddEstimate}
              >
                New Estimate
              </Button>
            </Box>
          </Box>

          <Paper elevation={2} sx={{ p: 3, mb: 3, borderRadius: 2 }}>
            <TextField
              fullWidth
              placeholder="Search estimates by title or client name..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <SearchIcon />
                  </InputAdornment>
                ),
              }}
              sx={{ mb: 3 }}
              variant="outlined"
            />

            {error && (
              <Typography color="error" sx={{ mb: 2 }}>
                {error}
              </Typography>
            )}

            {loading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
                <CircularProgress />
              </Box>
            ) : (
              <>
                {filteredEstimates.length === 0 ? (
                  <Box sx={{ textAlign: 'center', py: 6 }}>
                    <Typography variant="h6" color="text.secondary" gutterBottom>
                      No estimates found
                    </Typography>
                    <Typography color="text.secondary" gutterBottom>
                      Create your first estimate to get started
                    </Typography>
                    <Button
                      variant="contained"
                      color="primary"
                      startIcon={<AddIcon />}
                      onClick={handleAddEstimate}
                      sx={{ mt: 2 }}
                    >
                      New Estimate
                    </Button>
                  </Box>
                ) : (
                  <Grid container spacing={3}>
                    {filteredEstimates.map((estimate) => (
                      <Grid item xs={12} sm={6} md={4} key={estimate.id}>
                        <Card 
                          sx={{ 
                            height: '100%',
                            transition: 'transform 0.2s, box-shadow 0.2s',
                            '&:hover': {
                              transform: 'translateY(-4px)',
                              boxShadow: 4,
                            },
                            cursor: 'pointer'
                          }}
                          onClick={() => handleViewEstimate(estimate.id)}
                        >
                          <CardContent>
                            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                              <Typography variant="h6" noWrap sx={{ maxWidth: '70%' }}>
                                {estimate.title}
                              </Typography>
                              <Chip
                                label={estimate.status}
                                color={statusColors[estimate.status] || 'default'}
                                size="small"
                              />
                            </Box>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Client: {estimate.client?.name || 'N/A'}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Price: {formatCurrency(estimate.price)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Valid Until: {formatDate(estimate.validUntil)}
                            </Typography>
                            <Typography variant="body2" color="text.secondary" gutterBottom>
                              Line Items: {estimate.lineItems?.length || 0}
                            </Typography>
                            
                            <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 2 }}
                              onClick={(e) => e.stopPropagation()}
                            >
                              <Tooltip title="Email">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEmailEstimate(estimate);
                                  }}
                                >
                                  <EmailIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Edit">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleEditEstimate(estimate.id);
                                  }}
                                >
                                  <EditIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Duplicate">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDuplicateEstimate(estimate.id);
                                  }}
                                >
                                  <ContentCopyIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                              <Tooltip title="Delete">
                                <IconButton 
                                  size="small" 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    handleDeleteEstimate(estimate.id);
                                  }}
                                >
                                  <DeleteIcon fontSize="small" />
                                </IconButton>
                              </Tooltip>
                            </Box>
                          </CardContent>
                        </Card>
                      </Grid>
                    ))}
                  </Grid>
                )}
              </>
            )}
          </Paper>
        </Container>

        <AddEstimateDialog open={openAddDialog} onClose={handleCloseDialog} />
        
        {/* Email Estimate Dialog */}
        <Dialog open={openEmailDialog} onClose={() => setOpenEmailDialog(false)} maxWidth="md" fullWidth>
          <DialogTitle>Email Estimate</DialogTitle>
          <DialogContent>
            <Typography variant="subtitle1" gutterBottom>
              Sending estimate: {selectedEstimate?.title}
            </Typography>
            
            <TextField
              margin="normal"
              fullWidth
              label="To"
              name="to"
              value={emailData.to}
              onChange={handleEmailInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Subject"
              name="subject"
              value={emailData.subject}
              onChange={handleEmailInputChange}
              required
              sx={{ mb: 2 }}
            />
            
            <TextField
              margin="normal"
              fullWidth
              label="Message"
              name="message"
              value={emailData.message}
              onChange={handleEmailInputChange}
              multiline
              rows={6}
              sx={{ mb: 2 }}
            />
            
            <Box sx={{ mb: 2, display: 'flex', alignItems: 'center' }}>
              <input
                type="checkbox"
                id="sendCopy"
                name="sendCopy"
                checked={emailData.sendCopy}
                onChange={handleEmailInputChange}
              />
              <label htmlFor="sendCopy" style={{ marginLeft: '8px' }}>
                Send me a copy
              </label>
            </Box>
            
            <Paper sx={{ p: 2, bgcolor: '#f5f5f5' }}>
              <Typography variant="body2" gutterBottom>
                <strong>Note:</strong> This will generate a PDF of the estimate and send it to the client.
              </Typography>
              <Typography variant="body2">
                If the estimate status is DRAFT, it will be changed to SENT after the email is sent.
              </Typography>
            </Paper>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenEmailDialog(false)}>Cancel</Button>
            <Button 
              variant="contained" 
              color="primary" 
              onClick={handleSendEmail}
              disabled={sendingEmail || !emailData.to || !emailData.subject}
            >
              {sendingEmail ? <CircularProgress size={24} /> : 'Send Email'}
            </Button>
          </DialogActions>
        </Dialog>
      </Box>
    </>
  );
} 