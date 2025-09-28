import { createSlice } from '@reduxjs/toolkit';
import * as SecureStore from 'expo-secure-store';

const initialState = {
  isDarkMode: false,
  primaryColor: '#6200ee',
  accentColor: '#03dac6',
};

const themeSlice = createSlice({
  name: 'theme',
  initialState,
  reducers: {
    toggleDarkMode: (state) => {
      state.isDarkMode = !state.isDarkMode;
      // Store theme preference
      SecureStore.setItemAsync('isDarkMode', JSON.stringify(state.isDarkMode));
    },
    setDarkMode: (state, action) => {
      state.isDarkMode = action.payload;
      SecureStore.setItemAsync('isDarkMode', JSON.stringify(state.isDarkMode));
    },
    setPrimaryColor: (state, action) => {
      state.primaryColor = action.payload;
      SecureStore.setItemAsync('primaryColor', action.payload);
    },
    setAccentColor: (state, action) => {
      state.accentColor = action.payload;
      SecureStore.setItemAsync('accentColor', action.payload);
    },
    loadThemeFromStorage: (state, action) => {
      const { isDarkMode, primaryColor, accentColor } = action.payload;
      if (isDarkMode !== undefined) state.isDarkMode = isDarkMode;
      if (primaryColor) state.primaryColor = primaryColor;
      if (accentColor) state.accentColor = accentColor;
    },
  },
});

export const {
  toggleDarkMode,
  setDarkMode,
  setPrimaryColor,
  setAccentColor,
  loadThemeFromStorage,
} = themeSlice.actions;

export default themeSlice.reducer;
