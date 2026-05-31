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
import { useRouter, useLocalSearchParams } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function SignUpScreen() {
  const router = useRouter();
  const params = useLocalSearchParams<{ ref?: string }>();
  const { signUp, isConfigured, user, session } = useAuth();
  const [currentStep, setCurrentStep] = useState(1);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    password: '',
    confirmPassword: '',
    referralCode: params?.ref || '',
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  // Listen for auth state changes and navigate when logged in
  useEffect(() => {
    if (user && session) {
      router.replace('/(tabs)');
    }
  }, [user, session]);

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    setError('');
  };

  const validateStep1 = () => {
    if (!formData.name || !formData.email || !formData.phone) {
      setError('Please fill in all basic information');
      return false;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Phone should be exactly 10 digits
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(formData.phone)) {
      setError('Please enter a valid 10-digit phone number');
      return false;
    }

    setError('');
    return true;
  };

  const validateStep2 = () => {
    if (!formData.password || !formData.confirmPassword) {
      setError('Please enter and confirm your password');
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

    setError('');
    return true;
  };

  const handleNextStep = () => {
    if (validateStep1()) {
      setCurrentStep(2);
    }
  };

  const handlePrevStep = () => {
    setCurrentStep(1);
    setError('');
  };

  const handleSignUp = async () => {
    if (!validateStep2()) return;

    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    // Add +91 prefix to phone
    const phoneWithPrefix = '+91' + formData.phone;

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

    const message = formData.referralCode.trim()
      ? 'Account created successfully! Your referral code will be applied automatically. Please check your email to verify your account.'
      : 'Account created successfully. Please check your email to verify your account.';

    Alert.alert(
      'Success!',
      message,
      [{ text: 'OK', onPress: () => router.replace('/(tabs)') }]
    );
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.push('/(tabs)')}
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
        <View style={styles.header}>
          <GradientText style={styles.title}>Create Account</GradientText>
          <Text style={styles.subtitle}>Join Unifesto and discover amazing events</Text>
        </View>

        {/* Step Indicator */}
        <View style={styles.stepIndicatorContainer}>
          <View style={[styles.stepDot, currentStep >= 1 && styles.stepDotActive]} />
          <View style={[styles.stepLine, currentStep >= 2 && styles.stepLineActive]} />
          <View style={[styles.stepDot, currentStep >= 2 && styles.stepDotActive]} />
        </View>
        <Text style={styles.stepText}>Step {currentStep} of 2</Text>

        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        <View style={styles.formContainer}>
          {currentStep === 1 ? (
            <>
              {/* Step 1 Fields */}
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

              <TouchableOpacity
                style={styles.signUpButton}
                onPress={handleNextStep}
                activeOpacity={0.8}
              >
                <LinearGradient
                  colors={['#3491ff', '#0062ff']}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 0 }}
                  style={styles.signUpButtonGradient}
                >
                  <Text style={styles.signUpButtonText}>Continue</Text>
                </LinearGradient>
              </TouchableOpacity>
            </>
          ) : (
            <>
              {/* Step 2 Fields */}
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

              <View style={styles.buttonRow}>
                <TouchableOpacity
                  style={styles.backStepButton}
                  onPress={handlePrevStep}
                  disabled={isLoading}
                  activeOpacity={0.7}
                >
                  <Text style={styles.backStepButtonText}>Back</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.nextButton}
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
              </View>
            </>
          )}

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
    marginBottom: spacing[6],
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
  stepIndicatorContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  stepDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colors.borderMuted,
  },
  stepDotActive: {
    backgroundColor: colors.primary,
  },
  stepLine: {
    width: 32,
    height: 2,
    backgroundColor: colors.borderMuted,
    marginHorizontal: spacing[2],
    borderRadius: 1,
  },
  stepLineActive: {
    backgroundColor: colors.primary,
  },
  stepText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginBottom: spacing[6],
    fontFamily: getFontFamily('medium'),
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
  buttonRow: {
    flexDirection: 'row',
    gap: spacing[4],
    marginTop: spacing[2],
    marginBottom: spacing[6],
  },
  backStepButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: colors.borderMuted,
    backgroundColor: 'transparent',
    alignItems: 'center',
    justifyContent: 'center',
    height: 48,
  },
  backStepButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.primary,
  },
  nextButton: {
    flex: 2,
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
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