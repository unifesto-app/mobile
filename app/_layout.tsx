import React, { useEffect, useState } from 'react';
import { Slot, SplashScreen } from 'expo-router';
import * as Font from 'expo-font';
import { AuthProvider } from '../src/context/NewAuthContext';
import ConsentManager from '../src/services/ConsentManager';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Root Layout Component
 * 
 * CRITICAL PRIVACY COMPLIANCE FLOW:
 * 1. Show splash screen
 * 2. Initialize ConsentManager (requests ATT permission on iOS)
 * 3. ConsentManager initializes tracking SDKs ONLY if consent granted
 * 4. Load fonts and other resources
 * 5. Show app
 * 
 * This ensures NO tracking occurs before ATT consent on iOS.
 */
export default function RootLayout() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    async function initializeConsent() {
      try {
        // CRITICAL: Initialize ConsentManager FIRST
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
        // Load fonts
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
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((err) => {
          console.error('[RootLayout] Error hiding splash:', err);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <AuthProvider>
      <Slot />
    </AuthProvider>
  );
}
