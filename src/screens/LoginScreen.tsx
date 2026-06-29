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
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowLeft, ArrowRight, Envelope, Phone, ShieldCheck } from 'phosphor-react-native';
import Svg, { Path } from 'react-native-svg';
import { useRouter } from 'expo-router';
import { cognitoDiscovery, COGNITO_REDIRECT_URI, exchangeCognitoCode } from '../lib/api/cognito';
import * as AuthSession from 'expo-auth-session';
import { GoogleSignin } from '@react-native-google-signin/google-signin';
import Constants from 'expo-constants';
import { useAuth } from '../context/AuthContext';
import UnifestoAppWordmark from '../components/UnifestoAppWordmark';
import { spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useTheme } from '../context/ThemeContext';

type LoginStep = 'email' | 'email-otp' | 'mobile' | 'mobile-otp';

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
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const {
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp,
    loginWithGoogle,
    loginWithCognito,
    user,
    token,
    isAuthenticated,
    tempToken: contextTempToken,
  } = useAuth();

  const [step, setStep] = useState<LoginStep>('email');
  const [tempToken, setTempToken] = useState('');

  // When context sets tempToken (new user after email OTP), move to mobile step
  useEffect(() => {
    if (contextTempToken && step === 'email-otp') {
      setStep('mobile');
    }
  }, [contextTempToken]);
  const [email, setEmail] = useState('');
  const [emailOtp, setEmailOtp] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [mobileOtp, setMobileOtp] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [canResend, setCanResend] = useState(false);
  const [resendTimer, setResendTimer] = useState(60);

  const isOtpStep = step === 'email-otp' || step === 'mobile-otp';

  const handleGoogleSignIn = async () => {
    setIsLoading(true);
    setError('');
    await googleCognitoPrompt();
  };

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

  const handleCognitoResponse = async (
    response: AuthSession.AuthSessionResult | null,
    request: AuthSession.AuthRequest | null
  ) => {
    if (response?.type === 'success' && response.params.code) {
      try {
        const idToken = await exchangeCognitoCode(
          response.params.code,
          request?.codeVerifier || ''
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

  useEffect(() => {
    if (user && token && isAuthenticated && user.mobileVerified) {
      router.replace('/(tabs)');
    }
  }, [user, token, isAuthenticated]);

  useEffect(() => {
    if (user && !user.mobileVerified) {
      setStep('mobile');
    }
  }, [user]);

  useEffect(() => {
    if (resendTimer > 0 && isOtpStep) {
      const timer = setTimeout(() => setResendTimer(resendTimer - 1), 1000);
      return () => clearTimeout(timer);
    } else if (resendTimer === 0) {
      setCanResend(true);
    }
  }, [resendTimer, step]);

  useEffect(() => {
    if (googleCognitoResponse) {
      handleCognitoResponse(googleCognitoResponse, googleCognitoRequest);
    }
  }, [googleCognitoResponse]);

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
      // If new user, context sets tempToken — useEffect below detects it and moves to mobile step
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
      await sendMobileOtp('+91' + mobileNumber);
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
      await verifyMobileOtp('+91' + mobileNumber, mobileOtp);
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
        await sendMobileOtp('+91' + mobileNumber);
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
    setError('');
    if (step === 'email-otp') {
      setStep('email');
      setEmailOtp('');
    } else if (step === 'mobile-otp') {
      setStep('mobile');
      setMobileOtp('');
    }
  };

  const headings: Record<LoginStep, { title: string; subtitle: string }> = {
    email: {
      title: '',
      subtitle: '',
    },
    'email-otp': {
      title: 'Check your inbox',
      subtitle: `We sent a 6-digit code to ${email}`,
    },
    mobile: {
      title: 'One last step',
      subtitle: 'Verify your mobile number to secure your account.',
    },
    'mobile-otp': {
      title: 'Verify your number',
      subtitle: `We sent a code via WhatsApp to +91 ${mobileNumber}`,
    },
  };

  const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: colors.background },
    scrollContent: {
      flexGrow: 1,
      paddingHorizontal: spacing[6],
      paddingTop: insets.top + spacing[20],
      paddingBottom: insets.bottom + spacing[8],
    },
    topBar: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: spacing[10],
      marginLeft: -spacing[2],
    },
    backButton: {
      width: 40,
      height: 40,
      borderRadius: 20,
      backgroundColor: colors.card,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      alignItems: 'center',
      justifyContent: 'center',
    },
    heroSection: { marginBottom: spacing[6] },
    title: {
      fontSize: typography.fontSize['2xl'],
      lineHeight: typography.fontSize['2xl'] * 1.2,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      marginBottom: spacing[1],
    },
    subtitle: {
      fontSize: typography.fontSize.base,
      color: colors.textMuted,
      fontFamily: getFontFamily('normal'),
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    },
    errorContainer: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
      backgroundColor: 'rgba(239, 68, 68, 0.1)',
      borderWidth: 1,
      borderColor: 'rgba(239, 68, 68, 0.25)',
      borderRadius: borderRadius.lg,
      paddingVertical: spacing[3],
      paddingHorizontal: spacing[4],
      marginBottom: spacing[5],
    },
    errorText: {
      flex: 1,
      color: '#ef4444',
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('medium'),
    },
    fieldLabel: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 1.2,
      textTransform: 'uppercase',
      marginBottom: spacing[2],
    },
    inputWrapper: {
      flexDirection: 'row',
      alignItems: 'center',
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      paddingHorizontal: spacing[4],
      height: 58,
    },
    emailRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[3],
    },
    emailInputWrapper: { flex: 1 },
    emailSubmitButton: {
      width: 58,
      height: 58,
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      ...shadows.lg,
    },
    emailSubmitGradient: {
      flex: 1,
      alignItems: 'center',
      justifyContent: 'center',
    },
    input: {
      flex: 1,
      fontSize: typography.fontSize.base,
      color: colors.text,
      marginLeft: spacing[3],
      fontFamily: getFontFamily('medium'),
    },
    countryCode: {
      fontSize: typography.fontSize.base,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      marginLeft: spacing[3],
      paddingRight: spacing[3],
      borderRightWidth: 1,
      borderRightColor: colors.borderMuted,
    },
    otpWrapper: {
      backgroundColor: colors.card,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      height: 64,
      justifyContent: 'center',
    },
    otpInput: {
      fontSize: typography.fontSize['3xl'],
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 12,
      textAlign: 'center',
    },
    primaryButton: {
      borderRadius: borderRadius.xl,
      overflow: 'hidden',
      marginTop: spacing[6],
      ...shadows.lg,
    },
    primaryButtonGradient: {
      flexDirection: 'row',
      gap: spacing[2],
      paddingVertical: spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
      height: 56,
    },
    primaryButtonText: {
      fontSize: typography.fontSize.base,
      color: '#FFFFFF',
      fontFamily: getFontFamily('bold'),
    },
    divider: {
      flexDirection: 'row',
      alignItems: 'center',
      marginVertical: spacing[7],
    },
    dividerLine: { flex: 1, height: 1, backgroundColor: colors.borderMuted },
    dividerText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      marginHorizontal: spacing[3],
      fontFamily: getFontFamily('semibold'),
      letterSpacing: 0.5,
    },
    socialColumn: { flexDirection: 'row', gap: spacing[3] },
    socialButton: {
      flex: 1,
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      height: 54,
      borderRadius: borderRadius.xl,
      borderWidth: 1,
      borderColor: colors.borderMuted,
      backgroundColor: colors.card,
    },
    socialButtonText: {
      fontSize: typography.fontSize.sm,
      color: colors.text,
      fontFamily: getFontFamily('semibold'),
    },
    resendRow: {
      flexDirection: 'row',
      justifyContent: 'center',
      alignItems: 'center',
      gap: spacing[1],
      marginTop: spacing[5],
    },
    changeRowTop: {
      flexDirection: 'row',
      justifyContent: 'flex-start',
      alignItems: 'center',
      gap: spacing[1],
      marginTop: -spacing[2],
      marginBottom: spacing[5],
    },
    resendText: { fontSize: typography.fontSize.sm, color: colors.textMuted, fontFamily: getFontFamily('normal') },
    resendLink: { fontSize: typography.fontSize.sm, color: colors.primary, fontFamily: getFontFamily('bold') },
    whatsappNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      marginTop: spacing[4],
    },
    whatsappNoteText: {
      fontSize: typography.fontSize.sm,
      color: colors.textMuted,
      fontFamily: getFontFamily('medium'),
    },
    footer: { flex: 1, justifyContent: 'flex-end' },
    legalText: {
      fontSize: typography.fontSize.xs,
      color: colors.textMuted,
      textAlign: 'center',
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
      marginTop: spacing[8],
    },
    legalLink: { color: colors.primary, fontFamily: getFontFamily('semibold') },
  });

  const renderEmailStep = () => (
    <>
      <View style={styles.emailRow}>
        <View style={[styles.inputWrapper, styles.emailInputWrapper]}>
          <Envelope size={20} color={colors.textMuted} />
          <TextInput
            style={styles.input}
            placeholder="you@example.com"
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
          style={styles.emailSubmitButton}
          onPress={handleSendEmailOtp}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <LinearGradient
            colors={['#3491ff', '#0062ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 0 }}
            style={styles.emailSubmitGradient}
          >
            {isLoading ? (
              <ActivityIndicator color="#FFFFFF" />
            ) : (
              <ArrowRight size={22} color="#FFFFFF"  weight="bold" />
            )}
          </LinearGradient>
        </TouchableOpacity>
      </View>

      <View style={styles.divider}>
        <View style={styles.dividerLine} />
        <Text style={styles.dividerText}>OR CONTINUE WITH</Text>
        <View style={styles.dividerLine} />
      </View>

      <View style={styles.socialColumn}>
        {Platform.OS === 'ios' && (
          <TouchableOpacity
            style={styles.socialButton}
            onPress={handleAppleLogin}
            disabled={isLoading}
            activeOpacity={0.85}
          >
            <AppleLogo />
            <Text style={styles.socialButtonText}>Apple</Text>
          </TouchableOpacity>
        )}
        <TouchableOpacity
          style={styles.socialButton}
          onPress={handleGoogleLogin}
          disabled={isLoading}
          activeOpacity={0.85}
        >
          <GoogleLogo />
          <Text style={styles.socialButtonText}>Google</Text>
        </TouchableOpacity>
      </View>
    </>
  );

  const renderOtpStep = (
    value: string,
    setValue: (v: string) => void,
    onVerify: () => void,
    buttonLabel: string,
    onChangeEmail?: () => void,
    changeLabel: string = 'Change Email'
  ) => (
    <>
      {onChangeEmail ? (
        <View style={styles.changeRowTop}>
          <Text style={styles.resendText}>Not you?</Text>
          <TouchableOpacity onPress={onChangeEmail} activeOpacity={0.7}>
            <Text style={styles.resendLink}>{changeLabel}</Text>
          </TouchableOpacity>
        </View>
      ) : null}

      <View style={styles.otpWrapper}>
        <TextInput
          style={styles.otpInput}
          placeholder="------"
          placeholderTextColor={colors.borderMuted}
          value={value}
          onChangeText={(text) => {
            setValue(text.replace(/\D/g, '').slice(0, 6));
            setError('');
          }}
          keyboardType="number-pad"
          maxLength={6}
          editable={!isLoading}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={onVerify}
        disabled={isLoading || value.length !== 6}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={value.length === 6 ? ['#3491ff', '#0062ff'] : [colors.borderMuted, colors.borderMuted]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>{buttonLabel}</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.resendRow}>
        {canResend ? (
          <TouchableOpacity onPress={handleResendOtp}>
            <Text style={styles.resendLink}>Resend code</Text>
          </TouchableOpacity>
        ) : (
          <>
            <Text style={styles.resendText}>Resend code in</Text>
            <Text style={styles.resendLink}>{resendTimer}s</Text>
          </>
        )}
      </View>
    </>
  );

  const renderMobileStep = () => (
    <>
      <View style={styles.changeRowTop}>
        <Text style={styles.resendText}>Not you?</Text>
        <TouchableOpacity
          onPress={() => {
            setError('');
            setMobileNumber('');
            setStep('email');
          }}
          activeOpacity={0.7}
        >
          <Text style={styles.resendLink}>Change Email</Text>
        </TouchableOpacity>
      </View>
      <View style={styles.inputWrapper}>
        <Phone size={20} color={colors.textMuted} />
        <Text style={styles.countryCode}>+91</Text>
        <TextInput
          style={styles.input}
          placeholder="10-digit number"
          placeholderTextColor={colors.textMuted}
          value={mobileNumber}
          onChangeText={(text) => {
            setMobileNumber(text.replace(/\D/g, ''));
            setError('');
          }}
          keyboardType="phone-pad"
          autoCorrect={false}
          editable={!isLoading}
          maxLength={10}
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={handleSendMobileOtp}
        disabled={isLoading}
        activeOpacity={0.85}
      >
        <LinearGradient
          colors={['#3491ff', '#0062ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.primaryButtonGradient}
        >
          {isLoading ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text style={styles.primaryButtonText}>Send code</Text>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <View style={styles.whatsappNote}>
        <ShieldCheck size={16} color={colors.primary} />
        <Text style={styles.whatsappNoteText}>You'll receive the OTP via WhatsApp</Text>
      </View>
    </>
  );

  const { title, subtitle } = headings[step];

  return (
    <ScrollView
      style={styles.container}
      contentContainerStyle={styles.scrollContent}
      showsVerticalScrollIndicator={false}
      keyboardShouldPersistTaps="handled"
      keyboardDismissMode="on-drag"
      automaticallyAdjustKeyboardInsets
    >
      <View style={styles.topBar}>
        <UnifestoAppWordmark width={168} height={52} />
      </View>

      {(title || subtitle) ? (
        <View style={styles.heroSection}>
          {title ? <Text style={styles.title}>{title}</Text> : null}
          {subtitle ? <Text style={styles.subtitle}>{subtitle}</Text> : null}
        </View>
      ) : null}

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      {step === 'email' && renderEmailStep()}
      {step === 'email-otp' &&
        renderOtpStep(emailOtp, setEmailOtp, handleVerifyEmailOtp, 'Verify & Continue', () => {
          setError('');
          setEmailOtp('');
          setStep('email');
        })}
      {step === 'mobile' && renderMobileStep()}
      {step === 'mobile-otp' &&
        renderOtpStep(
          mobileOtp,
          setMobileOtp,
          handleVerifyMobileOtp,
          'Verify & Login',
          () => {
            setError('');
            setMobileOtp('');
            setStep('mobile');
          },
          'Change Number'
        )}

      <View style={styles.footer}>
        <Text style={styles.legalText}>
          By continuing, you agree to our{' '}
          <Text style={styles.legalLink} onPress={() => Linking.openURL('https://unifesto.app/terms')}>
            Terms of Service
          </Text>{' '}
          and{' '}
          <Text style={styles.legalLink} onPress={() => Linking.openURL('https://unifesto.app/privacy')}>
            Privacy Policy
          </Text>
        </Text>
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
