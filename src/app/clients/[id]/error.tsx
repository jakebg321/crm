'use client';

import { useEffect } from 'react';
import { Box, Button, Container, Typography } from '@mui/material';
import { ErrorOutline as ErrorIcon } from '@mui/icons-material';
import Layout from '@/components/Layout';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Client detail error:', error);
  }, [error]);

  return (
    <Layout>
      <Container maxWidth="md">
        <Box
          sx={{
            py: 8,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
          }}
        >
          <ErrorIcon sx={{ fontSize: 100, color: 'error.main', mb: 4 }} />
          
          <Typography variant="h3" component="h1" gutterBottom>
            Something went wrong
          </Typography>
          
          <Typography variant="h5" color="text.secondary" paragraph>
            There was an error loading this client's information.
          </Typography>

          <Typography variant="body2" color="text.secondary" sx={{ mt: 2, mb: 4 }}>
            Error: {error.message || 'Unknown error'}
          </Typography>
          
          <Box sx={{ mt: 2 }}>
            <Button 
              variant="contained" 
              onClick={reset}
              sx={{ mr: 2 }}
            >
              Try again
            </Button>
            <Button 
              variant="outlined" 
              onClick={() => window.location.href = '/clients'}
            >
              Return to clients
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
} 