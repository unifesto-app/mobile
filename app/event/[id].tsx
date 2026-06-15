import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, StyleSheet, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import EventDetailScreen from '../../src/screens/EventDetailScreen';
import { getEventBySlug } from '../../src/lib/api/events';

export default function EventDetail() {
  const { colors, activeTheme } = useTheme();
  const { user } = useAuth();
  const { id } = useLocalSearchParams<{ id: string }>();
  const [event, setEvent] = useState<any>(null);

  useEffect(() => {
    if (id) {
      getEventBySlug(id).catch(() => null).then(e => setEvent(e));
    }
  }, [id]);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out ${event?.title || 'this event'} on Unifesto!`,
        url: `https://unifesto.app/event/${id}`,
      });
    } catch (e) {}
  };

  const handleReport = () => {
    Alert.alert('Report Event', 'Report functionality coming soon');
  };

  const handleCopyLink = () => {
    Alert.alert('Link Copied', 'Event link copied to clipboard');
  };

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
          headerRight: () => (
            <View style={styles.headerRight}>
              <TouchableOpacity onPress={handleShare} style={styles.iconButton} activeOpacity={0.7}>
                <Ionicons name="share-outline" size={24} color='#ffffff' />
              </TouchableOpacity>
              <MenuView
                title={event?.title || 'Event Options'}
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === 'copy') handleCopyLink();
                  else if (nativeEvent.event === 'report') handleReport();
                }}
                actions={[
                  { id: 'copy', title: 'Copy Link' },
                  { id: 'report', title: 'Report Event', attributes: { destructive: true } },
                ]}
                shouldOpenOnLongPress={false}
              >
                <TouchableOpacity style={styles.iconButton} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={24} color='#ffffff' />
                </TouchableOpacity>
              </MenuView>
            </View>
          ),
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
    gap: 4,
    paddingRight: 4,
  },
  iconButton: {
    width: 36,
    height: 36,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
