import { FontAwesome5, Ionicons } from '@expo/vector-icons';
import { useQuery } from '@tanstack/react-query';
import { LinearGradient } from 'expo-linear-gradient';
import { router, useFocusEffect } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { doc, getDoc } from 'firebase/firestore';
import React, { useCallback, useEffect, useState } from "react";
import { Image, RefreshControl, ScrollView, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { HomeScreenSkeleton } from '../components/skeleton';
import { useAuth } from '../context/AuthContext';
import { useCurrency } from '../context/CurrencyContext';
import { useTheme } from '../context/ThemeContext';
import { db } from '../firebaseConfig';
import { categoriesService } from '../services/categoriesService';
import { notificationService } from '../services/notificationService';
import { transactionsService } from '../services/transactionsService';
import { formatDateShort } from '../utils/dateUtils';
import { getIconComponent } from '../utils/iconUtils';

declare global {
  interface Window {
    __sentLowBalanceNotif?: boolean;
  }
}

export default function Home() {
  const { user } = useAuth();
  const { theme } = useTheme();
  const { currency } = useCurrency();

  const [refreshing, setRefreshing] = useState(false);

  const styles = StyleSheet.create({
    container: {
      flex: 1,
      backgroundColor: theme.background,
    },
    scrollContent: {
      backgroundColor: theme.surface,
      padding: 20,
      paddingBottom: 100, // Increased padding to account for tab bar
    },
    headerRow: {
      flexDirection: 'row',
      alignItems: 'center',
      justifyContent: 'space-between',
      marginBottom: 24,
    },
    avatar: {
      width: 50,
      height: 50,
      borderRadius: 25,
      marginRight: 12,
    },
    greeting: {
      fontSize: 14,
      color: theme.textSecondary,
      marginBottom: 2,
    },
    name: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
    },
    bellCircle: {
      width: 52,
      height: 52,
      borderRadius: 16,
      backgroundColor: theme.card,
      alignItems: 'center',
      justifyContent: 'center',
      shadowColor: '#000',
      shadowOpacity: 0.08,
      shadowRadius: 8,
      shadowOffset: { width: 0, height: 2 },
      elevation: 2,
      borderWidth: 1,
      borderColor: theme.border,

    },
    balanceCard: {
      backgroundColor: theme.card,
      borderRadius: 16,
      padding: 20,
      marginBottom: 28,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
      borderWidth: 1,
      borderColor: theme.border,
    },
    balanceLabel: {
      fontSize: 32,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 4,
    },
    balanceSub: {
      color: theme.textSecondary,
      fontSize: 15,
      marginBottom: 18,
    },
    progressBarBg: {
      height: 6,
      backgroundColor: theme.border,
      borderRadius: 3,
      marginBottom: 18,
      overflow: 'hidden',
    },
    progressBarFill: {
      height: 6,
      backgroundColor: theme.primary,
      borderRadius: 3,
    },
    balanceRow: {
      flexDirection: 'row',
      justifyContent: 'space-between',
      marginTop: 8,
    },
    balanceCol: {
      alignItems: 'center',
    },
    balanceMiniLabel: {
      color: theme.textSecondary,
      fontSize: 13,
      marginBottom: 2,
    },
    balanceMiniValue: {
      color: theme.text,
      fontWeight: 'bold',
      fontSize: 15,
    },
    sectionTitle: {
      fontSize: 16,
      fontWeight: 'bold',
      color: theme.textSecondary,
      marginBottom: 12,
      marginTop: 8,
    },
    categoryGrid: {
      flexDirection: 'row',
      flexWrap: 'wrap',
      justifyContent: 'space-between',
      marginBottom: 28,
    },
    categoryCard: {
      width: '47%',
      borderRadius: 16,
      flexDirection: 'row',
      alignItems: 'center',
      padding: 14,
      marginBottom: 14,
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
    },
    categoryIcon: {
      marginRight: 12,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 6,
    },
    categoryLabel: {
      fontSize: 14,
      color: theme.text,
      fontWeight: 'bold',
      flexShrink: 1,
      flexWrap: 'wrap',
    },
    categoryAmount: {
      fontSize: 13,
      color: theme.textSecondary,
      marginTop: 2,
    },
    transactionsCard: {
      backgroundColor: theme.card,
      borderColor: theme.border,
      borderWidth: 1,
      borderRadius: 16,
      padding: 12,
      shadowColor: '#000',
      shadowOpacity: 0.04,
      shadowRadius: 4,
      shadowOffset: { width: 0, height: 1 },
      elevation: 1,
    },
    transactionRow: {
      flexDirection: 'row',
      alignItems: 'center',
      paddingVertical: 20,
    },
    transactionIcon: {
      marginRight: 12,
      backgroundColor: theme.surface,
      borderRadius: 8,
      padding: 6,
    },
    transactionLabel: {
      fontSize: 15,
      color: theme.text,
      fontWeight: 'bold',
    },
    transactionSubtitle: {
      fontSize: 12,
      color: theme.textSecondary,
    },
    transactionAmount: {
      fontSize: 15,
      color: theme.text,
      fontWeight: 'bold',
      marginLeft: 8,
    },
    transactionDivider: {
      height: 1,
      backgroundColor: theme.borderLight,
      marginLeft: 44,
      marginRight: 0,
      marginBottom: 2,
    },
    emptyStateContainer: {
      alignItems: 'center',
      paddingVertical: 30,
      paddingHorizontal: 20,
      backgroundColor: theme.card,
      borderRadius: 16,
      borderColor: theme.border,
      borderWidth: 1,
      marginBottom: 28,
    },
    emptyStateIcon: {
      width: 80,
      height: 80,
      borderRadius: 40,
      backgroundColor: theme.surface,
      justifyContent: 'center',
      alignItems: 'center',
      marginBottom: 16,
      borderWidth: 2,
      borderColor: theme.primary,
      borderStyle: 'dashed',
    },
    emptyStateTitle: {
      fontSize: 18,
      fontWeight: 'bold',
      color: theme.text,
      marginBottom: 8,
      textAlign: 'center',
    },
    emptyStateMessage: {
      fontSize: 14,
      color: theme.textSecondary,
      textAlign: 'center',
      lineHeight: 20,
      marginBottom: 20,
      paddingHorizontal: 10,
    },
    emptyStateButton: {
      backgroundColor: theme.primary,
      borderRadius: 12,
      paddingVertical: 12,
      paddingHorizontal: 24,
      shadowColor: theme.primary,
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.3,
      shadowRadius: 8,
      elevation: 5,
    },
    emptyStateButtonText: {
      color: theme.textInverse,
      fontSize: 14,
      fontWeight: '600',
      textAlign: 'center',
    },
  });

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    if (hour < 21) return 'Good Evening';
    return 'Good Night';
  };

  // Calculate progress bar percentage based on spending vs income
  const getProgressPercentage = () => {
    if (stats.totalIncome === 0) return 0;
    const percentage = (stats.totalExpense / stats.totalIncome) * 100;
    // Cap at 100% to prevent overflow
    return Math.min(percentage, 100);
  };

  // Get progress bar color based on spending percentage
  const getProgressBarColor = () => {
    const percentage = getProgressPercentage();
    if (percentage < 50) return theme.success; // Green for good spending
    if (percentage < 80) return theme.warning; // Orange for moderate spending
    return theme.error; // Red for high spending
  };

  const { data, isLoading: loading, refetch } = useQuery({
    queryKey: ['homeData', user?.uid],
    queryFn: async () => {
      if (!user?.uid) throw new Error('No user');

      const [userDoc, userCategories, allTransactions, userStats] = await Promise.all([
        getDoc(doc(db, 'users', user.uid)),
        categoriesService.getUserCategories(user.uid),
        transactionsService.getUserTransactions(user.uid, 1000),
        transactionsService.getTransactionStats(user.uid)
      ]);

      let userProfileData: { fullName?: string; firstName?: string; lastName?: string } = {};
      if (userDoc.exists()) {
        const userData = userDoc.data();
        userProfileData = {
          fullName: userData.fullName,
          firstName: userData.firstName,
          lastName: userData.lastName
        };
      }

      const expenseCategories = userCategories.filter(cat => cat.type === 'expense');
      const recentTransactions = allTransactions.slice(0, 5);

      const spendingByCategory: { [key: string]: number } = {};
      allTransactions.forEach(tx => {
        if (tx.type === 'expense' && tx.categoryId) {
          spendingByCategory[tx.categoryId] = (spendingByCategory[tx.categoryId] || 0) + tx.amount;
        }
      });

      return {
        userProfile: userProfileData,
        categories: expenseCategories,
        transactions: recentTransactions,
        stats: userStats,
        categorySpending: spendingByCategory
      };
    },
    enabled: !!user?.uid,
  });

  const userProfile: { fullName?: string; firstName?: string; lastName?: string } = data?.userProfile || {};
  const categories = data?.categories || [];
  const transactions = data?.transactions || [];
  const stats = data?.stats || { totalIncome: 0, totalExpense: 0, balance: 0, transactionCount: 0 };
  const categorySpending = data?.categorySpending || {};

  useEffect(() => {
    if (
      stats.totalIncome > 0 &&
      stats.balance > 0 &&
      stats.balance <= 0.1 * stats.totalIncome &&
      !window.__sentLowBalanceNotif
    ) {
      notificationService.sendLowBalanceAlert().catch(console.error);
      window.__sentLowBalanceNotif = true;
    }
  }, [stats]);

  useFocusEffect(
    useCallback(() => {
      if (user?.uid) {
        refetch();
      }
    }, [user?.uid, refetch])
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await refetch();
    setRefreshing(false);
  };

  // Determine avatar seed and gender
  const nameSeed = userProfile.firstName || user?.displayName || user?.email || 'user';
  // Alternate gender based on hash of seed for demo
  const isMale = nameSeed.charCodeAt(0) % 2 === 0;
  const avatarUrl = isMale
    ? `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(nameSeed)}&gender=male`
    : `https://api.dicebear.com/7.x/adventurer/png?seed=${encodeURIComponent(nameSeed)}&gender=female`;

  if (loading) {
    return <HomeScreenSkeleton />;
  }

  return (
    <SafeAreaView style={styles.container} edges={['top', 'left', 'right']}>
      <StatusBar style={theme.statusBarStyle} />
      <ScrollView
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
        }
      >
        {/* Header */}
        <View style={styles.headerRow}>
          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
            <Image source={{ uri: avatarUrl }} style={styles.avatar} />
            <View>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.name}>
                {userProfile.fullName || userProfile.firstName || user?.displayName || user?.email?.split('@')[0] || 'User'}
              </Text>
            </View>
          </View>
          <View style={styles.bellCircle}>
            <TouchableOpacity onPress={() => router.push('/components/notifications')}>
              <Ionicons name="notifications-outline" size={25} color={theme.textSecondary} />
            </TouchableOpacity>
          </View>
        </View>

        {/* Balance Card */}
        <LinearGradient
          colors={['#002219', '#008361', '#002219']}
          style={styles.balanceCard}
        >
          <Text style={[styles.balanceLabel, { color: theme.background === '#121212' ? theme.text : '#FFFFFF' }]}>{currency} {stats.balance.toLocaleString()}</Text>
          <Text style={[styles.balanceSub, { color: theme.background === '#121212' ? theme.textSecondary : '#FFFFFF', opacity: 0.9 }]}>Balance</Text>
          <Text style={[styles.balanceSub, { fontSize: 12, marginBottom: 8, color: theme.background === '#121212' ? theme.textSecondary : '#FFFFFF', opacity: 0.8 }]}>
            Spending Progress: {getProgressPercentage().toFixed(1)}% of income
          </Text>
          <View style={styles.progressBarBg}>
            <View
              style={[
                styles.progressBarFill,
                {
                  width: `${getProgressPercentage()}%`,
                  backgroundColor: getProgressBarColor()
                }
              ]}
            />
          </View>
          <View style={styles.balanceRow}>
            <View style={styles.balanceCol}>
              <Text style={[styles.balanceMiniLabel, { color: theme.background === '#121212' ? theme.textSecondary : '#FFFFFF', opacity: 0.8 }]}>Income</Text>
              <Text style={[styles.balanceMiniValue, { color: theme.background === '#121212' ? theme.text : '#FFFFFF' }]}>{currency} {stats.totalIncome.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceCol}>
              <Text style={[styles.balanceMiniLabel, { color: theme.background === '#121212' ? theme.textSecondary : '#FFFFFF', opacity: 0.8 }]}>Expenditure</Text>
              <Text style={[styles.balanceMiniValue, { color: theme.background === '#121212' ? theme.text : '#FFFFFF' }]}>{currency} {stats.totalExpense.toLocaleString()}</Text>
            </View>
            <View style={styles.balanceCol}>
              <Text style={[styles.balanceMiniLabel, { color: theme.background === '#121212' ? theme.textSecondary : '#FFFFFF', opacity: 0.8 }]}>Transactions</Text>
              <Text style={[styles.balanceMiniValue, { color: theme.background === '#121212' ? theme.text : '#FFFFFF' }]}>{stats.transactionCount}</Text>
            </View>
          </View>
        </LinearGradient>

        {/* Spending by Category */}
        <Text style={styles.sectionTitle}>Spending by Category</Text>
        {categories.length > 0 ? (
          <View style={styles.categoryGrid}>
            {categories.map((cat, idx) => (
              <View key={cat.id} style={styles.categoryCard}>
                <View style={[styles.categoryIcon, { backgroundColor: cat.color + '20' }]}>
                  {getIconComponent(cat.icon, cat.color)}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={styles.categoryLabel}>{cat.name}</Text>
                  <Text style={styles.categoryAmount}>{currency} {categorySpending[cat.id || '']?.toLocaleString() || '0'}</Text>
                </View>
              </View>
            ))}
          </View>
        ) : (
          <View style={styles.emptyStateContainer}>
            <View style={styles.emptyStateIcon}>
              <FontAwesome5 name="chart-pie" size={40} color={theme.primary} />
            </View>
            <Text style={styles.emptyStateTitle}>No Spending Data</Text>
            <Text style={styles.emptyStateMessage}>
              Start adding transactions to see your spending breakdown by category
            </Text>
            <TouchableOpacity
              style={styles.emptyStateButton}
              onPress={() => router.push('/(tabs)/add')}
            >
              <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Recent Transactions */}
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        <View style={styles.transactionsCard}>
          {transactions.length > 0 ? (
            transactions.map((tx, idx) => (
              <React.Fragment key={tx.id}>
                <View style={styles.transactionRow}>
                  <View style={[styles.transactionIcon, { backgroundColor: (tx.categoryColor || '#666') + '20' }]}>
                    {getIconComponent(tx.categoryIcon || 'category', tx.categoryColor || '#666', 20)}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={styles.transactionLabel}>{tx.description}</Text>
                    <Text style={styles.transactionSubtitle}>{tx.categoryName} · {formatDateShort(tx.date)}</Text>
                  </View>
                  <Text style={[styles.transactionAmount, { color: tx.type === 'income' ? theme.success : theme.error }]}>
                    {tx.type === 'income' ? '+' : '-'}{currency} {tx.amount.toLocaleString()}
                  </Text>
                </View>
                {idx !== transactions.length - 1 && (
                  <View style={styles.transactionDivider} />
                )}
              </React.Fragment>
            ))
          ) : (
            <View style={styles.emptyStateContainer}>
              <View style={styles.emptyStateIcon}>
                <FontAwesome5 name="receipt" size={40} color={theme.primary} />
              </View>
              <Text style={styles.emptyStateTitle}>No Transactions Yet</Text>
              <Text style={styles.emptyStateMessage}>
                Start tracking your finances by adding your first transaction
              </Text>
              <TouchableOpacity
                style={styles.emptyStateButton}
                onPress={() => router.push('/(tabs)/add')}
              >
                <Text style={styles.emptyStateButtonText}>Add Transaction</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
} 