import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  Modal,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { X, Lock } from 'lucide-react-native';
import { colors, spacing, typography, borderRadius } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import PasscodeInput from './PasscodeInput';
import { verifyWalletPasscode } from '../lib/api/wallet';

interface WalletPasscodeModalProps {
  visible: boolean;
  onSuccess: () => void;
  onCancel: () => void;
}

export default function WalletPasscodeModal({
  visible,
  onSuccess,
  onCancel,
}: WalletPasscodeModalProps) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [attempts, setAttempts] = useState(0);

  const handleVerifyPasscode = async (passcode: string) => {
    setLoading(true);
    setError('');

    try {
      const response = await verifyWalletPasscode(passcode);
      
      if (response.valid) {
        setAttempts(0);
        onSuccess();
      } else {
        const newAttempts = attempts + 1;
        setAttempts(newAttempts);
        setError('Incorrect passcode');
        
        if (newAttempts >= 3) {
          Alert.alert(
            'Too Many Attempts',
            'You have entered an incorrect passcode 3 times. Please try again later.',
            [
              {
                text: 'OK',
                onPress: () => {
                  setAttempts(0);
                  onCancel();
                },
              },
            ]
          );
        }
      }
    } catch (err: any) {
      setError(err.message || 'Failed to verify passcode');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setError('');
    setAttempts(0);
    onCancel();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={handleCancel}
    >
      <View style={styles.overlay}>
        <View style={styles.modalContainer}>
          {/* Close Button */}
          <TouchableOpacity
            style={styles.closeButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <X size={24} color={colors.textMuted} strokeWidth={2} />
          </TouchableOpacity>

          {/* Icon */}
          <View style={styles.iconContainer}>
            <Lock size={48} color={colors.primary} strokeWidth={2} />
          </View>

          {/* Title */}
          <Text style={styles.title}>Enter Wallet Passcode</Text>
          <Text style={styles.description}>
            Enter your passcode to access your wallet
          </Text>

          {/* Passcode Input */}
          <View style={styles.passcodeContainer}>
            <PasscodeInput
              length={6}
              onComplete={handleVerifyPasscode}
              error={!!error}
              disabled={loading || attempts >= 3}
              autoFocus
            />
          </View>

          {/* Error Message */}
          {error && (
            <Text style={styles.errorText}>
              {error} ({3 - attempts} attempts remaining)
            </Text>
          )}

          {/* Loading Indicator */}
          {loading && (
            <View style={styles.loadingContainer}>
              <ActivityIndicator color={colors.primary} />
            </View>
          )}

          {/* Cancel Button */}
          <TouchableOpacity
            style={styles.cancelButton}
            onPress={handleCancel}
            activeOpacity={0.7}
          >
            <Text style={styles.cancelButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  modalContainer: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    width: '100%',
    maxWidth: 400,
    alignItems: 'center',
    position: 'relative',
  },
  closeButton: {
    position: 'absolute',
    top: spacing[4],
    right: spacing[4],
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  iconContainer: {
    width: 96,
    height: 96,
    borderRadius: 48,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  title: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[2],
  },
  description: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  passcodeContainer: {
    marginVertical: spacing[4],
  },
  errorText: {
    fontSize: typography.fontSize.sm,
    color: '#ef4444',
    textAlign: 'center',
    marginTop: spacing[4],
    fontFamily: getFontFamily('medium'),
  },
  loadingContainer: {
    marginTop: spacing[4],
  },
  cancelButton: {
    marginTop: spacing[6],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  cancelButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.textMuted,
  },
});
