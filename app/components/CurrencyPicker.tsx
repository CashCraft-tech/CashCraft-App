import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTheme } from '../context/ThemeContext';
import { useCurrency, CurrencySymbol } from '../context/CurrencyContext';

const CURRENCIES: CurrencySymbol[] = ['₹', '$', '€', '£', '¥'];

const CURRENCY_LABELS: Record<CurrencySymbol, string> = {
  '₹': 'Indian Rupee (INR)',
  '$': 'US Dollar (USD)',
  '€': 'Euro (EUR)',
  '£': 'British Pound (GBP)',
  '¥': 'Japanese Yen (JPY)',
};

export default function CurrencyPicker() {
  const { theme } = useTheme();
  const { currency, setCurrency } = useCurrency();

  const toggleCurrency = () => {
    const currentIndex = CURRENCIES.indexOf(currency);
    const nextIndex = (currentIndex + 1) % CURRENCIES.length;
    setCurrency(CURRENCIES[nextIndex]);
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
    iconText: {
      fontSize: 20,
      fontWeight: 'bold',
      color: theme.primary,
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
    <TouchableOpacity style={styles.container} onPress={toggleCurrency}>
      <View style={styles.row}>
        <View style={styles.leftSection}>
          <View style={styles.iconWrap}>
            <Text style={styles.iconText}>{currency}</Text>
          </View>
          <View style={styles.textSection}>
            <Text style={styles.label}>Currency</Text>
            <Text style={styles.subtitle}>{CURRENCY_LABELS[currency]}</Text>
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
