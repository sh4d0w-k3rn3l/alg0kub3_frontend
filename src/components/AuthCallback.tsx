'use client';
import React, { useEffect, useRef } from 'react';

import { useRouter } from 'next/navigation';
import { getRefCode } from '@/hooks/useRefTracking';

const API = `${process.env.NEXT_PUBLIC_BACKEND_URL}/api`;

const AuthCallback = () => {
  const router = useRouter();
  const hasProcessed = useRef(false);

  useEffect(() => {
    if (hasProcessed.current) return;
    hasProcessed.current = true;

    const ac = new AbortController();

    const processSession = async () => {
      const hash = window.location.hash;
      const match = hash.match(/session_id=([^&]+)/);
      if (!match) {
        router.replace('/');
        return;
      }
      const sessionId = match[1];
      const refCode = getRefCode();

      try {
        const res = await fetch(`${API}/auth/session`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          credentials: 'include',
          body: JSON.stringify({ session_id: sessionId, ref_code: refCode }),
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        if (res.ok) {
          router.replace('/dashboard');
        } else {
          router.replace('/login');
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        router.replace('/login');
      }
    };

    processSession();
    return () => ac.abort();
  }, [router]);

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
