import React, { useEffect } from 'react';
import { View, StyleSheet, ActivityIndicator, Image } from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '../context/AuthContext';
import { getProfile } from '../lib/api/profile';
import { colors, spacing } from '../theme';

interface AuthLoadingScreenProps {
  navigation: any;
}

export default function AuthLoadingScreen({ navigation }: AuthLoadingScreenProps) {
  const { user, session, loading } = useAuth();

  useEffect(() => {
    const checkAuthAndProfile = async () => {
      if (!loading) {
        // Check if user is authenticated
        if (user && session) {
          try {
            // Fetch user profile to check if username is set
            const profile = await getProfile();
            
            if (profile && !profile.username) {
              // Username not set, navigate to username setup
              navigation.replace('UsernameSetup');
            } else {
              // Username is set, navigate to main app
              navigation.replace('MainApp');
            }
          } catch (error) {
            // Silently handle profile fetch errors
            // Profile might not exist yet or database not set up
            navigation.replace('MainApp');
          }
        } else {
          // User is not logged in, allow guest access to browse events
          // Navigate directly to MainApp (guest mode)
          navigation.replace('MainApp');
        }
      }
    };

    checkAuthAndProfile();
  }, [user, session, loading, navigation]);

  // Also listen for auth state changes while on other screens
  useEffect(() => {
    const unsubscribe = navigation.addListener('focus', async () => {
      if (!loading) {
        if (user && session) {
          try {
            const profile = await getProfile();
            
            if (profile && !profile.username) {
              navigation.replace('UsernameSetup');
            } else {
              navigation.replace('MainApp');
            }
          } catch (error) {
            // Silently handle profile fetch errors
            navigation.replace('MainApp');
          }
        } else {
          // Allow guest access
          navigation.replace('MainApp');
        }
      }
    });

    return unsubscribe;
  }, [navigation, user, session, loading]);

  return (
    <LinearGradient
      colors={['#000000', '#0a0a0a', '#000000']}
      style={styles.container}
    >
      <View style={styles.content}>
        {/* App Icon */}
        <View style={styles.logoContainer}>
          <Image
            source={require('../../assets/app-icon-transparent.png')}
            style={styles.logo}
            resizeMode="contain"
          />
        </View>

        {/* Loading Indicator */}
        <ActivityIndicator size="large" color="#3491ff" style={styles.loader} />
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
    marginBottom: spacing[12],
  },
  logo: {
    width: 180,
    height: 180,
  },
  loader: {
    marginTop: spacing[4],
  },
});
