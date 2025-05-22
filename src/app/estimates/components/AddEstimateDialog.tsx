'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Stepper,
  Step,
  StepLabel,
  TextField,
  MenuItem,
  FormControl,
  InputLabel,
  Select,
  Box,
  Typography,
  CircularProgress,
  Divider,
  IconButton,
  Grid,
  Paper,
  Table,
  TableHead,
  TableBody,
  TableCell,
  TableRow,
  InputAdornment,
} from '@mui/material';
import { DatePicker } from '@mui/x-date-pickers/DatePicker';
import { AdapterDateFns } from '@mui/x-date-pickers/AdapterDateFns';
import { LocalizationProvider } from '@mui/x-date-pickers/LocalizationProvider';
import CloseIcon from '@mui/icons-material/Close';
import AddIcon from '@mui/icons-material/Add';
import DeleteIcon from '@mui/icons-material/Delete';
import CategoryIcon from '@mui/icons-material/Category';
import LineItemForm from './LineItemForm';
import SavedItemsDrawer from './SavedItemsDrawer';
import { JobType } from '@prisma/client';

const steps = ['Client Information', 'Estimate Details', 'Line Items', 'Review'];

export default function AddEstimateDialog({ open, onClose }) {
  const { data: session } = useSession();
  const router = useRouter();
  const [activeStep, setActiveStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [clients, setClients] = useState([]);
  const [loadingClients, setLoadingClients] = useState(false);
  const [showSavedItems, setShowSavedItems] = useState(false);
  const [openNewClientDialog, setOpenNewClientDialog] = useState(false);
  const [newClientData, setNewClientData] = useState({
    name: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    notes: '',
  });
  const [clientFormErrors, setClientFormErrors] = useState({});

  // Form state
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    clientId: '',
    jobType: '',
    validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)), // Default 30 days from now
    lineItems: [],
  });

  // Fetch clients when dialog opens
  useEffect(() => {
    if (open) {
      fetchClients();
      
      // Check for saved form data in sessionStorage
      const savedFormData = sessionStorage.getItem('estimateFormData');
      if (savedFormData) {
        try {
          const parsedData = JSON.parse(savedFormData);
          
          // Ensure validUntil is a Date object
          if (parsedData.validUntil) {
            parsedData.validUntil = new Date(parsedData.validUntil);
          }
          
          setFormData(parsedData);
          // Clear the saved data
          sessionStorage.removeItem('estimateFormData');
        } catch (err) {
          console.error('Error parsing saved form data:', err);
        }
      }
    }
  }, [open]);

  // Calculate total price from line items
  const totalPrice = formData.lineItems.reduce(
    (sum, item) => sum + item.quantity * item.unitPrice,
    0
  );

  const fetchClients = async () => {
    setLoadingClients(true);
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) {
        throw new Error('Failed to fetch clients');
      }
      const data = await response.json();
      setClients(data);
    } catch (err) {
      setError('Failed to load clients. Please try again.');
    } finally {
      setLoadingClients(false);
    }
  };

  const handleNext = () => {
    setActiveStep((prevStep) => prevStep + 1);
  };

  const handleBack = () => {
    setActiveStep((prevStep) => prevStep - 1);
  };

  const handleClose = () => {
    setActiveStep(0);
    setFormData({
      title: '',
      description: '',
      clientId: '',
      jobType: '',
      validUntil: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      lineItems: [],
    });
    setError('');
    onClose();
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleDateChange = (date) => {
    setFormData({
      ...formData,
      validUntil: date,
    });
  };

  const handleAddLineItem = () => {
    const newItem = {
      id: `temp-${Date.now()}`,
      description: '',
      quantity: 1,
      unitPrice: 0,
      total: 0,
    };
    
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newItem],
    });
  };

  const handleUpdateLineItem = (index, updatedItem) => {
    const newLineItems = [...formData.lineItems];
    
    // Calculate the total
    const total = updatedItem.quantity * updatedItem.unitPrice;
    
    // Update the item with the calculated total
    newLineItems[index] = {
      ...updatedItem,
      total: total,
    };
    
    setFormData({
      ...formData,
      lineItems: newLineItems,
    });
  };

  const handleRemoveLineItem = (index) => {
    setFormData({
      ...formData,
      lineItems: formData.lineItems.filter((_, i) => i !== index),
    });
  };

  const handleSubmit = async () => {
    setLoading(true);
    setError('');

    try {
      const response = await fetch('/api/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...formData,
          price: totalPrice,
          createdById: session?.user?.id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create estimate');
      }

      handleClose();
      onClose(true); // Refresh the estimates list
    } catch (err) {
      setError(err.message);
      setActiveStep(0); // Go back to first step on error
    } finally {
      setLoading(false);
    }
  };

  const handleAddSavedItem = (savedItem) => {
    const newItem = {
      id: `temp-${Date.now()}`,
      description: savedItem.description,
      quantity: savedItem.quantity || 1,
      unitPrice: savedItem.unitPrice || 0,
      total: (savedItem.quantity || 1) * (savedItem.unitPrice || 0),
    };
    
    setFormData({
      ...formData,
      lineItems: [...formData.lineItems, newItem],
    });
    
    // Close the drawer after adding an item
    setShowSavedItems(false);
  };

  const handleOpenNewClientDialog = () => {
    setOpenNewClientDialog(true);
  };

  const handleCloseNewClientDialog = () => {
    setOpenNewClientDialog(false);
    setNewClientData({
      name: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      state: '',
      zipCode: '',
      notes: '',
    });
    setClientFormErrors({});
  };

  const handleNewClientInputChange = (e) => {
    const { name, value } = e.target;
    setNewClientData({
      ...newClientData,
      [name]: value,
    });
    
    // Clear error for this field when user types
    if (clientFormErrors[name]) {
      setClientFormErrors({
        ...clientFormErrors,
        [name]: '',
      });
    }
  };

  const validateClientForm = () => {
    const errors = {};
    
    if (!newClientData.name) errors.name = 'Name is required';
    if (!newClientData.email) errors.email = 'Email is required';
    else if (!/\S+@\S+\.\S+/.test(newClientData.email)) errors.email = 'Invalid email format';
    
    if (!newClientData.phone) errors.phone = 'Phone is required';
    if (!newClientData.address) errors.address = 'Address is required';
    if (!newClientData.city) errors.city = 'City is required';
    if (!newClientData.state) errors.state = 'State is required';
    if (!newClientData.zipCode) errors.zipCode = 'Zip code is required';
    
    setClientFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleCreateNewClient = async () => {
    if (!validateClientForm()) return;
    
    setLoading(true);
    
    try {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newClientData),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Failed to create client');
      }
      
      const newClient = await response.json();
      
      // Add the new client to the list and select it
      setClients([...clients, newClient]);
      setFormData({
        ...formData,
        clientId: newClient.id,
      });
      
      handleCloseNewClientDialog();
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const isStepValid = () => {
    switch (activeStep) {
      case 0: // Client Information
        return !!formData.clientId;
      case 1: // Estimate Details
        return !!formData.title && !!formData.validUntil;
      case 2: // Line Items
        return formData.lineItems.length > 0 && formData.lineItems.every(
          (item) => !!item.description && item.quantity > 0
        );
      case 3: // Review
        return true;
      default:
        return false;
    }
  };

  const getClientSelection = () => (
    <Box>
      <FormControl fullWidth required margin="normal">
        <InputLabel id="client-select-label">Client</InputLabel>
        <Select
          labelId="client-select-label"
          id="clientId"
          name="clientId"
          value={formData.clientId}
          onChange={handleInputChange}
          label="Client"
        >
          {loadingClients ? (
            <MenuItem disabled>Loading clients...</MenuItem>
          ) : (
            clients.map((client) => (
              <MenuItem key={client.id} value={client.id}>
                {client.name}
              </MenuItem>
            ))
          )}
        </Select>
        {clients.length === 0 && !loadingClients && (
          <Typography variant="caption" color="error">
            No clients found. Please create a client first.
          </Typography>
        )}
      </FormControl>
      
      <Box sx={{ mt: 2, textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" gutterBottom>
          Don't see the client you're looking for?
        </Typography>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleOpenNewClientDialog}
          sx={{ mt: 1 }}
        >
          Add New Client
        </Button>
      </Box>
    </Box>
  );

  const getEstimateDetails = () => (
    <Box>
      <TextField
        margin="normal"
        fullWidth
        label="Estimate Title"
        name="title"
        value={formData.title}
        onChange={handleInputChange}
        required
      />
      <TextField
        margin="normal"
        fullWidth
        label="Description"
        name="description"
        value={formData.description}
        onChange={handleInputChange}
        multiline
        rows={4}
      />
      <FormControl fullWidth margin="normal">
        <InputLabel id="job-type-label">Job Type</InputLabel>
        <Select
          labelId="job-type-label"
          id="jobType"
          name="jobType"
          value={formData.jobType}
          onChange={handleInputChange}
          label="Job Type"
        >
          {Object.values(JobType).map((type) => (
            <MenuItem key={type} value={type}>
              {type.replace('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      <LocalizationProvider dateAdapter={AdapterDateFns}>
        <DatePicker
          label="Valid Until"
          value={formData.validUntil}
          onChange={handleDateChange}
          slotProps={{
            textField: {
              fullWidth: true,
              margin: "normal",
              required: true,
            },
          }}
        />
      </LocalizationProvider>
    </Box>
  );

  const getLineItems = () => (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 2 }}>
        <Button
          variant="outlined"
          startIcon={<AddIcon />}
          onClick={handleAddLineItem}
        >
          Add Item
        </Button>
        <Box>
          <Button
            variant="outlined"
            startIcon={<CategoryIcon />}
            onClick={() => {
              // Save current form state before navigating
              const currentFormData = { ...formData };
              // Store in sessionStorage to preserve it during navigation
              sessionStorage.setItem('estimateFormData', JSON.stringify(currentFormData));
              router.push('/estimates/materials');
            }}
            sx={{ mr: 1 }}
          >
            Manage Materials
          </Button>
          <Button
            variant="outlined"
            onClick={() => setShowSavedItems(true)}
          >
            Saved Items
          </Button>
        </Box>
      </Box>

      {formData.lineItems.length === 0 ? (
        <Typography align="center" sx={{ my: 4 }}>
          No items added. Add line items to your estimate.
        </Typography>
      ) : (
        <Paper variant="outlined" sx={{ p: 2 }}>
          {formData.lineItems.map((item, index) => (
            <Box key={item.id} sx={{ mb: 2 }}>
              {index > 0 && <Divider sx={{ my: 2 }} />}
              <Box sx={{ display: 'flex', alignItems: 'flex-start' }}>
                <Box sx={{ flexGrow: 1 }}>
                  <LineItemForm
                    item={item}
                    onChange={(updatedItem) => handleUpdateLineItem(index, updatedItem)}
                  />
                </Box>
                <IconButton
                  color="error"
                  onClick={() => handleRemoveLineItem(index)}
                  sx={{ mt: 1 }}
                >
                  <DeleteIcon />
                </IconButton>
              </Box>
            </Box>
          ))}

          <Box sx={{ mt: 3, textAlign: 'right' }}>
            <Typography variant="h6">
              Total: ${totalPrice.toFixed(2)}
            </Typography>
          </Box>
        </Paper>
      )}

      {/* Use a separate div container to prevent drawer from affecting the main form layout */}
      <div>
        <SavedItemsDrawer
          open={showSavedItems}
          onClose={() => setShowSavedItems(false)}
          onAddItem={handleAddSavedItem}
        />
      </div>
    </Box>
  );

  const getReviewStep = () => (
    <Box>
      <Typography variant="h6" gutterBottom>
        Review Estimate
      </Typography>

      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Client Information
            </Typography>
            <Typography>
              {clients.find((c) => c.id === formData.clientId)?.name || 'No client selected'}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12} sm={6}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Estimate Details
            </Typography>
            <Typography gutterBottom>
              <strong>Title:</strong> {formData.title}
            </Typography>
            <Typography gutterBottom>
              <strong>Valid Until:</strong>{' '}
              {formData.validUntil.toLocaleDateString()}
            </Typography>
            <Typography gutterBottom>
              <strong>Total Price:</strong> ${totalPrice.toFixed(2)}
            </Typography>
          </Paper>
        </Grid>

        <Grid item xs={12}>
          <Paper sx={{ p: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Line Items ({formData.lineItems.length})
            </Typography>
            
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Description</TableCell>
                  <TableCell align="right">Quantity</TableCell>
                  <TableCell align="right">Unit Price</TableCell>
                  <TableCell align="right">Total</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {formData.lineItems.map((item) => (
                  <TableRow key={item.id}>
                    <TableCell>{item.description}</TableCell>
                    <TableCell align="right">{item.quantity}</TableCell>
                    <TableCell align="right">${item.unitPrice.toFixed(2)}</TableCell>
                    <TableCell align="right">
                      ${(item.quantity * item.unitPrice).toFixed(2)}
                    </TableCell>
                  </TableRow>
                ))}
                <TableRow>
                  <TableCell colSpan={3} align="right">
                    <strong>Total</strong>
                  </TableCell>
                  <TableCell align="right">
                    <strong>${totalPrice.toFixed(2)}</strong>
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );

  const getStepContent = (step) => {
    switch (step) {
      case 0:
        return getClientSelection();
      case 1:
        return getEstimateDetails();
      case 2:
        return getLineItems();
      case 3:
        return getReviewStep();
      default:
        return 'Unknown step';
    }
  };

  return (
    <>
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
        PaperProps={{
          sx: { minHeight: '60vh' },
        }}
      >
        <DialogTitle>
          Create New Estimate
          <IconButton
            aria-label="close"
            onClick={handleClose}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>

        <DialogContent dividers>
          {error && (
            <Typography color="error" sx={{ mb: 2 }}>
              {error}
            </Typography>
          )}

          <Stepper activeStep={activeStep} sx={{ mb: 4 }}>
            {steps.map((label) => (
              <Step key={label}>
                <StepLabel>{label}</StepLabel>
              </Step>
            ))}
          </Stepper>

          {getStepContent(activeStep)}
        </DialogContent>

        <DialogActions>
          <Button
            onClick={handleClose}
            color="inherit"
            disabled={loading}
          >
            Cancel
          </Button>
          <Button
            onClick={handleBack}
            color="inherit"
            disabled={activeStep === 0 || loading}
          >
            Back
          </Button>
          {activeStep === steps.length - 1 ? (
            <Button
              variant="contained"
              color="primary"
              onClick={handleSubmit}
              disabled={!isStepValid() || loading}
            >
              {loading ? <CircularProgress size={24} /> : 'Create Estimate'}
            </Button>
          ) : (
            <Button
              variant="contained"
              color="primary"
              onClick={handleNext}
              disabled={!isStepValid()}
            >
              Next
            </Button>
          )}
        </DialogActions>
      </Dialog>

      {/* New Client Dialog */}
      <Dialog 
        open={openNewClientDialog} 
        onClose={handleCloseNewClientDialog}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle>
          Add New Client
          <IconButton
            aria-label="close"
            onClick={handleCloseNewClientDialog}
            sx={{ position: 'absolute', right: 8, top: 8 }}
          >
            <CloseIcon />
          </IconButton>
        </DialogTitle>
        
        <DialogContent dividers>
          <Grid container spacing={2}>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Name"
                name="name"
                value={newClientData.name}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.name}
                helperText={clientFormErrors.name}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Email"
                name="email"
                type="email"
                value={newClientData.email}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.email}
                helperText={clientFormErrors.email}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="Phone"
                name="phone"
                value={newClientData.phone}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.phone}
                helperText={clientFormErrors.phone}
                InputProps={{
                  startAdornment: <InputAdornment position="start">+1</InputAdornment>,
                }}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Address"
                name="address"
                value={newClientData.address}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.address}
                helperText={clientFormErrors.address}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                margin="normal"
                label="City"
                name="city"
                value={newClientData.city}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.city}
                helperText={clientFormErrors.city}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                margin="normal"
                label="State"
                name="state"
                value={newClientData.state}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.state}
                helperText={clientFormErrors.state}
              />
            </Grid>
            <Grid item xs={12} sm={3}>
              <TextField
                fullWidth
                margin="normal"
                label="Zip Code"
                name="zipCode"
                value={newClientData.zipCode}
                onChange={handleNewClientInputChange}
                required
                error={!!clientFormErrors.zipCode}
                helperText={clientFormErrors.zipCode}
              />
            </Grid>
            <Grid item xs={12}>
              <TextField
                fullWidth
                margin="normal"
                label="Notes"
                name="notes"
                value={newClientData.notes}
                onChange={handleNewClientInputChange}
                multiline
                rows={3}
              />
            </Grid>
          </Grid>
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleCloseNewClientDialog} color="inherit">
            Cancel
          </Button>
          <Button 
            variant="contained" 
            color="primary" 
            onClick={handleCreateNewClient}
            disabled={loading}
          >
            {loading ? <CircularProgress size={24} /> : 'Create Client'}
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 