import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import ForgeDashboardScreen from '../../src/screens/forge/ForgeDashboardScreen';
export default function ForgeDashboard() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Dashboard', headerShown: true, headerTransparent: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ForgeDashboardScreen />
    </>
  );
}
