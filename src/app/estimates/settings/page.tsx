'use client';

import { useState, useEffect } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/navigation';
import {
  Box,
  Typography,
  Paper,
  TextField,
  Button,
  Grid,
  CircularProgress,
  Divider,
  FormControlLabel,
  Switch,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Tabs,
  Tab,
} from '@mui/material';
import Navigation from '@/components/Navigation';
import SaveIcon from '@mui/icons-material/Save';
import ImageIcon from '@mui/icons-material/Image';
import ColorLensIcon from '@mui/icons-material/ColorLens';

export default function EstimateSettingsPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState(0);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState('');
  
  // Company settings
  const [companySettings, setCompanySettings] = useState({
    companyName: '',
    companyLogo: '',
    address: '',
    city: '',
    state: '',
    zipCode: '',
    phone: '',
    email: '',
    website: '',
    taxId: '',
  });
  
  // Estimate settings
  const [estimateSettings, setEstimateSettings] = useState({
    defaultValidDays: 30,
    showTaxes: true,
    taxRate: 0,
    defaultTerms: '',
    defaultNotes: '',
    numberingPrefix: 'EST-',
    footerText: '',
  });
  
  // Branding settings
  const [brandingSettings, setBrandingSettings] = useState({
    primaryColor: '#4CAF50',
    accentColor: '#2196F3',
    fontFamily: 'Arial',
    showLogo: true,
    logoPosition: 'left',
    pdfTemplate: 'standard',
  });
  
  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    } else if (status === 'authenticated') {
      // Load settings
      fetchSettings();
    }
  }, [status, router]);
  
  const fetchSettings = async () => {
    try {
      const response = await fetch('/api/settings/estimates');
      if (response.ok) {
        const data = await response.json();
        if (data.company) setCompanySettings(data.company);
        if (data.estimates) setEstimateSettings(data.estimates);
        if (data.branding) setBrandingSettings(data.branding);
      }
    } catch (err) {
      console.error('Failed to load settings', err);
    }
  };
  
  const handleCompanyChange = (e) => {
    const { name, value } = e.target;
    setCompanySettings({
      ...companySettings,
      [name]: value,
    });
  };
  
  const handleEstimateChange = (e) => {
    const { name, value, checked, type } = e.target;
    setEstimateSettings({
      ...estimateSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleBrandingChange = (e) => {
    const { name, value, checked, type } = e.target;
    setBrandingSettings({
      ...brandingSettings,
      [name]: type === 'checkbox' ? checked : value,
    });
  };
  
  const handleTabChange = (event, newValue) => {
    setActiveTab(newValue);
  };
  
  const handleSaveSettings = async () => {
    setSaving(true);
    setError('');
    setSuccess(false);
    
    try {
      const response = await fetch('/api/settings/estimates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          company: companySettings,
          estimates: estimateSettings,
          branding: brandingSettings,
        }),
      });
      
      if (!response.ok) {
        throw new Error('Failed to save settings');
      }
      
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (err) {
      setError('Failed to save settings. Please try again.');
    } finally {
      setSaving(false);
    }
  };
  
  const handleLogoUpload = (e) => {
    // In a real implementation, this would upload to a storage service
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setCompanySettings({
          ...companySettings,
          companyLogo: reader.result,
        });
      };
      reader.readAsDataURL(file);
    }
  };
  
  // Render different tabs based on activeTab
  const renderContent = () => {
    switch (activeTab) {
      case 0: // Company info
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Company Information
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                This information appears on your estimates and invoices.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Company Name"
                name="companyName"
                value={companySettings.companyName}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mt: 2 }}>
                <input
                  accept="image/*"
                  id="logo-upload"
                  type="file"
                  hidden
                  onChange={handleLogoUpload}
                />
                <label htmlFor="logo-upload">
                  <Button
                    variant="outlined"
                    component="span"
                    startIcon={<ImageIcon />}
                  >
                    Upload Logo
                  </Button>
                </label>
                {companySettings.companyLogo && (
                  <Box sx={{ mt: 2, maxWidth: 200 }}>
                    <img
                      src={companySettings.companyLogo}
                      alt="Company Logo"
                      style={{ maxWidth: '100%' }}
                    />
                  </Box>
                )}
              </Box>
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Street Address"
                name="address"
                value={companySettings.address}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="City"
                name="city"
                value={companySettings.city}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="State"
                name="state"
                value={companySettings.state}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={4}>
              <TextField
                fullWidth
                label="Zip Code"
                name="zipCode"
                value={companySettings.zipCode}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Phone"
                name="phone"
                value={companySettings.phone}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Email"
                name="email"
                value={companySettings.email}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Website"
                name="website"
                value={companySettings.website}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Tax ID / EIN"
                name="taxId"
                value={companySettings.taxId}
                onChange={handleCompanyChange}
                margin="normal"
              />
            </Grid>
          </Grid>
        );
        
      case 1: // Estimate settings
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Estimate Settings
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Customize how your estimates work and look.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Validity (Days)"
                name="defaultValidDays"
                type="number"
                value={estimateSettings.defaultValidDays}
                onChange={handleEstimateChange}
                margin="normal"
                inputProps={{ min: 1 }}
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Estimate Number Prefix"
                name="numberingPrefix"
                value={estimateSettings.numberingPrefix}
                onChange={handleEstimateChange}
                margin="normal"
                helperText="Example: EST-00001"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={estimateSettings.showTaxes}
                    onChange={handleEstimateChange}
                    name="showTaxes"
                  />
                }
                label="Show Taxes on Estimates"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                label="Default Tax Rate (%)"
                name="taxRate"
                type="number"
                value={estimateSettings.taxRate}
                onChange={handleEstimateChange}
                margin="normal"
                disabled={!estimateSettings.showTaxes}
                InputProps={{
                  endAdornment: <InputAdornment position="end">%</InputAdornment>,
                }}
                inputProps={{ min: 0, step: 0.1 }}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Terms & Conditions"
                name="defaultTerms"
                value={estimateSettings.defaultTerms}
                onChange={handleEstimateChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Default Notes"
                name="defaultNotes"
                value={estimateSettings.defaultNotes}
                onChange={handleEstimateChange}
                margin="normal"
                multiline
                rows={3}
              />
            </Grid>
            
            <Grid item xs={12}>
              <TextField
                fullWidth
                label="Footer Text"
                name="footerText"
                value={estimateSettings.footerText}
                onChange={handleEstimateChange}
                margin="normal"
                helperText="Appears at the bottom of every estimate"
              />
            </Grid>
          </Grid>
        );
        
      case 2: // Branding
        return (
          <Grid container spacing={2}>
            <Grid item xs={12}>
              <Typography variant="h6" gutterBottom>
                Branding & Appearance
              </Typography>
              <Typography variant="body2" color="text.secondary" paragraph>
                Customize how your estimates look to clients.
              </Typography>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Primary Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={brandingSettings.primaryColor}
                    onChange={(e) => 
                      setBrandingSettings({
                        ...brandingSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    style={{ width: 40, height: 40, border: 'none', padding: 0 }}
                  />
                  <TextField
                    size="small"
                    value={brandingSettings.primaryColor}
                    onChange={(e) => 
                      setBrandingSettings({
                        ...brandingSettings,
                        primaryColor: e.target.value,
                      })
                    }
                    sx={{ ml: 2 }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Box sx={{ mb: 2 }}>
                <Typography variant="subtitle2" gutterBottom>
                  Accent Color
                </Typography>
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                  <input
                    type="color"
                    value={brandingSettings.accentColor}
                    onChange={(e) => 
                      setBrandingSettings({
                        ...brandingSettings,
                        accentColor: e.target.value,
                      })
                    }
                    style={{ width: 40, height: 40, border: 'none', padding: 0 }}
                  />
                  <TextField
                    size="small"
                    value={brandingSettings.accentColor}
                    onChange={(e) => 
                      setBrandingSettings({
                        ...brandingSettings,
                        accentColor: e.target.value,
                      })
                    }
                    sx={{ ml: 2 }}
                  />
                </Box>
              </Box>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>Font Family</InputLabel>
                <Select
                  value={brandingSettings.fontFamily}
                  onChange={handleBrandingChange}
                  name="fontFamily"
                  label="Font Family"
                >
                  <MenuItem value="Arial">Arial (Sans-serif)</MenuItem>
                  <MenuItem value="Times New Roman">Times New Roman (Serif)</MenuItem>
                  <MenuItem value="Courier New">Courier New (Monospace)</MenuItem>
                  <MenuItem value="Georgia">Georgia</MenuItem>
                  <MenuItem value="Verdana">Verdana</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Switch
                    checked={brandingSettings.showLogo}
                    onChange={handleBrandingChange}
                    name="showLogo"
                  />
                }
                label="Show Logo on Estimates"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal" disabled={!brandingSettings.showLogo}>
                <InputLabel>Logo Position</InputLabel>
                <Select
                  value={brandingSettings.logoPosition}
                  onChange={handleBrandingChange}
                  name="logoPosition"
                  label="Logo Position"
                >
                  <MenuItem value="left">Left</MenuItem>
                  <MenuItem value="center">Center</MenuItem>
                  <MenuItem value="right">Right</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <FormControl fullWidth margin="normal">
                <InputLabel>PDF Template</InputLabel>
                <Select
                  value={brandingSettings.pdfTemplate}
                  onChange={handleBrandingChange}
                  name="pdfTemplate"
                  label="PDF Template"
                >
                  <MenuItem value="standard">Standard</MenuItem>
                  <MenuItem value="modern">Modern</MenuItem>
                  <MenuItem value="minimal">Minimal</MenuItem>
                  <MenuItem value="professional">Professional</MenuItem>
                </Select>
              </FormControl>
            </Grid>
            
            <Grid item xs={12}>
              <Paper
                sx={{
                  p: 2,
                  mt: 2,
                  bgcolor: '#f5f5f5',
                  border: '1px dashed #ccc',
                  borderRadius: 2,
                }}
              >
                <Typography variant="subtitle2" align="center" gutterBottom>
                  Preview
                </Typography>
                <Box
                  sx={{
                    height: 200,
                    border: '1px solid #ddd',
                    borderRadius: 1,
                    bgcolor: '#fff',
                    display: 'flex',
                    justifyContent: 'center',
                    alignItems: 'center',
                  }}
                >
                  <Typography>
                    Template preview coming soon
                  </Typography>
                </Box>
              </Paper>
            </Grid>
          </Grid>
        );
        
      default:
        return null;
    }
  };
  
  if (status === 'loading') {
    return (
      <Box sx={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
        <CircularProgress />
      </Box>
    );
  }
  
  return (
    <>
      <Navigation />
      <Box sx={{ p: 3 }}>
        <Typography variant="h4" gutterBottom>
          Estimate Settings
        </Typography>
        
        <Paper sx={{ p: 3, mb: 3 }}>
          <Tabs value={activeTab} onChange={handleTabChange} sx={{ mb: 3 }}>
            <Tab label="Company Info" />
            <Tab label="Estimate Settings" />
            <Tab label="Branding" icon={<ColorLensIcon />} iconPosition="end" />
          </Tabs>
          
          <Divider sx={{ mb: 3 }} />
          
          {renderContent()}
          
          <Box sx={{ mt: 4, display: 'flex', justifyContent: 'flex-end', alignItems: 'center' }}>
            {error && (
              <Typography color="error" sx={{ mr: 2 }}>
                {error}
              </Typography>
            )}
            {success && (
              <Typography color="success.main" sx={{ mr: 2 }}>
                Settings saved successfully!
              </Typography>
            )}
            <Button
              variant="contained"
              color="primary"
              startIcon={<SaveIcon />}
              onClick={handleSaveSettings}
              disabled={saving}
            >
              {saving ? <CircularProgress size={24} /> : 'Save Settings'}
            </Button>
          </Box>
        </Paper>
      </Box>
    </>
  );
} 