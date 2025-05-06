'use client';

import {
  Avatar,
  Box,
  Button,
  Card,
  CardContent,
  Grid,
  Typography,
  IconButton,
} from '@mui/material';
import {
  Add as AddIcon,
  Phone as PhoneIcon,
  Email as EmailIcon,
  LocationOn as LocationIcon,
} from '@mui/icons-material';
import Layout from '../../components/Layout';

const clients = [
  {
    id: 1,
    name: 'John Anderson',
    email: 'john.anderson@email.com',
    phone: '(555) 123-4567',
    address: '4350 Harden Park, Seattle, WA',
    activeJobs: 2,
    totalJobs: 8,
  },
  {
    id: 2,
    name: 'Sarah Williams',
    email: 'sarah.w@email.com',
    phone: '(555) 234-5678',
    address: '4029 Anderson Ave, Seattle, WA',
    activeJobs: 1,
    totalJobs: 5,
  },
  {
    id: 3,
    name: 'Mike Johnson',
    email: 'mike.j@email.com',
    phone: '(555) 345-6789',
    address: '4235 Westbrook land, Seattle, WA',
    activeJobs: 0,
    totalJobs: 3,
  },
];

export default function Clients() {
  return (
    <Layout>
      <Box sx={{ mb: 4 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <Typography variant="h4">Clients</Typography>
          <Button variant="contained" startIcon={<AddIcon />}>
            Add Client
          </Button>
        </Box>
        <Typography variant="body1" color="text.secondary">
          Manage your client relationships and view their job history
        </Typography>
      </Box>

      <Grid container spacing={3}>
        {clients.map((client) => (
          <Grid item xs={12} md={6} lg={4} key={client.id}>
            <Card>
              <CardContent>
                <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
                  <Avatar
                    sx={{
                      width: 56,
                      height: 56,
                      bgcolor: 'primary.main',
                      mr: 2,
                    }}
                  >
                    {client.name.split(' ').map(n => n[0]).join('')}
                  </Avatar>
                  <Box>
                    <Typography variant="h6">{client.name}</Typography>
                    <Typography variant="body2" color="text.secondary">
                      {client.activeJobs} Active Jobs • {client.totalJobs} Total Jobs
                    </Typography>
                  </Box>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
                  <LocationIcon sx={{ color: 'text.secondary', mr: 1, fontSize: 20 }} />
                  <Typography variant="body2" color="text.secondary">
                    {client.address}
                  </Typography>
                </Box>

                <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mt: 2 }}>
                  <IconButton size="small" color="primary">
                    <PhoneIcon />
                  </IconButton>
                  <IconButton size="small" color="primary">
                    <EmailIcon />
                  </IconButton>
                </Box>
              </CardContent>
            </Card>
          </Grid>
        ))}
      </Grid>
    </Layout>
  );
} 