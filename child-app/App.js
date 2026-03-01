import React, { useEffect } from 'react';
import { SafeAreaView, StyleSheet, Text, View } from 'react-native';
import messaging from '@react-native-firebase/messaging';
import { NativeModules } from 'react-native';

const { DeviceAdminModule } = NativeModules;

export default function App() {
  useEffect(() => {
    requestPermissions();
    setupFCM();
  }, []);

  const requestPermissions = async () => {
    const authStatus = await messaging().requestPermission();
    const enabled =
      authStatus === messaging.AuthorizationStatus.AUTHORIZED ||
      authStatus === messaging.AuthorizationStatus.PROVISIONAL;

    if (enabled) {
      console.log('Authorization status:', authStatus);
      const token = await messaging().getToken();
      console.log('FCM Token:', token);
    }
  };

  const setupFCM = () => {
    messaging().onMessage(async (remoteMessage) => {
      console.log('FCM Message received:', remoteMessage);
      if (remoteMessage.data?.type === 'COMMAND') {
        const command = JSON.parse(remoteMessage.data.command);
        handleCommand(command);
      }
    });

    messaging().setBackgroundMessageHandler(async (remoteMessage) => {
      console.log('Background message:', remoteMessage);
    });
  };

  const handleCommand = async (command) => {
    try {
      switch (command.type) {
        case 'LOCK_DEVICE':
          await DeviceAdminModule.lockDevice();
          break;
        case 'BLOCK_APP':
          await DeviceAdminModule.blockApp(command.payload.packageName);
          break;
        case 'UNBLOCK_APP':
          await DeviceAdminModule.unblockApp(command.payload.packageName);
          break;
        case 'ENABLE_KIOSK':
          await DeviceAdminModule.enableKioskMode(command.payload.packageName);
          break;
        case 'DISABLE_KIOSK':
          await DeviceAdminModule.disableKioskMode();
          break;
        case 'GET_INSTALLED_APPS':
          const apps = await DeviceAdminModule.getInstalledApps();
          console.log('Installed apps:', apps);
          break;
        default:
          console.log('Unknown command:', command.type);
      }
    } catch (error) {
      console.error('Command execution error:', error);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Text style={styles.title}>Child Device</Text>
        <Text style={styles.subtitle}>Monitoring Active</Text>
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f5f5f5',
  },
  content: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: 16,
    color: '#666',
  },
});
