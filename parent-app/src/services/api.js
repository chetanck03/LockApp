import axios from 'axios';
import { storage } from './storage';

// Change this based on your environment
// For local development: http://localhost:3000
// For Android emulator: http://10.0.2.2:3000
// For physical device on same network: http://YOUR_COMPUTER_IP:3000
// For production: https://your-backend-url.com
const API_BASE_URL = __DEV__ 
  ? 'http://10.0.2.2:3000'  // Android emulator
  // ? 'http://localhost:3000'  // iOS simulator
  // ? 'http://192.168.31.138:3000'  // Physical device (your Mac IP)
  : 'https://your-backend-url.com';  // Production

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

api.interceptors.request.use(
  async (config) => {
    const token = await storage.getToken();
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    if (error.response?.status === 401) {
      await storage.clear();
    }
    return Promise.reject(error);
  }
);

export default api;
