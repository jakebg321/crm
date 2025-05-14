import React, { useState, useEffect, useRef } from 'react';
import {
  Box,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  Typography,
  FormGroup,
  FormControlLabel,
  Checkbox,
  Alert,
  Chip,
  Stack,
  InputAdornment,
  IconButton,
  Tooltip,
  CircularProgress
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Business as BusinessIcon,
  Flag as FlagIcon,
  Delete as DeleteIcon,
  Warning as WarningIcon,
  LocationOn as LocationIcon,
  Search as SearchIcon
} from '@mui/icons-material';
import { JobStatus, JobType } from '@prisma/client';
import { format } from 'date-fns';
import { ExtendedJob, calculateJobDuration, getJobConflicts } from '../utils/scheduleHelpers';
import { alpha, useTheme } from '@mui/material/styles';
import { getInputLabelProps, getInputLabelSx } from '@/utils/styleUtils';
import { Loader } from '@googlemaps/js-api-loader';

// Google Maps API key 
const GOOGLE_MAPS_API_KEY = 'AIzaSyBsOCfsqBpgSXoIGtrJkDIfX96L2k4g8YM';

// Define emptyFormData outside the component to prevent recreation on every render
const emptyFormData = {
  title: '',
  description: '',
  type: '',
  status: JobStatus.PENDING as JobStatus,
  startDate: '',
  endDate: '',
  price: '',
  clientId: '',
  assignedToId: '',
  isOwnerTask: false,
  flagColor: '',
  useCustomAddress: false,
  jobAddress: '',
  jobCity: '',
  jobState: '',
  jobZipCode: ''
};

interface JobFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (jobData: any) => Promise<void>;
  selectedDate?: Date | null;
  initialData?: ExtendedJob | null;
  users: Array<{ id: string; name: string }>;
  clients: Array<{ id: string; name: string }>;
  allJobs: ExtendedJob[];
  isEdit?: boolean;
}

