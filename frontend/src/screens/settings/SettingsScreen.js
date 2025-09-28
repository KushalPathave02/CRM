import React, { useState } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Snackbar,
  ActivityIndicator,
  Switch,
  List,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { updateProfile, clearError } from '../../store/slices/authSlice';
import { toggleDarkMode, setPrimaryColor, setAccentColor } from '../../store/slices/themeSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
});

const SettingsScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { user, loading, error } = useSelector((state) => state.auth);
  const { isDarkMode, primaryColor, accentColor } = useSelector((state) => state.theme);
  
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [snackbarMessage, setSnackbarMessage] = useState('');

  const handleUpdateProfile = async (values) => {
    try {
      await dispatch(updateProfile(values)).unwrap();
      setSnackbarMessage('Profile updated successfully!');
      setShowSnackbar(true);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleToggleDarkMode = () => {
    dispatch(toggleDarkMode());
    setSnackbarMessage(`${isDarkMode ? 'Light' : 'Dark'} mode enabled`);
    setShowSnackbar(true);
  };

  const colorOptions = [
    { name: 'Purple', value: '#6200ee' },
    { name: 'Blue', value: '#1976d2' },
    { name: 'Green', value: '#388e3c' },
    { name: 'Orange', value: '#f57c00' },
    { name: 'Red', value: '#d32f2f' },
    { name: 'Teal', value: '#00796b' },
  ];

  const handleColorChange = (color, type) => {
    if (type === 'primary') {
      dispatch(setPrimaryColor(color));
      setSnackbarMessage('Primary color updated');
    } else {
      dispatch(setAccentColor(color));
      setSnackbarMessage('Accent color updated');
    }
    setShowSnackbar(true);
  };

  if (!user) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" />
      </View>
    );
  }

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        {/* Profile Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Profile Information</Title>
            
            <Formik
              initialValues={{
                name: user.name || '',
                email: user.email || '',
              }}
              validationSchema={validationSchema}
              onSubmit={handleUpdateProfile}
              enableReinitialize
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
              }) => (
                <View style={styles.form}>
                  <TextInput
                    label="Full Name"
                    mode="outlined"
                    value={values.name}
                    onChangeText={handleChange('name')}
                    onBlur={handleBlur('name')}
                    error={touched.name && errors.name}
                    style={styles.input}
                  />
                  {touched.name && errors.name && (
                    <Text style={styles.errorText}>{errors.name}</Text>
                  )}

                  <TextInput
                    label="Email"
                    mode="outlined"
                    value={values.email}
                    onChangeText={handleChange('email')}
                    onBlur={handleBlur('email')}
                    error={touched.email && errors.email}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    style={styles.input}
                  />
                  {touched.email && errors.email && (
                    <Text style={styles.errorText}>{errors.email}</Text>
                  )}

                  <Button
                    mode="contained"
                    onPress={handleSubmit}
                    disabled={!isValid || loading}
                    style={styles.updateButton}
                    contentStyle={styles.buttonContent}
                  >
                    {loading ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      'Update Profile'
                    )}
                  </Button>
                </View>
              )}
            </Formik>
          </Card.Content>
        </Card>

        {/* Theme Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Appearance</Title>
            
            <List.Item
              title="Dark Mode"
              description="Use dark theme throughout the app"
              left={props => <List.Icon {...props} icon="theme-light-dark" />}
              right={() => (
                <Switch
                  value={isDarkMode}
                  onValueChange={handleToggleDarkMode}
                />
              )}
            />

            <Divider style={styles.divider} />

            <Text style={styles.colorSectionTitle}>Primary Color</Text>
            <View style={styles.colorGrid}>
              {colorOptions.map((color) => (
                <Button
                  key={color.value}
                  mode={primaryColor === color.value ? 'contained' : 'outlined'}
                  onPress={() => handleColorChange(color.value, 'primary')}
                  style={[
                    styles.colorButton,
                    { 
                      backgroundColor: primaryColor === color.value ? color.value : 'transparent',
                      borderColor: color.value 
                    }
                  ]}
                  labelStyle={{
                    color: primaryColor === color.value ? 'white' : color.value
                  }}
                >
                  {color.name}
                </Button>
              ))}
            </View>
          </Card.Content>
        </Card>

        {/* App Settings */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>App Settings</Title>
            
            <List.Item
              title="Notifications"
              description="Manage notification preferences"
              left={props => <List.Icon {...props} icon="bell" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Notifications settings coming soon!');
                setShowSnackbar(true);
              }}
            />

            <Divider />

            <List.Item
              title="Data & Privacy"
              description="Manage your data and privacy settings"
              left={props => <List.Icon {...props} icon="shield-account" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Privacy settings coming soon!');
                setShowSnackbar(true);
              }}
            />

            <Divider />

            <List.Item
              title="Export Data"
              description="Download your CRM data"
              left={props => <List.Icon {...props} icon="download" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Data export coming soon!');
                setShowSnackbar(true);
              }}
            />
          </Card.Content>
        </Card>

        {/* Account Information */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Account Information</Title>
            
            <View style={styles.accountInfo}>
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Account Type:</Text>
                <Text style={styles.infoValue}>
                  {user.role === 'admin' ? 'Administrator' : 'User'}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>Member Since:</Text>
                <Text style={styles.infoValue}>
                  {new Date(user.createdAt).toLocaleDateString()}
                </Text>
              </View>
              
              <View style={styles.infoRow}>
                <Text style={styles.infoLabel}>User ID:</Text>
                <Text style={styles.infoValue}>{user.id}</Text>
              </View>
            </View>
          </Card.Content>
        </Card>

        {/* Support */}
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.sectionTitle}>Support</Title>
            
            <List.Item
              title="Help & FAQ"
              description="Get help and find answers"
              left={props => <List.Icon {...props} icon="help-circle" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Help section coming soon!');
                setShowSnackbar(true);
              }}
            />

            <Divider />

            <List.Item
              title="Contact Support"
              description="Get in touch with our team"
              left={props => <List.Icon {...props} icon="email" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Contact support: support@devinnovationslabs.com');
                setShowSnackbar(true);
              }}
            />

            <Divider />

            <List.Item
              title="About"
              description="App version and information"
              left={props => <List.Icon {...props} icon="information" />}
              right={props => <List.Icon {...props} icon="chevron-right" />}
              onPress={() => {
                setSnackbarMessage('Mini CRM v1.0.0 - Built with React Native');
                setShowSnackbar(true);
              }}
            />
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={handleDismissError}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: handleDismissError,
        }}
      >
        <Text>{error || 'An error occurred'}</Text>
      </Snackbar>

      <Snackbar
        visible={showSnackbar}
        onDismiss={() => setShowSnackbar(false)}
        duration={3000}
      >
        <Text>{snackbarMessage}</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 16,
    elevation: 4,
  },
  sectionTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 16,
    color: '#6200ee',
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  updateButton: {
    marginTop: 8,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  divider: {
    marginVertical: 8,
  },
  colorSectionTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginTop: 16,
    marginBottom: 12,
  },
  colorGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  colorButton: {
    flex: 1,
    minWidth: '45%',
    marginBottom: 8,
  },
  accountInfo: {
    gap: 12,
  },
  infoRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 4,
  },
  infoLabel: {
    fontSize: 14,
    fontWeight: '500',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    flex: 1,
    textAlign: 'right',
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});

export default SettingsScreen;
