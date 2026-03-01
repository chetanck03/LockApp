import React, { useState } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Alert,
  ScrollView,
  TextInput,
} from 'react-native';
import { useDeviceStore } from '../store/deviceStore';

export default function DeviceDetailScreen({ route, navigation }) {
  const { device } = route.params;
  const [screenTimeMinutes, setScreenTimeMinutes] = useState('');
  const {
    lockDevice,
    unlockDevice,
    enableKioskMode,
    disableKioskMode,
    setScreenTime,
  } = useDeviceStore();

  const handleLockDevice = async () => {
    try {
      await lockDevice(device.id);
      Alert.alert('Success', 'Device locked');
    } catch (error) {
      Alert.alert('Error', 'Failed to lock device');
    }
  };

  const handleUnlockDevice = async () => {
    try {
      await unlockDevice(device.id);
      Alert.alert('Success', 'Device unlocked');
    } catch (error) {
      Alert.alert('Error', 'Failed to unlock device');
    }
  };

  const handleEnableKiosk = async () => {
    Alert.prompt(
      'Enable Kiosk Mode',
      'Enter package name to lock to:',
      async (packageName) => {
        if (packageName) {
          try {
            await enableKioskMode(device.id, packageName);
            Alert.alert('Success', 'Kiosk mode enabled');
          } catch (error) {
            Alert.alert('Error', 'Failed to enable kiosk mode');
          }
        }
      }
    );
  };

  const handleDisableKiosk = async () => {
    try {
      await disableKioskMode(device.id);
      Alert.alert('Success', 'Kiosk mode disabled');
    } catch (error) {
      Alert.alert('Error', 'Failed to disable kiosk mode');
    }
  };

  const handleSetScreenTime = async () => {
    const minutes = parseInt(screenTimeMinutes, 10);
    if (isNaN(minutes) || minutes <= 0) {
      Alert.alert('Error', 'Please enter valid minutes');
      return;
    }

    try {
      await setScreenTime(device.id, minutes);
      Alert.alert('Success', `Screen time set to ${minutes} minutes`);
      setScreenTimeMinutes('');
    } catch (error) {
      Alert.alert('Error', 'Failed to set screen time');
    }
  };

  return (
    <ScrollView style={styles.container}>
      <View style={styles.card}>
        <Text style={styles.deviceName}>{device.device_name}</Text>
        <Text style={styles.status}>
          Status: {device.is_online ? 'Online' : 'Offline'}
        </Text>
        <Text style={styles.info}>Android: {device.android_version || 'N/A'}</Text>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Device Control</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleLockDevice}>
          <Text style={styles.buttonText}>Lock Device</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleUnlockDevice}
        >
          <Text style={styles.buttonText}>Unlock Device</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Kiosk Mode</Text>
        
        <TouchableOpacity style={styles.button} onPress={handleEnableKiosk}>
          <Text style={styles.buttonText}>Enable Kiosk Mode</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.secondaryButton]}
          onPress={handleDisableKiosk}
        >
          <Text style={styles.buttonText}>Disable Kiosk Mode</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Screen Time</Text>
        
        <TextInput
          style={styles.input}
          placeholder="Minutes"
          value={screenTimeMinutes}
          onChangeText={setScreenTimeMinutes}
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.button} onPress={handleSetScreenTime}>
          <Text style={styles.buttonText}>Set Screen Time</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <TouchableOpacity
          style={[styles.button, styles.appsButton]}
          onPress={() => navigation.navigate('AppsList', { device })}
        >
          <Text style={styles.buttonText}>Manage Apps</Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  card: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    borderRadius: 10,
  },
  deviceName: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  status: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
  },
  info: {
    fontSize: 14,
    color: '#999',
  },
  section: {
    backgroundColor: '#fff',
    padding: 20,
    margin: 15,
    marginTop: 0,
    borderRadius: 10,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 15,
  },
  button: {
    backgroundColor: '#007AFF',
    padding: 15,
    borderRadius: 8,
    alignItems: 'center',
    marginBottom: 10,
  },
  secondaryButton: {
    backgroundColor: '#34C759',
  },
  appsButton: {
    backgroundColor: '#FF9500',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  input: {
    backgroundColor: '#f5f5f5',
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    fontSize: 16,
  },
});
