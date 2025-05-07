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
import { alpha } from '@mui/material/styles';
import useThemeUpdater, { ThemeColors } from '../app/styles/useThemeUpdater';

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
  const { themeColors, updateThemeColor, applyThemeColors } = useThemeUpdater();
  const [open, setOpen] = useState(false);
  const [tabValue, setTabValue] = useState(0);
  const [customColor, setCustomColor] = useState<string>('#253944');
  const [selectedElement, setSelectedElement] = useState<ElementInfo | null>(null);
  const [paletteColorKey, setPaletteColorKey] = useState<string | null>(null);
  const [isColorPickerActive, setIsColorPickerActive] = useState(false);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  
  // Add state for theme editor - now using the hook's state
  const [themeEditorState, setThemeEditorState] = useState<ThemeColors>(themeColors);
  
  // Add state for active color being edited
  const [activeColorEdit, setActiveColorEdit] = useState<{category: string, variant: string} | null>(null);
  
  // Update local editor state when hook state changes
  useEffect(() => {
    setThemeEditorState(themeColors);
  }, [themeColors]);
  
  // Add state for color schemes
  const [colorSchemes, setColorSchemes] = useState<{name: string, colors: ThemeColors}[]>([]);
  const [currentSchemeName, setCurrentSchemeName] = useState<string>("");
  
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
  
  // Handle clicking on an element under the overlay
  const handleElementClick = (event: MouseEvent) => {
    if (!isSelectionMode || !selectionCallback) return;
    
    // Get the elements under the pointer
    const elementsUnderPointer = document.elementsFromPoint(event.clientX, event.clientY);
    
    // The first element is our overlay, the second is the actual target
    if (elementsUnderPointer.length > 1) {
      const targetElement = elementsUnderPointer[1] as HTMLElement;
      
      // Don't select the theme debugger buttons
      if (targetElement.closest('#theme-debugger-controls')) {
        return;
      }
      
      selectionCallback(targetElement);
    }
  };
  
  // Start the element picker
  const startElementPicker = () => {
    setIsColorPickerActive(true);
    isSelectionMode = true;
    document.body.style.cursor = 'crosshair';
    
    // Close the modal if it's open to allow selection
    setOpen(false);
    
    // Create a full-page overlay to intercept all clicks
    const overlay = document.createElement('div');
    overlay.id = 'theme-debugger-overlay';
    overlay.style.position = 'fixed';
    overlay.style.top = '0';
    overlay.style.left = '0';
    overlay.style.width = '100%';
    overlay.style.height = '100%';
    overlay.style.backgroundColor = 'rgba(0, 0, 0, 0.1)';
    overlay.style.zIndex = '9998';
    overlay.style.pointerEvents = 'all';
    
    // Add the click handler directly to the overlay
    overlay.addEventListener('click', handleElementClick);
    
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
      
      // Show a selection dialog to choose between background or text color
      const selectionDialog = document.createElement('div');
      selectionDialog.id = 'theme-debugger-color-selection';
      selectionDialog.style.position = 'fixed';
      selectionDialog.style.top = '50%';
      selectionDialog.style.left = '50%';
      selectionDialog.style.transform = 'translate(-50%, -50%)';
      selectionDialog.style.backgroundColor = 'white';
      selectionDialog.style.padding = '20px';
      selectionDialog.style.borderRadius = '8px';
      selectionDialog.style.boxShadow = '0 4px 16px rgba(0, 0, 0, 0.2)';
      selectionDialog.style.zIndex = '10000';
      selectionDialog.style.display = 'flex';
      selectionDialog.style.flexDirection = 'column';
      selectionDialog.style.gap = '10px';
      selectionDialog.style.minWidth = '300px';
      
      const title = document.createElement('h3');
      title.textContent = 'Select Color to Edit';
      title.style.margin = '0 0 10px 0';
      selectionDialog.appendChild(title);
      
      // Only show options for colors that are actually set
      const hasBackground = backgroundColor !== 'rgba(0, 0, 0, 0)' && backgroundColor !== 'transparent';
      
      if (hasBackground) {
        const bgColorOption = document.createElement('button');
        bgColorOption.textContent = 'Edit Background Color';
        bgColorOption.style.padding = '10px';
        bgColorOption.style.margin = '5px 0';
        bgColorOption.style.cursor = 'pointer';
        bgColorOption.style.borderRadius = '4px';
        bgColorOption.style.border = '1px solid #ccc';
        bgColorOption.style.backgroundColor = backgroundColor;
        bgColorOption.style.color = getContrastColor(backgroundColor);
        bgColorOption.style.fontWeight = 'bold';
        
        bgColorOption.onclick = () => {
          handleElementColorSelection(element, 'backgroundColor', backgroundColor);
          selectionDialog.remove();
        };
        
        selectionDialog.appendChild(bgColorOption);
      }
      
      const textColorOption = document.createElement('button');
      textColorOption.textContent = 'Edit Text Color';
      textColorOption.style.padding = '10px';
      textColorOption.style.margin = '5px 0';
      textColorOption.style.cursor = 'pointer';
      textColorOption.style.borderRadius = '4px';
      textColorOption.style.border = '1px solid #ccc';
      textColorOption.style.backgroundColor = color;
      textColorOption.style.color = getContrastColor(color);
      textColorOption.style.fontWeight = 'bold';
      
      textColorOption.onclick = () => {
        handleElementColorSelection(element, 'color', color);
        selectionDialog.remove();
      };
      
      selectionDialog.appendChild(textColorOption);
      
      const cancelBtn = document.createElement('button');
      cancelBtn.textContent = 'Cancel';
      cancelBtn.style.padding = '10px';
      cancelBtn.style.margin = '5px 0';
      cancelBtn.style.cursor = 'pointer';
      cancelBtn.style.borderRadius = '4px';
      cancelBtn.style.border = '1px solid #ccc';
      
      cancelBtn.onclick = () => {
        selectionDialog.remove();
        startElementPicker(); // Restart picker
      };
      
      selectionDialog.appendChild(cancelBtn);
      
      document.body.appendChild(selectionDialog);
      
      // Stop the picker while showing the dialog
      stopElementPicker();
    };
  };
  
  // Helper function to determine contrast color (black or white) for a background
  const getContrastColor = (colorValue: string): string => {
    // Convert rgb/rgba to hex if necessary
    let hexColor = '#000000';
    
    if (colorValue.startsWith('rgb')) {
      const rgb = colorValue.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        hexColor = '#' + 
          parseInt(rgb[0]).toString(16).padStart(2, '0') +
          parseInt(rgb[1]).toString(16).padStart(2, '0') +
          parseInt(rgb[2]).toString(16).padStart(2, '0');
      }
    } else if (colorValue.startsWith('#')) {
      hexColor = colorValue;
    }
    
    // Determine brightness (simple formula: R*0.299 + G*0.587 + B*0.114)
    const r = parseInt(hexColor.substring(1, 3), 16);
    const g = parseInt(hexColor.substring(3, 5), 16);
    const b = parseInt(hexColor.substring(5, 7), 16);
    const brightness = (r * 0.299 + g * 0.587 + b * 0.114);
    
    // Return black for bright colors, white for dark ones
    return brightness > 140 ? '#000000' : '#ffffff';
  };
  
  // Handle element color selection after choosing bg or text
  const handleElementColorSelection = (element: HTMLElement, property: string, colorValue: string) => {
    // Convert rgb/rgba to hex
    let hexColor = '#000000';
    if (colorValue.startsWith('rgb')) {
      const rgb = colorValue.match(/\d+/g);
      if (rgb && rgb.length >= 3) {
        hexColor = '#' + 
          parseInt(rgb[0]).toString(16).padStart(2, '0') +
          parseInt(rgb[1]).toString(16).padStart(2, '0') +
          parseInt(rgb[2]).toString(16).padStart(2, '0');
      }
    } else if (colorValue.startsWith('#')) {
      hexColor = colorValue;
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
    
    // Open the drawer
    setIsDrawerOpen(true);
  };
  
  // Stop the element picker
  const stopElementPicker = () => {
    isSelectionMode = false;
    selectionCallback = null;
    document.body.style.cursor = '';
    
    // Remove the overlay
    const overlay = document.getElementById('theme-debugger-overlay');
    if (overlay) {
      overlay.removeEventListener('click', handleElementClick);
      overlay.remove();
    }
    
    // Remove the message
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
  
  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (isColorPickerActive) {
        stopElementPicker();
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
        
        <Button 
          variant="outlined" 
          color="primary" 
          startIcon={<PaletteIcon />}
          sx={{ mb: 2 }}
          onClick={() => setTabValue(1)} // Switch to edit theme tab
        >
          Edit These Colors
        </Button>
        
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
                            // Set the active color edit in the theme editor
                            setTabValue(1); // Switch to edit theme tab
                            setTimeout(() => {
                              const editBtn = document.querySelector(`[data-color-key="${colorKey}"]`) as HTMLElement;
                              if (editBtn) editBtn.click();
                            }, 100);
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
                            position: 'relative',
                            '&:hover': { 
                              opacity: 0.9,
                              '&::after': {
                                content: '"Edit"',
                                position: 'absolute',
                                backgroundColor: 'rgba(0,0,0,0.5)',
                                color: 'white',
                                width: '100%',
                                height: '100%',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                borderRadius: 'inherit',
                              }
                            }
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
  
  // Update a specific theme color - now using the hook
  const handleUpdateThemeColor = (category: string, variant: string, color: string) => {
    // Update local state
    setThemeEditorState(prev => {
      const newState = JSON.parse(JSON.stringify(prev));
      // @ts-ignore - Dynamic property access
      newState[category][variant] = color;
      return newState;
    });
    
    // Update global state via hook
    updateThemeColor(category, variant, color);
  };
  
  // Save current theme as a scheme
  const saveCurrentScheme = () => {
    if (!currentSchemeName) return;
    
    const newScheme = {
      name: currentSchemeName,
      colors: JSON.parse(JSON.stringify(themeEditorState))
    };
    
    // Add to schemes or update existing
    setColorSchemes(prev => {
      const existing = prev.findIndex(s => s.name === currentSchemeName);
      if (existing >= 0) {
        const updated = [...prev];
        updated[existing] = newScheme;
        return updated;
      } else {
        return [...prev, newScheme];
      }
    });
    
    // Save to localStorage
    try {
      const existingSchemes = JSON.parse(localStorage.getItem('themeColorSchemes') || '[]');
      const schemeIndex = existingSchemes.findIndex((s: {name: string}) => s.name === currentSchemeName);
      
      if (schemeIndex >= 0) {
        existingSchemes[schemeIndex] = newScheme;
      } else {
        existingSchemes.push(newScheme);
      }
      
      localStorage.setItem('themeColorSchemes', JSON.stringify(existingSchemes));
      
      // Save as active scheme
      localStorage.setItem('activeThemeScheme', currentSchemeName);
    } catch (e) {
      console.error('Failed to save color scheme to localStorage', e);
    }
  };
  
  // Load schemes from localStorage on mount
  useEffect(() => {
    try {
      const savedSchemes = localStorage.getItem('themeColorSchemes');
      if (savedSchemes) {
        setColorSchemes(JSON.parse(savedSchemes));
      }
      
      // Get active scheme name
      const activeScheme = localStorage.getItem('activeThemeScheme');
      if (activeScheme) {
        setCurrentSchemeName(activeScheme);
      }
    } catch (e) {
      console.error('Failed to load color schemes from localStorage', e);
    }
  }, []);
  
  // Apply a saved scheme
  const applyColorScheme = (scheme: {name: string, colors: ThemeColors}) => {
    setThemeEditorState(scheme.colors);
    setCurrentSchemeName(scheme.name);
    
    // Apply all colors via the hook
    applyThemeColors(scheme.colors);
    
    // Save as active scheme
    localStorage.setItem('activeThemeScheme', scheme.name);
  };
  
  // Delete a saved scheme
  const deleteColorScheme = (schemeName: string) => {
    setColorSchemes(prev => prev.filter(scheme => scheme.name !== schemeName));
    
    // Remove from localStorage
    try {
      const existingSchemes = JSON.parse(localStorage.getItem('themeColorSchemes') || '[]');
      const updatedSchemes = existingSchemes.filter((s: {name: string}) => s.name !== schemeName);
      localStorage.setItem('themeColorSchemes', JSON.stringify(updatedSchemes));
    } catch (e) {
      console.error('Failed to delete color scheme from localStorage', e);
    }
  };
  
  // Export scheme to clipboard as JSON
  const exportSchemeAsJson = () => {
    const schemeData = JSON.stringify(themeEditorState, null, 2);
    navigator.clipboard.writeText(schemeData)
      .then(() => {
        alert('Theme colors copied to clipboard as JSON');
      })
      .catch(err => {
        console.error('Failed to copy', err);
      });
  };
  
  // Export scheme to clipboard as CSS variables
  const exportSchemeAsCss = () => {
    let cssVars = ':root {\n';
    
    Object.entries(themeEditorState).forEach(([category, variants]) => {
      Object.entries(variants).forEach(([variant, color]) => {
        cssVars += `  --mui-palette-${category}-${variant}: ${color};\n`;
      });
    });
    
    cssVars += '}';
    
    navigator.clipboard.writeText(cssVars)
      .then(() => {
        alert('Theme colors copied to clipboard as CSS variables');
      })
      .catch(err => {
        console.error('Failed to copy', err);
      });
  };
  
  // Render the theme editor
  const renderThemeEditor = () => {
    const categories = [
      // Core app colors
      { name: 'background', label: 'Background', primary: true },
      { name: 'text', label: 'Text', primary: true },
      // Theme colors
      { name: 'primary', label: 'Primary', primary: true },
      { name: 'secondary', label: 'Secondary', primary: true },
      // Supporting colors
      { name: 'success', label: 'Success' },
      { name: 'error', label: 'Error' },
      { name: 'warning', label: 'Warning' },
      { name: 'info', label: 'Info' },
    ];
    
    return (
      <Box>
        <Typography variant="h6" gutterBottom>Edit Theme Colors</Typography>
        
        {/* Primary colors - show these prominently */}
        <Paper sx={{ p: 2, mb: 4, mt: 2, backgroundColor: 'rgba(0,0,0,0.02)' }}>
          <Typography variant="subtitle1" gutterBottom>Key Theme Colors</Typography>
          <Grid container spacing={2}>
            {categories
              .filter(cat => cat.primary)
              .map((category) => (
                <Grid item xs={12} sm={6} key={category.name}>
                  <Paper elevation={0} sx={{ p: 2, mb: 1, backgroundColor: category.name === 'background' ? themeEditorState.background.default : 'white' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1, fontWeight: 'bold' }}>{category.label}</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(themeEditorState[category.name] || {}).map(([variant, color]) => (
                        <Grid item xs={6} key={`${category.name}-${variant}`}>
                          <Box sx={{ position: 'relative', mb: 1 }}>
                            <Typography 
                              variant="caption" 
                              color="text.secondary"
                              sx={{ mb: 0.5, display: 'block' }}
                            >
                              {variant}
                            </Typography>
                            <Box 
                              sx={{ 
                                height: 48, 
                                borderRadius: 1, 
                                backgroundColor: color,
                                border: '1px solid #ccc',
                                cursor: 'pointer',
                                position: 'relative',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                '&:hover': {
                                  '&::after': {
                                    content: '"Edit"',
                                    position: 'absolute',
                                    backgroundColor: 'rgba(0,0,0,0.5)',
                                    color: 'white',
                                    width: '100%',
                                    height: '100%',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    borderRadius: 'inherit',
                                  }
                                }
                              }}
                              onClick={() => setActiveColorEdit({ category: category.name, variant })}
                              data-color-key={`${category.name}.${variant}`}
                            >
                              <Typography variant="caption" 
                                sx={{ 
                                  color: category.name === 'text' ? color : getContrastColor(color as string)
                                }}
                              >
                                {color}
                              </Typography>
                            </Box>
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Paper>
        
        {/* Other categories - regular grid layout */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Supporting Colors</Typography>
          <Grid container spacing={2}>
            {categories
              .filter(cat => !cat.primary)
              .map((category) => (
                <Grid item xs={12} sm={6} key={category.name}>
                  <Paper sx={{ p: 2, boxShadow: '0 2px 4px rgba(0,0,0,0.1)' }}>
                    <Typography variant="subtitle2" sx={{ mb: 1 }}>{category.label}</Typography>
                    <Grid container spacing={1}>
                      {Object.entries(themeEditorState[category.name] || {}).map(([variant, color]) => (
                        <Grid item xs={6} key={`${category.name}-${variant}`}>
                          <Box sx={{ mb: 1 }}>
                            <Typography variant="caption" color="text.secondary">
                              {variant}
                            </Typography>
                          </Box>
                          <Box 
                            sx={{ 
                              height: 40, 
                              borderRadius: 1, 
                              backgroundColor: color,
                              border: '1px solid #ccc',
                              mb: 1,
                              cursor: 'pointer',
                              position: 'relative',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              '&:hover': {
                                '&::after': {
                                  content: '"Edit"',
                                  position: 'absolute',
                                  backgroundColor: 'rgba(0,0,0,0.5)',
                                  color: 'white',
                                  width: '100%',
                                  height: '100%',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  borderRadius: 'inherit',
                                }
                              }
                            }}
                            onClick={() => setActiveColorEdit({ category: category.name, variant })}
                            data-color-key={`${category.name}.${variant}`}
                          >
                            <Typography variant="caption" sx={{ color: getContrastColor(color as string) }}>
                              {color}
                            </Typography>
                          </Box>
                          <Box sx={{ display: 'flex', alignItems: 'center' }}>
                            <TextField
                              fullWidth
                              size="small"
                              value={color}
                              onChange={(e) => handleUpdateThemeColor(category.name, variant, e.target.value)}
                              InputProps={{
                                startAdornment: (
                                  <Box
                                    component="span"
                                    sx={{
                                      display: 'inline-block',
                                      width: 16,
                                      height: 16,
                                      backgroundColor: color,
                                      borderRadius: '50%',
                                      mr: 1,
                                      border: '1px solid #ccc',
                                    }}
                                    onClick={() => setActiveColorEdit({ category: category.name, variant })}
                                  />
                                ),
                              }}
                            />
                          </Box>
                        </Grid>
                      ))}
                    </Grid>
                  </Paper>
                </Grid>
              ))}
          </Grid>
        </Box>
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Scheme Management</Typography>
          <Grid container spacing={2} alignItems="center">
            <Grid item xs={12} sm={6}>
              <TextField
                fullWidth
                size="small"
                label="Scheme Name"
                value={currentSchemeName}
                onChange={(e) => setCurrentSchemeName(e.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <Button 
                variant="contained" 
                color="primary" 
                onClick={saveCurrentScheme}
                startIcon={<SaveIcon />}
                disabled={!currentSchemeName}
                fullWidth
              >
                Save Scheme
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Saved schemes */}
        {colorSchemes.length > 0 && (
          <Box sx={{ mb: 4 }}>
            <Typography variant="subtitle1" gutterBottom>Saved Schemes</Typography>
            <Grid container spacing={1}>
              {colorSchemes.map((scheme) => (
                <Grid item xs={12} key={scheme.name}>
                  <Paper
                    sx={{
                      p: 2,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      mb: 1,
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Typography variant="body1">{scheme.name}</Typography>
                      <Box sx={{ display: 'flex', ml: 2 }}>
                        {Object.entries(scheme.colors.primary).map(([variant, color]) => (
                          <Box
                            key={variant}
                            sx={{
                              width: 20,
                              height: 20,
                              borderRadius: '50%',
                              backgroundColor: color,
                              ml: 0.5,
                              border: '1px solid #ccc',
                            }}
                          />
                        ))}
                      </Box>
                    </Box>
                    <Box>
                      <Button
                        size="small"
                        onClick={() => applyColorScheme(scheme)}
                      >
                        Apply
                      </Button>
                      <IconButton
                        color="error"
                        onClick={() => deleteColorScheme(scheme.name)}
                      >
                        <CloseIcon fontSize="small" />
                      </IconButton>
                    </Box>
                  </Paper>
                </Grid>
              ))}
            </Grid>
          </Box>
        )}
        
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Export Options</Typography>
          <Grid container spacing={2}>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={exportSchemeAsJson}
              >
                Export as JSON
              </Button>
            </Grid>
            <Grid item xs={6}>
              <Button 
                variant="outlined" 
                fullWidth
                onClick={exportSchemeAsCss}
              >
                Export as CSS
              </Button>
            </Grid>
          </Grid>
        </Box>
        
        {/* Color Editor */}
        <Box sx={{ mb: 4 }}>
          <Typography variant="subtitle1" gutterBottom>Theme Colors</Typography>
          
          {/* Color picker popover for direct editing */}
          <Dialog 
            open={!!activeColorEdit} 
            onClose={() => setActiveColorEdit(null)}
            maxWidth="xs"
            fullWidth
          >
            {activeColorEdit && (
              <>
                <DialogTitle>
                  Edit {activeColorEdit.category}.{activeColorEdit.variant}
                </DialogTitle>
                <DialogContent>
                  <Box sx={{ mb: 2 }}>
                    <HexColorPicker
                      color={themeEditorState[activeColorEdit.category][activeColorEdit.variant]}
                      onChange={(color) => {
                        handleUpdateThemeColor(activeColorEdit.category, activeColorEdit.variant, color);
                      }}
                      style={{ width: '100%', height: 200 }}
                    />
                  </Box>
                  <TextField
                    fullWidth
                    label="Hex Color"
                    value={themeEditorState[activeColorEdit.category][activeColorEdit.variant]}
                    onChange={(e) => {
                      handleUpdateThemeColor(activeColorEdit.category, activeColorEdit.variant, e.target.value);
                    }}
                    variant="outlined"
                    size="small"
                    margin="normal"
                  />
                  
                  {/* HSL controls */}
                  <Box sx={{ mt: 2 }}>
                    <Typography variant="subtitle2" gutterBottom>HSL Adjustments</Typography>
                    {(() => {
                      const currentColor = themeEditorState[activeColorEdit.category][activeColorEdit.variant];
                      const { h, s, l } = hexToHSL(currentColor);
                      
                      return (
                        <>
                          <Typography variant="body2">Hue: {Math.round(h)}°</Typography>
                          <Slider
                            value={h}
                            min={0}
                            max={360}
                            onChange={(_, value) => {
                              const newColor = hslToHex(value as number, s, l);
                              handleUpdateThemeColor(activeColorEdit.category, activeColorEdit.variant, newColor);
                            }}
                            size="small"
                          />
                          
                          <Typography variant="body2">Saturation: {Math.round(s)}%</Typography>
                          <Slider
                            value={s}
                            min={0}
                            max={100}
                            onChange={(_, value) => {
                              const newColor = hslToHex(h, value as number, l);
                              handleUpdateThemeColor(activeColorEdit.category, activeColorEdit.variant, newColor);
                            }}
                            size="small"
                          />
                          
                          <Typography variant="body2">Lightness: {Math.round(l)}%</Typography>
                          <Slider
                            value={l}
                            min={0}
                            max={100}
                            onChange={(_, value) => {
                              const newColor = hslToHex(h, s, value as number);
                              handleUpdateThemeColor(activeColorEdit.category, activeColorEdit.variant, newColor);
                            }}
                            size="small"
                          />
                        </>
                      );
                    })()}
                  </Box>
                </DialogContent>
                <DialogActions>
                  <Button onClick={() => setActiveColorEdit(null)} color="primary">
                    Done
                  </Button>
                </DialogActions>
              </>
            )}
          </Dialog>
          
          {categories.map((category) => (
            <Box key={category.name} sx={{ mb: 3 }}>
              <Typography variant="subtitle2" sx={{ mb: 1 }}>{category.label}</Typography>
              <Grid container spacing={2}>
                {Object.entries(themeEditorState[category.name] || {}).map(([variant, color]) => (
                  <Grid item xs={12} sm={4} key={`${category.name}-${variant}`}>
                    <Paper 
                      sx={{ 
                        p: 2, 
                        display: 'flex', 
                        flexDirection: 'column',
                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)', 
                        minHeight: '100%'
                      }}
                    >
                      <Box sx={{ mb: 1 }}>
                        <Typography variant="caption" color="text.secondary">
                          {variant}
                        </Typography>
                      </Box>
                      <Box 
                        sx={{ 
                          height: 40, 
                          borderRadius: 1, 
                          backgroundColor: color,
                          border: '1px solid #ccc',
                          mb: 1,
                          cursor: 'pointer',
                          position: 'relative',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          '&:hover': {
                            '&::after': {
                              content: '"Edit"',
                              position: 'absolute',
                              backgroundColor: 'rgba(0,0,0,0.5)',
                              color: 'white',
                              width: '100%',
                              height: '100%',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              borderRadius: 'inherit',
                            }
                          }
                        }}
                        onClick={() => setActiveColorEdit({ category: category.name, variant })}
                        data-color-key={`${category.name}.${variant}`}
                      />
                      <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                        <TextField
                          fullWidth
                          size="small"
                          value={color}
                          onChange={(e) => handleUpdateThemeColor(category.name, variant, e.target.value)}
                          InputProps={{
                            startAdornment: (
                              <Box
                                component="span"
                                sx={{
                                  display: 'inline-block',
                                  width: 16,
                                  height: 16,
                                  backgroundColor: color,
                                  borderRadius: '50%',
                                  mr: 1,
                                  border: '1px solid #ccc',
                                }}
                                onClick={() => setActiveColorEdit({ category: category.name, variant })}
                              />
                            ),
                          }}
                        />
                      </Box>
                    </Paper>
                  </Grid>
                ))}
              </Grid>
            </Box>
          ))}
          
          {/* Save changes button */}
          <Box mt={3} display="flex" justifyContent="flex-end">
            <Button 
              variant="contained" 
              color="primary"
              onClick={() => {
                // Generate a timestamped scheme name if none is provided
                if (!currentSchemeName) {
                  const timestamp = new Date().toLocaleString().replace(/[/,:\s]/g, '_');
                  setCurrentSchemeName(`Theme_${timestamp}`);
                  setTimeout(() => saveCurrentScheme(), 100);
                } else {
                  saveCurrentScheme();
                }
                
                // Provide feedback
                alert('Theme changes saved successfully!');
              }}
              startIcon={<SaveIcon />}
            >
              Save Current Theme
            </Button>
          </Box>
        </Box>
      </Box>
    );
  };
  
  // Render a color picker for editing theme colors
  const renderColorPickerPanel = () => (
    <Box>
      <Typography variant="h6" gutterBottom>Color Picker</Typography>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <HexColorPicker
            color={customColor}
            onChange={setCustomColor}
            style={{ width: '100%', height: 200 }}
          />
          <TextField
            fullWidth
            margin="normal"
            label="Hex Color"
            value={customColor}
            onChange={(e) => setCustomColor(e.target.value)}
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
          />
          
          <Typography variant="body2" gutterBottom>Saturation: {Math.round(saturation)}%</Typography>
          <Slider
            value={saturation}
            min={0}
            max={100}
            onChange={handleSaturationChange}
            aria-labelledby="saturation-slider"
          />
          
          <Typography variant="body2" gutterBottom>Lightness: {Math.round(lightness)}%</Typography>
          <Slider
            value={lightness}
            min={0}
            max={100}
            onChange={handleLightnessChange}
            aria-labelledby="lightness-slider"
          />
        </Grid>
      </Grid>
      
      <Box sx={{ mt: 3 }}>
        <Typography variant="subtitle1" gutterBottom>Apply To Theme Color:</Typography>
        <Grid container spacing={1}>
          {Object.entries(theme.palette).map(([category, values]) => {
            if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
              return Object.entries(values).map(([variant, _]) => {
                if (typeof _ === 'string' && _.startsWith('#')) {
                  const colorKey = `${category}.${variant}`;
                  return (
                    <Grid item key={colorKey}>
                      <Chip
                        label={colorKey}
                        onClick={() => handleUpdateThemeColor(category, variant, customColor)}
                        sx={{
                          backgroundColor: theme.palette[category][variant],
                          color: category === 'background' ? theme.palette.text.primary : '#fff',
                          '&:hover': {
                            backgroundColor: alpha(theme.palette[category][variant], 0.9),
                          }
                        }}
                      />
                    </Grid>
                  );
                }
                return null;
              });
            }
            return null;
          }).flat().filter(Boolean)}
        </Grid>
      </Box>
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
              onClick={handleOpenPicker}
            >
              Click to select an element
            </Button>
          </Box>
        )}
      </Drawer>
      
      {/* Theme colors modal */}
      <Dialog
        open={open}
        onClose={handleClose}
        maxWidth="md"
        fullWidth
      >
        <DialogTitle sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Typography variant="h6">Theme Customization</Typography>
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
        
        <Box sx={{ borderBottom: 1, borderColor: 'divider', px: 3 }}>
          <Tabs value={tabValue} onChange={handleTabChange} aria-label="theme debugger tabs">
            <Tab label="View Colors" />
            <Tab label="Edit Theme" />
            <Tab label="Manage Schemes" />
            <Tab label="Color Picker" />
          </Tabs>
        </Box>
        
        <DialogContent dividers>
          <TabPanel value={tabValue} index={0}>
            {renderThemeColors()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={1}>
            {renderThemeEditor()}
          </TabPanel>
          
          <TabPanel value={tabValue} index={2}>
            <Box>
              <Typography variant="h6" gutterBottom>Color Scheme Management</Typography>
              <Box sx={{ mb: 3 }}>
                <TextField
                  fullWidth
                  label="Scheme Name"
                  value={currentSchemeName}
                  onChange={(e) => setCurrentSchemeName(e.target.value)}
                  sx={{ mb: 2 }}
                />
                <Button
                  variant="contained"
                  color="primary"
                  onClick={saveCurrentScheme}
                  startIcon={<SaveIcon />}
                  disabled={!currentSchemeName}
                  fullWidth
                >
                  Save Current Theme as Scheme
                </Button>
              </Box>
              
              {colorSchemes.length > 0 ? (
                <Grid container spacing={2}>
                  {colorSchemes.map((scheme) => (
                    <Grid item xs={12} key={scheme.name}>
                      <Paper
                        sx={{
                          p: 2,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                        }}
                      >
                        <Box>
                          <Typography variant="subtitle1">{scheme.name}</Typography>
                          <Box sx={{ display: 'flex', mt: 1 }}>
                            {['primary', 'secondary', 'success', 'error', 'warning'].map((cat) => (
                              <Box
                                key={cat}
                                sx={{
                                  width: 24,
                                  height: 24,
                                  borderRadius: '50%',
                                  backgroundColor: scheme.colors[cat].main,
                                  mr: 0.5,
                                  border: '1px solid #ddd',
                                }}
                              />
                            ))}
                          </Box>
                        </Box>
                        <Box>
                          <Button
                            variant="outlined"
                            size="small"
                            onClick={() => applyColorScheme(scheme)}
                            sx={{ mr: 1 }}
                          >
                            Apply
                          </Button>
                          <IconButton
                            color="error"
                            onClick={() => deleteColorScheme(scheme.name)}
                            size="small"
                          >
                            <CloseIcon />
                          </IconButton>
                        </Box>
                      </Paper>
                    </Grid>
                  ))}
                </Grid>
              ) : (
                <Typography variant="body1" color="text.secondary" sx={{ textAlign: 'center', mt: 3 }}>
                  No saved color schemes yet. Save your current theme to get started.
                </Typography>
              )}
            </Box>
          </TabPanel>
          
          <TabPanel value={tabValue} index={3}>
            {renderColorPickerPanel()}
          </TabPanel>
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