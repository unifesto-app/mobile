import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  LogOut,
  CreditCard,
  Gift,
  Bell,
  ShieldCheck,
  Palette,
  MessageCircle,
  Star,
  ChevronRight,
  ArrowUpRight,
  Edit3,
  Settings,
  Smartphone,
} from 'lucide-react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';

// Custom Instagram icon — accurate rounded-square logo shape
const InstagramIcon = ({ size = 16, color = '#ec4899' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    {/* Outer rounded square */}
    <Rect x="2" y="2" width="20" height="20" rx="6" ry="6" stroke={color} strokeWidth={2} />
    {/* Lens circle */}
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} />
    {/* Top-right dot */}
    <Circle cx="17.5" cy="6.5" r="1.2" fill={color} />
  </Svg>
);
import { useAuth } from '../context/AuthContext';
import { getProfile, createProfileIfNotExists, Profile } from '../lib/api/profile';
import GradientText from '../components/GradientText';
import GlassyButton from '../components/GlassyButton';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import LoginModal from '../components/LoginModal';
import {
  colors,
  spacing,
  typography,
  borderRadius,
  shadows,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

// Mock user data
const MOCK_USER = {
  name: 'Guest',
  email: 'guest@unifesto.app',
};

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = Platform.OS === 'ios' ? 100 : 80;

interface ProfileScreenProps {
  navigation?: any;
}

export default function ProfileScreen({ navigation: navProp }: ProfileScreenProps) {
  const navigation = useNavigation<any>();
  const { user, session, signOut, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<Profile | null>(null);
  const [showLoginModal, setShowLoginModal] = useState(false);

  useAnalyticsScreenTracking('Profile');

  const loadProfile = async () => {
    if (!authLoading) {
      if (!user || !session) {
        setIsLoading(false);
      } else {
        let userProfile = await getProfile();
        if (!userProfile) {
          userProfile = await createProfileIfNotExists();
        }
        if (userProfile) {
          setProfile(userProfile);
        }
        setIsLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      const userProfile = await getProfile();
      if (userProfile) setProfile(userProfile);
    } catch (_) { }
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user, session, authLoading]);

  const handleLogout = async () => {
    Alert.alert(
      'Sign Out',
      'Are you sure you want to sign out?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Sign Out',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              navigation.reset({
                index: 0,
                routes: [{ name: 'MainApp' as never }],
              });
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNavigate = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/app/unifesto/id6738633431',
      android: 'https://play.google.com/store/apps/details?id=com.unifesto.app',
    });
    if (storeUrl) {
      Linking.openURL(storeUrl).catch(() =>
        Alert.alert('Error', 'Unable to open app store')
      );
    }
  };

  const handleInstagram = () => {
    Linking.openURL('https://www.instagram.com/unifesto.app/').catch(() =>
      Alert.alert('Error', 'Unable to open Instagram')
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingBottom: 100 }]}
        >
          {/* Profile header skeleton — row layout */}
          <View style={[styles.profileHeaderCard]}>
            <View style={styles.profileHeaderContent}>
              <Skeleton width={72} height={72} borderRadius={36} />
              <View style={{ flex: 1, gap: spacing[2] }}>
                <Skeleton width={140} height={18} borderRadius={borderRadius.md} />
                <Skeleton width={90} height={13} borderRadius={borderRadius.md} />
              </View>
              <Skeleton width={16} height={16} borderRadius={borderRadius.sm} />
            </View>
          </View>

          {/* Account Settings skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={110} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2].map((i) => (
                <View key={i}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={80} height={14} borderRadius={borderRadius.md} />
                    </View>
                    <Skeleton width={14} height={14} borderRadius={borderRadius.sm} />
                  </View>
                  {i < 2 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Preferences skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={90} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2, 3].map((i) => (
                <View key={i}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={100} height={14} borderRadius={borderRadius.md} />
                    </View>
                    <Skeleton width={14} height={14} borderRadius={borderRadius.sm} />
                  </View>
                  {i < 3 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>

          {/* Resources skeleton */}
          <View style={styles.sectionSpacing}>
            <Skeleton width={75} height={14} borderRadius={borderRadius.sm} style={{ marginBottom: spacing[3] }} />
            <View style={styles.card}>
              {[1, 2, 3].map((i) => (
                <View key={i}>
                  <View style={styles.menuItem}>
                    <View style={styles.menuItemLeft}>
                      <Skeleton width={36} height={36} borderRadius={borderRadius.md} />
                      <Skeleton width={120} height={14} borderRadius={borderRadius.md} />
                    </View>
                    <Skeleton width={14} height={14} borderRadius={borderRadius.sm} />
                  </View>
                  {i < 3 && <View style={styles.menuDivider} />}
                </View>
              ))}
            </View>
          </View>
        </ScrollView>
      </View>
    );
  }

  if (!user || !session) {
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
              <User size={48} color={colors.text} strokeWidth={2} />
            </LinearGradient>

            <GradientText style={styles.guestTitle}>
              Sign in to access your profile
            </GradientText>
            <Text style={styles.guestDescription}>
              Create an account or sign in to manage your profile, view tickets, and access exclusive features
            </Text>

            <TouchableOpacity
              style={styles.signInButton}
              onPress={() => setShowLoginModal(true)}
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
              <Text style={styles.browseButtonText}>Continue Browsing Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>

        <LoginModal
          visible={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={() => setShowLoginModal(false)}
        />
      </View>
    );
  }

  const displayName = profile?.name || MOCK_USER.name;
  const displayUsername = profile?.username;
  const displayEmail = profile?.email || user?.email;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.primary}
            colors={[colors.primary]}
            progressViewOffset={HEADER_TOP_OFFSET}
          />
        }
      >

        {/* ── Profile Header Card ── */}
        <TouchableOpacity
          style={styles.profileHeaderCard}
          onPress={() => handleNavigate('Account')}
          activeOpacity={0.7}
        >
          {/* Avatar, Name, Username, Chevron */}
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>{getInitials(displayName)}</Text>
                </LinearGradient>
              )}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={styles.profileName}>{displayName}</Text>
              {displayUsername ? (
                <Text style={styles.profileUsername}>@{displayUsername}</Text>
              ) : null}
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        {/* ── Account Settings Card ── */}
        <View style={styles.sectionSpacing}>
          <View style={styles.card}>
            {/* Wallet */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Wallet')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <CreditCard size={16} color="#10b981" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Wallet</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Referral */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Referrals')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <Gift size={16} color="#f59e0b" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Referral</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Preferences Card ── */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            {/* Notifications */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Notifications')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <Bell size={16} color="#8b5cf6" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Notifications</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Permissions */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Permissions')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <ShieldCheck size={16} color={colors.primary} strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Permissions</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Appearance (Color Scheme & App Icon) */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Appearance')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <Palette size={16} color="#ec4899" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Appearance</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Resources Card ── */}
        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.card}>
            {/* Contact Support */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Support')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <MessageCircle size={16} color={colors.primary} strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Contact Support</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Rate in Store */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleRateApp}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <Star size={16} color="#f59e0b" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Rate in Store</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Unifesto on Instagram */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleInstagram}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <InstagramIcon size={15} color="#ec4899" />
                </GlassyButton>
                <Text style={styles.menuItemText}>Unifesto on Instagram</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sign Out Card ── */}
        <View style={[styles.sectionSpacing, { marginBottom: spacing[8] }]}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.signOutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <LogOut size={16} color={colors.error} strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.signOutText}>Sign Out</Text>
              </View>
            </TouchableOpacity>
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
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
    fontFamily: getFontFamily('normal'),
  },
  scrollContent: {
    paddingTop: HEADER_TOP_OFFSET + 40,
    paddingBottom: 60,
    paddingHorizontal: spacing[6],
  },

  // Section
  sectionSpacing: {
    marginBottom: spacing[6],
  },
  sectionTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
    marginBottom: spacing[3],
    paddingLeft: spacing[1],
  },

  // Profile Header Card - Centered Design
  profileHeaderCard: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    marginBottom: spacing[6],
    ...shadows.lg,
  },
  profileHeaderContent: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: spacing[3],
    paddingBottom: spacing[3],
    paddingHorizontal: spacing[5],
    gap: spacing[4],
  },
  avatarWrapper: {
    width: 72,
    height: 72,
    borderRadius: 36,
    overflow: 'hidden',
    flexShrink: 0,
  },
  avatar: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.backgroundSecondary,
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  profileName: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: 2,
    textAlign: 'left',
  },
  profileUsername: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
    textAlign: 'left',
  },
  profileCardDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginHorizontal: spacing[6],
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[3],
    paddingHorizontal: spacing[5],
  },
  editProfileText: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },

  // Generic card
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },

  // Menu Items
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  menuItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
    flex: 1,
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: borderRadius.md,
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuItemTextContainer: {
    flex: 1,
  },
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },
  menuItemSubtext: {
    fontSize: typography.fontSize.xs,
    fontFamily: getFontFamily('normal'),
    color: colors.textMuted,
    marginTop: 2,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginLeft: 72, // iconContainer(36) + gap(12) + paddingLeft(16) + extra(8)
    marginRight: spacing[4],
  },

  // Sign Out Button
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[4],
    paddingVertical: spacing[3],
  },
  signOutText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.error,
  },

  // Guest State
  guestContainer: {
    paddingTop: HEADER_TOP_OFFSET + 150,
    paddingBottom: spacing[8],
    paddingHorizontal: spacing[8],
    alignItems: 'center',
  },
  guestContent: {
    alignItems: 'center',
    maxWidth: 400,
  },
  guestIcon: {
    width: 100,
    height: 100,
    borderRadius: 50,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: spacing[5],
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
    marginBottom: spacing[6],
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
