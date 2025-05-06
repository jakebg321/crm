'use client';

import React, { useState } from 'react';
import {
  Box,
  Paper,
  Typography,
  Button,
  Slider,
  Select,
  MenuItem,
  TextField,
  InputLabel,
  FormControl,
  Chip,
  Card,
  CardContent,
  Tabs,
  Tab,
  Grid,
  Switch,
  FormControlLabel,
} from '@mui/material';
import { styled } from '@mui/material/styles';
import { HexColorPicker } from 'react-colorful';
import ColorSaveManager from './ColorSaveManager';

// Define component types that can be styled
type ComponentType = 
  | 'button' 
  | 'paper' 
  | 'card' 
  | 'chip'
  | 'textField'
  | 'background'
  | 'text';

// Define the color categories from our palette
type ColorCategory = 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'error' 
  | 'warning' 
  | 'info'
  | 'text' 
  | 'background';

// Define predefined colors from our palette for quick selection
const paletteColors = {
  primary: {
    main: '#253944',
    light: '#293f4c',
    dark: '#243843',
  },
  secondary: {
    main: '#f6f5f0',
    light: '#f2f1ed',
    dark: '#f8f7f2',
  },
  success: {
    main: '#389757',
    light: '#389758',
    dark: '#7f6f1',
  },
  warning: {
    main: '#f8f7f2',
    light: '#f6f5f0',
    dark: '#f2f1ed',
  },
  error: {
    main: '#f8f7f2',
    light: '#f6f5f0',
    dark: '#f2f1ed',
  },
  info: {
    main: '#293f4c',
    light: '#253944',
    dark: '#243843',
  },
  text: {
    primary: '#000000',
    secondary: '#253944',
  },
  background: {
    default: '#f6f5f0',
    paper: '#f2f1ed',
  }
};

// Color adjustment utils
const hexToHSL = (hex: string): { h: number; s: number; l: number } => {
  // Convert hex to RGB
  let r = parseInt(hex.slice(1, 3), 16) / 255;
  let g = parseInt(hex.slice(3, 5), 16) / 255;
  let b = parseInt(hex.slice(5, 7), 16) / 255;
  
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0, s = 0, l = (max + min) / 2;

  if (max !== min) {
    const d = max - min;
    s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    
    switch (max) {
      case r: h = (g - b) / d + (g < b ? 6 : 0); break;
      case g: h = (b - r) / d + 2; break;
      case b: h = (r - g) / d + 4; break;
    }
    
    h = h / 6;
  }

  return { h: h * 360, s: s * 100, l: l * 100 };
};

