import React, { useState, useEffect } from 'react';
import { Stack, useLocalSearchParams } from 'expo-router';
import { View, TouchableOpacity, Share, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MenuView } from '@react-native-menu/menu';
import { useTheme } from '../../src/context/ThemeContext';
import { useAuth } from '../../src/context/AuthContext';
import TicketDetailScreen from '../../src/screens/TicketDetailScreen';

export default function TicketDetail() {
  const params = useLocalSearchParams<{ id: string; ticket?: string }>();
  const { colors, activeTheme } = useTheme();
  const { user } = useAuth();
  const [ticket, setTicket] = useState<any>(null);

  const handleShare = async () => {
    try {
      await Share.share({
        message: `Check out my ticket on Unifesto!`,
        url: `https://unifesto.app/ticket/${params.id}`,
      });
    } catch (e) {}
  };

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Your Ticket',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#ffffff',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#ffffff',
          },
          headerRight: () => (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4, paddingRight: 4 }}>
              <TouchableOpacity
                onPress={handleShare}
                style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }}
                activeOpacity={0.7}
              >
                <Ionicons name="share-outline" size={24} color="#ffffff" />
              </TouchableOpacity>
              <MenuView
                title="Ticket Options"
                onPressAction={({ nativeEvent }) => {
                  if (nativeEvent.event === 'download') Alert.alert('Download', 'Download functionality coming soon');
                  else if (nativeEvent.event === 'report') Alert.alert('Report', 'Report functionality coming soon');
                }}
                actions={[
                  { id: 'download', title: 'Download Ticket' },
                  { id: 'report', title: 'Report Issue', attributes: { destructive: true } },
                ]}
                shouldOpenOnLongPress={false}
              >
                <TouchableOpacity style={{ width: 36, height: 36, alignItems: 'center', justifyContent: 'center' }} activeOpacity={0.7}>
                  <Ionicons name="ellipsis-horizontal" size={24} color="#ffffff" />
                </TouchableOpacity>
              </MenuView>
            </View>
          ),
        }}
      />
      <TicketDetailScreen route={{ params: { ticketId: params.id, ticket: params.ticket } }} />
    </>
  );
}
