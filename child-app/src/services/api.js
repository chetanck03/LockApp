import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';

const API_BASE_URL = 'https://your-backend-url.com';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

export const deviceApi = {
  async registerDevice(deviceName, fcmToken, androidVersion) {
    try {
      const token = await AsyncStorage.getItem('auth_token');
      const response = await api.post(
        '/devices/register',
        {
          device_name: deviceName,
          fcm_token: fcmToken,
          android_version: androidVersion,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      
      await AsyncStorage.setItem('device_id', response.data.id);
      return response.data;
    } catch (error) {
      console.error('Device registration error:', error);
      throw error;
    }
  },

  async updateStatus(deviceId, isOnline, fcmToken) {
    try {
      const response = await api.put(`/devices/${deviceId}/status`, {
        is_online: isOnline,
        fcm_token: fcmToken,
      });
      return response.data;
    } catch (error) {
      console.error('Status update error:', error);
      throw error;
    }
  },

  async reportPolicyStatus(policyId, status, result) {
    try {
      const response = await api.put(`/policies/${policyId}/status`, {
        status,
        result,
      });
      return response.data;
    } catch (error) {
      console.error('Policy status report error:', error);
      throw error;
    }
  },
};

export default api;
