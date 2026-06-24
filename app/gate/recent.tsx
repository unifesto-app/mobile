import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import GateRecentScreen from '../../src/screens/gate/GateRecentScreen';
export default function GateRecent() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Recent Check-ins', headerShown: true, headerTransparent: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <GateRecentScreen />
    </>
  );
}
