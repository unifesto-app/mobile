import { Stack } from 'expo-router';
import NewProfileScreen from '../src/screens/NewProfileScreen';

export default function Profile() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Profile',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <NewProfileScreen />
    </>
  );
}
