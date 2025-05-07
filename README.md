# Landscape CRM

A modern CRM system for landscape businesses with real-time theme customization capabilities.

## Project Overview

This Next.js application helps landscape businesses manage their operations with features such as:

- Dashboard analytics with revenue tracking
- Job management
- Client management
- Scheduling
- Estimates and invoicing
- Employee management
- Messaging

The project uses Material UI with a custom theme system that can be modified in real-time directly from the UI.

## Theme Customization Features

The CRM includes a powerful theme customization system that allows administrators to:

### 1. Interactive Theme Debugger

The Theme Debugger allows you to select and modify the colors of any element on any page:

- **Element Picker**: Click the green eyedropper button to enter selection mode, then click any element to edit its colors
  - Choose between editing background or text color with an intuitive selection dialog
  - Auto-detects available color properties on the selected element
- **Color Editor**: After selecting an element, use the side panel to modify:
  - Hex color values with real-time preview
  - HSL adjustments (hue, saturation, lightness)
  - Direct mapping to theme colors
- **Theme Color Palette**: Access the full theme color palette for quick reference and application

### 2. Color Scheme Management

We've implemented a comprehensive system for saving and loading color schemes:

- View all colors used in the application
- Directly edit primary, secondary, and all system colors
- Save and load multiple color schemes with custom names
- Automatically persist active theme between sessions
- Export color values as JavaScript, CSS variables, or JSON
- Visual preview of saved schemes before applying them

### 3. Global Theme Editor

The enhanced theme editor features a visual interface for editing the entire theme:

- Prominent display of key theme colors:
  - Background colors with live preview
  - Text colors shown with actual styling
  - Primary and secondary brand colors
- Supporting colors section for:
  - Success, error, warning, and info colors
  - All color variants (main, light, dark)
- Interactive color editing:
  - Direct hex input with validation
  - Advanced color picker with visual selection
  - HSL sliders for precise adjustments
  - Preview of hex values directly on color swatches
- One-click saving of the entire color scheme

## Key Files

The theme customization system is built from the following components:

1. **Theme Definition**: `src/app/styles/theme.ts`
   - Contains the color palette and component styling
   - Defines primary, secondary, success, warning, error, and info colors
   - Uses CSS variables for dynamic theme updates without page reload

2. **Theme State Management**: `src/app/styles/useThemeUpdater.tsx`
   - Custom React hook for managing theme state
   - Handles persistence of theme changes through CSS variables
   - Provides utilities for updating individual colors or entire schemes

3. **Theme Debugger Components**:
   - `src/components/ThemeDebuggerModal.tsx`: The main modal component with element picker and color editor
   - `src/components/Layout.tsx`: Integrates the theme debugger into the application layout

## Getting Started

### Installation

```bash
# Install dependencies
npm install

# Run development server
npm run dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the application.

## Using the Theme Debugger

1. **Accessing the Theme Debugger**:
   - On any page, you'll see two floating buttons in the bottom-right corner
   - Green eyedropper button: Activates element selection mode
   - Blue palette button: Shows theme colors panel

2. **Selecting and Editing Elements**:
   - Click the green eyedropper button
   - A translucent overlay appears with instructions
   - Click any element on the page (even buttons, charts, text)
   - Choose between editing background color or text color from the options dialog
   - A side drawer opens showing the element's color information
   - Use the color picker or HSL sliders to adjust the color
   - Click "Apply" to keep the changes or "Reset" to revert

3. **Editing Theme Colors**:
   - Click the blue palette button to open the theme panel
   - Navigate to the "Edit Theme" tab
   - Colors are organized into "Key Theme Colors" and "Supporting Colors" sections
   - Click on any color swatch to open the dedicated color picker
   - Adjust colors using the visual picker, hex input, or HSL sliders
   - Changes are applied in real-time to the entire application
   - Click "Save Current Theme" to preserve your changes

4. **Managing Color Schemes**:
   - In the theme panel, navigate to the "Manage Schemes" tab
   - Enter a name for your color scheme and click "Save"
   - View a preview of saved schemes with color swatches
   - Apply saved schemes with a single click
   - Delete unwanted schemes with the remove button
   - Export your color scheme in multiple formats (JSON or CSS)

## Technical Implementation

- **Element Selection**: Uses capture phase event listeners with elementsFromPoint API to accurately select elements
- **Background/Text Detection**: Automatically detects and offers choice between editing background or text colors
- **Color Conversion**: Advanced utilities to convert between hex and HSL color formats with validation
- **Real-time Updates**: Color changes are applied instantly to selected elements and globally via CSS variables
- **CSS Variables**: Theme colors are defined as CSS variables for dynamic updates without theme recompilation
- **Local Storage**: Color schemes are saved to localStorage for persistence between sessions
- **Contrast Detection**: Automatically determines text contrast colors for optimal visibility

## Completed Enhancements

- ✅ Persist color changes to the theme configuration
- ✅ Create and manage multiple theme profiles
- ✅ Export theme configurations in multiple formats
- ✅ Direct editing of background and text colors
- ✅ Visual organization of theme colors by importance and function

## Next Steps

Future enhancements planned for the theme system:

- Add import functionality for theme configurations from files
- Support dark mode toggle with automatic color adjustments
- Extend theme customization to typography settings (font size, family, weight)
- Add global spacing controls for consistent layout adjustments
- Create theme presets for quick application of industry-specific styles
