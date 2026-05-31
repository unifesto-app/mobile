/**
 * New Authentication Context
 * Mobile-number-centric authentication using the new backend API
 */

import React, { createContext, useState, useEffect, useContext, useCallback } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import * as Google from 'expo-auth-session/providers/google';
import * as WebBrowser from 'expo-web-browser';
import OneSignalService from '../services/OneSignalService';
import FirebaseAnalyticsService from '../services/FirebaseAnalyticsService';
import * as AuthAPI from '../lib/api/auth';

WebBrowser.maybeCompleteAuthSession();

const STORAGE_KEY = '@unifesto:auth';
const TEMP_TOKEN_KEY = '@unifesto:temp_token';

interface AuthState {
  accessToken: string | null;
  user: AuthAPI.User | null;
  tempToken: string | null;
  requiresMobileVerification: boolean;
}

interface AuthContextType {
  user: AuthAPI.User | null;
  accessToken: string | null;
  loading: boolean;
  tempToken: string | null;
  requiresMobileVerification: boolean;
  
  // Email OTP flow
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  
  // Mobile OTP flow (for verification after social login)
  sendMobileOtp: (mobileNumber: string) => Promise<void>;
  verifyMobileOtp: (mobileNumber: string, otp: string) => Promise<void>;
  
  // Social login
  signInWithGoogle: () => Promise<void>;
  signInWithApple: () => Promise<void>;
  
  // Session management
  refreshSession: () => Promise<void>;
  signOut: () => Promise<void>;
  
