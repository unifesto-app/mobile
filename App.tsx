import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import { Slot } from 'expo-router';
import ConsentManager from './src/services/ConsentManager';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

/**
 * Main App Component
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
export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [consentReady, setConsentReady] = useState(false);

  useEffect(() => {
    async function initializeConsent() {
      try {
        // CRITICAL: Initialize ConsentManager FIRST
        // This will:
        // 1. Request ATT permission on iOS (if needed)
        // 2. Initialize tracking SDKs ONLY if consent granted
        // 3. Respect user's previous consent choice
        const consentState = await ConsentManager.initialize();
        
        setConsentReady(true);
      } catch (error) {
        console.error('[App] Consent initialization error:', error);
        // Continue anyway - app should work without tracking
        setConsentReady(true);
      }
    }

    initializeConsent();
  }, []);

  useEffect(() => {
    async function prepare() {
      // Wait for consent to be handled before loading other resources
      if (!consentReady) {
        return;
      }

      try {
        // Load fonts
        await Font.loadAsync({
          'Agrandir-Regular': require('./assets/fonts/Agrandir/Agrandir-Regular.otf'),
          'Agrandir-Bold': require('./assets/fonts/Agrandir/Agrandir-Bold.ttf'),
          'SweetApricot': require('./assets/fonts/SweetApricot/SweetApricot.ttf'),
        });
      } catch (e) {
        console.error('[App] Font loading error:', e);
        // Continue anyway - app can work with system fonts
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, [consentReady]);

  useEffect(() => {
    if (appIsReady) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((err) => {
          console.error('[App] Error hiding splash:', err);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  // Keep splash screen visible until app is ready
  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <Slot />
          <StatusBar style="light" />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
