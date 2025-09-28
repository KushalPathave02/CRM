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
  SegmentedButtons,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import {
  createCustomer,
  updateCustomer,
  clearError,
} from '../../store/slices/customerSlice';

const validationSchema = Yup.object().shape({
  name: Yup.string()
    .min(2, 'Name must be at least 2 characters')
    .max(100, 'Name cannot exceed 100 characters')
    .required('Name is required'),
  email: Yup.string()
    .email('Invalid email format')
    .required('Email is required'),
  phone: Yup.string()
    .matches(/^\+?[\d\s\-\(\)]+$/, 'Please enter a valid phone number')
    .required('Phone number is required'),
  company: Yup.string()
    .min(2, 'Company must be at least 2 characters')
    .max(100, 'Company cannot exceed 100 characters')
    .required('Company is required'),
  status: Yup.string()
    .oneOf(['active', 'inactive', 'prospect'], 'Invalid status')
    .required('Status is required'),
  notes: Yup.string()
    .max(500, 'Notes cannot exceed 500 characters'),
  address: Yup.object().shape({
    street: Yup.string().max(100, 'Street cannot exceed 100 characters'),
    city: Yup.string().max(50, 'City cannot exceed 50 characters'),
    state: Yup.string().max(50, 'State cannot exceed 50 characters'),
    zipCode: Yup.string().max(20, 'Zip code cannot exceed 20 characters'),
    country: Yup.string().max(50, 'Country cannot exceed 50 characters'),
  }),
});

