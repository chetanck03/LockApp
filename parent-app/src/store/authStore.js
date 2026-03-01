import { create } from 'zustand';
import { authService } from '../services/auth';

export const useAuthStore = create((set) => ({
  user: null,
  isAuthenticated: false,
  isLoading: false,
  error: null,

  login: async (email, password) => {
    set({ isLoading: true, error: null });
    try {
      const data = await authService.login(email, password);
      set({ user: data.user, isAuthenticated: true, isLoading: false });
      return data;
    } catch (error) {
      set({ error: error.response?.data?.error || 'Login failed', isLoading: false });
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
