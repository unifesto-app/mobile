import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from '../components/GradientText';
import { colors, spacing, typography } from '../theme';

export default function SplashScreen() {
  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Brand */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/app-icon-transparent.png')}
            style={styles.icon}
            resizeMode="contain"
          />
          <GradientText style={styles.logo}>unifesto</GradientText>
          <Text style={styles.tagline}>Discover Campus Events</Text>
        </View>

        {/* Loading Indicator */}
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#3491ff" />
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text style={styles.footerText}>Powered by Unifesto</Text>
      </View>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: spacing[6],
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: spacing[16],
  },
  icon: {
    width: 150,
    height: 150,
    marginBottom: spacing[6],
  },
  logo: {
    fontSize: 48,
    fontFamily: typography.fontFamily.logo,
    marginBottom: spacing[3],
    letterSpacing: -1,
  },
  tagline: {
    fontSize: typography.fontSize.base,
    color: colors.textSecondary,
    fontFamily: typography.fontFamily.bold,
    letterSpacing: typography.letterSpacing.wide,
  },
  loadingContainer: {
    alignItems: 'center',
    gap: spacing[4],
  },
  loadingText: {
    fontSize: typography.fontSize.sm,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
  footer: {
    paddingBottom: spacing[8],
  },
  footerText: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.bold,
  },
});
