import React, { createContext, useContext, useEffect, useState } from 'react';
import { User, onAuthStateChanged } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { notificationService } from '../services/notificationService';

interface AuthContextType {
  user: User | null;
  loading: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
});

export const useAuth = () => useContext(AuthContext);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    console.log('Setting up auth state listener...');
    const unsubscribe = onAuthStateChanged(auth, async (user) => {
      console.log('Auth state changed:', user ? `User: ${user.email}` : 'No user');
      console.log('Current loading state:', loading);
      
      // Add a small delay to ensure AsyncStorage is properly loaded
      setTimeout(() => {
        setUser(user);
        setLoading(false);
        console.log('Auth state updated - user:', user ? 'logged in' : 'not logged in');
      }, 100);
      
      // Initialize notifications for logged-in user
      if (user) {
        try {
          console.log('Initializing notifications for user:', user.uid);
          const success = await notificationService.initializeForUser(user.uid);
          if (success) {
            console.log('Notifications initialized successfully');
            // No welcome notification - only low balance alerts
          } else {
            console.log('Failed to initialize notifications');
          }
        } catch (error) {
          console.error('Error initializing notifications:', error);
        }
      }
    });

    return unsubscribe;
  }, []);

  return (
    <AuthContext.Provider value={{ user, loading }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthProvider; 