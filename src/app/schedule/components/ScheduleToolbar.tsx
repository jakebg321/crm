import { 
  Box, 
  Typography, 
  Button, 
  IconButton, 
  FormControl, 
  InputLabel, 
  Select, 
  MenuItem, 
  TextField,
  InputAdornment,
  ToggleButtonGroup,
  ToggleButton,
  Divider,
  Stack,
  Chip,
  Menu,
  ListItemIcon,
  ListItemText
} from '@mui/material';
import {
  ChevronLeft,
  ChevronRight,
  Add as AddIcon,
  Search as SearchIcon,
  CalendarMonth as CalendarIcon,
  ViewDay as DayIcon,
  ViewWeek as WeekIcon,
  ViewList as ListIcon,
  FilterList as FilterIcon,
  Map as MapIcon,
  RouteOutlined as RouteIcon,
  Today as TodayIcon,
  KeyboardArrowDown as ArrowDownIcon,
  DateRange as DateRangeIcon,
  ArrowForward as NextWeekIcon,
  ArrowBack as PrevWeekIcon,
  ArrowDropDown as ArrowDropDownIcon,
  Flag as FlagIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { format, addMonths, subMonths, addWeeks, subWeeks, addDays, subDays, startOfMonth, endOfMonth, startOfWeek, endOfWeek } from 'date-fns';
import { ViewType } from '../utils/scheduleHelpers';
import { JobStatus, JobType, UserRole } from '@prisma/client';
import { motion } from 'framer-motion';
import { getInputLabelProps, getInputLabelSx } from '@/utils/styleUtils';
import { useState } from 'react';

interface ScheduleToolbarProps {
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  viewType: ViewType;
  setViewType: (viewType: ViewType) => void;
  openNewJobDialog: () => void;
  openNewTaskDialog: () => void;
  openRouteOptimizer: () => void;
  users: Array<{ id: string; name: string; role: UserRole }>;
  clients: Array<{ id: string; name: string }>;
  filters: {
    employeeId?: string;
    clientId?: string;
    jobType?: JobType;
    jobStatus?: JobStatus;
    searchTerm?: string;
  };
  setFilters: (filters: any) => void;
}

const ScheduleToolbar = ({
  currentDate,
  setCurrentDate,
  viewType,
  setViewType,
  openNewJobDialog,
  openNewTaskDialog,
  openRouteOptimizer,
  users,
  clients,
  filters,
  setFilters
}: ScheduleToolbarProps) => {
  const theme = useTheme();
  const [dateMenuAnchor, setDateMenuAnchor] = useState<null | HTMLElement>(null);

  // Handle date navigation based on view type
  const handlePrevious = () => {
    switch(viewType) {
      case 'day':
        setCurrentDate(subDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(subWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        setCurrentDate(subMonths(currentDate, 1));
    }
  };

  const handleNext = () => {
    switch(viewType) {
      case 'day':
        setCurrentDate(addDays(currentDate, 1));
        break;
      case 'week':
        setCurrentDate(addWeeks(currentDate, 1));
        break;
      case 'month':
      default:
        setCurrentDate(addMonths(currentDate, 1));
    }
  };

  // Format the current date range based on view type
  const getFormattedDateRange = () => {
    switch(viewType) {
      case 'day':
        return format(currentDate, 'MMMM d, yyyy');
      case 'week':
        return `Week of ${format(currentDate, 'MMMM d, yyyy')}`;
      case 'month':
      default:
        return format(currentDate, 'MMMM yyyy');
    }
  };

  // Get input label styles from the utility
  const labelSx = getInputLabelSx(theme);

  // Add "Today" button handler
  const handleToday = () => {
    setCurrentDate(new Date());
  };

  // Handle opening and closing date menu
  const handleOpenDateMenu = (event: React.MouseEvent<HTMLElement>) => {
    setDateMenuAnchor(event.currentTarget);
  };

  const handleCloseDateMenu = () => {
    setDateMenuAnchor(null);
  };

  // Add quick navigation options
  const handleNextWeek = () => {
    setCurrentDate(addWeeks(currentDate, 1));
    handleCloseDateMenu();
  };

  const handlePrevWeek = () => {
    setCurrentDate(subWeeks(currentDate, 1));
    handleCloseDateMenu();
  };

  const handleNextMonth = () => {
    setCurrentDate(addMonths(currentDate, 1));
    handleCloseDateMenu();
  };

  const handlePrevMonth = () => {
    setCurrentDate(subMonths(currentDate, 1));
    handleCloseDateMenu();
  };

  return (
    <Box 
      component={motion.div}
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      sx={{ mb: 3 }}
    >
      {/* Top Row: Title, View Selector, Add Buttons */}
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2, flexWrap: { xs: 'wrap', md: 'nowrap' } }}>
        <Typography 
          variant="h4"
          sx={{ 
            fontWeight: 700, 
            color: theme.palette.text.primary,
            mb: { xs: 2, md: 0 }
          }}
        >
          Schedule
        </Typography>

        <Box sx={{ 
          display: 'flex', 
          gap: 2, 
          alignItems: 'center', 
          flexWrap: { xs: 'wrap', md: 'nowrap' },
          width: { xs: '100%', md: 'auto' },
          justifyContent: { xs: 'space-between', md: 'flex-end' }
        }}>
          <ToggleButtonGroup
            value={viewType}
            exclusive
            onChange={(e, newView) => newView && setViewType(newView)}
            aria-label="view type"
            size="small"
          >
            <ToggleButton value="day" aria-label="day view">
              <DayIcon />
            </ToggleButton>
            <ToggleButton value="week" aria-label="week view">
              <WeekIcon />
            </ToggleButton>
            <ToggleButton value="month" aria-label="month view">
              <CalendarIcon />
            </ToggleButton>
            <ToggleButton value="list" aria-label="list view">
              <ListIcon />
            </ToggleButton>
          </ToggleButtonGroup>
          
          <Button 
            variant="outlined"
            startIcon={<RouteIcon />}
            onClick={openRouteOptimizer}
            sx={{
              borderColor: theme.palette.primary.main,
              color: theme.palette.primary.main,
              '&:hover': {
                backgroundColor: alpha(theme.palette.primary.main, 0.05),
                borderColor: theme.palette.primary.dark,
              }
            }}
          >
            Route
          </Button>
          
          <Button 
            variant="contained"
            color="secondary"
            startIcon={<FlagIcon />}
            onClick={openNewTaskDialog}
            sx={{
              boxShadow: `0px 4px 12px ${alpha(theme.palette.secondary.main, 0.2)}`,
              '&:hover': {
                transform: 'translateY(-2px)',
                boxShadow: `0px 6px 16px ${alpha(theme.palette.secondary.main, 0.25)}`,
              },
              zIndex: 5,
              position: 'relative'
            }}
          >
            New Task
          </Button>
          
          <Button 
            variant="contained"
            startIcon={<AddIcon />}
            onClick={openNewJobDialog}
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
      </Box>

      {/* Second Row: Date Navigation, Search, Filters */}
      <Stack 
        direction={{ xs: 'column', md: 'row' }} 
        spacing={2} 
        sx={{ mb: 2 }}
        alignItems={{ xs: 'stretch', md: 'center' }}
        justifyContent="space-between"
      >
        {/* Date Navigation */}
        <Box sx={{ display: 'flex', alignItems: 'center' }}>
          <IconButton onClick={handlePrevious}>
            <ChevronLeft />
          </IconButton>
          
          <Box sx={{ display: 'flex', alignItems: 'center', position: 'relative' }}>
            <Button
              onClick={handleOpenDateMenu}
              endIcon={<ArrowDropDownIcon />}
              sx={{ mx: 1, fontWeight: 600, fontSize: '1rem', minWidth: 200 }}
            >
              {getFormattedDateRange()}
            </Button>
            
            <Menu
              anchorEl={dateMenuAnchor}
              open={Boolean(dateMenuAnchor)}
              onClose={handleCloseDateMenu}
              PaperProps={{
                elevation: 3,
                sx: { width: 220, mt: 1 }
              }}
            >
              <MenuItem onClick={handleToday} dense>
                <ListItemIcon>
                  <TodayIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Today" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handlePrevWeek} dense>
                <ListItemIcon>
                  <PrevWeekIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Previous Week" />
              </MenuItem>
              
              <MenuItem onClick={handleNextWeek} dense>
                <ListItemIcon>
                  <NextWeekIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Next Week" />
              </MenuItem>
              
              <Divider />
              
              <MenuItem onClick={handlePrevMonth} dense>
                <ListItemIcon>
                  <PrevWeekIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Previous Month" />
              </MenuItem>
              
              <MenuItem onClick={handleNextMonth} dense>
                <ListItemIcon>
                  <NextWeekIcon fontSize="small" />
                </ListItemIcon>
                <ListItemText primary="Next Month" />
              </MenuItem>
            </Menu>
          </Box>
          
          <IconButton onClick={handleNext}>
            <ChevronRight />
          </IconButton>
          
          <Button
            variant="text"
            startIcon={<TodayIcon />}
            onClick={handleToday}
            size="small"
            sx={{ ml: 1 }}
          >
            Today
          </Button>
        </Box>

        {/* Search and Filters */}
        <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap', flexGrow: 1, justifyContent: 'flex-end' }}>
          <TextField
            placeholder="Search jobs..."
            variant="outlined"
            size="small"
            value={filters.searchTerm || ''}
            onChange={(e) => setFilters({ ...filters, searchTerm: e.target.value })}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon fontSize="small" />
                </InputAdornment>
              ),
            }}
            sx={{ width: { xs: '100%', sm: 220 } }}
          />

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="employee-select-label" sx={labelSx}>Employee</InputLabel>
            <Select
              labelId="employee-select-label"
              id="employee-select"
              value={filters.employeeId || ''}
              label="Employee"
              size="small"
              onChange={(e) => setFilters({ ...filters, employeeId: e.target.value })}
              renderValue={(selected) => {
                if (!selected) {
                  return "All Employees";
                }
                const employee = users.find(u => u.id === selected);
                return employee ? employee.name : "All Employees";
              }}
            >
              <MenuItem value="">All Employees</MenuItem>
              {users.map((user) => (
                <MenuItem key={user.id} value={user.id}>
                  {user.name}
                </MenuItem>
              ))}
            </Select>
          </FormControl>

          <FormControl sx={{ minWidth: 200 }}>
            <InputLabel id="status-select-label" sx={labelSx}>Status</InputLabel>
            <Select
              labelId="status-select-label"
              id="status-select"
              value={filters.jobStatus || ''}
              label="Status"
              size="small"
              onChange={(e) => setFilters({ ...filters, jobStatus: e.target.value })}
              renderValue={(selected) => {
                if (!selected) {
                  return "All Statuses";
                }
                return selected.toString().replace(/_/g, ' ');
              }}
            >
              <MenuItem value="">All Statuses</MenuItem>
              {Object.values(JobStatus).map((status) => (
                <MenuItem key={status} value={status}>
                  {status.replace(/_/g, ' ')}
                </MenuItem>
              ))}
            </Select>
          </FormControl>
        </Box>
      </Stack>

      {/* Active Filters */}
      {(filters.employeeId || filters.clientId || filters.jobType || filters.jobStatus || filters.searchTerm) && (
        <Box sx={{ display: 'flex', gap: 1, mb: 2, flexWrap: 'wrap' }}>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary, mr: 1 }}>
            Active Filters:
          </Typography>
          
          {filters.searchTerm && (
            <Chip 
              label={`Search: ${filters.searchTerm}`} 
              size="small" 
              onDelete={() => setFilters({ ...filters, searchTerm: undefined })}
            />
          )}
          
          {filters.employeeId && (
            <Chip 
              label={`Employee: ${users.find(u => u.id === filters.employeeId)?.name || 'Unknown'}`} 
              size="small"
              onDelete={() => setFilters({ ...filters, employeeId: undefined })}
            />
          )}
          
          {filters.clientId && (
            <Chip 
              label={`Client: ${clients.find(c => c.id === filters.clientId)?.name || 'Unknown'}`} 
              size="small"
              onDelete={() => setFilters({ ...filters, clientId: undefined })}
            />
          )}
          
          {filters.jobType && (
            <Chip 
              label={`Type: ${filters.jobType.replace(/_/g, ' ')}`} 
              size="small"
              onDelete={() => setFilters({ ...filters, jobType: undefined })}
            />
          )}
          
          {filters.jobStatus && (
            <Chip 
              label={`Status: ${filters.jobStatus.replace(/_/g, ' ')}`} 
              size="small"
              onDelete={() => setFilters({ ...filters, jobStatus: undefined })}
            />
          )}
          
          {Object.keys(filters).some(k => filters[k] !== undefined) && (
            <Chip 
              label="Clear All" 
              size="small"
              variant="outlined"
              onClick={() => setFilters({})}
            />
          )}
        </Box>
      )}
    </Box>
  );
};

export default ScheduleToolbar; 