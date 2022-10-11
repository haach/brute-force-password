import { createTheme, ThemeOptions } from '@mui/material/styles';

export const customDarkTheme = createTheme({
  palette: {
    mode: 'dark',
    primary: {
      main: '#00acc1',
    },
    secondary: {
      main: '#d64c20',
    },
  },
  typography: {
    htmlFontSize: 18,
  },
  shape: {
    borderRadius: 4,
  },
  direction: 'rtl',
});
