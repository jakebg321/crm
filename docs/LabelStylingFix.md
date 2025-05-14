# Fixing Overlapping Label Text in Material-UI Components

## Problem

There's an issue across the application where label text in Material-UI form components overlaps with the selected/placeholder text, particularly in dropdown menus and text fields. This is occurring because:

1. The floating labels aren't being properly styled with a background that blocks the underlying content
2. In Select components, the selected value text is overlapping with the label text

## Solution

We've implemented a consistent approach for styling input labels across the application:

1. Created utility functions in `src/utils/styleUtils.ts` to generate consistent styling for input labels
2. Updated components to use these utilities
3. Added proper `renderValue` prop handling in Select components to ensure proper display of selected values
4. Made sure each Select has proper `labelId` and `id` attributes for accessibility

## How to Use the Fix

### For TextField Components

When using TextField components, use the `getInputLabelProps` utility:

```jsx
import { getInputLabelProps } from '@/utils/styleUtils';

const MyComponent = () => {
  const theme = useTheme();
  const inputLabelProps = getInputLabelProps(theme);
  
  return (
    <TextField
      label="My Field"
      // ... other props
      InputLabelProps={inputLabelProps}
    />
  );
};
```

### For Select Components in FormControl

When using Select inside FormControl, use these best practices:

```jsx
import { getInputLabelSx } from '@/utils/styleUtils';

const MyComponent = () => {
  const theme = useTheme();
  const labelSx = getInputLabelSx(theme);
  
  return (
    <FormControl>
      <InputLabel id="my-select-label" sx={labelSx}>My Label</InputLabel>
      <Select
        labelId="my-select-label"
        id="my-select"
        value={value}
        label="My Label"
        // The renderValue prop is critical for preventing text overlap
        renderValue={(selected) => {
          if (!selected) return "None";
          // Handle selected value display properly
          return selected.toString();
        }}
      >
        <MenuItem value="">None</MenuItem>
        {/* ... other menu items */}
      </Select>
    </FormControl>
  );
};
```

## Important Implementation Details

### Proper Select Configuration

For Select components to work correctly:

1. Each InputLabel must have a unique `id` (e.g., `id="my-select-label"`)
2. The Select must reference that label with `labelId="my-select-label"`
3. The Select should have its own `id` for accessibility (e.g., `id="my-select"`)
4. The `label` prop on the Select must match the text in the InputLabel
5. The `renderValue` prop should properly handle both empty states and selected values

### The renderValue Prop

The `renderValue` prop is essential for preventing text overlap in Select components. It provides complete control over how the selected value is displayed:

```jsx
renderValue={(selected) => {
  if (!selected) return "Default Text"; // Handle empty case
  
  // For complex selections, find and display the appropriate text
  const item = items.find(i => i.id === selected);
  return item ? item.name : "Not Found";
}}
```

## Components That Need the Fix

The following components have been updated with the fix:

- `src/app/schedule/components/JobForm.tsx`
- `src/app/schedule/components/ScheduleToolbar.tsx`

Please check and update any other form components that use Material-UI TextField, Select, or other input components with floating labels.

## Implementation Details

### The Utility Functions

```typescript
// src/utils/styleUtils.ts

import { Theme } from '@mui/material/styles';

/**
 * Utility function to create input label styles that prevent text overlapping issues
 * @param theme - The MUI theme object
 * @returns An object containing styles for InputLabelProps
 */
export const getInputLabelProps = (theme: Theme) => {
  return {
    shrink: true,
    style: { 
      background: theme.palette.background.paper,
      paddingLeft: '5px',
      paddingRight: '5px'
    }
  };
};

/**
 * Style object for InputLabel components within FormControl
 * @param theme - The MUI theme object 
 * @returns An SX prop object for InputLabel
 */
export const getInputLabelSx = (theme: Theme) => {
  return {
    backgroundColor: theme.palette.background.paper,
    px: 0.5
  };
};
```

## Additional Notes

- The background color is set to match the paper background color from the theme, ensuring it works with both light and dark modes
- The padding ensures there's space around the text for better readability
- The `shrink: true` property ensures the label is always in the floating position
- The `renderValue` prop prevents overlapping text in Select components
- Proper `labelId` and `id` attributes improve accessibility and component association

If you encounter any components where this solution doesn't work, please document the specific case and consult with the UI team. 