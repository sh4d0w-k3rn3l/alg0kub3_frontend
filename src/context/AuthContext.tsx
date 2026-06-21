'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import type { User } from '@/types';
import { useAuthStore } from '@/store/auth';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: () => void;
  loginWithCredentials: (email: string, password: string) => Promise<User>;
  logout: () => void;
  refreshUser: () => Promise<User | null>;
  isSubscribed: boolean;
  getToken: () => Promise<string | null>;
  getAuthHeaders: () => Promise<Record<string, string>>;
}

const AuthContext = createContext<AuthContextValue>({} as AuthContextValue);

export const useAuth = () => useContext(AuthContext);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded: userLoaded } = useUser();
  const { isLoaded: authLoaded, getToken, signOut } = useClerkAuth();

  const [user, setUser] = useState<User | null>(null);
  const fetched = useRef(false);

  const loading = !userLoaded || !authLoaded;
  const isSubscribed = user?.subscription_status === 'pro';

  const login = useCallback(() => {
    window.location.href = '/login';
  }, []);

  const loginWithCredentials = useCallback(async (email: string, password: string): Promise<User> => {
    const API = process.env.NEXT_PUBLIC_BACKEND_URL || 'http://localhost:8000';
    const res = await fetch(`${API}/api/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    if (!res.ok) {
      const err = await res.json().catch(() => ({ detail: 'Login failed' }));
      throw new Error(err.detail || 'Login failed');
    }
    return res.json();
  }, []);

  const logout = useCallback(async () => {
    await signOut({ redirectUrl: '/' });
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const res = await api.get('/auth/me', {
        headers: { Authorization: `Bearer ${token}` },
      });
      const data = res.data as User;
      const clerkId = clerkUser?.id;
      if (clerkId) {
        const merged: User = {
          id: clerkId,
          user_id: clerkId,
          email: clerkUser?.primaryEmailAddress?.emailAddress || data.email,
          name: clerkUser?.fullName || clerkUser?.username || data.name,
          picture: clerkUser?.imageUrl || data.picture,
          role: data.role || 'user',
          subscription_status: data.subscription_status || 'free',
          subscription_expires: data.subscription_expires,
        };
        setUser(merged);
        useAuthStore.getState().setUser(merged);
        return merged;
      }
      setUser(data);
      useAuthStore.getState().setUser(data);
      return data;
    } catch (err) {
      handleApiError(err, 'Failed to refresh user');
      return null;
    }
  }, [getToken, clerkUser]);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    return token ? { Authorization: `Bearer ${token}` } : {};
  }, [getToken]);

  // Build initial user from Clerk, then fetch subscription from backend
  useEffect(() => {
    if (!clerkUser) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setUser(null);
      fetched.current = false;
      return;
    }
    const clerkMapped: User = {
      id: clerkUser.id,
      user_id: clerkUser.id,
      email: clerkUser.primaryEmailAddress?.emailAddress,
      name: clerkUser.fullName || clerkUser.username || undefined,
      picture: clerkUser.imageUrl,
      role: (clerkUser.publicMetadata as Record<string, unknown>)?.role as string || 'user',
      subscription_status: 'free',
      subscription_expires: undefined,
    };
    setUser(clerkMapped);
  }, [clerkUser]);

  // Fetch real subscription from backend after Clerk user is set
  useEffect(() => {
    if (!clerkUser || !getToken || fetched.current) return;
    fetched.current = true;
    refreshUser();
  }, [clerkUser, getToken, refreshUser]);

  // Sync user state into Zustand auth store
  useEffect(() => {
    useAuthStore.getState().setUser(user);
    useAuthStore.getState().setLoading(loading);
    useAuthStore.getState().setGetToken(getToken);
    useAuthStore.getState().setLogout(() => signOut({ redirectUrl: '/' }));
    useAuthStore.getState().setLogin(() => { window.location.href = '/login'; });
    useAuthStore.getState().setGetAuthHeaders(async () => {
      const token = await getToken();
      return token ? { Authorization: `Bearer ${token}` } : {} as Record<string, string>;
    });
    useAuthStore.getState().setRefreshUser(refreshUser);
    useAuthStore.getState().setLoginWithCredentials(loginWithCredentials);
  }, [user, loading, getToken, signOut, refreshUser, loginWithCredentials]);

  return (
    <AuthContext.Provider value={{ user, loading, login, loginWithCredentials, logout, refreshUser, isSubscribed, getToken, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}
