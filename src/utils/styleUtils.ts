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