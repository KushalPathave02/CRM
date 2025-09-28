import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { createStackNavigator } from '@react-navigation/stack';
import { ActivityIndicator, View } from 'react-native';
import { useTheme } from 'react-native-paper';

import { loadStoredAuth } from '../store/slices/authSlice';
import { loadThemeFromStorage } from '../store/slices/themeSlice';
import * as SecureStore from 'expo-secure-store';

import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';

const Stack = createStackNavigator();

const AppNavigator = () => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { isAuthenticated, isInitialized } = useSelector((state) => state.auth);

  useEffect(() => {
    const initializeApp = async () => {
      try {
        // Load theme preferences
        const isDarkMode = await SecureStore.getItemAsync('isDarkMode');
        const primaryColor = await SecureStore.getItemAsync('primaryColor');
        const accentColor = await SecureStore.getItemAsync('accentColor');

        if (isDarkMode || primaryColor || accentColor) {
          dispatch(loadThemeFromStorage({
            isDarkMode: isDarkMode ? JSON.parse(isDarkMode) : undefined,
            primaryColor,
            accentColor,
          }));
        }

        // Always start at login page - clear any stored authentication
        try {
          await SecureStore.deleteItemAsync('token');
          await SecureStore.deleteItemAsync('user');
        } catch (error) {
          console.log('No stored auth to clear');
        }
        
        // Initialize auth state as not authenticated
        dispatch(loadStoredAuth());
      } catch (error) {
        console.error('Error initializing app:', error);
        dispatch(loadStoredAuth());
      }
    };

    initializeApp();
  }, [dispatch]);

  // Show loading screen while initializing
  if (!isInitialized) {
    return (
      <View style={{
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: theme.colors.background,
      }}>
        <ActivityIndicator size="large" color={theme.colors.primary} />
      </View>
    );
  }

  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {isAuthenticated ? (
        <Stack.Screen name="Main" component={MainNavigator} />
      ) : (
        <Stack.Screen name="Auth" component={AuthNavigator} />
      )}
    </Stack.Navigator>
  );
};

export default AppNavigator;
