'use client';

import { useSearchParams } from 'next/navigation';
import { Box, Typography, Button } from '@mui/material';
import Layout from '../../../components/Layout';

export default function AuthError() {
  const searchParams = useSearchParams();
  const error = searchParams.get('error');

  const getErrorMessage = (error: string | null) => {
    switch (error) {
      case 'Configuration':
        return 'There is a problem with the server configuration.';
      case 'AccessDenied':
        return 'You do not have permission to sign in.';
      case 'Verification':
        return 'The verification token has expired or has already been used.';
      default:
        return 'An error occurred during authentication.';
    }
  };

  return (
    <Layout>
      <Box sx={{ 
        display: 'flex', 
        flexDirection: 'column', 
        alignItems: 'center', 
        justifyContent: 'center',
        minHeight: '60vh',
        textAlign: 'center',
        p: 3
      }}>
        <Typography variant="h4" color="error" gutterBottom>
          Authentication Error
        </Typography>
        <Typography variant="body1" sx={{ mb: 3 }}>
          {getErrorMessage(error)}
        </Typography>
        <Button 
          variant="contained" 
          color="primary" 
          href="/login"
        >
          Return to Login
        </Button>
      </Box>
    </Layout>
  );
} 