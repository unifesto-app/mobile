import React, { useEffect, useRef } from 'react';
import { Animated, Easing, Platform, StyleSheet, Text } from 'react-native';
import MaskedView from '@react-native-masked-view/masked-view';
import { LinearGradient } from 'expo-linear-gradient';
import { typography, gradientTextColors } from '../theme';

import UnifestoAppLogo from './UnifestoAppLogo';

interface LiquidMetalLogoProps {
  width?: number;
  height?: number;
}

export default function LiquidMetalLogo({ width = 160, height = 90 }: LiquidMetalLogoProps) {
  const shimmerAnim = useRef(new Animated.Value(0)).current;
  const waveAnim = useRef(new Animated.Value(0)).current;
  const glowAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Shimmer effect - moves the gradient across the text
    const shimmerAnimation = Animated.loop(
      Animated.timing(shimmerAnim, {
        toValue: 1,
        duration: 3000,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: false, // gradient animations need false
      })
    );

    // Wave distortion effect
    const waveAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(waveAnim, {
          toValue: 1,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(waveAnim, {
          toValue: 0,
          duration: 2000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    // Glow pulsing effect
    const glowAnimation = Animated.loop(
      Animated.sequence([
        Animated.timing(glowAnim, {
          toValue: 1,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(glowAnim, {
          toValue: 0,
          duration: 1500,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );

    shimmerAnimation.start();
    waveAnimation.start();
    glowAnimation.start();

    return () => {
      shimmerAnimation.stop();
      waveAnimation.stop();
      glowAnimation.stop();
    };
  }, [shimmerAnim, waveAnim, glowAnim]);

  // Interpolate shimmer position
  const gradientX = shimmerAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 1],
  });

  // Subtle scale wave
  const scale = waveAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [1, 1.02, 1],
  });

  // Glow opacity
  const glowOpacity = glowAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0.8, 1],
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          width,
          height,
          transform: [{ scale }],
          opacity: glowOpacity,
        },
      ]}
    >
      <UnifestoAppLogo width={width} height={height} />
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  logo: {
    fontFamily: typography.fontFamily.logo,
    backgroundColor: 'transparent',
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
  gradient: {
    paddingHorizontal: 8,
    paddingVertical: 6,
  },
});
