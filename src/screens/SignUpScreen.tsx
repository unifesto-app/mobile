import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, User, Phone, Gift, ArrowLeft } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

interface SignUpScreenProps {
  navigation: any;
}

export default function SignUpScreen({ navigation }: SignUpScreenProps) {
  const { signUp, isConfigured, user, session } = useAuth();
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for auth state changes and navigate when logged in
  useEffect(() => {
    if (user && session) {
      // User is authenticated, navigate to main app
      navigation.reset({
        index: 0,
        routes: [{ name: 'MainApp' }],
      });
    }
  }, [user, session, navigation]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.name || !formData.email || !formData.phone || !formData.password || !formData.confirmPassword) {
      setError('Please fill in all fields');
      return false;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }

    if (formData.password.length < 6) {
      setError('Password must be at least 6 characters long');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone should be exactly 10 digits (we're storing without +91)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    return true;
  };

  const handleSignUp = async () => {
    if (!validateForm()) return;

    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');
    
    // Add +91 prefix to phone
    const phoneWithPrefix = '+91' + formData.phone;
    
    // Pass referral code to signUp - it will be applied automatically after session is established
    const { error: signUpError } = await signUp(
      formData.email, 
      formData.password, 
      {
        name: formData.name,
        phone: phoneWithPrefix,
      },
      formData.referralCode.trim() || undefined
    );
    
    if (signUpError) {
      setIsLoading(false);
      setError(signUpError.message || 'Sign up failed. Please try again.');
      return;
    }

    setIsLoading(false);
    
    // Show success message
    const message = formData.referralCode.trim() 
      ? 'Account created successfully! Your referral code will be applied automatically. Please check your email to verify your account.'
      : 'Account created successfully. Please check your email to verify your account.';
    
    Alert.alert(
      'Success!',
      message,
      [{ text: 'OK', onPress: () => navigation.navigate('MainApp') }]
    );
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container} 
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back to Home Button */}
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => navigation.navigate('MainApp')}
        activeOpacity={0.7}
      >
        <View style={styles.backButtonContent}>
          <ArrowLeft size={20} color={colors.primary} strokeWidth={2.5} />
          <Text style={styles.backButtonText}>Home</Text>
        </View>
      </TouchableOpacity>

      <ScrollView 
        contentContainerStyle={styles.scrollContainer}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>Create Account</GradientText>
          <Text style={styles.subtitle}>Join Unifesto and discover amazing events</Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Sign Up Form */}
        <View style={styles.formContainer}>
          {/* Name Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <User size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Full Name"
                placeholderTextColor={colors.textMuted}
                value={formData.name}
                onChangeText={(value) => handleInputChange('name', value)}
                autoCapitalize="words"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={formData.email}
                onChangeText={(value) => handleInputChange('email', value)}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Phone Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Phone size={20} color={colors.textMuted} strokeWidth={2} />
              <Text style={styles.countryCode}>+91</Text>
              <TextInput
                style={styles.input}
                placeholder="Phone Number"
                placeholderTextColor={colors.textMuted}
                value={formData.phone}
                onChangeText={(value) => {
                  // Remove any non-digit characters
                  const cleaned = value.replace(/\D/g, '');
                  handleInputChange('phone', cleaned);
                }}
                keyboardType="phone-pad"
                autoCorrect={false}
                editable={!isLoading}
                maxLength={10}
              />
            </View>
          </View>

          {/* Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Password"
                placeholderTextColor={colors.textMuted}
                value={formData.password}
                onChangeText={(value) => handleInputChange('password', value)}
                secureTextEntry={!showPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowPassword(!showPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showPassword ? (
                  <EyeOff size={20} color={colors.textMuted} strokeWidth={2} />
                ) : (
                  <Eye size={20} color={colors.textMuted} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Confirm Password Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Lock size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={[styles.input, styles.passwordInput]}
                placeholder="Confirm Password"
                placeholderTextColor={colors.textMuted}
                value={formData.confirmPassword}
                onChangeText={(value) => handleInputChange('confirmPassword', value)}
                secureTextEntry={!showConfirmPassword}
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
              <TouchableOpacity
                onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                style={styles.eyeButton}
                disabled={isLoading}
              >
                {showConfirmPassword ? (
                  <EyeOff size={20} color={colors.textMuted} strokeWidth={2} />
                ) : (
                  <Eye size={20} color={colors.textMuted} strokeWidth={2} />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Referral Code Input (Optional) */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Gift size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Referral Code (Optional)"
                placeholderTextColor={colors.textMuted}
                value={formData.referralCode}
                onChangeText={(value) => handleInputChange('referralCode', value.toUpperCase())}
                autoCapitalize="characters"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
            <Text style={styles.referralHint}>
              Have a referral code? Enter it to earn bonus coins!
            </Text>
          </View>

          {/* Sign Up Button */}
          <TouchableOpacity
            style={styles.signUpButton}
            onPress={handleSignUp}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.signUpButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.signUpButtonText}>Create Account</Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Removed Login Link - Users can access login from home */}

          {/* Terms */}
          <Text style={styles.termsText}>
            By creating an account, you agree to our Terms of Service and Privacy Policy
          </Text>
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  backButton: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? spacing[12] : spacing[8],
    left: spacing[6],
    zIndex: 10,
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[2],
    paddingHorizontal: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.sm,
  },
  backButtonContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  backButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  scrollContainer: {
    flexGrow: 1,
    justifyContent: 'center',
    paddingHorizontal: spacing[6],
    paddingVertical: spacing[12],
  },
  header: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  title: {
    fontSize: typography.fontSize['4xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[3],
    textAlign: 'center',
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.2)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  errorText: {
    color: '#ef4444',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: spacing[4],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[4],
    ...shadows.sm,
  },
  countryCode: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: getFontFamily('bold'),
    marginLeft: spacing[3],
    paddingRight: spacing[2],
    borderRightWidth: 1,
    borderRightColor: colors.borderMuted,
  },
  input: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
    fontFamily: typography.fontFamily.primary,
  },
  passwordInput: {
    marginRight: spacing[3],
  },
  eyeButton: {
    padding: spacing[1],
  },
  signUpButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginTop: spacing[2],
    marginBottom: spacing[6],
    ...shadows.lg,
  },
  signUpButtonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  signUpButtonText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.primary,
  },
  loginContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  loginText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  loginLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  termsText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  referralHint: {
    fontSize: typography.fontSize.xs,
    color: colors.primary,
    marginTop: spacing[2],
    marginLeft: spacing[1],
  },
});