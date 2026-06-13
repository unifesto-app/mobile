import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  Alert,
  Platform,
  ScrollView,
  ActivityIndicator,
  Image,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { Mail, Phone, ChevronRight } from 'lucide-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import * as AppleAuthentication from 'expo-apple-authentication';
import { cognitoDiscovery, COGNITO_REDIRECT_URI, exchangeCognitoCode } from '../lib/api/cognito';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin, statusCodes } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import PasscodeInput from '../components/PasscodeInput';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';


type LoginStep = 'email' | 'email-otp' | 'mobile' | 'mobile-otp';

// Google OAuth configuration
const GOOGLE_WEB_CLIENT_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID || 
  process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID;

const GOOGLE_IOS_CLIENT_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID || 
  process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID;

const GOOGLE_ANDROID_CLIENT_ID = Constants.expoConfig?.extra?.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID || 
  process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID;


GoogleSignin.configure({
  webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
  offlineAccess: false,
});

export default function NewLoginScreen() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollContainer: {
    flexGrow: 1,
    paddingHorizontal: spacing[6],
    paddingTop: Platform.OS === 'ios' ? spacing[20] : spacing[16],
    paddingBottom: spacing[8],
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
    marginBottom: spacing[4],
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
  imageContainer: {
    alignItems: 'center',
    marginBottom: spacing[8],
  },
  loginImage: {
    width: 400,
    height: 400,
  },
  emailInputRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[5],
  },
  emailInputWrapper: {
    flex: 1,
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
  emailInput: {
    flex: 1,
    fontSize: typography.fontSize.base,
    color: colors.text,
    marginLeft: spacing[3],
    fontFamily: typography.fontFamily.primary,
  },
  sendOtpButton: {
    borderRadius: borderRadius.xl,
    overflow: 'hidden',
    ...shadows.lg,
    width: 48,
    height: 48,
  },
  sendOtpButtonGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
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
  otpInstructions: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  otpEmail: {
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  passcodeContainer: {
    marginBottom: spacing[8],
  },
  resendContainer: {
    alignItems: 'center',
    marginTop: spacing[4],
  },
  resendText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
  },
  resendLink: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    fontFamily: getFontFamily('bold'),
  },
  whatsappNote: {
    fontSize: typography.fontSize.sm,
    color: colors.primary,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  forgotPasswordContainer: {
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  forgotPasswordText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  legalSection: {
    marginTop: spacing[6],
    paddingHorizontal: spacing[2],
  },
  legalText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  legalLink: {
    color: colors.primary,
    fontFamily: getFontFamily('semibold'),
  },
});

  const router = useRouter();
  const {
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp,
    loginWithGoogle,
    loginWithApple,
    loginWithCognito,
    user,
    token,
    isAuthenticated,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>('email');
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);


  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    await googleCognitoPrompt();
  };

  const handleGoogleAuthSuccess = async (idToken: string) => {
    try {
      setIsLoading(true);
      await loginWithGoogle(idToken);
      // Navigation handled by auth context
    } catch (err: any) {
      setError(err.message || 'Google login failed');
    } finally {
      setIsLoading(false);
    }
  };



  // Cognito Google auth request
  const [googleCognitoRequest, googleCognitoResponse, googleCognitoPrompt] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
      scopes: ['openid', 'email', 'profile', 'phone'],
      redirectUri: COGNITO_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { identity_provider: 'Google' },
    },
    cognitoDiscovery
  );

  // Cognito Apple auth request  
  const [appleCognitoRequest, appleCognitoResponse, appleCognitoPrompt] = AuthSession.useAuthRequest(
    {
      clientId: process.env.EXPO_PUBLIC_COGNITO_CLIENT_ID || '',
      scopes: ['openid', 'email', 'profile'],
      redirectUri: COGNITO_REDIRECT_URI,
      responseType: AuthSession.ResponseType.Code,
      usePKCE: true,
      extraParams: { identity_provider: 'SignInWithApple' },
    },
    cognitoDiscovery
  );

  // Handle Cognito Google response
  const handleCognitoResponse = async (response: AuthSession.AuthSessionResult | null, request: AuthSession.AuthRequest | null) => {
    if (response?.type === 'success' && response.params.code) {
      try {
        const idToken = await exchangeCognitoCode(
          response.params.code,
          request?.codeVerifier || '',
        );
        await loginWithCognito(idToken);
      } catch (err: any) {
        setError(err.message || 'Sign-in failed');
      } finally {
        setIsLoading(false);
      }
    } else if (response?.type === 'error') {
      setError(response.error?.message || 'Sign-in failed');
      setIsLoading(false);
    } else {
      setIsLoading(false);
    }
  };

  // Navigate when fully authenticated
  useEffect(() => {
    if (user && token && isAuthenticated && user.mobileVerified) {
      router.replace('/(tabs)');
    }
  }, [user, token, isAuthenticated]);

  // Handle mobile verification requirement
  useEffect(() => {
    if (user && !user.mobileVerified) {
      setStep('mobile');
    }
  }, [user]);

  // Resend timer
  useEffect(() => {
    if (resendTimer > 0 && (step === 'email-otp' || step === 'mobile-otp')) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, step]);

  // Handle Cognito Google response
  useEffect(() => {
    if (googleCognitoResponse) {
      handleCognitoResponse(googleCognitoResponse, googleCognitoRequest);
    }
  }, [googleCognitoResponse]);

  // Handle Cognito Apple response
  useEffect(() => {
    if (appleCognitoResponse) {
      handleCognitoResponse(appleCognitoResponse, appleCognitoRequest);
    }
  }, [appleCognitoResponse]);

    const handleSendEmailOtp = async () => {
    if (!email) {
      setError('Please enter your email address');
      return;
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      setError('Please enter a valid email address');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await sendEmailOtp(email);
      setStep('email-otp');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyEmailOtp = async () => {
    if (emailOtp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      await verifyEmailOtp(email, emailOtp);
      // If mobile verification is required, context will update and useEffect will handle navigation
      // Otherwise, user will be logged in and navigated to tabs
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMobileOtp = async () => {
    if (!mobileNumber) {
      setError('Please enter your mobile number');
      return;
    }

    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(mobileNumber)) {
      setError('Please enter a valid 10-digit mobile number');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneWithPrefix = '+91' + mobileNumber;
      await sendMobileOtp(phoneWithPrefix);
      setStep('mobile-otp');
      setResendTimer(60);
      setCanResend(false);
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifyMobileOtp = async () => {
    if (mobileOtp.length !== 6) {
      setError('Please enter the 6-digit OTP');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const phoneWithPrefix = '+91' + mobileNumber;
      await verifyMobileOtp(phoneWithPrefix, mobileOtp);
      // User will be fully authenticated and navigated to tabs
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (!canResend) return;

    setCanResend(false);
    setResendTimer(60);
    setError('');

    try {
      if (step === 'email-otp') {
        await sendEmailOtp(email);
        Alert.alert('Success', 'OTP sent to your email');
      } else if (step === 'mobile-otp') {
        const phoneWithPrefix = '+91' + mobileNumber;
        await sendMobileOtp(phoneWithPrefix);
        Alert.alert('Success', 'OTP sent via WhatsApp');
      }
    } catch (err: any) {
      setError(err.message || 'Failed to resend OTP');
      setCanResend(true);
    }
  };

  const handleGoogleLogin = async () => {
    setIsLoading(true);
    setError('');

    try {
      // Check if Google client ID is configured
      if (!GOOGLE_WEB_CLIENT_ID && !GOOGLE_IOS_CLIENT_ID && !GOOGLE_ANDROID_CLIENT_ID) {
        throw new Error('Google Sign-In is not configured. Please add Google Client IDs to your .env file.');
      }

      await handleGoogleSignIn();
    } catch (err: any) {
      setError(err.message || 'Google login failed');
      setIsLoading(false);
    }
  };

  const handleAppleLogin = async () => {
    setIsLoading(true);
    setError('');
    await appleCognitoPrompt();
  };


  const handleBack = () => {
    if (step === 'email-otp') {
      setStep('email');
      setEmailOtp('');
      setError('');
    } else if (step === 'mobile') {
      // Can't go back from mobile verification
      Alert.alert(
        'Mobile Verification Required',
        'You need to verify your mobile number to complete the login process.'
      );
    } else if (step === 'mobile-otp') {
      setStep('mobile');
      setMobileOtp('');
      setError('');
    }
  };

  const renderEmailStep = () => (
    <>
      <View style={styles.emailInputRow}>
        <View style={styles.emailInputWrapper}>
          <Mail size={20} color={colors.textMuted} strokeWidth={2} />
          <TextInput
            style={styles.emailInput}
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

        <TouchableOpacity
          style={styles.sendOtpButton}
          onPress={handleSendEmailOtp}
          disabled={isLoading}
          activeOpacity={0.8}
        >
          <LinearGradient
            colors={['#3491ff', '#0062ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.sendOtpButtonGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" size="small" />
            ) : (
              <ChevronRight size={20} color="#FFFFFF" strokeWidth={3} />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.forgotPasswordContainer}>
        <Text style={styles.forgotPasswordText}>
          Don't have an account? We'll create one for you!
        </Text>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>or continue with</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialButtonsContainer}>
        {Platform.OS === 'ios' && (
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

      {/* Terms and Privacy */}
      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </>
  );

  const renderEmailOtpStep = () => (
    <>
      <Text style={styles.otpInstructions}>
        We've sent a 6-digit code to{'\n'}
        <Text style={styles.otpEmail}>{email}</Text>
      </Text>

      <View style={styles.passcodeContainer}>
        <PasscodeInput
          length={6}
          value={emailOtp}
          onChangeText={(text) => {
            setEmailOtp(text);
            setError('');
          }}
          onComplete={(text) => setEmailOtp(text)}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleVerifyEmailOtp}
        disabled={isLoading || emailOtp.length !== 6}
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
            <Text style={styles.loginButtonText}>Verify & Continue</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendText}>
            Resend OTP in {resendTimer}s
          </Text>
        )}
      </View>

      {/* Terms and Privacy */}
      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </>
  );

  const renderMobileStep = () => (
    <>
      <Text style={styles.otpInstructions}>
        To complete your login, please verify your mobile number
      </Text>

      <View style={styles.inputContainer}>
        <View style={styles.inputWrapper}>
          <Phone size={20} color={colors.textMuted} strokeWidth={2} />
          <Text style={styles.countryCode}>+91</Text>
          <TextInput
            style={styles.input}
            placeholder="Mobile Number"
            placeholderTextColor={colors.textMuted}
            value={mobileNumber}
            onChangeText={(text) => {
              const cleaned = text.replace(/\D/g, '');
              setMobileNumber(cleaned);
              setError('');
            }}
            keyboardType="phone-pad"
            autoCorrect={false}
            editable={!isLoading}
            maxLength={10}
          />
        </View>
      </View>

      <Text style={styles.whatsappNote}>
        📱 You'll receive the OTP via WhatsApp
      </Text>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleSendMobileOtp}
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
            <Text style={styles.loginButtonText}>Send OTP</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      {/* Terms and Privacy */}
      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </>
  );

  const renderMobileOtpStep = () => (
    <>
      <Text style={styles.otpInstructions}>
        We've sent a 6-digit code via WhatsApp to{'\n'}
        <Text style={styles.otpEmail}>+91 {mobileNumber}</Text>
      </Text>

      <View style={styles.passcodeContainer}>
        <PasscodeInput
          length={6}
          value={mobileOtp}
          onChangeText={(text) => {
            setMobileOtp(text);
            setError('');
          }}
          onComplete={(text) => setMobileOtp(text)}
          disabled={isLoading}
        />
      </View>

      <TouchableOpacity
        style={styles.loginButton}
        onPress={handleVerifyMobileOtp}
        disabled={isLoading || mobileOtp.length !== 6}
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
            <Text style={styles.loginButtonText}>Verify & Login</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.resendContainer}>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendLink}>Resend OTP</Text>
          </TouchableOpacity>
        ) : (
          <Text style={styles.resendText}>
            Resend OTP in {resendTimer}s
          </Text>
        )}
      </View>

      {/* Terms and Privacy */}
      <View style={styles.legalSection}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/terms')}
          >
            Terms of Service
          </Text>
          {' '}and{' '}
          <Text
            style={styles.legalLink}
            onPress={() => Linking.openURL('https://unifesto.app/privacy')}
          >
            Privacy Policy
          </Text>
        </Text>
      </View>
    </>
  );

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContainer}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets={true}
    >
      <View style={styles.imageContainer}>
        <Image
          source={require('../../assets/login-design.png')}
          style={styles.loginImage}
          resizeMode="contain"
        />
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <View style={styles.formContainer}>
        {step === 'email' && renderEmailStep()}
        {step === 'email-otp' && renderEmailOtpStep()}
        {step === 'mobile' && renderMobileStep()}
        {step === 'mobile-otp' && renderMobileOtpStep()}
      </View>
    </ScrollView>
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

