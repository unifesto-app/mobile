import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import NotificationsScreen from '../src/screens/NotificationsScreen';

export default function Notifications() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: colors.text,
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: true,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: colors.text,
          },
        }}
      />
      <NotificationsScreen />
    </>
  );
}
