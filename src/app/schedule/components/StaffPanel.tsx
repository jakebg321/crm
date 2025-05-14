import React, { useState } from 'react';
import { 
  Box, 
  Typography, 
  Paper, 
  Avatar, 
  Chip, 
  Divider, 
  Badge,
  IconButton,
  List,
  ListItem,
  ListItemAvatar,
  ListItemText,
  ListItemSecondaryAction,
  Tooltip,
  Collapse,
  Button,
  Tabs,
  Tab,
  TextField,
  InputAdornment,
  AvatarGroup
} from '@mui/material';
import { 
  Person as PersonIcon,
  ExpandMore as ExpandMoreIcon,
  Warning as WarningIcon,
  ExpandLess as ExpandLessIcon,
  RouteOutlined as RouteIcon,
  FilterList as FilterIcon,
  ViewDay as DayViewIcon,
  ChevronLeft as ChevronLeftIcon,
  ChevronRight as ChevronRightIcon,
  Search as SearchIcon,
  PeopleAlt as TeamIcon
} from '@mui/icons-material';
import { alpha, useTheme } from '@mui/material/styles';
import { motion } from 'framer-motion';
import { format, parseISO, isToday } from 'date-fns';
import { UserRole } from '@prisma/client';
import { ExtendedJob, getJobsForDate, getJobConflicts } from '../utils/scheduleHelpers';

interface User {
  id: string;
  name: string;
  email: string;
  role: UserRole;
}

interface StaffPanelProps {
  users: User[];
  jobs: ExtendedJob[];
  currentDate: Date;
  selectedEmployee: string | undefined;
  setSelectedEmployee: (id: string | undefined) => void;
  openRouteOptimizer?: () => void;
  isCollapsed?: boolean;
  onToggleCollapse?: () => void;
  fullWidth?: boolean;
}

