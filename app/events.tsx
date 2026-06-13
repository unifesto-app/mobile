import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import EventsScreen from '../src/screens/EventsScreen';

export default function Events() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Events',
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
      <EventsScreen />
    </>
  );
}
