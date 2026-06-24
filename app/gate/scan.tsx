import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import GateScanScreen from '../../src/screens/gate/GateScanScreen';
export default function GateScan() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Scan', headerShown: true, headerTransparent: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <GateScanScreen />
    </>
  );
}
