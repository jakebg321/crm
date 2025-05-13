import {
  Grid,
  Paper,
  Typography,
  Box,
} from '@mui/material';
import { motion } from 'framer-motion';
import { alpha, useTheme } from '@mui/material/styles';

interface JobStatsProps {
  stats: {
    total: number;
    scheduled: number;
    inProgress: number;
    completed: number;
    pending: number;
  };
}

export default function JobStats({ stats }: JobStatsProps) {
  const theme = useTheme();

  const statItems = [
    {
      title: 'Total Jobs',
      value: stats.total,
      color: theme.palette.text.primary,
      background: theme.palette.secondary.main,
    },
    {
      title: 'Scheduled',
      value: stats.scheduled,
      color: theme.palette.info.main,
      background: theme.palette.secondary.main,
    },
    {
      title: 'In Progress',
      value: stats.inProgress,
      color: theme.palette.warning.main,
      background: theme.palette.secondary.main,
    },
    {
      title: 'Completed',
      value: stats.completed,
      color: theme.palette.success.main,
      background: theme.palette.secondary.main,
    },
    {
      title: 'Pending',
      value: stats.pending,
      color: theme.palette.text.secondary,
      background: theme.palette.secondary.main,
    },
  ];

  return (
    <Grid container spacing={3} sx={{ mb: 4 }}>
      {statItems.map((item, index) => (
        <Grid item xs={12} sm={6} md={2.4} key={item.title}>
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: index * 0.1 }}
          >
            <Paper
              sx={{
                p: 3,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-start',
                background: item.background,
                minHeight: 140,
                borderRadius: 3,
                position: 'relative',
                overflow: 'hidden',
                boxShadow: 'none',
                '&:hover': {
                  transform: 'translateY(-4px)',
                  boxShadow: `0px 8px 20px ${alpha(theme.palette.primary.main, 0.12)}`,
                }
              }}
            >
              <Typography
                variant="h3"
                sx={{
                  fontWeight: 700,
                  color: item.color,
                  mb: 1,
                  position: 'relative',
                  zIndex: 1
                }}
              >
                {item.value}
              </Typography>
              <Typography
                variant="subtitle1"
                sx={{
                  color: theme.palette.text.secondary,
                  position: 'relative',
                  zIndex: 1,
                  fontWeight: 500
                }}
              >
                {item.title}
              </Typography>
            </Paper>
          </motion.div>
        </Grid>
      ))}
    </Grid>
  );
} 