const StaffPanel = ({ 
  users, 
  jobs, 
  currentDate,
  selectedEmployee,
  setSelectedEmployee,
  openRouteOptimizer,
  isCollapsed = false,
  onToggleCollapse,
  fullWidth = false
}: StaffPanelProps) => {
  const theme = useTheme();
  const [expanded, setExpanded] = React.useState<Record<string, boolean>>({});
  const [expandAll, setExpandAll] = React.useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [searchTerm, setSearchTerm] = useState('');

  // Toggle employee's expanded state
  const toggleExpanded = (employeeId: string) => {
    if (expandAll) {
      setExpandAll(false);
    }
    setExpanded(prev => ({
      ...prev,
      [employeeId]: !prev[employeeId]
    }));
  };

  // Toggle expand all employees
  const toggleExpandAll = () => {
    setExpandAll(!expandAll);
    
    // Set all employees to the new expandAll state
    const newExpanded: Record<string, boolean> = {};
    users.forEach(user => {
      newExpanded[user.id] = !expandAll;
    });
    setExpanded(newExpanded);
  };

  // Get jobs assigned to an employee for the current date
  const getEmployeeJobs = (employeeId: string) => {
    return jobs.filter(job => 
      job.assignedTo?.id === employeeId && 
      job.startDate && 
      getJobsForDate([job], currentDate).length > 0
    );
  };

  // Check if employee has any job conflicts
  const hasConflicts = (employeeId: string): boolean => {
    const employeeJobs = getEmployeeJobs(employeeId);
    
    // Check each job against all other jobs for this employee
    for (let i = 0; i < employeeJobs.length; i++) {
      const conflicts = getJobConflicts(employeeJobs[i], employeeJobs);
      if (conflicts.length > 0) {
        return true;
      }
    }
    
    return false;
  };

  // Get employees with jobs for the current date
  const employeesWithJobs = users.filter(user => getEmployeeJobs(user.id).length > 0);
  const employeesWithoutJobs = users.filter(user => getEmployeeJobs(user.id).length === 0);
  
  // Filter employees based on search term
  const filteredEmployeesWithJobs = employeesWithJobs.filter(
    user => user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );
  
  const filteredEmployeesWithoutJobs = employeesWithoutJobs.filter(
    user => user.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // View employee's route
  const viewEmployeeRoute = (employeeId: string) => {
    if (openRouteOptimizer) {
      setSelectedEmployee(employeeId);
      openRouteOptimizer();
    }
  };

  // Handle tab change
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  // If panel is collapsed, show only a minimal sidebar with a toggle button and staff icons
  if (isCollapsed) {
    return (
      <Box
        component={motion.div}
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.3 }}
        sx={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          py: 2
        }}
      >
        <Paper
          elevation={2}
          sx={{
            height: '100%',
            width: '100%',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            borderRadius: 2,
            p: 1
          }}
        >
          <IconButton 
            onClick={onToggleCollapse}
            aria-label="Expand panel"
            sx={{ mb: 2 }}
          >
            <ChevronRightIcon />
          </IconButton>
          
          <Box sx={{ mb: 2 }}>
            <Typography 
              variant="caption" 
              sx={{ 
                writingMode: 'vertical-rl', 
                transform: 'rotate(180deg)', 
                fontWeight: 600,
                mb: 1
              }}
            >
              Staff
            </Typography>
          </Box>
          
          <Divider sx={{ width: '100%', mb: 2 }} />
          
          {/* Staff Quick Access Icons */}
          <Box 
            sx={{ 
              display: 'flex', 
              flexDirection: 'column', 
              gap: 1.5,
              alignItems: 'center'
            }}
          >
            {employeesWithJobs.length > 0 && (
              <Tooltip title="Staff with jobs today" placement="right">
                <AvatarGroup
                  max={3}
                  sx={{
                    flexDirection: 'column',
                    '& .MuiAvatar-root': {
                      width: 28,
                      height: 28,
                      fontSize: '0.8rem',
                      mb: 0.5
                    }
                  }}
                >
                  {employeesWithJobs.map(user => (
                    <Badge
                      key={user.id}
                      overlap="circular"
                      anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                      badgeContent={
                        hasConflicts(user.id) ? (
                          <WarningIcon 
                            fontSize="small" 
                            color="error"
                            sx={{ 
                              height: 12,
                              width: 12,
                              bgcolor: theme.palette.background.paper,
                              borderRadius: '50%' 
                            }}
                          />
                        ) : null
                      }
                    >
                      <Avatar
                        sx={{ 
                          cursor: 'pointer',
                          bgcolor: selectedEmployee === user.id ? theme.palette.primary.main : undefined,
                          '&:hover': {
                            boxShadow: `0 0 0 2px ${theme.palette.primary.main}`
                          }
                        }}
                        onClick={() => setSelectedEmployee(selectedEmployee === user.id ? undefined : user.id)}
                      >
                        {user.name.charAt(0)}
                      </Avatar>
                    </Badge>
                  ))}
                </AvatarGroup>
              </Tooltip>
            )}
            
            {employeesWithoutJobs.length > 0 && (
              <Tooltip title="Available staff" placement="right">
                <Avatar
                  sx={{ 
                    cursor: 'pointer',
                    bgcolor: theme.palette.success.light,
                    color: theme.palette.success.contrastText,
                    width: 28,
                    height: 28,
                    fontSize: '0.8rem',
                    '&:hover': {
                      boxShadow: `0 0 0 2px ${theme.palette.success.main}`
                    }
                  }}
                  onClick={onToggleCollapse}
                >
                  {employeesWithoutJobs.length}
                </Avatar>
              </Tooltip>
            )}
          </Box>
          
          {openRouteOptimizer && (
            <IconButton 
              onClick={openRouteOptimizer}
              sx={{ mt: 'auto', color: theme.palette.primary.main }}
              size="small"
            >
              <RouteIcon />
            </IconButton>
          )}
        </Paper>
      </Box>
    );
  }

  return (
    <Box
      component={motion.div}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.3 }}
      sx={{
        width: fullWidth ? '100%' : '100%',
        maxWidth: fullWidth ? 'none' : 300,
        flexShrink: 0,
        mb: 2,
        display: { xs: 'none', md: 'block' },
      }}
    >
      <Paper
        elevation={2}
        sx={{
          p: 2,
          borderRadius: 2,
          height: '100%',
          display: 'flex',
          flexDirection: 'column'
        }}
      >
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h6" sx={{ fontWeight: 600 }}>
            Staff Overview
          </Typography>
          
          <Box>
            <Tooltip title="Collapse panel">
              <IconButton size="small" onClick={onToggleCollapse}>
                <ChevronLeftIcon />
              </IconButton>
            </Tooltip>
            <Tooltip title={expandAll ? "Collapse all" : "Expand all"}>
              <IconButton size="small" onClick={toggleExpandAll}>
                {expandAll ? <ExpandLessIcon /> : <ExpandMoreIcon />}
              </IconButton>
            </Tooltip>
          </Box>
        </Box>
        
        <Box 
          sx={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center', 
            mb: 2,
            pb: 1,
            borderBottom: `1px solid ${theme.palette.divider}`
          }}
        >
          <Typography variant="subtitle2" color="text.secondary">
            {isToday(currentDate) ? 'Today' : format(currentDate, 'MMM d, yyyy')}
          </Typography>
          
          <Chip
            label={`${getJobsForDate(jobs, currentDate).length} jobs`}
            size="small"
            color="primary"
            sx={{ height: 20, fontSize: '0.7rem' }}
          />
        </Box>
        
        {/* Search field */}
        <TextField
          placeholder="Search staff..."
          variant="outlined"
          size="small"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          sx={{ mb: 2 }}
          InputProps={{
            startAdornment: (
              <InputAdornment position="start">
                <SearchIcon fontSize="small" />
              </InputAdornment>
            ),
          }}
        />
        
        {/* Tabs for switching between assigned and available staff */}
        <Tabs 
          value={tabValue} 
          onChange={handleTabChange}
          variant="fullWidth"
          sx={{ mb: 2, borderBottom: 1, borderColor: 'divider' }}
        >
          <Tab 
            label={`Assigned (${employeesWithJobs.length})`} 
            icon={<Badge 
              color="primary" 
              badgeContent={filteredEmployeesWithJobs.filter(u => hasConflicts(u.id)).length} 
              sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', height: 16, minWidth: 16 } }}
              showZero={false}
            >
              <TeamIcon fontSize="small" />
            </Badge>}
            iconPosition="start"
          />
          <Tab 
            label={`Available (${employeesWithoutJobs.length})`} 
            icon={<PersonIcon fontSize="small" />}
            iconPosition="start"
          />
        </Tabs>
        
        {users.length === 0 ? (
          <Typography variant="body2" color="text.secondary">
            No employees found.
          </Typography>
        ) : (
          <>
            {/* Tab Panel: Employees with jobs */}
            {tabValue === 0 && (
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {filteredEmployeesWithJobs.length > 0 ? (
                  <List sx={{ width: '100%' }}>
                    {filteredEmployeesWithJobs.map((user) => {
                      const employeeJobs = getEmployeeJobs(user.id);
                      const jobCount = employeeJobs.length;
                      const hasJobConflicts = hasConflicts(user.id);
                      const isExpanded = expandAll || expanded[user.id] || false;
                      const isSelected = selectedEmployee === user.id;
                      
                      return (
                        <React.Fragment key={user.id}>
                          <ListItem
                            sx={{
                              borderRadius: 1,
                              mb: 1,
                              bgcolor: isSelected 
                                ? alpha(theme.palette.primary.main, 0.08)
                                : 'transparent',
                              '&:hover': {
                                bgcolor: alpha(theme.palette.primary.main, 0.05),
                                cursor: 'pointer'
                              }
                            }}
                            onClick={() => setSelectedEmployee(isSelected ? undefined : user.id)}
                          >
                            <ListItemAvatar>
                              <Badge
                                overlap="circular"
                                anchorOrigin={{ vertical: 'bottom', horizontal: 'right' }}
                                badgeContent={
                                  hasJobConflicts ? (
                                    <Tooltip title="Schedule conflict detected">
                                      <WarningIcon 
                                        fontSize="small" 
                                        color="error"
                                        sx={{ 
                                          bgcolor: theme.palette.background.paper,
                                          borderRadius: '50%' 
                                        }}
                                      />
                                    </Tooltip>
                                  ) : null
                                }
                              >
                                <Avatar sx={{ bgcolor: isSelected ? theme.palette.primary.main : undefined }}>
                                  <PersonIcon />
                                </Avatar>
                              </Badge>
                            </ListItemAvatar>
                            <ListItemText
                              primary={
                                <Typography variant="body1" component="span" sx={{ fontWeight: isSelected ? 600 : 400 }}>
                                  {user.name}
                                </Typography>
                              }
                              secondary={
                                <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                  <Chip
                                    label={user.role}
                                    size="small"
                                    sx={{
                                      height: 16,
                                      fontSize: '0.625rem',
                                      fontWeight: 500,
                                      '& .MuiChip-label': { px: 1 }
                                    }}
                                  />
                                  <Typography variant="caption" component="span" color="text.secondary">
                                    <strong>{jobCount}</strong> {jobCount === 1 ? 'job' : 'jobs'}
                                  </Typography>
                                </Box>
                              }
                            />
                            <ListItemSecondaryAction>
                              <Box sx={{ display: 'flex' }}>
                                {jobCount > 0 && openRouteOptimizer && (
                                  <Tooltip title="View Route">
                                    <IconButton 
                                      edge="end" 
                                      size="small" 
                                      onClick={(e) => {
                                        e.stopPropagation();
                                        viewEmployeeRoute(user.id);
                                      }}
                                      sx={{ mr: 0.5 }}
                                    >
                                      <RouteIcon fontSize="small" />
                                    </IconButton>
                                  </Tooltip>
                                )}
                                
                                {jobCount > 0 && (
                                  <IconButton 
                                    edge="end" 
                                    size="small" 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      toggleExpanded(user.id);
                                    }}
                                  >
                                    {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                                  </IconButton>
                                )}
                              </Box>
                            </ListItemSecondaryAction>
                          </ListItem>
                          
                          {jobCount > 0 && (
                            <Collapse in={isExpanded} timeout="auto" unmountOnExit>
                              <List component="div" disablePadding>
                                {/* Sort jobs by start time */}
                                {employeeJobs
                                  .sort((a, b) => {
                                    if (!a.startDate || !b.startDate) return 0;
                                    return new Date(a.startDate).getTime() - new Date(b.startDate).getTime();
                                  })
                                  .map((job) => {
                                    const conflicts = getJobConflicts(job, employeeJobs);
                                    const hasConflict = conflicts.length > 0;
                                    
                                    return (
                                      <ListItem 
                                        key={job.id}
                                        sx={{ 
                                          pl: 4, 
                                          py: 0.5,
                                          borderLeft: hasConflict ? `2px solid ${theme.palette.error.main}` : 'none',
                                          borderRadius: 1,
                                          '&:hover': {
                                            bgcolor: alpha(theme.palette.primary.light, 0.1),
                                          }
                                        }}
                                      >
                                        <ListItemText
                                          primary={
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                              <Typography 
                                                variant="body2" 
                                                component="span"
                                                noWrap 
                                                title={job.title}
                                                sx={{ 
                                                  maxWidth: 140,
                                                  overflow: 'hidden',
                                                  textOverflow: 'ellipsis',
                                                  fontWeight: hasConflict ? 600 : 400
                                                }}
                                              >
                                                {job.title}
                                              </Typography>
                                            </Box>
                                          }
                                          secondary={
                                            <Typography variant="caption" component="span" color="text.secondary">
                                              {job.startDate && format(new Date(job.startDate), 'h:mm a')}
                                              {job.endDate && ` - ${format(new Date(job.endDate), 'h:mm a')}`}
                                            </Typography>
                                          }
                                        />
                                        
                                        {hasConflict && (
                                          <Tooltip 
                                            title={`Conflicts with: ${conflicts.map(c => c.title).join(', ')}`}
                                            placement="top"
                                          >
                                            <WarningIcon 
                                              color="error" 
                                              fontSize="small" 
                                              sx={{ ml: 1 }}
                                            />
                                          </Tooltip>
                                        )}
                                      </ListItem>
                                    );
                                  })}
                              </List>
                            </Collapse>
                          )}
                        </React.Fragment>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    {searchTerm ? 'No employees match your search' : 'No employees with jobs today'}
                  </Typography>
                )}
              </Box>
            )}
            
            {/* Tab Panel: Available employees */}
            {tabValue === 1 && (
              <Box sx={{ overflow: 'auto', flexGrow: 1 }}>
                {filteredEmployeesWithoutJobs.length > 0 ? (
                  <List sx={{ width: '100%', opacity: 0.8 }}>
                    {filteredEmployeesWithoutJobs.map((user) => {
                      const isSelected = selectedEmployee === user.id;
                      
                      return (
                        <ListItem
                          key={user.id}
                          sx={{
                            borderRadius: 1,
                            mb: 1,
                            bgcolor: isSelected 
                              ? alpha(theme.palette.primary.main, 0.08)
                              : 'transparent',
                            '&:hover': {
                              bgcolor: alpha(theme.palette.primary.main, 0.05),
                              cursor: 'pointer'
                            }
                          }}
                          onClick={() => setSelectedEmployee(isSelected ? undefined : user.id)}
                        >
                          <ListItemAvatar>
                            <Avatar sx={{ 
                              bgcolor: isSelected 
                                ? theme.palette.primary.main 
                                : alpha(theme.palette.text.secondary, 0.1)
                            }}>
                              <PersonIcon />
                            </Avatar>
                          </ListItemAvatar>
                          <ListItemText
                            primary={
                              <Typography 
                                variant="body1" 
                                component="span" 
                                sx={{ 
                                  fontWeight: isSelected ? 600 : 400,
                                  color: theme.palette.text.secondary
                                }}
                              >
                                {user.name}
                              </Typography>
                            }
                            secondary={
                              <Box component="span" sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                                <Chip
                                  label={user.role}
                                  size="small"
                                  sx={{
                                    height: 16,
                                    fontSize: '0.625rem',
                                    fontWeight: 500,
                                    '& .MuiChip-label': { px: 1 }
                                  }}
                                />
                                <Typography variant="caption" component="span" color="text.secondary">
                                  Available
                                </Typography>
                              </Box>
                            }
                          />
                        </ListItem>
                      );
                    })}
                  </List>
                ) : (
                  <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', p: 2 }}>
                    {searchTerm ? 'No employees match your search' : 'No available employees'}
                  </Typography>
                )}
              </Box>
            )}
            
            {openRouteOptimizer && (
              <Box sx={{ mt: 'auto', pt: 2, borderTop: `1px solid ${theme.palette.divider}` }}>
                <Button
                  variant="outlined"
                  startIcon={<RouteIcon />}
                  onClick={openRouteOptimizer}
                  fullWidth
                  size="small"
                >
                  View All Routes
                </Button>
              </Box>
            )}
          </>
        )}
      </Paper>
    </Box>
  );
};

export default StaffPanel; 