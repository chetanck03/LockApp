import { create } from 'zustand';
import { authService } from '../services/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    console.log('AuthStore: Starting login');
    set({ isLoading: true, error: null });
    try {
      console.log('AuthStore: Calling authService.login');
      const data = await authService.login(email, password);
      console.log('AuthStore: Login response:', data);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      console.error('AuthStore: Login error:', error);
      console.error('AuthStore: Error response:', error.response?.data);
      const errorMsg = error.response?.data?.error || error.message || 'Login failed';
      set({ error: errorMsg, isLoading: false });
      throw error;
    }
  },

  register: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.register(email, password);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Registration failed', isLoading: false });
      throw error;
    }
  },

  logout: async () => {
    await authService.logout();
    set({ user: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));
