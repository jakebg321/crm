// Schedule Details Route - Displays and manages individual schedule entry information and its associated details
'use client';

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Layout from '../../../components/Layout';
import { Box, Typography } from '@mui/material';

export default function ScheduleDetails() {
  const params = useParams();
  const scheduleId = params.id;

  return (
    <Layout>
      <Box>
        <Typography variant="h4">Schedule Details</Typography>
        <Typography>Schedule ID: {scheduleId}</Typography>
      </Box>
    </Layout>
  );
} 