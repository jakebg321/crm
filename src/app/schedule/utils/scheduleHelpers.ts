import { Job, JobStatus, JobType } from '@prisma/client';
import { 
  format, 
  isSameDay, 
  parseISO, 
  eachDayOfInterval, 
  startOfMonth, 
  endOfMonth,
  startOfWeek,
  endOfWeek,
  startOfDay,
  endOfDay,
  isWithinInterval
} from 'date-fns';

export interface ExtendedJob {
  id: string;
  title: string;
  description: string | null;
  type: JobType | null;
  status: JobStatus;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  client: {
    id: string;
    name: string;
    address: string;
    city: string;
    state: string;
    zipCode: string;
  } | null;
  assignedTo: {
    id: string;
    name: string;
  } | null;
  duration?: number; // Duration in minutes
}

export type ViewType = 'day' | 'week' | 'month' | 'list';

// Get the date range for the current view type
export const getDateRange = (currentDate: Date, viewType: ViewType) => {
  switch (viewType) {
    case 'day':
      return {
        start: startOfDay(currentDate),
        end: endOfDay(currentDate)
      };
    case 'week':
      return {
        start: startOfWeek(currentDate, { weekStartsOn: 0 }), // 0 = Sunday
        end: endOfWeek(currentDate, { weekStartsOn: 0 })
      };
    case 'month':
    default:
      return {
        start: startOfMonth(currentDate),
        end: endOfMonth(currentDate)
      };
  }
};

// Get days for the current view
export const getDaysForView = (currentDate: Date, viewType: ViewType) => {
  const { start, end } = getDateRange(currentDate, viewType);
  return eachDayOfInterval({ start, end });
};

// Get the time range for daily view
export const getHoursForDay = () => {
  const hours = [];
  for (let i = 6; i <= 18; i++) { // 6am to 6pm
    hours.push(i);
  }
  return hours;
};

// Filters jobs based on the provided filters
export const filterJobs = (
  jobs: ExtendedJob[], 
  filters: {
    employeeId?: string;
    clientId?: string;
    jobType?: JobType;
    jobStatus?: JobStatus;
    searchTerm?: string;
  }
) => {
  return jobs.filter(job => {
    // Employee filter
    if (filters.employeeId && job.assignedTo?.id !== filters.employeeId) {
      return false;
    }

    // Client filter
    if (filters.clientId && job.client?.id !== filters.clientId) {
      return false;
    }

    // Job type filter
    if (filters.jobType && job.type !== filters.jobType) {
      return false;
    }

    // Job status filter
    if (filters.jobStatus && job.status !== filters.jobStatus) {
      return false;
    }

    // Search term
    if (filters.searchTerm) {
      const term = filters.searchTerm.toLowerCase();
      const matchesTitle = job.title.toLowerCase().includes(term);
      const matchesDescription = job.description?.toLowerCase().includes(term) || false;
      const matchesClient = job.client?.name.toLowerCase().includes(term) || false;
      
      if (!matchesTitle && !matchesDescription && !matchesClient) {
        return false;
      }
    }

    return true;
  });
};

// Get jobs for a specific date
export const getJobsForDate = (jobs: ExtendedJob[], date: Date) => {
  return jobs.filter(job => job.startDate && isSameDay(parseISO(job.startDate), date));
};

// Calculate job duration in minutes
export const calculateJobDuration = (job: ExtendedJob): number => {
  if (!job.startDate || !job.endDate) return 60; // Default to 1 hour if no end date
  
  const start = parseISO(job.startDate);
  const end = parseISO(job.endDate);
  
  // Calculate the difference in milliseconds and convert to minutes
  return Math.max(Math.round((end.getTime() - start.getTime()) / (1000 * 60)), 30);
};

// Format the time (e.g., "9:00 AM")
export const formatTime = (dateString: string): string => {
  if (!dateString) return '';
  return format(parseISO(dateString), 'h:mm a');
};

// Check if two jobs have time conflicts
export const hasTimeConflict = (job1: ExtendedJob, job2: ExtendedJob): boolean => {
  if (!job1.startDate || !job2.startDate) return false;
  
  const job1Start = parseISO(job1.startDate);
  const job1End = job1.endDate ? parseISO(job1.endDate) : new Date(job1Start.getTime() + 60 * 60 * 1000); // Default 1 hour
  
  const job2Start = parseISO(job2.startDate);
  const job2End = job2.endDate ? parseISO(job2.endDate) : new Date(job2Start.getTime() + 60 * 60 * 1000); // Default 1 hour
  
  // Check if job1 overlaps with job2
  return (
    (isWithinInterval(job1Start, { start: job2Start, end: job2End }) ||
     isWithinInterval(job1End, { start: job2Start, end: job2End }) ||
     isWithinInterval(job2Start, { start: job1Start, end: job1End }) ||
     isWithinInterval(job2End, { start: job1Start, end: job1End }))
  );
};

// Get conflicts for a job
export const getJobConflicts = (job: ExtendedJob, allJobs: ExtendedJob[]): ExtendedJob[] => {
  if (!job.assignedTo?.id) return [];
  
  // Only consider conflicts for jobs assigned to the same employee
  const sameEmployeeJobs = allJobs.filter(
    j => j.id !== job.id && j.assignedTo?.id === job.assignedTo?.id
  );
  
  return sameEmployeeJobs.filter(otherJob => hasTimeConflict(job, otherJob));
}; 