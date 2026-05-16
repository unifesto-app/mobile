import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  RefreshControl,
  TextInput,
  Alert,
  Modal,
  Platform,
  StatusBar,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import * as Clipboard from 'expo-clipboard';
import { LinearGradient } from 'expo-linear-gradient';
import {
  Wallet,
  Gift,
  Copy,
  Check,
  TrendingUp,
  ArrowUpRight,
  ArrowDownLeft,
  Tag,
  X,
  Sparkles,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import GradientText from '../components/GradientText';
import GradientButton from '../components/GradientButton';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import {
  getWalletBalance,
  getTransactions,
  getReferralInfo,
  applyRedeemCode,
  getReferralRewardAmount,
  type Transaction,
  type ReferralInfo,
  type WalletBalance,
} from '../lib/api/wallet';

const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? spacing[12] : 20;

export default function WalletScreen() {
  const { user } = useAuth();
  const navigation = useNavigation<any>();
  const [copied, setCopied] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [loading, setLoading] = useState(false);
  const [refreshing, setRefreshing] = useState(false);

  // Wallet data
  const [walletBalance, setWalletBalance] = useState<WalletBalance | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [referralInfo, setReferralInfo] = useState<ReferralInfo | null>(null);
  const [referralReward, setReferralReward] = useState(25);

  // Redeem code modal
  const [showRedeemModal, setShowRedeemModal] = useState(false);
  const [redeemCode, setRedeemCode] = useState('');
  const [redeemLoading, setRedeemLoading] = useState(false);

  useEffect(() => {
    if (user) {
      loadWalletData();
    }
  }, [user]);

  const loadWalletData = async () => {
    try {
      setLoading(true);

      const [balanceData, transactionsData, referralData, rewardAmount] = await Promise.all([
        getWalletBalance(),
        getTransactions(50, 0),
        getReferralInfo(),
        getReferralRewardAmount(),
      ]);

      setWalletBalance(balanceData);
      setTransactions(transactionsData.transactions);
      setReferralInfo(referralData);
      setReferralReward(rewardAmount);
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

  const handleCopyReferral = async () => {
    if (!referralInfo) return;

    await Clipboard.setStringAsync(referralInfo.link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleApplyRedeemCode = async () => {
    if (!redeemCode.trim()) {
      Alert.alert('Error', 'Please enter a redeem code');
      return;
    }

    try {
      setRedeemLoading(true);

      const result = await applyRedeemCode(redeemCode.trim());

      Alert.alert(
        'Success!',
        `You received ${result.coin_amount} ${walletBalance?.currency || 'coins'}!`,
        [
          {
            text: 'OK',
            onPress: () => {
              setShowRedeemModal(false);
              setRedeemCode('');
              handleRefresh();
            },
          },
        ]
      );
    } catch (error: any) {
      // Show more specific error messages
      let errorMessage = 'Failed to apply redeem code';

      if (error.message) {
        errorMessage = error.message;
      } else if (error.toString().includes('Network request failed')) {
        errorMessage = 'Network error. Please check your connection and try again.';
      } else if (error.toString().includes('No active session')) {
        errorMessage = 'Session expired. Please sign in again.';
      }

      Alert.alert('Error', errorMessage);
    } finally {
      setRedeemLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const getTransactionIcon = (type: string, amount: number) => {
    if (amount > 0) {
      return <ArrowDownLeft size={20} color="#10b981" strokeWidth={2} />;
    } else {
      return <ArrowUpRight size={20} color="#ef4444" strokeWidth={2} />;
    }
  };

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
              <Wallet size={48} color="#000000" strokeWidth={2} />
            </LinearGradient>

            <GradientText style={styles.guestTitle}>Sign in to access your wallet</GradientText>
            <Text style={styles.guestDescription}>
              Create an account or sign in to manage your Uni Coins, view transactions, and access referral rewards
            </Text>

            <GradientButton
              onPress={() => setShowLoginModal(true)}
              style={{ width: '100%', marginBottom: spacing[4] }}
            >
              Sign In
            </GradientButton>

            <TouchableOpacity
              style={styles.browseButton}
              onPress={() => navigation.navigate('Discover')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Browse Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        {/* Login Modal */}
        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      {/* Redeem Code Modal */}
      <Modal
        visible={showRedeemModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowRedeemModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <View style={styles.modalIconContainer}>
                <Tag size={24} color={colors.primary} strokeWidth={2} />
              </View>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowRedeemModal(false)}
                activeOpacity={0.7}
              >
                <X size={24} color={colors.textMuted} strokeWidth={2} />
              </TouchableOpacity>
            </View>

            <Text style={styles.modalTitle}>Redeem Code</Text>
            <Text style={styles.modalDescription}>
              Enter your promotional or gift code to receive coins
            </Text>

            <TextInput
              style={styles.redeemInput}
              placeholder="Enter code"
              placeholderTextColor={colors.textMuted}
              value={redeemCode}
              onChangeText={setRedeemCode}
              autoCapitalize="characters"
              autoCorrect={false}
              editable={!redeemLoading}
            />

            <GradientButton
              onPress={handleApplyRedeemCode}
              loading={redeemLoading}
              disabled={redeemLoading || !redeemCode.trim()}
              style={{ width: '100%' }}
            >
              {redeemLoading ? 'Applying...' : 'Apply Code'}
            </GradientButton>
          </View>
        </View>
      </Modal>

      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={{ paddingBottom: 100 }}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={handleRefresh} />
        }
      >
        {/* Header */}
        <View style={styles.headerSection}>
          <GradientText style={styles.headerTitle}>Wallet</GradientText>
          <Text style={styles.headerSubtitle}>Manage your Uni Coins</Text>
        </View>

        {/* Wallet Balance Card */}
        <View style={styles.section}>
          <LinearGradient
            colors={brandGradient}
            start={brandGradientStart}
            end={brandGradientEnd}
            style={styles.walletCard}
          >
            <View style={styles.walletHeader}>
              <Wallet size={28} color="#000000" strokeWidth={2} />
              <Text style={styles.walletTitle}>Balance</Text>
            </View>
            {loading && !walletBalance ? (
              <View style={{ gap: spacing[2], marginTop: spacing[2] }}>
                <Skeleton width={140} height={52} borderRadius={borderRadius.md} />
                <Skeleton width={90} height={16} borderRadius={borderRadius.sm} />
              </View>
            ) : (
              <>
                <Text style={styles.walletBalance}>{walletBalance?.balance || 0}</Text>
                <Text style={styles.walletCurrency}>{walletBalance?.currency || 'Uni Coins'}</Text>
              </>
            )}
          </LinearGradient>
        </View>

        {/* Quick Actions */}
        <View style={styles.section}>
          <View style={styles.quickActions}>
            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => setShowRedeemModal(true)}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Tag size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.quickActionText}>Redeem Code</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={styles.quickActionButton}
              onPress={() => navigation.navigate('Referrals')}
              activeOpacity={0.7}
            >
              <View style={styles.quickActionIcon}>
                <Gift size={22} color={colors.primary} strokeWidth={2} />
              </View>
              <Text style={styles.quickActionText}>Refer Friends</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Referral Card */}
        <View style={styles.section}>
          <View style={styles.card}>
            <View style={styles.cardHeader}>
              <View style={styles.cardTitleContainer}>
                <Gift size={22} color={colors.primary} strokeWidth={2} />
                <Text style={styles.cardTitle}>Referral Program</Text>
              </View>
              <TouchableOpacity
                onPress={() => navigation.navigate('Referrals')}
                activeOpacity={0.7}
              >
                <Text style={styles.viewAllText}>View All</Text>
              </TouchableOpacity>
            </View>

            <View style={styles.cardContent}>
              <Text style={styles.referralDescription}>
                Invite friends and earn {referralReward} {walletBalance?.currency || 'coins'} per referral!
              </Text>

              {loading && !referralInfo ? (
                <View style={{ gap: spacing[3] }}>
                  <Skeleton width="100%" height={64} borderRadius={borderRadius.lg} />
                  <Skeleton width="100%" height={56} borderRadius={borderRadius.lg} />
                </View>
              ) : (
                <>
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
                        <Copy size={20} color={colors.primary} strokeWidth={2} />
                      )}
                    </TouchableOpacity>
                  </View>

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
            <View style={styles.sectionTitleContainer}>
              <TrendingUp size={22} color={colors.primary} strokeWidth={2} />
              <Text style={styles.sectionTitle}>Recent Transactions</Text>
            </View>
          </View>

          <View style={styles.card}>
            {loading && transactions.length === 0 ? (
              <View>
                {[1, 2, 3, 4, 5].map((i) => (
                  <View key={i}>
                    <View style={styles.transactionItem}>
                      <Skeleton width={40} height={40} borderRadius={20} />
                      <View style={{ flex: 1, gap: spacing[2] }}>
                        <Skeleton width={180} height={13} borderRadius={borderRadius.sm} />
                        <Skeleton width={100} height={11} borderRadius={borderRadius.sm} />
                      </View>
                      <Skeleton width={36} height={18} borderRadius={borderRadius.sm} />
                    </View>
                    {i < 5 && <View style={styles.transactionDivider} />}
                  </View>
                ))}
              </View>
            ) : transactions.length === 0 ? (
              <View style={styles.emptyContainer}>
                <Sparkles size={48} color={colors.textMuted} strokeWidth={1.5} />
                <Text style={styles.emptyText}>No transactions yet</Text>
                <Text style={styles.emptySubtext}>
                  Start earning coins by attending events!
                </Text>
              </View>
            ) : (
              transactions.slice(0, 10).map((transaction, index) => (
                <View key={transaction.id}>
                  <View style={styles.transactionItem}>
                    <View style={styles.transactionIcon}>
                      {getTransactionIcon(transaction.type, transaction.amount)}
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
                  {index < Math.min(transactions.length, 10) - 1 && (
                    <View style={styles.transactionDivider} />
                  )}
                </View>
              ))
            )}
          </View>
        </View>

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
  headerSection: {
    paddingHorizontal: spacing[6],
    paddingTop: HEADER_TOP_OFFSET,
    paddingBottom: spacing[6],
  },
  headerTitle: {
    fontSize: typography.fontSize['3xl'],
    fontFamily: typography.fontFamily.primary,
    marginBottom: spacing[1],
  },
  headerSubtitle: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.primary,
  },
  section: {
    paddingHorizontal: spacing[6],
    marginBottom: spacing[6],
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[4],
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
  },
  sectionTitle: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  viewAllText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  walletCard: {
    padding: spacing[8],
    borderRadius: borderRadius.xl,
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
    color: '#000000',
  },
  walletBalance: {
    fontSize: 48,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
    marginBottom: spacing[1],
  },
  walletCurrency: {
    fontSize: typography.fontSize.base,
    color: 'rgba(0, 0, 0, 0.7)',
    fontFamily: typography.fontFamily.primary,
  },
  quickActions: {
    flexDirection: 'row',
    gap: spacing[3],
  },
  quickActionButton: {
    flex: 1,
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[5],
    borderWidth: 1,
    borderColor: colors.borderMuted,
    alignItems: 'center',
    gap: spacing[2],
    ...shadows.sm,
  },
  quickActionIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  quickActionText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.text,
    textAlign: 'center',
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
    fontFamily: getFontFamily('medium'),
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
  emptyContainer: {
    paddingVertical: spacing[12],
    alignItems: 'center',
  },
  emptyText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('medium'),
    color: colors.textSecondary,
    marginTop: spacing[4],
  },
  emptySubtext: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginTop: spacing[2],
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
    width: '100%',
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
    fontFamily: getFontFamily('bold'),
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
  browseButton: {
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[6],
  },
  browseButtonText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('medium'),
    color: colors.primary,
  },
  // Modal Styles
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: spacing[6],
  },
  modalContent: {
    backgroundColor: colors.card,
    borderRadius: borderRadius.xl,
    padding: spacing[8],
    width: '100%',
    maxWidth: 400,
    ...shadows.xl,
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: spacing[6],
  },
  modalIconContainer: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalCloseButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  modalTitle: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[2],
  },
  modalDescription: {
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    marginBottom: spacing[6],
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.sm,
  },
  redeemInput: {
    backgroundColor: colors.background,
    borderRadius: borderRadius.lg,
    borderWidth: 1,
    borderColor: colors.border,
    padding: spacing[4],
    fontSize: typography.fontSize.base,
    fontFamily: typography.fontFamily.primary,
    color: colors.text,
    marginBottom: spacing[6],
    textTransform: 'uppercase',
  },
});
