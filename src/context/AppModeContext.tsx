import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type AppMode = 'discover' | 'forge' | 'gate';

interface AppModeContextType {
  mode: AppMode;
  setMode: (mode: AppMode) => Promise<void>;
  isForgeMode: boolean;
  isGateMode: boolean;
  isDiscoverMode: boolean;
}

const AppModeContext = createContext<AppModeContextType>({
  mode: 'discover',
  setMode: async () => {},
  isForgeMode: false,
  isGateMode: false,
  isDiscoverMode: true,
});

const APP_MODE_KEY = '@unifesto_app_mode';

export function AppModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<AppMode>('discover');

  useEffect(() => {
    AsyncStorage.getItem(APP_MODE_KEY).then((saved) => {
      if (saved === 'forge' || saved === 'gate' || saved === 'discover') {
        setModeState(saved);
      }
    });
  }, []);

  const setMode = async (newMode: AppMode) => {
    await AsyncStorage.setItem(APP_MODE_KEY, newMode);
    setModeState(newMode);
  };

  return (
    <AppModeContext.Provider value={{
      mode,
      setMode,
      isForgeMode: mode === 'forge',
      isGateMode: mode === 'gate',
      isDiscoverMode: mode === 'discover',
    }}>
      {children}
    </AppModeContext.Provider>
  );
}

export function useAppMode() {
  return useContext(AppModeContext);
}

export default AppModeContext;
