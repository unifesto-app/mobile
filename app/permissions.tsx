import { Stack } from 'expo-router';
import PermissionsScreen from '../src/screens/PermissionsScreen';

export default function Permissions() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Permissions',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <PermissionsScreen />
    </>
  );
}
