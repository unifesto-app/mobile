import { Stack } from 'expo-router';
import NotificationsScreen from '../src/screens/NotificationsScreen';

export default function Notifications() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Notifications',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <NotificationsScreen />
    </>
  );
}
