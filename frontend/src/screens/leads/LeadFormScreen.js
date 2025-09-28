import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  KeyboardAvoidingView,
  Platform,
  TouchableOpacity,
} from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';
import {
  Text,
  TextInput,
  Button,
  Card,
  Title,
  Snackbar,
  ActivityIndicator,
  SegmentedButtons,
  Menu,
  Divider,
} from 'react-native-paper';
import { useDispatch, useSelector } from 'react-redux';
import { Formik } from 'formik';
import * as Yup from 'yup';

import {
  createLead,
  updateLead,
  clearError,
} from '../../store/slices/leadSlice';
import { fetchCustomers } from '../../store/slices/customerSlice';

const validationSchema = Yup.object().shape({
  title: Yup.string()
    .min(2, 'Title must be at least 2 characters')
    .max(100, 'Title cannot exceed 100 characters')
    .required('Title is required'),
  description: Yup.string()
    .min(5, 'Description must be at least 5 characters')
    .max(500, 'Description cannot exceed 500 characters')
    .required('Description is required'),
  value: Yup.number()
    .min(0, 'Value must be positive')
    .required('Value is required'),
  status: Yup.string()
    .oneOf(['New', 'Contacted', 'Converted', 'Lost'], 'Invalid status')
    .required('Status is required'),
  priority: Yup.string()
    .oneOf(['Low', 'Medium', 'High'], 'Invalid priority')
    .required('Priority is required'),
  customer: Yup.string()
    .required('Customer is required'),
  expectedCloseDate: Yup.date()
    .min(new Date(), 'Expected close date must be in the future')
    .nullable(),
});

