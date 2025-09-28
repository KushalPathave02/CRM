import { DefaultTheme, MD3DarkTheme } from 'react-native-paper';

// Light theme
export const lightTheme = {
  ...DefaultTheme,
  colors: {
    ...DefaultTheme.colors,
    primary: '#6200ee',
    primaryContainer: '#bb86fc',
    secondary: '#03dac6',
    secondaryContainer: '#018786',
    surface: '#ffffff',
    surfaceVariant: '#f5f5f5',
    background: '#ffffff',
    error: '#b00020',
    errorContainer: '#fdeaea',
    onPrimary: '#ffffff',
    onSecondary: '#000000',
    onSurface: '#000000',
    onBackground: '#000000',
    onError: '#ffffff',
    outline: '#79747e',
    shadow: '#000000',
    inverseSurface: '#2d3135',
    inverseOnSurface: '#f1f0f4',
    inversePrimary: '#bb86fc',
    elevation: {
      level0: 'transparent',
      level1: '#f7f2fa',
      level2: '#f2edf7',
      level3: '#ede7f6',
      level4: '#e8e2f5',
      level5: '#e1dbf4',
    },
  },
};

// Dark theme
export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: '#bb86fc',
    primaryContainer: '#3700b3',
    secondary: '#03dac6',
    secondaryContainer: '#005b57',
    surface: '#121212',
    surfaceVariant: '#1e1e1e',
    background: '#121212',
    error: '#cf6679',
    errorContainer: '#93000a',
    onPrimary: '#000000',
    onSecondary: '#000000',
    onSurface: '#ffffff',
    onBackground: '#ffffff',
    onError: '#000000',
    outline: '#938f99',
    shadow: '#000000',
    inverseSurface: '#e6e1e5',
    inverseOnSurface: '#313033',
    inversePrimary: '#6750a4',
    elevation: {
      level0: 'transparent',
      level1: '#1d1b20',
      level2: '#232229',
      level3: '#2a2930',
      level4: '#2c2f36',
      level5: '#2f323a',
    },
  },
};

// Default theme (light)
export const theme = lightTheme;

// Theme colors for charts
export const chartColors = {
  primary: '#6200ee',
  secondary: '#03dac6',
  success: '#4caf50',
  warning: '#ff9800',
  error: '#f44336',
  info: '#2196f3',
  light: '#f5f5f5',
  dark: '#212121',
};

// Status colors
export const statusColors = {
  New: '#2196f3',
  Contacted: '#ff9800',
  Converted: '#4caf50',
  Lost: '#f44336',
  active: '#4caf50',
  inactive: '#f44336',
  prospect: '#ff9800',
};

// Priority colors
export const priorityColors = {
  Low: '#4caf50',
  Medium: '#ff9800',
  High: '#f44336',
};

export const getTheme = (isDarkMode, primaryColor = '#6200ee', accentColor = '#03dac6') => {
  const baseTheme = isDarkMode ? darkTheme : lightTheme;
  
  return {
    ...baseTheme,
    colors: {
      ...baseTheme.colors,
      primary: primaryColor,
      secondary: accentColor,
    },
  };
};
