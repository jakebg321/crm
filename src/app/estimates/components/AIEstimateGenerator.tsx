'use client';

import { useState } from 'react';
import {
  Box,
  Button,
  TextField,
  Typography,
  CircularProgress,
  Chip,
  Paper,
  Alert,
  AlertTitle,
  List,
  ListItem,
  ListItemText,
  FormControl,
  InputLabel,
  Select,
  MenuItem,
  SelectChangeEvent,
} from '@mui/material';
import AutoFixHighIcon from '@mui/icons-material/AutoFixHigh';
import ScienceIcon from '@mui/icons-material/Science';
import { JobType } from '@prisma/client';

interface AIEstimateGeneratorProps {
  onGenerateEstimate: (lineItems: any[]) => void;
  jobType?: string;
  clientId?: string;
}

export default function AIEstimateGenerator({ 
  onGenerateEstimate, 
  jobType: initialJobType,
  clientId 
}: AIEstimateGeneratorProps) {
  const [description, setDescription] = useState('');
  const [jobType, setJobType] = useState<string>(initialJobType || '');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [generatedItems, setGeneratedItems] = useState<any[]>([]);
  const [showResults, setShowResults] = useState(false);

  const handleJobTypeChange = (event: SelectChangeEvent) => {
    setJobType(event.target.value);
  };

  const handleGenerate = async () => {
    if (!description) return;
    
    setLoading(true);
    setError('');
    setShowResults(false);
    
    try {
      const response = await fetch('/api/ai/generate-estimate', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          jobDescription: description,
          jobType,
          clientId,
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to generate estimate');
      }
      
      const data = await response.json();
      
      if (!data.lineItems || data.lineItems.length === 0) {
        throw new Error('No line items were generated. Please try a more detailed description.');
      }
      
      setGeneratedItems(data.lineItems);
      setShowResults(true);
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setLoading(false);
    }
  };

  const handleUseItems = () => {
    onGenerateEstimate(generatedItems);
    setShowResults(false);
    setDescription('');
  };

  return (
    <Paper sx={{ p: 3, mb: 3 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', mb: 2 }}>
        <AutoFixHighIcon sx={{ mr: 1, color: 'primary.main' }} />
        <Typography variant="h6">AI Estimate Generator</Typography>
      </Box>
      
      <Typography variant="body2" sx={{ mb: 2 }}>
        Describe the job in detail and our AI will generate line items for your estimate.
      </Typography>
      
      <FormControl fullWidth sx={{ mb: 2 }}>
        <InputLabel id="job-type-label">Job Type</InputLabel>
        <Select
          labelId="job-type-label"
          value={jobType}
          label="Job Type"
          onChange={handleJobTypeChange}
        >
          {Object.values(JobType).map((type) => (
            <MenuItem key={type} value={type}>
              {type.replace('_', ' ')}
            </MenuItem>
          ))}
        </Select>
      </FormControl>
      
      <TextField
        fullWidth
        multiline
        rows={4}
        label="Describe the job in detail"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Example: Client needs a complete landscape renovation for their 2500 sq ft backyard, including new sod installation, a stone patio area approximately 400 sq ft, and 5 new shrubs along the fence line."
        sx={{ mb: 2 }}
      />
      
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          <AlertTitle>Error</AlertTitle>
          {error}
        </Alert>
      )}
      
      <Button
        variant="contained"
        color="primary"
        startIcon={loading ? <CircularProgress size={20} color="inherit" /> : <AutoFixHighIcon />}
        onClick={handleGenerate}
        disabled={loading || !description || !jobType}
        fullWidth
      >
        {loading ? 'Generating Estimate...' : 'Generate AI Estimate'}
      </Button>
      
      {showResults && generatedItems.length > 0 && (
        <Box sx={{ mt: 3 }}>
          <Alert severity="success" sx={{ mb: 2 }}>
            <AlertTitle>Estimate Generated!</AlertTitle>
            We've created {generatedItems.length} line items based on your description.
          </Alert>
          
          <Paper variant="outlined" sx={{ p: 2, mb: 2 }}>
            <Typography variant="subtitle1" gutterBottom>
              Generated Line Items:
            </Typography>
            
            <List dense>
              {generatedItems.map((item, index) => (
                <ListItem key={index} divider={index < generatedItems.length - 1}>
                  <ListItemText
                    primary={item.description}
                    secondary={
                      <>
                        <Typography component="span" variant="body2">
                          Quantity: {item.quantity} × ${item.unitPrice.toFixed(2)} = ${item.total.toFixed(2)}
                        </Typography>
                        {item.notes && (
                          <Typography component="p" variant="caption" color="text.secondary">
                            {item.notes}
                          </Typography>
                        )}
                      </>
                    }
                  />
                  <Chip 
                    icon={<ScienceIcon />} 
                    label="AI Generated" 
                    size="small" 
                    color="primary" 
                    variant="outlined" 
                    sx={{ ml: 1 }} 
                  />
                </ListItem>
              ))}
            </List>
            
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
              <Typography variant="subtitle1">
                Total: ${generatedItems.reduce((sum, item) => sum + item.total, 0).toFixed(2)}
              </Typography>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={handleUseItems}
              >
                Use These Items
              </Button>
            </Box>
          </Paper>
        </Box>
      )}
      
      <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 1 }}>
        Note: The AI will analyze your description and suggest appropriate line items for your estimate. You can edit them after adding.
      </Typography>
    </Paper>
  );
} 