  // Utilities
  isAppleAuthAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  accessToken: null,
  loading: true,
  tempToken: null,
  requiresMobileVerification: false,
  sendEmailOtp: async () => {},
  verifyEmailOtp: async () => {},
  sendMobileOtp: async () => {},
  verifyMobileOtp: async () => {},
  signInWithGoogle: async () => {},
  signInWithApple: async () => {},
  refreshSession: async () => {},
  signOut: async () => {},
  isAppleAuthAvailable: false,
});

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [authState, setAuthState] = useState<AuthState>({
    accessToken: null,
    user: null,
    tempToken: null,
    requiresMobileVerification: false,
  });
  const [loading, setLoading] = useState(true);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);

  // Google OAuth configuration
  const [googleRequest, googleResponse, googlePromptAsync] = Google.useAuthRequest({
    expoClientId: process.env.EXPO_PUBLIC_GOOGLE_EXPO_CLIENT_ID,
    iosClientId: process.env.EXPO_PUBLIC_GOOGLE_IOS_CLIENT_ID,
    androidClientId: process.env.EXPO_PUBLIC_GOOGLE_ANDROID_CLIENT_ID,
    webClientId: process.env.EXPO_PUBLIC_GOOGLE_WEB_CLIENT_ID,
  });

  // Check if Apple Authentication is available
  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === 'ios') {
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setIsAppleAuthAvailable(isAvailable);
      }
    };
    checkAppleAuth();
  }, []);

  // Load auth state from storage on mount
  useEffect(() => {
    loadAuthState();
  }, []);

  // Handle Google OAuth response
  useEffect(() => {
    if (googleResponse?.type === 'success') {
      const { id_token } = googleResponse.params;
      handleGoogleLogin(id_token);
    }
  }, [googleResponse]);

  // Update OneSignal and Firebase when user changes
  useEffect(() => {
    if (authState.user && authState.accessToken) {
      // Set user ID in OneSignal
      OneSignalService.login(authState.user.id);
      
      // Set user ID in Firebase Analytics
      FirebaseAnalyticsService.setUserId(authState.user.id);
      FirebaseAnalyticsService.setUserProperties({
        user_type: 'authenticated',
        mobile_verified: authState.user.mobileVerified ? 'true' : 'false',
      });
    } else {
      // User logged out
      OneSignalService.logout();
      FirebaseAnalyticsService.setUserId(null);
      FirebaseAnalyticsService.resetAnalyticsData();
    }
  }, [authState.user, authState.accessToken]);

  const loadAuthState = async () => {
    try {
      const stored = await AsyncStorage.getItem(STORAGE_KEY);
      const tempToken = await AsyncStorage.getItem(TEMP_TOKEN_KEY);
      
      if (stored) {
        const parsed: AuthState = JSON.parse(stored);
        setAuthState({
          ...parsed,
          tempToken: tempToken || parsed.tempToken,
        });
        
        // Validate session
        if (parsed.accessToken) {
          try {
            const { user } = await AuthAPI.getSession(parsed.accessToken);
            setAuthState(prev => ({ ...prev, user }));
          } catch (error) {
            // Session invalid, clear auth
            await clearAuthState();
          }
        }
      }
    } catch (error) {
      console.error('Failed to load auth state:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveAuthState = async (state: AuthState) => {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(state));
      if (state.tempToken) {
        await AsyncStorage.setItem(TEMP_TOKEN_KEY, state.tempToken);
      } else {
        await AsyncStorage.removeItem(TEMP_TOKEN_KEY);
      }
      setAuthState(state);
    } catch (error) {
      console.error('Failed to save auth state:', error);
    }
  };

  const clearAuthState = async () => {
    try {
      await AsyncStorage.removeItem(STORAGE_KEY);
      await AsyncStorage.removeItem(TEMP_TOKEN_KEY);
      setAuthState({
        accessToken: null,
        user: null,
        tempToken: null,
        requiresMobileVerification: false,
      });
    } catch (error) {
      console.error('Failed to clear auth state:', error);
    }
  };

  const handleAuthResponse = async (response: AuthAPI.AuthResponse) => {
    if (response.requiresMobileVerification && response.tempToken) {
      // Need mobile verification
      await saveAuthState({
        accessToken: null,
        user: response.user,
        tempToken: response.tempToken,
        requiresMobileVerification: true,
      });
    } else {
      // Fully authenticated
      await saveAuthState({
        accessToken: response.accessToken,
        user: response.user,
        tempToken: null,
        requiresMobileVerification: false,
      });
      
      // Log login event
      FirebaseAnalyticsService.logLogin('custom');
    }
  };

  const sendEmailOtp = async (email: string) => {
    try {
      await AuthAPI.sendEmailOtp(email);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    try {
      const response = await AuthAPI.verifyEmailOtp(email, otp);
      await handleAuthResponse(response);
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP');
    }
  };

  const sendMobileOtp = async (mobileNumber: string) => {
    if (!authState.tempToken) {
      throw new Error('No temp token available. Please login first.');
    }
    
    try {
      await AuthAPI.sendMobileOtp(mobileNumber, authState.tempToken);
    } catch (error: any) {
      throw new Error(error.message || 'Failed to send OTP');
    }
  };

  const verifyMobileOtp = async (mobileNumber: string, otp: string) => {
    if (!authState.tempToken) {
      throw new Error('No temp token available. Please login first.');
    }
    
    try {
      const response = await AuthAPI.verifyMobileOtp(
        mobileNumber,
        otp,
        authState.tempToken
      );
      await handleAuthResponse(response);
    } catch (error: any) {
      throw new Error(error.message || 'Invalid OTP');
    }
  };

  const handleGoogleLogin = async (idToken: string) => {
    try {
      const response = await AuthAPI.loginWithGoogle(idToken);
      await handleAuthResponse(response);
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const signInWithGoogle = async () => {
    try {
      await googlePromptAsync();
    } catch (error: any) {
      throw new Error(error.message || 'Google login failed');
    }
  };

  const signInWithApple = async () => {
    if (!isAppleAuthAvailable) {
      throw new Error('Apple Sign In is not available on this device');
    }

    try {
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken || !credential.authorizationCode) {
        throw new Error('No credentials received from Apple');
      }

      const response = await AuthAPI.loginWithApple(
        credential.identityToken,
        credential.authorizationCode
      );
      await handleAuthResponse(response);
    } catch (error: any) {
      if (error.code === 'ERR_CANCELED' || error.code === 'ERR_REQUEST_CANCELED') {
        throw new Error('Login cancelled');
      }
      throw new Error(error.message || 'Apple login failed');
    }
  };

  const refreshSession = async () => {
    if (!authState.accessToken) {
      return;
    }

    try {
      const { user } = await AuthAPI.getSession(authState.accessToken);
      setAuthState(prev => ({ ...prev, user }));
    } catch (error) {
      // Session invalid, clear auth
      await clearAuthState();
    }
  };

  const signOut = async () => {
    try {
      if (authState.accessToken) {
        await AuthAPI.logout(authState.accessToken);
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      await clearAuthState();
    }
  };

  const value: AuthContextType = {
    user: authState.user,
    accessToken: authState.accessToken,
    loading,
    tempToken: authState.tempToken,
    requiresMobileVerification: authState.requiresMobileVerification,
    sendEmailOtp,
    verifyEmailOtp,
    sendMobileOtp,
    verifyMobileOtp,
    signInWithGoogle,
    signInWithApple,
    refreshSession,
    signOut,
    isAppleAuthAvailable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
