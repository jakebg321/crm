'use client';

import { Box, Skeleton, Stack, Paper } from '@mui/material';
import { alpha, useTheme } from '@mui/material/styles';

interface SkeletonLoaderProps {
  type: 'job' | 'client' | 'list' | 'card' | 'table';
  count?: number;
}

export default function SkeletonLoader({ type, count = 1 }: SkeletonLoaderProps) {
  const theme = useTheme();
  
  const renderJobSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        mb: 3,
      }}
    >
      <Skeleton variant="text" width="40%" height={40} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="70%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="60%" height={24} sx={{ mb: 3 }} />
      
      <Stack direction="row" spacing={2} sx={{ mb: 3 }}>
        <Skeleton variant="rounded" width={100} height={32} />
        <Skeleton variant="rounded" width={100} height={32} />
      </Stack>
      
      <Skeleton variant="text" width="30%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="50%" height={24} sx={{ mb: 2 }} />
    </Paper>
  );
  
  const renderClientSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 3,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        mb: 3,
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 3 }}>
        <Skeleton variant="circular" width={50} height={50} sx={{ mr: 2 }} />
        <Box>
          <Skeleton variant="text" width={200} height={32} />
          <Skeleton variant="text" width={150} height={24} />
        </Box>
      </Box>
      
      <Box sx={{ mb: 3 }}>
        <Skeleton variant="text" width="90%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
        <Skeleton variant="text" width="70%" height={24} />
      </Box>
      
      <Stack direction="row" spacing={2}>
        <Skeleton variant="rounded" width={100} height={36} />
        <Skeleton variant="rounded" width={100} height={36} />
      </Stack>
    </Paper>
  );
  
  const renderListSkeleton = () => (
    <Box sx={{ mb: 2 }}>
      <Skeleton variant="text" width="100%" height={60} />
      <Skeleton variant="text" width="100%" height={60} />
      <Skeleton variant="text" width="100%" height={60} />
      <Skeleton variant="text" width="100%" height={60} />
    </Box>
  );
  
  const renderCardSkeleton = () => (
    <Paper
      elevation={0}
      sx={{
        p: 2,
        borderRadius: 2,
        border: `1px solid ${alpha(theme.palette.primary.main, 0.1)}`,
        height: 160,
        mb: 2,
      }}
    >
      <Skeleton variant="text" width="60%" height={32} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="40%" height={24} sx={{ mb: 2 }} />
      <Skeleton variant="text" width="80%" height={24} sx={{ mb: 1 }} />
      <Skeleton variant="text" width="70%" height={24} />
    </Paper>
  );
  
  const renderTableSkeleton = () => (
    <Box>
      <Skeleton variant="rectangular" width="100%" height={56} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={52} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={52} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={52} sx={{ mb: 1 }} />
      <Skeleton variant="rectangular" width="100%" height={52} />
    </Box>
  );
  
  const renderSkeletonByType = () => {
    switch (type) {
      case 'job':
        return renderJobSkeleton();
      case 'client':
        return renderClientSkeleton();
      case 'list':
        return renderListSkeleton();
      case 'card':
        return renderCardSkeleton();
      case 'table':
        return renderTableSkeleton();
      default:
        return renderCardSkeleton();
    }
  };
  
  return (
    <>
      {Array.from({ length: count }).map((_, index) => (
        <Box key={index}>{renderSkeletonByType()}</Box>
      ))}
    </>
  );
} 