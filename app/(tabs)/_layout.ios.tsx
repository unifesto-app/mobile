import { StatusBar, DynamicColorIOS, Appearance } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import { useTheme } from '../../src/context/ThemeContext';

export default function TabsLayout() {
  const { colors, activeTheme } = useTheme();

  useEffect(() => {
    // Set status bar style based on theme
    StatusBar.setBarStyle('light-content');
    
    // Force iOS appearance to match theme for tab bar background
    // This will make the native tab bar respect the system dark/light mode
    Appearance.setColorScheme(activeTheme);
  }, [activeTheme]);

  return (
    <NativeTabs
      tintColor={DynamicColorIOS({
        dark: colors.primary,
        light: colors.primary,
      })}
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
