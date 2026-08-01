'use client';

import React, { useEffect, useState, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { CheckCircle, XCircle, Loader2, ArrowRight } from 'lucide-react';
import { api } from '@/lib/api';
import { useAuth } from '@/context/AuthContext';

const PhonePeCallback = () => {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { refreshUser } = useAuth();
  const [status, setStatus] = useState<'processing' | 'success' | 'failed'>('processing');
  const checked = useRef(false);

  useEffect(() => {
    if (checked.current) return;
    checked.current = true;

    const ac = new AbortController();
    const merchantTransactionId = searchParams?.get('merchantTransactionId');
    const timers: ReturnType<typeof setTimeout>[] = [];

    const schedule = (fn: () => void, delay: number) => {
      const id = setTimeout(fn, delay);
      timers.push(id);
      return id;
    };

    const checkStatus = async (attempts = 0) => {
      if (ac.signal.aborted) return;
      if (attempts >= 20 || !merchantTransactionId) {
        setStatus('failed');
        return;
      }
      try {
        const res = await api.get<{ success: boolean; code: string; state: string }>(
          `/checkout/phonepe/status/${merchantTransactionId}`,
          { signal: ac.signal }
        );
        if (ac.signal.aborted) return;
        if (res.data.success) {
          setStatus('success');
          await refreshUser();
          return;
        }
        // If PhonePe reports a terminal failure, bail early
        if (res.data.code === 'PAYMENT_FAILED') {
          setStatus('failed');
          return;
        }
        schedule(() => checkStatus(attempts + 1), 1500);
      } catch {
        schedule(() => checkStatus(attempts + 1), 1500);
      }
    };

    checkStatus();
    return () => {
      ac.abort();
      timers.forEach(clearTimeout);
    };
  }, [searchParams, refreshUser]);

  return (
    <div className="min-h-screen flex items-center justify-center px-4" style={{ backgroundColor: '#0d1117' }}>
      <div className="text-center max-w-md">
        {status === 'processing' && (
          <>
            <Loader2 size={48} className="animate-spin mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h1 className="text-xl font-bold mb-2 text-white">Verifying payment...</h1>
            <p className="text-sm" style={{ color: '#8b949e' }}>
              Please wait while we confirm your PhonePe payment.
            </p>
          </>
        )}
        {status === 'success' && (
          <>
            <CheckCircle size={56} className="mx-auto mb-4" style={{ color: '#22c55e' }} />
            <h1 className="text-2xl font-bold mb-2 text-white">Welcome to Pro!</h1>
            <p className="text-sm mb-6" style={{ color: '#8b949e' }}>
              Your PhonePe payment was successful. You now have unlimited access.
            </p>
            <button
              onClick={() => router.push('/dashboard')}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-lg text-sm font-medium"
              style={{ backgroundColor: '#22c55e', color: '#fff' }}
            >
              Go to Dashboard <ArrowRight size={16} />
            </button>
          </>
        )}
        {status === 'failed' && (
          <>
            <XCircle size={56} className="mx-auto mb-4" style={{ color: '#ef4444' }} />
            <h1 className="text-xl font-bold mb-2 text-white">Payment verification failed</h1>
            <p className="text-sm mb-6" style={{ color: '#8b949e' }}>
              We couldn&apos;t verify your payment. Please check your PhonePe app or contact support.
            </p>
            <button
              onClick={() => router.push('/pricing')}
              className="text-sm underline"
              style={{ color: '#22c55e' }}
            >
              Back to pricing
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default PhonePeCallback;
