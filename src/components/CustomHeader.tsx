import React from 'react';
import { View, StyleSheet, Platform } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import LiquidMetalLogo from './LiquidMetalLogo';
import { spacing } from '../theme';

export const HEADER_CONTENT_HEIGHT = 80;

export default function CustomHeader() {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, { height: insets.top + HEADER_CONTENT_HEIGHT + 24 }]}>
      <LinearGradient
        colors={['#000000', 'rgba(0,0,0,0.85)', 'rgba(0,0,0,0)']}
        start={{ x: 0, y: 0 }}
        end={{ x: 0, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      {/* Safe area spacer */}
      <View style={{ height: insets.top }} />
      {/* Logo row */}
      <View style={styles.content}>
        <LiquidMetalLogo size={Platform.OS === 'android' ? 30 : 34} />
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
  },
  content: {
    height: HEADER_CONTENT_HEIGHT,
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: spacing[5],
  },
});
