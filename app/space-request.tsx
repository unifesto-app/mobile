import { Stack } from 'expo-router';
import { useTheme } from '../src/context/ThemeContext';
import SpaceRequestScreen from '../src/screens/SpaceRequestScreen';

export default function SpaceRequest() {
  const { colors } = useTheme();
  return (
    <>
      <Stack.Screen options={{
        title: 'Request a Space',
       headerShown: true,
          headerTransparent: true,
          headerTintColor: colors.text,
          headerBackButtonDisplayMode: 'minimal',
          headerShadowVisible: true,
          headerTitleStyle: {
            fontWeight: '600',
            fontSize: 18,
            color: colors.text,
          }
      }} />
      <SpaceRequestScreen />
    </>
  );
}
