import React from 'react';
import { Alert, TouchableOpacity } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { useTheme } from 'react-native-paper';
import { MaterialIcons } from '@expo/vector-icons';
import { useDispatch } from 'react-redux';
import { logout } from '../store/slices/authSlice';

// Import screens
import DashboardScreen from '../screens/dashboard/DashboardScreen';
import CustomerListScreen from '../screens/customers/CustomerListScreen';
import CustomerDetailScreen from '../screens/customers/CustomerDetailScreen';
import CustomerFormScreen from '../screens/customers/CustomerFormScreen';
import LeadListScreen from '../screens/leads/LeadListScreen';
import LeadDetailScreen from '../screens/leads/LeadDetailScreen';
import LeadFormScreen from '../screens/leads/LeadFormScreen';
import ProfileScreen from '../screens/profile/ProfileScreen';
import SettingsScreen from '../screens/settings/SettingsScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

// Customer Stack Navigator
const CustomerStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="CustomerList" 
        component={CustomerListScreen}
        options={{ title: 'Customers' }}
      />
      <Stack.Screen 
        name="CustomerDetail" 
        component={CustomerDetailScreen}
        options={{ title: 'Customer Details', headerShown: true }}
      />
      <Stack.Screen 
        name="CustomerForm" 
        component={CustomerFormScreen}
        options={({ route }) => ({
          title: route.params?.customer ? 'Edit Customer' : 'Add Customer',
          headerShown: true
        })}
      />
    </Stack.Navigator>
  );
};

// Lead Stack Navigator
const LeadStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="LeadList" 
        component={LeadListScreen}
        options={{ title: 'Leads' }}
      />
      <Stack.Screen 
        name="LeadDetail" 
        component={LeadDetailScreen}
        options={{ title: 'Lead Details', headerShown: true }}
      />
      <Stack.Screen 
        name="LeadForm" 
        component={LeadFormScreen}
        options={({ route }) => ({
          title: route.params?.lead ? 'Edit Lead' : 'Add Lead',
          headerShown: true
        })}
      />
    </Stack.Navigator>
  );
};

// Profile Stack Navigator
const ProfileStackNavigator = () => {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen 
        name="ProfileMain" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
      <Stack.Screen 
        name="Settings" 
        component={SettingsScreen}
        options={{ title: 'Settings', headerShown: true }}
      />
    </Stack.Navigator>
  );
};

// Logout Button Component
const LogoutButton = () => {
  const dispatch = useDispatch();
  const theme = useTheme();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await dispatch(logout()).unwrap();
            } catch (error) {
              console.error('Logout error:', error);
            }
          },
        },
      ]
    );
  };

  return (
    <TouchableOpacity
      onPress={handleLogout}
      style={{ marginRight: 15, padding: 5 }}
    >
      <MaterialIcons
        name="logout"
        size={24}
        color={theme.colors.onSurface}
      />
    </TouchableOpacity>
  );
};

const MainNavigator = () => {
  const theme = useTheme();

  return (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        tabBarIcon: ({ focused, color, size }) => {
          let iconName;

          switch (route.name) {
            case 'Dashboard':
              iconName = 'dashboard';
              break;
            case 'Customers':
              iconName = 'group';
              break;
            case 'Leads':
              iconName = 'trending-up';
              break;
            case 'Profile':
              iconName = 'person';
              break;
            default:
              iconName = 'help';
          }

          return <MaterialIcons name={iconName} size={size} color={color} />;
        },
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.onSurfaceVariant,
        tabBarStyle: {
          backgroundColor: theme.colors.surface,
          borderTopColor: theme.colors.outline,
        },
        headerStyle: {
          backgroundColor: theme.colors.surface,
        },
        headerTintColor: theme.colors.onSurface,
      })}
    >
      <Tab.Screen 
        name="Dashboard" 
        component={DashboardScreen}
        options={{ 
          title: 'Dashboard',
          headerShown: true,
          headerRight: () => <LogoutButton />
        }}
      />
      <Tab.Screen 
        name="Customers" 
        component={CustomerStackNavigator}
        options={{ 
          headerShown: true,
          title: 'Customers',
          headerRight: () => <LogoutButton />
        }}
      />
      <Tab.Screen 
        name="Leads" 
        component={LeadStackNavigator}
        options={{ 
          headerShown: true,
          title: 'Leads',
          headerRight: () => <LogoutButton />
        }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileStackNavigator}
        options={{ 
          headerShown: true,
          title: 'Profile',
          headerRight: () => <LogoutButton />
        }}
      />
    </Tab.Navigator>
  );
};

export default MainNavigator;
