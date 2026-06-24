import React, { useState, useEffect } from 'react';
import { useHeaderHeight } from '@react-navigation/elements';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Alert,
  Image,
  Linking,
  Platform,
  RefreshControl,
} from 'react-native';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import {
  User,
  ChevronRight,
  ArrowUpRight,
} from 'lucide-react-native';
import { UnIcon } from '@unifesto/unicon/react-native';
import Svg, { Rect, Circle } from 'react-native-svg';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAppMode } from '../context/AppModeContext';
import { makeAuthenticatedRequest } from '../lib/api/helpers';
import { Hammer, ScanLine, Compass } from 'lucide-react-native';
import * as AuthAPI from '../lib/api/auth';
import GradientText from '../components/GradientText';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
import { requestReview } from '../utils/storeReview';
import {
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

// Space needed to clear the transparent gradient header
const HEADER_TOP_OFFSET = 0;

export default function ProfileScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { user, token, logout, isLoading: authLoading, isAuthenticated } = useAuth();
  const { theme, setTheme, colors, activeTheme } = useTheme();
  const { mode, setMode, isDiscoverMode } = useAppMode();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  const [canForge, setCanForge] = useState(false);
  const [canGate, setCanGate] = useState(false);

  useAnalyticsScreenTracking('Profile');

  // Determine available modes from the user's roles
  useEffect(() => {
    let cancelled = false;
    const loadRoles = async () => {
      try {
        const response = await makeAuthenticatedRequest('/users/me');
        if (!response?.ok) return;
        const data = await response.json();
        const roles: any[] = data?.roles || [];
        const codes = roles.map((r) => r?.role?.code || r?.code || r?.roleCode).filter(Boolean);
        if (!cancelled) {
          setCanForge(codes.includes('ORGANISER') || codes.includes('CO_ORGANISER'));
          setCanGate(codes.includes('GATE'));
        }
      } catch {
        // ignore
      }
    };
    if (isAuthenticated) loadRoles();
    return () => { cancelled = true; };
  }, [isAuthenticated]);

  const switchMode = async (target: 'discover' | 'forge' | 'gate') => {
    await setMode(target);
    router.replace('/(tabs)');
  };

  const cycleTheme = () => {
    // Cycle through: dark → light → system → dark
    if (theme === 'dark') {
      setTheme('light');
    } else if (theme === 'light') {
      setTheme('system');
    } else {
      setTheme('dark');
    }
  };

  const getThemeLabel = () => {
    switch (theme) {
      case 'dark':
        return 'Dark';
                  default:
        return 'Dark';
    }
  };

  const loadProfile = async () => {
    if (!authLoading) {
      if (!isAuthenticated) {
        setIsLoading(false);
      } else {
        try {
          const userProfile = await AuthAPI.getCurrentUser(token!);
          setProfile(userProfile);
        } catch (error) {
          console.error('Failed to load profile:', error);
        }
        setIsLoading(false);
      }
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    try {
      if (token) {
        const userProfile = await AuthAPI.getCurrentUser(token!);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user, token, authLoading]);

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
              await logout();
              router.replace('/login');
            } catch (error) {
              Alert.alert('Error', 'Failed to sign out. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNavigate = (screenName: string) => {
    // Map screen names to their correct routes
    const routeMap: { [key: string]: string } = {
      'NotificationSettings': '/notification-settings',
      'Account': '/account',
      'Referrals': '/referrals',
      'Permissions': '/permissions',
      'Support': '/support',
    };
    
    const route = routeMap[screenName] || `/${screenName.toLowerCase().replace('screen', '')}`;
    router.push(route);
  };

  const handleRateApp = async () => {
    try {
      await requestReview();
    } catch (error) {
      console.error('Error requesting review:', error);
    }
  };

  const handleInstagram = () => {
    Linking.openURL('https://www.instagram.com/unifesto.app/').catch(() =>
      Alert.alert('Error', 'Unable to open Instagram')
    );
  };

  const handleX = () => {
    Linking.openURL('https://x.com/HeyUnifesto').catch(() =>
      Alert.alert('Error', 'Unable to open X')
    );
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  // Define styles early so they can be used in loading/guest states
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
      paddingTop: spacing[4],
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
    menuItemRight: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[2],
    },
    menuItemValue: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
    },
    iconContainer: {
      width: 36,
      height: 36,
      borderRadius: borderRadius.md,
      alignItems: 'center',
      justifyContent: 'center',
    },
    coloredIconContainer: {
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
      marginLeft: 72,
      marginRight: spacing[4],
    },

    // Sign Out Button
    logoutButton: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingHorizontal: spacing[4],
      paddingVertical: spacing[3],
    },
    logoutText: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('semibold'),
      color: colors.error,
    },

    // Guest State
    guestContainer: {
      paddingTop: spacing[8],
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

  if (authLoading || isLoading) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20, paddingBottom: 100 }]}
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

  if (!isAuthenticated) {
    return (
      <View style={styles.container}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={[styles.guestContainer, { paddingTop: headerHeight + 20 }]}
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
              onPress={() => router.push('/login')}
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
              onPress={() => router.push('/(tabs)')}
              activeOpacity={0.8}
            >
              <Text style={styles.browseButtonText}>Continue Browsing Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  const displayName = profile?.fullName || 'User';
  const displayUsername = profile?.username;

  // Icon background colors (same in both themes)
  const iconBgColors = {
    wallet: '#10b981',
    referral: '#f59e0b',
    notification: '#8b5cf6',
    star: '#f59e0b',
    instagram: '#ec4899',
    support: colors.primary,
    permissions: colors.primary,
    appearance: '#ec4899',
    logout: colors.error,
  };

  // Icon colors based on theme (black in light, white in dark)
  const iconColor = '#ffffff';

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
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
          onPress={() => router.push('/user-profile')}
          activeOpacity={0.7}
        >
          {/* Avatar, Name, Username, Chevron */}
          <View style={styles.profileHeaderContent}>
            <View style={styles.avatarWrapper}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
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
            {/* Edit Profile */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => router.push('/edit-profile')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <UnIcon name="profile" size={32} />
                <Text style={styles.menuItemText}>Edit Profile</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Account Settings */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('Account')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <UnIcon name="account" size={32} />
                <Text style={styles.menuItemText}>Account Settings</Text>
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
              onPress={() => handleNavigate('NotificationSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <UnIcon name="notification" size={32} />
                <Text style={styles.menuItemText}>Notification Settings</Text>
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
                <UnIcon name="permission" size={32} />
                <Text style={styles.menuItemText}>Permissions</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            {/* ── Mode switches ── */}
            {isDiscoverMode ? (
              <>
                {canForge && (
                  <>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => switchMode('forge')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={[styles.coloredIconContainer, { backgroundColor: '#3491ff' }]}>
                          <Hammer size={20} color="#ffffff" strokeWidth={2} />
                        </View>
                        <Text style={styles.menuItemText}>Switch to Forge Mode</Text>
                      </View>
                      <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
                    </TouchableOpacity>
                  </>
                )}
                {canGate && (
                  <>
                    <View style={styles.menuDivider} />
                    <TouchableOpacity
                      style={styles.menuItem}
                      onPress={() => switchMode('gate')}
                      activeOpacity={0.7}
                    >
                      <View style={styles.menuItemLeft}>
                        <View style={[styles.coloredIconContainer, { backgroundColor: '#22c55e' }]}>
                          <ScanLine size={20} color="#ffffff" strokeWidth={2} />
                        </View>
                        <Text style={styles.menuItemText}>Switch to Gate Mode</Text>
                      </View>
                      <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
                    </TouchableOpacity>
                  </>
                )}
              </>
            ) : (
              <>
                <View style={styles.menuDivider} />
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => switchMode('discover')}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuItemLeft}>
                    <View style={[styles.coloredIconContainer, { backgroundColor: colors.primary }]}>
                      <Compass size={20} color="#ffffff" strokeWidth={2} />
                    </View>
                    <Text style={styles.menuItemText}>Switch to Discover Mode</Text>
                  </View>
                  <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
              </>
            )}
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
                <UnIcon name="support" size={32} />
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
                <UnIcon name="rate" size={32} />
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
                <UnIcon name="instagram" size={32} />
                <Text style={styles.menuItemText}>Unifesto on Instagram</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

            {/* Unifesto on X */}
            <TouchableOpacity
              style={styles.menuItem}
              onPress={handleX}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <UnIcon name="x" size={32} />
                <Text style={styles.menuItemText}>Unifesto on X</Text>
              </View>
              <ArrowUpRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>
          </View>
        </View>

        {/* ── Sign Out Card ── */}
        <View style={[styles.sectionSpacing, { marginBottom: spacing[8] }]}>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.logoutButton}
              onPress={handleLogout}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <UnIcon name="signout" size={32} />
                <Text style={styles.logoutText}>Sign Out</Text>
              </View>
            </TouchableOpacity>
          </View>
        </View>

        <Footer />
      </ScrollView>
    </View>
  );
}
