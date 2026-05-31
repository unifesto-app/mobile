import { Stack } from 'expo-router';
import RegistrationSuccessScreen from '../src/screens/RegistrationSuccessScreen';

export default function RegistrationSuccess() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Registration Success',
          headerShown: false,
          presentation: 'modal',
        }}
      />
      <RegistrationSuccessScreen />
    </>
  );
}
