import React, { useState, useEffect } from 'react';
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
  Chip,
  InputAdornment,
  Alert
} from '@mui/material';
import {
  AccessTime as TimeIcon,
  Person as PersonIcon,
  Flag as FlagIcon,
  Warning as WarningIcon
} from '@mui/icons-material';
import { JobStatus, JobType } from '@prisma/client';
import { format } from 'date-fns';
import { alpha, useTheme } from '@mui/material/styles';
import { getInputLabelProps, getInputLabelSx } from '@/utils/styleUtils';
import { ExtendedJob } from '../utils/scheduleHelpers';

interface TaskFormProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (taskData: any) => Promise<void>;
  selectedDate?: Date | null;
  initialData?: ExtendedJob | null;
  users: Array<{ id: string; name: string }>;
  isEdit?: boolean;
}

const TaskForm = ({
  open,
  onClose,
  onSubmit,
  selectedDate,
  initialData,
  users,
  isEdit = false
}: TaskFormProps) => {
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Define task priorities with colors
  const priorities = [
    { label: 'Low', value: 'low', color: theme.palette.success.main },
    { label: 'Medium', value: 'medium', color: theme.palette.info.main },
    { label: 'High', value: 'high', color: theme.palette.warning.main },
    { label: 'Urgent', value: 'urgent', color: theme.palette.error.main }
  ];

  const emptyFormData = {
    title: '',
    description: '',
    status: JobStatus.PENDING as JobStatus,
    priority: 'medium',
    startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
    endDate: '',
    assignedToId: ''
  };

  const [formData, setFormData] = useState(emptyFormData);

  useEffect(() => {
    if (initialData) {
      // Extract priority from flag in title if it exists
      let priority = 'medium';
      if (initialData.title.includes('[FLAG:')) {
        const match = initialData.title.match(/\[FLAG:(.*?)\]/);
        if (match && match[1]) {
          priority = match[1];
        }
      }
      
      // Remove [OWNER] and [FLAG:xxx] from title for display
      let cleanTitle = initialData.title
        .replace(/\[OWNER\]\s*/, '')
        .replace(/\[FLAG:.*?\]\s*/, '');
      
      setFormData({
        title: cleanTitle,
        description: initialData.description || '',
        status: initialData.status || JobStatus.PENDING,
        priority: priority,
        startDate: initialData.startDate || '',
        endDate: initialData.endDate || '',
        assignedToId: initialData.assignedTo?.id || ''
      });
    } else {
      setFormData({
        ...emptyFormData,
        startDate: selectedDate ? format(selectedDate, "yyyy-MM-dd'T'HH:mm") : '',
      });
    }
  }, [initialData, selectedDate, open]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | { name?: string; value: unknown }>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name as string]: value }));
  };

  const handleSubmit = async () => {
    try {
      setLoading(true);
      setErrorMessage(null);

      // Format the task data to be compatible with the job model
      const taskData = {
        ...formData,
        type: JobType.CLEANUP, // Default type for owner tasks
        // The [OWNER] prefix will be added in the parent component
        // The [FLAG:xxx] will be added in the parent component
      };

      await onSubmit(taskData);
      onClose();
    } catch (error) {
      console.error('Error submitting task form:', error);
      setErrorMessage('Failed to save task. Please check your inputs and try again.');
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
        {isEdit ? 'Edit Owner Task' : 'Add New Owner Task'}
        <Chip 
          icon={<FlagIcon fontSize="small" />}
          label={priorities.find(p => p.value === formData.priority)?.label || 'Medium'}
          size="small" 
          sx={{ 
            ml: 1,
            bgcolor: priorities.find(p => p.value === formData.priority)?.color || theme.palette.info.main,
            color: 'white'
          }}
        />
      </DialogTitle>
      
      <DialogContent>
        <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pt: 1 }}>
          {errorMessage && (
            <Alert severity="error" sx={{ mb: 2 }}>
              {errorMessage}
            </Alert>
          )}
          
          <TextField
            label="Title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            fullWidth
            required
            InputLabelProps={inputLabelProps}
            placeholder="Enter task title"
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
            placeholder="Enter optional task description"
          />
          
          <FormControl fullWidth>
            <InputLabel id="priority-label" sx={labelSx}>Priority</InputLabel>
            <Select
              labelId="priority-label"
              id="priority-select"
              name="priority"
              value={formData.priority}
              onChange={handleChange}
              label="Priority"
              renderValue={(selected) => (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <FlagIcon 
                    fontSize="small" 
                    sx={{ mr: 1, color: priorities.find(p => p.value === selected)?.color }} 
                  />
                  {priorities.find(p => p.value === selected)?.label || 'Medium'}
                </Box>
              )}
            >
              {priorities.map(priority => (
                <MenuItem key={priority.value} value={priority.value}>
                  <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <FlagIcon 
                      fontSize="small" 
                      sx={{ mr: 1, color: priority.color }} 
                    />
                    {priority.label}
                  </Box>
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
          color="secondary"
          sx={{
            boxShadow: `0px 4px 12px ${alpha(theme.palette.secondary.main, 0.15)}`,
            '&:hover': {
              transform: 'translateY(-2px)',
              boxShadow: `0px 6px 16px ${alpha(theme.palette.secondary.main, 0.2)}`,
            }
          }}
        >
          {isEdit ? 'Update Task' : 'Add Task'}
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default TaskForm; 