'use client';

import React from 'react';
import ThemeDebugger from '../../components/ThemeDebugger';
import ThemeColorPalette from '../../components/ThemeColorPalette';
import { Container, Box, Typography, Tabs, Tab } from '@mui/material';

interface TabPanelProps {
  children?: React.ReactNode;
  index: number;
  value: number;
}

function TabPanel(props: TabPanelProps) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`theme-tabpanel-${index}`}
      aria-labelledby={`theme-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box sx={{ py: 3 }}>
          {children}
        </Box>
      )}
    </div>
  );
}

export default function ThemeDebuggerPage() {
  const [tabValue, setTabValue] = React.useState(0);

  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  return (
    <Container maxWidth="xl">
      <Box sx={{ my: 4 }}>
        <Typography variant="h3" component="h1" gutterBottom>
          Theme Debugger
        </Typography>
        <Typography variant="subtitle1" gutterBottom>
          Use these tools to preview and customize UI components with different colors from the theme palette.
        </Typography>

        <Box sx={{ borderBottom: 1, borderColor: 'divider', mt: 4 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="theme debugger tabs">
            <Tab label="Color Palette" id="theme-tab-0" />
            <Tab label="Component Debugger" id="theme-tab-1" />
          </Tabs>
        </Box>

        <TabPanel value={tabValue} index={0}>
          <ThemeColorPalette />
        </TabPanel>
        
        <TabPanel value={tabValue} index={1}>
          <ThemeDebugger />
        </TabPanel>
      </Box>
    </Container>
  );
} 