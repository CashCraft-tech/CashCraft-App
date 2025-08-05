import React, { useState, type ReactElement, useEffect } from "react";
import { SafeAreaView } from 'react-native-safe-area-context';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Modal, FlatList, Alert, RefreshControl, KeyboardAvoidingView, Platform } from "react-native";
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { Ionicons, MaterialIcons, Feather, FontAwesome5, FontAwesome } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { categoriesService, Category } from '../services/categoriesService';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { notificationService } from '../services/notificationService';

const ICONS = [
  'cart', 'car', 'home', 'utensils', 'gamepad', 'plane', 'gift', 'heart', 'credit-card', 'shopping-bag', 'bolt', 'dollar-sign', 'music', 'film', 'book', 'medkit', 'paw', 'tshirt', 'mobile-alt', 'glass-cheers',
  'restaurant', 'car-sport', 'receipt', 'movie', 'ellipsis-h', 'cash', 'laptop'
];
// Helper function to determine icon color based on background color
const getIconColor = (backgroundColor: string): string => {
  // Convert hex to RGB
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substr(0, 2), 16);
  const g = parseInt(hex.substr(2, 2), 16);
  const b = parseInt(hex.substr(4, 2), 16);
  
  // Calculate luminance
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  
  // Return white for dark backgrounds, dark gray for light backgrounds
  return luminance > 0.5 ? '#222' : '#FFFFFF';
};

const ICON_MAP: { [key: string]: ReactElement } = {
  cart: <FontAwesome5 name="shopping-cart" size={22} color="#222" />, 
  car: <FontAwesome5 name="car" size={22} color="#222" />, 
  home: <FontAwesome5 name="home" size={22} color="#222" />, 
  utensils: <FontAwesome5 name="utensils" size={22} color="#222" />, 
  gamepad: <FontAwesome5 name="gamepad" size={22} color="#222" />, 
  plane: <FontAwesome5 name="plane" size={22} color="#222" />, 
  gift: <FontAwesome5 name="gift" size={22} color="#222" />, 
  heart: <FontAwesome5 name="heart" size={22} color="#222" />, 
  'credit-card': <FontAwesome5 name="credit-card" size={22} color="#222" />, 
  'shopping-bag': <FontAwesome5 name="shopping-bag" size={22} color="#222" />, 
  bolt: <FontAwesome5 name="bolt" size={22} color="#222" />, 
  'dollar-sign': <FontAwesome5 name="dollar-sign" size={22} color="#222" />, 
  music: <FontAwesome5 name="music" size={22} color="#222" />, 
  film: <FontAwesome5 name="film" size={22} color="#222" />, 
  book: <FontAwesome5 name="book" size={22} color="#222" />, 
  medkit: <FontAwesome5 name="medkit" size={22} color="#222" />, 
  paw: <FontAwesome5 name="paw" size={22} color="#222" />, 
  tshirt: <FontAwesome5 name="tshirt" size={22} color="#222" />, 
  'mobile-alt': <FontAwesome5 name="mobile-alt" size={22} color="#222" />, 
  'glass-cheers': <FontAwesome5 name="glass-cheers" size={22} color="#222" />,
  restaurant: <Ionicons name="restaurant" size={22} color="#222" />,
  'car-sport': <Ionicons name="car-sport" size={22} color="#222" />,
  receipt: <Ionicons name="receipt" size={22} color="#222" />,
  movie: <Ionicons name="film" size={22} color="#222" />,
  'ellipsis-h': <FontAwesome5 name="ellipsis-h" size={22} color="#222" />,
  cash: <Ionicons name="cash" size={22} color="#222" />,
  laptop: <Ionicons name="laptop" size={22} color="#222" />
};
const COLORS = [
  '#2979FF', '#43A047', '#AB47BC', '#FF9800', '#F06292', '#00BCD4', '#8BC34A', '#FFD600', '#FF5252', '#00B8D4', '#7C4DFF', '#FFB300', '#FF1744', '#00E676', '#D500F9', '#FF6F00', '#607D8B', '#90A4AE', '#B0BEC5', '#FFA726'
];

