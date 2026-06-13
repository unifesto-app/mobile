import React, { useEffect, useState } from 'react';
import { Stack, SplashScreen as ExpoSplashScreen } from 'expo-router';
import * as Font from 'expo-font';
import { AuthProvider } from '../src/context/AuthContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import ConsentManager from '../src/services/ConsentManager';

ExpoSplashScreen.preventAutoHideAsync();

function RootStack() {
  const { colors, activeTheme } = useTheme();

  return (
    <AuthProvider>
      <Stack
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: colors.background },
        }}
      >
        <Stack.Screen name="index" options={{ headerShown: false }} />
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="signup" options={{ headerShown: false }} />
        <Stack.Screen name="onboarding" options={{ headerShown: false }} />
      </Stack>
    </AuthProvider>
  );
}

export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    async function initializeConsent() {
      try {
        await ConsentManager.initialize();
        setConsentReady(true);
      } catch (error) {
        console.error('[RootLayout] Consent initialization error:', error);
        setConsentReady(true);
      }
    }

    initializeConsent();
  }, []);

  useEffect(() => {
    async function prepare() {
      if (!consentReady) {
        return;
      }

      try {
        await Font.loadAsync({
          'Agrandir-Regular': require('../assets/fonts/Agrandir/Agrandir-Regular.otf'),
          'Agrandir-Bold': require('../assets/fonts/Agrandir/Agrandir-Bold.ttf'),
          'SweetApricot': require('../assets/fonts/SweetApricot/SweetApricot.ttf'),
        });
      } catch (e) {
        console.error('[RootLayout] Font loading error:', e);
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [consentReady]);

  useEffect(() => {
    if (appIsReady) {
      // Hide native splash screen immediately when ready
      ExpoSplashScreen.hideAsync().catch((err) => {
        console.error('[RootLayout] Error hiding splash:', err);
      });
    }
  }, [appIsReady]);

  // Don't render anything until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <ThemeProvider>
      <RootStack />
    </ThemeProvider>
  );
}
