import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// Types
export interface Client {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  _count?: {
    jobs: number;
    estimates: number;
  };
}

// Fetchers
export const fetchClients = async (): Promise<Client[]> => {
  const response = await fetch('/api/clients');
  
  if (!response.ok) {
    throw new Error('Failed to fetch clients');
  }
  
  return response.json();
};

export const fetchClient = async (id: string): Promise<Client> => {
  const response = await fetch(`/api/clients/${id}`);
  
  if (!response.ok) {
    throw new Error('Failed to fetch client');
  }
  
  return response.json();
};

// Hooks
export const useClients = () => {
  return useQuery({
    queryKey: ['clients'],
    queryFn: fetchClients,
  });
};

export const useClient = (id: string | undefined) => {
  return useQuery({
    queryKey: ['client', id],
    queryFn: () => fetchClient(id!),
    enabled: !!id, // Only run the query if we have an ID
  });
};

export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Client> }) => {
      const response = await fetch(`/api/clients/${id}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to update client');
      }
      
      return response.json();
    },
    onSuccess: (data, variables) => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['client', variables.id] });
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: async (data: Partial<Client>) => {
      const response = await fetch('/api/clients', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      });
      
      if (!response.ok) {
        throw new Error('Failed to create client');
      }
      
      return response.json();
    },
    onSuccess: () => {
      // Invalidate and refetch
      queryClient.invalidateQueries({ queryKey: ['clients'] });
    },
  });
}; 