import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import * as Clipboard from 'expo-clipboard';
import { useNavigation } from '@react-navigation/native';
import { 
  Gift,
  Copy,
  Check,
  ChevronLeft,
  Users,
  TrendingUp,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { colors, spacing, typography, borderRadius, shadows } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

const MOCK_REFERRAL = {
  totalReferrals: 8,
  coinsEarned: 200,
  pendingReferrals: 3,
};

export default function ReferralsScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);

  const getReferralCode = () => {
    return user?.id?.slice(0, 8).toUpperCase() || 'UNIFESTO';
  };

  const handleCopyReferral = async () => {
    const referralCode = getReferralCode();
    const referralLink = `https://unifesto.app/signup?ref=${referralCode}`;
    await Clipboard.setStringAsync(referralLink);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
        <Text style={styles.headerTitle}>Referrals</Text>
        <View style={styles.headerRight} />
      </View>

      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Hero Section */}
        <View style={styles.heroCard}>
          <Gift size={48} color={colors.primary} strokeWidth={1.5} />
          <Text style={styles.heroTitle}>Invite Friends, Earn Rewards!</Text>
          <Text style={styles.heroDescription}>
            Share your unique referral code and earn bonus coins when your friends join and attend their first event.
          </Text>
        </View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Users size={24} color={colors.primary} strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{MOCK_REFERRAL.totalReferrals}</Text>
            <Text style={styles.statLabel}>Total Referrals</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <TrendingUp size={24} color="#10b981" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{MOCK_REFERRAL.coinsEarned}</Text>
            <Text style={styles.statLabel}>Coins Earned</Text>
          </View>

          <View style={styles.statCard}>
            <View style={styles.statIcon}>
              <Gift size={24} color="#f59e0b" strokeWidth={2} />
            </View>
            <Text style={styles.statValue}>{MOCK_REFERRAL.pendingReferrals}</Text>
            <Text style={styles.statLabel}>Pending</Text>
          </View>
        </View>

        {/* Referral Code Card */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Your Referral Code</Text>
          <Text style={styles.cardDescription}>
            Share this code with your friends to get started
          </Text>

          <View style={styles.referralCodeContainer}>
            <View style={styles.referralCodeBox}>
              <Text style={styles.referralCode}>{getReferralCode()}</Text>
            </View>
            <TouchableOpacity
              style={styles.copyButton}
              onPress={handleCopyReferral}
              activeOpacity={0.7}
            >
              {copied ? (
                <>
                  <Check size={20} color="#10b981" strokeWidth={2.5} />
                  <Text style={styles.copiedText}>Copied!</Text>
                </>
              ) : (
                <>
                  <Copy size={20} color={colors.primary} strokeWidth={2.5} />
                  <Text style={styles.copyText}>Copy</Text>
                </>
              )}
            </TouchableOpacity>
          </View>

          <View style={styles.referralLink}>
            <Text style={styles.referralLinkLabel}>Referral Link:</Text>
            <Text style={styles.referralLinkText} numberOfLines={1}>
              https://unifesto.app/signup?ref={getReferralCode()}
            </Text>
          </View>
        </View>

        {/* How It Works */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>How It Works</Text>
          
          <View style={styles.stepsList}>
            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>1</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Share Your Code</Text>
                <Text style={styles.stepDescription}>
                  Send your referral code to friends via social media, email, or messaging apps
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>2</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Friend Signs Up</Text>
                <Text style={styles.stepDescription}>
                  Your friend creates an account using your referral code
                </Text>
              </View>
            </View>

            <View style={styles.stepItem}>
              <View style={styles.stepNumber}>
                <Text style={styles.stepNumberText}>3</Text>
              </View>
              <View style={styles.stepContent}>
                <Text style={styles.stepTitle}>Both Earn Rewards</Text>
                <Text style={styles.stepDescription}>
                  When they attend their first event, you both receive bonus coins!
                </Text>
              </View>
            </View>
          </View>
        </View>

        {/* Benefits Card */}
        <View style={styles.benefitsCard}>
          <Text style={styles.benefitsTitle}>Referral Benefits</Text>
          <View style={styles.benefitsList}>
            <View style={styles.benefitItem}>
              <View style={styles.benefitBullet} />
              <Text style={styles.benefitText}>Earn 25 coins for each successful referral</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitBullet} />
              <Text style={styles.benefitText}>Your friend gets 25 welcome bonus coins</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitBullet} />
              <Text style={styles.benefitText}>No limit on referrals - invite unlimited friends</Text>
            </View>
            <View style={styles.benefitItem}>
              <View style={styles.benefitBullet} />
              <Text style={styles.benefitText}>Track your referrals in real-time</Text>
            </View>
          </View>
        </View>
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
    paddingTop: spacing[4],
  },
  heroCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    marginBottom: spacing[6],
    ...shadows.md,
  },
  heroTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginTop: spacing[4],
    marginBottom: spacing[2],
    textAlign: 'center',
  },
  heroDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  statsContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[6],
  },
  statCard: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[3],
  },
  statValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  statLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    textAlign: 'center',
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    marginBottom: spacing[6],
    ...shadows.md,
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  cardDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[5],
  },
  referralCodeContainer: {
    flexDirection: 'row',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  referralCode: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
    letterSpacing: 3,
  },
  copyButton: {
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
    minWidth: 80,
  },
  copyText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
    marginTop: spacing[1],
  },
  copiedText: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('bold'),
    color: '#10b981',
    marginTop: spacing[1],
  },
  referralLink: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    padding: spacing[3],
    borderWidth: 1,
    borderColor: colors.borderMuted,
  },
  referralLinkLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  referralLinkText: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  stepsList: {
    gap: spacing[5],
    marginTop: spacing[4],
  },
  stepItem: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  stepNumber: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: colors.primary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stepNumberText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
  stepContent: {
    flex: 1,
  },
  stepTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  stepDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  benefitsCard: {
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.1)',
  },
  benefitsTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[4],
  },
  benefitsList: {
    gap: spacing[3],
  },
  benefitItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    gap: spacing[2],
  },
  benefitBullet: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colors.primary,
    marginTop: 6,
  },
  benefitText: {
    flex: 1,
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
});
