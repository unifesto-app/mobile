import { Platform, StatusBar } from 'react-native';
import { NativeTabs } from 'expo-router/unstable-native-tabs';
import { useEffect } from 'react';
import * as SystemUI from 'expo-system-ui';

export default function TabsLayout() {
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
  }, []);

  return (
    <NativeTabs>
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
