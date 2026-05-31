import { Stack } from 'expo-router';
import WalletScreen from '../src/screens/WalletScreen';

export default function Wallet() {
  return (
    <>
      <Stack.Screen
        options={{
          title: 'Wallet',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <WalletScreen />
    </>
  );
}
