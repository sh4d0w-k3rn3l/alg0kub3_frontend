'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSignIn } from '@clerk/nextjs';
import { Code, Sun, Moon, LogIn, Shield, Mail, Lock, AlertCircle, Loader2 } from 'lucide-react';

const LoginPage: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { login, loginWithCredentials, user } = useAuth();
  const { signIn } = useSignIn();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleGoogleLogin = async () => {
    try {
      await signIn.sso({
        strategy: 'oauth_google',
        redirectUrl: '/auth/callback',
        redirectCallbackUrl: '/auth/callback',
      });
    } catch {
      setError('Google login failed. Please try again.');
    }
  };

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  if (user) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      await loginWithCredentials(email, password);
      router.push('/dashboard');
    } catch (err: any) {
      setError(err.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: colors.bg }}>
      <header className="h-[52px] flex items-center justify-between px-6 border-b" style={{ borderColor: colors.borderLight, backgroundColor: colors.headerBg }}>
        <button onClick={() => router.push('/')} className="flex items-center gap-2 hover:opacity-80">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: colors.green }}>
            <Code size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold" style={{ color: colors.text }}>AlgoKube</span>
        </button>
        <button onClick={toggleTheme} className="p-1" style={{ color: colors.textSecondary }}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center px-4">
        <div className="w-full max-w-sm">
          <div className="text-center mb-8">
            <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-4" style={{ backgroundColor: colors.green }}>
              <Code size={28} className="text-white" />
            </div>
            <h1 className="text-2xl font-bold mb-2" style={{ color: colors.text }}>Welcome back</h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Sign in to track your progress and unlock all courses</p>
          </div>

          <div className="border rounded-xl p-6 space-y-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <form onSubmit={handleSubmit} className="space-y-3">
              <div>
                <div className="flex items-center rounded-lg border overflow-hidden transition-colors" style={{ borderColor: colors.border, backgroundColor: isDark ? '#0d1117' : '#fff' }}>
                  <Mail size={15} className="ml-3 shrink-0" style={{ color: colors.textMuted }} />
                  <input
                    type="email"
                    data-testid="login-email-input"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    placeholder="Email address"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                </div>
              </div>
              <div>
                <div className="flex items-center rounded-lg border overflow-hidden transition-colors" style={{ borderColor: colors.border, backgroundColor: isDark ? '#0d1117' : '#fff' }}>
                  <Lock size={15} className="ml-3 shrink-0" style={{ color: colors.textMuted }} />
                  <input
                    type="password"
                    data-testid="login-password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                </div>
              </div>
              {error && (
                <div className="flex items-center gap-2 text-xs px-3 py-2 rounded-lg" data-testid="login-error" style={{ backgroundColor: '#ef444415', color: '#ef4444' }}>
                  <AlertCircle size={13} /> {error}
                </div>
              )}
              <button
                type="submit"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 disabled:opacity-60"
                style={{ backgroundColor: colors.green, color: '#fff' }}
              >
                {loading ? <Loader2 size={16} className="animate-spin" /> : <LogIn size={16} />}
                {loading ? 'Signing in...' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
              <span className="text-xs" style={{ color: colors.textMuted }}>or</span>
              <div className="flex-1 h-px" style={{ backgroundColor: colors.border }} />
            </div>

            <button
              data-testid="google-login-btn"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-3 py-2.5 px-4 rounded-lg font-medium text-sm transition-all duration-200 border"
              style={{ borderColor: colors.border, color: colors.text, backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.backgroundColor = colors.hoverBg || (isDark ? '#161b22' : '#f6f8fa'); }}
              onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <LogIn size={16} />
              Continue with Google
            </button>

            <div className="flex items-center gap-2 justify-center text-xs" style={{ color: colors.textMuted }}>
              <Shield size={12} />
              <span>Secure authentication</span>
            </div>
          </div>

          <p className="text-center text-xs mt-4" style={{ color: colors.textMuted }}>
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/sign-up')} className="underline" style={{ color: colors.green }}>
              Sign up
            </button>
          </p>
          <p className="text-center text-xs mt-4" style={{ color: colors.textMuted }}>
            First 3 lessons per course are free.{' '}
            <button onClick={() => router.push('/pricing')} className="underline" style={{ color: colors.green }}>
              View pricing
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
