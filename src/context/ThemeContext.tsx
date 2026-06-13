import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { useColorScheme, Appearance } from 'react-native';

type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: ThemeMode;
  activeTheme: 'light' | 'dark';
  setTheme: (theme: ThemeMode) => void;
  colors: typeof darkColors;
}

const darkColors = {
  // Primary Brand Colors
  primary: '#3491ff',
  primaryBright: '#0062ff',
  primaryDark: '#0052d9',

  // Background
  background: '#000000',
  backgroundSecondary: '#0a0a0a',

  // Text
  text: '#ffffff',
  textMuted: '#94a3b8',
  textSecondary: '#64748b',

  // Borders & Dividers
  border: 'rgba(52, 145, 255, 0.3)',
  borderLight: 'rgba(255, 255, 255, 0.1)',
  borderMuted: 'rgba(255, 255, 255, 0.05)',

  // Cards & Surfaces
  card: '#0a0a0a',
  cardHover: 'rgba(255, 255, 255, 0.05)',

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3491ff',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',

  // Gradients
  gradientStart: '#3491ff',
  gradientEnd: '#0062ff',
};

const lightColors = {
  // Primary Brand Colors
  primary: '#3491ff',
  primaryBright: '#0062ff',
  primaryDark: '#0052d9',

  // Background
  background: '#ffffff',
  backgroundSecondary: '#f8f9fa',

  // Text
  text: '#000000',
  textMuted: '#64748b',
  textSecondary: '#94a3b8',

  // Borders & Dividers
  border: 'rgba(52, 145, 255, 0.3)',
  borderLight: 'rgba(0, 0, 0, 0.1)',
  borderMuted: 'rgba(0, 0, 0, 0.05)',

  // Cards & Surfaces
  card: '#f1f5f9',
  cardHover: 'rgba(0, 0, 0, 0.05)',

  // Status Colors
  success: '#10b981',
  warning: '#f59e0b',
  error: '#ef4444',
  info: '#3491ff',

  // Overlay
  overlay: 'rgba(0, 0, 0, 0.8)',
  overlayLight: 'rgba(0, 0, 0, 0.6)',

  // Gradients
  gradientStart: '#3491ff',
  gradientEnd: '#0062ff',
};

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

const THEME_STORAGE_KEY = '@unifesto_theme';

export function ThemeProvider({ children }: { children: ReactNode }) {
  const systemColorScheme = useColorScheme();
  const [theme, setThemeState] = useState<ThemeMode>('system');
  const [isLoading, setIsLoading] = useState(true);
  const [activeTheme, setActiveTheme] = useState<'light' | 'dark'>(
    systemColorScheme === 'light' ? 'light' : 'dark'
  );

  // Load saved theme on mount
  useEffect(() => {
    loadTheme();
  }, []);

  // Update active theme when system theme or user theme changes
  useEffect(() => {
    const newActiveTheme: 'light' | 'dark' = 
      theme === 'system' 
        ? (systemColorScheme === 'light' ? 'light' : 'dark')
        : theme;
    setActiveTheme(newActiveTheme);
  }, [theme, systemColorScheme]);

  // Listen for system theme changes
  useEffect(() => {
    const subscription = Appearance.addChangeListener(({ colorScheme }) => {
      if (theme === 'system') {
        setActiveTheme(colorScheme === 'light' ? 'light' : 'dark');
      }
    });
    return () => subscription.remove();
  }, [theme]);

  const loadTheme = async () => {
    try {
      const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
      if (savedTheme && (savedTheme === 'light' || savedTheme === 'dark' || savedTheme === 'system')) {
        setThemeState(savedTheme as ThemeMode);
      } else {
        // No saved theme or invalid value, default to system and save it
        await AsyncStorage.setItem(THEME_STORAGE_KEY, 'system');
        setThemeState('system');
      }
    } catch (error) {
      console.error('Failed to load theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setTheme = async (newTheme: ThemeMode) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, newTheme);
      setThemeState(newTheme);
    } catch (error) {
      console.error('Failed to save theme:', error);
    }
  };

  const colors = activeTheme === 'light' ? lightColors : darkColors;

  if (isLoading) {
    return null; // or a loading screen
  }

  return (
    <ThemeContext.Provider value={{ theme, activeTheme, setTheme, colors }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const context = useContext(ThemeContext);
  if (context === undefined) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
}
