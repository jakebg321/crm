'use client';

import { useState } from 'react';
import { 
  Box, 
  Paper,
  Typography, 
  Button, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem,
  Tabs,
  Tab,
  IconButton,
  Tooltip,
  Alert,
  TextField,
  Grid,
  Chip,
  Stack,
  Divider
} from '@mui/material';
import {
  Map as MapIcon,
  FormatListBulleted as ListIcon,
  Download as DownloadIcon,
  Print as PrintIcon,
  Share as ShareIcon,
  ChevronLeft,
  ChevronRight,
  Today as TodayIcon,
  KeyboardReturn as KeyboardReturnIcon,
  CalendarToday as CalendarTodayIcon
} from '@mui/icons-material';
import { format, addDays, subDays, isToday, parseISO } from 'date-fns';
import MapView from './MapView';
import { ExtendedJob } from '../../utils/scheduleHelpers';
import { extractAddressFromDescription } from '../../utils/mapHelpers';

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
      id={`route-tabpanel-${index}`}
      aria-labelledby={`route-tab-${index}`}
      style={{ height: 'calc(100% - 48px)' }}
      {...other}
    >
      {value === index && (
        <Box sx={{ height: '100%' }}>
          {children}
        </Box>
      )}
    </div>
  );
}

// Check if a job has either custom address in description or client address
const hasValidAddress = (job: ExtendedJob): boolean => {
  // Check for custom address in description
  const customAddress = extractAddressFromDescription(job);
  if (customAddress) {
    return true;
  }
  
  // Otherwise check for client address
  return !!(
    job.client && 
    job.client.address && 
    job.client.city && 
    job.client.state && 
    job.client.zipCode
  );
};

interface RouteOptimizerProps {
  jobs: ExtendedJob[];
  employees: {
    id: string;
    name: string;
  }[];
  currentDate: Date;
}