const LeadFormScreen = ({ route, navigation }) => {
  const { lead, customerId } = route.params || {};
  const dispatch = useDispatch();
  const { loading, error } = useSelector((state) => state.leads);
  const { customers } = useSelector((state) => state.customers);
  
  const [showSnackbar, setShowSnackbar] = useState(false);
  const [customerMenuVisible, setCustomerMenuVisible] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState(null);
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [selectedDate, setSelectedDate] = useState(new Date());

  const isEditing = !!lead;

  useEffect(() => {
    // Load customers if not already loaded
    if (customers.length === 0) {
      dispatch(fetchCustomers({ page: 1, limit: 100 }));
    }

    // Set initial customer if customerId is provided or if editing
    if (customerId) {
      const customer = customers.find(c => c._id === customerId);
      setSelectedCustomer(customer);
    } else if (lead?.customer) {
      setSelectedCustomer(lead.customer);
    }

    // Set initial date if editing
    if (lead?.expectedCloseDate) {
      setSelectedDate(new Date(lead.expectedCloseDate));
    }
  }, [customers, customerId, lead]);

  const initialValues = {
    title: lead?.title || '',
    description: lead?.description || '',
    value: lead?.value?.toString() || '',
    status: lead?.status || 'New',
    priority: lead?.priority || 'Medium',
    customer: lead?.customer?._id || customerId || '',
    expectedCloseDate: lead?.expectedCloseDate 
      ? new Date(lead.expectedCloseDate).toISOString().split('T')[0] 
      : '',
  };

  const handleSubmit = async (values) => {
    try {
      const leadData = {
        ...values,
        value: parseFloat(values.value),
        expectedCloseDate: values.expectedCloseDate || undefined,
      };

      if (isEditing) {
        await dispatch(updateLead({
          leadId: lead._id,
          leadData,
        })).unwrap();
      } else {
        await dispatch(createLead(leadData)).unwrap();
      }

      setShowSnackbar(true);
      setTimeout(() => {
        navigation.goBack();
      }, 1000);
    } catch (error) {
      // Error is handled by the slice
    }
  };

  const handleDismissError = () => {
    dispatch(clearError());
  };

  const handleCustomerSelect = (customer, setFieldValue) => {
    setSelectedCustomer(customer);
    setFieldValue('customer', customer._id);
    setCustomerMenuVisible(false);
  };

  const handleDateChange = (event, date, setFieldValue) => {
    setShowDatePicker(Platform.OS === 'ios');
    if (date) {
      setSelectedDate(date);
      const formattedDate = date.toISOString().split('T')[0];
      setFieldValue('expectedCloseDate', formattedDate);
    }
  };

  const showDatePickerModal = () => {
    setShowDatePicker(true);
  };

  const formatDisplayDate = (dateString) => {
    if (!dateString) return 'Select Date';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
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
              {isEditing ? 'Edit Lead' : 'Add New Lead'}
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
                handleSubmit,
                values,
                errors,
                touched,
                isValid,
                setFieldValue,
              }) => (
                <View style={styles.form}>
                  {/* Basic Information */}
                  <Text style={styles.sectionTitle}>Lead Information</Text>
                  
                  <TextInput
                    label="Lead Title *"
                    mode="outlined"
                    value={values.title}
                    onChangeText={handleChange('title')}
                    onBlur={handleBlur('title')}
                    error={touched.title && errors.title}
                    style={styles.input}
                  />
                  {touched.title && errors.title && (
                    <Text style={styles.errorText}>{errors.title}</Text>
                  )}

                  <TextInput
                    label="Description *"
                    mode="outlined"
                    value={values.description}
                    onChangeText={handleChange('description')}
                    onBlur={handleBlur('description')}
                    error={touched.description && errors.description}
                    multiline
                    numberOfLines={4}
                    style={styles.input}
                  />
                  {touched.description && errors.description && (
                    <Text style={styles.errorText}>{errors.description}</Text>
                  )}

                  <TextInput
                    label="Lead Value (USD) *"
                    mode="outlined"
                    value={values.value}
                    onChangeText={handleChange('value')}
                    onBlur={handleBlur('value')}
                    error={touched.value && errors.value}
                    keyboardType="numeric"
                    left={<TextInput.Icon icon="currency-usd" />}
                    style={styles.input}
                  />
                  {touched.value && errors.value && (
                    <Text style={styles.errorText}>{errors.value}</Text>
                  )}

                  <Text style={styles.fieldLabel}>Expected Close Date</Text>
                  <TouchableOpacity
                    onPress={showDatePickerModal}
                    style={[
                      styles.datePickerButton,
                      touched.expectedCloseDate && errors.expectedCloseDate && styles.datePickerButtonError
                    ]}
                  >
                    <View style={styles.datePickerContent}>
                      <Text style={[
                        styles.datePickerText,
                        !values.expectedCloseDate && styles.datePickerPlaceholder
                      ]}>
                        {formatDisplayDate(values.expectedCloseDate)}
                      </Text>
                      <Text style={styles.calendarIcon}>📅</Text>
                    </View>
                  </TouchableOpacity>
                  {touched.expectedCloseDate && errors.expectedCloseDate && (
                    <Text style={styles.errorText}>{errors.expectedCloseDate}</Text>
                  )}

                  {showDatePicker && (
                    <DateTimePicker
                      value={selectedDate}
                      mode="date"
                      display={Platform.OS === 'ios' ? 'spinner' : 'default'}
                      onChange={(event, date) => handleDateChange(event, date, setFieldValue)}
                      minimumDate={new Date()}
                    />
                  )}

                  {/* Customer Selection */}
                  <Text style={styles.sectionTitle}>Customer *</Text>
                  
                  <Menu
                    visible={customerMenuVisible}
                    onDismiss={() => setCustomerMenuVisible(false)}
                    anchor={
                      <Button
                        mode="outlined"
                        onPress={() => setCustomerMenuVisible(true)}
                        style={styles.customerButton}
                        icon="account"
                        contentStyle={styles.customerButtonContent}
                      >
                        {selectedCustomer 
                          ? `${selectedCustomer.name} - ${selectedCustomer.company}`
                          : 'Select Customer'
                        }
                      </Button>
                    }
                  >
                    {customers.map((customer) => (
                      <Menu.Item
                        key={customer._id}
                        onPress={() => handleCustomerSelect(customer, setFieldValue)}
                        title={`${customer.name} - ${customer.company}`}
                        leadingIcon="account"
                      />
                    ))}
                    {customers.length === 0 && (
                      <Menu.Item
                        title="No customers available"
                        disabled
                      />
                    )}
                  </Menu>
                  {touched.customer && errors.customer && (
                    <Text style={styles.errorText}>{errors.customer}</Text>
                  )}

                  {/* Status */}
                  <View style={styles.statusContainer}>
                    <Text style={styles.fieldLabel}>Status *</Text>
                    <SegmentedButtons
                      value={values.status}
                      onValueChange={(value) => setFieldValue('status', value)}
                      buttons={[
                        {
                          value: 'New',
                          label: 'New',
                          icon: 'new-box',
                        },
                        {
                          value: 'Contacted',
                          label: 'Contacted',
                          icon: 'phone',
                        },
                        {
                          value: 'Converted',
                          label: 'Converted',
                          icon: 'check-circle',
                        },
                        {
                          value: 'Lost',
                          label: 'Lost',
                          icon: 'close-circle',
                        },
                      ]}
                      style={styles.segmentedButtons}
                    />
                  </View>

                  {/* Priority */}
                  <View style={styles.priorityContainer}>
                    <Text style={styles.fieldLabel}>Priority *</Text>
                    <SegmentedButtons
                      value={values.priority}
                      onValueChange={(value) => setFieldValue('priority', value)}
                      buttons={[
                        {
                          value: 'Low',
                          label: 'Low',
                          icon: 'flag-outline',
                        },
                        {
                          value: 'Medium',
                          label: 'Medium',
                          icon: 'flag',
                        },
                        {
                          value: 'High',
                          label: 'High',
                          icon: 'flag-variant',
                        },
                      ]}
                      style={styles.segmentedButtons}
                    />
                  </View>

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
                      onPress={handleSubmit}
                      disabled={!isValid || loading}
                      style={[styles.button, styles.submitButton]}
                      contentStyle={styles.buttonContent}
                    >
                      {loading ? (
                        <ActivityIndicator color="white" size="small" />
                      ) : (
                        isEditing ? 'Update Lead' : 'Create Lead'
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
        <Text>Lead {isEditing ? 'updated' : 'created'} successfully!</Text>
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
  customerButton: {
    marginBottom: 8,
    justifyContent: 'flex-start',
  },
  customerButtonContent: {
    justifyContent: 'flex-start',
    paddingVertical: 12,
  },
  statusContainer: {
    marginVertical: 8,
  },
  priorityContainer: {
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
  datePickerButton: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 4,
    padding: 16,
    marginBottom: 8,
    backgroundColor: '#fff',
  },
  datePickerButtonError: {
    borderColor: '#B00020',
  },
  datePickerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  datePickerText: {
    fontSize: 16,
    color: '#000',
  },
  datePickerPlaceholder: {
    color: '#666',
  },
  calendarIcon: {
    fontSize: 20,
  },
});

export default LeadFormScreen;
