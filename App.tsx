import React, { useEffect } from 'react';
import { StatusBar } from 'expo-status-bar';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { AppNavigator } from './src/navigation';
import { useAppStore } from './src/store';
import { authService } from './src/services/authService';
import './src/i18n';

export default function App() {
  const { isAuthenticated, setUser, setAuthenticated } = useAppStore();

  useEffect(() => {
    // Initialize app settings and check for existing authentication
    const initializeAuth = async () => {
      try {
        const token = await authService.getStoredToken();
        const user = await authService.getStoredUser();
        
        if (token && user) {
          // Restore authentication state
          setUser(user);
          setAuthenticated(true);
          console.log('Auth restored from storage');
        } else {
          console.log('No stored auth found');
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      }
    };

    initializeAuth();
    console.log('Tandil App Initialized');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar style="auto" />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
