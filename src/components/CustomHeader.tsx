import React from 'react';
import { View, StyleSheet, Platform, TouchableOpacity, Image, Text } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { Bell } from 'lucide-react-native';
import LiquidMetalLogo from './LiquidMetalLogo';
import { spacing } from '../theme';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { getFontFamily } from '../theme/fontHelpers';

export const HEADER_CONTENT_HEIGHT = 80;

export default function CustomHeader() {
  const insets = useSafeAreaInsets();
  const router = useRouter();
  const { user } = useAuth();
  const { colors, activeTheme } = useTheme();

  const handleNotificationPress = () => {
    router.push('/notifications');
  };

  const handleProfilePress = () => {
    router.push('/profile');
  };

  const getInitials = (name: string) =>
    name.split(' ').map((n) => n[0]).join('').toUpperCase();

  // Dynamic gradient colors based on theme
  const gradientColors: readonly [string, string, string] = activeTheme === 'light' 
    ? ['#ffffff', 'rgba(255,255,255,0.85)', 'rgba(255,255,255,0)']
    : ['#000000', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0)'];

  const renderProfileIcon = () => {
    if (!user) return null;

    // Use avatarUrl from the user object in auth context
    if (user.avatarUrl) {
      return (
        <TouchableOpacity
          onPress={handleProfilePress}
          style={styles.profileButton}
          activeOpacity={0.7}
        >
          <Image 
            source={{ uri: user.avatarUrl }} 
            style={styles.profileImage}
            // Add cache busting to ensure fresh image loads
            key={user.avatarUrl}
          />
        </TouchableOpacity>
      );
    }

    // Fallback to initials with gradient background
    const displayName = user.fullName || user.username || 'U';
    
    return (
      <TouchableOpacity
        onPress={handleProfilePress}
        style={styles.profileButton}
        activeOpacity={0.7}
      >
        <LinearGradient
          colors={['#3491ff', '#0062ff']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.profileGradient}
        >
          <Text style={styles.profileInitials}>
            {getInitials(displayName)}
          </Text>
        </LinearGradient>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { height: insets.top + HEADER_CONTENT_HEIGHT + 24, position: 'absolute', top: 0, left: 0, right: 0, zIndex: 1000 }]}>
      <LinearGradient
        colors={gradientColors}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Safe area spacer */}
      <View style={{ height: insets.top }} />
      {/* Logo row with profile and notification icons */}
      <View style={styles.content}>
        {/* Left side: Logo */}
        <View style={styles.logoContainer}>
          <LiquidMetalLogo height={Platform.OS === 'android' ? 30 : 35} width={Platform.OS === 'android' ? 71 : 80} />
        </View>
        
        {/* Right side: Notification + Profile icons */}
        <View style={styles.rightActions}>
          <TouchableOpacity
            onPress={handleNotificationPress}
            style={styles.notificationButton}
            activeOpacity={0.7}
          >
            <Bell size={22} color={colors.primary} strokeWidth={2} />
          </TouchableOpacity>
          {renderProfileIcon()}
        </View>
      </View>
      {/* Gradient tail below logo */}
      <View style={{ height: 24 }} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
    backgroundColor: 'transparent',
  },
  content: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing[5],
  },
  logoContainer: {
    alignItems: 'flex-start',
    justifyContent: 'center',
  },
  rightActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing[3],
  },
  notificationButton: {
    width: 40,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 20,
  },
  profileButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    overflow: 'hidden',
    marginBottom: 3,
  },
  profileImage: {
    width: '100%',
    height: '100%',
  },
  profileGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  profileInitials: {
    fontSize: 14,
    fontFamily: getFontFamily('bold'),
    color: '#000000',
  },
});
