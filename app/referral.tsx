import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TextInput,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { ArrowRight, Gift, Sparkle } from 'phosphor-react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../src/context/AuthContext';
import { useTheme } from '../src/context/ThemeContext';
import { applyReferralCode } from '../src/lib/api/referrals';
import UnifestoAppWordmark from '../src/components/UnifestoAppWordmark';
import { spacing, typography, borderRadius, shadows } from '../src/theme';
import { getFontFamily } from '../src/theme/fontHelpers';

export default function ReferralScreen() {
  const router = useRouter();
  const { colors } = useTheme();
  const insets = useSafeAreaInsets();
  const { refreshUser } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    SecureStore.getItemAsync('pendingReferralCode').then(code => {
      if (code) {
        setReferralCode(code);
        SecureStore.deleteItemAsync('pendingReferralCode');
      }
    });
  }, []);

  const handleSubmit = async (skip = false) => {
    setIsLoading(true);
    setError('');
    try {
      if (!skip && referralCode.trim()) {
        await applyReferralCode(referralCode.trim());
        await refreshUser();
      }
      router.replace('/(tabs)');
    } catch (err: any) {
      setError(err.message || 'Failed to apply referral code');
    } finally {
      setIsLoading(false);
    }
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
    heroIcon: {
      width: 64,
      height: 64,
      borderRadius: borderRadius.xl,
      backgroundColor: 'rgba(52,145,255,0.1)',
      alignItems: 'center',
      justifyContent: 'center',
      marginBottom: spacing[5],
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
    input: {
      flex: 1,
      fontSize: typography.fontSize.lg,
      color: colors.text,
      fontFamily: getFontFamily('bold'),
      letterSpacing: 2,
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
    skipButton: {
      height: 48,
      justifyContent: 'center',
      alignItems: 'center',
      marginTop: spacing[3],
    },
    skipText: {
      color: colors.textMuted,
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('semibold'),
    },
    rewardNote: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'center',
      gap: spacing[2],
      marginTop: spacing[4],
    },
    rewardNoteText: {
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

      <View style={styles.heroSection}>
        <Text style={styles.title}>Welcome to Unifesto!</Text>
        <Text style={styles.subtitle}>
          Got a referral code? Enter it below to unlock rewards.
        </Text>
      </View>

      {error ? (
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>{error}</Text>
        </View>
      ) : null}

      <Text style={styles.fieldLabel}>Referral Code</Text>
      <View style={styles.inputWrapper}>
        <TextInput
          style={styles.input}
          value={referralCode}
          onChangeText={(text) => {
            setReferralCode(text);
            setError('');
          }}
          placeholder="Optional"
          placeholderTextColor={colors.textMuted}
          autoCapitalize="characters"
          autoCorrect={false}
          editable={!isLoading}
          autoFocus
        />
      </View>

      <TouchableOpacity
        style={styles.primaryButton}
        onPress={() => handleSubmit(false)}
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
            <>
              <Text style={styles.primaryButtonText}>Continue</Text>
              <ArrowRight size={20} color="#FFFFFF" weight="bold" />
            </>
          )}
        </LinearGradient>
      </TouchableOpacity>

      <TouchableOpacity
        style={styles.skipButton}
        onPress={() => handleSubmit(true)}
        disabled={isLoading}
        activeOpacity={0.7}
      >
        <Text style={styles.skipText}>Skip for now</Text>
      </TouchableOpacity>

      <View style={styles.rewardNote}>
        <Sparkle size={16} color={colors.primary} weight="fill" />
        <Text style={styles.rewardNoteText}>Earn coins when you use a referral code</Text>
      </View>

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
