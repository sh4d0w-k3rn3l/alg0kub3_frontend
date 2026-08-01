'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, ArrowRight, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';

const PaymentSuccess: React.FC = () => {
  const { colors } = useTheme();
  const { refreshUser } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const [status, setStatus] = useState<'checking' | 'success' | 'error' | 'timeout' | 'expired'>(() => searchParams?.get('session_id') ? 'checking' : 'error');
  const polled = useRef(false);

  useEffect(() => {
    if (polled.current) return;
    polled.current = true;

    const ac = new AbortController();
    const sessionId = searchParams?.get('session_id');
    if (!sessionId) {
      return;
    }
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    };

    const pollStatus = async (attempts = 0) => {
      if (ac.signal.aborted) return;
      if (attempts >= 5) {
        setStatus('timeout');
        return;
      }
      try {
        const res = await api.get<{ payment_status: string; status: string }>(`/checkout/status/${sessionId}`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        if (res.data.payment_status === 'paid') {
          setStatus('success');
          await refreshUser();
          return;
        }
        if (res.data.status === 'expired') {
          setStatus('expired');
          return;
        }
        schedule(() => pollStatus(attempts + 1), 2000);
      } catch (err) {
        if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return;
        schedule(() => pollStatus(attempts + 1), 2000);
      }
    };

    pollStatus();
    return () => {
      ac.abort();
      timers.forEach(clearTimeout);
    };
  }, [searchParams, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: colors.bg }}>
      <div className="text-center max-w-md">
        {status === 'checking' && (
          <>
            <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: colors.green }} />
            <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>Processing payment...</h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Please wait while we confirm your subscription.</p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={56} className="mx-auto mb-4" style={{ color: colors.green }} />
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Welcome to Pro!</h1>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              You now have unlimited access to all courses and lessons.
            </p>
            <button
              data-testid="go-to-dashboard-btn"
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: colors.green, color: '#fff' }}
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </>
        )}
        {(status === 'error' || status === 'expired' || status === 'timeout') && (
          <>
            <h1 className="text-xl font-bold mb-2" style={{ color: colors.text }}>
              {status === 'timeout' ? 'Payment verification timed out' : 'Something went wrong'}
            </h1>
            <p className="text-sm mb-6" style={{ color: colors.textSecondary }}>
              Please check your email for confirmation or contact support.
            </p>
            <button onClick={() => router.push('/pricing')} className="text-sm underline" style={{ color: colors.green }}>
              Back to pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PaymentSuccess;
