import React from 'react';
import { View, Text, Switch, StyleSheet } from 'react-native';

export default function AppItem({ app, onToggle }) {
  return (
    <View style={styles.container}>
      <View style={styles.info}>
        <Text style={styles.name}>{app.name}</Text>
        <Text style={styles.package}>{app.packageName}</Text>
      </View>
      <Switch
        value={!app.isBlocked}
        onValueChange={onToggle}
        trackColor={{ false: '#FF3B30', true: '#34C759' }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 10,
    marginBottom: 10,
  },
  info: {
    flex: 1,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 5,
  },
  package: {
    fontSize: 12,
    color: '#999',
  },
});
