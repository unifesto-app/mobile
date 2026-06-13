import React from 'react';
import { Stack } from 'expo-router';
import { View, TouchableOpacity, StyleSheet } from 'react-native';
import { Share2 } from 'lucide-react-native';
import { useTheme } from '../../src/context/ThemeContext';
import EventDetailScreen from '../../src/screens/EventDetailScreen';

export default function EventDetail() {
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Event Details',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#ffffff',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: true,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#ffffff',
          },
        }}
      />
      <EventDetailScreen />
    </>
  );
}

const styles = StyleSheet.create({
  headerRight: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingRight: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
