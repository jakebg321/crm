import { useState, useEffect } from 'react';
import { JobStatus, JobType } from '@prisma/client';
import { useRouter } from 'next/navigation';
import { 
  ExtendedJob, 
  ViewType, 
  getDateRange, 
  calculateJobDuration,
  filterJobs
} from '../utils/scheduleHelpers';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
}

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

interface Filters {
  employeeId?: string;
  clientId?: string;
  jobType?: JobType;
  jobStatus?: JobStatus;
  searchTerm?: string;
}

interface ScheduleData {
  jobs: ExtendedJob[];
  filteredJobs: ExtendedJob[];
  users: User[];
  clients: Client[];
  loading: boolean;
  error: string | null;
  filters: Filters;
  setFilters: (filters: Filters) => void;
  viewType: ViewType;
  setViewType: (viewType: ViewType) => void;
  currentDate: Date;
  setCurrentDate: (date: Date) => void;
  refreshData: () => Promise<void>;
  addJob: (jobData: any) => Promise<ExtendedJob | null>;
  updateJob: (id: string, jobData: any) => Promise<ExtendedJob | null>;
  deleteJob: (id: string) => Promise<boolean>;
}

export const useScheduleData = (): ScheduleData => {
  const router = useRouter();
  const [jobs, setJobs] = useState<ExtendedJob[]>([]);
  const [users, setUsers] = useState<User[]>([]);
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [currentDate, setCurrentDate] = useState(new Date());
  const [viewType, setViewType] = useState<ViewType>('month');
  const [filters, setFilters] = useState<Filters>({});

  const filteredJobs = filterJobs(jobs, filters);

  const fetchData = async () => {
    setLoading(true);
    setError(null);
    
    try {
      await fetchJobs();
      await fetchUsers();
      await fetchClients();
    } catch (err) {
      setError('Failed to load data');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const fetchJobs = async () => {
    try {
      const { start, end } = getDateRange(currentDate, viewType);
      
      let url = `/api/schedule?startDate=${start.toISOString()}&endDate=${end.toISOString()}`;
      if (filters.employeeId) {
        url += `&employeeId=${filters.employeeId}`;
      }
      
      const response = await fetch(url);
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      
      // Calculate and add duration to each job
      const jobsWithDuration = data.map((job: ExtendedJob) => ({
        ...job,
        duration: calculateJobDuration(job)
      }));
      
      setJobs(jobsWithDuration);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      throw err;
    }
  };

  const fetchUsers = async () => {
    try {
      const response = await fetch('/api/employees');
      if (!response.ok) throw new Error('Failed to fetch employees');
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users:', err);
      throw err;
    }
  };

  const fetchClients = async () => {
    try {
      const response = await fetch('/api/clients');
      if (!response.ok) throw new Error('Failed to fetch clients');
      const data = await response.json();
      setClients(data);
    } catch (err) {
      console.error('Error fetching clients:', err);
      throw err;
    }
  };

  const addJob = async (jobData: any): Promise<ExtendedJob | null> => {
    try {
      const response = await fetch('/api/schedule', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          price: jobData.price ? parseFloat(jobData.price) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to add job');
      }

      const newJob = await response.json();
      const jobWithDuration = {
        ...newJob,
        duration: calculateJobDuration(newJob)
      };
      
      setJobs(prev => [...prev, jobWithDuration]);
      return jobWithDuration;
    } catch (err) {
      console.error('Error adding job:', err);
      return null;
    }
  };

  const updateJob = async (id: string, jobData: any): Promise<ExtendedJob | null> => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...jobData,
          price: jobData.price ? parseFloat(jobData.price) : null,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Failed to update job');
      }

      const updatedJob = await response.json();
      const jobWithDuration = {
        ...updatedJob,
        duration: calculateJobDuration(updatedJob)
      };
      
      setJobs(prev => prev.map(job => 
        job.id === id ? jobWithDuration : job
      ));
      
      return jobWithDuration;
    } catch (err) {
      console.error('Error updating job:', err);
      return null;
    }
  };

  const deleteJob = async (id: string): Promise<boolean> => {
    try {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) throw new Error('Failed to delete job');

      setJobs(prev => prev.filter(job => job.id !== id));
      return true;
    } catch (err) {
      console.error('Error deleting job:', err);
      return false;
    }
  };

  useEffect(() => {
    fetchData();
  }, [viewType, currentDate]);

  useEffect(() => {
    if (filters.employeeId) {
      fetchJobs();
    }
  }, [filters.employeeId]);

  return {
    jobs,
    filteredJobs,
    users,
    clients,
    loading,
    error,
    filters,
    setFilters,
    viewType,
    setViewType,
    currentDate,
    setCurrentDate,
    refreshData: fetchData,
    addJob,
    updateJob,
    deleteJob
  };
}; 