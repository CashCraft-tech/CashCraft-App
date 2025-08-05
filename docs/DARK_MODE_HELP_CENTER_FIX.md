# Help Center Dark Mode Fix

## Issue

The Help Center article detail pages were not properly themed for dark mode:
- **Hardcoded Colors**: All colors were hardcoded (white backgrounds, dark text)
- **No Theme Integration**: The page didn't use the app's theme context
- **Poor Dark Mode Experience**: White backgrounds and dark text in dark mode

## Solution

### **Added Theme Integration**

Updated the article detail page to use the app's theme system:

#### **File Modified**: `app/support/article-detail.tsx`

### **Changes Made:**

#### **1. Import Theme Context**
```typescript
import { useTheme } from '../context/ThemeContext';
import { StatusBar } from 'expo-status-bar';
```

#### **2. Use Theme in Component**
```typescript
export default function ArticleDetail() {
  const { theme } = useTheme();
  // ... rest of component
}
```

#### **3. Apply Theme Colors Throughout**

**Container & Background:**
```typescript
<SafeAreaView style={[styles.container, { backgroundColor: theme.background }]}>
  <StatusBar style={theme.statusBarStyle} />
```

**Header:**
```typescript
<View style={[styles.header, { backgroundColor: theme.card, borderBottomColor: theme.border }]}>
  <Ionicons name="arrow-back" size={24} color={theme.text} />
  <Text style={[styles.headerTitle, { color: theme.text }]}>Help Article</Text>
```

**Article Content:**
```typescript
<View style={[styles.articleContainer, { backgroundColor: theme.card }]}>
  <Text style={[styles.articleTitle, { color: theme.text }]}>{articleData.title}</Text>
  <Text style={[styles.contentText, { color: theme.text }]}>{articleData.content}</Text>
```

**Meta Information:**
```typescript
<Ionicons name="calendar-outline" size={16} color={theme.textSecondary} />
<Text style={[styles.metaText, { color: theme.textSecondary }]}>
```

**Tags:**
```typescript
<View style={[styles.tag, { backgroundColor: theme.surface }]}>
  <Text style={[styles.tagText, { color: theme.textSecondary }]}>{tag}</Text>
```

**Action Buttons:**
```typescript
<View style={[styles.actionsContainer, { backgroundColor: theme.card }]}>
  <Text style={[styles.actionsTitle, { color: theme.text }]}>Was this article helpful?</Text>
```

**Contact Section:**
```typescript
<View style={[styles.contactSection, { backgroundColor: theme.card }]}>
  <Text style={[styles.contactTitle, { color: theme.text }]}>Still need help?</Text>
  <Text style={[styles.contactSubtitle, { color: theme.textSecondary }]}>
  <TouchableOpacity style={[styles.contactButton, { backgroundColor: theme.primary }]}>
```

#### **4. Removed Hardcoded Colors**

Removed all hardcoded colors from styles:
- `backgroundColor: '#F8F9FB'` → Dynamic theme background
- `color: '#333'` → `theme.text`
- `color: '#666'` → `theme.textSecondary`
- `backgroundColor: '#fff'` → `theme.card`

## Benefits

### **✅ Proper Dark Mode Support**
- All elements now respect the app's theme
- Consistent with the rest of the app
- Proper contrast in both light and dark modes

### **✅ Better User Experience**
- No more jarring white backgrounds in dark mode
- Readable text in all themes
- Consistent visual hierarchy

### **✅ Maintainable Code**
- Uses centralized theme system
- Easy to update colors globally
- Follows app's design patterns

## Testing

### **Verify Fix**
1. Open the app
2. Navigate to Profile → Help Center
3. Tap on any article to view details
4. Switch between light and dark modes
5. Verify all elements are properly themed

### **Expected Behavior**
- ✅ **Light Mode**: Clean white/light backgrounds with dark text
- ✅ **Dark Mode**: Dark backgrounds with light text
- ✅ **Status Bar**: Matches theme (dark/light content)
- ✅ **All Elements**: Cards, text, icons, buttons properly themed
- ✅ **Consistent**: Matches the rest of the app's appearance

## Theme Colors Used

- `theme.background` - Main background color
- `theme.card` - Card/container backgrounds
- `theme.surface` - Secondary surface backgrounds (tags, buttons)
- `theme.text` - Primary text color
- `theme.textSecondary` - Secondary text color
- `theme.textTertiary` - Tertiary text color (icons)
- `theme.primary` - Primary accent color (buttons)
- `theme.border` - Border colors
- `theme.statusBarStyle` - Status bar content style 