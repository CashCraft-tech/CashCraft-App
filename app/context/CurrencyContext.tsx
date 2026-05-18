import React, { createContext, useContext, useState, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

export type CurrencySymbol = '₹' | '$' | '€' | '£' | '¥';

interface CurrencyContextType {
  currency: CurrencySymbol;
  setCurrency: (symbol: CurrencySymbol) => void;
}

const CurrencyContext = createContext<CurrencyContextType | undefined>(undefined);

export const useCurrency = () => {
  const context = useContext(CurrencyContext);
  if (!context) {
    throw new Error('useCurrency must be used within a CurrencyProvider');
  }
  return context;
};

interface CurrencyProviderProps {
  children: React.ReactNode;
}

export const CurrencyProvider: React.FC<CurrencyProviderProps> = ({ children }) => {
  const [currency, setCurrencyState] = useState<CurrencySymbol>('₹'); // Default is INR
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    loadCurrency();
  }, []);

  const loadCurrency = async () => {
    try {
      const savedCurrency = await AsyncStorage.getItem('userCurrency');
      if (savedCurrency && ['₹', '$', '€', '£', '¥'].includes(savedCurrency)) {
        setCurrencyState(savedCurrency as CurrencySymbol);
      }
    } catch (error) {
      console.error('Error loading currency:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  const setCurrency = async (symbol: CurrencySymbol) => {
    setCurrencyState(symbol);
    try {
      await AsyncStorage.setItem('userCurrency', symbol);
    } catch (error) {
      console.error('Error saving currency:', error);
    }
  };

  if (!isLoaded) {
    return null;
  }

  return (
    <CurrencyContext.Provider value={{ currency, setCurrency }}>
      {children}
    </CurrencyContext.Provider>
  );
};
