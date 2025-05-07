'use client';

import { useState, useEffect } from 'react';
import { useTheme } from '@mui/material/styles';

export interface ThemeColors {
  primary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  secondary: {
    main: string;
    light: string;
    dark: string;
    contrastText: string;
  };
  success: {
    main: string;
    light: string;
    dark: string;
  };
  error: {
    main: string;
    light: string;
    dark: string;
  };
  warning: {
    main: string;
    light: string;
    dark: string;
  };
  info: {
    main: string;
    light: string;
    dark: string;
  };
  background: {
    default: string;
    paper: string;
  };
  text: {
    primary: string;
    secondary: string;
  };
}

/**
 * Hook for updating theme colors via CSS variables
 * This ensures changes to colors are applied globally without theme recreation
 */
export default function useThemeUpdater() {
  const theme = useTheme();
  const [themeColors, setThemeColors] = useState<ThemeColors>({
    primary: {
      main: theme.palette.primary.main,
      light: theme.palette.primary.light,
      dark: theme.palette.primary.dark,
      contrastText: theme.palette.primary.contrastText,
    },
    secondary: {
      main: theme.palette.secondary.main,
      light: theme.palette.secondary.light,
      dark: theme.palette.secondary.dark,
      contrastText: theme.palette.secondary.contrastText,
    },
    success: {
      main: theme.palette.success.main,
      light: theme.palette.success.light,
      dark: theme.palette.success.dark,
    },
    error: {
      main: theme.palette.error.main,
      light: theme.palette.error.light,
      dark: theme.palette.error.dark,
    },
    warning: {
      main: theme.palette.warning.main,
      light: theme.palette.warning.light,
      dark: theme.palette.warning.dark,
    },
    info: {
      main: theme.palette.info.main,
      light: theme.palette.info.light,
      dark: theme.palette.info.dark,
    },
    background: {
      default: theme.palette.background.default,
      paper: theme.palette.background.paper,
    },
    text: {
      primary: theme.palette.text.primary,
      secondary: theme.palette.text.secondary,
    },
  });

  // Update a specific theme color
  const updateThemeColor = (category: string, variant: string, color: string) => {
    // Validate the color is a hex color
    if (!color.match(/^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
      // Try to correct it if it's missing a hash
      if (color.match(/^([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/)) {
        color = `#${color}`;
      } else {
        // Skip invalid colors
        console.warn(`Invalid color format: ${color}. Expected hex color.`);
        return;
      }
    }

    setThemeColors(prev => {
      const newState = { ...prev };
      // @ts-ignore - Dynamic property access
      if (newState[category] && newState[category][variant] !== undefined) {
        // @ts-ignore - Dynamic property access
        newState[category][variant] = color;
      }
      return newState;
    });

    // Apply the color change to CSS variable
    document.documentElement.style.setProperty(
      `--mui-palette-${category}-${variant}`,
      color
    );

    // Also update MUI's theme directly for components that don't use CSS vars
    try {
      // @ts-ignore - We're modifying the theme object directly
      if (theme.palette[category] && theme.palette[category][variant] !== undefined) {
        // @ts-ignore - Dynamic property access
        theme.palette[category][variant] = color;
      }
    } catch (e) {
      console.warn("Could not update theme object directly", e);
    }
  };

  // Apply all theme colors
  const applyThemeColors = (colors: ThemeColors) => {
    setThemeColors(colors);
    
    // Apply all colors to CSS variables
    Object.entries(colors).forEach(([category, variants]) => {
      Object.entries(variants).forEach(([variant, color]) => {
        document.documentElement.style.setProperty(
          `--mui-palette-${category}-${variant}`, 
          color
        );
        
        // Also update MUI's theme directly
        try {
          // @ts-ignore - We're modifying the theme object directly
          if (theme.palette[category] && theme.palette[category][variant] !== undefined) {
            // @ts-ignore - Dynamic property access
            theme.palette[category][variant] = color;
          }
        } catch (e) {
          console.warn(`Could not update ${category}.${variant} directly`, e);
        }
      });
    });
    
    // Force a small change to trigger component rerender
    document.body.style.transition = 'none';
    document.body.style.opacity = '0.99';
    setTimeout(() => {
      document.body.style.opacity = '1';
      document.body.style.transition = '';
    }, 10);
  };

  // Make sure all CSS variables are set on component mount
  useEffect(() => {
    // Set initial CSS variables
    Object.entries(themeColors).forEach(([category, variants]) => {
      Object.entries(variants).forEach(([variant, color]) => {
        document.documentElement.style.setProperty(
          `--mui-palette-${category}-${variant}`, 
          color
        );
      });
    });
    
    // Check for saved schemes in localStorage on mount
    try {
      const lastActiveScheme = localStorage.getItem('activeThemeScheme');
      if (lastActiveScheme) {
        const schemes = JSON.parse(localStorage.getItem('themeColorSchemes') || '[]');
        const scheme = schemes.find((s: any) => s.name === lastActiveScheme);
        if (scheme && scheme.colors) {
          applyThemeColors(scheme.colors);
          console.log(`Applied saved theme: ${lastActiveScheme}`);
        }
      }
    } catch (e) {
      console.error('Failed to load active theme scheme', e);
    }
  }, []);

  return {
    themeColors,
    updateThemeColor,
    applyThemeColors,
  };
} 