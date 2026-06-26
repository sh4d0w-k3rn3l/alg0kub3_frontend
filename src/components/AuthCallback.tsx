'use client';
import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useClerk } from '@clerk/nextjs';
import { useAuth } from '@/context/AuthContext';
import { AlertCircle, Loader2, RefreshCw, ArrowLeft } from 'lucide-react';

const AuthCallback = () => {
  const router = useRouter();
  const clerk = useClerk();
  const { user } = useAuth();
  const [error, setError] = useState('');

  useEffect(() => {
    if (user) { router.replace('/dashboard'); return; }
  }, [user, router]);

  useEffect(() => {
    if (!clerk.loaded || user) return;

    const process = async () => {
      try {
        await clerk.handleRedirectCallback({
          signInFallbackRedirectUrl: '/dashboard',
          signUpFallbackRedirectUrl: '/dashboard',
          transferable: true,
        });
      } catch (err: any) {
        const msg = err?.errors?.[0]?.longMessage
          || err?.errors?.[0]?.message
          || err?.message
          || 'Authentication failed. Please try signing in again.';
        setError(msg);
      }
    };

    process();
  }, [clerk.loaded, clerk, router, user]);

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-sm text-center px-6">
          <div className="w-12 h-12 rounded-full flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: '#ef444415' }}>
            <AlertCircle size={24} style={{ color: '#ef4444' }} />
          </div>
          <h1 className="text-xl font-bold mb-2" style={{ color: '#e6edf3' }}>Sign-in failed</h1>
          <p className="text-sm mb-6" style={{ color: '#8b949e' }}>{error}</p>
          <div className="flex flex-col gap-2.5">
            <button
              onClick={() => { setError(''); window.location.href = '/auth/callback'; }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 hover:scale-[1.01] active:scale-[0.99]"
              style={{ backgroundColor: '#22c55e', color: '#fff', boxShadow: '0 4px 14px #22c55e30' }}
            >
              <RefreshCw size={15} /> Try Again
            </button>
            <button
              onClick={() => router.push('/login')}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 border hover:scale-[1.01] active:scale-[0.99]"
              style={{ borderColor: '#30363d', color: '#8b949e', backgroundColor: 'transparent' }}
            >
              <ArrowLeft size={14} /> Back to Login
            </button>
          </div>
        </div>
        <div id="clerk-captcha" />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
      <div className="text-center">
        <Loader2 size={32} className="animate-spin mx-auto mb-4" style={{ color: '#22c55e' }} />
        <p style={{ color: '#8b949e' }}>Signing you in...</p>
      </div>
      <div id="clerk-captcha" />
    </div>
  );
};

export default AuthCallback;
