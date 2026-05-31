import { Stack } from 'expo-router';
import ReferralsScreen from '../src/screens/ReferralsScreen';

export default function Referrals() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Referrals',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <ReferralsScreen />
    </>
  );
}