const hslToHex = (h: number, s: number, l: number): string => {
  h = h / 360;
  s = s / 100;
  l = l / 100;
  
  let r, g, b;
  
  if (s === 0) {
    r = g = b = l;
  } else {
    const hue2rgb = (p: number, q: number, t: number) => {
      if (t < 0) t += 1;
      if (t > 1) t -= 1;
      if (t < 1/6) return p + (q - p) * 6 * t;
      if (t < 1/2) return q;
      if (t < 2/3) return p + (q - p) * (2/3 - t) * 6;
      return p;
    };
    
    const q = l < 0.5 ? l * (1 + s) : l + s - l * s;
    const p = 2 * l - q;
    
    r = hue2rgb(p, q, h + 1/3);
    g = hue2rgb(p, q, h);
    b = hue2rgb(p, q, h - 1/3);
  }
  
  const toHex = (x: number) => {
    const hex = Math.round(x * 255).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  
  return `#${toHex(r)}${toHex(g)}${toHex(b)}`;
};

// Styled preview container
const ComponentPreview = styled(Box)(({ theme }) => ({
  padding: theme.spacing(4),
  marginBottom: theme.spacing(3),
  borderRadius: theme.shape.borderRadius,
  backgroundColor: theme.palette.background.paper,
  boxShadow: theme.shadows[1],
}));

export default function ThemeDebugger() {
  // State for the currently selected component and color
  const [selectedComponent, setSelectedComponent] = useState<ComponentType>('button');
  const [selectedColorCategory, setSelectedColorCategory] = useState<ColorCategory>('primary');
  const [selectedVariant, setSelectedVariant] = useState<string>('main');
  
  // State for custom color
  const [customColor, setCustomColor] = useState<string>('#253944');
  
  // HSL controls
  const hsl = hexToHSL(customColor);
  const [hue, setHue] = useState<number>(hsl.h);
  const [saturation, setSaturation] = useState<number>(hsl.s);
  const [lightness, setLightness] = useState<number>(hsl.l);
  
  // Handle HSL changes
  const handleHueChange = (_: Event, newValue: number | number[]) => {
    const h = newValue as number;
    setHue(h);
    setCustomColor(hslToHex(h, saturation, lightness));
  };
  
  const handleSaturationChange = (_: Event, newValue: number | number[]) => {
    const s = newValue as number;
    setSaturation(s);
    setCustomColor(hslToHex(hue, s, lightness));
  };
  
  const handleLightnessChange = (_: Event, newValue: number | number[]) => {
    const l = newValue as number;
    setLightness(l);
    setCustomColor(hslToHex(hue, saturation, l));
  };
  
  // Update HSL values when custom color changes
  React.useEffect(() => {
    const { h, s, l } = hexToHSL(customColor);
    setHue(h);
    setSaturation(s);
    setLightness(l);
  }, [customColor]);
  
  // Handle preset color selection
  const handlePresetColorSelect = (category: ColorCategory, variant: string) => {
    setSelectedColorCategory(category);
    setSelectedVariant(variant);
    // @ts-ignore - We know these properties exist
    setCustomColor(paletteColors[category][variant]);
  };
  
  // Generate component preview based on selected component and color
  const renderComponentPreview = () => {
    const style = { backgroundColor: customColor, color: customColor === '#f6f5f0' || customColor === '#f2f1ed' || customColor === '#f8f7f2' ? '#253944' : '#f6f5f0' };
    
    switch(selectedComponent) {
      case 'button':
        return (
          <>
            <Button variant="contained" sx={{ backgroundColor: customColor, mb: 2, mr: 2 }}>
              Contained Button
            </Button>
            <Button variant="outlined" sx={{ borderColor: customColor, color: customColor, mb: 2 }}>
              Outlined Button
            </Button>
          </>
        );
      
      case 'paper':
        return (
          <Paper sx={{ p: 3, backgroundColor: customColor, color: style.color }}>
            <Typography variant="h6">Paper Component</Typography>
            <Typography>This is a paper component with custom styling</Typography>
          </Paper>
        );
      
      case 'card':
        return (
          <Card sx={{ backgroundColor: customColor }}>
            <CardContent>
              <Typography variant="h5" sx={{ color: style.color }}>Card Title</Typography>
              <Typography sx={{ color: style.color }}>Card content with custom background color</Typography>
            </CardContent>
          </Card>
        );
      
      case 'chip':
        return (
          <>
            <Chip label="Filled Chip" sx={{ backgroundColor: customColor, color: style.color, mr: 1 }} />
            <Chip label="Outlined Chip" variant="outlined" sx={{ borderColor: customColor, color: customColor }} />
          </>
        );
      
      case 'textField':
        return (
          <TextField 
            label="Text Field" 
            variant="outlined" 
            sx={{ 
              '& .MuiOutlinedInput-root': { 
                '& fieldset': { borderColor: customColor },
                '&:hover fieldset': { borderColor: customColor },
                '&.Mui-focused fieldset': { borderColor: customColor } 
              },
              '& .MuiInputLabel-root': { color: customColor }
            }} 
          />
        );
      
      case 'background':
        return (
          <Box sx={{ p: 3, backgroundColor: customColor, borderRadius: 2 }}>
            <Typography sx={{ color: style.color }}>Custom Background</Typography>
            <Button variant="contained" sx={{ mt: 2, backgroundColor: style.color, color: customColor }}>
              Contrast Button
            </Button>
          </Box>
        );
      
      case 'text':
        return (
          <Box>
            <Typography variant="h4" sx={{ color: customColor }}>Heading Text</Typography>
            <Typography variant="body1" sx={{ color: customColor }}>
              This is body text with the custom color applied.
            </Typography>
          </Box>
        );
      
      default:
        return null;
    }
  };

  // Handle loading a saved color scheme
  const handleLoadColorScheme = (colors: Record<string, Record<string, string>>) => {
    // Set the custom color to the primary main color from the loaded scheme
    setCustomColor(colors.primary.main);
    setSelectedColorCategory('primary');
    setSelectedVariant('main');
  };

  return (
    <Box sx={{ p: 3 }}>
      <Typography variant="h4" gutterBottom>Theme Debugger</Typography>
      
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Component Preview</Typography>
            
            <FormControl fullWidth sx={{ mb: 3 }}>
              <InputLabel>Select Component</InputLabel>
              <Select
                value={selectedComponent}
                label="Select Component"
                onChange={(e) => setSelectedComponent(e.target.value as ComponentType)}
              >
                <MenuItem value="button">Button</MenuItem>
                <MenuItem value="paper">Paper</MenuItem>
                <MenuItem value="card">Card</MenuItem>
                <MenuItem value="chip">Chip</MenuItem>
                <MenuItem value="textField">Text Field</MenuItem>
                <MenuItem value="background">Background</MenuItem>
                <MenuItem value="text">Typography</MenuItem>
              </Select>
            </FormControl>
            
            <ComponentPreview>
              {renderComponentPreview()}
            </ComponentPreview>
          </Paper>
          
          <ColorSaveManager 
            currentColors={paletteColors}
            onLoad={handleLoadColorScheme}
          />
        </Grid>
        
        <Grid item xs={12} md={5}>
          <Paper sx={{ p: 3, mb: 3 }}>
            <Typography variant="h6" gutterBottom>Color Controls</Typography>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>Custom Color</Typography>
              <HexColorPicker color={customColor} onChange={setCustomColor} style={{ width: '100%', marginBottom: '16px' }} />
              <TextField 
                fullWidth 
                label="Hex Color" 
                value={customColor} 
                onChange={(e) => setCustomColor(e.target.value)}
                sx={{ mt: 2 }}
              />
            </Box>
            
            <Box sx={{ mb: 3 }}>
              <Typography variant="subtitle1" gutterBottom>HSL Adjustments</Typography>
              
              <Typography gutterBottom>Hue: {Math.round(hue)}°</Typography>
              <Slider
                value={hue}
                min={0}
                max={360}
                onChange={handleHueChange}
                aria-labelledby="hue-slider"
              />
              
              <Typography gutterBottom>Saturation: {Math.round(saturation)}%</Typography>
              <Slider
                value={saturation}
                min={0}
                max={100}
                onChange={handleSaturationChange}
                aria-labelledby="saturation-slider"
              />
              
              <Typography gutterBottom>Lightness: {Math.round(lightness)}%</Typography>
              <Slider
                value={lightness}
                min={0}
                max={100}
                onChange={handleLightnessChange}
                aria-labelledby="lightness-slider"
              />
            </Box>
          </Paper>
          
          <Paper sx={{ p: 3 }}>
            <Typography variant="h6" gutterBottom>Theme Palette</Typography>
            
            <Box sx={{ mb: 2 }}>
              {Object.entries(paletteColors).map(([category, variants]) => (
                <Box key={category} sx={{ mb: 2 }}>
                  <Typography variant="subtitle2" sx={{ mb: 1 }}>{category.toUpperCase()}</Typography>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1 }}>
                    {Object.entries(variants).map(([variant, color]) => (
                      <Box
                        key={`${category}-${variant}`}
                        sx={{
                          width: 40,
                          height: 40,
                          backgroundColor: color as string,
                          borderRadius: 1,
                          cursor: 'pointer',
                          border: customColor === color ? '2px solid #000' : '1px solid #ddd',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          position: 'relative',
                          '&:hover': {
                            opacity: 0.9,
                          },
                          '&::after': {
                            content: customColor === color ? '"✓"' : '""',
                            color: (color === '#f6f5f0' || color === '#f2f1ed' || color === '#f8f7f2') ? '#253944' : '#f6f5f0',
                            position: 'absolute',
                          }
                        }}
                        onClick={() => handlePresetColorSelect(category as ColorCategory, variant)}
                        title={`${category}.${variant}: ${color}`}
                      />
                    ))}
                  </Box>
                </Box>
              ))}
            </Box>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
} 