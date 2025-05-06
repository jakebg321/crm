'use client';

import { Box, Paper, Typography, SvgIcon } from '@mui/material';
import { alpha } from '@mui/material/styles';

interface DashboardCardProps {
  title: string;
  value: string | number;
  subtitle: string;
  icon: typeof SvgIcon;
  trend?: 'up' | 'down' | 'neutral';
  color?: 'primary' | 'success' | 'warning' | 'error' | 'info';
}

export default function DashboardCard({
  title,
  value,
  subtitle,
  icon: Icon,
  trend = 'neutral',
  color = 'primary',
}: DashboardCardProps) {
  return (
    <Paper
      sx={{
        p: 3,
        display: 'flex',
        position: 'relative',
        overflow: 'hidden',
        height: '100%',
        minHeight: 140,
      }}
    >
      <Box
        sx={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: 100,
          height: 100,
          background: (theme) =>
            `linear-gradient(45deg, ${alpha(theme.palette[color].main, 0)} 30%, ${alpha(
              theme.palette[color].light,
              0.1
            )} 100%)`,
          transform: 'translate(30%, -30%)',
          borderRadius: '50%',
        }}
      />
      
      <Box sx={{ position: 'relative', width: '100%' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              width: 48,
              height: 48,
              borderRadius: 2,
              backgroundColor: (theme) => alpha(theme.palette[color].main, 0.1),
              color: (theme) => theme.palette[color].main,
              mr: 2,
            }}
          >
            <Icon />
          </Box>
          <Typography variant="h6" color="text.secondary">
            {title}
          </Typography>
        </Box>

        <Typography variant="h4" sx={{ mb: 1 }}>
          {value}
        </Typography>

        <Typography
          variant="body2"
          sx={{
            color: (theme) =>
              trend === 'up'
                ? theme.palette.success.main
                : trend === 'down'
                ? theme.palette.error.main
                : theme.palette.text.secondary,
          }}
        >
          {subtitle}
        </Typography>
      </Box>
    </Paper>
  );
} 