const JobForm = ({
  open,
  onClose,
  onSubmit,
  selectedDate,
  initialData,
  users,
  clients,
  allJobs,
  isEdit = false
}: JobFormProps) => {
  const theme = useTheme();
  const [conflicts, setConflicts] = useState<ExtendedJob[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [addressLoading, setAddressLoading] = useState(false);
  const addressInputRef = useRef<HTMLInputElement>(null);
  const autocompleteRef = useRef<google.maps.places.Autocomplete | null>(null);
  const [placesLoaded, setPlacesLoaded] = useState(false);

  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    console.log('JobForm useEffect - selectedDate:', selectedDate);
    if (initialData) {
      // Extract custom address from description if present
      let useCustomAddr = false;
      let jobAddr = '';
      let jobCity = '';
      let jobState = '';
      let jobZipCode = '';
      let cleanDescription = initialData.description || '';
      
      if (initialData.description) {
        const addressMatch = initialData.description.match(/---JOB_ADDRESS---\s*(.*?)\s*(.*?),\s*(.*?)\s+(.*?)\s*---END_ADDRESS---/s);
        if (addressMatch) {
          useCustomAddr = true;
          jobAddr = addressMatch[1].trim();
          jobCity = addressMatch[2].trim();
          jobState = addressMatch[3].trim();
          jobZipCode = addressMatch[4].trim();
          
          // Remove the address block from the description
          cleanDescription = initialData.description.replace(/---JOB_ADDRESS---.*?---END_ADDRESS---/s, '').trim();
        }
      }
      
      // If no client is selected, ensure useCustomAddress is true
      if (!initialData.client?.id) {
        useCustomAddr = true;
      }
      
      setFormData({
        title: initialData.title || '',
        description: cleanDescription,
        type: initialData.type || '',
        status: initialData.status,
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        price: initialData.price?.toString() || '',
        clientId: initialData.client?.id || '',
        assignedToId: initialData.assignedTo?.id || '',
        isOwnerTask: initialData.title.startsWith('[OWNER] ') || false,
        flagColor: initialData.title.includes('[FLAG:') 
          ? initialData.title.match(/\[FLAG:(.*?)\]/)?.[1] || ''
          : '',
        useCustomAddress: useCustomAddr,
        jobAddress: jobAddr,
        jobCity: jobCity,
        jobState: jobState,
        jobZipCode: jobZipCode
      });
    } else {
      // For new jobs, initialize with the selected date
      const newDate = selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '';
      console.log('Setting new job startDate to:', newDate);
      
      // When creating a new job with no client, use custom address
      setFormData({
        ...emptyFormData,
        startDate: newDate,
        useCustomAddress: true
      });
    }
  }, [initialData, selectedDate, open]); // Removed emptyFormData from dependencies

  // Check for scheduling conflicts on form changes
  useEffect(() => {
    if (formData.startDate && formData.assignedToId) {
      const mockJob: ExtendedJob = {
        id: initialData?.id || 'temp-id',
        title: formData.title,
        description: formData.description,
        status: formData.status as JobStatus,
        type: formData.type as JobType || null,
        startDate: formData.startDate,
        endDate: formData.endDate || null,
        price: formData.price ? parseFloat(formData.price) : null,
        client: formData.clientId ? { id: formData.clientId, name: '' } : null,
        assignedTo: formData.assignedToId ? { id: formData.assignedToId, name: '' } : null,
      };

      const jobConflicts = getJobConflicts(mockJob, allJobs.filter(job => job.id !== initialData?.id));
      setConflicts(jobConflicts);
    } else {
      setConflicts([]);
    }
  }, [formData.startDate, formData.endDate, formData.assignedToId, initialData?.id, allJobs]);

  // Initialize Google Places Autocomplete
  useEffect(() => {
    if (!open || !formData.useCustomAddress || placesLoaded) return;

    const initializePlacesAPI = async () => {
      try {
        setAddressLoading(true);
        const loader = new Loader({
          apiKey: GOOGLE_MAPS_API_KEY,
          version: "weekly",
          libraries: ["places"]
        });

        await loader.load();
        setPlacesLoaded(true);
        
        // Wait for the DOM to be ready
        setTimeout(() => {
          if (addressInputRef.current) {
            const options = {
              componentRestrictions: { country: "us" },
              fields: ["address_components", "formatted_address", "geometry"],
              types: ["address"]
            };
            
            autocompleteRef.current = new google.maps.places.Autocomplete(
              addressInputRef.current,
              options
            );
            
            // Add listener for place selection
            autocompleteRef.current.addListener("place_changed", () => {
              const place = autocompleteRef.current?.getPlace();
              if (place && place.address_components) {
                // Extract address components
                let street = '';
                let city = '';
                let state = '';
                let zipCode = '';
                
                place.address_components.forEach(component => {
                  const types = component.types;
                  
                  if (types.includes('street_number')) {
                    street = component.long_name;
                  } else if (types.includes('route')) {
                    street += (street ? ' ' : '') + component.long_name;
                  } else if (types.includes('locality')) {
                    city = component.long_name;
                  } else if (types.includes('administrative_area_level_1')) {
                    state = component.short_name;
                  } else if (types.includes('postal_code')) {
                    zipCode = component.long_name;
                  }
                });
                
                // Update form data with extracted address
                setFormData(prev => ({
                  ...prev,
                  jobAddress: street,
                  jobCity: city,
                  jobState: state,
                  jobZipCode: zipCode
                }));
              }
            });
          }
          setAddressLoading(false);
        }, 500);
      } catch (error) {
        console.error("Error initializing Google Places API:", error);
        setAddressLoading(false);
      }
    };

    initializePlacesAPI();
  }, [open, formData.useCustomAddress, placesLoaded]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleCheckboxChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: checked }));
    
    // Reset places loaded when toggling custom address
    if (name === 'useCustomAddress') {
      setPlacesLoaded(false);
    }
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Format the title to include owner flag if needed
      let formattedTitle = formData.title;
      
      if (formData.isOwnerTask) {
        // Add owner tag at the beginning if not already there
        if (!formattedTitle.startsWith('[OWNER] ')) {
          formattedTitle = `[OWNER] ${formattedTitle}`;
        }
      } else {
        // Remove owner tag if exists
        formattedTitle = formattedTitle.replace('[OWNER] ', '');
      }

      // Add flag color if specified
      if (formData.flagColor) {
        // Remove existing flag if any
        formattedTitle = formattedTitle.replace(/\[FLAG:.*?\] /, '');
        // Add new flag
        formattedTitle = `[FLAG:${formData.flagColor}] ${formattedTitle}`;
      } else {
        // Remove flag if exists
        formattedTitle = formattedTitle.replace(/\[FLAG:.*?\] /, '');
      }

      // Add custom address to the job description if using custom address
      let jobDescription = formData.description || '';
      
      if (!formData.clientId || formData.useCustomAddress) {
        if (!formData.jobAddress || !formData.jobCity || !formData.jobState || !formData.jobZipCode) {
          setErrorMessage('Please provide a complete address or select a client');
          setLoading(false);
          return;
        }
        
        // Add address metadata to the description
        const addressInfo = `
---JOB_ADDRESS---
${formData.jobAddress}
${formData.jobCity}, ${formData.jobState} ${formData.jobZipCode}
---END_ADDRESS---
`;
        
        // Append address to description
        if (jobDescription) {
          jobDescription = `${jobDescription}\n\n${addressInfo}`;
        } else {
          jobDescription = addressInfo;
        }
      }

      const jobData = {
        ...formData,
        title: formattedTitle,
        description: jobDescription
      };

      await onSubmit(jobData);
      onClose();
    } catch (error) {
      console.error('Error submitting job form:', error);
      setErrorMessage('Failed to save job. Please check your inputs and try again.');
    } finally {
      setLoading(false);
    }
  };

  const calculateDuration = () => {
    if (formData.startDate && formData.endDate) {
      try {
        const start = new Date(formData.startDate);
        const end = new Date(formData.endDate);
        const minutes = Math.round((end.getTime() - start.getTime()) / (1000 * 60));
        
        if (minutes < 0) return null;
        
        const hours = Math.floor(minutes / 60);
        const remainingMinutes = minutes % 60;
        
        return `${hours}h ${remainingMinutes}m`;
      } catch (e) {
        return null;
      }
    }
    return null;
  };

  const duration = calculateDuration();

  const flagColors = [
    { label: 'Red', value: 'red', color: theme.palette.error.main },
    { label: 'Orange', value: 'orange', color: theme.palette.warning.main },
    { label: 'Green', value: 'green', color: theme.palette.success.main },
    { label: 'Blue', value: 'blue', color: theme.palette.info.main },
    { label: 'Purple', value: 'purple', color: theme.palette.secondary.main }
  ];

  // Get input label styles from our utility
  const inputLabelProps = getInputLabelProps(theme);
  const labelSx = getInputLabelSx(theme);

  return (
    <Dialog 
      open={open} 
      onClose={onClose}
      maxWidth="sm"
      fullWidth
      PaperProps={{
        sx: { borderRadius: 2 }
      }}
    >
      <DialogTitle sx={{ pb: 1 }}>
        {isEdit ? 'Edit Job' : 'Add New Job'}
        {formData.isOwnerTask && (
          <Chip 
            icon={<BusinessIcon fontSize="small" />}
            label="Owner Task" 
            size="small" 
            color="primary"
            sx={{ ml: 1 }}
          />
        )}
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <FormGroup row sx={{ mb: 1 }}>
            <FormControlLabel 
              control={
                <Checkbox 
                  checked={formData.isOwnerTask} 
                  onChange={handleCheckboxChange} 
                  name="isOwnerTask" 
                  color="primary" 
                />
              } 
              label="Flag as Owner Task" 
            />
            
            {formData.isOwnerTask && (
              <FormControl sx={{ ml: 2, minWidth: 120 }}>
                <InputLabel id="flag-color-label" sx={labelSx}>Flag Color</InputLabel>
                <Select
                  labelId="flag-color-label"
                  id="flag-color-select"
                  value={formData.flagColor}
                  label="Flag Color"
                  name="flagColor"
                  onChange={handleChange}
                  size="small"
                  displayEmpty
                  renderValue={(selected) => {
                    if (!selected) return "No Flag";
                    const flag = flagColors.find(f => f.value === selected);
                    return (
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlagIcon fontSize="small" sx={{ mr: 1, color: flag?.color }} />
                        {flag?.label || "No Flag"}
                      </Box>
                    );
                  }}
                >
                  <MenuItem value="">No Flag</MenuItem>
                  {flagColors.map(flag => (
                    <MenuItem key={flag.value} value={flag.value}>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <FlagIcon 
                          fontSize="small" 
                          sx={{ mr: 1, color: flag.color }} 
                        />
                        {flag.label}
                      </Box>
                    </MenuItem>
                  ))}
                </Select>
              </FormControl>
            )}
          </FormGroup>
          
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={inputLabelProps}
            placeholder="Enter job title"
          />
          
          <TextField
            label="Description"
            name="description"
            value={formData.description}
            onChange={handleChange}
            multiline
            rows={3}
            fullWidth
            InputLabelProps={inputLabelProps}
            placeholder="Enter optional job description"
          />
          
          <FormControl fullWidth>
            <InputLabel id="type-label" sx={labelSx}>Job Type</InputLabel>
            <Select
              labelId="type-label"
              id="type-select"
              name="type"
              value={formData.type}
              onChange={handleChange}
              label="Job Type"
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return <em>None</em>;
                return selected.toString().replace(/_/g, ' ');
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {Object.values(JobType).map(type => (
                <MenuItem key={type} value={type}>
                  {type.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {isEdit && (
            <FormControl fullWidth>
              <InputLabel id="status-label" sx={labelSx}>Status</InputLabel>
              <Select
                labelId="status-label"
                id="status-select"
                name="status"
                value={formData.status}
                onChange={handleChange}
                label="Status"
                renderValue={(selected) => selected.toString().replace(/_/g, ' ')}
              >
                {Object.values(JobStatus).map(status => (
                  <MenuItem key={status} value={status}>
                    {status.replace(/_/g, ' ')}
                  </MenuItem>
                ))}
              </Select>
            </FormControl>
          )}
          
          <Box sx={{ display: 'flex', gap: 2 }}>
            <TextField
              label="Start Date & Time"
              name="startDate"
              type="datetime-local"
              value={formData.startDate}
              onChange={handleChange}
              sx={{ flex: 1 }}
              InputLabelProps={inputLabelProps}
              placeholder="Select start date and time"
            />
            
            <TextField
              label="End Date & Time"
              name="endDate"
              type="datetime-local"
              value={formData.endDate}
              onChange={handleChange}
              sx={{ flex: 1 }}
              InputLabelProps={inputLabelProps}
              placeholder="Select end date and time"
            />
          </Box>
          
          {duration && (
            <Box sx={{ 
              display: 'flex', 
              alignItems: 'center', 
              gap: 1,
              color: theme.palette.text.secondary,
              fontSize: '0.875rem',
              pl: 1
            }}>
              <TimeIcon fontSize="small" />
              <Typography variant="body2">Duration: {duration}</Typography>
            </Box>
          )}
          
          <TextField
            label="Price"
            name="price"
            type="number"
            value={formData.price}
            onChange={handleChange}
            fullWidth
            InputProps={{
              startAdornment: <InputAdornment position="start">$</InputAdornment>
            }}
            InputLabelProps={inputLabelProps}
            placeholder="Enter job price"
          />
          
          <FormControl fullWidth>
            <InputLabel id="client-label" sx={labelSx}>Client</InputLabel>
            <Select
              labelId="client-label"
              id="client-select"
              name="clientId"
              value={formData.clientId}
              onChange={handleChange}
              label="Client"
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return <em>None</em>;
                const client = clients.find(c => c.id === selected);
                return client ? client.name : <em>None</em>;
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {clients.map(client => (
                <MenuItem key={client.id} value={client.id}>
                  {client.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {formData.clientId && (
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.primary.main, 0.05), 
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
              mt: 1,
              mb: 1
            }}>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 1 }}>
                <Typography variant="subtitle2" component="div" color="primary.main">
                  Client Location
                </Typography>
                <FormControlLabel
                  control={
                    <Checkbox
                      checked={formData.useCustomAddress || false}
                      onChange={handleCheckboxChange}
                      name="useCustomAddress"
                      size="small"
                    />
                  }
                  label={<Typography variant="caption">Use custom address</Typography>}
                />
              </Box>
              {!formData.useCustomAddress && (() => {
                const selectedClient = clients.find(c => c.id === formData.clientId);
                if (selectedClient) {
                  return (
                    <Typography variant="body2" component="span">
                      {selectedClient.address}, {selectedClient.city}, {selectedClient.state} {selectedClient.zipCode}
                    </Typography>
                  );
                }
                return <Typography variant="body2">No address information available</Typography>;
              })()}
            </Box>
          )}
          
          {(!formData.clientId || formData.useCustomAddress) && (
            <Box sx={{ 
              p: 2, 
              bgcolor: alpha(theme.palette.warning.main, 0.05), 
              borderRadius: 1,
              border: `1px solid ${alpha(theme.palette.warning.main, 0.1)}`,
              mt: 1,
              mb: 1
            }}>
              <Typography variant="subtitle2" component="div" color="warning.main" sx={{ mb: 2 }}>
                Job Location
              </Typography>
              <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
                <TextField
                  label="Street Address"
                  name="jobAddress"
                  value={formData.jobAddress || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Enter street address"
                  InputLabelProps={inputLabelProps}
                  inputRef={addressInputRef}
                  InputProps={{
                    startAdornment: (
                      <InputAdornment position="start">
                        <LocationIcon color="action" fontSize="small" />
                      </InputAdornment>
                    ),
                    endAdornment: addressLoading && (
                      <InputAdornment position="end">
                        <CircularProgress size={20} />
                      </InputAdornment>
                    )
                  }}
                  helperText={placesLoaded ? "Type to see address suggestions" : ""}
                />
                <Box sx={{ display: 'flex', gap: 2 }}>
                  <TextField
                    label="City"
                    name="jobCity"
                    value={formData.jobCity || ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="Enter city"
                    InputLabelProps={inputLabelProps}
                  />
                  <TextField
                    label="State"
                    name="jobState"
                    value={formData.jobState || ''}
                    onChange={handleChange}
                    fullWidth
                    size="small"
                    placeholder="Enter state"
                    InputLabelProps={inputLabelProps}
                  />
                </Box>
                <TextField
                  label="Zip Code"
                  name="jobZipCode"
                  value={formData.jobZipCode || ''}
                  onChange={handleChange}
                  fullWidth
                  size="small"
                  placeholder="Enter zip code"
                  InputLabelProps={inputLabelProps}
                />
              </Box>
            </Box>
          )}
          
          <FormControl fullWidth>
            <InputLabel id="assigned-to-label" sx={labelSx}>Assign To</InputLabel>
            <Select
              labelId="assigned-to-label"
              id="assigned-to-select"
              name="assignedToId"
              value={formData.assignedToId}
              onChange={handleChange}
              label="Assign To"
              displayEmpty
              renderValue={(selected) => {
                if (!selected) return <em>None</em>;
                const user = users.find(u => u.id === selected);
                return user ? user.name : <em>None</em>;
              }}
            >
              <MenuItem value=""><em>None</em></MenuItem>
              {users.map(user => (
                <MenuItem key={user.id} value={user.id}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <PersonIcon fontSize="small" />
                    {user.name}
                  </Box>
                </MenuItem>
              ))}
            </Select>
          </FormControl>
          
          {conflicts.length > 0 && (
            <Alert 
              severity="warning"
              icon={<WarningIcon />}
              sx={{ mt: 1 }}
            >
              <Typography variant="body2" fontWeight={500}>
                Scheduling conflicts detected:
              </Typography>
              <Box component="ul" sx={{ pl: 2, mt: 0.5, mb: 0 }}>
                {conflicts.map(conflict => (
                  <li key={conflict.id} style={{ fontSize: '0.875rem' }}>
                    {conflict.title} ({conflict.startDate && format(new Date(conflict.startDate), 'MMM d, h:mm a')})
                  </li>
                ))}
              </Box>
            </Alert>
          )}
        </Box>
      </DialogContent>
      
      <DialogActions sx={{ px: 3, pb: 3 }}>
        <Button onClick={onClose} color="inherit">
          Cancel
        </Button>
        <Button 
          variant="contained" 
          onClick={handleSubmit}
          disabled={loading || !formData.title}
          sx={{
            boxShadow: `0px 4px 12px ${alpha(theme.palette.primary.main, 0.15)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0px 6px 16px ${alpha(theme.palette.primary.main, 0.2)}`,
            }
          }}
        >
          {isEdit ? 'Update' : 'Add Job'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default JobForm; 