import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';

export default function ThemeToggle() {
  const { theme, themeMode, setThemeMode, isDark } = useTheme();

  const toggleTheme = () => {
    if (themeMode === 'system') {
      setThemeMode('light');
    } else if (themeMode === 'light') {
      setThemeMode('dark');
    } else {
      setThemeMode('system');
    }
  };

  const getThemeIcon = () => {
    if (themeMode === 'system') {
      return isDark ? 'moon' : 'sunny';
    }
    return themeMode === 'dark' ? 'moon' : 'sunny';
  };

  const getThemeLabel = () => {
    if (themeMode === 'system') {
      return `System (${isDark ? 'Dark' : 'Light'})`;
    }
    return themeMode === 'dark' ? 'Dark Mode' : 'Light Mode';
  };

  const styles = StyleSheet.create({
    container: {
      backgroundColor: theme.card,
      borderRadius: 12,
      padding: 16,
    
      marginVertical: 8,
      borderWidth: 1,
      borderColor: theme.border,
    },
    row: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
    },
    leftSection: {
      flexDirection: 'row',
      alignItems: 'center',
      flex: 1,
    },
    iconWrap: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.touchable,
      justifyContent: 'center',
      alignItems: 'center',
      marginRight: 12,
    },
    textSection: {
      flex: 1,
    },
    label: {
      fontSize: 16,
      fontWeight: '600',
      color: theme.text,
      marginBottom: 2,
    },
    subtitle: {
      fontSize: 14,
      color: theme.textSecondary,
    },
    toggleButton: {
      width: 44,
      height: 44,
      borderRadius: 22,
      backgroundColor: theme.primary,
      justifyContent: 'center',
      alignItems: 'center',
    },
  });

  return (
    <TouchableOpacity style={styles.container} onPress={toggleTheme}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <View style={styles.iconWrap}>
            <Ionicons 
              name={getThemeIcon()} 
              size={24} 
              color={theme.primary} 
            />
          </View>
          <View style={styles.textSection}>
            <Text style={styles.label}>Theme</Text>
            <Text style={styles.subtitle}>{getThemeLabel()}</Text>
          </View>
        </View>
        <View style={styles.toggleButton}>
          <Ionicons 
            name="chevron-forward" 
            size={20} 
            color={theme.textInverse} 
          />
        </View>
      </View>
    </TouchableOpacity>
  );
} 