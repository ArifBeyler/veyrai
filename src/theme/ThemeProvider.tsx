/**
 * Theme Provider - Tema context ve hook
 */

import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Theme, ThemeId, THEMES, DEFAULT_THEME, getTheme } from './themes';

const THEME_STORAGE_KEY = 'veyra-theme';

type ThemeContextType = {
  theme: Theme;
  themeId: ThemeId;
  setTheme: (id: ThemeId) => Promise<void>;
  isLoading: boolean;
};

const ThemeContext = createContext<ThemeContextType>({
  theme: THEMES[DEFAULT_THEME],
  themeId: DEFAULT_THEME,
  setTheme: async () => {},
  isLoading: true,
});

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [themeId, setThemeId] = useState<ThemeId>(DEFAULT_THEME);
  const [isLoading, setIsLoading] = useState(true);

  // Load saved theme on mount
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedTheme = await AsyncStorage.getItem(THEME_STORAGE_KEY);
        if (savedTheme && THEMES[savedTheme as ThemeId]) {
          setThemeId(savedTheme as ThemeId);
        }
      } catch (error) {
        console.log('Error loading theme:', error);
      } finally {
        setIsLoading(false);
      }
    };
    loadTheme();
  }, []);

  const setTheme = async (id: ThemeId) => {
    try {
      await AsyncStorage.setItem(THEME_STORAGE_KEY, id);
      setThemeId(id);
    } catch (error) {
      console.error('Error saving theme:', error);
    }
  };

  const theme = getTheme(themeId);

  return (
    <ThemeContext.Provider value={{ theme, themeId, setTheme, isLoading }}>
      {children}
    </ThemeContext.Provider>
  );
};

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

export default ThemeProvider;

