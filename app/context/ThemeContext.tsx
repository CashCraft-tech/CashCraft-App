import React, { createContext, useContext, useState, useEffect } from 'react';
import { useColorScheme } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type ThemeMode = 'light' | 'dark' | 'system';

interface ThemeColors {
  // Background colors
  background: string;
  surface: string;
  card: string;
  modal: string;
  
  // Text colors
  text: string;
  textSecondary: string;
  textTertiary: string;
  textInverse: string;
  
  // Border colors
  border: string;
  borderLight: string;
  
  // Status colors
  primary: string;
  primaryLight: string;
  success: string;
  warning: string;
  error: string;
  
  // Interactive colors
  touchable: string;
  touchablePressed: string;
  inputBackground: string;
  inputBorder: string;
  
  // Tab bar colors
  tabBarBackground: string;
  tabBarBorder: string;
  tabBarInactive: string;
  
  // Status bar
  statusBarBackground: string;
  statusBarStyle: 'light' | 'dark';
  
  // Navigation bar (Android)
  navigationBarStyle: 'light' | 'dark';
  navigationBarBackground: string;
}

const lightTheme: ThemeColors = {
  background: '#FFFFFF',
  surface: '#F8F9FA',
  card: '#FFFFFF',
  modal: '#FFFFFF',
  
  text: '#1A1A1A',
  textSecondary: '#666666',
  textTertiary: '#999999',
  textInverse: '#FFFFFF',
  
  border: '#E0E0E0',
  borderLight: '#F0F0F0',
  
  primary: '#4CAF50',
  primaryLight: '#81C784',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  touchable: '#F5F5F5',
  touchablePressed: '#E0E0E0',
  inputBackground: '#FFFFFF',
  inputBorder: '#E0E0E0',
  
  tabBarBackground: '#FFFFFF',
  tabBarBorder: '#E0E0E0',
  tabBarInactive: '#888888',
  
  statusBarBackground: '#FFFFFF',
  statusBarStyle: 'dark',
  
  navigationBarStyle: 'dark',
  navigationBarBackground: '#FFFFFF',
};

const darkTheme: ThemeColors = {
  background: '#121212',
  surface: '#121212',
  card: '#2D2D2D',
  modal: '#2D2D2D',
  
  text: '#FFFFFF',
  textSecondary: '#B0B0B0',
  textTertiary: '#808080',
  textInverse: '#1A1A1A',
  
  border: '#404040',
  borderLight: '#2A2A2A',
  
  primary: '#4CAF50',
  primaryLight: '#81C784',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  
  touchable: '#2A2A2A',
  touchablePressed: '#404040',
  inputBackground: '#2D2D2D',
  inputBorder: '#404040',
  
  tabBarBackground: '#121212',
  tabBarBorder: '#3A3A3A',
  tabBarInactive: '#808080',
  
  statusBarBackground: '#121212',
  statusBarStyle: 'light',
  
  navigationBarStyle: 'light',
  navigationBarBackground: '#121212',
};

interface ThemeContextType {
  theme: ThemeColors;
  themeMode: ThemeMode;
  setThemeMode: (mode: ThemeMode) => void;
  isDark: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const systemColorScheme = useColorScheme();
  const [themeMode, setThemeMode] = useState<ThemeMode>('system');
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadThemeMode();
  }, []);

  const loadThemeMode = async () => {
    try {
      const savedMode = await AsyncStorage.getItem('themeMode');
      if (savedMode && ['light', 'dark', 'system'].includes(savedMode)) {
        setThemeMode(savedMode as ThemeMode);
      }
    } catch (error) {
      console.log('Error loading theme mode:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const saveThemeMode = async (mode: ThemeMode) => {
    try {
      await AsyncStorage.setItem('themeMode', mode);
    } catch (error) {
      console.log('Error saving theme mode:', error);
    }
  };

  const handleSetThemeMode = (mode: ThemeMode) => {
    setThemeMode(mode);
    saveThemeMode(mode);
  };

  const theme = React.useMemo(() => {
    if (themeMode === 'system') {
      return systemColorScheme === 'dark' ? darkTheme : lightTheme;
    }
    return themeMode === 'dark' ? darkTheme : lightTheme;
  }, [themeMode, systemColorScheme]);

  const isDark = React.useMemo(() => {
    return themeMode === 'system' 
      ? systemColorScheme === 'dark' 
      : themeMode === 'dark';
  }, [themeMode, systemColorScheme]);

  if (!isLoaded) {
    return null; // Or a loading screen
  }

  return (
    <ThemeContext.Provider value={{
      theme,
      themeMode,
      setThemeMode: handleSetThemeMode,
      isDark,
    }}>
      {children}
    </ThemeContext.Provider>
  );
}; 