import React, { useEffect, useState } from 'react';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import * as SplashScreen from 'expo-splash-screen';
import * as Font from 'expo-font';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { AuthProvider } from './src/context/AuthContext';
import AppNavigator from './src/navigation/AppNavigator';
import OneSignalService from './src/services/OneSignalService';

// Keep the splash screen visible while we fetch resources
SplashScreen.preventAutoHideAsync();

export default function App() {
  const [appIsReady, setAppIsReady] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  useEffect(() => {
    async function prepare() {
      try {
        // Initialize OneSignal
        OneSignalService.initialize();

        // Load only the fonts that exist
        await Font.loadAsync({
          'Agrandir-Regular': require('./assets/fonts/Agrandir/Agrandir-Regular.otf'),
          'Agrandir-Bold': require('./assets/fonts/Agrandir/Agrandir-Bold.ttf'),
          'SweetApricot': require('./assets/fonts/SweetApricot/SweetApricot.ttf'),
        });
      } catch (e) {
        console.error('Font loading error:', e);
        setError(e as Error);
        // Continue anyway - app can work with system fonts
      } finally {
        setAppIsReady(true);
      }
    }

    prepare();
  }, []);

  useEffect(() => {
    if (appIsReady) {
      // Small delay to ensure everything is ready
      const timer = setTimeout(() => {
        SplashScreen.hideAsync().catch((err) => {
          console.error('Error hiding splash:', err);
        });
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [appIsReady]);

  if (!appIsReady) {
    return null;
  }

  return (
    <SafeAreaProvider>
      <AuthProvider>
        <View style={{ flex: 1 }}>
          <AppNavigator />
          <StatusBar style="light" />
        </View>
      </AuthProvider>
    </SafeAreaProvider>
  );
}
