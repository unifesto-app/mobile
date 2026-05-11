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
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { 
  User, 
  LogOut,
  Settings,
  Shield,
  ChevronRight,
  Bell,
  Lock,
} from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { getProfile, createProfileIfNotExists, Profile } from '../lib/api/profile';
import GradientText from '../components/GradientText';
import Footer from '../components/Footer';
import { colors, spacing, typography, borderRadius, shadows, brandGradient, brandGradientStart, brandGradientEnd } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';
import useAnalyticsScreenTracking from '../hooks/useAnalyticsScreenTracking';

// Mock user data
const MOCK_USER = {
  name: 'Tej Reddy',
  email: 'tej.reddy@university.edu',
  joinedDate: 'January 2024',
  stats: {
    eventsAttended: 12,
    ticketsBooked: 15,
  },
};

// Menu items
const MENU_ITEMS = [
  {
    id: 'account',
    title: 'Account',
    description: 'Manage your personal information',
    icon: User,
    screen: 'Account',
  },
  {
    id: 'preferences',
    title: 'Preferences',
    description: 'Notification and app settings',
    icon: Bell,
    screen: 'Preferences',
  },
  {
    id: 'settings',
    title: 'Settings',
    description: 'Security and wallet settings',
    icon: Lock,
    screen: 'Settings',
  },
  {
    id: 'legal',
    title: 'Legal',
    description: 'Terms, privacy, and policies',
    icon: Shield,
    screen: 'Legal',
  },
];

interface ProfileScreenProps {
  navigation?: any;
}

export default function ProfileScreen({ navigation: navProp }: ProfileScreenProps) {
  const navigation = useNavigation<any>();
  const { user, session, signOut, loading: authLoading } = useAuth();
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<Profile | null>(null);

  // Track screen view
  useAnalyticsScreenTracking('Profile');

  useEffect(() => {
    // Check authentication status and load profile
    const loadProfile = async () => {
      if (!authLoading) {
        if (!user || !session) {
          setIsLoading(false);
        } else {
          // Load profile from backend
          let userProfile = await getProfile();
          
          if (!userProfile) {
            // Create profile if it doesn't exist
            userProfile = await createProfileIfNotExists();
          }
          
          if (userProfile) {
            setProfile(userProfile);
          }
          setIsLoading(false);
        }
      }
    };

    loadProfile();
  }, [user, session, authLoading]);

  const handleLogout = async () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: async () => {
            try {
              await signOut();
              // Navigate to Login screen after successful logout
              navigation.reset({
                index: 0,
                routes: [{ name: 'Login' as never }],
              });
            } catch (error) {
              console.error('Logout error:', error);
              Alert.alert('Error', 'Failed to logout. Please try again.');
            }
          },
        },
      ]
    );
  };

  const handleNavigateToScreen = (screenName: string) => {
    navigation.navigate(screenName);
  };

  const getInitials = (name: string) => {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  // Show loading state
  if (authLoading || isLoading) {
    return (
      <View style={[styles.container, styles.centerContent]}>
        <ActivityIndicator size="large" color="#3491ff" />
        <Text style={styles.loadingText}>Loading profile...</Text>
      </View>
    );
  }

  // Show sign-in prompt if not authenticated
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
            
            <GradientText style={styles.guestTitle}>Sign in to access your profile</GradientText>
            <Text style={styles.guestDescription}>
              Create an account or sign in to manage your profile, view tickets, and access exclusive features
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
              <Text style={styles.browseButtonText}>Continue Browsing Events</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <ScrollView 
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        {/* Profile Header */}
        <View style={styles.header}>
          <View style={styles.headerContent}>
            {/* Avatar */}
            <View style={styles.avatarContainer}>
              {profile?.avatar_url ? (
                <Image source={{ uri: profile.avatar_url }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.avatar}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(profile?.name || MOCK_USER.name)}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* User Info */}
            <View style={styles.userInfo}>
              <Text style={styles.userName}>{profile?.name || MOCK_USER.name}</Text>
              {profile?.username && (
                <Text style={styles.userUsername}>@{profile.username}</Text>
              )}
              <Text style={styles.userEmail}>{profile?.email || user?.email}</Text>
            </View>
          </View>
        </View>

        {/* Main Content */}
        <View style={styles.content}>
          {/* Menu Items */}
          {MENU_ITEMS.map((item, index) => {
            const Icon = item.icon;
            return (
              <View key={item.id}>
                <TouchableOpacity
                  style={styles.menuItem}
                  onPress={() => handleNavigateToScreen(item.screen)}
                  activeOpacity={0.7}
                >
                  <View style={styles.menuLeft}>
                    <View style={styles.menuIcon}>
                      <Icon size={20} color={colors.primary} strokeWidth={2} />
                    </View>
                    <View style={styles.menuContent}>
                      <Text style={styles.menuTitle}>{item.title}</Text>
                      <Text style={styles.menuDescription}>{item.description}</Text>
                    </View>
                  </View>
                  <ChevronRight size={20} color={colors.textMuted} strokeWidth={2} />
                </TouchableOpacity>
                {index < MENU_ITEMS.length - 1 && (
                  <View style={styles.menuDivider} />
                )}
              </View>
            );
          })}

          {/* Logout */}
          <TouchableOpacity
            style={styles.logoutItem}
            onPress={handleLogout}
            activeOpacity={0.7}
          >
            <LogOut size={20} color={colors.error} strokeWidth={2} />
            <Text style={styles.logoutText}>Logout</Text>
          </TouchableOpacity>

          {/* Footer */}
          <Footer />
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
  scrollContent: {
    paddingBottom: spacing[10],
  },
  centerContent: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    marginTop: spacing[4],
    fontSize: typography.fontSize.sm,
    color: colors.textSecondary,
  },
  header: {
    padding: spacing[8],
    paddingTop: spacing[6],
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[4],
  },
  avatarContainer: {
    width: 88,
    height: 88,
  },
  avatar: {
    width: 88,
    height: 88,
    borderRadius: 44,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatarImage: {
    width: 88,
    height: 88,
    borderRadius: 44,
    backgroundColor: colors.backgroundSecondary,
  },
  avatarText: {
    fontSize: typography.fontSize['2xl'],
    fontFamily: getFontFamily('bold'),
    color: colors.text,
  },
  userInfo: {
    flex: 1,
    justifyContent: 'center',
  },
  userName: {
    fontSize: typography.fontSize.xl,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[1],
  },
  userUsername: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    marginBottom: spacing[1],
  },
  userEmail: {
    fontSize: typography.fontSize.xs,
    color: colors.textSecondary,
  },
  content: {
    padding: spacing[6],
    paddingTop: 0,
    gap: spacing[6],
  },
  menuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: spacing[2],
  },
  menuLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[2],
    flex: 1,
    paddingRight: spacing[2],
  },
  menuIcon: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(52, 145, 255, 0.1)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  menuContent: {
    flex: 1,
  },
  menuTitle: {
    fontSize: typography.fontSize.sm,
    fontFamily: getFontFamily('bold'),
    color: colors.text,
    marginBottom: spacing[0.5],
  },
  menuDescription: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    lineHeight: typography.lineHeight.relaxed * typography.fontSize.xs,
  },
  menuDivider: {
    height: 1,
    backgroundColor: colors.borderMuted,
    marginVertical: spacing[2],
  },
  logoutItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: spacing[2],
    paddingVertical: spacing[4],
    paddingHorizontal: spacing[2],
  },
  logoutText: {
    fontSize: typography.fontSize.base,
    fontFamily: getFontFamily('medium'),
    color: colors.error,
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
