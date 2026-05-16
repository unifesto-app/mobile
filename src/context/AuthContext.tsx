import React, { createContext, useState, useEffect, useContext } from 'react';
import { supabase, isSupabaseConfigured } from '../config/supabase';
import { Session, User } from '@supabase/supabase-js';
import * as WebBrowser from 'expo-web-browser';
import { Platform } from 'react-native';
import * as AppleAuthentication from 'expo-apple-authentication';
import OneSignalService from '../services/OneSignalService';
import FirebaseAnalyticsService from '../services/FirebaseAnalyticsService';

WebBrowser.maybeCompleteAuthSession();

interface SignUpMetadata {
  name: string;
  phone: string;
  organization?: string;
}

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<{ error: any }>;
  signUp: (email: string, password: string, metadata: SignUpMetadata, referralCode?: string) => Promise<{ error: any }>;
  signOut: () => Promise<void>;
  signInWithGoogle: () => Promise<{ error: any }>;
  signInWithApple: () => Promise<{ error: any }>;
  resetPassword: (email: string) => Promise<{ error: any }>;
  isConfigured: boolean;
  isAppleAuthAvailable: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  loading: true,
  signIn: async () => ({ error: null }),
  signUp: async () => ({ error: null }),
  signOut: async () => {},
  signInWithGoogle: async () => ({ error: null }),
  signInWithApple: async () => ({ error: null }),
  resetPassword: async () => ({ error: null }),
  isConfigured: false,
  isAppleAuthAvailable: false,
});

