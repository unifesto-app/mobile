import React, { useState } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { User, CheckCircle, AlertCircle } from 'lucide-react-native';
import { colors, spacing } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { updateProfile } from '../lib/api/profile';

interface UsernameSetupScreenProps {
  navigation: any;
}

export default function UsernameSetupScreen({ navigation }: UsernameSetupScreenProps) {
  const [username, setUsername] = useState('');
  const [loading, setLoading] = useState(false);
  const [checking, setChecking] = useState(false);
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null);
  const [error, setError] = useState('');

  // Debounce timer for username availability check
  const [checkTimer, setCheckTimer] = useState<NodeJS.Timeout | null>(null);

  const validateUsername = (value: string): boolean => {
    // Username rules:
    // - 3-20 characters
    // - Only lowercase letters, numbers, underscores, and hyphens
    // - Must start with a letter
    // - Cannot end with underscore or hyphen
    const usernameRegex = /^[a-z][a-z0-9_-]{2,19}$/;
    
    if (!value) {
      setError('Username is required');
      return false;
    }
    
    if (value.length < 3) {
      setError('Username must be at least 3 characters');
      return false;
    }
    
    if (value.length > 20) {
      setError('Username must be less than 20 characters');
      return false;
    }
    
    if (!usernameRegex.test(value)) {
      if (!/^[a-z]/.test(value)) {
        setError('Username must start with a lowercase letter');
      } else if (/[_-]$/.test(value)) {
        setError('Username cannot end with _ or -');
      } else if (/[^a-z0-9_-]/.test(value)) {
        setError('Username can only contain lowercase letters, numbers, _ and -');
      } else {
        setError('Invalid username format');
      }
      return false;
    }
    
    setError('');
    return true;
  };

  const checkUsernameAvailability = async (value: string) => {
    if (!validateUsername(value)) {
      setIsAvailable(null);
      return;
    }

    setChecking(true);
    setIsAvailable(null);

    try {
      // Call API to check username availability
      const response = await fetch(
        `${process.env.EXPO_PUBLIC_API_URL}/auth/check-username?username=${value}`,
        {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
        }
      );

      const data = await response.json();
      
      if (response.ok) {
        setIsAvailable(data.available);
        if (!data.available) {
          setError('Username is already taken');
        }
      } else {
        setError('Failed to check username availability');
        setIsAvailable(null);
      }
    } catch (err) {
      setError('Failed to check username availability');
      setIsAvailable(null);
    } finally {
      setChecking(false);
    }
  };

  const handleUsernameChange = (value: string) => {
    // Convert to lowercase and remove spaces
    const cleanValue = value.toLowerCase().replace(/\s/g, '');
    setUsername(cleanValue);
    setIsAvailable(null);
    setError('');

    // Clear existing timer
    if (checkTimer) {
      clearTimeout(checkTimer);
    }

    // Set new timer for debounced check
    if (cleanValue.length >= 3) {
      const timer = setTimeout(() => {
        checkUsernameAvailability(cleanValue);
      }, 500);
      setCheckTimer(timer);
    }
  };

  const handleSubmit = async () => {
    if (!username || !isAvailable) {
      Alert.alert('Error', 'Please enter a valid and available username');
      return;
    }

    setLoading(true);

    try {
      await updateProfile({ username });
      
      // Navigate to main app
      navigation.replace('MainApp');
    } catch (err: any) {
      Alert.alert(
        'Error',
        err.message || 'Failed to set username. Please try again.'
      );
    } finally {
      setLoading(false);
    }
  };

  const getUsernameStatusIcon = () => {
    if (checking) {
      return <ActivityIndicator size="small" color="#3491ff" />;
    }
    if (isAvailable === true) {
      return <CheckCircle size={20} color="#10b981" strokeWidth={2} />;
    }
    if (isAvailable === false || error) {
      return <AlertCircle size={20} color="#ef4444" strokeWidth={2} />;
    }
    return null;
  };

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={styles.container}
    >
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardView}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          keyboardShouldPersistTaps="handled"
        >
          {/* Header */}
          <View style={styles.header}>
            <View style={styles.iconContainer}>
              <LinearGradient
                colors={['#3491ff', '#0062ff']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.iconGradient}
              >
                <User size={40} color="#ffffff" strokeWidth={2} />
              </LinearGradient>
            </View>
            
            <Text style={styles.title}>Choose Your Username</Text>
            <Text style={styles.subtitle}>
              This is how others will find and identify you on the platform
            </Text>
          </View>

          {/* Username Input */}
          <View style={styles.form}>
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Text style={styles.inputPrefix}>@</Text>
                <TextInput
                  style={styles.input}
                  placeholder="username"
                  placeholderTextColor="#64748b"
                  value={username}
                  onChangeText={handleUsernameChange}
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="username"
                  maxLength={20}
                  editable={!loading}
                />
                <View style={styles.statusIcon}>
                  {getUsernameStatusIcon()}
                </View>
              </View>
              
              {/* Character count */}
              <Text style={styles.characterCount}>
                {username.length}/20
              </Text>
            </View>

            {/* Error or Success Message */}
            {error && (
              <View style={styles.messageContainer}>
                <AlertCircle size={16} color="#ef4444" strokeWidth={2} />
                <Text style={styles.errorText}>{error}</Text>
              </View>
            )}
            
            {isAvailable === true && !error && (
              <View style={[styles.messageContainer, styles.successContainer]}>
                <CheckCircle size={16} color="#10b981" strokeWidth={2} />
                <Text style={styles.successText}>Username is available!</Text>
              </View>
            )}

            {/* Username Rules */}
            <View style={styles.rulesContainer}>
              <Text style={styles.rulesTitle}>Username Rules:</Text>
              <Text style={styles.ruleItem}>• 3-20 characters long</Text>
              <Text style={styles.ruleItem}>• Start with a lowercase letter</Text>
              <Text style={styles.ruleItem}>• Use only lowercase letters, numbers, _ and -</Text>
              <Text style={styles.ruleItem}>• Cannot end with _ or -</Text>
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[
                styles.submitButton,
                (!isAvailable || loading) && styles.submitButtonDisabled,
              ]}
              onPress={handleSubmit}
              disabled={!isAvailable || loading}
            >
              <LinearGradient
                colors={
                  !isAvailable || loading
                    ? ['#1e293b', '#0f172a']
                    : ['#3491ff', '#0062ff']
                }
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 0 }}
                style={styles.submitGradient}
              >
                {loading ? (
                  <ActivityIndicator size="small" color="#ffffff" />
                ) : (
                  <Text style={styles.submitButtonText}>Continue</Text>
                )}
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  keyboardView: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[8],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  iconContainer: {
    marginBottom: spacing[6],
  },
  iconGradient: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 28,
    fontFamily: getFontFamily('700'),
    color: '#ffffff',
    textAlign: 'center',
    marginBottom: spacing[3],
  },
  subtitle: {
    fontSize: 16,
    fontFamily: getFontFamily('400'),
    color: '#94a3b8',
    textAlign: 'center',
    lineHeight: 24,
  },
  form: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(30, 41, 59, 0.5)',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
    paddingHorizontal: spacing[4],
    height: 56,
  },
  inputPrefix: {
    fontSize: 18,
    fontFamily: getFontFamily('600'),
    color: '#3491ff',
    marginRight: spacing[2],
  },
  input: {
    flex: 1,
    fontSize: 18,
    fontFamily: getFontFamily('500'),
    color: '#ffffff',
    paddingVertical: 0,
  },
  statusIcon: {
    width: 24,
    height: 24,
    alignItems: 'center',
    justifyContent: 'center',
  },
  characterCount: {
    fontSize: 12,
    fontFamily: getFontFamily('400'),
    color: '#64748b',
    textAlign: 'right',
    marginTop: spacing[2],
  },
  messageContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: spacing[3],
    marginBottom: spacing[4],
  },
  successContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  errorText: {
    fontSize: 14,
    fontFamily: getFontFamily('500'),
    color: '#ef4444',
    marginLeft: spacing[2],
    flex: 1,
  },
  successText: {
    fontSize: 14,
    fontFamily: getFontFamily('500'),
    color: '#10b981',
    marginLeft: spacing[2],
    flex: 1,
  },
  rulesContainer: {
    backgroundColor: 'rgba(30, 41, 59, 0.3)',
    borderRadius: 12,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  rulesTitle: {
    fontSize: 14,
    fontFamily: getFontFamily('600'),
    color: '#ffffff',
    marginBottom: spacing[2],
  },
  ruleItem: {
    fontSize: 13,
    fontFamily: getFontFamily('400'),
    color: '#94a3b8',
    marginBottom: spacing[1],
    lineHeight: 20,
  },
  submitButton: {
    borderRadius: 12,
    overflow: 'hidden',
    elevation: 4,
    shadowColor: '#3491ff',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  submitButtonDisabled: {
    elevation: 0,
    shadowOpacity: 0,
  },
  submitGradient: {
    paddingVertical: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 56,
  },
  submitButtonText: {
    fontSize: 18,
    fontFamily: getFontFamily('600'),
    color: '#ffffff',
  },
});
