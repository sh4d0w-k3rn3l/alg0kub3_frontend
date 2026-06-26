'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSignUp, useClerk } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Code, Sun, Moon, LogIn, Mail, Lock, User, KeyRound, ArrowLeft, AlertCircle, Loader2, Github, Twitter } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

type SignUpStep = 'form' | 'verify';

const SignUpPage: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { signUp } = useSignUp();
  const clerk = useClerk();
  const router = useRouter();
  const [step, setStep] = useState<SignUpStep>('form');
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState('');

  const ssoSignUp = (strategy: string) => async () => {
    if (!signUp?.sso || ssoLoading) return;
    setSsoLoading(strategy);
    try {
      const cbUrl = `${window.location.origin}/auth/callback`;
      const { error } = await signUp.sso({
        strategy,
        redirectUrl: cbUrl,
        redirectCallbackUrl: cbUrl,
      });
      setSsoLoading('');
      if (error) {
        setError('Social sign up failed. Please try again.');
      }
    } catch {
      setSsoLoading('');
      setError('Social sign up failed. Please try again.');
    }
  };

  const handleGoogleSignUp = ssoSignUp('oauth_google');
  const handleGithubSignUp = ssoSignUp('oauth_github');
  const handleTwitterSignUp = ssoSignUp('oauth_twitter');

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!name || !email || !password || !confirmPassword) {
      setError('Please fill in all fields');
      return;
    }
    if (password !== confirmPassword) {
      setError('Passwords do not match');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters');
      return;
    }
    setLoading(true);
    try {
      const nameParts = name.trim().split(/\s+/);
      const firstName = nameParts[0];
      const lastName = nameParts.slice(1).join(' ') || undefined;
      const { error } = await signUp.password({
        emailAddress: email,
        password,
        firstName,
        lastName,
      });
      if (error) {
        setError(error.message || 'Sign up failed');
        return;
      }
      const suStatus = signUp.status as string || (clerk.client?.signUp?.status as string) || '';
      if (suStatus === 'complete') {
        await signUp.finalize({
          navigate: async ({ session, decorateUrl }) => {
            const token = await session?.getToken?.().catch(() => null) ?? null;
            if (token) {
              await api.post('/auth/session', { session_id: token, password }).catch(() => {});
            }
            const url = decorateUrl('/dashboard');
            if (url.startsWith('http')) window.location.href = url;
            else router.push(url);
          },
        });
      } else {
        const { error: sendErr } = await signUp.verifications.sendEmailCode();
        if (sendErr) {
          setError(sendErr.message || 'Failed to send verification code');
          return;
        }
        setStep('verify');
      }
    } catch (err: any) {
      const msg = err.errors?.[0]?.message || err.message || 'Sign up failed. Please try again.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!verificationCode) {
      setError('Please enter the verification code');
      return;
    }
    setLoading(true);
    try {
      const { error: verifyErr } = await signUp.verifications.verifyEmailCode({ code: verificationCode });
      if (verifyErr) {
        setError(verifyErr.message || 'Invalid verification code');
        return;
      }
      // Check both React snapshot and live Clerk client (stale closure mitigation)
      const isComplete = signUp.status === 'complete' || (clerk.client?.signUp?.status as string) === 'complete';
      if (isComplete) {
        await signUp.finalize({
          navigate: async ({ session, decorateUrl }) => {
            const token = await session?.getToken?.().catch(() => null) ?? null;
            if (token) {
              await api.post('/auth/session', { session_id: token, password }).catch(() => {});
            }
            const url = decorateUrl('/dashboard');
            if (url.startsWith('http')) window.location.href = url;
            else router.push(url);
          },
        });
      } else {
        setError('Verification succeeded but sign-up not complete. Please try again.');
      }
    } catch (err: any) {
      setError(err.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col relative overflow-hidden" style={{ backgroundColor: colors.bg }}>
      <div
        className="absolute inset-0 pointer-events-none"
        style={{
          background: isDark
            ? `radial-gradient(ellipse 600px 400px at 80% 10%, rgba(34,197,94,0.06) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 20% 90%, rgba(168,85,247,0.05) 0%, transparent 70%)`
            : `radial-gradient(ellipse 600px 400px at 80% 10%, rgba(26,127,55,0.04) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 20% 90%, rgba(126,34,206,0.03) 0%, transparent 70%)`
        }}
      />
      <header className="h-[56px] flex items-center justify-between px-6 border-b relative z-10" style={{ borderColor: colors.borderLight, backgroundColor: colors.headerBg }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-2.5 hover:opacity-80 transition-opacity">
          <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.green, boxShadow: `0 0 12px ${colors.green}40` }}>
            <Code size={16} className="text-white" />
          </div>
          <span className="text-base font-bold tracking-tight" style={{ color: colors.text }}>AlgoKube</span>
        </button>
        <button onClick={toggleTheme} className="p-1.5 rounded-lg transition-all duration-200 hover:scale-110" style={{ color: colors.textSecondary }}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4 py-8 relative z-10">
        <div
          className="w-full max-w-sm animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationFillMode: 'both' }}
        >
          <div className="text-center mb-6">
            <h1 className="text-2xl font-extrabold mb-1.5 tracking-tight" style={{ color: colors.text }}>
              {step === 'form' ? 'Create your account' : 'Check your email'}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {step === 'form' ? 'Start your learning journey' : `Enter the code sent to ${email}`}
            </p>
          </div>

          <div
            className="border rounded-2xl p-6 space-y-4 animate-in fade-in slide-in-from-bottom-5 duration-700 delay-75"
            style={{
              backgroundColor: isDark ? 'rgba(22,27,34,0.8)' : 'rgba(255,255,255,0.9)',
              borderColor: `${colors.green}30`,
              boxShadow: isDark
                ? `0 0 0 1px ${colors.green}15, 0 8px 32px rgba(0,0,0,0.3)`
                : `0 0 0 1px ${colors.green}10, 0 8px 32px rgba(0,0,0,0.06)`,
              backdropFilter: 'blur(12px)',
              WebkitBackdropFilter: 'blur(12px)',
            }}
          >
            {step === 'form' ? (
            <><form onSubmit={handleSubmit} className="space-y-3">
              <div
                className="flex items-center rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  borderColor: colors.border,
                  backgroundColor: isDark ? '#0d1117' : '#fafbfc',
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = colors.green;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.green}20`;
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <User size={15} className="ml-3.5 shrink-0" style={{ color: colors.textMuted }} />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  placeholder="Full name"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
              <div
                className="flex items-center rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  borderColor: colors.border,
                  backgroundColor: isDark ? '#0d1117' : '#fafbfc',
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = colors.green;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.green}20`;
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Mail size={15} className="ml-3.5 shrink-0" style={{ color: colors.textMuted }} />
                <input
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
              <div
                className="flex items-center rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  borderColor: colors.border,
                  backgroundColor: isDark ? '#0d1117' : '#fafbfc',
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = colors.green;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.green}20`;
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Lock size={15} className="ml-3.5 shrink-0" style={{ color: colors.textMuted }} />
                <input
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  placeholder="Password"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
              <div
                className="flex items-center rounded-xl border overflow-hidden transition-all duration-200"
                style={{
                  borderColor: colors.border,
                  backgroundColor: isDark ? '#0d1117' : '#fafbfc',
                }}
                onFocusCapture={e => {
                  e.currentTarget.style.borderColor = colors.green;
                  e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.green}20`;
                }}
                onBlurCapture={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                <Lock size={15} className="ml-3.5 shrink-0" style={{ color: colors.textMuted }} />
                <input
                  type="password"
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  placeholder="Confirm password"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
              {error && (
                <div
                  className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl animate-in fade-in duration-300"
                  style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}
                >
                  <AlertCircle size={12} className="shrink-0" /> {error}
                </div>
              )}
              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: colors.green,
                  color: '#fff',
                  boxShadow: `0 4px 14px ${colors.green}30`,
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : <LogIn size={15} />}
                {loading ? 'Creating account...' : 'Create Account'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />
              <span className="text-[11px] font-medium tracking-wider uppercase" style={{ color: colors.textMuted }}>or</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                data-testid="google-signup-btn"
                onClick={handleGoogleSignUp}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(250,251,252,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#4285F4';
                  e.currentTarget.style.boxShadow = '0 0 0 2px #4285F420';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {ssoLoading === 'oauth_google' ? <Loader2 size={15} className="animate-spin" /> : <GoogleIcon />}
                Google
              </button>
              <button
                data-testid="github-signup-btn"
                onClick={handleGithubSignUp}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(250,251,252,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = isDark ? '#8b949e' : '#24292e';
                  e.currentTarget.style.boxShadow = isDark ? '0 0 0 2px #8b949e20' : '0 0 0 2px #24292e20';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {ssoLoading === 'oauth_github' ? <Loader2 size={15} className="animate-spin" /> : <Github size={15} className="shrink-0" />}
                GitHub
              </button>
              <button
                data-testid="twitter-signup-btn"
                onClick={handleTwitterSignUp}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(250,251,252,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#1DA1F2';
                  e.currentTarget.style.boxShadow = '0 0 0 2px #1DA1F220';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {ssoLoading === 'oauth_twitter' ? <Loader2 size={15} className="animate-spin" /> : <Twitter size={15} className="shrink-0" />}
                X
              </button>
            </div>

            <div className="flex items-center gap-2 justify-center text-[11px]" style={{ color: colors.textMuted }}>
              <AlertCircle size={11} className="opacity-60" />
              <span>No credit card required</span>
            </div>
          </>
          ) : (
          <form onSubmit={handleVerifyCode} className="space-y-3">
            <div
              className="flex items-center rounded-xl border overflow-hidden transition-all duration-200"
              style={{
                borderColor: colors.border,
                backgroundColor: isDark ? '#0d1117' : '#fafbfc',
              }}
              onFocusCapture={e => {
                e.currentTarget.style.borderColor = colors.green;
                e.currentTarget.style.boxShadow = `0 0 0 3px ${colors.green}20`;
              }}
              onBlurCapture={e => {
                e.currentTarget.style.borderColor = colors.border;
                e.currentTarget.style.boxShadow = 'none';
              }}
            >
              <KeyRound size={15} className="ml-3.5 shrink-0" style={{ color: colors.textMuted }} />
              <input
                type="text"
                inputMode="numeric"
                value={verificationCode}
                onChange={e => setVerificationCode(e.target.value)}
                placeholder="Verification code"
                className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                style={{ color: colors.text }}
              />
            </div>
            {error && (
              <div
                className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl animate-in fade-in duration-300"
                style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}
              >
                <AlertCircle size={12} className="shrink-0" /> {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
              style={{
                backgroundColor: colors.green,
                color: '#fff',
                boxShadow: `0 4px 14px ${colors.green}30`,
              }}
            >
              {loading ? <Loader2 size={15} className="animate-spin" /> : <Mail size={15} />}
              {loading ? 'Verifying...' : 'Verify Email'}
            </button>
            <button
              type="button"
              onClick={() => { setStep('form'); setError(''); }}
              className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-medium text-sm transition-all duration-200 border hover:scale-[1.01] active:scale-[0.99]"
              style={{
                borderColor: colors.border,
                color: colors.textSecondary,
                backgroundColor: 'transparent',
              }}
            >
              <ArrowLeft size={14} />
              Back
            </button>
          </form>
          )}
        </div>

        <div id="clerk-captcha" />

        <p className="text-center text-sm mt-5 animate-in fade-in duration-500 delay-150" style={{ animationFillMode: 'both', color: colors.textMuted }}>
          Already have an account?{' '}
          <button onClick={() => router.push('/login')} className="font-semibold hover:underline transition-all duration-200 hover:scale-[1.02]" style={{ color: colors.green }}>
            Sign in
          </button>
        </p>
      </div>
    </div>
  </div>
  );
};

export default SignUpPage;
