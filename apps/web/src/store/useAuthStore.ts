import { create } from 'zustand';
import { SafeUser } from '@missionx/shared';
import { api } from '@/lib/api';

interface AuthState {
  user: SafeUser | null;
  token: string | null;
  isLoading: boolean;
  setAuth: (user: SafeUser, token: string) => void;
  logout: () => void;
  fetchUser: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  token: typeof window !== 'undefined' ? localStorage.getItem('missionx_token') : null,
  isLoading: true,

  setAuth: (user: SafeUser, token: string) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('missionx_token', token);
    }
    set({ user, token, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('missionx_token');
    }
    set({ user: null, token: null, isLoading: false });
  },

  fetchUser: async () => {
    const token = typeof window !== 'undefined' ? localStorage.getItem('missionx_token') : null;
    if (!token) {
      set({ user: null, token: null, isLoading: false });
      return;
    }

    try {
      set({ isLoading: true });
      const { user } = await api.auth.getMe();
      set({ user, token, isLoading: false });
    } catch {
      if (typeof window !== 'undefined') {
        localStorage.removeItem('missionx_token');
      }
      set({ user: null, token: null, isLoading: false });
    }
  },
}));
