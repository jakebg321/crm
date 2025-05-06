'use client';

import React, { useState, useEffect, useRef } from 'react';
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
  IconButton,
  Dialog,
  DialogContent,
  DialogTitle,
  Tabs,
  Tab,
  Grid,
  Chip,
  DialogActions,
  Tooltip,
  Drawer,
  Fab,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import PaletteIcon from '@mui/icons-material/Palette';
import ColorizeIcon from '@mui/icons-material/Colorize';
import SaveIcon from '@mui/icons-material/Save';
import { HexColorPicker } from 'react-colorful';
import { useTheme } from '@mui/material/styles';

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
      id={`theme-modal-tabpanel-${index}`}
      aria-labelledby={`theme-modal-tab-${index}`}
      {...other}
    >
      {value === index && <Box sx={{ p: 2 }}>{children}</Box>}
    </div>
  );
}

interface ElementInfo {
  element: HTMLElement | null;
  originalColor: string;
  type: string;
  property: string;
}

// Global state to track if we're in selection mode
let isSelectionMode = false;
let selectionCallback: ((element: HTMLElement) => void) | null = null;

export default function ThemeDebuggerModal() {
  const theme = useTheme();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customColor, setCustomColor] = useState<string>('#253944');
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [paletteColorKey, setPaletteColorKey] = useState<string | null>(null);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // HSL controls
  const hsl = hexToHSL(customColor);
  const [hue, setHue] = useState<number>(hsl.h);
  const [saturation, setSaturation] = useState<number>(hsl.s);
  const [lightness, setLightness] = useState<number>(hsl.l);
  
  // Effect to update HSL values when custom color changes
  useEffect(() => {
    const { h, s, l } = hexToHSL(customColor);
    setHue(h);
    setSaturation(s);
    setLightness(l);
  }, [customColor]);
  
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
  
  const handleOpenPicker = () => {
    // Start in picker mode without opening the modal immediately
    startElementPicker();
  };
  
  const handleOpenColorPanel = () => {
    setOpen(true);
  };
  
  const handleClose = () => {
    // If picker mode is active, disable it when closing
    if (isColorPickerActive) {
      stopElementPicker();
    }
    setOpen(false);
  };
  
  const handleTabChange = (event: React.SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };
  
  // Handle document click for element selection
  const handleDocumentClick = (event: MouseEvent) => {
    if (!isSelectionMode || !selectionCallback) return;
    
    // Always prevent default behavior and stop propagation
    event.preventDefault();
    event.stopPropagation();
    
    // Get the clicked element
    const element = event.target as HTMLElement;
    
    // Call the callback
    selectionCallback(element);
  };
  
  // When element selection is activated, add capture event listener
  const enableElementSelection = () => {
    // Use capture phase to intercept all clicks before they trigger normal behavior
    document.addEventListener('click', handleDocumentClick, { capture: true });
    
    // Also capture all mousedown/mouseup events to prevent other handlers from firing
    document.addEventListener('mousedown', preventDefaultAction, { capture: true });
    document.addEventListener('mouseup', preventDefaultAction, { capture: true });
    
    // Prevent link navigation
    document.addEventListener('pointerdown', preventDefaultAction, { capture: true });
    document.addEventListener('pointerup', preventDefaultAction, { capture: true });
    
    // For interactive elements like buttons
    document.addEventListener('touchstart', preventDefaultAction, { capture: true });
    document.addEventListener('touchend', preventDefaultAction, { capture: true });
  };
  
  // Function to prevent default action
  const preventDefaultAction = (event: Event) => {
    if (isSelectionMode) {
      event.preventDefault();
      event.stopPropagation();
    }
  };
  
  // Disable all the event listeners
  const disableElementSelection = () => {
    document.removeEventListener('click', handleDocumentClick, { capture: true });
    document.removeEventListener('mousedown', preventDefaultAction, { capture: true });
    document.removeEventListener('mouseup', preventDefaultAction, { capture: true });
    document.removeEventListener('pointerdown', preventDefaultAction, { capture: true });
    document.removeEventListener('pointerup', preventDefaultAction, { capture: true });
    document.removeEventListener('touchstart', preventDefaultAction, { capture: true });
    document.removeEventListener('touchend', preventDefaultAction, { capture: true });
  };
  
  // Start the element picker
  const startElementPicker = () => {
    setIsColorPickerActive(true);
    isSelectionMode = true;
    document.body.style.cursor = 'crosshair';
    
    // Close the modal if it's open to allow selection
    setOpen(false);
    
    // Enable element selection with all our event handlers
    enableElementSelection();
    
    // Add visual indicator that we're in selection mode
    const overlay = document.createElement('div');
    overlay.id = 'theme-debugger-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    overlay.style.zIndex = '9998';
    overlay.style.pointerEvents = 'none';
    document.body.appendChild(overlay);
    
    // Show a message about selection mode
    const messageDiv = document.createElement('div');
    messageDiv.id = 'theme-debugger-message';
    messageDiv.style.position = 'fixed';
    messageDiv.style.top = '20px';
    messageDiv.style.left = '50%';
    messageDiv.style.transform = 'translateX(-50%)';
    messageDiv.style.backgroundColor = 'rgba(0, 0, 0, 0.75)';
    messageDiv.style.color = 'white';
    messageDiv.style.padding = '12px 20px';
    messageDiv.style.borderRadius = '24px';
    messageDiv.style.zIndex = '9999';
    messageDiv.style.boxShadow = '0 4px 8px rgba(0, 0, 0, 0.2)';
    messageDiv.style.fontWeight = 'bold';
    messageDiv.textContent = 'Click any element to select it for color editing';
    document.body.appendChild(messageDiv);
    
    // Callback for when an element is clicked
    selectionCallback = (element: HTMLElement) => {
      // Get computed style
      const computedStyle = window.getComputedStyle(element);
      const backgroundColor = computedStyle.backgroundColor;
      const color = computedStyle.color;
      
      // Determine if we should use background or text color
      const property = backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent' 
        ? 'backgroundColor' 
        : 'color';
      
      const currentColor = property === 'backgroundColor' ? backgroundColor : color;
      
      // Convert rgb/rgba to hex
      let hexColor = '#000000';
      if (currentColor.startsWith('rgb')) {
        const rgb = currentColor.match(/\d+/g);
        if (rgb && rgb.length >= 3) {
          hexColor = '#' + 
            parseInt(rgb[0]).toString(16).padStart(2, '0') +
            parseInt(rgb[1]).toString(16).padStart(2, '0') +
            parseInt(rgb[2]).toString(16).padStart(2, '0');
        }
      }
      
      // Identify the element type
      const tagName = element.tagName.toLowerCase();
      let type = 'other';
      
      if (element.classList.contains('MuiButton-root')) {
        type = 'button';
      } else if (element.classList.contains('MuiTypography-root')) {
        type = 'typography';
      } else if (element.classList.contains('MuiPaper-root')) {
        type = 'paper';
      } else if (element.classList.contains('MuiCard-root')) {
        type = 'card';
      } else if (element.classList.contains('MuiChip-root')) {
        type = 'chip';
      } else if (element.classList.contains('MuiBarElement-root')) {
        type = 'bar chart';
      } else {
        // Fallback to tag name
        type = tagName;
      }
      
      // Set the selected element info
      setSelectedElement({
        element,
        originalColor: hexColor,
        type,
        property
      });
      
      // Set the color picker to the current color
      setCustomColor(hexColor);
      
      // Check if this color matches any theme palette color
      let foundColorKey = null;
      const palette = theme.palette;
      
      Object.entries(palette).forEach(([category, values]) => {
        if (typeof values === 'object') {
          Object.entries(values).forEach(([variant, color]) => {
            if (typeof color === 'string' && color.toLowerCase() === hexColor.toLowerCase()) {
              foundColorKey = `${category}.${variant}`;
            }
          });
        }
      });
      
      setPaletteColorKey(foundColorKey);
      
      // Stop the picker mode and open the drawer
      stopElementPicker();
      setIsDrawerOpen(true);
    };
  };
  
  // Stop the element picker
  const stopElementPicker = () => {
    isSelectionMode = false;
    selectionCallback = null;
    document.body.style.cursor = '';
    
    // Clean up all event listeners
    disableElementSelection();
    
    // Remove the overlay and message
    const overlay = document.getElementById('theme-debugger-overlay');
    if (overlay) {
      overlay.remove();
    }
    
    const message = document.getElementById('theme-debugger-message');
    if (message) {
      message.remove();
    }
    
    setIsColorPickerActive(false);
  };
  
  // Apply the custom color to the selected element
  const applyColorToElement = () => {
    if (!selectedElement || !selectedElement.element) return;
    
    // Apply the color directly to the element's style
    if (selectedElement.property === 'backgroundColor') {
      selectedElement.element.style.backgroundColor = customColor;
    } else {
      selectedElement.element.style.color = customColor;
    }
  };
  
  // Apply color change when custom color changes
  useEffect(() => {
    if (selectedElement) {
      applyColorToElement();
    }
  }, [customColor]);
  
  // Clean up event listener on unmount
  useEffect(() => {
    return () => {
      if (isColorPickerActive) {
        disableElementSelection();
      }
    };
  }, [isColorPickerActive]);
  
  // Reset element to original color
  const resetElement = () => {
    if (selectedElement && selectedElement.element) {
      if (selectedElement.property === 'backgroundColor') {
        selectedElement.element.style.backgroundColor = selectedElement.originalColor;
      } else {
        selectedElement.element.style.color = selectedElement.originalColor;
      }
    }
  };
  
  // Render theme colors
  const renderThemeColors = () => {
    const colors = [
      { category: 'Primary', values: theme.palette.primary },
      { category: 'Secondary', values: theme.palette.secondary },
      { category: 'Success', values: theme.palette.success },
      { category: 'Error', values: theme.palette.error },
      { category: 'Warning', values: theme.palette.warning },
      { category: 'Info', values: theme.palette.info }
    ];
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Theme Colors</Typography>
        <Grid container spacing={2}>
          {colors.map(({ category, values }) => (
            <React.Fragment key={category}>
              <Grid item xs={12}>
                <Typography variant="subtitle1">{category}</Typography>
              </Grid>
              {Object.entries(values).map(([variant, color]) => {
                if (typeof color === 'string' && color.startsWith('#')) {
                  const colorKey = `${category.toLowerCase()}.${variant}`;
                  return (
                    <Grid item xs={4} sm={3} key={colorKey}>
                      <Tooltip title={`${colorKey}: ${color}`}>
                        <Box
                          onClick={() => {
                            setCustomColor(color as string);
                            setPaletteColorKey(colorKey);
                          }}
                          sx={{
                            width: '100%',
                            height: 40,
                            backgroundColor: color,
                            borderRadius: 1,
                            border: paletteColorKey === colorKey ? '2px solid black' : '1px solid #ddd',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            '&:hover': { opacity: 0.9 }
                          }}
                        >
                          <Typography
                            variant="caption"
                            sx={{
                              color: (color as string).includes('#f') ? '#000' : '#fff',
                              fontSize: '0.7rem',
                            }}
                          >
                            {variant}
                          </Typography>
                        </Box>
                      </Tooltip>
                    </Grid>
                  );
                }
                return null;
              })}
            </React.Fragment>
          ))}
        </Grid>
      </Box>
    );
  };
  
  // Element color panel content for the drawer
  const renderElementColorPanel = () => (
    <Box sx={{ p: 2 }}>
      {selectedElement ? (
        <Box sx={{ mb: 2 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="subtitle1" sx={{ mr: 1 }}>
              Selected Element:
            </Typography>
            <Chip label={selectedElement.type} size="small" />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Property:
            </Typography>
            <Chip label={selectedElement.property} size="small" />
          </Box>
          
          <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
            <Typography variant="body2" sx={{ mr: 1 }}>
              Original Color:
            </Typography>
            <Chip 
              label={selectedElement.originalColor} 
              size="small"
              sx={{ 
                backgroundColor: selectedElement.originalColor,
                color: selectedElement.originalColor.includes('#f') ? '#000' : '#fff',
              }} 
            />
          </Box>
          
          {paletteColorKey && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 1 }}>
              <Typography variant="body2" sx={{ mr: 1 }}>
                Theme Color:
              </Typography>
              <Chip label={paletteColorKey} size="small" />
            </Box>
          )}

          <Grid container spacing={2} sx={{ mt: 2 }}>
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>Color Picker</Typography>
              <HexColorPicker
                color={customColor}
                onChange={setCustomColor}
                style={{ width: '100%', height: 160 }}
              />
              <TextField
                fullWidth
                margin="normal"
                label="Hex Color"
                value={customColor}
                onChange={(e) => setCustomColor(e.target.value)}
                size="small"
              />
            </Grid>
            
            <Grid item xs={12} sm={6}>
              <Typography variant="subtitle1" gutterBottom>HSL Adjustments</Typography>
              
              <Typography variant="body2" gutterBottom>Hue: {Math.round(hue)}°</Typography>
              <Slider
                value={hue}
                min={0}
                max={360}
                onChange={handleHueChange}
                aria-labelledby="hue-slider"
                size="small"
              />
              
              <Typography variant="body2" gutterBottom>Saturation: {Math.round(saturation)}%</Typography>
              <Slider
                value={saturation}
                min={0}
                max={100}
                onChange={handleSaturationChange}
                aria-labelledby="saturation-slider"
                size="small"
              />
              
              <Typography variant="body2" gutterBottom>Lightness: {Math.round(lightness)}%</Typography>
              <Slider
                value={lightness}
                min={0}
                max={100}
                onChange={handleLightnessChange}
                aria-labelledby="lightness-slider"
                size="small"
              />
            </Grid>
          </Grid>

          <Box sx={{ display: 'flex', justifyContent: 'space-between', mt: 2 }}>
            <Button 
              color="error" 
              variant="outlined" 
              size="small"
              onClick={resetElement}
            >
              Reset
            </Button>
            <Button 
              color="primary" 
              variant="contained" 
              size="small"
              onClick={() => {
                // Close the drawer after applying color
                setIsDrawerOpen(false);
              }}
            >
              Apply
            </Button>
          </Box>
        </Box>
      ) : (
        <Box sx={{ mb: 2, textAlign: 'center' }}>
          <Typography variant="subtitle1" gutterBottom>
            No element selected
          </Typography>
          <Button
            variant="outlined"
            startIcon={<ColorizeIcon />}
            onClick={startElementPicker}
          >
            Click to select an element
          </Button>
        </Box>
      )}
    </Box>
  );
  
  return (
    <>
      {/* Floating buttons */}
      <Box
        sx={{
          position: 'fixed',
          bottom: 24,
          right: 24,
          zIndex: 1000,
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
        }}
      >
        {/* Element picker button */}
        <Tooltip title="Pick Element" arrow placement="left">
          <Fab
            color="secondary"
            onClick={handleOpenPicker}
            size="medium"
            sx={{
              backgroundColor: theme.palette.success.main,
              color: '#fff',
              '&:hover': {
                backgroundColor: theme.palette.success.dark,
              },
            }}
          >
            <ColorizeIcon />
          </Fab>
        </Tooltip>
        
        {/* Color panel button */}
        <Tooltip title="Theme Colors" arrow placement="left">
          <Fab
            color="primary"
            onClick={handleOpenColorPanel}
            size="medium"
          >
            <PaletteIcon />
          </Fab>
        </Tooltip>
      </Box>
      
      {/* Element color editing drawer */}
      <Drawer
        anchor="right"
        open={isDrawerOpen}
        onClose={() => setIsDrawerOpen(false)}
        PaperProps={{
          sx: {
            width: { xs: '100%', sm: 400 },
          }
        }}
      >
        <Box sx={{ 
          display: 'flex', 
          alignItems: 'center', 
          justifyContent: 'space-between',
          p: 2,
          borderBottom: 1,
          borderColor: 'divider',
        }}>
          <Typography variant="h6">Edit Element Color</Typography>
          <IconButton edge="end" color="inherit" onClick={() => setIsDrawerOpen(false)}>
            <CloseIcon />
          </IconButton>
        </Box>
        {renderElementColorPanel()}
      </Drawer>
      
      {/* Theme colors modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Theme Colors</Typography>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Tooltip title="Pick Element">
              <IconButton
                color="primary"
                onClick={() => {
                  handleClose();
                  startElementPicker();
                }}
                sx={{ mr: 1 }}
              >
                <ColorizeIcon />
              </IconButton>
            </Tooltip>
            <IconButton edge="end" color="inherit" onClick={handleClose} aria-label="close">
              <CloseIcon />
            </IconButton>
          </Box>
        </DialogTitle>
        
        <DialogContent dividers>
          {renderThemeColors()}
        </DialogContent>
        
        <DialogActions>
          <Button onClick={handleClose} color="primary">
            Close
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
} 