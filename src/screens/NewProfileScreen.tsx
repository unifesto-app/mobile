/**
 * New Profile Screen
 * Uses new backend API for user profile management
 */

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
import { useRouter } from 'expo-router';
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
} from 'lucide-react-native';
import Svg, { Rect, Path, Circle } from 'react-native-svg';
import { useAuth } from '../context/NewAuthContext';
import * as AuthAPI from '../lib/api/auth';
import GradientText from '../components/GradientText';
import GlassyButton from '../components/GlassyButton';
import Skeleton from '../components/Skeleton';
import Footer from '../components/Footer';
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

const InstagramIcon = ({ size = 16, color = '#ec4899' }: { size?: number; color?: string }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Rect x="2" y="2" width="20" height="20" rx="6" ry="6" stroke={color} strokeWidth={2} />
    <Circle cx="12" cy="12" r="4" stroke={color} strokeWidth={2} />
    <Circle cx="17.5" cy="6.5" r="1.2" fill={color} />
  </Svg>
);

const HEADER_TOP_OFFSET = 0;

export default function NewProfileScreen() {
  const router = useRouter();
  const { user, accessToken, signOut, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);

  useAnalyticsScreenTracking('Profile');

  const loadProfile = async () => {
    if (!authLoading) {
      if (!user || !accessToken) {
        setIsLoading(false);
      } else {
        try {
          const userProfile = await AuthAPI.getCurrentUser(accessToken);
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
      if (accessToken) {
        const userProfile = await AuthAPI.getCurrentUser(accessToken);
        setProfile(userProfile);
      }
    } catch (error) {
      console.error('Failed to refresh profile:', error);
    }
    setRefreshing(false);
  };

  useEffect(() => {
    loadProfile();
  }, [user, accessToken, authLoading]);

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
    router.push(`/${screenName.toLowerCase().replace('screen', '')}`);
  };

  const handleRateApp = () => {
    const storeUrl = Platform.select({
      ios: 'https://apps.apple.com/in/app/unifesto-discover-events/id6767165496',
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
        </ScrollView>
      </View>
    );
  }

  if (!user || !accessToken) {
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
  const displayMobile = profile?.mobileNumber;

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
        <TouchableOpacity
          style={styles.profileHeaderCard}
          onPress={() => handleNavigate('Account')}
          activeOpacity={0.7}
        >
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
              ) : displayMobile ? (
                <Text style={styles.profileUsername}>{displayMobile}</Text>
              ) : null}
            </View>
            <ChevronRight size={18} color={colors.textMuted} strokeWidth={2} />
          </View>
        </TouchableOpacity>

        <View style={styles.sectionSpacing}>
          <View style={styles.card}>
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

        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Preferences</Text>
          <View style={styles.card}>
            <TouchableOpacity
              style={styles.menuItem}
              onPress={() => handleNavigate('NotificationSettings')}
              activeOpacity={0.7}
            >
              <View style={styles.menuItemLeft}>
                <GlassyButton size={36} variant="dark" shape="square" disabled>
                  <Bell size={16} color="#8b5cf6" strokeWidth={2} />
                </GlassyButton>
                <Text style={styles.menuItemText}>Notification Settings</Text>
              </View>
              <ChevronRight size={16} color={colors.textMuted} strokeWidth={2} />
            </TouchableOpacity>

            <View style={styles.menuDivider} />

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

        <View style={styles.sectionSpacing}>
          <Text style={styles.sectionTitle}>Resources</Text>
          <View style={styles.card}>
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
  scrollContent: {
    paddingTop: HEADER_TOP_OFFSET + 40,
    paddingBottom: 60,
    paddingHorizontal: spacing[6],
  },
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
  card: {
    backgroundColor: colors.card,
    borderRadius: borderRadius['2xl'],
    overflow: 'hidden',
    ...shadows.lg,
  },
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
  menuItemText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('semibold'),
    color: colors.text,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginLeft: 72,
    marginRight: spacing[4],
  },
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
