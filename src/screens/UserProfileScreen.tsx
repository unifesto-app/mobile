import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
  Alert,
  ActivityIndicator,
} from 'react-native';
import { useRouter } from 'expo-router';
import { useHeaderHeight } from '@react-navigation/elements';
import { LinearGradient } from 'expo-linear-gradient';
import { Grid, Ticket } from 'lucide-react-native';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import * as AuthAPI from '../lib/api/auth';
import {
  spacing,
  typography,
  borderRadius,
  brandGradient,
  brandGradientStart,
  brandGradientEnd,
} from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function UserProfileScreen() {
  const router = useRouter();
  const headerHeight = useHeaderHeight();
  const { user, token } = useAuth();
  const { colors } = useTheme();
  const [profile, setProfile] = useState<AuthAPI.User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    if (!user || !token) {
      router.back();
      return;
    }

    try {
      setLoading(true);
      const userProfile = await AuthAPI.getCurrentUser(token);
      setProfile(userProfile);
    } catch (error) {
      console.error('Failed to load profile:', error);
      Alert.alert('Error', 'Failed to load profile');
    } finally {
      setLoading(false);
    }
  };

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: colors.background,
    },
    scrollContent: {
      paddingBottom: 100,
    },
    loadingContainer: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center',
    },
    // Header Section
    headerSection: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[6],
      paddingBottom: spacing[4],
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      gap: spacing[5],
    },
    avatar: {
      width: 90,
      height: 90,
      borderRadius: 45,
      overflow: 'hidden',
    },
    avatarImage: {
      width: '100%',
      height: '100%',
    },
    avatarGradient: {
      width: '100%',
      height: '100%',
      alignItems: 'center',
      justifyContent: 'center',
    },
    avatarText: {
      fontSize: typography.fontSize['3xl'],
      fontFamily: getFontFamily('bold'),
      color: '#000000',
    },
    statsContainer: {
      flex: 1,
      flexDirection: 'row',
      justifyContent: 'space-around',
    },
    statItem: {
      alignItems: 'center',
    },
    statNumber: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    statLabel: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginTop: spacing[1],
    },
    // Profile Info
    profileInfo: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[4],
      gap: spacing[2],
    },
    displayName: {
      fontSize: typography.fontSize.xl,
      fontFamily: getFontFamily('bold'),
      color: colors.text,
    },
    username: {
      fontSize: typography.fontSize.sm,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
    },
    bio: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('normal'),
      color: colors.text,
      lineHeight: typography.lineHeight.relaxed * typography.fontSize.base,
      marginTop: spacing[2],
    },
    // Tabs Section
    tabsContainer: {
      flexDirection: 'row',
      borderBottomWidth: 1,
      borderBottomColor: colors.borderMuted,
      marginTop: spacing[6],
    },
    tab: {
      flex: 1,
      paddingVertical: spacing[4],
      alignItems: 'center',
      justifyContent: 'center',
      borderBottomWidth: 2,
      borderBottomColor: 'transparent',
    },
    tabActive: {
      borderBottomColor: colors.primary,
    },
    tabIcon: {
      marginBottom: spacing[1],
    },
    tabText: {
      fontSize: typography.fontSize.xs,
      fontFamily: getFontFamily('semibold'),
      color: colors.textMuted,
    },
    tabTextActive: {
      color: colors.primary,
    },
    // Content Section
    contentSection: {
      paddingHorizontal: spacing[6],
      paddingTop: spacing[6],
      alignItems: 'center',
    },
    emptyState: {
      alignItems: 'center',
      paddingVertical: spacing[12],
    },
    emptyStateText: {
      fontSize: typography.fontSize.base,
      fontFamily: getFontFamily('normal'),
      color: colors.textMuted,
      marginTop: spacing[3],
    },
  });

  if (loading) {
    return (
      <View style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.primary} />
        </View>
      </View>
    );
  }

  const displayName = profile?.fullName || 'User';
  const username = profile?.username;
  const bio = profile?.bio;

  return (
    <View style={styles.container}>
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={[styles.scrollContent, { paddingTop: headerHeight + 20 }]}
      >
        {/* Header Section - Avatar + Stats */}
        <View style={styles.headerSection}>
          <View style={styles.headerRow}>
            {/* Avatar */}
            <View style={styles.avatar}>
              {profile?.avatarUrl ? (
                <Image source={{ uri: profile.avatarUrl }} style={styles.avatarImage} />
              ) : (
                <LinearGradient
                  colors={brandGradient}
                  start={brandGradientStart}
                  end={brandGradientEnd}
                  style={styles.avatarGradient}
                >
                  <Text style={styles.avatarText}>
                    {getInitials(displayName)}
                  </Text>
                </LinearGradient>
              )}
            </View>

            {/* Stats */}
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Events</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Tickets</Text>
              </View>
              <View style={styles.statItem}>
                <Text style={styles.statNumber}>0</Text>
                <Text style={styles.statLabel}>Coins</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Profile Info */}
        <View style={styles.profileInfo}>
          <Text style={styles.displayName}>{displayName}</Text>
          {username && <Text style={styles.username}>@{username}</Text>}
          {bio && <Text style={styles.bio}>{bio}</Text>}
        </View>



        {/* Tabs */}
        <View style={styles.tabsContainer}>
          <View style={[styles.tab, styles.tabActive]}>
            <Grid size={20} color={colors.primary} strokeWidth={2} style={styles.tabIcon} />
            <Text style={[styles.tabText, styles.tabTextActive]}>Events</Text>
          </View>
          <View style={styles.tab}>
            <Ticket size={20} color={colors.textMuted} strokeWidth={2} style={styles.tabIcon} />
            <Text style={styles.tabText}>Tickets</Text>
          </View>
        </View>

        {/* Content Section */}
        <View style={styles.contentSection}>
          <View style={styles.emptyState}>
            <Grid size={64} color={colors.textMuted} strokeWidth={1} />
            <Text style={styles.emptyStateText}>No events yet</Text>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
