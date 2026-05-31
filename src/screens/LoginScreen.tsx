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
import { Eye, EyeOff, Mail, Lock, ArrowLeft } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function LoginScreen() {
  const router = useRouter();
  const { signIn, signInWithGoogle, signInWithApple, resetPassword, isConfigured, isAppleAuthAvailable, user, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);

  // Listen for auth state changes and navigate when logged in
  useEffect(() => {
    if (user && session) {
      // User is authenticated, navigate to main app
      router.replace('/(tabs)');
    }
  }, [user, session]);

  const handleLogin = async () => {
    if (!email || !password) {
      setError('Please fill in all fields');
      return;
    }

    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: signInError } = await signIn(email, password);
    setIsLoading(false);

    if (signInError) {
      setError(signInError.message || 'Login failed. Please try again.');
    } else {
      // Navigate to tabs after successful login
      router.replace('/(tabs)');
    }
  };

  const handleGoogleLogin = async () => {
    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: googleError } = await signInWithGoogle();

      if (googleError) {
        if (googleError.message !== 'Login cancelled') {
          setError(googleError.message || 'Google login failed. Please try again.');
        }
      }
    } catch (err: any) {
      setError('An error occurred during Google login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    if (!isAppleAuthAvailable) {
      setError('Apple Sign In is not available on this device.');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const { error: appleError } = await signInWithApple();

      if (appleError) {
        // Check if it's a configuration error
        if (appleError.message && appleError.message.includes('1000')) {
          setError('Apple Sign In is not configured yet. Please use email or Google sign in.');
        } else {
          setError(appleError.message || 'Apple login failed. Please try again.');
        }
      }
      // If successful, the AuthContext will update the session
      // and the AppNavigator will automatically navigate to MainApp
    } catch (err: any) {
      if (err.message && err.message.includes('1000')) {
        setError('Apple Sign In is not configured yet. Please use email or Google sign in.');
      } else {
        setError(err.message || 'An error occurred during Apple login');
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    if (!isConfigured) {
      setError('Authentication is not configured. Please set up Supabase environment variables.');
      return;
    }

    setIsLoading(true);
    setError('');

    const { error: resetError } = await resetPassword(email);
    setIsLoading(false);

    if (resetError) {
      setError(resetError.message || 'Failed to send reset email. Please try again.');
    } else {
      Alert.alert(
        'Reset Link Sent',
        'Check your email for the password reset link.',
        [{ text: 'OK', onPress: () => setShowForgotPassword(false) }]
      );
    }
  };

  return (
    <KeyboardAvoidingView
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      {/* Back to Home Button */}
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
        {/* Header */}
        <View style={styles.header}>
          <GradientText style={styles.title}>
            {showForgotPassword ? 'Reset Password' : 'Welcome Back'}
          </GradientText>
          <Text style={styles.subtitle}>
            {showForgotPassword
              ? "We'll send you a reset link to your email"
              : 'Sign in to continue to Unifesto'}
          </Text>
        </View>

        {/* Error Message */}
        {error ? (
          <View style={styles.errorContainer}>
            <Text style={styles.errorText}>{error}</Text>
          </View>
        ) : null}

        {/* Login Form */}
        <View style={styles.formContainer}>
          {/* Email Input */}
          <View style={styles.inputContainer}>
            <View style={styles.inputWrapper}>
              <Mail size={20} color={colors.textMuted} strokeWidth={2} />
              <TextInput
                style={styles.input}
                placeholder="Email address"
                placeholderTextColor={colors.textMuted}
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  setError('');
                }}
                keyboardType="email-address"
                autoCapitalize="none"
                autoCorrect={false}
                editable={!isLoading}
              />
            </View>
          </View>

          {/* Password Input (only for login) */}
          {!showForgotPassword && (
            <View style={styles.inputContainer}>
              <View style={styles.inputWrapper}>
                <Lock size={20} color={colors.textMuted} strokeWidth={2} />
                <TextInput
                  style={[styles.input, styles.passwordInput]}
                  placeholder="Password"
                  placeholderTextColor={colors.textMuted}
                  value={password}
                  onChangeText={(text) => {
                    setPassword(text);
                    setError('');
                  }}
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
          )}

          {/* Forgot Password Link */}
          {!showForgotPassword && (
            <TouchableOpacity
              style={styles.forgotPassword}
              onPress={() => setShowForgotPassword(true)}
              disabled={isLoading}
            >
              <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
            </TouchableOpacity>
          )}

          {/* Action Button */}
          <TouchableOpacity
            style={styles.loginButton}
            onPress={showForgotPassword ? handleForgotPassword : handleLogin}
            disabled={isLoading}
            activeOpacity={0.8}
          >
            <LinearGradient
              colors={['#3491ff', '#0062ff']}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 0 }}
              style={styles.loginButtonGradient}
            >
              {isLoading ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.loginButtonText}>
                  {showForgotPassword ? 'Send Reset Link' : 'Sign In'}
                </Text>
              )}
            </LinearGradient>
          </TouchableOpacity>

          {/* Back to Login (for forgot password) */}
          {showForgotPassword && (
            <TouchableOpacity
              style={styles.backToLogin}
              onPress={() => {
                setShowForgotPassword(false);
                setError('');
              }}
              disabled={isLoading}
            >
              <Text style={styles.backToLoginText}>Back to Sign In</Text>
            </TouchableOpacity>
          )}

          {/* Divider and Social Sign In (only for login) */}
          {!showForgotPassword && (
            <>
              <View style={styles.divider}>
                <View style={styles.dividerLine} />
                <Text style={styles.dividerText}>or continue with</Text>
                <View style={styles.dividerLine} />
              </View>

              {/* Social Login Buttons - Side by Side */}
              <View style={styles.socialButtonsContainer}>
                {/* Apple Sign In Button (iOS only) */}
                {isAppleAuthAvailable && (
                  <TouchableOpacity
                    style={styles.socialButton}
                    onPress={handleAppleLogin}
                    disabled={isLoading}
                    activeOpacity={0.8}
                  >
                    <View style={styles.appleButtonContent}>
                      <AppleLogo />
                      <Text style={styles.appleButtonText}>Sign in with Apple</Text>
                    </View>
                  </TouchableOpacity>
                )}

                {/* Google Login Button */}
                <TouchableOpacity
                  style={styles.socialButton}
                  onPress={handleGoogleLogin}
                  disabled={isLoading}
                  activeOpacity={0.8}
                >
                  <View style={styles.googleButtonContent}>
                    <GoogleLogo />
                    <Text style={styles.googleButtonText}>Sign in with Google</Text>
                  </View>
                </TouchableOpacity>
              </View>

              {/* Sign Up Link */}
              <View style={styles.signupContainer}>
                <Text style={styles.signupText}>Don't have an account? </Text>
                <TouchableOpacity
                  onPress={() => router.push('/signup')}
                  disabled={isLoading}
                >
                  <Text style={styles.signupLink}>Sign Up</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </ScrollView>
    </KeyboardAvoidingView>
  );
}

