import React, { useState, useEffect } from 'react';
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
  Paragraph,
  Snackbar,
  ActivityIndicator,
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import { registerUser, registerAdmin, clearError } from '../../store/slices/authSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(50, 'Name cannot exceed 50 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  password: Yup.string()
    .min(6, 'Password must be at least 6 characters')
    .required('Password is required'),
  confirmPassword: Yup.string()
    .oneOf([Yup.ref('password'), null], 'Passwords must match')
    .required('Please confirm your password'),
  role: Yup.string()
    .oneOf(['user', 'admin'], 'Invalid role')
    .required('Role is required'),
});

const RegisterScreen = ({ navigation }) => {
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.auth);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  useEffect(() => {
    dispatch(clearError());
  }, [dispatch]);

  const handleRegister = async (values) => {
    try {
      const { confirmPassword, role, ...registerData } = values;
      
      if (role === 'admin') {
        // Use admin registration (bypasses email verification)
        await dispatch(registerAdmin(registerData)).unwrap();
        // Navigate to dashboard for admin
        navigation.navigate('Dashboard');
      } else {
        // Use regular user registration
        await dispatch(registerUser({ ...registerData, role })).unwrap();
        // Navigate to email verification screen
        navigation.navigate('EmailVerification', { email: values.email });
      }
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };
  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <View style={styles.content}>
          <Card style={styles.card}>
            <Card.Content>
              <Title style={styles.title}>Create Account</Title>
              <Paragraph style={styles.subtitle}>
                Join our CRM platform today
              </Paragraph>

              <Formik
                initialValues={{
                  name: '',
                  email: '',
                  password: '',
                  confirmPassword: '',
                  role: 'user',
                }}
                validationSchema={validationSchema}
                onSubmit={handleRegister}
              >
                {({
                  handleChange,
                  handleBlur,
                  handleSubmit,
                  values,
                  errors,
                  touched,
                  isValid,
                  setFieldValue,
                }) => (
                  <View style={styles.form}>
                    <TextInput
                      label="Full Name"
                      mode="outlined"
                      value={values.name}
                      onChangeText={handleChange('name')}
                      onBlur={handleBlur('name')}
                      error={touched.name && errors.name}
                      autoCapitalize="words"
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
                      autoComplete="email"
                      style={styles.input}
                    />
                    {touched.email && errors.email && (
                      <Text style={styles.errorText}>{errors.email}</Text>
                    )}

                    <TextInput
                      label="Password"
                      mode="outlined"
                      value={values.password}
                      onChangeText={handleChange('password')}
                      onBlur={handleBlur('password')}
                      error={touched.password && errors.password}
                      secureTextEntry={!showPassword}
                      right={
                        <TextInput.Icon
                          icon={showPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowPassword(!showPassword)}
                        />
                      }
                      style={styles.input}
                    />
                    {touched.password && errors.password && (
                      <Text style={styles.errorText}>{errors.password}</Text>
                    )}

                    <TextInput
                      label="Confirm Password"
                      mode="outlined"
                      value={values.confirmPassword}
                      onChangeText={handleChange('confirmPassword')}
                      onBlur={handleBlur('confirmPassword')}
                      error={touched.confirmPassword && errors.confirmPassword}
                      secureTextEntry={!showConfirmPassword}
                      right={
                        <TextInput.Icon
                          icon={showConfirmPassword ? 'eye-off' : 'eye'}
                          onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                        />
                      }
                      style={styles.input}
                    />
                    {touched.confirmPassword && errors.confirmPassword && (
                      <Text style={styles.errorText}>{errors.confirmPassword}</Text>
                    )}

                    <View style={styles.roleContainer}>
                      <Text style={styles.roleLabel}>Account Type</Text>
                      <SegmentedButtons
                        value={values.role}
                        onValueChange={(value) => setFieldValue('role', value)}
                        buttons={[
                          {
                            value: 'user',
                            label: 'User',
                            icon: 'account',
                          },
                          {
                            value: 'admin',
                            label: 'Admin',
                            icon: 'account-star',
                          },
                        ]}
                        style={styles.segmentedButtons}
                      />
                    </View>

                    <Button
                      mode="contained"
                      onPress={handleSubmit}
                      disabled={!isValid || loading}
                      style={styles.button}
                      contentStyle={styles.buttonContent}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" />
                      ) : (
                        'Create Account'
                      )}
                    </Button>

                    <Button
                      mode="text"
                      onPress={() => navigation.navigate('Login')}
                      style={styles.linkButton}
                    >
                      Already have an account? Sign In
                    </Button>
                  </View>
                )}
              </Formik>
            </Card.Content>
          </Card>
        </View>
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
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    padding: 20,
  },
  content: {
    flex: 1,
    justifyContent: 'center',
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 8,
    fontSize: 28,
    fontWeight: 'bold',
  },
  subtitle: {
    textAlign: 'center',
    marginBottom: 32,
    opacity: 0.7,
  },
  form: {
    gap: 16,
  },
  input: {
    marginBottom: 8,
  },
  roleContainer: {
    marginVertical: 8,
  },
  roleLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  button: {
    marginTop: 16,
  },
  buttonContent: {
    paddingVertical: 8,
  },
  linkButton: {
    marginTop: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});

export default RegisterScreen;
