import { Stack, useLocalSearchParams } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import TicketDetailScreen from '../../src/screens/TicketDetailScreen';

export default function TicketDetail() {
  const params = useLocalSearchParams<{ id: string; ticket?: string }>();
  const { colors } = useTheme();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Your Ticket',
          headerShown: true,
          headerTransparent: false,
          headerStyle: { backgroundColor: colors.background },
          headerTintColor: colors.text,
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: false,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: colors.text,
          },
        }}
      />
      <TicketDetailScreen route={{ params: { ticketId: params.id, ticket: params.ticket } }} />
    </>
  );
}
