import React, { useEffect, useState } from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { Stack } from 'expo-router';
import * as Font from 'expo-font';
import { AuthProvider } from '../src/context/AuthContext';
import { AppModeProvider } from '../src/context/AppModeContext';
import { ThemeProvider, useTheme } from '../src/context/ThemeContext';
import ConsentManager from '../src/services/ConsentManager';

// Preload UnIcon assets
import { Asset } from 'expo-asset';


const preloadIcons = async () => {
  const icons: any[] = [];
  await Asset.loadAsync(icons as any[]);
};

function RootStack() {
  const { colors } = useTheme();

  return (
    <AuthProvider>
      <AppModeProvider>
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
      </AppModeProvider>
    </AuthProvider>
  );
}

preloadIcons().catch(() => {});

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

  // Don't render anything until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <RootStack />
      </ThemeProvider>
    </SafeAreaProvider>
  );
}
