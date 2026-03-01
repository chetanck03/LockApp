import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';

export default function DeviceCard({ device, onPress }) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.name}>{device.device_name}</Text>
        <View style={[styles.status, device.is_online && styles.statusOnline]}>
          <Text style={styles.statusText}>
            {device.is_online ? 'Online' : 'Offline'}
          </Text>
        </View>
      </View>
      <Text style={styles.info}>Android {device.android_version || 'N/A'}</Text>
      {device.last_seen && (
        <Text style={styles.lastSeen}>
          Last seen: {new Date(device.last_seen).toLocaleString()}
        </Text>
      )}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 10,
  },
  name: {
    fontSize: 18,
    fontWeight: '600',
  },
  status: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 12,
    backgroundColor: '#FF3B30',
  },
  statusOnline: {
    backgroundColor: '#34C759',
  },
  statusText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  info: {
    fontSize: 14,
    color: '#666',
    marginBottom: 5,
  },
  lastSeen: {
    fontSize: 12,
    color: '#999',
  },
});
