import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { JobStatus, JobType } from '@prisma/client';

// Types
export interface Job {
  id: string;
  title: string;
  description: string | null;
  type: JobType | null;
  status: JobStatus;
  startDate: string | null;
  endDate: string | null;
  price: number | null;
  clientId: string | null;
  assignedToId: string | null;
  client?: {
    id: string;
    name: string;
    address?: string;
    city?: string;
    state?: string;
    zipCode?: string;
  } | null;
  assignedTo?: {
    id: string;
    name: string;
  } | null;
}

export interface JobQueryParams {
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  clientId?: string;
  status?: JobStatus;
}

// Fetchers
export const fetchJobs = async (params: JobQueryParams = {}): Promise<Job[]> => {
  const queryParams = new URLSearchParams();
  
  if (params.startDate) queryParams.append('startDate', params.startDate);
  if (params.endDate) queryParams.append('endDate', params.endDate);
  if (params.employeeId) queryParams.append('employeeId', params.employeeId);
  if (params.clientId) queryParams.append('clientId', params.clientId);
  if (params.status) queryParams.append('status', params.status);
  
  const url = `/api/schedule?${queryParams.toString()}`;
  const response = await fetch(url);
  
  if (!response.ok) {
    throw new Error('Failed to fetch jobs');
  }
  
  return response.json();
};

export const fetchJob = async (id: string): Promise<Job> => {
  const response = await fetch(`/api/schedule/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch job');
  }
  
  return response.json();
};

// Hooks
export const useJobs = (params: JobQueryParams = {}) => {
  return useQuery({
    queryKey: ['jobs', params],
    queryFn: () => fetchJobs(params),
    keepPreviousData: true,
  });
};

export const useJob = (id: string | undefined) => {
  return useQuery({
    queryKey: ['job', id],
    queryFn: () => fetchJob(id!),
    enabled: !!id, // Only run the query if we have an ID
  });
};

export const useUpdateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Job> }) => {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update job');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch the job query
      queryClient.invalidateQueries({ queryKey: ['job', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useCreateJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Job>) => {
      const response = await fetch(`/api/schedule`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create job');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch jobs
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
    },
  });
};

export const useDeleteJob = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (id: string) => {
      const response = await fetch(`/api/schedule/${id}`, {
        method: 'DELETE',
      });
      
      if (!response.ok) {
        throw new Error('Failed to delete job');
      }
      
      return true;
    },
    onSuccess: (_, id) => {
      queryClient.invalidateQueries({ queryKey: ['jobs'] });
      queryClient.removeQueries({ queryKey: ['job', id] });
    },
  });
}; 