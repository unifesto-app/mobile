import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Alert,
} from 'react-native';
import { useRouter } from 'expo-router';
import * as SecureStore from 'expo-secure-store';
import { useAuth } from '../src/context/AuthContext';
import { completeOnboarding } from '../src/lib/api/profile';

export default function ReferralScreen() {
  const router = useRouter();
  const { refreshUser } = useAuth();
  const [referralCode, setReferralCode] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    SecureStore.getItemAsync('pendingReferralCode').then(code => {
      if (code) {
        setReferralCode(code);
        SecureStore.deleteItemAsync('pendingReferralCode');
      }
    });
  }, []);

  const handleSubmit = async (skip = false) => {
    setIsLoading(true);
    try {
      if (!skip && referralCode.trim()) {
        await completeOnboarding({ referralCode: referralCode.trim() });
        await refreshUser();
      }
      router.replace('/(tabs)');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to apply referral code');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={styles.container}
    >
      <View style={styles.content}>
        <Text style={styles.emoji}>🎉</Text>
        <Text style={styles.title}>Welcome to Unifesto!</Text>
        <Text style={styles.subtitle}>
          Got a referral code? Enter it below to unlock rewards.
        </Text>

        <TextInput
          style={styles.input}
          value={referralCode}
          onChangeText={setReferralCode}
          placeholder="Referral code (optional)"
          placeholderTextColor="#666"
          autoCapitalize="characters"
          autoCorrect={false}
          autoFocus
        />

        <TouchableOpacity
          style={styles.button}
          onPress={() => handleSubmit(false)}
          disabled={isLoading}
        >
          <Text style={styles.buttonText}>
            {isLoading ? 'Applying...' : 'Continue'}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.skipButton}
          onPress={() => handleSubmit(true)}
          disabled={isLoading}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#000',
  },
  content: {
    flex: 1,
    padding: 24,
    justifyContent: 'center',
  },
  emoji: {
    fontSize: 48,
    textAlign: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    textAlign: 'center',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 15,
    color: '#999',
    textAlign: 'center',
    marginBottom: 40,
    lineHeight: 22,
  },
  input: {
    height: 52,
    borderWidth: 1,
    borderColor: '#333',
    borderRadius: 12,
    paddingHorizontal: 16,
    fontSize: 18,
    color: '#fff',
    backgroundColor: '#111',
    letterSpacing: 2,
    marginBottom: 16,
    textAlign: 'center',
  },
  button: {
    height: 52,
    borderRadius: 12,
    backgroundColor: '#7C3AED',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  skipButton: {
    height: 44,
    justifyContent: 'center',
    alignItems: 'center',
  },
  skipText: {
    color: '#666',
    fontSize: 15,
  },
});
