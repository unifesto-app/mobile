import { Stack, useLocalSearchParams } from 'expo-router';
import TicketDetailScreen from '../../src/screens/TicketDetailScreen';

export default function TicketDetail() {
  const params = useLocalSearchParams<{ id: string; ticket?: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Your Ticket',
          headerShown: true,
          headerTransparent: true,
          headerTintColor: '#ffffff',
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: '#ffffff',
          },
        }}
      />
      <TicketDetailScreen route={{ params: { ticketId: params.id, ticket: params.ticket } }} />
    </>
  );
}
