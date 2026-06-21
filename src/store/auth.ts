import { create } from 'zustand';
import type { User } from '@/types';

interface AuthState {
  user: User | null;
  loading: boolean;
  isSubscribed: boolean;
  getToken: (() => Promise<string | null>) | null;
  getAuthHeaders: (() => Promise<Record<string, string>>) | null;
  login: (() => void) | null;
  logout: (() => void) | null;
  loginWithCredentials: ((email: string, password: string) => Promise<User>) | null;
  setUser: (user: User | null) => void;
  setLoading: (loading: boolean) => void;
  setGetToken: (fn: () => Promise<string | null>) => void;
  setGetAuthHeaders: (fn: () => Promise<Record<string, string>>) => void;
  setLogin: (fn: () => void) => void;
  setLogout: (fn: () => void) => void;
  setLoginWithCredentials: (fn: (email: string, password: string) => Promise<User>) => void;
  refreshUser: (() => Promise<User | null>) | null;
  setRefreshUser: (fn: () => Promise<User | null>) => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  user: null,
  loading: true,
  isSubscribed: false,
  getToken: null,
  getAuthHeaders: null,
  login: null,
  logout: null,
  loginWithCredentials: null,
  refreshUser: null,

  setUser: (user) => set({ user, isSubscribed: user?.subscription_status === 'pro' }),
  setLoading: (loading) => set({ loading }),
  setGetToken: (fn) => set({ getToken: fn }),
  setGetAuthHeaders: (fn) => set({ getAuthHeaders: fn }),
  setLogin: (fn) => set({ login: fn }),
  setLogout: (fn) => set({ logout: fn }),
  setLoginWithCredentials: (fn) => set({ loginWithCredentials: fn }),
  setRefreshUser: (fn) => set({ refreshUser: fn }),
}));
