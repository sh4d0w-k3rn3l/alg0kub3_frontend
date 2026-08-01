'use client';

import { createContext, useContext, useCallback, useEffect, useRef, useState, type ReactNode } from 'react';
import { useUser, useAuth as useClerkAuth } from '@clerk/nextjs';
import type { User } from '@/types';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { identify as phIdentify, reset as phReset } from '@/lib/posthog';

interface AuthContextValue {
  user: User | null;
  loading: boolean;
  login: () => void;
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

  const logout = useCallback(async () => {
    await signOut({ redirectUrl: '/' });
  }, [signOut]);

  const refreshUser = useCallback(async () => {
    const token = await getToken();
    if (!token) return null;
    try {
      const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
      if (clerkUser?.primaryEmailAddress?.emailAddress) {
        headers['X-User-Email'] = clerkUser.primaryEmailAddress.emailAddress;
      }
      if (clerkUser?.fullName) {
        headers['X-User-Name'] = clerkUser.fullName;
      }
      const res = await api.get('/auth/me', { headers });
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
        return merged;
      }
      setUser(data);
      return data;
    } catch (err) {
      handleApiError(err, 'Failed to refresh user');
      return null;
    }
  }, [getToken, clerkUser]);

  const getAuthHeaders = useCallback(async (): Promise<Record<string, string>> => {
    const token = await getToken();
    if (!token) return {};
    const headers: Record<string, string> = { Authorization: `Bearer ${token}` };
    if (clerkUser?.primaryEmailAddress?.emailAddress) {
      headers['X-User-Email'] = clerkUser.primaryEmailAddress.emailAddress;
    }
    if (clerkUser?.fullName) {
      headers['X-User-Name'] = clerkUser.fullName;
    }
    return headers;
  }, [getToken, clerkUser]);

  // Sync the derived user state whenever the Clerk identity changes (during render)
  const [prevClerkId, setPrevClerkId] = useState<string | null>(null);
  if ((clerkUser?.id ?? null) !== prevClerkId) {
    setPrevClerkId(clerkUser?.id ?? null);
    if (clerkUser) {
      setUser({
        id: clerkUser.id,
        user_id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress,
        name: clerkUser.fullName || clerkUser.username || undefined,
        picture: clerkUser.imageUrl,
        role: (clerkUser.publicMetadata as Record<string, unknown>)?.role as string || 'user',
        subscription_status: 'free',
        subscription_expires: undefined,
      });
    } else {
      setUser(null);
    }
  }

  // Reset subscription-fetch guard and PostHog identity on sign-out
  useEffect(() => {
    if (!clerkUser) {
      fetched.current = false;
      phReset();
    }
  }, [clerkUser]);

  // Send identity to PostHog whenever the signed-in user changes
  useEffect(() => {
    if (!clerkUser) return;
    const role = (clerkUser.publicMetadata as Record<string, unknown>)?.role as string | undefined;
    phIdentify(clerkUser.id, {
      ...(clerkUser.primaryEmailAddress?.emailAddress && { email: clerkUser.primaryEmailAddress.emailAddress }),
      ...(clerkUser.fullName && { name: clerkUser.fullName }),
      ...(role && { role }),
    });
  }, [clerkUser]);

  // Fetch real subscription from backend after Clerk user is set
  useEffect(() => {
    if (!clerkUser || !getToken || fetched.current) return;
    fetched.current = true;
    refreshUser().catch(() => { fetched.current = false; });
  }, [clerkUser, getToken, refreshUser]);

  return (
    <AuthContext.Provider value={{ user, loading, login, logout, refreshUser, isSubscribed, getToken, getAuthHeaders }}>
      {children}
    </AuthContext.Provider>
  );
}
