import { useEffect } from 'react';
import { useLocalSearchParams, useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';

export default function SignupDeepLink() {
  const { ref } = useLocalSearchParams<{ ref: string }>();
  const router = useRouter();

  useEffect(() => {
    async function capture() {
      if (ref) {
        // Store the referral code so the referral screen can pick it up
        await SecureStore.setItemAsync('pendingReferralCode', ref.toUpperCase());
      }
      // Redirect to login
      router.replace('/login');
    }
    capture();
  }, [ref]);

  return null;
}
