import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import WalletScreen from '../src/screens/WalletScreen';

export default function Wallet() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wallet',
          headerShown: true,
          headerStyle: { 
            backgroundColor: colors.background,
          },
          headerTintColor: colors.text,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: colors.text,
          },
          headerShadowVisible: false,
          headerTransparent: false,
          headerBackButtonDisplayMode: 'minimal',
          presentation: 'card',
        }}
      />
      <WalletScreen />
    </>
  );
}
