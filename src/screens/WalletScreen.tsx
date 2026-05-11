import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import MaskedView from '@react-native-masked-view/masked-view';
import { 
  Wallet,
  Gift,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import WalletPasscodeModal from '../components/WalletPasscodeModal';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import {
  hasWalletPasscode,
  getWalletBalance,
  getTransactions,
  getReferralInfo,
  type Transaction,
  type ReferralInfo,
  type WalletBalance,
} from '../lib/api/wallet';

export default function WalletScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(false);
  const [showPasscodeModal, setShowPasscodeModal] = useState(false);
  const [checkingPasscode, setCheckingPasscode] = useState(true);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  
  // Wallet data
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);

  useEffect(() => {
    // Only check passcode if user is authenticated
    if (user) {
      checkPasscodeStatus();
    } else {
      setCheckingPasscode(false);
    }
  }, [user]);

  useEffect(() => {
    if (isUnlocked && user) {
      loadWalletData();
    }
  }, [isUnlocked, user]);

  const checkPasscodeStatus = async () => {
    try {
      const response = await hasWalletPasscode();
      
      if (response.hasPasscode) {
        // User has passcode set, show modal
        setShowPasscodeModal(true);
      } else {
        // No passcode set, allow access
        setIsUnlocked(true);
      }
    } catch (error) {
      console.error('Error checking passcode status:', error);
      // On error, allow access (fail open)
      setIsUnlocked(true);
    } finally {
      setCheckingPasscode(false);
    }
  };

  const loadWalletData = async () => {
    try {
      setLoading(true);
      
      // Load wallet balance, transactions, and referral info in parallel
      const [balanceData, transactionsData, referralData] = await Promise.all([
        getWalletBalance(),
        getTransactions(50, 0),
        getReferralInfo(),
      ]);

      setWalletBalance(balanceData);
      setTransactions(transactionsData.transactions);
      setReferralInfo(referralData);
    } catch (error) {
      console.error('Error loading wallet data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await loadWalletData();
    setRefreshing(false);
  };

  const handlePasscodeSuccess = () => {
    setShowPasscodeModal(false);
    setIsUnlocked(true);
  };

  const handlePasscodeCancel = () => {
    setShowPasscodeModal(false);
    // User cancelled, don't unlock wallet
  };

  const handleCopyReferral = async () => {
    if (!referralInfo) return;
    
    await Clipboard.setStringAsync(referralInfo.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric',
    });
  };

  // Show loading while checking passcode status
  if (checkingPasscode) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color={colors.primary} />
        <Text style={styles.loadingText}>Loading wallet...</Text>
      </View>
    );
  }

  // Show guest user prompt if not authenticated
  if (!user) {
    return (
      <View style={styles.container}>
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.guestContainer}
        >
          <View style={styles.guestContent}>
            <LinearGradient
              colors={brandGradient}
              start={brandGradientStart}
              end={brandGradientEnd}
              style={styles.guestIcon}
            >
              <Wallet size={48} color={colors.text} strokeWidth={2} />
            </LinearGradient>
            
            <GradientText style={styles.guestTitle}>Sign in to access your wallet</GradientText>
            <Text style={styles.guestDescription}>
              Create an account or sign in to manage your Uni Coins, view transactions, and access referral rewards
            </Text>
            
            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => navigation.navigate('Login')}
              activeOpacity={0.8}
            >
              <LinearGradient
                colors={brandGradient}
                start={brandGradientStart}
                end={brandGradientEnd}
                style={styles.signInButtonGradient}
              >
                <Text style={styles.signInButtonText}>Sign In</Text>
              </LinearGradient>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Discover')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  // Show locked state if not unlocked
  if (!isUnlocked) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <View style={styles.lockedIconContainer}>
          <Wallet size={64} color={colors.textMuted} strokeWidth={2} />
        </View>
        <Text style={styles.lockedTitle}>Wallet Locked</Text>
        <Text style={styles.lockedDescription}>
          Enter your passcode to access your wallet
        </Text>
        <TouchableOpacity
          style={styles.unlockButton}
          onPress={() => setShowPasscodeModal(true)}
          activeOpacity={0.7}
        >
          <Text style={styles.unlockButtonText}>Unlock Wallet</Text>
        </TouchableOpacity>
        <WalletPasscodeModal
          visible={showPasscodeModal}
          onSuccess={handlePasscodeSuccess}
          onCancel={handlePasscodeCancel}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <WalletPasscodeModal
        visible={showPasscodeModal}
        onSuccess={handlePasscodeSuccess}
        onCancel={handlePasscodeCancel}
      />
      <ScrollView 
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header with Pocket Branding */}
        <View style={styles.headerSection}>
          <View style={styles.brandingContainer}>
            <MaskedView
              maskElement={
                <Text style={styles.pocketBrandText}>Pocket</Text>
              }
            >
              <LinearGradient
                colors={['#fff462', '#ffb700']}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              >
                <Text style={[styles.pocketBrandText, { opacity: 0 }]}>Pocket</Text>
              </LinearGradient>
            </MaskedView>
            <View style={styles.byUnifestoContainer}>
              <Text style={styles.byText}>by </Text>
              <GradientText style={styles.unifestoText}>unifesto</GradientText>
            </View>
          </View>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={['#3491ff', '#0062ff']}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.walletCard}
          >
            <View style={styles.walletHeader}>
              <Wallet size={28} color="#ffffff" strokeWidth={2} />
              <Text style={styles.walletTitle}>Wallet Balance</Text>
            </View>
            {loading && !walletBalance ? (
              <ActivityIndicator size="large" color="#ffffff" style={{ marginVertical: spacing[4] }} />
            ) : (
              <>
                <Text style={styles.walletBalance}>{walletBalance?.balance || 0}</Text>
                <Text style={styles.walletCurrency}>{walletBalance?.currency || 'Uni Coins'}</Text>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Referral Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Gift size={22} color="#3491ff" strokeWidth={2} />
                <Text style={styles.cardTitle}>Referral Program</Text>
              </View>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.referralDescription}>
                Invite friends and earn {walletBalance?.currency || 'Uni Coins'}!
              </Text>

              {loading && !referralInfo ? (
                <ActivityIndicator size="small" color={colors.primary} style={{ marginVertical: spacing[4] }} />
              ) : (
                <>
                  {/* Referral Code */}
                  <View style={styles.referralCodeContainer}>
                    <View style={styles.referralCodeBox}>
                      <Text style={styles.referralCodeLabel}>Your Code</Text>
                      <Text style={styles.referralCode}>{referralInfo?.code || 'LOADING'}</Text>
                    </View>
                    <TouchableOpacity
                      style={styles.copyButton}
                      onPress={handleCopyReferral}
                      activeOpacity={0.7}
                    >
                      {copied ? (
                        <Check size={20} color="#10b981" strokeWidth={2} />
                      ) : (
                        <Copy size={20} color="#3491ff" strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>

                  {/* Referral Stats */}
                  <View style={styles.referralStats}>
                    <View style={styles.referralStat}>
                      <Text style={styles.referralStatValue}>
                        {referralInfo?.total_referrals || 0}
                      </Text>
                      <Text style={styles.referralStatLabel}>Referrals</Text>
                    </View>
                    <View style={styles.referralStatDivider} />
                    <View style={styles.referralStat}>
                      <Text style={styles.referralStatValue}>
                        {referralInfo?.total_rewards || 0}
                      </Text>
                      <Text style={styles.referralStatLabel}>Coins Earned</Text>
                    </View>
                  </View>
                </>
              )}
            </View>
          </View>
        </View>

        {/* Transaction History */}
        <View style={styles.section}>
          <View style={styles.sectionHeader}>
            <TrendingUp size={22} color="#3491ff" strokeWidth={2} />
            <Text style={styles.sectionTitle}>Transaction History</Text>
          </View>

          <View style={styles.card}>
            {loading && transactions.length === 0 ? (
              <View style={{ paddingVertical: spacing[8], alignItems: 'center' }}>
                <ActivityIndicator size="small" color={colors.primary} />
                <Text style={styles.emptyText}>Loading transactions...</Text>
              </View>
            ) : transactions.length === 0 ? (
              <View style={{ paddingVertical: spacing[8], alignItems: 'center' }}>
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Start earning coins by attending events!
                </Text>
              </View>
            ) : (
              transactions.map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      {transaction.amount > 0 ? (
                        <ArrowDownLeft size={20} color="#10b981" strokeWidth={2} />
                      ) : (
                        <ArrowUpRight size={20} color="#ef4444" strokeWidth={2} />
                      )}
                    </View>
                    <View style={styles.transactionDetails}>
                      <Text style={styles.transactionDescription}>
                        {transaction.description}
                      </Text>
                      <Text style={styles.transactionDate}>
                        {formatDate(transaction.created_at)}
                      </Text>
                    </View>
                    <Text
                      style={[
                        styles.transactionAmount,
                        transaction.amount > 0
                          ? styles.transactionAmountEarned
                          : styles.transactionAmountSpent,
                      ]}
                    >
                      {transaction.amount > 0 ? '+' : ''}
                      {transaction.amount}
                    </Text>
                  </View>
                  {index < transactions.length - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

        {/* Footer */}
        <Footer />
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  loadingText: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    marginTop: spacing[4],
    fontFamily: getFontFamily('medium'),
  },
  lockedIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[6],
  },
  lockedTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  lockedDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    marginBottom: spacing[8],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
  },
  unlockButton: {
    backgroundColor: colors.primary,
    borderRadius: borderRadius.lg,
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
  },
  unlockButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
  headerSection: {
    paddingHorizontal: spacing[6],
    paddingTop: spacing[12],
    paddingBottom: spacing[4],
    alignItems: 'center',
  },
  brandingContainer: {
    alignItems: 'center',
    gap: spacing[2],
  },
  pocketBrandText: {
    fontSize: typography.fontSize['5xl'],
    fontFamily: typography.fontFamily.bold,
    letterSpacing: 0.5,
    textShadowColor: 'rgba(255, 244, 98, 0.3)',
    textShadowOffset: { width: 0, height: 0 },
    textShadowRadius: 1,
  },
  byUnifestoContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: -spacing[2],
  },
  byText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
  },
  unifestoText: {
    fontSize: typography.fontSize.lg,
    fontFamily: typography.fontFamily.logo,
    letterSpacing: typography.letterSpacing.wide,
    marginLeft: spacing[1],
  },
  section: {
    paddingHorizontal: spacing[5],
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  walletCard: {
    padding: spacing[8],
    borderRadius: borderRadius.xl,
    marginTop: spacing[6],
    ...shadows.lg,
  },
  walletHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    marginBottom: spacing[4],
  },
  walletTitle: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
  },
  walletBalance: {
    fontSize: 48,
    fontFamily: getFontFamily('bold'),
    color: '#ffffff',
    marginBottom: spacing[1],
  },
  walletCurrency: {
    fontSize: typography.fontSize.base,
    color: 'rgba(255, 255, 255, 0.8)',
    fontFamily: typography.fontFamily.primary,
  },
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[6],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    ...shadows.md,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[5],
  },
  cardTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  cardTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  cardContent: {
    gap: spacing[4],
  },
  referralDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[2],
  },
  referralCodeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  referralCodeBox: {
    flex: 1,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
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
  copyButton: {
    width: 48,
    height: 48,
    borderRadius: borderRadius.lg,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(52, 145, 255, 0.3)',
  },
  referralStats: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(52, 145, 255, 0.05)',
    borderRadius: borderRadius.lg,
    padding: spacing[4],
  },
  referralStat: {
    flex: 1,
    alignItems: 'center',
  },
  referralStatValue: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  referralStatLabel: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  referralStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: colors.border,
  },
  transactionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    paddingVertical: spacing[4],
  },
  transactionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  transactionDetails: {
    flex: 1,
  },
  transactionDescription: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  transactionDate: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  transactionAmount: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
  },
  transactionAmountEarned: {
    color: '#10b981',
  },
  transactionAmountSpent: {
    color: '#ef4444',
  },
  transactionDivider: {
    height: 1,
    backgroundColor: colors.border,
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.textSecondary,
    marginTop: spacing[2],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[1],
    textAlign: 'center',
  },
  // Guest User Styles
  guestContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[8],
    paddingVertical: spacing[12],
  },
  guestContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  guestIcon: {
    width: 120,
    height: 120,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[8],
  },
  guestTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('medium'),
    color: colors.text,
    textAlign: 'center',
    marginBottom: spacing[4],
  },
  guestDescription: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    textAlign: 'center',
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
    marginBottom: spacing[8],
  },
  signInButton: {
    width: '100%',
    marginBottom: spacing[4],
  },
  signInButtonGradient: {
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[8],
    borderRadius: borderRadius.lg,
    alignItems: 'center',
  },
  signInButtonText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  browseButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  browseButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
});
