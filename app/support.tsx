import { Stack } from 'expo-router';
import SupportScreen from '../src/screens/SupportScreen';

export default function Support() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Support',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <SupportScreen />
    </>
  );
}
