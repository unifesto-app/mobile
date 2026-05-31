import { Stack } from 'expo-router';
import NotificationSettingsScreen from '../src/screens/NotificationSettingsScreen';

export default function NotificationSettings() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notification Settings',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <NotificationSettingsScreen />
    </>
  );
}
