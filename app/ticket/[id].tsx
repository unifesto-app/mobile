import { Stack, useLocalSearchParams } from 'expo-router';
import TicketDetailScreen from '../../src/screens/TicketDetailScreen';

export default function TicketDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Ticket Details',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <TicketDetailScreen route={{ params: { ticketId: id } }} />
    </>
  );
}
