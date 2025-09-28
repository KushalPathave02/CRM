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
  Paragraph,
} from 'react-native-paper';
import { useTheme } from 'react-native-paper';
import { authAPI } from '../../services/api';

const EmailVerificationScreen = ({ route, navigation }) => {
  const { email, fromLogin, fromRegistration } = route.params || {};
  const theme = useTheme();
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [resendEmail, setResendEmail] = useState(email || '');
  
  const getTitle = () => {
    if (fromLogin) return 'Email Verification Required';
    if (fromRegistration) return 'Check Your Email';
    return 'Email Verification';
  };
  
  const getSubtitle = () => {
    if (fromLogin) return 'Your email address needs to be verified before you can log in.';
    if (fromRegistration) return 'We\'ve sent a verification link to your email address.';
    return 'Please verify your email address to continue.';
  };

  const handleResendVerification = async () => {
    if (!resendEmail.trim()) {
      setError('Please enter your email address');
      return;
    }

    setLoading(true);
    setError('');
    setMessage('');

    try {
      const response = await authAPI.resendVerification(resendEmail);
      setMessage(response.data.message);
    } catch (error) {
      setError(error.response?.data?.message || 'Failed to send verification email');
    } finally {
      setLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigation.navigate('Login');
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <ScrollView contentContainerStyle={styles.scrollContainer}>
        <Card style={styles.card}>
          <Card.Content>
            <View style={styles.iconContainer}>
              <Text style={styles.emailIcon}>📧</Text>
            </View>
            
            <Title style={styles.title}>{getTitle()}</Title>
            
            <Paragraph style={styles.description}>
              {getSubtitle()}
            </Paragraph>

            {email && (
              <View style={styles.emailContainer}>
                <Text style={styles.emailLabel}>Email sent to:</Text>
                <Text style={styles.emailText}>{email}</Text>
              </View>
            )}

            <View style={styles.instructionsContainer}>
              <Text style={styles.instructionsTitle}>📋 What to do next:</Text>
              <Text style={styles.instruction}>1. Check your email inbox</Text>
              <Text style={styles.instruction}>2. Look for an email from CRM App</Text>
              <Text style={styles.instruction}>3. Click the verification link</Text>
              <Text style={styles.instruction}>4. Return here to log in</Text>
            </View>

            <View style={styles.resendContainer}>
              <Text style={styles.resendTitle}>Didn't receive the email?</Text>
              
              <TextInput
                label="Email Address"
                mode="outlined"
                value={resendEmail}
                onChangeText={setResendEmail}
                keyboardType="email-address"
                autoCapitalize="none"
                style={styles.input}
                left={<TextInput.Icon icon="email" />}
              />

              <Button
                mode="outlined"
                onPress={handleResendVerification}
                disabled={loading}
                style={styles.resendButton}
                contentStyle={styles.buttonContent}
              >
                {loading ? (
                  <ActivityIndicator color={theme.colors.primary} size="small" />
                ) : (
                  'Resend Verification Email'
                )}
              </Button>
            </View>

            <View style={styles.actionContainer}>
              <Button
                mode="contained"
                onPress={handleBackToLogin}
                style={styles.loginButton}
                contentStyle={styles.buttonContent}
              >
                Back to Login
              </Button>
            </View>

            <View style={styles.helpContainer}>
              <Text style={styles.helpText}>
                💡 Check your spam folder if you don't see the email in your inbox.
              </Text>
              <Text style={styles.helpText}>
                🕐 Verification links expire after 24 hours.
              </Text>
            </View>
          </Card.Content>
        </Card>
      </ScrollView>

      <Snackbar
        visible={!!error}
        onDismiss={() => setError('')}
        duration={4000}
        action={{
          label: 'Dismiss',
          onPress: () => setError(''),
        }}
      >
        <Text>{error}</Text>
      </Snackbar>

      <Snackbar
        visible={!!message}
        onDismiss={() => setMessage('')}
        duration={4000}
      >
        <Text>{message}</Text>
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
    flexGrow: 1,
    justifyContent: 'center',
    padding: 16,
  },
  card: {
    elevation: 4,
    borderRadius: 12,
  },
  iconContainer: {
    alignItems: 'center',
    marginBottom: 20,
  },
  emailIcon: {
    fontSize: 64,
  },
  title: {
    textAlign: 'center',
    marginBottom: 16,
    fontSize: 24,
    fontWeight: 'bold',
  },
  description: {
    textAlign: 'center',
    marginBottom: 24,
    fontSize: 16,
    lineHeight: 24,
  },
  emailContainer: {
    backgroundColor: '#e3f2fd',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
    alignItems: 'center',
  },
  emailLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 4,
  },
  emailText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1976d2',
  },
  instructionsContainer: {
    backgroundColor: '#f9f9f9',
    padding: 16,
    borderRadius: 8,
    marginBottom: 24,
  },
  instructionsTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 12,
  },
  instruction: {
    fontSize: 14,
    marginBottom: 8,
    paddingLeft: 8,
  },
  resendContainer: {
    marginBottom: 24,
  },
  resendTitle: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 16,
    textAlign: 'center',
  },
  input: {
    marginBottom: 16,
  },
  resendButton: {
    marginBottom: 8,
  },
  actionContainer: {
    marginBottom: 24,
  },
  loginButton: {
    backgroundColor: '#6200ee',
  },
  buttonContent: {
    paddingVertical: 8,
  },
  helpContainer: {
    backgroundColor: '#fff3e0',
    padding: 16,
    borderRadius: 8,
  },
  helpText: {
    fontSize: 14,
    marginBottom: 8,
    textAlign: 'center',
  },
});

export default EmailVerificationScreen;
