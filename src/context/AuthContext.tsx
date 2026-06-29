import React, { createContext, useContext, useState, useEffect } from 'react';
import * as SecureStore from 'expo-secure-store';
import crashlytics from '@react-native-firebase/crashlytics';
import { getToken, saveToken, clearToken, makeAuthenticatedRequest, makePublicRequest } from '../lib/api/helpers';
import { API_URL as BASE_URL } from '../lib/constants';

interface User {
  id: string;
  mobileNumber: string;
  mobileVerified: boolean;
  username: string | null;
  fullName: string | null;
  avatarUrl: string | null;
  bio: string | null;
  isOnboarded: boolean;
  referralCode: string | null;
  createdAt: string;
}

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isOnboarded: boolean;
  tempToken: string | null;
  // OTP Auth
  sendMobileOtp: (mobileNumber: string) => Promise<void>;
  verifyMobileOtp: (mobileNumber: string, otp: string) => Promise<void>;
  sendEmailOtp: (email: string) => Promise<void>;
  verifyEmailOtp: (email: string, otp: string) => Promise<void>;
  // Social Auth
  loginWithGoogle: (idToken: string) => Promise<void>;
  loginWithApple: (identityToken: string, authorizationCode: string) => Promise<void>;
  loginWithCognito: (idToken: string) => Promise<void>;
  // Actions
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
  updateUser: (data: Partial<User>) => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [tempToken, setTempToken] = useState<string | null>(null);

  useEffect(() => {
    loadSession();
  }, []);

  const loadSession = async () => {
    try {
      const savedToken = await getToken();
      if (savedToken) {
        setToken(savedToken);
        const response = await fetch(`${BASE_URL}/users/me`, {
          headers: { Authorization: `Bearer ${savedToken}` }
        });
        if (response.ok) {
          const userData = await response.json();
          setUser(userData);
          await crashlytics().setUserId(userData.id);
        } else {
          await clearToken();
        }
      }
    } catch (error) {
      await clearToken();
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuthSuccess = async (accessToken: string, userData: User) => {
    await saveToken(accessToken);
    setToken(accessToken);
    setUser(userData);
    await crashlytics().setUserId(userData.id);
  };

  const sendMobileOtp = async (mobileNumber: string) => {
    const response = await makePublicRequest('/auth/mobile/send-otp', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, tempToken }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Failed to send OTP');
    }
  };

  const verifyMobileOtp = async (mobileNumber: string, otp: string) => {
    const response = await makePublicRequest('/auth/verify-mobile', {
      method: 'POST',
      body: JSON.stringify({ mobileNumber, otp, tempToken }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Invalid OTP');
    }

    const data = await response.json();
    setTempToken(null);
    await handleAuthSuccess(data.accessToken, data.user);
  };

  const sendEmailOtp = async (email: string) => {
    const response = await makePublicRequest('/auth/email', {
      method: 'POST',
      body: JSON.stringify({ email }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Failed to send OTP');
    }
  };

  const verifyEmailOtp = async (email: string, otp: string) => {
    const response = await makePublicRequest('/auth/email/verify', {
      method: 'POST',
      body: JSON.stringify({ email, otp }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Invalid OTP');
    }

    const data = await response.json();

    if (data.requiresMobileVerification && data.tempToken) {
      // New user — store tempToken, login screen will show mobile step
      setTempToken(data.tempToken);
      return;
    }

    await handleAuthSuccess(data.accessToken, data.user);
  };

  const loginWithGoogle = async (idToken: string) => {
    const response = await makePublicRequest('/auth/google', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Google login failed');
    }

    const data = await response.json();
    if (data.requiresMobileVerification) {
      setTempToken(data.tempToken);
      setUser(data.user);
      return;
    }
    await handleAuthSuccess(data.accessToken, data.user);
  };

  const loginWithApple = async (identityToken: string, authorizationCode: string) => {
    const response = await makePublicRequest('/auth/apple', {
      method: 'POST',
      body: JSON.stringify({ identityToken, authorizationCode }),
    });

    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Apple login failed');
    }

    const data = await response.json();
    if (data.requiresMobileVerification) {
      setTempToken(data.tempToken);
      setUser(data.user);
      return;
    }
    await handleAuthSuccess(data.accessToken, data.user);
  };

  const loginWithCognito = async (idToken: string) => {
    const response = await makePublicRequest('/auth/cognito', {
      method: 'POST',
      body: JSON.stringify({ idToken }),
    });
    if (!response?.ok) {
      const error = await response?.json();
      throw new Error(error?.message || 'Cognito login failed');
    }
    const data = await response.json();
    if (data.requiresMobileVerification) {
      // Set tempToken and user - login screen will detect mobileVerified=false and show mobile step
      setTempToken(data.tempToken);
      setUser(data.user);
      return;
    }
    await handleAuthSuccess(data.accessToken, data.user);
  };

  const logout = async () => {
    await clearToken();
    setToken(null);
    setUser(null);
    await crashlytics().setUserId('');
  };

  const refreshUser = async () => {
    const response = await makeAuthenticatedRequest('/users/me');
    if (response?.ok) {
      const userData = await response.json();
      setUser(userData);
    }
  };

  const updateUser = (data: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...data } : null);
  };

  return (
    <AuthContext.Provider value={{
      user, token, isLoading,
      isAuthenticated: !!token && !!user,
      tempToken,
      isOnboarded: user?.isOnboarded || false,
      sendMobileOtp, verifyMobileOtp,
      sendEmailOtp, verifyEmailOtp,
      loginWithGoogle, loginWithApple, loginWithCognito,
      logout, refreshUser, updateUser,
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
};
