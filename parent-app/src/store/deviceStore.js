import { create } from 'zustand';
import { authService } from '../services/auth';

export const useDeviceStore = create((set, get) => ({
  devices: [],
  selectedDevice: null,
  isLoading: false,
  error: null,

  fetchDevices: async () => {
    set({ isLoading: true, error: null });
    try {
      const devices = await authService.getDevices();
      set({ devices, isLoading: false });
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to fetch devices', isLoading: false });
    }
  },

  selectDevice: (device) => {
    set({ selectedDevice: device });
  },

  sendCommand: async (deviceId, commandType, payload) => {
    set({ isLoading: true, error: null });
    try {
      const result = await authService.sendCommand(deviceId, commandType, payload);
      set({ isLoading: false });
      return result;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Failed to send command', isLoading: false });
      throw error;
    }
  },

  lockDevice: async (deviceId) => {
    return get().sendCommand(deviceId, 'LOCK_DEVICE', {});
  },

  unlockDevice: async (deviceId) => {
    return get().sendCommand(deviceId, 'UNLOCK_DEVICE', {});
  },

  blockApp: async (deviceId, packageName) => {
    return get().sendCommand(deviceId, 'BLOCK_APP', { packageName });
  },

  unblockApp: async (deviceId, packageName) => {
    return get().sendCommand(deviceId, 'UNBLOCK_APP', { packageName });
  },

  enableKioskMode: async (deviceId, packageName) => {
    return get().sendCommand(deviceId, 'ENABLE_KIOSK', { packageName });
  },

  disableKioskMode: async (deviceId) => {
    return get().sendCommand(deviceId, 'DISABLE_KIOSK', {});
  },

  setScreenTime: async (deviceId, minutes) => {
    return get().sendCommand(deviceId, 'SET_SCREEN_TIME', { minutes });
  },
}));
