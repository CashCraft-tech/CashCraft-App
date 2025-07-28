import React, { useState, useEffect } from "react";
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Platform, Alert, ActivityIndicator } from "react-native";
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialIcons, FontAwesome5 } from '@expo/vector-icons';
import { categoriesService, Category } from '../services/categoriesService';
import { transactionsService } from '../services/transactionsService';
import { useAuth } from '../context/AuthContext';

const PAYMENT_TYPES = [
  { label: 'Cash', icon: <FontAwesome5 name="money-bill-wave" size={20} color="#43A047" /> },
  { label: 'Credit Card', icon: <FontAwesome5 name="credit-card" size={20} color="#FFD600" /> },
  { label: 'Debit Card', icon: <FontAwesome5 name="credit-card" size={20} color="#FF9800" /> },
  { label: 'UPI/Digital', icon: <FontAwesome5 name="mobile-alt" size={20} color="#00BCD4" /> },
  { label: 'Bank Transfer', icon: <FontAwesome5 name="university" size={20} color="#43A047" /> },
];

export default function Add() {
  const { user } = useAuth();
  const [transactionType, setTransactionType] = useState<'Expense' | 'Income'>('Expense');
  const [paymentType, setPaymentType] = useState<string | null>(null);
  const [category, setCategory] = useState<string | null>(null);
  const [selectedCategory, setSelectedCategory] = useState<Category | null>(null);
  const [amount, setAmount] = useState('');
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [receipt, setReceipt] = useState<any>(null);
  const [paymentDropdown, setPaymentDropdown] = useState(false);
  const [categoryDropdown, setCategoryDropdown] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch categories from Firebase
  useEffect(() => {
    const fetchCategories = async () => {
      if (!user?.uid) return;
      
      try {
        console.log('Fetching categories for user:', user.uid);
        const userCategories = await categoriesService.getUserCategories(user.uid);
        console.log('All user categories:', userCategories);
        
        // Don't filter by type - show all categories for both income and expense
        setCategories(userCategories);
        console.log('Categories state set to:', userCategories.length, 'categories');
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      }
    };

    fetchCategories();
  }, [user]); // Remove transactionType dependency since we're not filtering by type

  // Validation helpers
  function isValidTime(time: string) {
    const [hh, mm] = time.split(':');
    if (!hh || !mm || hh.length !== 2 || mm.length !== 2) return false;
    const h = parseInt(hh, 10);
    const m = parseInt(mm, 10);
    return h >= 0 && h <= 23 && m >= 0 && m <= 59;
  }
  function isValidDate(date: string) {
    const [dd, mm, yyyy] = date.split('-');
    if (!dd || !mm || !yyyy || dd.length !== 2 || mm.length !== 2 || yyyy.length !== 4) return false;
    const d = parseInt(dd, 10);
    const m = parseInt(mm, 10);
    const y = parseInt(yyyy, 10);
    if (m < 1 || m > 12) return false;
    if (d < 1 || d > 31) return false;
    // Check for correct days in month
    const daysInMonth = new Date(y, m, 0).getDate();
    if (d > daysInMonth) return false;
    return true;
  }
  const dateError = date && !isValidDate(date) ? 'Enter a valid date (DD-MM-YYYY)' : '';
  const timeError = time && !isValidTime(time) ? 'Enter a valid time (HH:MM, 24h)' : '';
  const canSave = paymentType && selectedCategory && amount && title && isValidDate(date) && isValidTime(time);

  // Helper to format date as DD-MM-YYYY with auto dashes
  function formatDateInput(text: string) {
    // Remove all non-digits
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 8) cleaned = cleaned.slice(0, 8);
    let formatted = '';
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length > 2) formatted += '-' + cleaned.slice(2, 4);
    if (cleaned.length > 4) formatted += '-' + cleaned.slice(4, 8);
    return formatted;
  }

  // Helper to format time as HH:MM with auto colon
  function formatTimeInput(text: string) {
    let cleaned = text.replace(/[^0-9]/g, '');
    if (cleaned.length > 4) cleaned = cleaned.slice(0, 4);
    let formatted = '';
    if (cleaned.length > 0) formatted += cleaned.slice(0, 2);
    if (cleaned.length > 2) formatted += ':' + cleaned.slice(2, 4);
    return formatted;
  }

  // Save transaction to Firebase
  const handleSaveTransaction = async () => {
    if (!user?.uid || !selectedCategory) return;

    setLoading(true);
    try {
      // Parse date and time
      const [dd, mm, yyyy] = date.split('-');
      const [hh, mm_time] = time.split(':');
      const transactionDate = new Date(parseInt(yyyy), parseInt(mm) - 1, parseInt(dd), parseInt(hh), parseInt(mm_time), 0, 0);

      console.log('Creating transaction with date:', transactionDate.toISOString());

      const transaction = {
        userId: user.uid,
        categoryId: selectedCategory.id!,
        categoryName: selectedCategory.name,
        categoryIcon: selectedCategory.icon,
        categoryColor: selectedCategory.color,
        amount: parseFloat(amount),
        type: (transactionType === 'Expense' ? 'expense' : 'income') as 'expense' | 'income',
        description: title,
        date: transactionDate,
        notes: description,
      };

      await transactionsService.addTransaction(transaction);
      Alert.alert('Success', 'Transaction added successfully!');
      
      // Reset form
      setAmount('');
      setTitle('');
      setDescription('');
      setDate('');
      setTime('');
      setPaymentType(null);
      setSelectedCategory(null);
      setCategory(null);
      
    } catch (error) {
      console.error('Error saving transaction:', error);
      Alert.alert('Error', 'Failed to save transaction');
    } finally {
      setLoading(false);
    }
  };

  const getIconComponent = (iconName: string, color: string, size: number = 20) => {
    const iconMap: { [key: string]: any } = {
      'restaurant': <MaterialIcons name="restaurant" size={size} color={color} />,
      'car-sport': <Ionicons name="car-sport" size={size} color={color} />,
      'receipt': <MaterialIcons name="receipt" size={size} color={color} />,
      'shopping-bag': <MaterialIcons name="shopping-bag" size={size} color={color} />,
      'movie': <MaterialIcons name="movie" size={size} color={color} />,
      'heart': <Ionicons name="heart" size={size} color={color} />,
      'cash': <Ionicons name="cash" size={size} color={color} />,
      'laptop': <Ionicons name="laptop" size={size} color={color} />,
    };
    return iconMap[iconName] || <MaterialIcons name="category" size={size} color={color} />;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: '#F8F9FB' }}>
      <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={styles.label}>Transaction Type</Text>
        <View style={styles.toggleRow}>
          <TouchableOpacity
            style={[styles.toggleBtn, transactionType === 'Expense' && styles.toggleBtnActive]}
            onPress={() => setTransactionType('Expense')}
          >
            <Ionicons name="remove-circle" size={24} color={transactionType === 'Expense' ? '#FF5252' : '#ccc'} />
            <Text style={[styles.toggleBtnText, transactionType === 'Expense' && styles.toggleBtnTextActive]}>Expense</Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.toggleBtn, transactionType === 'Income' && styles.toggleBtnActive]}
            onPress={() => setTransactionType('Income')}
          >
            <Ionicons name="add-circle" size={24} color={transactionType === 'Income' ? '#43A047' : '#ccc'} />
            <Text style={[styles.toggleBtnText, transactionType === 'Income' && styles.toggleBtnTextActive]}>Income</Text>
          </TouchableOpacity>
        </View>

        {/* Payment Type Dropdown */}
        <Text style={styles.label}>Payment Type</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setPaymentDropdown(!paymentDropdown)}>
          <Text style={styles.dropdownText}>{paymentType || 'Select Payment Type'}</Text>
          <Ionicons name={paymentDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#888" />
        </TouchableOpacity>
        {paymentDropdown && (
          <View style={styles.dropdownList}>
            {PAYMENT_TYPES.map((item) => (
              <TouchableOpacity
                key={item.label}
                style={styles.dropdownItem}
                onPress={() => { setPaymentType(item.label); setPaymentDropdown(false); }}
              >
                {item.icon}
                <Text style={styles.dropdownItemText}>{item.label}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Category Dropdown */}
        <Text style={styles.label}>Category</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => setCategoryDropdown(!categoryDropdown)}>
          <Text style={styles.dropdownText}>{category || 'Select a category'}</Text>
          <Ionicons name={categoryDropdown ? 'chevron-up' : 'chevron-down'} size={20} color="#888" />
        </TouchableOpacity>
        {categoryDropdown && (
          <View style={styles.dropdownList}>
            {categories.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={styles.dropdownItem}
                onPress={() => { setCategory(item.name); setSelectedCategory(item); setCategoryDropdown(false); }}
              >
                {getIconComponent(item.icon, item.color)}
                <Text style={styles.dropdownItemText}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Amount */}
        <Text style={styles.label}>Amount</Text>
        <View style={styles.amountRow}>
          <Text style={styles.currency}>₹</Text>
          <TextInput
            style={styles.amountInput}
            placeholder="0.00"
            keyboardType="numeric"
            value={amount}
            onChangeText={setAmount}
          />
        </View>

        {/* Title */}
        <Text style={styles.label}>Title</Text>
        <TextInput
          style={styles.input}
          placeholder="e.g., Lunch at restaurant"
          value={title}
          onChangeText={setTitle}
        />

        {/* Description */}
        <Text style={styles.label}>Description</Text>
        <TextInput
          style={styles.input}
          placeholder="Add any additional notes..."
          value={description}
          onChangeText={setDescription}
        />

        {/* Date & Time */}
        <View style={styles.row}>
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Date</Text>
            <TextInput
              style={styles.input}
              placeholder="DD-MM-YYYY"
              value={date}
              onChangeText={text => setDate(formatDateInput(text))}
              keyboardType="numeric"
              maxLength={10}
            />
            {dateError ? <Text style={{ color: '#FF5252', fontSize: 13, marginTop: 2 }}>{dateError}</Text> : null}
          </View>
          <View style={{ width: 16 }} />
          <View style={{ flex: 1 }}>
            <Text style={styles.label}>Time</Text>
            <TextInput
              style={styles.input}
              placeholder="HH:MM"
              value={time}
              onChangeText={text => setTime(formatTimeInput(text))}
              keyboardType="numeric"
              maxLength={5}
            />
            {timeError ? <Text style={{ color: '#FF5252', fontSize: 13, marginTop: 2 }}>{timeError}</Text> : null}
          </View>
        </View>

        {/* Receipt Upload */}
        <Text style={styles.label}>Receipt <Text style={{ color: '#888' }}>(Optional)</Text></Text>
        <TouchableOpacity style={styles.receiptBox}>
          <Ionicons name="cloud-upload-outline" size={32} color="#B0B0B0" />
          <Text style={styles.receiptText}>Add Receipt</Text>
          <Text style={styles.receiptSub}>Take a photo or upload from gallery</Text>
        </TouchableOpacity>

        {/* Action Buttons */}
        <View style={styles.actionRow}>
          <TouchableOpacity style={styles.cancelBtn}>
            <Text style={styles.cancelBtnText}>Cancel</Text>
          </TouchableOpacity>
          <TouchableOpacity style={[styles.saveBtn, !canSave && { backgroundColor: '#E0E0E0' }]} disabled={!canSave || loading} onPress={handleSaveTransaction}>
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.saveBtnText}>Save Transaction</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  scrollContent: { padding: 20, paddingBottom: 40 },
  label: { fontSize: 14, color: '#222', fontWeight: 'bold', marginBottom: 6, marginTop: 16 },
  toggleRow: { flexDirection: 'row', backgroundColor: '#F5F5F5', borderRadius: 16, padding: 4, marginBottom: 12 },
  toggleBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16, borderRadius: 12 },
  toggleBtnActive: { backgroundColor: '#fff', shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  toggleBtnText: { marginLeft: 8, fontWeight: 'bold', color: '#888', fontSize: 15 },
  toggleBtnTextActive: { color: '#222' },
  dropdown: { backgroundColor: '#fff', borderRadius: 10, padding: 14, flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  dropdownText: { color: '#888', fontSize: 15 },
  dropdownList: { backgroundColor: '#fff', borderRadius: 10, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0', overflow: 'hidden' },
  dropdownItem: { flexDirection: 'row', alignItems: 'center', padding: 14, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  dropdownItemText: { marginLeft: 12, fontSize: 15, color: '#222' },
  amountRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, paddingHorizontal: 14, marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  currency: { fontSize: 18, color: '#888', marginRight: 6 },
  amountInput: { flex: 1, fontSize: 18, color: '#222', paddingVertical: 12 },
  input: { backgroundColor: '#fff', borderRadius: 10, padding: 14, fontSize: 15, color: '#222', marginBottom: 8, borderWidth: 1, borderColor: '#E0E0E0' },
  row: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  dateBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 10, padding: 14, borderWidth: 1, borderColor: '#E0E0E0' },
  dateText: { color: '#222', fontSize: 15 },
  receiptBox: { backgroundColor: '#fff', borderRadius: 12, borderWidth: 1, borderColor: '#E0E0E0', alignItems: 'center', justifyContent: 'center', padding: 24, marginBottom: 16, marginTop: 4 },
  receiptText: { color: '#222', fontWeight: 'bold', fontSize: 15, marginTop: 8 },
  receiptSub: { color: '#888', fontSize: 13, marginTop: 2 },
  actionRow: { flexDirection: 'row', justifyContent: 'space-between', marginTop: 16, gap: 12 },
  cancelBtn: { flex: 1, backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingVertical: 16, alignItems: 'center', marginRight: 4 },
  cancelBtnText: { color: '#222', fontWeight: 'bold', fontSize: 16 },
  saveBtn: { flex: 1, backgroundColor: '#222', borderRadius: 8, paddingVertical: 16, alignItems: 'center', marginLeft: 4 },
  saveBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 16 },
}); 