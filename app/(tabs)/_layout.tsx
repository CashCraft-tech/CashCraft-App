import { View } from 'react-native';
import { Tabs } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Platform } from "react-native";
import NotificationScreen from '../components/notifications';
import { useTheme } from '../context/ThemeContext';

export default function RootLayout() 
{
  const { theme } = useTheme();
  
  return (
    <View style={{ flex: 1, backgroundColor: theme.background }}>
      <Tabs
        screenOptions={{
          headerShown: false,
          tabBarShowLabel: false,
          tabBarStyle: {
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: theme.tabBarBackground,
            height: Platform.OS === "ios" ? 80 : 90,
            shadowColor: "#000",
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 8,
            borderTopWidth: 1,
            borderTopColor: theme.tabBarBorder,
            paddingBottom: Platform.OS === "ios" ? 20 : 8,
            paddingTop: 8,
          },
          tabBarItemStyle: {
            flex: 1,
            alignItems: 'center',
            justifyContent: 'center',
            height: '100%',
          },
        }}
      >
        <Tabs.Screen
          name="home"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="home"
                size={28}
                color={focused ? theme.primary : theme.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="dashboard"
          options={{
            tabBarIcon: ({ focused }) => (
              <MaterialIcons
                name="dashboard-customize"
                size={29}
                color={focused ? theme.primary : theme.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="add"
          options={{
            tabBarIcon: ({ focused }) => (
              <View
                style={{
                  backgroundColor: focused ? theme.primary : theme.tabBarInactive,
                  width: 30,
                  height: 30,
                  borderRadius: 4,
                  justifyContent: "center",
                  alignItems: "center",
                }}
              >
                <Ionicons
                  name="add"
                  size={28}
                  color="#fff"
                />
              </View>
            ),
          }}
        />
        <Tabs.Screen
          name="transactions"
          options={{
            tabBarIcon: ({ focused }) => (
              <FontAwesome5
                name="hand-holding-usd"
                size={28}
                color={focused ? theme.primary : theme.tabBarInactive}
              />
            ),
          }}
        />
        <Tabs.Screen
          name="profile"
          options={{
            tabBarIcon: ({ focused }) => (
              <Ionicons
                name="person"
                size={28}
                color={focused ? theme.primary : theme.tabBarInactive}
              />
            ),
          }}
        />
      </Tabs>
    </View>
    
  );
}