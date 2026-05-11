import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ChevronLeft, Mail, Lock, CheckCircle } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { useAuth } from '../context/AuthContext';
import PasscodeInput from '../components/PasscodeInput';
import {
  requestWalletOtp,
  verifyWalletOtp,
  setWalletPasscode,
} from '../lib/api/wallet';

type Step = 'request-otp' | 'enter-otp' | 'set-passcode' | 'confirm-passcode' | 'success';

export default function ChangeWalletPasscodeScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { user } = useAuth();
  
  const hasExistingPasscode = route.params?.hasExistingPasscode || false;

  const [step, setStep] = useState<Step>('request-otp');
  const [loading, setLoading] = useState(false);
  const [otpToken, setOtpToken] = useState('');
  const [otpValue, setOtpValue] = useState('');
  const [newPasscode, setNewPasscode] = useState('');
  const [confirmPasscode, setConfirmPasscode] = useState('');
  const [error, setError] = useState('');

  const handleRequestOtp = async () => {
    if (!user?.email) {
      Alert.alert('Error', 'Email not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await requestWalletOtp(user.email);
      setStep('enter-otp');
      Alert.alert(
        'OTP Sent',
        `A 6-digit verification code has been sent to ${user.email}`
      );
    } catch (err: any) {
      setError(err.message || 'Failed to send OTP');
      Alert.alert('Error', err.message || 'Failed to send OTP');
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (otp: string) => {
    if (!user?.email) {
      Alert.alert('Error', 'Email not found. Please log in again.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await verifyWalletOtp(user.email, otp);
      setOtpToken(response.token); // Backend returns 'token'
      setOtpValue(''); // Clear OTP value
      setStep('set-passcode');
    } catch (err: any) {
      setError(err.message || 'Invalid OTP');
      Alert.alert('Error', err.message || 'Invalid OTP. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleSetPasscode = (passcode: string) => {
    if (passcode.length < 4 || passcode.length > 6) {
      setError('Passcode must be 4-6 digits');
      return;
    }
    setNewPasscode(passcode);
    setStep('confirm-passcode');
    setError('');
  };

  const handleConfirmPasscode = async (confirmedPasscode: string) => {
    if (confirmedPasscode !== newPasscode) {
      setError('Passcodes do not match');
      Alert.alert('Error', 'Passcodes do not match. Please try again.');
      setConfirmPasscode('');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await setWalletPasscode(newPasscode, otpToken);
      setStep('success');
    } catch (err: any) {
      setError(err.message || 'Failed to set passcode');
      Alert.alert('Error', err.message || 'Failed to set passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleFinish = () => {
    // Navigate back and trigger refresh
    navigation.navigate('Settings', { refresh: Date.now() });
  };

  const renderStepContent = () => {
    switch (step) {
      case 'request-otp':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Mail size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>
              {hasExistingPasscode ? 'Change Wallet Passcode' : 'Set Wallet Passcode'}
            </Text>
            <Text style={styles.stepDescription}>
              We'll send a verification code to your email address to confirm it's you.
            </Text>
            <View style={styles.emailBox}>
              <Text style={styles.emailText}>{user?.email}</Text>
            </View>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={handleRequestOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Send Verification Code</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'enter-otp':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Mail size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Enter Verification Code</Text>
            <Text style={styles.stepDescription}>
              Enter the 6-digit code sent to {user?.email}
            </Text>
            <View style={styles.passcodeContainer}>
              <PasscodeInput
                key="otp-input"
                length={6}
                value={otpValue}
                onComplete={handleVerifyOtp}
                onChangeText={setOtpValue}
                error={!!error}
                disabled={loading}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={handleRequestOtp}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Resend Code</Text>
            </TouchableOpacity>
          </View>
        );

      case 'set-passcode':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Lock size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Create Your Passcode</Text>
            <Text style={styles.stepDescription}>
              Enter a 4-6 digit passcode to secure your wallet
            </Text>
            <View style={styles.passcodeContainer}>
              <PasscodeInput
                key="set-passcode-input"
                length={6}
                value={newPasscode}
                onComplete={(passcode) => {
                  // Auto-submit when 6 digits entered
                  handleSetPasscode(passcode);
                }}
                onChangeText={(text) => {
                  setNewPasscode(text);
                  setError('');
                }}
                error={!!error}
                disabled={loading}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <Text style={styles.hintText}>
              Enter 4-6 digits. Tap Continue when done.
            </Text>
            <TouchableOpacity
              style={[styles.primaryButton, loading && styles.buttonDisabled]}
              onPress={() => handleSetPasscode(newPasscode)}
              disabled={loading || newPasscode.length < 4}
              activeOpacity={0.7}
            >
              {loading ? (
                <ActivityIndicator color="#ffffff" />
              ) : (
                <Text style={styles.primaryButtonText}>Continue</Text>
              )}
            </TouchableOpacity>
          </View>
        );

      case 'confirm-passcode':
        return (
          <View style={styles.stepContainer}>
            <View style={styles.iconContainer}>
              <Lock size={48} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Confirm Your Passcode</Text>
            <Text style={styles.stepDescription}>
              Enter your {newPasscode.length}-digit passcode again to confirm
            </Text>
            <View style={styles.passcodeContainer}>
              <PasscodeInput
                key={`confirm-passcode-input-${newPasscode.length}`}
                length={newPasscode.length}
                value={confirmPasscode}
                onComplete={handleConfirmPasscode}
                onChangeText={(text) => {
                  setConfirmPasscode(text);
                  setError('');
                }}
                error={!!error}
                disabled={loading}
                autoFocus
              />
            </View>
            {error && <Text style={styles.errorText}>{error}</Text>}
            <TouchableOpacity
              style={styles.secondaryButton}
              onPress={() => {
                setStep('set-passcode');
                setNewPasscode('');
                setConfirmPasscode('');
                setError('');
              }}
              disabled={loading}
              activeOpacity={0.7}
            >
              <Text style={styles.secondaryButtonText}>Start Over</Text>
            </TouchableOpacity>
          </View>
        );

      case 'success':
        return (
          <View style={styles.stepContainer}>
            <View style={[styles.iconContainer, styles.successIconContainer]}>
              <CheckCircle size={64} color="#10b981" strokeWidth={2} />
            </View>
            <Text style={styles.stepTitle}>Success!</Text>
            <Text style={styles.stepDescription}>
              Your wallet passcode has been {hasExistingPasscode ? 'changed' : 'set'} successfully.
            </Text>
            <TouchableOpacity
              style={styles.primaryButton}
              onPress={handleFinish}
              activeOpacity={0.7}
            >
              <Text style={styles.primaryButtonText}>Done</Text>
            </TouchableOpacity>
          </View>
        );

      default:
        return null;
    }
  };

  return (
    <View style={styles.container}>
      {/* Custom Header */}
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
          activeOpacity={0.7}
        >
          <ChevronLeft size={24} color={colors.text} strokeWidth={2} />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>Wallet Passcode</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {renderStepContent()}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    backgroundColor: colors.background,
  },
  backButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  headerTitle: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  headerRight: {
    width: 40,
  },
  scrollContent: {
    padding: spacing[6],
    paddingTop: spacing[8],
  },
  stepContainer: {
    alignItems: 'center',
    gap: spacing[6],
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[4],
  },
  successIconContainer: {
    backgroundColor: 'rgba(16, 185, 129, 0.1)',
  },
  stepTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    textAlign: 'center',
  },
  stepDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    paddingHorizontal: spacing[4],
  },
  emailBox: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[6],
    borderWidth: 1,
    borderColor: colors.border,
    marginTop: spacing[2],
  },
  emailText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },
  passcodeContainer: {
    marginVertical: spacing[4],
  },
  primaryButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    minWidth: 200,
    alignItems: 'center',
    marginTop: spacing[4],
  },
  primaryButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
  secondaryButton: {
    backgroundColor: 'transparent',
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
    marginTop: spacing[2],
  },
  secondaryButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.primary,
  },
  buttonDisabled: {
    opacity: 0.5,
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: spacing[2],
    fontFamily: getFontFamily('medium'),
  },
  hintText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    textAlign: 'center',
    marginTop: spacing[2],
    fontFamily: typography.fontFamily.primary,
  },
});
