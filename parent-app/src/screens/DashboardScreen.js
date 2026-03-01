import React, { useEffect } from 'react';
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  StyleSheet,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import { useDeviceStore } from '../store/deviceStore';
import { useAuthStore } from '../store/authStore';
import DeviceCard from '../components/DeviceCard';

export default function DashboardScreen({ navigation }) {
  const { devices, isLoading, fetchDevices } = useDeviceStore();
  const { logout } = useAuthStore();

  useEffect(() => {
    fetchDevices();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const renderDevice = ({ item }) => (
    <DeviceCard
      device={item}
      onPress={() => navigation.navigate('DeviceDetail', { device: item })}
    />
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>My Devices</Text>
        <TouchableOpacity onPress={handleLogout}>
          <Text style={styles.logoutText}>Logout</Text>
        </TouchableOpacity>
      </View>

      {isLoading && devices.length === 0 ? (
        <ActivityIndicator size="large" color="#007AFF" style={styles.loader} />
      ) : (
        <FlatList
          data={devices}
          renderItem={renderDevice}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.list}
          refreshControl={
            <RefreshControl refreshing={isLoading} onRefresh={fetchDevices} />
          }
          ListEmptyComponent={
            <Text style={styles.emptyText}>No devices registered yet</Text>
          }
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#fff',
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  logoutText: {
    color: '#FF3B30',
    fontSize: 16,
  },
  list: {
    padding: 15,
  },
  loader: {
    marginTop: 50,
  },
  emptyText: {
    textAlign: 'center',
    marginTop: 50,
    fontSize: 16,
    color: '#999',
  },
});
