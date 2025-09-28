import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  Alert,
} from 'react-native';
import {
  Card,
  Title,
  Paragraph,
  Text,
  Button,
  Avatar,
  Divider,
  List,
  Switch,
  ActivityIndicator,
  Snackbar,
  useTheme,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { MaterialIcons } from '@expo/vector-icons';

import { logout } from '../../store/slices/authSlice';
import { toggleDarkMode } from '../../store/slices/themeSlice';

const ProfileScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const theme = useTheme();
  const { user, loading } = useSelector((state) => state.auth);
  const { isDarkMode } = useSelector((state) => state.theme);
  const [showSnackbar, setShowSnackbar] = useState(false);

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

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    setShowSnackbar(true);
  };

  const getInitials = (name) => {
    return name
      .split(' ')
      .map(word => word[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Recently';
    
    try {
      const date = new Date(dateString);
      if (isNaN(date.getTime())) return 'Recently';
      
      return date.toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      });
    } catch (error) {
      return 'Recently';
    }
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={[styles.container, { backgroundColor: theme.colors.background }]}>
      {/* Profile Header */}
      <Card style={styles.profileCard}>
        <Card.Content>
          <View style={styles.profileHeader}>
            <Avatar.Text
              size={80}
              label={getInitials(user.name)}
              style={[styles.avatar, { backgroundColor: theme.colors.primary }]}
            />
            <View style={styles.profileInfo}>
              <Title style={styles.userName}>{user.name}</Title>
              <Paragraph style={styles.userEmail}>{user.email}</Paragraph>
              <View style={styles.roleContainer}>
                <MaterialIcons
                  name={user.role === 'admin' ? 'admin-panel-settings' : 'person'}
                  size={16}
                  color={theme.colors.primary}
                />
                <Text style={styles.userRole}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Text>
              </View>
            </View>
          </View>

          <Divider style={styles.divider} />

          <View style={styles.profileStats}>
            <Text style={styles.joinedDate}>
              Member since {formatDate(user.createdAt)}
            </Text>
          </View>
        </Card.Content>
      </Card>

      {/* Settings Section */}
      <Card style={styles.settingsCard}>
        <Card.Content>
          <Title>Settings</Title>
          
          <List.Item
            title="Dark Mode"
            description="Toggle dark theme"
            left={props => <List.Icon {...props} icon="theme-light-dark" />}
            right={() => (
              <Switch
                value={isDarkMode}
                onValueChange={handleToggleDarkMode}
              />
            )}
          />

          <Divider />

          <List.Item
            title="Edit Profile"
            description="Update your personal information"
            left={props => <List.Icon {...props} icon="account-edit" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />

          <Divider />

          <List.Item
            title="App Settings"
            description="Notifications and preferences"
            left={props => <List.Icon {...props} icon="cog" />}
            right={props => <List.Icon {...props} icon="chevron-right" />}
            onPress={() => navigation.navigate('Settings')}
          />
        </Card.Content>
      </Card>

      {/* Quick Actions */}
      <Card style={styles.actionsCard}>
        <Card.Content>
          <Title>Quick Actions</Title>
          
          <View style={styles.actionButtons}>
            <Button
              mode="outlined"
              icon="account-plus"
              onPress={() => navigation.navigate('Customers', {
                screen: 'CustomerForm'
              })}
              style={styles.actionButton}
            >
              Add Customer
            </Button>
            
            <Button
              mode="outlined"
              icon="trending-up"
              onPress={() => navigation.navigate('Leads', {
                screen: 'LeadForm'
              })}
              style={styles.actionButton}
            >
              Add Lead
            </Button>
          </View>

          <Button
            mode="outlined"
            icon="view-dashboard"
            onPress={() => navigation.navigate('Dashboard')}
            style={styles.actionButton}
          >
            View Dashboard
          </Button>
        </Card.Content>
      </Card>

      {/* Account Actions */}
      <Card style={styles.accountCard}>
        <Card.Content>
          <Title>Account</Title>
          
          <Button
            mode="outlined"
            icon="logout"
            onPress={handleLogout}
            disabled={loading}
            style={[styles.actionButton, styles.logoutButton]}
            textColor="#d32f2f"
          >
            {loading ? <ActivityIndicator size="small" /> : 'Logout'}
          </Button>
        </Card.Content>
      </Card>

      {/* App Info */}
      <Card style={styles.infoCard}>
        <Card.Content>
          <Title>About</Title>
          <Paragraph>Mini CRM v1.0.0</Paragraph>
          <Paragraph>Built with React Native</Paragraph>
          <Paragraph>© 2024 Dev Innovations Labs</Paragraph>
        </Card.Content>
      </Card>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={2000}
      >
        <Text>Theme updated successfully!</Text>
      </Snackbar>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  profileCard: {
    margin: 16,
    elevation: 4,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  avatar: {
    marginRight: 16,
  },
  profileInfo: {
    flex: 1,
  },
  userName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  userEmail: {
    fontSize: 16,
    opacity: 0.7,
    marginBottom: 8,
  },
  roleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  userRole: {
    marginLeft: 4,
    fontSize: 14,
    color: '#6200ee',
    fontWeight: '500',
  },
  divider: {
    marginVertical: 16,
  },
  profileStats: {
    alignItems: 'center',
  },
  joinedDate: {
    fontSize: 14,
    opacity: 0.6,
  },
  settingsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  actionsCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 12,
    gap: 8,
  },
  actionButton: {
    flex: 1,
    marginVertical: 4,
  },
  accountCard: {
    margin: 16,
    marginTop: 0,
    elevation: 4,
  },
  logoutButton: {
    borderColor: '#d32f2f',
  },
  infoCard: {
    margin: 16,
    marginTop: 0,
    marginBottom: 32,
    elevation: 4,
  },
});

export default ProfileScreen;
