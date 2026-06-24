import { StatusBar } from 'react-native';
import { Tabs } from 'expo-router';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { useTheme } from '../../src/context/ThemeContext';
import { useAppMode } from '../../src/context/AppModeContext';

const GATE_ACCENT = '#22c55e';

export default function TabsLayout() {
  const { colors, activeTheme } = useTheme();
  const { isForgeMode, isGateMode } = useAppMode();

  useEffect(() => {
    SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
    StatusBar.setTranslucent(false);
    StatusBar.setBackgroundColor(colors.background);
    StatusBar.setBarStyle('light-content');
  }, [colors.background, activeTheme]);

  const accent = isGateMode ? GATE_ACCENT : colors.primary;

  const screenOptions = {
    headerShown: false,
    tabBarActiveTintColor: accent,
    tabBarInactiveTintColor: colors.textMuted,
    tabBarStyle: {
      backgroundColor: colors.background,
      borderTopColor: colors.borderMuted,
      borderTopWidth: 1,
      height: 60,
      paddingBottom: 8,
      paddingTop: 8,
    },
    tabBarLabelStyle: { display: 'none' as const },
    tabBarIconStyle: { marginTop: 0 },
  };

  const icon = (name: any) => ({ color }: { color: string }) => (
    <MaterialCommunityIcons name={name} size={26} color={color} />
  );

  if (isForgeMode) {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen name="forge-dashboard" options={{ tabBarIcon: icon('view-dashboard-outline') }} />
        <Tabs.Screen name="forge-events" options={{ tabBarIcon: icon('calendar-outline') }} />
        <Tabs.Screen name="forge-registrations" options={{ tabBarIcon: icon('account-group-outline') }} />
        <Tabs.Screen name="profile" options={{ tabBarIcon: icon('account-circle-outline') }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="chat" options={{ href: null }} />
        <Tabs.Screen name="wallet" options={{ href: null }} />
        <Tabs.Screen name="gate-scan" options={{ href: null }} />
        <Tabs.Screen name="gate-recent" options={{ href: null }} />
      </Tabs>
    );
  }

  if (isGateMode) {
    return (
      <Tabs screenOptions={screenOptions}>
        <Tabs.Screen name="gate-scan" options={{ tabBarIcon: icon('qrcode-scan') }} />
        <Tabs.Screen name="gate-recent" options={{ tabBarIcon: icon('clock-outline') }} />
        <Tabs.Screen name="profile" options={{ tabBarIcon: icon('account-circle-outline') }} />
        <Tabs.Screen name="index" options={{ href: null }} />
        <Tabs.Screen name="chat" options={{ href: null }} />
        <Tabs.Screen name="wallet" options={{ href: null }} />
        <Tabs.Screen name="forge-dashboard" options={{ href: null }} />
        <Tabs.Screen name="forge-events" options={{ href: null }} />
        <Tabs.Screen name="forge-registrations" options={{ href: null }} />
      </Tabs>
    );
  }

  // Discover mode (default)
  return (
    <Tabs screenOptions={screenOptions}>
      <Tabs.Screen
        name="index"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'home' : 'home-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="chat"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'message' : 'message-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="wallet"
        options={{
          tabBarIcon: ({ color, focused }) => (
            <MaterialCommunityIcons name={focused ? 'wallet' : 'wallet-outline'} size={26} color={color} />
          ),
        }}
      />
      <Tabs.Screen name="profile" options={{ href: null }} />
      <Tabs.Screen name="forge-dashboard" options={{ href: null }} />
      <Tabs.Screen name="forge-events" options={{ href: null }} />
      <Tabs.Screen name="forge-registrations" options={{ href: null }} />
      <Tabs.Screen name="gate-scan" options={{ href: null }} />
      <Tabs.Screen name="gate-recent" options={{ href: null }} />
    </Tabs>
  );
}
