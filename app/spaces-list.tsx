import React from 'react';
import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import SpacesListScreen from '../src/screens/SpacesListScreen';

export default function Organizations() {
  const { colors } = useTheme();
  
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Organizations',
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
      <SpacesListScreen />
    </>
  );
}
