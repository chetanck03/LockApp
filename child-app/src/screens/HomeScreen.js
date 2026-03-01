import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  Alert,
} from 'react-native';
import { NativeModules } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { deviceApi } from '../services/api';

const { DeviceAdminModule } = NativeModules;

export default function HomeScreen() {
  const [isDeviceOwner, setIsDeviceOwner] = useState(false);
  const [deviceId, setDeviceId] = useState(null);

  useEffect(() => {
    checkDeviceOwnerStatus();
    initializeDevice();
  }, []);

  const checkDeviceOwnerStatus = async () => {
    try {
      const status = await DeviceAdminModule.isDeviceOwner();
      setIsDeviceOwner(status);
    } catch (error) {
      console.error('Error checking device owner:', error);
    }
  };

  const initializeDevice = async () => {
    try {
      const fcmToken = await messaging().getToken();
      const storedDeviceId = await AsyncStorage.getItem('device_id');
      
      if (!storedDeviceId) {
        const device = await deviceApi.registerDevice(
          'Child Device',
          fcmToken,
          '13'
        );
        setDeviceId(device.id);
      } else {
        setDeviceId(storedDeviceId);
        await deviceApi.updateStatus(storedDeviceId, true, fcmToken);
      }
    } catch (error) {
      console.error('Device initialization error:', error);
    }
  };

  const testLock = async () => {
    try {
      await DeviceAdminModule.lockDevice();
      Alert.alert('Success', 'Device locked');
    } catch (error) {
      Alert.alert('Error', error.message);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Child Device Monitor</Text>
      
      <View style={styles.statusCard}>
        <Text style={styles.statusLabel}>Device Owner Status:</Text>
        <Text style={[styles.statusValue, isDeviceOwner && styles.statusActive]}>
          {isDeviceOwner ? 'Active' : 'Inactive'}
        </Text>
      </View>

      {deviceId && (
        <View style={styles.statusCard}>
          <Text style={styles.statusLabel}>Device ID:</Text>
          <Text style={styles.statusValue}>{deviceId.substring(0, 8)}...</Text>
        </View>
      )}

      {isDeviceOwner && (
        <TouchableOpacity style={styles.testButton} onPress={testLock}>
          <Text style={styles.buttonText}>Test Lock Device</Text>
        </TouchableOpacity>
      )}

      {!isDeviceOwner && (
        <View style={styles.warningCard}>
          <Text style={styles.warningText}>
            Device Owner mode not enabled. Please provision this device.
          </Text>
        </View>
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 30,
    textAlign: 'center',
  },
  statusCard: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    marginBottom: 15,
  },
  statusLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  statusValue: {
    fontSize: 18,
    fontWeight: '600',
    color: '#FF3B30',
  },
  statusActive: {
    color: '#34C759',
  },
  testButton: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 10,
    alignItems: 'center',
    marginTop: 20,
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  warningCard: {
    backgroundColor: '#FFF3CD',
    padding: 20,
    borderRadius: 10,
    marginTop: 20,
  },
  warningText: {
    color: '#856404',
    fontSize: 14,
    textAlign: 'center',
  },
});
