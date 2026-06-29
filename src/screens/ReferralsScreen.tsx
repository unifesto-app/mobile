import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  RefreshControl,
  Platform,
  StatusBar,
  Share,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { CaretLeft, Check, Gift, ShareNetwork as ShareIcon, Sparkle, TrendUp, Users } from 'phosphor-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import { spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import { getReferral } from '../lib/api/referrals';
import { getReferralRewardAmount } from '../lib/api/wallet';

interface ReferralInfo {
  referralCode: string;
  referralLink: string;
  totalReferred: number;
  totalCoinsEarned: number;
  pendingReferrals: number;
}

export default function ReferralsScreen() {
  const { colors } = useTheme();
  
  const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },

  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },

  // Hero card — matches walletCard style
  heroCard: {
    padding: spacing[8],
    borderRadius: borderRadius.xl,
    ...shadows.lg,
  },
  heroHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  heroCardTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
  heroBalance: {
    fontSize: 48,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
    marginBottom: spacing[1],
  },
  heroCurrency: {
    fontSize: typography.fontSize.base,
    color: 'rgba(0,0,0,0.7)',
    fontFamily: typography.fontFamily.primary,
  },

  // Stats
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
    alignItems: 'center',
    ...shadows.sm,
  },
  statIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52,145,255,0.1)',
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

  // Card — borderless, deep shadow matching ProfileScreen
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    padding: spacing[6],
    marginBottom: spacing[6],
    overflow: 'hidden',
    ...shadows.lg,
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
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[5],
  },

  // Referral code
  referralCodeRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    marginBottom: spacing[4],
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: 'rgba(52,145,255,0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(52,145,255,0.3)',
  },
  referralCodeLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  referralCode: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.primary,
    letterSpacing: 2,
  },
  shareButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52,145,255,0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52,145,255,0.3)',
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

  // Steps
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

  // Benefits
  benefitsCard: {
    backgroundColor: 'rgba(52,145,255,0.05)',
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: 'rgba(52,145,255,0.1)',
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

  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [rewardAmount, setRewardAmount] = useState(100);

  useEffect(() => {
    if (user) {
      loadReferralData();
    } else {
      setLoading(false);
    }
  }, [user]);

  const loadReferralData = async () => {
    try {
      setLoading(true);

      const [info, rewardAmt] = await Promise.all([
        getReferral(),
        getReferralRewardAmount(),
      ]);

      setReferralInfo(info ? {
        referralCode: info.referralCode || info.code || '',
        referralLink: info.link || '',
        totalReferred: info.totalReferred || info.totalReferrals || 0,
        totalCoinsEarned: info.totalCoinsEarned || info.totalRewards || 0,
        pendingReferrals: info.pendingReferrals || 0,
      } : null);
      setRewardAmount(rewardAmt);
    } catch (error) {
      console.error('Error loading referral data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadReferralData();
    setRefreshing(false);
  };

  const handleShareReferral = async () => {
    if (!referralInfo) return;
    try {
      await Share.share({
        message: `Join Unifesto and get bonus coins! Sign up with my referral code: ${referralInfo.referralCode}\n\nunifesto.app/signup?ref=${referralInfo.referralCode}`,
      });
    } catch (error) {
      console.error('Error sharing referral:', error);
    }
  };

  const renderSkeleton = () => (
    <>
      {/* Hero card skeleton */}
      <View style={styles.section}>
        <View style={styles.heroCard}>
          <Skeleton width={120} height={24} borderRadius={borderRadius.md} style={{ marginBottom: spacing[4] }} />
          <Skeleton width={80} height={48} borderRadius={borderRadius.md} style={{ marginBottom: spacing[1] }} />
          <Skeleton width={140} height={16} borderRadius={borderRadius.sm} />
        </View>
      </View>

      {/* Stats skeleton */}
      <View style={styles.section}>
        <View style={styles.statsContainer}>
          {[1, 2, 3].map((i) => (
            <View key={i} style={styles.statCard}>
              <Skeleton width={48} height={48} borderRadius={24} style={{ marginBottom: spacing[3] }} />
              <Skeleton width={40} height={24} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[1] }} />
              <Skeleton width={64} height={12} borderRadius={borderRadius.sm} />
            </View>
          ))}
        </View>

        {/* Code card skeleton */}
        <View style={styles.card}>
          <Skeleton width={140} height={18} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
          <Skeleton width={200} height={13} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[5] }} />
          <Skeleton width="100%" height={64} borderRadius={borderRadius.lg} style={{ marginBottom: spacing[3] }} />
          <Skeleton width="100%" height={40} borderRadius={borderRadius.lg} />
        </View>
      </View>

      {/* How It Works skeleton */}
      <View style={styles.section}>
        <View style={styles.card}>
          <Skeleton width={120} height={18} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[4] }} />
          {[1, 2, 3].map((i) => (
            <View key={i} style={[styles.stepItem, { marginBottom: spacing[5] }]}>
              <Skeleton width={32} height={32} borderRadius={16} />
              <View style={styles.stepContent}>
                <Skeleton width={120} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[2] }} />
                <Skeleton width="100%" height={11} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[1] }} />
                <Skeleton width="80%" height={11} borderRadius={borderRadius.sm} />
              </View>
            </View>
          ))}
        </View>
      </View>

      {/* Benefits skeleton */}
      <View style={styles.section}>
        <View style={styles.benefitsCard}>
          <Skeleton width={140} height={18} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[4] }} />
          {[1, 2, 3, 4].map((i) => (
            <View key={i} style={[styles.benefitItem, { marginBottom: spacing[3] }]}>
              <Skeleton width={6} height={6} borderRadius={3} />
              <Skeleton width="85%" height={14} borderRadius={borderRadius.sm} />
            </View>
          ))}
        </View>
      </View>
    </>
  );

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100, paddingTop: spacing[6] }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {loading && !referralInfo ? (
          renderSkeleton()
        ) : (
          <>
            {/* Hero card — gradient like wallet balance card */}
            <View style={styles.section}>
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={styles.heroCard}
              >
                <View style={styles.heroHeader}>
                  <Gift size={28} color="#000000" />
                  <Text style={styles.heroCardTitle}>Referral Program</Text>
                </View>
                <Text style={styles.heroBalance}>{rewardAmount}</Text>
                <Text style={styles.heroCurrency}>Coins per referral</Text>
              </LinearGradient>
            </View>

            {/* Stats + Code card */}
            <View style={styles.section}>
              {/* Stats */}
              <View style={styles.statsContainer}>
                <View style={styles.statCard}>
                  <View style={styles.statIcon}>
                    <Users size={22} color={colors.primary} />
                  </View>
                  <Text style={styles.statValue}>{referralInfo?.totalReferred || 0}</Text>
                  <Text style={styles.statLabel}>Total Referrals</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(16,185,129,0.1)' }]}>
                    <TrendUp size={22} color="#10b981" />
                  </View>
                  <Text style={styles.statValue}>{referralInfo?.totalCoinsEarned || 0}</Text>
                  <Text style={styles.statLabel}>Coins Earned</Text>
                </View>
                <View style={styles.statCard}>
                  <View style={[styles.statIcon, { backgroundColor: 'rgba(245,158,11,0.1)' }]}>
                    <Sparkle size={22} color="#f59e0b" />
                  </View>
                  <Text style={styles.statValue}>{referralInfo?.pendingReferrals || 0}</Text>
                  <Text style={styles.statLabel}>Pending</Text>
                </View>
              </View>

              {/* Referral Code card */}
              <View style={styles.card}>
                <Text style={styles.cardTitle}>Your Referral Code</Text>
                <Text style={styles.cardDescription}>
                  Share this code with friends to start earning
                </Text>

                <View style={styles.referralCodeRow}>
                  <View style={styles.referralCodeBox}>
                    <Text style={styles.referralCodeLabel}>Your Code</Text>
                    <Text style={styles.referralCode}>{referralInfo?.referralCode || '—'}</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.shareButton}
                    onPress={handleShareReferral}
                    activeOpacity={0.7}
                  >
                    <ShareIcon size={20} color={colors.primary}  weight="bold" />
                  </TouchableOpacity>
                </View>

                <View style={styles.referralLink}>
                  <Text style={styles.referralLinkLabel}>Referral Link</Text>
                  <Text style={styles.referralLinkText} numberOfLines={1}>
                    {referralInfo?.referralLink || `unifesto.app/signup?ref=${referralInfo?.referralCode || '—'}`}
                  </Text>
                </View>
              </View>
            </View>
          </>
        )}

        {/* How It Works */}
        {!loading && (
          <View style={styles.section}>
            <View style={styles.card}>
              <Text style={styles.cardTitle}>How It Works</Text>
              <View style={styles.stepsList}>
                {[
                  { n: '1', title: 'Share Your Code', desc: 'Send your referral code via social media, email, or messaging apps' },
                  { n: '2', title: 'Friend Signs Up', desc: 'Your friend creates an account using your referral code' },
                  { n: '3', title: 'Both Earn Rewards', desc: `You receive ${rewardAmount} coins and your friend gets a welcome bonus!` },
                ].map(({ n, title, desc }) => (
                  <View key={n} style={styles.stepItem}>
                    <View style={styles.stepNumber}>
                      <Text style={styles.stepNumberText}>{n}</Text>
                    </View>
                    <View style={styles.stepContent}>
                      <Text style={styles.stepTitle}>{title}</Text>
                      <Text style={styles.stepDescription}>{desc}</Text>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          </View>
        )}

        {/* Benefits */}
        {!loading && (
          <View style={styles.section}>
            <View style={styles.benefitsCard}>
              <Text style={styles.cardTitle}>Referral Benefits</Text>
              {[
                `Earn ${rewardAmount} coins for each successful referral`,
                `Your friend gets ${rewardAmount} welcome bonus coins`,
                'No limit on referrals — invite unlimited friends',
                'Track your referrals in real-time',
              ].map((text, i) => (
                <View key={i} style={styles.benefitItem}>
                  <View style={styles.benefitBullet} />
                  <Text style={styles.benefitText}>{text}</Text>
                </View>
              ))}
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
}

