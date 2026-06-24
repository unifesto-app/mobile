import { Platform, StatusBar, DynamicColorIOS } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '../../src/context/ThemeContext';
import { useAppMode } from '../../src/context/AppModeContext';

const GATE_ACCENT = '#22c55e';

export default function TabsLayout() {
  const { colors, activeTheme } = useTheme();
  const { isForgeMode, isGateMode } = useAppMode();

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(colors.background);
      StatusBar.setBarStyle('light-content');
    } else {
      StatusBar.setBarStyle('light-content');
    }
  }, [colors.background, activeTheme]);

  const accent = isGateMode ? GATE_ACCENT : colors.primary;
  const tintColor = Platform.OS === 'ios'
    ? DynamicColorIOS({ dark: accent, light: accent })
    : accent;

  if (isForgeMode) {
    return (
      <NativeTabs tintColor={tintColor}>
        <NativeTabs.Trigger
          name="forge-dashboard"
          options={{ title: 'Dashboard', icon: { sf: 'square.grid.2x2' }, selectedIcon: { sf: 'square.grid.2x2.fill' } }}
        />
        <NativeTabs.Trigger
          name="forge-events"
          options={{ title: 'Events', icon: { sf: 'calendar' }, selectedIcon: { sf: 'calendar' } }}
        />
        <NativeTabs.Trigger
          name="forge-registrations"
          options={{ title: 'Attendees', icon: { sf: 'person.2' }, selectedIcon: { sf: 'person.2.fill' } }}
        />
        <NativeTabs.Trigger
          name="profile"
          options={{ title: 'Profile', icon: { sf: 'person.crop.circle' }, selectedIcon: { sf: 'person.crop.circle.fill' } }}
        />
      </NativeTabs>
    );
  }

  if (isGateMode) {
    return (
      <NativeTabs tintColor={tintColor}>
        <NativeTabs.Trigger
          name="gate-scan"
          options={{ title: 'Scan', icon: { sf: 'qrcode.viewfinder' }, selectedIcon: { sf: 'qrcode.viewfinder' } }}
        />
        <NativeTabs.Trigger
          name="gate-recent"
          options={{ title: 'Recent', icon: { sf: 'clock' }, selectedIcon: { sf: 'clock.fill' } }}
        />
        <NativeTabs.Trigger
          name="profile"
          options={{ title: 'Profile', icon: { sf: 'person.crop.circle' }, selectedIcon: { sf: 'person.crop.circle.fill' } }}
        />
      </NativeTabs>
    );
  }

  // Discover mode (default)
  return (
    <NativeTabs tintColor={tintColor}>
      <NativeTabs.Trigger
        name="index"
        options={{ title: '', icon: { sf: 'house' }, selectedIcon: { sf: 'house.fill' } }}
      />
      <NativeTabs.Trigger
        name="chat"
        options={{ title: '', icon: { sf: 'message' }, selectedIcon: { sf: 'message.fill' } }}
      />
      <NativeTabs.Trigger
        name="wallet"
        options={{ title: '', icon: { sf: 'wallet.bifold' }, selectedIcon: { sf: 'wallet.bifold.fill' } }}
      />
      <NativeTabs.Trigger
        name="profile"
        options={{ title: '', icon: { sf: 'person.crop.circle' }, selectedIcon: { sf: 'person.crop.circle.fill' } }}
      />
    </NativeTabs>
  );
}
