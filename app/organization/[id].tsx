import { Stack, useLocalSearchParams } from 'expo-router';
import OrganizationDetailScreen from '../../src/screens/OrganizationDetailScreen';

export default function OrganizationDetail() {
  const { id } = useLocalSearchParams<{ id: string }>();

  return (
    <>
      <Stack.Screen
        options={{
          title: 'Organization',
          headerShown: true,
          headerStyle: { backgroundColor: '#000000' },
          headerTintColor: '#3491ff',
          headerShadowVisible: true,
        }}
      />
      <OrganizationDetailScreen route={{ params: { organizationId: id } }} />
    </>
  );
}
