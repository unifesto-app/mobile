import { Stack } from 'expo-router';
import EventsScreen from '../src/screens/EventsScreen';

export default function Events() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Events',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <EventsScreen />
    </>
  );
}
