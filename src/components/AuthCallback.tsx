'use client';
import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useUser, useClerk } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { getRefCode } from '@/hooks/useRefTracking';

const AuthCallback = () => {
  const router = useRouter();
  const { user, isLoaded } = useUser();
  const clerk = useClerk();
  const [error, setError] = useState('');
  const done = useRef(false);

  useEffect(() => {
    if (done.current || !isLoaded) return;

    const sessionId =
      window.location.hash.match(/session_id=([^&]+)/)?.[1] ??
      window.location.search.match(/[?&]session_id=([^&]+)/)?.[1];

    const ac = new AbortController();
    const timeout = setTimeout(() => {
      if (!done.current) {
        done.current = true;
        router.replace('/login');
      }
    }, 10000);

    const sync = async () => {
      if (done.current) return;

      const sid = sessionId || clerk.session?.id;
      if (!sid) return;

      try {
        const res = await api.post<{ success?: boolean }>(
          '/auth/session',
          { session_id: sid, ref_code: getRefCode() },
          { signal: ac.signal },
        );
        if (ac.signal.aborted || done.current) return;
        if (res.ok) {
          done.current = true;
          clearTimeout(timeout);
          router.replace('/dashboard');
        } else {
          done.current = true;
          clearTimeout(timeout);
          setError('Unable to complete sign-in. Please try again.');
        }
      } catch {
        // will retry on next poll interval
      }
    };

    sync();
    const iv = setInterval(sync, 500);

    return () => {
      clearTimeout(timeout);
      clearInterval(iv);
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
