import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import ForgeRegistrationsScreen from '../../src/screens/forge/ForgeRegistrationsScreen';
export default function ForgeRegistrations() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'Registrations', headerShown: true, headerTransparent: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ForgeRegistrationsScreen />
    </>
  );
}
