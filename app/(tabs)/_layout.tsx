import { View } from 'react-native';
import { Tabs, Redirect } from "expo-router";
import { Ionicons, MaterialIcons, FontAwesome5 } from "@expo/vector-icons";
import { Platform } from "react-native";
import NotificationScreen from '../components/notifications';
import { useTheme } from '../context/ThemeContext';
import { SafeAreaView } from "react-native-safe-area-context";
import { useAuth } from '../context/AuthContext';

export default function RootLayout() 
{
  const { theme } = useTheme();
  const { user, loading } = useAuth();
  
  // Show loading screen while checking authentication
  if (loading) {
    return null;
  }

  // Redirect to login if not authenticated
  if (!user) {
    return <Redirect href="/auth/login" />;
  }
  
  const Container = SafeAreaView;
  const containerProps = { edges: ['bottom' as const] };
  
  return (
    <Container style={{ flex: 1, backgroundColor: theme.tabBarBackground }} {...containerProps}>
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
            height: 60,
            borderTopWidth: 1,
            borderColor: theme.tabBarBorder,
            paddingBottom: 8,
            paddingTop: 8,
            // Remove all shadows
            shadowColor: 'transparent',
            shadowOffset: { width: 0, height: 0 },
            shadowOpacity: 0,
            shadowRadius: 0,
            elevation: 0,
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
    </Container>
  );
}