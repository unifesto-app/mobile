import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { spacing } from '../theme';
import { useTheme } from '../context/ThemeContext';

interface SplashScreenProps {
  onAnimationComplete?: () => void;
  shouldExit?: boolean;
}

export default function SplashScreen({ onAnimationComplete, shouldExit = false }: SplashScreenProps) {
  const { colors } = useTheme();
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // Fade in and pop animation on mount
    Animated.parallel([
      Animated.timing(opacityAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  useEffect(() => {
    // Exit animation when shouldExit is true
    if (shouldExit) {
      Animated.parallel([
        Animated.timing(scaleAnim, {
          toValue: 2.5,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0,
          duration: 600,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onAnimationComplete?.();
      });
    }
  }, [shouldExit]);

  const gradientColors: readonly [string, string, string] = colors.background === '#000000' 
    ? ['#000000', '#0a0a0a', '#000000']
    : [colors.background, colors.backgroundSecondary, colors.background];

  return (
    <LinearGradient
      colors={gradientColors}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* Logo/Brand with Animation */}
        <Animated.View
          style={[
            styles.logoContainer,
            {
              transform: [{ scale: scaleAnim }],
              opacity: opacityAnim,
            },
          ]}
        >
          <Image
            source={require('../../assets/app-icon-transparent.png')}
            style={styles.icon}
            resizeMode="contain"
          />
        </Animated.View>
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
    marginTop: -80,
  },
  logoContainer: {
    alignItems: 'center',
  },
  icon: {
    width: 250,
    height: 250,
  },
});
