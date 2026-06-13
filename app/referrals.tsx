import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import ReferralsScreen from '../src/screens/ReferralsScreen';

export default function Referrals() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Referrals',
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
      <ReferralsScreen />
    </>
  );
}
