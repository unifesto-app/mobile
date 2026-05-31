import { Stack } from 'expo-router';
import AccountScreen from '../src/screens/AccountScreen';

export default function Account() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Edit Profile',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <AccountScreen />
    </>
  );
}
