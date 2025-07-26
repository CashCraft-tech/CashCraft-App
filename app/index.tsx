import { Redirect } from "expo-router";
import { useAuth } from "./context/AuthContext";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { user, loading } = useAuth();

  console.log('Index page - user:', user ? user.email : 'null', 'loading:', loading);

  if (loading) {
    console.log('Showing loading screen');
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <ActivityIndicator size="large" color="#4caf50" />
      </View>
    );
  }

  if (user) {
    console.log('User is logged in, redirecting to home');
    return <Redirect href="/(tabs)/home" />;
  } else {
    console.log('No user, redirecting to login');
    return <Redirect href="/auth/login" />;
  }
}