function GoogleLogo() {
  return (
    <Svg viewBox="0 0 24 24" width="20" height="20">
      <Path
        fill="#4285F4"
        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
      />
      <Path
        fill="#34A853"
        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
      />
      <Path
        fill="#FBBC05"
        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
      />
      <Path
        fill="#EA4335"
        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
      />
    </Svg>
  );
}

function AppleLogo() {
  return (
    <Svg viewBox="0 0 24 24" width="20" height="20">
      <Path
        fill="#FFFFFF"
        d="M17.05 20.28c-.98.95-2.05.88-3.08.4-1.09-.5-2.08-.48-3.24 0-1.44.62-2.2.44-3.06-.4C2.79 15.25 3.51 7.59 9.05 7.31c1.35.07 2.29.74 3.08.8 1.18-.24 2.31-.93 3.57-.84 1.51.12 2.65.72 3.4 1.8-3.12 1.87-2.38 5.98.48 7.13-.57 1.5-1.31 2.99-2.53 4.08l.01-.01ZM12.03 7.25c-.15-2.23 1.66-4.07 3.74-4.25.29 2.58-2.34 4.5-3.74 4.25Z"
      />
    </Svg>
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
    paddingVertical: spacing[8],
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
    marginBottom: spacing[5],
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
  forgotPassword: {
    alignSelf: 'flex-end',
    marginBottom: spacing[8],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  loginButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[6],
    ...shadows.lg,
  },
  loginButtonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: 48,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.primary,
  },
  backToLogin: {
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  backToLoginText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  divider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  dividerLine: {
    flex: 1,
    height: 1,
    backgroundColor: colors.borderMuted,
  },
  dividerText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginHorizontal: spacing[4],
    fontFamily: typography.fontFamily.bold,
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[8],
  },
  socialButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    borderWidth: 1.5,
    borderColor: colors.borderMuted,
    backgroundColor: colors.card,
    ...shadows.sm,
  },
  appleButtonContent: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  appleButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  googleButtonContent: {
    flexDirection: 'row',
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  googleButtonText: {
    fontSize: typography.fontSize.xs,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  signupContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
  },
  signupText: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  signupLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
});