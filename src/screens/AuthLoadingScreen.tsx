import React, { useEffect, useRef } from 'react';
import { View, StyleSheet, Image, Animated, Easing } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useRouter } from 'expo-router';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../lib/api/profile';
import { spacing } from '../theme';

export default function AuthLoadingScreen() {
  const router = useRouter();
  const { user, session, loading } = useAuth();

  const opacityAnim = useRef(new Animated.Value(0.4)).current;
  const scaleAnim = useRef(new Animated.Value(1)).current;
  const isNavigatingRef = useRef(false);

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(opacityAnim, {
          toValue: 0.4,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [opacityAnim]);

  const performTransition = (nextRoute: string) => {
    if (isNavigatingRef.current) return;
    isNavigatingRef.current = true;

    opacityAnim.stopAnimation();

    Animated.parallel([
      Animated.timing(scaleAnim, {
        toValue: 5,
        duration: 400,
        easing: Easing.inOut(Easing.ease),
        useNativeDriver: true,
      }),
      Animated.timing(opacityAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      })
    ]).start(() => {
      router.replace('/(tabs)');
    });
  };

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!loading) {
        if (user && session) {
          performTransition('MainApp');
        } else {
          performTransition('MainApp');
        }
      }
    };

    checkAuthAndProfile();
  }, [user, session, loading]);

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: opacityAnim,
              transform: [{ scale: scaleAnim }]
            }
          ]}
        >
          <Image
            source={require('../../assets/app-icon-transparent.png')}
            style={styles.logo}
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
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 180,
    height: 180,
  },
});
