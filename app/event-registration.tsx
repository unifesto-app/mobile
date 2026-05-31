import { Stack } from 'expo-router';
import EventRegistrationScreen from '../src/screens/EventRegistrationScreen';

export default function EventRegistration() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Event Registration',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <EventRegistrationScreen />
    </>
  );
}
