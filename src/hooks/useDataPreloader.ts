import { useEffect } from 'react';
import { useQueryClient } from '@tanstack/react-query';
import { fetchJobs, fetchJob } from '@/hooks/useJobsData';
import { fetchClients, fetchClient } from '@/hooks/useClientsData';

/**
 * Hook to preload commonly needed data for faster navigation
 */
export const useDataPreloader = () => {
  const queryClient = useQueryClient();

  // Preload common data on initial app load
  useEffect(() => {
    // Preload clients list which is used in multiple places
    queryClient.prefetchQuery({
      queryKey: ['clients'],
      queryFn: fetchClients,
    });

    // Preload recent jobs - use last 30 days to current date + 30 days
    const startDate = new Date();
    startDate.setDate(startDate.getDate() - 30);
    const endDate = new Date();
    endDate.setDate(endDate.getDate() + 30);

    queryClient.prefetchQuery({
      queryKey: ['jobs', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
      queryFn: () => fetchJobs({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
    });
  }, [queryClient]);

  // Functions to preload specific data
  const preloadJob = (id: string) => {
    if (!id) return;
    
    queryClient.prefetchQuery({
      queryKey: ['job', id],
      queryFn: () => fetchJob(id),
    });
  };

  const preloadClient = (id: string) => {
    if (!id) return;
    
    queryClient.prefetchQuery({
      queryKey: ['client', id],
      queryFn: () => fetchClient(id),
    });
  };

  const preloadJobsForRoute = (route: string) => {
    if (route === '/jobs' || route === '/schedule') {
      // For jobs and schedule pages, preload recent jobs
      const now = new Date();
      const startDate = new Date(now);
      startDate.setDate(now.getDate() - 7);
      const endDate = new Date(now);
      endDate.setDate(now.getDate() + 30);
      
      queryClient.prefetchQuery({
        queryKey: ['jobs', { startDate: startDate.toISOString(), endDate: endDate.toISOString() }],
        queryFn: () => fetchJobs({ startDate: startDate.toISOString(), endDate: endDate.toISOString() }),
      });
    }
  };

  return {
    preloadJob,
    preloadClient,
    preloadJobsForRoute,
  };
}; 