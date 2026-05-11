import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import GradientText from './GradientText';
import { colors, spacing, typography } from '../theme';
import { getFontFamily } from '../theme/fontHelpers';

export default function Footer() {
  return (
    <View style={styles.footerContainer}>
      {/* Gradient Divider */}
      <View style={styles.dividerContainer}>
        <LinearGradient
          colors={['transparent', colors.primary, 'transparent']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 0 }}
          style={styles.divider}
        />
      </View>
      
      <View style={styles.footer}>
        <GradientText style={styles.footerHashtag}>
          #UnifestoAtYourCampus
        </GradientText>
        <Text style={styles.footerVersion}>Version 1.0</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  footerContainer: {
    marginTop: spacing[8],
  },
  dividerContainer: {
    alignItems: 'center',
    paddingHorizontal: spacing[6],
    marginBottom: spacing[12],
  },
  divider: {
    width: '66%',
    height: 1,
  },
  footer: {
    paddingHorizontal: spacing[6],
    paddingBottom: spacing[16],
    alignItems: 'center',
    gap: spacing[3],
  },
  footerHashtag: {
    fontSize: typography.fontSize.lg,
    fontFamily: getFontFamily('bold'),
    letterSpacing: typography.letterSpacing.wide,
  },
  footerVersion: {
    fontSize: typography.fontSize.xs,
    color: colors.textMuted,
    fontFamily: typography.fontFamily.primary,
    opacity: 0.6,
  },
});
