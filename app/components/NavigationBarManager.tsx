import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { useTheme } from '../context/ThemeContext';

export default function NavigationBarManager() {
  const { theme, isDark } = useTheme();

  useEffect(() => {
    if (Platform.OS === 'android') {
      try {
        // Simplified approach: Set status bar and navigation bar once
        const barStyle = isDark ? 'light-content' : 'dark-content';
        StatusBar.setBarStyle(barStyle);
        StatusBar.setBackgroundColor(theme.navigationBarBackground);
        StatusBar.setTranslucent(true);
        
        // Try expo-navigation-bar for navigation bar theming
        try {
          const NavigationBar = require('expo-navigation-bar');
          if (NavigationBar && NavigationBar.setBackgroundColorAsync) {
            NavigationBar.setBackgroundColorAsync(theme.navigationBarBackground);
            NavigationBar.setButtonStyleAsync(isDark ? 'light' : 'dark');
          }
        } catch (expoError) {
          // Silently fail if expo-navigation-bar is not available
        }
        
      } catch (error) {
        console.error('NavigationBarManager: Failed to set navigation bar settings:', error);
      }
    }
  }, [theme.navigationBarStyle, theme.navigationBarBackground, isDark]);

  return null;
} 