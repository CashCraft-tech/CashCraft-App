import React from 'react';
import { FontAwesome5, Ionicons, MaterialIcons } from '@expo/vector-icons';

export const getIconComponent = (iconName: string, color: string, size: number = 24) => {
  const iconMap: { [key: string]: React.ReactNode } = {
    // FontAwesome5 icons
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
    'ellipsis-h': <FontAwesome5 name="ellipsis-h" size={size} color={color} />,
    
    // Ionicons & MaterialIcons
    'restaurant': <Ionicons name="restaurant" size={size} color={color} />,
    'car-sport': <Ionicons name="car-sport" size={size} color={color} />,
    'receipt': <Ionicons name="receipt" size={size} color={color} />,
    'movie': <Ionicons name="film" size={size} color={color} />, // Keep Ionicons film for movie
    'cash': <Ionicons name="cash" size={size} color={color} />,
    'laptop': <Ionicons name="laptop" size={size} color={color} />,
    
    // Legacy support for older database items
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
    'ice-cream': <Ionicons name="ice-cream" size={size} color={color} />
  };

  return iconMap[iconName] || <MaterialIcons name="category" size={size} color={color} />;
};

export const ICONS = [
  'cart', 'car', 'home', 'utensils', 'gamepad', 'plane', 'gift', 'heart', 'credit-card', 'shopping-bag', 'bolt', 'dollar-sign', 'music', 'film', 'book', 'medkit', 'paw', 'tshirt', 'mobile-alt', 'glass-cheers',
  'restaurant', 'car-sport', 'receipt', 'movie', 'ellipsis-h', 'cash', 'laptop'
];
