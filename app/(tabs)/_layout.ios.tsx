import { StatusBar, DynamicColorIOS, Appearance } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { useTheme } from '../../src/context/ThemeContext';
import { useAppMode } from '../../src/context/AppModeContext';

const GATE_ACCENT = '#22c55e';

export default function TabsLayout() {
  const { colors, activeTheme } = useTheme();
  const { isForgeMode, isGateMode, isDiscoverMode } = useAppMode();

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    Appearance.setColorScheme(activeTheme);
  }, [activeTheme]);

  const accent = isGateMode ? GATE_ACCENT : colors.primary;
  const tintColor = DynamicColorIOS({ dark: accent, light: accent });

  return (
    <NativeTabs tintColor={tintColor}>
      {/* ── Discover mode ── */}
      <NativeTabs.Trigger
        name="index"
        hidden={!isDiscoverMode}
        options={{ title: '', icon: { sf: 'house' }, selectedIcon: { sf: 'house.fill' } }}
      />
      <NativeTabs.Trigger
        name="chat"
        hidden={!isDiscoverMode}
        options={{ title: '', icon: { sf: 'message' }, selectedIcon: { sf: 'message.fill' } }}
      />
      <NativeTabs.Trigger
        name="wallet"
        hidden={!isDiscoverMode}
        options={{ title: '', icon: { sf: 'wallet.bifold' }, selectedIcon: { sf: 'wallet.bifold.fill' } }}
      />

      {/* ── Forge mode ── */}
      <NativeTabs.Trigger
        name="forge-dashboard"
        hidden={!isForgeMode}
        options={{ title: '', icon: { sf: 'square.grid.2x2' }, selectedIcon: { sf: 'square.grid.2x2.fill' } }}
      />
      <NativeTabs.Trigger
        name="forge-events"
        hidden={!isForgeMode}
        options={{ title: '', icon: { sf: 'calendar' }, selectedIcon: { sf: 'calendar' } }}
      />
      <NativeTabs.Trigger
        name="forge-registrations"
        hidden={!isForgeMode}
        options={{ title: '', icon: { sf: 'person.2' }, selectedIcon: { sf: 'person.2.fill' } }}
      />

      {/* ── Gate mode ── */}
      <NativeTabs.Trigger
        name="gate-scan"
        hidden={!isGateMode}
        options={{ title: '', icon: { sf: 'qrcode.viewfinder' }, selectedIcon: { sf: 'qrcode.viewfinder' } }}
      />
      <NativeTabs.Trigger
        name="gate-recent"
        hidden={!isGateMode}
        options={{ title: '', icon: { sf: 'clock' }, selectedIcon: { sf: 'clock.fill' } }}
      />
    </NativeTabs>
  );
}
