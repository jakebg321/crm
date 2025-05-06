'use client';

import { Box, Typography } from '@mui/material';
import Layout from '../../components/Layout';

export default function Schedule() {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Schedule</Typography>
        </Box>
        <Typography variant="body1" color="text.secondary">
          View and manage your landscaping schedule
        </Typography>
      </Box>
    </Layout>
  );
} 