const initialCategories = [
  { name: 'Groceries', icon: 'cart', color: '#AB47BC', spent: 12500, isDefault: true },
  { name: 'Transport', icon: 'car', color: '#43A047', spent: 8200, isDefault: true },
  { name: 'Housing', icon: 'home', color: '#AB47BC', spent: 25000, isDefault: true },
  { name: 'Food & Dining', icon: 'utensils', color: '#FF9800', spent: 6800, isDefault: true },
  { name: 'Entertainment', icon: 'gamepad', color: '#F06292', spent: 4200, isDefault: false },
];

export default function ManageCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [selectedIcon, setSelectedIcon] = useState(ICONS[0]);
  const [selectedColor, setSelectedColor] = useState(COLORS[0]);
  const [categoryName, setCategoryName] = useState('');
  const [refreshing, setRefreshing] = useState(false);

  // For editing
  const [editIndex, setEditIndex] = useState<number | null>(null);
  const router = useRouter();
  const { user } = useAuth();
  const { theme } = useTheme();

  const fetchCategories = async () => {
    if (user?.uid) {
      try {
        const userCategories = await categoriesService.getUserCategories(user.uid);
        setCategories(userCategories);
      } catch (error) {
        console.error('Error fetching categories:', error);
        Alert.alert('Error', 'Failed to load categories');
      }
    }
  };

  useEffect(() => {
    fetchCategories();
  }, [user]);

  const onRefresh = async () => {
    setRefreshing(true);
    await fetchCategories();
    setRefreshing(false);
  };

  const openPicker = (icon: string, color: string, idx: number | null) => {
    setSelectedIcon(icon || ICONS[0]);
    setSelectedColor(color || COLORS[0]);
    setEditIndex(idx);
    setModalVisible(true);
    setPickerTab('Icons');
  };

  const handleAddOrEdit = async () => {
    if (!categoryName.trim() || !user?.uid) return;
    
    try {
      if (editIndex !== null) {
        // Edit
        const categoryToUpdate = categories[editIndex];
        if (categoryToUpdate.id) {
          await categoriesService.updateCategory(categoryToUpdate.id, {
            name: categoryName,
            icon: selectedIcon,
            color: selectedColor
          });
          
          const updated = [...categories];
          updated[editIndex] = { ...updated[editIndex], name: categoryName, icon: selectedIcon, color: selectedColor };
          setCategories(updated);
        }
        setEditIndex(null);
      } else {
        // Add new
        const newCategoryId = await categoriesService.addCategory({
          userId: user.uid,
          name: categoryName,
          icon: selectedIcon,
          color: selectedColor,
          type: 'expense'
        });
        
        const newCategory: Category = {
          id: newCategoryId,
          userId: user.uid,
          name: categoryName,
          icon: selectedIcon,
          color: selectedColor,
          type: 'expense'
        };
        
        setCategories([...categories, newCategory]);
        // No notification for category added - only low balance alerts
      }
      
      setCategoryName('');
      setSelectedIcon(ICONS[0]);
      setSelectedColor(COLORS[0]);
      setModalVisible(false);
    } catch (error) {
      console.error('Error saving category:', error);
      Alert.alert('Error', 'Failed to save category');
    }
  };

  const handleEdit = (idx: number) => {
    const cat = categories[idx];
    setCategoryName(cat.name);
    openPicker(cat.icon, cat.color, idx);
  };

  const handleDelete = async (idx: number) => {
    const categoryToDelete = categories[idx];
    if (!categoryToDelete.id || !user?.uid) return;
    
    // Prevent deletion of "Others" category only
    if (categoryToDelete.name === 'Others') {
      Alert.alert(
        'Cannot Delete',
        'The "Others" category cannot be deleted as it is used to store transactions from deleted categories.',
        [{ text: 'OK', style: 'default' }]
      );
      return;
    }
    
    // Show different message for default categories
    const isDefault = categoryToDelete.isDefault;
    const message = isDefault 
      ? `Are you sure you want to delete the default category "${categoryToDelete.name}"? All transactions in this category will be moved to "Others". You can always recreate it later.`
      : `Are you sure you want to delete "${categoryToDelete.name}"? All transactions in this category will be moved to "Others".`;
    
    Alert.alert(
      'Delete Category',
      message,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await categoriesService.deleteCategory(categoryToDelete.id!, user.uid);
              setCategories(categories.filter((_, i) => i !== idx));
              
              // Show appropriate message based on whether there were transactions
              Alert.alert(
                'Category Deleted',
                `"${categoryToDelete.name}" has been deleted successfully. Any transactions in this category have been moved to "Others".`
              );
            } catch (error) {
              console.error('Error deleting category:', error);
              Alert.alert(
                'Error', 
                'Failed to delete category. Please check your internet connection and try again.'
              );
            }
          },
        },
      ],
    );
  };

  const [addModalVisible, setAddModalVisible] = useState(false);
  const [addName, setAddName] = useState('');
  const [addIcon, setAddIcon] = useState(ICONS[0]);
  const [addColor, setAddColor] = useState(COLORS[0]);
  const [addStep, setAddStep] = useState(1);
  const [addPickerTab, setAddPickerTab] = useState<'Icons' | 'Colors'>('Icons');
  const [iconPickerVisible, setIconPickerVisible] = useState(false);
  // For edit flow
  const [pickerTab, setPickerTab] = useState<'Icons' | 'Colors'>('Icons');

  const canCreate = addName.trim() && addIcon && addColor;

  return (
    <KeyboardAwareScrollView
      contentContainerStyle={{ flexGrow: 1, backgroundColor: theme.background }}
      enableOnAndroid={true}
      extraScrollHeight={20}
      keyboardShouldPersistTaps="handled"
      enableAutomaticScroll={true}
    >
      <SafeAreaView style={{ flex: 1, backgroundColor: theme.background }}>
        <StatusBar style={theme.statusBarStyle} backgroundColor={theme.background} />
        <View style={[styles.headerWrap, { backgroundColor: theme.background }]}>
          <TouchableOpacity style={styles.headerBack} onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={22} color={theme.textSecondary} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: theme.text }]}>Manage Categories</Text>
            <Text style={[styles.headerSubtitle, { color: theme.textSecondary }]}>Customize your spending categories</Text>
          </View>
        </View>
        <ScrollView 
          contentContainerStyle={[styles.scrollContent, { backgroundColor: theme.background }]} 
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} colors={[theme.primary]} />
          }
        >
          {/* Create New Category Card */}
          <View style={[styles.createCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <View style={[styles.createIconWrap, { backgroundColor: theme.surface }]}>
              <Ionicons name="add" size={36} color={theme.textTertiary} />
            </View>
            <Text style={[styles.createTitle, { color: theme.text }]}>Create New Category</Text>
            <Text style={[styles.createSub, { color: theme.textSecondary }]}>Add a custom category to track your spending</Text>
            <TouchableOpacity style={[styles.createBtn, { backgroundColor: theme.primary }]} onPress={() => setAddModalVisible(true)}>
              <Ionicons name="add" size={18} color={theme.textInverse} style={{ marginRight: 8 }} />
              <Text style={[styles.createBtnText, { color: theme.textInverse }]}>Add New Category</Text>
            </TouchableOpacity>
          </View>

          {/* Your Categories */}
          <View style={[styles.card, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.sectionTitle, { color: theme.text }]}>Your Categories</Text>
            <Text style={[styles.cardSub, { color: theme.textSecondary }]}>Manage and customize your spending categories</Text>
            {categories.map((cat, idx) => (
              <View key={cat.id} style={styles.catRow}>
                <View style={[styles.catIcon, { backgroundColor: cat.color }]}>
                  {React.isValidElement(ICON_MAP[cat.icon])
                    ? React.cloneElement(ICON_MAP[cat.icon] as any, { color: getIconColor(cat.color) })
                    : ICON_MAP[cat.icon]}
                </View>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.catName, { color: theme.text }]}>{cat.name}</Text>
                  <Text style={[styles.catSub, { color: theme.textSecondary }]}>Custom category</Text>
                </View>
                <View style={styles.catActions}>
                  <TouchableOpacity style={styles.catAction} onPress={() => handleEdit(idx)}>
                    <Ionicons name="pencil" size={16} color={theme.textSecondary} />
                  </TouchableOpacity>
                  {cat.name !== 'Others' && (
                    <TouchableOpacity style={styles.catAction} onPress={() => handleDelete(idx)}>
                      <Ionicons name="trash" size={16} color={theme.error} />
                    </TouchableOpacity>
                  )}
                </View>
              </View>
            ))}
          </View>

          {/* Quick Tips */}
          <View style={[styles.tipsCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
            <Text style={[styles.tipsTitle, { color: theme.text }]}>Quick Tips</Text>
            <View style={styles.tipRow}><Text style={[styles.tipDot, { color: theme.primary }]}>•</Text><Text style={[styles.tipText, { color: theme.textSecondary }]}>Tap the edit icon to change category icon and color</Text></View>
            <View style={styles.tipRow}><Text style={[styles.tipDot, { color: theme.primary }]}>•</Text><Text style={[styles.tipText, { color: theme.textSecondary }]}>Only "Others" category cannot be deleted</Text></View>
            <View style={styles.tipRow}><Text style={[styles.tipDot, { color: theme.primary }]}>•</Text><Text style={[styles.tipText, { color: theme.textSecondary }]}>Choose meaningful icons for better organization</Text></View>
            <View style={styles.tipRow}><Text style={[styles.tipDot, { color: theme.primary }]}>•</Text><Text style={[styles.tipText, { color: theme.textSecondary }]}>Deleted categories' transactions are moved to "Others"</Text></View>
            <View style={styles.tipRow}><Text style={[styles.tipDot, { color: theme.primary }]}>•</Text><Text style={[styles.tipText, { color: theme.textSecondary }]}>Default categories can be deleted and recreated anytime</Text></View>
          </View>

          {/* Icon & Color Picker Modal */}
          <Modal visible={modalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Icon & Color</Text>
                  <TouchableOpacity onPress={() => setModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                <View style={styles.modalPreviewRow}>
                  <View style={[styles.iconPreview, { backgroundColor: selectedColor, width: 48, height: 48 }]}>
                    {React.isValidElement(ICON_MAP[selectedIcon])
                      ? React.cloneElement(ICON_MAP[selectedIcon] as any, { color: getIconColor(selectedColor) })
                      : ICON_MAP[selectedIcon]}
                  </View>
                  <View style={{ marginLeft: 12 }}>
                    <Text style={[styles.modalPreviewLabel, { color: theme.text }]}>Preview</Text>
                    <Text style={[styles.modalPreviewSub, { color: theme.textSecondary }]}>Selected icon and color</Text>
                  </View>
                </View>
                <View style={styles.modalTabsRow}>
                  <TouchableOpacity style={[styles.modalTab, pickerTab === 'Icons' && styles.modalTabActive, { backgroundColor: pickerTab === 'Icons' ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setPickerTab('Icons')}><Text style={[pickerTab === 'Icons' ? styles.modalTabTextActive : styles.modalTabText, { color: pickerTab === 'Icons' ? theme.textInverse : theme.text }]}>Icons</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.modalTab, pickerTab === 'Colors' && styles.modalTabActive, { backgroundColor: pickerTab === 'Colors' ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setPickerTab('Colors')}><Text style={[pickerTab === 'Colors' ? styles.modalTabTextActive : styles.modalTabText, { color: pickerTab === 'Colors' ? theme.textInverse : theme.text }]}>Colors</Text></TouchableOpacity>
                </View>
                {pickerTab === 'Icons' ? (
                  <FlatList
                    data={ICONS}
                    numColumns={5}
                    keyExtractor={item => item}
                    style={{ marginVertical: 8, alignSelf: 'center' }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={[styles.iconGridBtn, selectedIcon === item && styles.iconGridBtnActive]} onPress={() => setSelectedIcon(item)}>
                        {React.isValidElement(ICON_MAP[item])
                          ? (selectedIcon === item
                              ? React.cloneElement(ICON_MAP[item] as any, { color: '#2979FF' })
                              : ICON_MAP[item])
                          : ICON_MAP[item]}
                      </TouchableOpacity>
                    )}
                  />
                ) : (
                  <FlatList
                    data={COLORS}
                    numColumns={5}
                    keyExtractor={item => item}
                    style={{ marginVertical: 8, alignSelf: 'center' }}
                    renderItem={({ item }) => (
                      <TouchableOpacity style={[styles.colorGridBtn, { backgroundColor: item, borderWidth: selectedColor === item ? 3 : 0, borderColor: selectedColor === item ? '#2979FF' : 'transparent' }]} onPress={() => setSelectedColor(item)} />
                    )}
                  />
                )}
                <View style={styles.modalFooterRow}>
                  <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setModalVisible(false)}><Text style={[styles.secondaryBtnText, { color: theme.text }]}>Cancel</Text></TouchableOpacity>
                  <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={handleAddOrEdit}><Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>Confirm</Text></TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>

          {/* Add Category Modal */}
          <Modal visible={addModalVisible} animationType="slide" transparent>
            <View style={styles.modalOverlay}>
              <View style={[styles.addModalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                <View style={styles.modalHeader}>
                  <Text style={[styles.modalTitle, { color: theme.text }]}>Create New Category</Text>
                  <TouchableOpacity onPress={() => setAddModalVisible(false)}>
                    <Ionicons name="close" size={24} color={theme.textSecondary} />
                  </TouchableOpacity>
                </View>
                {/* Step 1: Name */}
                <View style={styles.addStepRow}>
                  <View style={[styles.addStepCircle, { backgroundColor: addName.trim() ? theme.primary : theme.surface }]}>
                    <Text style={[addName.trim() ? styles.addStepCircleDone : styles.addStepCircleText, { color: addName.trim() ? theme.textInverse : theme.textSecondary }]}>
                      {addName.trim() ? '1' : '1'}
                    </Text>
                  </View>
                  <Text style={[styles.addStepLabel, { color: theme.text }]}>Category Name</Text>
                </View>
                <TextInput
                  style={[styles.addInput, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder, color: theme.text }]}
                  placeholder="e.g., Coffee & Snacks"
                  value={addName}
                  onChangeText={setAddName}
                  onFocus={() => setAddStep(1)}
                  placeholderTextColor={theme.textTertiary}
                />
                {/* Step 2: Icon & Color */}
                <View style={styles.addStepRow}>
                  <View style={[styles.addStepCircle, { backgroundColor: addIcon && addColor ? theme.primary : theme.surface }]}>
                    <Text style={[addIcon && addColor ? styles.addStepCircleDone : styles.addStepCircleText, { color: addIcon && addColor ? theme.textInverse : theme.textSecondary }]}>
                      {addIcon && addColor ? '2' : '2'}
                    </Text>
                  </View>
                  <Text style={[styles.addStepLabel, { color: theme.text }]}>Choose Icon & Color</Text>
                </View>
                <TouchableOpacity
                  style={[styles.addIconPicker, { backgroundColor: theme.inputBackground, borderColor: theme.inputBorder }]}
                  onPress={() => { setIconPickerVisible(true); setAddStep(2); }}
                  activeOpacity={0.8}
                >
                  <View style={[styles.iconPreview, { backgroundColor: addColor, width: 48, height: 48, marginRight: 12 }]}>
                    {React.isValidElement(ICON_MAP[addIcon])
                      ? React.cloneElement(ICON_MAP[addIcon] as any, { color: getIconColor(addColor) })
                      : ICON_MAP[addIcon]}
                  </View>
                  <View style={{ flex: 1 }}>
                    <Text style={[styles.addIconPickerLabel, { color: theme.text }]}>{addIcon && addColor ? 'Icon & Color Selected' : 'Select Icon & Color'}</Text>
                    <Text style={[styles.addIconPickerSub, { color: theme.textSecondary }]}>Tap to choose from 36+ icons and colors</Text>
                  </View>
                </TouchableOpacity>
                {/* Preview */}
                {canCreate && (
                  <View style={[styles.addPreviewCard, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                    <Text style={[styles.addPreviewLabel, { color: theme.text }]}>Preview</Text>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                      <View style={[styles.iconPreview, { backgroundColor: addColor, width: 36, height: 36 }]}>
                        {React.isValidElement(ICON_MAP[addIcon])
                          ? React.cloneElement(ICON_MAP[addIcon] as any, { color: getIconColor(addColor) })
                          : ICON_MAP[addIcon]}
                      </View>
                      <View style={{ marginLeft: 10 }}>
                        <Text style={[styles.catLabel, { color: theme.text }]}>{addName}</Text>
                        <Text style={[styles.catSpent, { color: theme.textSecondary }]}>Spent: ₹0</Text>
                      </View>
                    </View>
                  </View>
                )}
                <View style={styles.addModalFooterRow}>
                  <TouchableOpacity style={[styles.addModalBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setAddModalVisible(false)}>
                    <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Cancel</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.addModalBtn, { backgroundColor: canCreate ? theme.primary : theme.touchable }]}
                    disabled={!canCreate}
                    onPress={async () => {
                      if (!user?.uid) return;
                      
                      try {
                        const newCategoryId = await categoriesService.addCategory({
                          userId: user.uid,
                          name: addName,
                          icon: addIcon,
                          color: addColor,
                          type: 'expense'
                        });
                        
                        const newCategory: Category = {
                          id: newCategoryId,
                          userId: user.uid,
                          name: addName,
                          icon: addIcon,
                          color: addColor,
                          type: 'expense'
                        };
                        
                        setCategories([...categories, newCategory]);
                        setAddModalVisible(false);
                        setAddName('');
                        setAddIcon(ICONS[0]);
                        setAddColor(COLORS[0]);
                      } catch (error) {
                        console.error('Error adding category:', error);
                        Alert.alert('Error', 'Failed to add category');
                      }
                    }}
                  >
                    <Text style={[styles.primaryBtnText, { color: canCreate ? theme.textInverse : theme.textSecondary }]}>Create Category</Text>
                  </TouchableOpacity>
                </View>
                {/* Icon & Color Picker Modal (nested) */}
                <Modal visible={iconPickerVisible} animationType="slide" transparent>
                  <View style={styles.modalOverlay}>
                    <View style={[styles.modalCard, { backgroundColor: theme.card, borderColor: theme.border }]}>
                      <View style={styles.modalHeader}>
                        <Text style={[styles.modalTitle, { color: theme.text }]}>Choose Icon & Color</Text>
                        <TouchableOpacity onPress={() => setIconPickerVisible(false)}>
                          <Ionicons name="close" size={24} color={theme.textSecondary} />
                        </TouchableOpacity>
                      </View>
                      <View style={styles.modalPreviewRow}>
                        <View style={[styles.iconPreview, { backgroundColor: addColor, width: 48, height: 48 }]}>
                          {React.isValidElement(ICON_MAP[addIcon])
                            ? React.cloneElement(ICON_MAP[addIcon] as any, { color: getIconColor(addColor) })
                            : ICON_MAP[addIcon]}
                        </View>
                        <View style={{ marginLeft: 12 }}>
                          <Text style={[styles.modalPreviewLabel, { color: theme.text }]}>Preview</Text>
                          <Text style={[styles.modalPreviewSub, { color: theme.textSecondary }]}>Selected icon and color</Text>
                        </View>
                      </View>
                      <View style={styles.modalTabsRow}>
                        <TouchableOpacity style={[styles.modalTab, addPickerTab === 'Icons' && styles.modalTabActive, { backgroundColor: addPickerTab === 'Icons' ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setAddPickerTab('Icons')}>
                          <Text style={[addPickerTab === 'Icons' ? styles.modalTabTextActive : styles.modalTabText, { color: addPickerTab === 'Icons' ? theme.textInverse : theme.text }]}>Icons</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.modalTab, addPickerTab === 'Colors' && styles.modalTabActive, { backgroundColor: addPickerTab === 'Colors' ? theme.primary : theme.surface, borderColor: theme.border }]} onPress={() => setAddPickerTab('Colors')}>
                          <Text style={[addPickerTab === 'Colors' ? styles.modalTabTextActive : styles.modalTabText, { color: addPickerTab === 'Colors' ? theme.textInverse : theme.text }]}>Colors</Text>
                        </TouchableOpacity>
                      </View>
                      {addPickerTab === 'Icons' ? (
                        <FlatList
                          data={ICONS}
                          numColumns={5}
                          keyExtractor={item => item}
                          style={{ marginVertical: 8, alignSelf: 'center' }}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={[styles.iconGridBtn, addIcon === item && styles.iconGridBtnActive, { backgroundColor: addIcon === item ? theme.primary + '20' : theme.surface }]} onPress={() => setAddIcon(item)}>
                              {React.isValidElement(ICON_MAP[item])
                                ? (addIcon === item
                                    ? React.cloneElement(ICON_MAP[item] as any, { color: theme.primary })
                                    : React.cloneElement(ICON_MAP[item] as any, { color: theme.text }))
                                : ICON_MAP[item]}
                            </TouchableOpacity>
                          )}
                        />
                      ) : (
                        <FlatList
                          data={COLORS}
                          numColumns={5}
                          keyExtractor={item => item}
                          style={{ marginVertical: 8, alignSelf: 'center' }}
                          renderItem={({ item }) => (
                            <TouchableOpacity style={[styles.colorGridBtn, { backgroundColor: item, borderWidth: addColor === item ? 3 : 0, borderColor: addColor === item ? theme.primary : 'transparent' }]} onPress={() => setAddColor(item)} />
                          )}
                        />
                      )}
                      <View style={styles.modalFooterRow}>
                        <TouchableOpacity style={[styles.secondaryBtn, { backgroundColor: theme.surface, borderColor: theme.border }]} onPress={() => setIconPickerVisible(false)}>
                          <Text style={[styles.secondaryBtnText, { color: theme.text }]}>Cancel</Text>
                        </TouchableOpacity>
                        <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: theme.primary }]} onPress={() => setIconPickerVisible(false)}>
                          <Text style={[styles.primaryBtnText, { color: theme.textInverse }]}>Confirm</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                </Modal>
              </View>
            </View>
          </Modal>
        </ScrollView>
      </SafeAreaView>
    </KeyboardAwareScrollView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8F9FB' },
  scrollContent: {
    backgroundColor: '#F8F9FB',
    padding: 20,
    marginBottom: 128,
  },
  sectionTitle: { fontSize: 16, fontWeight: 'bold', color: '#222', marginBottom: 10, marginTop: 8 },
  card: { backgroundColor: '#fff', borderRadius: 16, padding: 16, marginBottom: 18, shadowColor: '#000', shadowOpacity: 0.04, shadowRadius: 4, shadowOffset: { width: 0, height: 1 }, elevation: 1 },
  input: { flex: 1, backgroundColor: '#F5F5F5', borderRadius: 8, paddingHorizontal: 12, height: 40, marginRight: 8, fontSize: 15 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 10, paddingVertical: 7, marginLeft: 4 },
  addBtnText: { fontWeight: 'bold', color: '#222', fontSize: 14, marginLeft: 4 },
  label: { fontSize: 13, color: '#888', marginBottom: 6 },
  iconPicker: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#F5F5F5', borderRadius: 12, padding: 10, marginBottom: 8 },
  iconPreview: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  iconPickerLabel: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  iconPickerSub: { color: '#888', fontSize: 12 },
  primaryBtn: { backgroundColor: '#222', borderRadius: 8, paddingHorizontal: 18, paddingVertical: 10, marginRight: 8 },
  primaryBtnText: { color: '#fff', fontWeight: 'bold', fontSize: 15 },
  secondaryBtn: { backgroundColor: '#fff', borderRadius: 8, borderWidth: 1, borderColor: '#E0E0E0', paddingHorizontal: 18, paddingVertical: 10 },
  secondaryBtnText: { color: '#222', fontWeight: 'bold', fontSize: 15 },
  cardSub: { color: '#888', fontSize: 13, marginBottom: 8 },
  catRow: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 0.5, borderColor: '#F0F0F0' },
  catIcon: { width: 36, height: 36, borderRadius: 18, alignItems: 'center', justifyContent: 'center', marginRight: 12 },
  catLabel: { fontWeight: 'bold', color: '#222', fontSize: 15, marginRight: 6 },
  catDefault: { backgroundColor: '#F5F5F5', color: '#888', fontSize: 11, borderRadius: 6, paddingHorizontal: 7, paddingVertical: 2, marginLeft: 2 },
  catSpent: { color: '#888', fontSize: 12 },
  catEdit: { marginLeft: 8, padding: 4 },
  catDelete: { marginLeft: 2, padding: 4 },
  tipsCard: { backgroundColor: '#F3F7FF', borderRadius: 14, padding: 14, marginBottom: 24, borderWidth: 1, borderColor: '#E3EFFF' },
  tipsTitle: { fontWeight: 'bold', color: '#222', fontSize: 15, marginBottom: 6 },
  tipRow: { flexDirection: 'row', alignItems: 'flex-start', marginBottom: 2 },
  tipDot: { color: '#2979FF', fontSize: 18, marginRight: 6, marginTop: -2 },
  tipText: { color: '#222', fontSize: 13, flex: 1 },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.18)', justifyContent: 'center', alignItems: 'center' },
  modalCard: { backgroundColor: '#fff', borderRadius: 18, width: '92%', maxWidth: 400, padding: 18, shadowColor: '#000', shadowOpacity: 0.10, shadowRadius: 12, shadowOffset: { width: 0, height: 4 }, elevation: 8 },
  modalHeader: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 },
  modalTitle: { fontWeight: 'bold', fontSize: 17, color: '#222' },
  modalPreviewRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 10 },
  modalPreviewLabel: { fontWeight: 'bold', color: '#222', fontSize: 15 },
  modalPreviewSub: { color: '#888', fontSize: 12 },
  modalTabsRow: { flexDirection: 'row', marginBottom: 8, borderBottomWidth: 1, borderColor: '#F0F0F0' },
  modalTab: { flex: 1, alignItems: 'center', paddingVertical: 8 },
  modalTabActive: { borderBottomWidth: 2, borderColor: '#2979FF' },
  modalTabText: { color: '#888', fontWeight: 'bold', fontSize: 15 },
  modalTabTextActive: { color: '#2979FF', fontWeight: 'bold', fontSize: 15 },
  iconGridBtn: { width: 48, height: 48, borderRadius: 12, backgroundColor: '#F5F5F5', alignItems: 'center', justifyContent: 'center', margin: 4 },
  iconGridBtnActive: { backgroundColor: '#E3F2FD', borderWidth: 2, borderColor: '#2979FF' },
  colorGridBtn: { width: 36, height: 36, borderRadius: 18, margin: 6 },
  modalFooterRow: { flexDirection: 'row', justifyContent: 'flex-end', marginTop: 10, gap: 12 },
  headerWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 10,
    backgroundColor: '#F8F9FB',
  },
  headerBack: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F2F4F7',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 14,
  },
  headerTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#222',
  },
  headerSubtitle: {
    fontSize: 13,
    color: '#888',
    marginTop: 2,
  },
  createCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 20,
    marginBottom: 18,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 1 },
    elevation: 1,
  },
  createIconWrap: {
    width: 60,
    height: 60,
    borderRadius: 8,
    backgroundColor: '#F8F9FB',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  createTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#222',
    marginBottom: 4,
  },
  createSub: {
    color: '#888',
    fontSize: 14,
    marginBottom: 15,
    textAlign: 'center',
  },
  createBtn: {
    backgroundColor: 'black',
    borderRadius: 8,
    paddingHorizontal: 25,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  createBtnText: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  addModalCard: {
    backgroundColor: '#fff',
    borderRadius: 18,
    width: '92%',
    maxWidth: 400,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.10,
    shadowRadius: 12,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
  },
  addStepRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  addStepNum: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#2979FF',
    marginRight: 8,
  },
  addStepLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  addInput: {
    backgroundColor: '#F5F5F5',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 10,
    fontSize: 15,
    marginBottom: 15,
  },
  addIconPicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F5F5F5',
    borderRadius: 12,
    padding: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E0E0E0',
  },
  addIconPickerLabel: {
    fontSize: 15,
    color: '#222',
    fontWeight: 'bold',
  },
  addIconPickerSub: {
    fontSize: 12,
    color: '#888',
    marginTop: 2,
  },
  addPreviewCard: {
    backgroundColor: '#F3F7FF',
    borderRadius: 12,
    padding: 12,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: '#E3EFFF',
  },
  addPreviewLabel: {
    fontSize: 14,
    color: '#222',
    fontWeight: 'bold',
    marginBottom: 6,
  },
  addStepCircle: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
  },
  addStepCircleText: {
    color: '#888',
    fontWeight: 'bold',
    fontSize: 15,
  },
  addStepCircleDone: {
    color: '#43A047',
    fontWeight: 'bold',
    fontSize: 15,
  },
  paletteIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#F5F5F5',
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
  },
  addModalFooterRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 10,
    gap: 12,
  },
  addModalBtn: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingVertical: 12,
    alignItems: 'center',
    marginHorizontal: 4,
  },
  catName: {
    fontWeight: 'bold',
    color: '#222',
    fontSize: 15,
    marginBottom: 2,
  },
  catSub: {
    color: '#888',
    fontSize: 12,
  },
  catActions: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 10,
  },
  catAction: {
    marginLeft: 10,
    padding: 4,
  },
}); 