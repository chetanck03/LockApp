import React, { useEffect, useState } from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { storage } from '../services/storage';

import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import DashboardScreen from '../screens/DashboardScreen';
import DeviceDetailScreen from '../screens/DeviceDetailScreen';
import AppsListScreen from '../screens/AppsListScreen';

const Stack = createNativeStackNavigator();

export default function AppNavigator() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    const token = await storage.getToken();
    setIsAuthenticated(!!token);
    setIsLoading(false);
  };

  if (isLoading) {
    return null;
  }

  return (
    <Stack.Navigator>
      {!isAuthenticated ? (
        <>
          <Stack.Screen name="Login" component={LoginScreen} options={{ headerShown: false }} />
          <Stack.Screen name="Register" component={RegisterScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="Dashboard" component={DashboardScreen} />
          <Stack.Screen name="DeviceDetail" component={DeviceDetailScreen} />
          <Stack.Screen name="AppsList" component={AppsListScreen} />
        </>
      )}
    </Stack.Navigator>
  );
}
