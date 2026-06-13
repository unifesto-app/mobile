import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import PermissionsScreen from '../src/screens/PermissionsScreen';

export default function Permissions() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Permissions',
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
      <PermissionsScreen />
    </>
  );
}
