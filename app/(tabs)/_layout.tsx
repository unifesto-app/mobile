import { Platform, StatusBar, DynamicColorIOS } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabsLayout() {
  const { colors, activeTheme } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      SystemUI.setBackgroundColorAsync(colors.background).catch(() => {});
      StatusBar.setTranslucent(false);
      StatusBar.setBackgroundColor(colors.background);
      StatusBar.setBarStyle(activeTheme === 'light' ? 'dark-content' : 'light-content');
    } else {
      StatusBar.setBarStyle(activeTheme === 'light' ? 'dark-content' : 'light-content');
    }
  }, [colors.background, activeTheme]);

  return (
    <NativeTabs
      tintColor={Platform.OS === 'ios' ? DynamicColorIOS({
        dark: colors.primary,
        light: colors.primary,
      }) : colors.primary}
    >
     <NativeTabs.Trigger
        name="home"
        options={{
          title: '',
          icon: {
            sf: 'house',
          },
          selectedIcon: {
            sf: 'house.fill',
          },
        }}
      />

      <NativeTabs.Trigger
        name="index"
        options={{
          title: '',
          icon: {
            sf: 'magnifyingglass'
          },
          selectedIcon: {
            sf: 'magnifyingglass',
          },
        }}
      />

      <NativeTabs.Trigger
        name="wallet"
        options={{
          title: '',
          icon: {
            sf: 'wallet.bifold',
          },
          selectedIcon: {
            sf: 'wallet.bifold.fill',
          },
        }}
      />
    </NativeTabs>
  );
}