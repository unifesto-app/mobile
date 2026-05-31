import { Redirect } from 'expo-router';
import { useAuth } from '../src/context/AuthContext';
import AuthLoadingScreen from '../src/screens/AuthLoadingScreen';

/**
 * Root index - handles initial routing based on auth state
 */
export default function Index() {
  const { user, loading } = useAuth();

  if (loading) {
    return <AuthLoadingScreen />;
  }

  if (!user) {
    return <Redirect href="/login" />;
  }

  return <Redirect href="/(tabs)" />;
}
