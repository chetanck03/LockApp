import api from './api';
import { storage } from './storage';

export const authService = {
  async register(email, password) {
    const response = await api.post('/auth/register', { email, password });
    await storage.saveToken(response.data.token);
    await storage.saveUser(response.data.user);
    return response.data;
  },

  async login(email, password) {
    console.log('AuthService: Login request for:', email);
    console.log('AuthService: API URL:', api.defaults.baseURL);
    try {
      const response = await api.post('/auth/login', { email, password });
      console.log('AuthService: Login response:', response.data);
      await storage.saveToken(response.data.token);
      await storage.saveUser(response.data.user);
      return response.data;
    } catch (error) {
      console.error('AuthService: Login failed:', error.message);
      console.error('AuthService: Error details:', error.response?.data);
      throw error;
    }
  },

  async logout() {
    await storage.clear();
  },

  async getDevices() {
    const response = await api.get('/devices');
    return response.data;
  },

  async registerDevice(deviceName, fcmToken, androidVersion) {
    const response = await api.post('/devices/register', {
      device_name: deviceName,
      fcm_token: fcmToken,
      android_version: androidVersion,
    });
    return response.data;
  },

  async getDeviceStatus(deviceId) {
    const response = await api.get(`/devices/${deviceId}/status`);
    return response.data;
  },

  async sendCommand(deviceId, commandType, payload) {
    const response = await api.post(`/devices/${deviceId}/command`, {
      command_type: commandType,
      payload,
    });
    return response.data;
  },

  async getDeviceApps(deviceId) {
    const response = await api.get(`/devices/${deviceId}/apps`);
    return response.data;
  },

  async getDeviceLogs(deviceId) {
    const response = await api.get(`/devices/${deviceId}/logs`);
    return response.data;
  },
};
