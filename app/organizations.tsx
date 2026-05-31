import { Stack } from 'expo-router';
import OrganizationsListScreen from '../src/screens/OrganizationsListScreen';

export default function Organizations() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Organizations',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <OrganizationsListScreen />
    </>
  );
}
