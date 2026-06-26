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
    if (!clerk.loaded || hasRun.current) return;

    const timeout = setTimeout(() => {
      if (!hasRun.current) {
        hasRun.current = true;
        router.replace('/login');
      }
    }, 30000);

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

    // Read live Clerk client state as fallback for stale React snapshots
    const siStatus = (signIn.status as string) || (clerk.client?.signIn?.status as string) || '';
    const suStatus = (signUp.status as string) || (clerk.client?.signUp?.status as string) || '';
    const siComplete = siStatus === 'complete';
    const suComplete = suStatus === 'complete';

    if (siComplete) {
      hasRun.current = true;
      clearTimeout(timeout);
      signIn.finalize({ navigate: navigateTo }).then(({ error }) => {
        if (error) goLogin();
      });
      return;
    }

    if (signUp.isTransferable) {
      hasRun.current = true;
      clearTimeout(timeout);
      signIn.create({ transfer: true }).then(() => {
        const st = (signIn.status as string) || (clerk.client?.signIn?.status as string) || '';
        if (st === 'complete') {
          signIn.finalize({ navigate: navigateTo }).then(({ error }) => {
            if (error) goLogin();
          });
        } else {
          goLogin();
        }
      });
      return;
    }

    if (signIn.isTransferable) {
      hasRun.current = true;
      clearTimeout(timeout);
      signUp.create({ transfer: true }).then(({ error }) => {
        if (!error) {
          const st = (signUp.status as string) || (clerk.client?.signUp?.status as string) || '';
          if (st === 'complete') {
            signUp.finalize({ navigate: navigateTo }).then(({ error: fe }) => {
              if (fe) goLogin();
            });
          } else {
            goLogin();
          }
        } else {
          goLogin();
        }
      });
      return;
    }

    if (suComplete) {
      hasRun.current = true;
      clearTimeout(timeout);
      signUp.finalize({ navigate: navigateTo }).then(({ error }) => {
        if (error) goLogin();
      });
      return;
    }

    if (signIn.existingSession || signUp.existingSession) {
      hasRun.current = true;
      clearTimeout(timeout);
      const sessionId = signIn.existingSession?.sessionId || signUp.existingSession?.sessionId;
      if (sessionId) {
        clerk.setActive({
          session: sessionId,
          navigate: navigateTo,
        });
      }
      return;
    }

    if (siStatus === 'needs_second_factor' || siStatus === 'needs_new_password') {
      hasRun.current = true;
      clearTimeout(timeout);
      goLogin();
      return;
    }

    return () => clearTimeout(timeout);
  }, [clerk.loaded, signIn.status, signUp.status, signIn.isTransferable, signUp.isTransferable, signIn.existingSession, signUp.existingSession, clerk, router]);

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: 'var(--theme-bg, #0d1117)' }}>
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin mx-auto mb-4" style={{ borderColor: 'var(--theme-green, #22c55e)', borderTopColor: 'transparent' }} />
        <p style={{ color: 'var(--theme-text-secondary, #8b949e)' }}>Signing you in...</p>
      </div>
      <div id="clerk-captcha" />
    </div>
  );
};

export default AuthCallback;
