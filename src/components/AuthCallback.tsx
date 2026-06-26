'use client';
import React, { useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { useSignIn, useSignUp, useClerk } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { getRefCode } from '@/hooks/useRefTracking';

const AuthCallback = () => {
  const router = useRouter();
  const clerk = useClerk();
  const { signIn } = useSignIn();
  const { signUp } = useSignUp();
  const hasRun = useRef(false);

  const syncBackend = async (session: { getToken?: () => Promise<string | null> }) => {
    const token = await session?.getToken?.().catch(() => null) ?? null;
    if (token) {
      try {
        await api.post('/auth/session', { session_id: token, ref_code: getRefCode() });
      } catch {
        // non-fatal
      }
    }
  };

  useEffect(() => {
    const timeout = setTimeout(() => {
      if (!hasRun.current) {
        hasRun.current = true;
        router.replace('/login');
      }
    }, 10000);

    (async () => {
      if (!clerk.loaded || hasRun.current) return;
      hasRun.current = true;
      clearTimeout(timeout);

      const navigateTo = async (opts: {
        session?: { getToken?: () => Promise<string | null> };
        decorateUrl: (path: string) => string;
      }) => {
        await syncBackend(opts.session ?? {});
        const url = opts.decorateUrl('/dashboard');
        if (url.startsWith('http')) {
          window.location.href = url;
        } else {
          router.push(url);
        }
      };

      const goHome = () => router.replace('/dashboard');
      const goLogin = () => router.replace('/login');

      const siComplete = () => (signIn.status as string) === 'complete';
      const suComplete = () => (signUp.status as string) === 'complete';

      if (siComplete()) {
        const { error } = await signIn.finalize({ navigate: navigateTo });
        if (error) goLogin();
        return;
      }

      if (signUp.isTransferable) {
        await signIn.create({ transfer: true });
        if (siComplete()) {
          const { error } = await signIn.finalize({ navigate: navigateTo });
          if (error) goLogin();
          return;
        }
        goLogin();
        return;
      }

      if (signIn.isTransferable) {
        const { error } = await signUp.create({ transfer: true });
        if (!error && suComplete()) {
          const { error: fe } = await signUp.finalize({ navigate: navigateTo });
          if (fe) goLogin();
          return;
        }
        goLogin();
        return;
      }

      if (suComplete()) {
        const { error } = await signUp.finalize({ navigate: navigateTo });
        if (error) goLogin();
        return;
      }

      if (signIn.existingSession || signUp.existingSession) {
        const sessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
        if (sessionId) {
          await clerk.setActive({
            session: sessionId,
            navigate: navigateTo,
          });
          return;
        }
      }

      if (
        signIn.status === 'needs_second_factor' ||
        signIn.status === 'needs_new_password'
      ) {
        goLogin();
        return;
      }

      goHome();
    })();

    return () => clearTimeout(timeout);
  }, [clerk.loaded, signIn.status, signUp.status, signIn.isTransferable, signUp.isTransferable]);

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
