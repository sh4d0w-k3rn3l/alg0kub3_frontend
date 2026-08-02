'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Code, Sun, Moon, Mail, Lock, KeyRound, AlertCircle, Loader2, ArrowLeft, Eye, EyeOff } from 'lucide-react';

type Step = 'email' | 'code';

function getErrorMessage(err: unknown): string {
  if (!err) return 'Something went wrong. Please try again.';
  const e = err as { message?: string; longMessage?: string };
  return e.longMessage || e.message || 'Something went wrong. Please try again.';
}

const ForgotPasswordPage: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();
  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  if (user) return null;

  const handleSendCode = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email) { setError('Please enter your email address'); return; }
    setLoading(true);
    try {
      const createRes = await signIn.create({ identifier: email });
      if (createRes.error) { setError(getErrorMessage(createRes.error)); setLoading(false); return; }
      const sendRes = await signIn.resetPasswordEmailCode.sendCode();
      if (sendRes.error) { setError(getErrorMessage(sendRes.error)); setLoading(false); return; }
      setStep('code');
    } catch (err: unknown) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!code) { setError('Please enter the verification code'); return; }
    if (!password) { setError('Please enter a new password'); return; }
    if (password !== confirmPassword) { setError('Passwords do not match'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters'); return; }
    setLoading(true);
    try {
      const verifyRes = await signIn.resetPasswordEmailCode.verifyCode({ code });
      if (verifyRes.error) { setError(getErrorMessage(verifyRes.error)); setLoading(false); return; }
      const submitRes = await signIn.resetPasswordEmailCode.submitPassword({ password, signOutOfOtherSessions: true });
      if (submitRes.error) { setError(getErrorMessage(submitRes.error)); setLoading(false); return; }
      const { error: finalizeErr } = await signIn.finalize({
        navigate: async ({ session, decorateUrl }) => {
          const token = await session?.getToken?.().catch(() => null) ?? null;
          if (token) {
            await api.post('/auth/reset-password', { session_id: token, password }).catch(() => {});
            await api.post('/auth/session', { session_id: token, email }).catch(() => {});
          }
          const url = decorateUrl('/dashboard');
          if (url.startsWith('http')) window.location.href = url;
          else router.push(url);
        },
      });
      if (finalizeErr) {
        setError('Password reset succeeded but failed to sign in. Please try logging in.');
      }
    } catch (err: unknown) {
      setError(getErrorMessage(err));
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
            ? `radial-gradient(ellipse 600px 400px at 50% 10%, rgba(59,130,246,0.06) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 50% 90%, rgba(34,197,94,0.05) 0%, transparent 70%)`
            : `radial-gradient(ellipse 600px 400px at 50% 10%, rgba(37,99,235,0.04) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 50% 90%, rgba(26,127,55,0.03) 0%, transparent 70%)`
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
              {step === 'email' ? 'Reset your password' : 'Check your email'}
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              {step === 'email' ? "We'll send you a reset code" : `Enter the code sent to ${email}`}
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
            {step === 'email' && (
              <form onSubmit={handleSendCode} className="space-y-3">
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
                  {loading ? 'Sending...' : 'Send Reset Code'}
                </button>
              </form>
            )}

            {step === 'code' && (
              <form onSubmit={handleResetPassword} className="space-y-3">
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
                    value={code}
                    onChange={e => setCode(e.target.value)}
                    placeholder="Verification code"
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
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="New password"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                  <button
                    type="button"
                    data-testid="reset-password-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="px-3 py-2.5 shrink-0 hover:opacity-70 transition-opacity"
                    style={{ color: colors.textMuted }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
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
                    type={showConfirmPassword ? 'text' : 'password'}
                    value={confirmPassword}
                    onChange={e => setConfirmPassword(e.target.value)}
                    placeholder="Confirm new password"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                  <button
                    type="button"
                    data-testid="reset-confirm-password-toggle"
                    onClick={() => setShowConfirmPassword(v => !v)}
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                    className="px-3 py-2.5 shrink-0 hover:opacity-70 transition-opacity"
                    style={{ color: colors.textMuted }}
                  >
                    {showConfirmPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
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
                  {loading ? <Loader2 size={15} className="animate-spin" /> : <Lock size={15} />}
                  {loading ? 'Resetting...' : 'Reset Password'}
                </button>
                <button
                  type="button"
                  onClick={() => { setStep('email'); setError(''); }}
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
            Remember your password?{' '}
            <button onClick={() => router.push('/login')} className="font-semibold hover:underline transition-all duration-200 hover:scale-[1.02]" style={{ color: colors.green }}>
              Sign in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
