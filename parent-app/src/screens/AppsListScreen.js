import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  ActivityIndicator,
  Alert,
} from 'react-native';
import { authService } from '../services/auth';
import { useDeviceStore } from '../store/deviceStore';
import AppItem from '../components/AppItem';

export default function AppsListScreen({ route }) {
  const { device } = route.params;
  const [apps, setApps] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const { blockApp, unblockApp } = useDeviceStore();

  useEffect(() => {
    fetchApps();
  }, []);

  const fetchApps = async () => {
    setIsLoading(true);
    try {
      const result = await authService.getDeviceApps(device.id);
      setApps(result.apps || []);
    } catch (error) {
      Alert.alert('Error', 'Failed to fetch apps');
    } finally {
      setIsLoading(false);
    }
  };

  const handleToggleApp = async (app) => {
    try {
      if (app.isBlocked) {
        await unblockApp(device.id, app.packageName);
        Alert.alert('Success', `${app.name} unblocked`);
      } else {
        await blockApp(device.id, app.packageName);
        Alert.alert('Success', `${app.name} blocked`);
      }
      fetchApps();
    } catch (error) {
      Alert.alert('Error', 'Failed to update app status');
    }
  };

  const renderApp = ({ item }) => (
    <AppItem app={item} onToggle={() => handleToggleApp(item)} />
  );

  if (isLoading) {
    return (
      <View style={styles.centered}>
        <ActivityIndicator size="large" color="#007AFF" />
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <FlatList
        data={apps}
        renderItem={renderApp}
        keyExtractor={(item) => item.packageName}
        contentContainerStyle={styles.list}
        ListEmptyComponent={
          <Text style={styles.emptyText}>No apps found</Text>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  centered: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  list: {
    padding: 15,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
