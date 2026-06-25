'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { api, ApiError } from '@/lib/api';
import { getRefCode } from '@/hooks/useRefTracking';

const AuthCallback = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const hasProcessed = useRef(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const ac = new AbortController();
    const timeout = setTimeout(() => ac.abort(), 15000);

    const syncSession = async (params: Record<string, unknown>) => {
      const res = await api.post<{ success?: boolean }>(
        '/auth/session',
        { ...params, ref_code: getRefCode() },
        { signal: ac.signal },
      );
      if (ac.signal.aborted) return false;
      return res.ok;
    };

    const processSession = async () => {
      // Try URL hash first (legacy Clerk format)
      const hash = window.location.hash;
      const hashMatch = hash.match(/session_id=([^&]+)/);
      if (hashMatch) {
        const ok = await syncSession({ session_id: hashMatch[1] });
        if (ac.signal.aborted) return;
        if (ok) { router.replace('/dashboard'); return; }
        setError('Unable to complete sign-in. Please try again.');
        return;
      }

      // Try URL search params (Core 3 format)
      const search = window.location.search;
      const searchMatch = search.match(/[?&]session_id=([^&]+)/);
      if (searchMatch) {
        const ok = await syncSession({ session_id: searchMatch[1] });
        if (ac.signal.aborted) return;
        if (ok) { router.replace('/dashboard'); return; }
        setError('Unable to complete sign-in. Please try again.');
        return;
      }

      // If Clerk already processed the callback, user will be available
      if (isLoaded && user) {
        const ok = await syncSession({ clerk_user_id: user.id });
        if (ac.signal.aborted) return;
        if (ok) { router.replace('/dashboard'); return; }
        setError('Unable to complete sign-in. Please try again.');
        return;
      }

      // Wait for Clerk to process callback if it hasn't yet
      // then check the live clerk.user from the global instance
      const start = Date.now();
      while (Date.now() - start < 5000) {
        await new Promise(r => setTimeout(r, 500));
        if (ac.signal.aborted) return;
        const liveUser = clerk.user;
        if (liveUser) {
          const ok = await syncSession({ clerk_user_id: liveUser.id });
          if (ac.signal.aborted) return;
          if (ok) { router.replace('/dashboard'); return; }
        }
        // Also re-check hash in case it was set after our initial check
        const curHash = window.location.hash;
        const curMatch = curHash.match(/session_id=([^&]+)/);
        if (curMatch) {
          const ok = await syncSession({ session_id: curMatch[1] });
          if (ac.signal.aborted) return;
          if (ok) { router.replace('/dashboard'); return; }
        }
      }
      router.replace('/');
    };

    processSession();
    return () => {
      clearTimeout(timeout);
      ac.abort();
    };
  }, [router, user, isLoaded, clerk]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg, #0d1117)' }}>
        <div className="text-center max-w-sm px-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ef444415' }}>
            <svg className="w-6 h-6" style={{ color: '#ef4444' }} fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <p className="text-sm mb-4" style={{ color: '#ef4444' }}>{error}</p>
          <button
            onClick={() => router.replace('/login')}
            className="px-6 py-2 rounded-xl text-sm font-medium transition-all duration-200"
            style={{ backgroundColor: 'var(--theme-green, #22c55e)', color: '#fff' }}
          >
            Back to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg, #0d1117)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--theme-green, #22c55e)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--theme-text-secondary, #8b949e)' }}>Signing you in...</p>
      </div>
    </div>
  );
};

export default AuthCallback;
