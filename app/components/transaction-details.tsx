import React from "react";
import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';
import { MaterialCommunityIcons } from '@expo/vector-icons';
import { FontAwesome5 } from '@expo/vector-icons';
import { useLocalSearchParams } from 'expo-router';
import { formatDate } from '../utils/dateUtils';

export type Transaction = {
  id?: string;
  userId?: string;
  categoryId?: string;
  categoryName?: string;
  categoryIcon?: string;
  categoryColor?: string;
  amount: number;
  type: 'income' | 'expense';
  description: string;
  date: Date | string;
  location?: string;
  notes?: string;
  createdAt?: any;
  updatedAt?: any;
  // Legacy properties for backward compatibility
  label?: string;
  category?: string;
  status?: string;
  time?: string;
  payment?: string;
  breakdown?: { label: string; amount: number }[];
  receipt?: boolean;
  iconName?: string;
  iconColor?: string;
};

export default function TransactionDetails() {
  const { transaction } = useLocalSearchParams();
  let tx: Transaction | null = null;
  try {
    tx = transaction ? JSON.parse(transaction as string) : null;
  } catch {
    tx = null;
  }
  if (!tx) {
    return (
      <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB', justifyContent: 'center', alignItems: 'center' }}>
        <Text style={{ color: '#888', fontSize: 18 }}>Transaction not found.</Text>
      </SafeAreaView>
    );
  }
  const total = tx.breakdown?.reduce((sum, item) => sum + item.amount, 0) || 0;
  
  const getIconComponent = (iconName: string, color: string, size: number = 24) => {
    const iconMap: { [key: string]: any } = {
      // FontAwesome5 icons (from manage categories)
      'cart': <FontAwesome5 name="shopping-cart" size={size} color={color} />,
      'car': <FontAwesome5 name="car" size={size} color={color} />,
      'home': <FontAwesome5 name="home" size={size} color={color} />,
      'utensils': <FontAwesome5 name="utensils" size={size} color={color} />,
      'gamepad': <FontAwesome5 name="gamepad" size={size} color={color} />,
      'plane': <FontAwesome5 name="plane" size={size} color={color} />,
      'gift': <FontAwesome5 name="gift" size={size} color={color} />,
      'heart': <FontAwesome5 name="heart" size={size} color={color} />,
      'credit-card': <FontAwesome5 name="credit-card" size={size} color={color} />,
      'shopping-bag': <FontAwesome5 name="shopping-bag" size={size} color={color} />,
      'bolt': <FontAwesome5 name="bolt" size={size} color={color} />,
      'dollar-sign': <FontAwesome5 name="dollar-sign" size={size} color={color} />,
      'music': <FontAwesome5 name="music" size={size} color={color} />,
      'film': <FontAwesome5 name="film" size={size} color={color} />,
      'book': <FontAwesome5 name="book" size={size} color={color} />,
      'medkit': <FontAwesome5 name="medkit" size={size} color={color} />,
      'paw': <FontAwesome5 name="paw" size={size} color={color} />,
      'tshirt': <FontAwesome5 name="tshirt" size={size} color={color} />,
      'mobile-alt': <FontAwesome5 name="mobile-alt" size={size} color={color} />,
      'glass-cheers': <FontAwesome5 name="glass-cheers" size={size} color={color} />,
      
      // MaterialIcons and Ionicons (legacy support)
      'restaurant': <MaterialIcons name="restaurant" size={size} color={color} />,
      'car-sport': <Ionicons name="car-sport" size={size} color={color} />,
      'receipt': <MaterialIcons name="receipt" size={size} color={color} />,
      'movie': <MaterialIcons name="movie" size={size} color={color} />,
      'cash': <Ionicons name="cash" size={size} color={color} />,
      'laptop': <Ionicons name="laptop" size={size} color={color} />,
      'medical': <Ionicons name="medical" size={size} color={color} />,
      'school': <Ionicons name="school" size={size} color={color} />,
      'airplane': <Ionicons name="airplane" size={size} color={color} />,
      'bus': <Ionicons name="bus" size={size} color={color} />,
      'train': <Ionicons name="train" size={size} color={color} />,
      'bicycle': <Ionicons name="bicycle" size={size} color={color} />,
      'walk': <Ionicons name="walk" size={size} color={color} />,
      'fitness': <Ionicons name="fitness" size={size} color={color} />,
      'game-controller': <Ionicons name="game-controller" size={size} color={color} />,
      'library': <Ionicons name="library" size={size} color={color} />,
      'card': <Ionicons name="card" size={size} color={color} />,
      'wallet': <Ionicons name="wallet" size={size} color={color} />,
      'bank': <Ionicons name="business" size={size} color={color} />,
      'phone': <Ionicons name="phone-portrait" size={size} color={color} />,
      'wifi': <Ionicons name="wifi" size={size} color={color} />,
      'electricity': <Ionicons name="flash" size={size} color={color} />,
      'water': <Ionicons name="water" size={size} color={color} />,
      'gas': <Ionicons name="flame" size={size} color={color} />,
      'internet': <Ionicons name="globe" size={size} color={color} />,
      'tv': <Ionicons name="tv" size={size} color={color} />,
      'camera': <Ionicons name="camera" size={size} color={color} />,
      'pizza': <Ionicons name="pizza" size={size} color={color} />,
      'beer': <Ionicons name="beer" size={size} color={color} />,
      'wine': <Ionicons name="wine" size={size} color={color} />,
      'coffee': <Ionicons name="cafe" size={size} color={color} />,
      'fast-food': <Ionicons name="fast-food" size={size} color={color} />,
      'ice-cream': <Ionicons name="ice-cream" size={size} color={color} />,
    };
    return iconMap[iconName] || <MaterialIcons name="category" size={size} color={color} />;
  };
  
  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        <View style={styles.headerRow}>
          <TouchableOpacity>
            <Ionicons name="arrow-back" size={22} color="#222" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Transaction Details</Text>
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <TouchableOpacity>
              <Ionicons name="share-social-outline" size={22} color="#888" />
            </TouchableOpacity>
            <TouchableOpacity>
              <Ionicons name="create-outline" size={22} color="#888" />
            </TouchableOpacity>
          </View>
        </View>
        <View style={styles.card}>
          <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 10 }}>
            <View style={styles.iconWrap}>
              {getIconComponent(tx.categoryIcon || tx.iconName || 'category', tx.categoryColor || tx.iconColor || '#FF9900', 28)}
            </View>
            <View style={{ marginLeft: 10 }}>
              <Text style={styles.label}>{tx.description || tx.label}</Text>
              <View style={{ flexDirection: 'row', gap: 8, marginTop: 2 }}>
                <View style={styles.chip}><Text style={styles.chipText}>{tx.categoryName || tx.category}</Text></View>
                <View style={[styles.chip, { backgroundColor: tx.type === 'income' ? '#E6F9ED' : '#FFEBEE' }]}>
                  <Text style={[styles.chipText, { color: tx.type === 'income' ? '#43A047' : '#FF5252' }]}>
                    {tx.type === 'income' ? 'Income' : 'Expense'}
                  </Text>
                </View>
              </View>
            </View>
          </View>
          <Text style={styles.amountLabel}>Transaction Amount</Text>
          <Text style={styles.amountValue}>₹ {tx.amount.toLocaleString()}</Text>
        </View>
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>Transaction Information</Text>
          <View style={styles.infoRow3}>
            <Ionicons name="calendar-outline" size={24} color="#222" style={styles.infoIcon3} />
            <View>
              <Text style={styles.infoLabel3}>Date</Text>
              <Text style={styles.infoValue3}>
                {formatDate(tx.date)}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow3}>
            <Ionicons name="time-outline" size={24} color="#222" style={styles.infoIcon3} />
            <View>
              <Text style={styles.infoLabel3}>Time</Text>
              <Text style={styles.infoValue3}>
                {tx.time || (typeof tx.date === 'object' ? tx.date.toLocaleTimeString() : 'N/A')}
              </Text>
            </View>
          </View>
          <View style={styles.infoRow3}>
            <Ionicons name="location-outline" size={24} color="#222" style={styles.infoIcon3} />
            <View>
              <Text style={styles.infoLabel3}>Location</Text>
              <Text style={styles.infoValue3}>{tx.location || 'Not specified'}</Text>
            </View>
          </View>
          <View style={styles.infoRow3}>
            <MaterialCommunityIcons name="credit-card-outline" size={24} color="#222" style={styles.infoIcon3} />
            <View>
              <Text style={styles.infoLabel3}>Payment Method</Text>
              <Text style={styles.infoValue3}>{tx.payment || 'Not specified'}</Text>
            </View>
          </View>
        </View>
        <View style={styles.notesCard}>
          <Text style={styles.notesTitle}>Notes</Text>
          <Text style={styles.notesText}>{tx.notes || 'No notes added'}</Text>
        </View>
        {tx.breakdown && tx.breakdown.length > 0 && (
          <View style={styles.breakdownCard2}>
            <Text style={styles.breakdownTitle2}>Amount Breakdown</Text>
            {tx.breakdown.map((item, idx) => (
              <View key={item.label} style={styles.breakdownRow2}>
                <Text style={styles.breakdownLabel2}>{item.label}</Text>
                <Text style={styles.breakdownAmount2}>₹ {item.amount}</Text>
              </View>
            ))}
            <View style={styles.breakdownTotal2}>
              <Text style={styles.breakdownTotalLabel2}>Total</Text>
              <Text style={styles.breakdownTotalAmount2}>₹ {total}</Text>
            </View>
          </View>
        )}
        <TouchableOpacity style={styles.receiptBtn}>
          <Text style={styles.receiptBtnText}>View Receipt</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  headerRow: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#222' },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, alignItems: 'flex-start', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  iconWrap: { backgroundColor: '#FFF3E0', borderRadius: 8, padding: 10 },
  label: { fontSize: 16, fontWeight: 'bold', color: '#222' },
  chip: { backgroundColor: '#F3F7FF', borderRadius: 8, paddingHorizontal: 10, paddingVertical: 2, marginRight: 4 },
  chipText: { color: '#2979FF', fontWeight: 'bold', fontSize: 12 },
  amountLabel: { color: '#888', fontSize: 14, marginTop: 10 },
  amountValue: { fontSize: 28, fontWeight: 'bold', color: '#222', marginTop: 2 },
  infoCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  infoTitle: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 10, fontFamily: 'Poppins' },
  infoRow: { flexDirection: 'column', alignItems: 'flex-start', marginBottom: 12 },
  infoIcon: { marginRight: 8, width: 22 },
  infoLabel: { color: '#888', fontSize: 14, fontWeight: 'bold' },
  infoValue: { color: '#222', fontSize: 15, marginTop: 2 },
  breakdownCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  breakdownTitle: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 10 },
  breakdownRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  breakdownLabel: { color: '#222', fontSize: 14 },
  breakdownAmount: { color: '#222', fontSize: 14 },
  receiptBtn: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 16, alignItems: 'center', marginTop: 8 },
  receiptBtnText: { color: '#222', fontWeight: 'bold', fontSize: 16, fontFamily: 'Poppins' },
  infoRow2: { flexDirection: 'row', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 16 },
  infoColLeft: { flexDirection: 'row', alignItems: 'center', minWidth: 120 },
  infoLabel2: { color: '#222', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },
  infoValue2: { color: '#888', fontSize: 15, flex: 1, textAlign: 'right', marginLeft: 12 },
  breakdownCard2: { backgroundColor: '#fff', borderRadius: 12, padding: 16, marginBottom: 18, borderWidth: 1, borderColor: '#E0E0E0' },
  breakdownTitle2: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 10, fontFamily: 'Poppins' },
  breakdownRow2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 },
  breakdownLabel2: { color: '#222', fontSize: 15, fontFamily: 'Poppins' },
  breakdownAmount2: { color: '#222', fontSize: 15, fontFamily: 'Poppins' },
  divider2: { height: 1, backgroundColor: '#E0E0E0', marginVertical: 8 },
  infoRow3: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 14 },
  infoIcon3: { marginRight: 14, marginTop: 2 },
  infoLabel3: { color: '#111', fontWeight: 'bold', fontSize: 16, marginBottom: 2, fontFamily: 'Poppins' },
  infoValue3: { color: '#888', fontSize: 15, marginBottom: 0, fontFamily: 'Poppins' },
  notesCard: { backgroundColor: '#fff', borderRadius: 16, padding: 18, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  notesTitle: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 10, fontFamily: 'Poppins' },
  notesText: { color: '#888', fontSize: 15, fontFamily: 'Poppins' },
  breakdownTotal2: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: 10 },
  breakdownTotalLabel2: { color: '#222', fontWeight: 'bold', fontSize: 15, fontFamily: 'Poppins' },
  breakdownTotalAmount2: { color: '#222', fontWeight: 'bold', fontSize: 15, fontFamily: 'Poppins' },
}); 