const RouteOptimizer: React.FC<RouteOptimizerProps> = ({ 
  jobs, 
  employees, 
  currentDate 
}) => {
  const [tabValue, setTabValue] = useState(0);
  const [selectedEmployee, setSelectedEmployee] = useState<string>('');
  const [viewDate, setViewDate] = useState<Date>(currentDate);
  
  // Filter jobs by selected employee and date
  const filteredJobs = jobs.filter(job => {
    // Check date match
    const jobDate = job.startDate ? new Date(job.startDate) : null;
    const isDateMatch = jobDate ? 
      jobDate.toDateString() === viewDate.toDateString() : 
      false;
      
    // Check employee match
    const isEmployeeMatch = selectedEmployee ? 
      job.assignedTo?.id === selectedEmployee : 
      true;
      
    return isDateMatch && isEmployeeMatch;
  });
  
  // Check for jobs without address information
  const jobsWithoutAddresses = filteredJobs.filter(job => 
    !hasValidAddress(job)
  );
  
  const hasAddressWarnings = jobsWithoutAddresses.length > 0;
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  const handleEmployeeChange = (event: React.ChangeEvent<{ value: unknown }>) => {
    setSelectedEmployee(event.target.value as string);
  };
  
  // Date navigation
  const goToToday = () => {
    setViewDate(new Date());
  };
  
  const goToPreviousDay = () => {
    setViewDate(date => subDays(date, 1));
  };
  
  const goToNextDay = () => {
    setViewDate(date => addDays(date, 1));
  };
  
  const handleDateChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.value) {
      setViewDate(new Date(event.target.value));
    }
  };
  
  const handleExportRoute = () => {
    // Future enhancement: Export route as PDF or CSV
    console.log('Export route functionality to be implemented');
  };
  
  const handlePrintRoute = () => {
    // Future enhancement: Print route
    window.print();
  };
  
  const handleShareRoute = () => {
    // Future enhancement: Share route with field staff
    console.log('Share route functionality to be implemented');
  };

  return (
    <Paper 
      elevation={1} 
      sx={{ 
        p: 2, 
        height: '100%', 
        display: 'flex', 
        flexDirection: 'column'
      }}
    >
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
        <Typography variant="h6">
          Route Optimization
        </Typography>
        
        <Box sx={{ display: 'flex', gap: 1 }}>
          <Tooltip title="Export Route">
            <IconButton size="small" onClick={handleExportRoute}>
              <DownloadIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Print Route">
            <IconButton size="small" onClick={handlePrintRoute}>
              <PrintIcon />
            </IconButton>
          </Tooltip>
          <Tooltip title="Share with Crew">
            <IconButton size="small" onClick={handleShareRoute}>
              <ShareIcon />
            </IconButton>
          </Tooltip>
        </Box>
      </Box>
      
      {/* Enhanced Date & Employee Selection */}
      <Grid container spacing={2} sx={{ mb: 2 }}>
        <Grid item xs={12} sm={6}>
          <Box sx={{ 
            display: 'flex', 
            alignItems: 'center',
            border: '1px solid',
            borderColor: 'divider',
            borderRadius: 1,
            p: 1
          }}>
            <IconButton size="small" onClick={goToPreviousDay}>
              <ChevronLeft />
            </IconButton>
            
            <Box sx={{ flex: 1, textAlign: 'center' }}>
              <Typography variant="subtitle1" fontWeight={500}>
                {format(viewDate, 'EEEE, MMMM d, yyyy')}
              </Typography>
              
              {isToday(viewDate) && (
                <Chip 
                  label="Today" 
                  size="small" 
                  color="primary" 
                  sx={{ height: 20, fontSize: '0.7rem' }}
                />
              )}
            </Box>
            
            <IconButton size="small" onClick={goToNextDay}>
              <ChevronRight />
            </IconButton>
            
            <Divider orientation="vertical" flexItem sx={{ mx: 0.5 }} />
            
            <Tooltip title="Go to today">
              <IconButton size="small" onClick={goToToday}>
                <TodayIcon fontSize="small" />
              </IconButton>
            </Tooltip>
            
            <Tooltip title="Pick a date">
              <TextField
                type="date"
                size="small"
                value={format(viewDate, 'yyyy-MM-dd')}
                onChange={handleDateChange}
                sx={{ 
                  width: 0, 
                  opacity: 0,
                  transition: 'width 0.2s, opacity 0.2s',
                  '&:focus-within': {
                    width: 130,
                    opacity: 1
                  }
                }}
                InputProps={{
                  startAdornment: (
                    <IconButton size="small" sx={{ mr: -1, zIndex: 2 }}>
                      <CalendarTodayIcon fontSize="small" />
                    </IconButton>
                  )
                }}
              />
            </Tooltip>
          </Box>
        </Grid>
        
        <Grid item xs={12} sm={6}>
          <FormControl variant="outlined" size="small" fullWidth>
            <InputLabel id="employee-select-label">Employee</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={selectedEmployee}
              onChange={handleEmployeeChange}
              label="Employee"
            >
              <MenuItem value="">
                <em>All Employees</em>
              </MenuItem>
              {employees.map((employee) => (
                <MenuItem key={employee.id} value={employee.id}>
                  {employee.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Grid>
      </Grid>
      
      {/* Show route info summary */}
      <Box sx={{ mb: 2 }}>
        <Typography variant="body2" color="text.secondary">
          {filteredJobs.length} jobs scheduled{selectedEmployee ? ` for ${employees.find(e => e.id === selectedEmployee)?.name}` : ''} on {format(viewDate, 'MMM d, yyyy')}
        </Typography>
      </Box>
      
      {hasAddressWarnings && (
        <Alert 
          severity="warning" 
          sx={{ mb: 2 }}
        >
          {jobsWithoutAddresses.length} jobs don't have complete address information and won't appear on the map.
          {jobsWithoutAddresses.length > 0 && (
            <Box component="ul" sx={{ m: 0, pl: 2 }}>
              {jobsWithoutAddresses.slice(0, 3).map(job => (
                <Box component="li" key={job.id}>
                  {job.title}
                </Box>
              ))}
              {jobsWithoutAddresses.length > 3 && (
                <Box component="li">
                  ...and {jobsWithoutAddresses.length - 3} more
                </Box>
              )}
            </Box>
          )}
        </Alert>
      )}
      
      <Box sx={{ borderBottom: 1, borderColor: 'divider' }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          aria-label="route-view-tabs"
          indicatorColor="primary"
          textColor="primary"
        >
          <Tab icon={<MapIcon />} label="Map View" id="route-tab-0" aria-controls="route-tabpanel-0" />
          <Tab icon={<ListIcon />} label="List View" id="route-tab-1" aria-controls="route-tabpanel-1" />
        </Tabs>
      </Box>
      
      <TabPanel value={tabValue} index={0}>
        <MapView 
          jobs={filteredJobs} 
          date={viewDate} 
          employeeId={selectedEmployee}
        />
      </TabPanel>
      
      <TabPanel value={tabValue} index={1}>
        <Box sx={{ p: 2 }}>
          <Typography variant="h6" gutterBottom>
            {selectedEmployee && employees.find(emp => emp.id === selectedEmployee)?.name || 'All Employees'} - {format(viewDate, 'EEEE, MMMM d, yyyy')}
          </Typography>
          
          {filteredJobs.length > 0 ? (
            filteredJobs
              .sort((a, b) => {
                if (!a.startDate || !b.startDate) return 0;
                return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
              })
              .map((job, index) => (
                <Box 
                  key={job.id} 
                  sx={{ 
                    p: 2, 
                    mb: 1, 
                    border: '1px solid',
                    borderColor: 'divider', 
                    borderRadius: 1,
                    bgcolor: 'background.paper' 
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                    <Box>
                      <Typography variant="subtitle1" fontWeight={500}>
                        {index + 1}. {job.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {job.startDate ? format(new Date(job.startDate), 'h:mm a') : 'No time specified'}
                      </Typography>
                    </Box>
                    <Box>
                      {job.client && (
                        <Typography variant="body2" align="right">
                          {job.client.name}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  
                  <Box sx={{ mt: 1 }}>
                    <Typography variant="body2" color="text.secondary">
                      Address: {getJobAddress(job)}
                    </Typography>
                  </Box>
                </Box>
              ))
          ) : (
            <Alert severity="info" sx={{ mt: 2 }}>
              No jobs scheduled for this day and employee selection.
            </Alert>
          )}
        </Box>
      </TabPanel>
    </Paper>
  );
};

// Helper function to get the address from a job (custom or client)
const getJobAddress = (job: ExtendedJob): string => {
  // Check for custom address in description
  const customAddress = extractAddressFromDescription(job);
  if (customAddress) {
    return `${customAddress.street}, ${customAddress.city}, ${customAddress.state} ${customAddress.zipCode}`;
  }
  
  // Otherwise use client address
  if (job.client && job.client.address) {
    return `${job.client.address}, ${job.client.city}, ${job.client.state} ${job.client.zipCode}`;
  }
  
  return 'No address available';
};

export default RouteOptimizer; 