// Store pending referral code temporarily
let pendingReferralCode: string | null = null;

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);
  const [isAppleAuthAvailable, setIsAppleAuthAvailable] = useState(false);
  const isConfigured = isSupabaseConfigured();

  // Check if Apple Authentication is available
  useEffect(() => {
    const checkAppleAuth = async () => {
      if (Platform.OS === 'ios') {
        // Check if Apple Auth is available on this device
        const isAvailable = await AppleAuthentication.isAvailableAsync();
        setIsAppleAuthAvailable(isAvailable);
      } else {
        // Not iOS, so Apple Auth is not available
        setIsAppleAuthAvailable(false);
      }
    };
    checkAppleAuth();
  }, []);

  // Initialize auth and listen for changes
  useEffect(() => {
    // Only initialize auth if Supabase is configured
    if (!isConfigured || !supabase) {
      setLoading(false);
      return;
    }

    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);
    });

    // Listen for auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      setLoading(false);

      // Update OneSignal user identification
      if (session?.user) {
        // Request notification permission if not already granted
        try {
          const hasNotificationPermission = OneSignalService.hasPermission();
          if (!hasNotificationPermission) {
            await OneSignalService.requestPermission();
          }
        } catch (error) {
        }

        // Create profile if it doesn't exist (important for social logins and new signups)
        try {
          const response = await fetch(`${process.env.EXPO_PUBLIC_API_URL || 'https://api.unifesto.app'}/auth/sync`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${session.access_token}`,
              'Content-Type': 'application/json',
            },
          });
          
          if (!response.ok) {
            const errorText = await response.text();
          }
        } catch (error) {
        }

        // Apply pending referral code if exists (for new signups)
        if (pendingReferralCode && event === 'SIGNED_IN') {
          try {
            const { applyReferralCode } = require('../lib/api/wallet');
            await applyReferralCode(pendingReferralCode);
          } catch (error) {
          } finally {
            // Clear the pending referral code
            pendingReferralCode = null;
          }
        }

        // Set user ID in OneSignal
        OneSignalService.login(session.user.id);
        
        // Set user email if available
        if (session.user.email) {
          OneSignalService.setEmail(session.user.email);
        }

        // Set user ID in Firebase Analytics
        FirebaseAnalyticsService.setUserId(session.user.id);
        
        // Set user properties in Firebase Analytics
        FirebaseAnalyticsService.setUserProperties({
          user_type: 'authenticated',
          email_verified: session.user.email_confirmed_at ? 'true' : 'false',
        });

        // Log login event
        FirebaseAnalyticsService.logLogin('email');
      } else {
        // User logged out, remove OneSignal identification
        OneSignalService.logout();
        
        // Reset Firebase Analytics
        FirebaseAnalyticsService.setUserId(null);
        FirebaseAnalyticsService.resetAnalyticsData();
      }
    });

    return () => subscription.unsubscribe();
  }, [isConfigured]);

  const signIn = async (email: string, password: string) => {
    if (!isConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase environment variables.' 
        } 
      };
    }

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const signUp = async (email: string, password: string, metadata: SignUpMetadata, referralCode?: string) => {
    if (!isConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase environment variables.' 
        } 
      };
    }

    try {
      // Store referral code to be applied after session is established
      if (referralCode && referralCode.trim()) {
        pendingReferralCode = referralCode.trim().toUpperCase();
      }

      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name: metadata.name,
            phone: metadata.phone,
            organization: metadata.organization,
          },
        },
      });
      return { error };
    } catch (err: any) {
      // Clear pending referral code on error
      pendingReferralCode = null;
      return { error: err };
    }
  };

  const signOut = async () => {
    if (!isConfigured || !supabase) {
      return;
    }

    try {
      // Clear local state immediately
      setSession(null);
      setUser(null);
      
      // Sign out from Supabase in background (don't wait)
      supabase.auth.signOut().catch((error) => {
      });
      
    } catch (err) {
      // Even if there's an error, clear local state
      setSession(null);
      setUser(null);
    }
  };

  const signInWithGoogle = async () => {
    if (!isConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase environment variables.' 
        } 
      };
    }

    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: Platform.OS === 'ios' 
            ? 'unifesto://auth/callback'
            : 'unifesto://auth/callback',
          skipBrowserRedirect: true,
        },
      });

      if (error) {
        return { error };
      }

      if (!data?.url) {
        return { error: { message: 'Failed to generate authentication URL' } };
      }

      const result = await WebBrowser.openAuthSessionAsync(
        data.url,
        Platform.OS === 'ios' ? 'unifesto://' : 'unifesto://'
      );

      if (result.type === 'success' && result.url) {
        const url = result.url;
        const params = new URLSearchParams(url.split('#')[1] || url.split('?')[1]);
        const accessToken = params.get('access_token');
        const refreshToken = params.get('refresh_token');

        if (accessToken) {
          await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken || '',
          });
          return { error: null };
        }
      }

      if (result.type === 'cancel' || result.type === 'dismiss') {
        return { error: { message: 'Login cancelled' } };
      }

      return { error: { message: 'Authentication failed' } };
    } catch (err: any) {
      return { error: { message: err.message || 'An unexpected error occurred during sign-in' } };
    }
  };

  const signInWithApple = async () => {
    if (!isConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase environment variables.' 
        } 
      };
    }

    if (!isAppleAuthAvailable) {
      return { 
        error: { 
          message: 'Apple Sign In is not available on this device. It requires iOS 13 or later.' 
        } 
      };
    }

    try {
      // Perform Apple authentication request using Expo
      // Don't use nonce - let Supabase handle it automatically
      const credential = await AppleAuthentication.signInAsync({
        requestedScopes: [
          AppleAuthentication.AppleAuthenticationScope.FULL_NAME,
          AppleAuthentication.AppleAuthenticationScope.EMAIL,
        ],
      });

      if (!credential.identityToken) {
        return { error: { message: 'No identity token received from Apple' } };
      }

      // Sign in with Supabase using the identity token WITHOUT nonce
      // Supabase will validate the token without nonce verification
      const { error } = await supabase.auth.signInWithIdToken({
        provider: 'apple',
        token: credential.identityToken,
      });

      if (error) {
        return { error };
      }

      return { error: null };
    } catch (err: any) {
      // User cancelled - this is not an error, just return silently
      if (err.code === 'ERR_CANCELED' || err.code === 'ERR_REQUEST_CANCELED') {
        return { error: { message: 'Login cancelled' } };
      }
      
      // Actual errors
      return { error: { message: err.message || 'An unexpected error occurred during sign-in' } };
    }
  };

  const resetPassword = async (email: string) => {
    if (!isConfigured || !supabase) {
      return { 
        error: { 
          message: 'Authentication is not configured. Please set up Supabase environment variables.' 
        } 
      };
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'unifesto://auth/callback?type=recovery',
      });
      return { error };
    } catch (err: any) {
      return { error: err };
    }
  };

  const value = {
    user,
    session,
    loading,
    signIn,
    signUp,
    signOut,
    signInWithGoogle,
    signInWithApple,
    resetPassword,
    isConfigured,
    isAppleAuthAvailable,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
