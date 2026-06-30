import { useEffect } from 'react';
import { View, ActivityIndicator } from 'react-native';
import { useRouter } from 'expo-router';

export default function AuthCallback() {
  const router = useRouter();

  useEffect(() => {
    // expo-auth-session's WebBrowser.maybeCompleteAuthSession()
    // should intercept this before the router ever renders it.
    // This is a safety net in case the redirect escapes to the OS.
    const timeout = setTimeout(() => {
      router.replace('/login');
    }, 1500);
    return () => clearTimeout(timeout);
  }, []);

  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#000' }}>
      <ActivityIndicator color="#fff" />
    </View>
  );
}
