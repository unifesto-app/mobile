import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import TicketsScreen from '../src/screens/TicketsScreen';

export default function Tickets() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Tickets',
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
      <TicketsScreen />
    </>
  );
}
