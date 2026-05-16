import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Modal,
  ActivityIndicator,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Dimensions,
  PanResponder,
  Linking,
} from 'react-native';
import { BlurView } from 'expo-blur';
import { LinearGradient } from 'expo-linear-gradient';
import { Eye, EyeOff, Mail, Lock, X } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import GradientText from './GradientText';
import GlassyButton from './GlassyButton';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');

interface LoginModalProps {
  visible: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function LoginModal({ visible, onClose, onSuccess }: LoginModalProps) {
  const { signIn, signInWithGoogle, signInWithApple, resetPassword, isConfigured, isAppleAuthAvailable, user, session } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [slideAnim] = useState(new Animated.Value(SCREEN_HEIGHT));

  // Pan responder for swipe down to close
  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        // Only respond to vertical swipes
        return Math.abs(gestureState.dy) > Math.abs(gestureState.dx) && gestureState.dy > 0;
      },
      onPanResponderMove: (_, gestureState) => {
        if (gestureState.dy > 0) {
          slideAnim.setValue(gestureState.dy);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy > 100 || gestureState.vy > 0.5) {
          // Swipe down threshold met, close modal
          handleClose();
        } else {
          // Snap back to position
          Animated.spring(slideAnim, {
            toValue: 0,
            useNativeDriver: true,
            tension: 65,
            friction: 11,
          }).start();
        }
      },
    })
  ).current;

  // Listen for auth state changes and close modal when logged in
  useEffect(() => {
    if (user && session && visible) {
      handleClose();
      onSuccess?.();
    }
  }, [user, session, visible]);

  // Animate modal in/out
  useEffect(() => {
    if (visible) {
      Animated.spring(slideAnim, {
        toValue: 0,
        useNativeDriver: true,
        tension: 65,
        friction: 11,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: SCREEN_HEIGHT,
        duration: 250,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handleClose = () => {
    setEmail('');
    setPassword('');
    setError('');
    setShowEmailForm(false);
    setShowForgotPassword(false);
    setShowPassword(false);
    onClose();
  };

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
      handleClose();
      onSuccess?.();
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
        if (appleError.message && appleError.message.includes('1000')) {
          setError('Apple Sign In is not configured yet. Please use email or Google sign in.');
        } else {
          setError(appleError.message || 'Apple login failed. Please try again.');
        }
      }
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
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={handleClose}
    >
      <View style={styles.overlay}>
        <TouchableOpacity
          style={styles.backdrop}
          activeOpacity={1}
          onPress={handleClose}
        />

        <Animated.View
          style={[
            styles.modalContainer,
            {
              transform: [{ translateY: slideAnim }],
            },
          ]}
          {...panResponder.panHandlers}
        >
          {/* Liquid Glass Effect */}
          {Platform.OS === 'ios' ? (
            <BlurView intensity={80} tint="dark" style={styles.blurContainer}>
              <LinearGradient
                colors={['rgba(0, 0, 0, 0)', 'rgba(0, 0, 0, 0)']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                style={styles.glassGradient}
              >
                <KeyboardAvoidingView
                  behavior="padding"
                  style={styles.keyboardView}
                >
                  <View style={styles.contentContainer}>
                    {/* Handle Bar */}
                    <View style={styles.handleBar} />

                    {/* Logo */}
                    <View style={styles.logoContainer}>
                      <GradientText style={styles.logoText}>unifesto</GradientText>
                    </View>

                    {/* Header */}
                    <View style={styles.header}>
                      <Text style={styles.title}>Welcome Back</Text>
                      <Text style={styles.subtitle}>Sign in to continue</Text>
                    </View>

                    {/* Error Message */}
                    {error ? (
                      <View style={styles.errorContainer}>
                        <Text style={styles.errorText}>{error}</Text>
                      </View>
                    ) : null}

                    {/* Social Login Buttons */}
                    {!showEmailForm && !showForgotPassword && (
                      <View style={styles.socialButtonsContainer}>
                        {/* Continue with Email Button */}
                        <TouchableOpacity
                          style={styles.emailButton}
                          onPress={() => setShowEmailForm(true)}
                          disabled={isLoading}
                          activeOpacity={0.8}
                        >
                          <View style={styles.emailButtonContent}>
                            <Mail size={20} color={colors.text} strokeWidth={2} />
                            <Text style={styles.emailButtonText}>Continue with Email</Text>
                          </View>
                        </TouchableOpacity>

                        {/* Apple and Google Buttons Row */}
                        <View style={styles.socialButtonsRow}>
                          {/* Apple Sign In Button (iOS only) */}
                          {isAppleAuthAvailable && (
                            <TouchableOpacity
                              style={styles.socialButton}
                              onPress={handleAppleLogin}
                              disabled={isLoading}
                              activeOpacity={0.8}
                            >
                              <View style={styles.socialButtonContent}>
                                <AppleLogo />
                                <Text style={styles.socialButtonText}>Apple</Text>
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
                            <View style={styles.socialButtonContent}>
                              <GoogleLogo />
                              <Text style={styles.socialButtonText}>Google</Text>
                            </View>
                          </TouchableOpacity>
                        </View>
                      </View>
                    )}

                    {/* Login Form (shown when email is clicked or forgot password) */}
                    {(showEmailForm || showForgotPassword) && (
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
                              <GlassyButton
                                size={36}
                                onPress={() => setShowPassword(!showPassword)}
                                disabled={isLoading}
                                variant="dark"
                              >
                                {showPassword
                                  ? <EyeOff size={16} color={colors.textMuted} strokeWidth={2} />
                                  : <Eye size={16} color={colors.textMuted} strokeWidth={2} />}
                              </GlassyButton>
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

                        {/* Back to Options */}
                        {!showForgotPassword && (
                          <TouchableOpacity
                            style={styles.backToLogin}
                            onPress={() => {
                              setShowEmailForm(false);
                              setError('');
                            }}
                            disabled={isLoading}
                          >
                            <Text style={styles.backToLoginText}>Back to Options</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    )}

                    {/* Privacy and Terms */}
                    <View style={styles.footer}>
                      <Text style={styles.footerText}>
                        By continuing, you agree to our{' '}
                        <TouchableOpacity onPress={() => Linking.openURL('https://unifesto.app/terms')}>
                          <Text style={styles.footerLink}>Terms of Service</Text>
                        </TouchableOpacity>
                        {' '}and{' '}
                        <TouchableOpacity onPress={() => Linking.openURL('https://unifesto.app/privacy')}>
                          <Text style={styles.footerLink}>Privacy Policy</Text>
                        </TouchableOpacity>
                      </Text>
                    </View>
                  </View>
                </KeyboardAvoidingView>
              </LinearGradient>
            </BlurView>
          ) : (
            <View style={[styles.blurContainer, styles.androidBlurFallback]}>
              <KeyboardAvoidingView
                behavior="height"
                style={styles.keyboardView}
              >
                <View style={styles.contentContainer}>
                  {/* Handle Bar */}
                  <View style={styles.handleBar} />

                  {/* Logo */}
                  <View style={styles.logoContainer}>
                    <GradientText style={styles.logoText}>unifesto</GradientText>
                  </View>

                  {/* Header */}
                  <View style={styles.header}>
                    <Text style={styles.title}>Welcome Back</Text>
                    <Text style={styles.subtitle}>Sign in to continue</Text>
                  </View>

                  {/* Error Message */}
                  {error ? (
                    <View style={styles.errorContainer}>
                      <Text style={styles.errorText}>{error}</Text>
                    </View>
                  ) : null}

                  {/* Social Login Buttons */}
                  {!showEmailForm && !showForgotPassword && (
                    <View style={styles.socialButtonsContainer}>
                      <TouchableOpacity
                        style={styles.emailButton}
                        onPress={() => setShowEmailForm(true)}
                        disabled={isLoading}
                        activeOpacity={0.8}
                      >
                        <View style={styles.emailButtonContent}>
                          <Mail size={20} color={colors.text} strokeWidth={2} />
                          <Text style={styles.emailButtonText}>Continue with Email</Text>
                        </View>
                      </TouchableOpacity>
                      <View style={styles.socialButtonsRow}>
                        {isAppleAuthAvailable && (
                          <TouchableOpacity
                            style={styles.socialButton}
                            onPress={handleAppleLogin}
                            disabled={isLoading}
                            activeOpacity={0.8}
                          >
                            <View style={styles.socialButtonContent}>
                              <AppleLogo />
                              <Text style={styles.socialButtonText}>Apple</Text>
                            </View>
                          </TouchableOpacity>
                        )}
                        <TouchableOpacity
                          style={styles.socialButton}
                          onPress={handleGoogleLogin}
                          disabled={isLoading}
                          activeOpacity={0.8}
                        >
                          <View style={styles.socialButtonContent}>
                            <GoogleLogo />
                            <Text style={styles.socialButtonText}>Google</Text>
                          </View>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Login Form */}
                  {(showEmailForm || showForgotPassword) && (
                    <View style={styles.formContainer}>
                      <View style={styles.inputContainer}>
                        <View style={styles.inputWrapper}>
                          <Mail size={20} color={colors.textMuted} strokeWidth={2} />
                          <TextInput
                            style={styles.input}
                            placeholder="Email address"
                            placeholderTextColor={colors.textMuted}
                            value={email}
                            onChangeText={(text) => { setEmail(text); setError(''); }}
                            keyboardType="email-address"
                            autoCapitalize="none"
                            autoCorrect={false}
                            editable={!isLoading}
                          />
                        </View>
                      </View>
                      {!showForgotPassword && (
                        <View style={styles.inputContainer}>
                          <View style={styles.inputWrapper}>
                            <Lock size={20} color={colors.textMuted} strokeWidth={2} />
                            <TextInput
                              style={[styles.input, styles.passwordInput]}
                              placeholder="Password"
                              placeholderTextColor={colors.textMuted}
                              value={password}
                              onChangeText={(text) => { setPassword(text); setError(''); }}
                              secureTextEntry={!showPassword}
                              autoCapitalize="none"
                              autoCorrect={false}
                              editable={!isLoading}
                            />
                            <GlassyButton
                              size={36}
                              onPress={() => setShowPassword(!showPassword)}
                              disabled={isLoading}
                              variant="dark"
                            >
                              {showPassword
                                ? <EyeOff size={16} color={colors.textMuted} strokeWidth={2} />
                                : <Eye size={16} color={colors.textMuted} strokeWidth={2} />}
                            </GlassyButton>
                          </View>
                        </View>
                      )}
                      {!showForgotPassword && (
                        <TouchableOpacity style={styles.forgotPassword} onPress={() => setShowForgotPassword(true)} disabled={isLoading}>
                          <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
                        </TouchableOpacity>
                      )}
                      <TouchableOpacity style={styles.loginButton} onPress={showForgotPassword ? handleForgotPassword : handleLogin} disabled={isLoading} activeOpacity={0.8}>
                        <LinearGradient colors={['#3491ff', '#0062ff']} start={{ x: 0, y: 0 }} end={{ x: 1, y: 0 }} style={styles.loginButtonGradient}>
                          {isLoading ? <ActivityIndicator color="#FFFFFF" /> : <Text style={styles.loginButtonText}>{showForgotPassword ? 'Send Reset Link' : 'Sign In'}</Text>}
                        </LinearGradient>
                      </TouchableOpacity>
                      {showForgotPassword && (
                        <TouchableOpacity style={styles.backToLogin} onPress={() => { setShowForgotPassword(false); setError(''); }} disabled={isLoading}>
                          <Text style={styles.backToLoginText}>Back to Sign In</Text>
                        </TouchableOpacity>
                      )}
                      {!showForgotPassword && (
                        <TouchableOpacity style={styles.backToLogin} onPress={() => { setShowEmailForm(false); setError(''); }} disabled={isLoading}>
                          <Text style={styles.backToLoginText}>Back to Options</Text>
                        </TouchableOpacity>
                      )}
                    </View>
                  )}

                  {/* Footer */}
                  <View style={styles.footer}>
                    <Text style={styles.footerText}>
                      By continuing, you agree to our{' '}
                      <TouchableOpacity onPress={() => Linking.openURL('https://unifesto.app/terms')}>
                        <Text style={styles.footerLink}>Terms of Service</Text>
                      </TouchableOpacity>
                      {' '}and{' '}
                      <TouchableOpacity onPress={() => Linking.openURL('https://unifesto.app/privacy')}>
                        <Text style={styles.footerLink}>Privacy Policy</Text>
                      </TouchableOpacity>
                    </Text>
                  </View>
                </View>
              </KeyboardAvoidingView>
            </View>
          )}
        </Animated.View>
      </View>
    </Modal>
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
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
    padding: spacing[4],
    paddingBottom: spacing[6],
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
  },
  modalContainer: {
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
  },
  blurContainer: {
    borderRadius: borderRadius['3xl'],
    overflow: 'hidden',
  },
  androidBlurFallback: {
    backgroundColor: 'rgba(12, 12, 18, 0.97)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.08)',
  },
  glassGradient: {
    borderRadius: borderRadius['3xl'],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
  },
  keyboardView: {
  },
  contentContainer: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[2],
    paddingBottom: Platform.OS === 'android' ? spacing[4] : spacing[8],
  },
  handleBar: {
    width: 40,
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    alignSelf: 'center',
    marginTop: Platform.OS === 'android' ? spacing[2] : spacing[3],
    marginBottom: Platform.OS === 'android' ? spacing[2] : spacing[4],
  },
  closeButton: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    zIndex: 10,
  },
  closeButtonBlur: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
  },
  logoContainer: {
    alignItems: 'flex-start',
    marginTop: Platform.OS === 'android' ? spacing[2] : spacing[5],
    marginBottom: Platform.OS === 'android' ? spacing[2] : spacing[4],
  },
  logoText: {
    fontSize: typography.fontSize['4xl'],
    paddingLeft: spacing[2],
    fontFamily: typography.fontFamily.logo,
  },
  header: {
    alignItems: 'flex-start',
    marginBottom: Platform.OS === 'android' ? spacing[4] : spacing[8],
  },
  title: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[2],
  },
  subtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  errorContainer: {
    backgroundColor: 'rgba(239, 68, 68, 0.15)',
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.3)',
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    marginBottom: spacing[6],
  },
  errorText: {
    color: '#ef4444',
    fontSize: typography.fontSize.sm,
    textAlign: 'center',
  },
  socialButtonsContainer: {
    width: '100%',
    marginBottom: Platform.OS === 'android' ? spacing[3] : spacing[6],
  },
  emailButton: {
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    marginBottom: spacing[3],
  },
  emailButtonContent: {
    flexDirection: 'row',
    paddingVertical: Platform.OS === 'android' ? spacing[3] : spacing[4],
    paddingHorizontal: spacing[4],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[3],
  },
  emailButtonText: {
    fontSize: typography.fontSize.base,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  socialButtonsRow: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  socialButton: {
    flex: 1,
    borderRadius: borderRadius.xl,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
  },
  socialButtonContent: {
    flexDirection: 'row',
    paddingVertical: Platform.OS === 'android' ? spacing[3] : spacing[4],
    paddingHorizontal: spacing[3],
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
  },
  socialButtonText: {
    fontSize: typography.fontSize.sm,
    color: colors.text,
    fontFamily: typography.fontFamily.bold,
  },
  footer: {
    marginTop: 'auto',
    paddingTop: spacing[2],
    alignItems: 'center',
  },
  footerText: {
    fontSize: 10,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: 14,
  },
  footerLink: {
    fontSize: 10,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  formContainer: {
    width: '100%',
  },
  inputContainer: {
    marginBottom: Platform.OS === 'android' ? spacing[2] : spacing[4],
  },
  inputWrapper: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    borderRadius: borderRadius.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)',
    paddingHorizontal: spacing[4],
    paddingVertical: Platform.OS === 'android' ? spacing[2] : spacing[4],
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
    marginBottom: Platform.OS === 'android' ? spacing[3] : spacing[6],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
  loginButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    marginBottom: spacing[4],
    ...shadows.lg,
  },
  loginButtonGradient: {
    paddingVertical: Platform.OS === 'android' ? spacing[3] : spacing[4],
    paddingHorizontal: spacing[6],
    alignItems: 'center',
    justifyContent: 'center',
    minHeight: Platform.OS === 'android' ? 40 : 48,
  },
  loginButtonText: {
    fontSize: typography.fontSize.base,
    color: '#FFFFFF',
    fontFamily: typography.fontFamily.primary,
  },
  backToLogin: {
    alignItems: 'center',
    marginBottom: Platform.OS === 'android' ? spacing[2] : spacing[4],
  },
  backToLoginText: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: typography.fontFamily.bold,
  },
});
