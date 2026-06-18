import React, { createContext, useContext } from 'react';
import { colors as darkColors } from '../theme/colors';

interface ThemeContextType {
  theme: 'dark';
  activeTheme: 'dark';
  setTheme: (theme: any) => void;
  colors: typeof darkColors;
}

const ThemeContext = createContext<ThemeContextType>({
  theme: 'dark',
  activeTheme: 'dark',
  setTheme: () => {},
  colors: darkColors,
});

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return (
    <ThemeContext.Provider value={{
      theme: 'dark',
      activeTheme: 'dark',
      setTheme: () => {},
      colors: darkColors,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}

export default ThemeContext;
