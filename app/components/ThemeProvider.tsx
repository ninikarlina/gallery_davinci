'use client';

import { ReactNode, useMemo } from 'react';
import { ThemeProvider as MuiThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';

export default function ThemeProvider({ children }: { children: ReactNode }) {
  const darkTheme = useMemo(() => createTheme({
    palette: {
      mode: 'dark',
      primary: {
        main: '#000000',
      },
      secondary: {
        main: '#ffffff',
      },
      background: {
        default: '#121212',
        paper: '#1e1e1e',
      },
    },
  }), []);

  return (
    <MuiThemeProvider theme={darkTheme}>
      <CssBaseline />
      {children}
    </MuiThemeProvider>
  );
}
