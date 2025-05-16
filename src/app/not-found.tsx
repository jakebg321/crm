'use client';

import { Box, Button, Container, Typography } from '@mui/material';
import { useRouter } from 'next/navigation';
import { SentimentDissatisfied as SadIcon } from '@mui/icons-material';
import Layout from '@/components/Layout';

export default function NotFound() {
  const router = useRouter();

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
          <SadIcon sx={{ fontSize: 100, color: 'text.secondary', mb: 4 }} />
          
          <Typography variant="h3" component="h1" gutterBottom>
            Page Not Found
          </Typography>
          
          <Typography variant="h5" color="text.secondary" paragraph>
            The resource you're looking for doesn't exist or has been moved.
          </Typography>
          
          <Box sx={{ mt: 4 }}>
            <Button 
              variant="contained" 
              size="large"
              onClick={() => router.push('/')}
              sx={{ mr: 2 }}
            >
              Go to Dashboard
            </Button>
            <Button 
              variant="outlined" 
              size="large"
              onClick={() => router.back()}
            >
              Go Back
            </Button>
          </Box>
        </Box>
      </Container>
    </Layout>
  );
} 