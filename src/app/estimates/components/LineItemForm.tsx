'use client';

import { useState, useEffect } from 'react';
import { 
  TextField, 
  Grid,
  InputAdornment,
  Button, 
  Typography,
  Box,
  IconButton,
  Tooltip,
} from '@mui/material';
import SaveIcon from '@mui/icons-material/Save';

interface LineItemProps {
  item: {
    id: string;
    description: string;
    quantity: number;
    unitPrice: number;
    total: number;
  };
  onChange: (item: any) => void;
}

export default function LineItemForm({ item, onChange }: LineItemProps) {
  const [saveToLibrary, setSaveToLibrary] = useState(false);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    
    // Parse numbers for quantity and unitPrice
    if (name === 'quantity' || name === 'unitPrice') {
      const numValue = parseFloat(value) || 0;
      onChange({
        ...item,
        [name]: numValue,
      });
    } else {
      onChange({
        ...item,
        [name]: value,
      });
    }
  };

  const handleSaveToLibrary = async () => {
    if (!item.description || item.unitPrice <= 0) {
      return; // Don't save invalid items
    }

    try {
      const response = await fetch('/api/saved-items', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          description: item.description,
          unitPrice: item.unitPrice,
          quantity: item.quantity,
        }),
      });

      if (response.ok) {
        setSaveToLibrary(true);
        // Reset after a short delay
        setTimeout(() => setSaveToLibrary(false), 2000);
      }
    } catch (error) {
      console.error('Failed to save item:', error);
    }
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12}>
        <TextField
          fullWidth
          label="Description"
          name="description"
          value={item.description}
          onChange={handleInputChange}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Quantity"
          name="quantity"
          type="number"
          value={item.quantity}
          onChange={handleInputChange}
          inputProps={{ min: 1, step: 1 }}
          required
        />
      </Grid>
      
      <Grid item xs={12} sm={6}>
        <TextField
          fullWidth
          label="Unit Price"
          name="unitPrice"
          type="number"
          value={item.unitPrice}
          onChange={handleInputChange}
          InputProps={{
            startAdornment: <InputAdornment position="start">$</InputAdornment>,
            inputProps: { min: 0, step: 0.01 }
          }}
          required
        />
      </Grid>

      <Grid item xs={12}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <Typography variant="body2">
            Item Total: ${(item.quantity * item.unitPrice).toFixed(2)}
          </Typography>
          
          <Tooltip title="Save to library for future use">
            <span>
              <IconButton 
                color={saveToLibrary ? "success" : "primary"} 
                onClick={handleSaveToLibrary}
                disabled={!item.description || item.unitPrice <= 0}
              >
                <SaveIcon />
              </IconButton>
            </span>
          </Tooltip>
        </Box>
      </Grid>
    </Grid>
  );
} 