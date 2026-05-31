import { Stack } from 'expo-router';
import TicketsScreen from '../src/screens/TicketsScreen';

export default function Tickets() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'My Tickets',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <TicketsScreen />
    </>
  );
}
