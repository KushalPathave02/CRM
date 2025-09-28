import React, { useEffect } from 'react';
import { Provider, useSelector, useDispatch } from 'react-redux';
import { NavigationContainer } from '@react-navigation/native';
import { Provider as PaperProvider } from 'react-native-paper';
import { StatusBar } from 'expo-status-bar';
import * as SecureStore from 'expo-secure-store';
import * as Linking from 'expo-linking';
import { store } from './src/store/store';
import AppNavigator from './src/navigation/AppNavigator';
import { getTheme } from './src/theme/theme';
import { loadThemeFromStorage } from './src/store/slices/themeSlice';

const AppContent = () => {
  const dispatch = useDispatch();
  const { isDarkMode, primaryColor, accentColor } = useSelector((state) => state.theme);
  const theme = getTheme(isDarkMode, primaryColor, accentColor);

  useEffect(() => {
    // Load theme from storage on app start
    const loadStoredTheme = async () => {
      try {
        const storedDarkMode = await SecureStore.getItemAsync('isDarkMode');
        const storedPrimaryColor = await SecureStore.getItemAsync('primaryColor');
        const storedAccentColor = await SecureStore.getItemAsync('accentColor');

        dispatch(loadThemeFromStorage({
          isDarkMode: storedDarkMode ? JSON.parse(storedDarkMode) : false,
          primaryColor: storedPrimaryColor || '#6200ee',
          accentColor: storedAccentColor || '#03dac6',
        }));
      } catch (error) {
        console.log('Error loading theme from storage:', error);
      }
    };

    loadStoredTheme();
  }, [dispatch]);

  const linking = {
    prefixes: [Linking.createURL('/'), 'crm://'],
    config: {
      screens: {
        Auth: {
          screens: {
            Login: {
              path: '/login',
              parse: {
                verified: (verified) => verified === 'true',
                email: (email) => email,
              },
            },
          },
        },
      },
    },
  };

  return (
    <PaperProvider theme={theme}>
      <NavigationContainer linking={linking}>
        <StatusBar style={isDarkMode ? "light" : "dark"} />
        <AppNavigator />
      </NavigationContainer>
    </PaperProvider>
  );
};

export default function App() {
  return (
    <Provider store={store}>
      <AppContent />
    </Provider>
  );
}