const CustomerFormScreen = ({ route, navigation }) => {
  const { customer } = route?.params || {};
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.customers);
  const [showSnackbar, setShowSnackbar] = useState(false);

  const isEditing = !!customer;

  const initialValues = {
    name: customer?.name || '',
    email: customer?.email || '',
    phone: customer?.phone || '',
    company: customer?.company || '',
    status: customer?.status || 'prospect',
    notes: customer?.notes || '',
    address: customer?.address ? {
      street: customer.address.street || '',
      city: customer.address.city || '',
      state: customer.address.state || '',
      zipCode: customer.address.zipCode || '',
      country: customer.address.country || '',
    } : {
      street: '',
      city: '',
      state: '',
      zipCode: '',
      country: '',
    },
  };

  const handleSubmit = async (values) => {
    try {
      // Clean up address object - remove empty fields
      const cleanAddress = Object.fromEntries(
        Object.entries(values.address || {}).filter(([_, value]) => value && value.trim() !== '')
      );

      const customerData = {
        ...values,
        address: Object.keys(cleanAddress).length > 0 ? cleanAddress : undefined,
      };

      if (isEditing && customer?._id) {
        await dispatch(updateCustomer({
          customerId: customer._id,
          customerData,
        })).unwrap();
      } else {
        await dispatch(createCustomer(customerData)).unwrap();
      }

      setShowSnackbar(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      console.error('Customer form error:', error);
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
        <Card style={styles.card}>
          <Card.Content>
            <Title style={styles.title}>
              {isEditing ? 'Edit Customer' : 'Add New Customer'}
            </Title>

            <Formik
              initialValues={initialValues}
              validationSchema={validationSchema}
              onSubmit={handleSubmit}
              enableReinitialize
            >
              {({
                handleChange,
                handleBlur,
                handleSubmit: formikSubmit,
                values,
                errors,
                touched,
                isValid,
                setFieldValue,
              }) => (
                <View style={styles.form}>
                  {/* Basic Information */}
                  <Text style={styles.sectionTitle}>Basic Information</Text>
                  
                  <TextInput
                    label="Full Name *"
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
                    label="Email *"
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

                  <TextInput
                    label="Phone Number *"
                    mode="outlined"
                    value={values.phone}
                    onChangeText={handleChange('phone')}
                    onBlur={handleBlur('phone')}
                    error={touched.phone && errors.phone}
                    keyboardType="phone-pad"
                    style={styles.input}
                  />
                  {touched.phone && errors.phone && (
                    <Text style={styles.errorText}>{errors.phone}</Text>
                  )}

                  <TextInput
                    label="Company *"
                    mode="outlined"
                    value={values.company}
                    onChangeText={handleChange('company')}
                    onBlur={handleBlur('company')}
                    error={touched.company && errors.company}
                    style={styles.input}
                  />
                  {touched.company && errors.company && (
                    <Text style={styles.errorText}>{errors.company}</Text>
                  )}

                  {/* Status */}
                  <View style={styles.statusContainer}>
                    <Text style={styles.fieldLabel}>Status *</Text>
                    <SegmentedButtons
                      value={values.status}
                      onValueChange={(value) => setFieldValue('status', value)}
                      buttons={[
                        {
                          value: 'prospect',
                          label: 'Prospect',
                          icon: 'account-search',
                        },
                        {
                          value: 'active',
                          label: 'Active',
                          icon: 'account-check',
                        },
                        {
                          value: 'inactive',
                          label: 'Inactive',
                          icon: 'account-off',
                        },
                      ]}
                      style={styles.segmentedButtons}
                    />
                  </View>

                  {/* Address Information */}
                  <Text style={styles.sectionTitle}>Address (Optional)</Text>

                  <TextInput
                    label="Street Address"
                    mode="outlined"
                    value={values.address?.street || ''}
                    onChangeText={handleChange('address.street')}
                    onBlur={handleBlur('address.street')}
                    error={touched.address?.street && errors.address?.street}
                    style={styles.input}
                  />

                  <View style={styles.addressRow}>
                    <TextInput
                      label="City"
                      mode="outlined"
                      value={values.address?.city || ''}
                      onChangeText={handleChange('address.city')}
                      onBlur={handleBlur('address.city')}
                      error={touched.address?.city && errors.address?.city}
                      style={[styles.input, styles.halfInput]}
                    />
                    <TextInput
                      label="State"
                      mode="outlined"
                      value={values.address?.state || ''}
                      onChangeText={handleChange('address.state')}
                      onBlur={handleBlur('address.state')}
                      error={touched.address?.state && errors.address?.state}
                      style={[styles.input, styles.halfInput]}
                    />
                  </View>

                  <View style={styles.addressRow}>
                    <TextInput
                      label="Zip Code"
                      mode="outlined"
                      value={values.address?.zipCode || ''}
                      onChangeText={handleChange('address.zipCode')}
                      onBlur={handleBlur('address.zipCode')}
                      error={touched.address?.zipCode && errors.address?.zipCode}
                      style={[styles.input, styles.halfInput]}
                    />
                    <TextInput
                      label="Country"
                      mode="outlined"
                      value={values.address?.country || ''}
                      onChangeText={handleChange('address.country')}
                      onBlur={handleBlur('address.country')}
                      error={touched.address?.country && errors.address?.country}
                      style={[styles.input, styles.halfInput]}
                    />
                  </View>

                  {/* Notes */}
                  <Text style={styles.sectionTitle}>Notes (Optional)</Text>
                  
                  <TextInput
                    label="Additional Notes"
                    mode="outlined"
                    value={values.notes}
                    onChangeText={handleChange('notes')}
                    onBlur={handleBlur('notes')}
                    error={touched.notes && errors.notes}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                  />
                  {touched.notes && errors.notes && (
                    <Text style={styles.errorText}>{errors.notes}</Text>
                  )}

                  {/* Action Buttons */}
                  <View style={styles.buttonContainer}>
                    <Button
                      mode="outlined"
                      onPress={() => navigation.goBack()}
                      style={[styles.button, styles.cancelButton]}
                      disabled={loading}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      mode="contained"
                      onPress={formikSubmit}
                      disabled={!isValid || loading}
                      style={[styles.button, styles.submitButton]}
                      contentStyle={styles.buttonContent}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        isEditing ? 'Update Customer' : 'Create Customer'
                      )}
                    </Button>
                  </View>
                </View>
              )}
            </Formik>
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
        duration={2000}
      >
        <Text>Customer {isEditing ? 'updated' : 'created'} successfully!</Text>
      </Snackbar>
    </KeyboardAvoidingView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  scrollContainer: {
    padding: 16,
  },
  card: {
    elevation: 4,
  },
  title: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 24,
    fontWeight: 'bold',
  },
  form: {
    gap: 16,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginTop: 16,
    marginBottom: 8,
    color: '#6200ee',
  },
  input: {
    marginBottom: 8,
  },
  halfInput: {
    flex: 1,
    marginHorizontal: 4,
  },
  addressRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  statusContainer: {
    marginVertical: 8,
  },
  fieldLabel: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 8,
  },
  segmentedButtons: {
    marginBottom: 8,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 24,
    gap: 12,
  },
  button: {
    flex: 1,
  },
  cancelButton: {
    borderColor: '#666',
  },
  submitButton: {
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  errorText: {
    color: '#B00020',
    fontSize: 12,
    marginTop: -8,
    marginBottom: 8,
  },
});

export default CustomerFormScreen;
