// Job Details Route - Displays and manages individual job information and its associated details
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Box, Typography } from '@mui/material';

export default function JobDetails() {
  const params = useParams();
  const jobId = params.id;

  return (
    <Layout>
      <Box>
        <Typography variant="h4">Job Details</Typography>
        <Typography>Job ID: {jobId}</Typography>
      </Box>
    </Layout>
  );
} 