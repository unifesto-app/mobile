import { Stack, useLocalSearchParams } from 'expo-router';
import EventDetailScreen from '../../src/screens/EventDetailScreen';

export default function EventDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Event Details',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <EventDetailScreen route={{ params: { eventId: id } }} />
    </>
  );
}
