'use client';

import React from 'react';
import { Box, Typography, Paper, Grid, Tooltip, TextField, Button } from '@mui/material';
import { useTheme } from '@mui/material/styles';

const ColorSwatch = ({ color, name }: { color: string; name: string }) => {
  const [copied, setCopied] = React.useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(color);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  return (
    <Tooltip title={copied ? 'Copied!' : `Copy ${color}`} placement="top">
      <Box 
        onClick={handleCopy}
        sx={{
          backgroundColor: color,
          height: 80,
          borderRadius: 1,
          cursor: 'pointer',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'flex-end',
          p: 1,
          transition: 'all 0.2s',
          '&:hover': {
            transform: 'scale(1.03)',
          },
        }}
      >
        <Typography 
          variant="caption" 
          sx={{ 
            color: color.includes('#f') ? '#253944' : '#f6f5f0',
            fontSize: '0.75rem',
            fontWeight: 'bold',
          }}
        >
          {name}
        </Typography>
        <Typography 
          variant="caption" 
          sx={{ 
            color: color.includes('#f') ? '#253944' : '#f6f5f0',
            fontSize: '0.7rem',
          }}
        >
          {color}
        </Typography>
      </Box>
    </Tooltip>
  );
};

export default function ThemeColorPalette() {
  const theme = useTheme();
  const [exportFormat, setExportFormat] = React.useState('');
  
  const renderPaletteCategory = (category: string, colors: Record<string, string>) => {
    return (
      <Box sx={{ mb: 4 }}>
        <Typography variant="h6" sx={{ mb: 2 }}>{category}</Typography>
        <Grid container spacing={2}>
          {Object.entries(colors).map(([name, color]) => (
            <Grid item xs={6} sm={4} md={3} lg={2} key={`${category}-${name}`}>
              <ColorSwatch color={color} name={name} />
            </Grid>
          ))}
        </Grid>
      </Box>
    );
  };

  const generateExportCode = () => {
    const palette = theme.palette;
    let result = '';
    
    if (exportFormat === 'js') {
      result = `const palette = ${JSON.stringify(palette, null, 2)};`;
    } else if (exportFormat === 'css') {
      result = `:root {\n`;
      Object.entries(palette).forEach(([category, values]) => {
        if (typeof values === 'object') {
          Object.entries(values).forEach(([name, color]) => {
            if (typeof color === 'string' && color.startsWith('#')) {
              result += `  --${category}-${name}: ${color};\n`;
            }
          });
        }
      });
      result += `}`;
    } else if (exportFormat === 'scss') {
      Object.entries(palette).forEach(([category, values]) => {
        if (typeof values === 'object') {
          Object.entries(values).forEach(([name, color]) => {
            if (typeof color === 'string' && color.startsWith('#')) {
              result += `$${category}-${name}: ${color};\n`;
            }
          });
        }
      });
    }
    
    return result;
  };

  return (
    <Box sx={{ p: 4 }}>
      <Paper sx={{ p: 3, mb: 4 }}>
        <Typography variant="h5" gutterBottom>Theme Color Palette</Typography>
        <Typography variant="body2" sx={{ mb: 3 }}>
          Click on any color swatch to copy its hex value to the clipboard.
        </Typography>
        
        {renderPaletteCategory('Primary', {
          main: theme.palette.primary.main,
          light: theme.palette.primary.light,
          dark: theme.palette.primary.dark,
        })}
        
        {renderPaletteCategory('Secondary', {
          main: theme.palette.secondary.main,
          light: theme.palette.secondary.light,
          dark: theme.palette.secondary.dark,
        })}
        
        {renderPaletteCategory('Success, Warning, Error', {
          'success.main': theme.palette.success.main,
          'success.light': theme.palette.success.light,
          'success.dark': theme.palette.success.dark,
          'warning.main': theme.palette.warning.main,
          'error.main': theme.palette.error.main,
          'info.main': theme.palette.info.main,
        })}
        
        {renderPaletteCategory('Text & Background', {
          'text.primary': theme.palette.text.primary,
          'text.secondary': theme.palette.text.secondary,
          'background.default': theme.palette.background.default,
          'background.paper': theme.palette.background.paper,
          'divider': theme.palette.divider,
        })}
      </Paper>
      
      <Paper sx={{ p: 3 }}>
        <Typography variant="h6" gutterBottom>Export Colors</Typography>
        <Box sx={{ display: 'flex', gap: 2, mb: 2 }}>
          <Button 
            variant={exportFormat === 'js' ? 'contained' : 'outlined'} 
            onClick={() => setExportFormat('js')}
          >
            JavaScript
          </Button>
          <Button 
            variant={exportFormat === 'css' ? 'contained' : 'outlined'} 
            onClick={() => setExportFormat('css')}
          >
            CSS Variables
          </Button>
          <Button 
            variant={exportFormat === 'scss' ? 'contained' : 'outlined'} 
            onClick={() => setExportFormat('scss')}
          >
            SCSS Variables
          </Button>
        </Box>
        
        {exportFormat && (
          <TextField
            fullWidth
            multiline
            rows={10}
            value={generateExportCode()}
            InputProps={{
              readOnly: true,
            }}
          />
        )}
      </Paper>
    </Box>
  );
} 