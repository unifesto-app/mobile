import { Stack } from 'expo-router';
import AppearanceScreen from '../src/screens/AppearanceScreen';

export default function Appearance() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Appearance',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <AppearanceScreen />
    </>
  );
}
