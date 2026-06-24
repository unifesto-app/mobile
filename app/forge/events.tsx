import { Stack } from 'expo-router';
import { useTheme } from '../../src/context/ThemeContext';
import ForgeEventsScreen from '../../src/screens/forge/ForgeEventsScreen';
export default function ForgeEvents() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{ title: 'My Events', headerShown: true, headerTransparent: false, headerStyle: { backgroundColor: colors.background }, headerTintColor: colors.text, headerShadowVisible: false }} />
      <ForgeEventsScreen />
    </>
  );
}
