'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import { useSignIn, useClerk } from '@clerk/nextjs';
import { api } from '@/lib/api';
import { Code, Sun, Moon, LogIn, Shield, Mail, Lock, AlertCircle, Loader2, Github, Eye, EyeOff, KeyRound } from 'lucide-react';

const GoogleIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0">
    <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92a5.06 5.06 0 0 1-2.2 3.32v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.1z" fill="#4285F4"/>
    <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853"/>
    <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05"/>
    <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335"/>
  </svg>
);

const LinkedInIcon = () => (
  <svg viewBox="0 0 24 24" className="w-4 h-4 shrink-0" fill="#0A66C2">
    <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 1 1 0-4.124 2.062 2.062 0 0 1 0 4.124zM7.119 20.452H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
  </svg>
);

const LoginPage: React.FC = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user } = useAuth();
  const { signIn } = useSignIn();
  const clerk = useClerk();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [ssoLoading, setSsoLoading] = useState('');
  const [otpStep, setOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState('');
  const [otpInfo, setOtpInfo] = useState('');

  const ssoLogin = (strategy: 'oauth_google' | 'oauth_github' | 'oauth_linkedin_oidc') => async () => {
    if (ssoLoading) return;
    if (!signIn?.sso) {
      console.error('[SSO] signIn or signIn.sso is not available yet', { signIn: !!signIn, sso: !!signIn?.sso });
      setError('Authentication service is still loading. Please wait a moment and try again.');
      return;
    }
    setSsoLoading(strategy);
    try {
      const cbUrl = `${window.location.origin}/auth/callback`;
      console.log('[SSO] Initiating', strategy, 'redirect to', cbUrl);
      const result = await signIn.sso({
        strategy,
        redirectUrl: cbUrl,
        redirectCallbackUrl: cbUrl,
      });
      console.log('[SSO] sso() returned:', JSON.stringify(result));
      if (result.error) {
        console.error('[SSO] Clerk returned error:', result.error);
        const detail = result.error.message || result.error.longMessage || result.error.code || '';
        if (detail.includes('not enabled') || detail.includes('not configured') || detail.includes('not found')) {
          setError(`Social login (${strategy.replace('oauth_', '')}) is not enabled. Please contact support.`);
        } else {
          setError(detail || 'Social login failed. Please try again.');
        }
      }
    } catch (err) {
      console.error('[SSO] Exception:', err);
      setError('Social login failed. Please try again.');
    } finally {
      setSsoLoading('');
    }
  };

  const handleGoogleLogin = ssoLogin('oauth_google');
  const handleGithubLogin = ssoLogin('oauth_github');
  const handleLinkedInLogin = ssoLogin('oauth_linkedin_oidc');

  useEffect(() => {
    if (user) router.push('/dashboard');
  }, [user, router]);

  if (user) return null;

  const getLiveSignIn = () => (clerk.client?.signIn as unknown as typeof signIn) ?? signIn;

  const completeSignIn = async (target: typeof signIn) => {
    await target.finalize({
      navigate: async ({ session, decorateUrl }) => {
        if (session?.getToken) {
          const token = await session.getToken().catch(() => null);
          if (token) {
            await api.post('/auth/session', { session_id: token, email }).catch(() => {});
          }
        }
        const url = decorateUrl('/dashboard');
        if (url.startsWith('http')) window.location.href = url;
        else router.push(url);
      },
    });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (!email || !password) { setError('Please enter email and password'); return; }
    setLoading(true);
    try {
      const { error: createErr } = await signIn.create({ identifier: email });
      if (createErr) { setError(createErr.longMessage || createErr.message || 'Login failed'); return; }
      const { error: pwErr } = await signIn.password({ password, emailAddress: email });
      if (pwErr) {
        if (pwErr.code === 'form_password_incorrect' || pwErr.code === 'form_identifier_not_found') {
          setError('Invalid email or password');
        } else {
          setError(pwErr.longMessage || pwErr.message || 'Login failed');
        }
        return;
      }
      const target = getLiveSignIn();
      const siStatus = (target.status ?? signIn.status) as string | null;
      const createdSessionId = target.createdSessionId ?? signIn.createdSessionId;
      if (siStatus === 'complete' || (createdSessionId && !siStatus)) {
        await completeSignIn(target);
      } else if (siStatus === 'needs_second_factor' || siStatus === 'needs_client_trust') {
        const { error: sendErr } = await target.mfa.sendEmailCode();
        if (sendErr) {
          setError(`Additional verification is required (${siStatus}) but the email code could not be sent: ${sendErr.longMessage || sendErr.message || 'Please try a social provider.'}`);
          return;
        }
        setOtpInfo(`We've sent a verification code to ${email}. Enter it below to complete sign-in.`);
        setOtpStep(true);
      } else {
        setError(`Sign-in requires additional verification (${siStatus}). Please try again or use a social provider.`);
      }
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; longMessage?: string }[]; message?: string } | null;
      const code = e?.errors?.[0]?.code;
      if (code === 'captcha_unavailable' || code === 'requires_captcha') {
        setError('Bot protection could not be completed. Please try again or use a social provider.');
      } else if (e?.errors?.[0]?.longMessage) {
        setError(e.errors[0].longMessage);
      } else {
        setError(e?.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setOtpInfo('');
    if (!otpCode) { setError('Please enter the verification code'); return; }
    setLoading(true);
    try {
      const target = getLiveSignIn();
      const { error: verifyErr } = await target.mfa.verifyEmailCode({ code: otpCode });
      if (verifyErr) {
        if (verifyErr.code === 'form_code_incorrect') setError('Incorrect code. Please try again.');
        else setError(verifyErr.longMessage || verifyErr.message || 'Verification failed');
        return;
      }
      const after = getLiveSignIn();
      if (after.status === 'complete' || after.createdSessionId) {
        await completeSignIn(after);
      } else {
        setOtpStep(false);
        setError(`Verification incomplete (${after.status}). Please try again or use a social provider.`);
      }
    } catch (err: unknown) {
      const e = err as { errors?: { code?: string; longMessage?: string }[]; message?: string } | null;
      if (e?.errors?.[0]?.longMessage) setError(e.errors[0].longMessage);
      else setError(e?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError('');
    setOtpInfo('');
    setLoading(true);
    try {
      const target = getLiveSignIn();
      const { error: sendErr } = await target.mfa.sendEmailCode();
      if (sendErr) setError(sendErr.longMessage || sendErr.message || 'Failed to resend the code');
      else setOtpInfo('A new code has been sent to your email.');
    } catch {
      setError('Failed to resend the code. Please try again.');
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
            ? `radial-gradient(ellipse 600px 400px at 20% 10%, rgba(34,197,94,0.06) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 80% 90%, rgba(59,130,246,0.05) 0%, transparent 70%)`
            : `radial-gradient(ellipse 600px 400px at 20% 10%, rgba(26,127,55,0.04) 0%, transparent 70%),
               radial-gradient(ellipse 500px 400px at 80% 90%, rgba(37,99,235,0.03) 0%, transparent 70%)`
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
              Welcome back
            </h1>
            <p className="text-sm" style={{ color: colors.textSecondary }}>
              Sign in to continue your journey
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
            <form onSubmit={otpStep ? handleVerifyOtp : handleSubmit} className="space-y-3">
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
                  data-testid="login-email-input"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="Email address"
                  className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                  style={{ color: colors.text }}
                />
              </div>
              <div>
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
                    data-testid="login-password-input"
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    placeholder="Password"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                    style={{ color: colors.text }}
                  />
                  <button
                    type="button"
                    data-testid="login-password-toggle"
                    onClick={() => setShowPassword(v => !v)}
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    className="px-3 py-2.5 shrink-0 hover:opacity-70 transition-opacity"
                    style={{ color: colors.textMuted }}
                  >
                    {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                  </button>
                </div>
                <div className="flex justify-end mt-1.5">
                  <button
                    type="button"
                    onClick={() => router.push('/forgot-password')}
                    className="text-xs font-medium hover:underline transition-all duration-200 hover:scale-[1.02]"
                    style={{ color: colors.textMuted }}
                  >
                    Forgot password?
                  </button>
                </div>
              </div>
              {error && (
                <div
                  className="flex items-center gap-2 text-xs px-3.5 py-2 rounded-xl animate-in fade-in duration-300"
                  style={{ backgroundColor: '#ef444415', color: '#ef4444', border: '1px solid #ef444430' }}
                >
                  <AlertCircle size={12} className="shrink-0" /> {error}
                </div>
              )}
              {otpStep && (
                <div className="space-y-2 animate-in fade-in duration-300">
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
                      data-testid="login-otp-input"
                      type="text"
                      inputMode="numeric"
                      autoComplete="one-time-code"
                      value={otpCode}
                      onChange={e => setOtpCode(e.target.value)}
                      placeholder="6-digit verification code"
                      className="flex-1 bg-transparent px-3 py-2.5 text-sm outline-none"
                      style={{ color: colors.text }}
                    />
                  </div>
                  {otpInfo && (
                    <p className="text-xs animate-in fade-in duration-300" style={{ color: colors.green }}>
                      {otpInfo}
                    </p>
                  )}
                  <button
                    type="button"
                    data-testid="login-resend-otp-btn"
                    onClick={handleResendOtp}
                    disabled={loading}
                    className="text-xs font-medium hover:underline transition-all duration-200 disabled:opacity-60"
                    style={{ color: colors.textMuted }}
                  >
                    Resend code
                  </button>
                </div>
              )}
              <button
                type="submit"
                data-testid="login-submit-btn"
                disabled={loading}
                className="w-full flex items-center justify-center gap-2 py-2.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 disabled:opacity-60 hover:scale-[1.01] active:scale-[0.99]"
                style={{
                  backgroundColor: colors.green,
                  color: '#fff',
                  boxShadow: `0 4px 14px ${colors.green}30`,
                }}
              >
                {loading ? <Loader2 size={15} className="animate-spin" /> : otpStep ? <KeyRound size={15} /> : <LogIn size={15} />}
                {loading ? 'Signing in...' : otpStep ? 'Verify & Sign In' : 'Sign In'}
              </button>
            </form>

            <div className="flex items-center gap-3">
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />
              <span className="text-[11px] font-medium tracking-wider uppercase" style={{ color: colors.textMuted }}>or</span>
              <div className="flex-1 h-px" style={{ background: `linear-gradient(90deg, transparent, ${colors.border}, transparent)` }} />
            </div>

            <div className="grid grid-cols-3 gap-2.5">
              <button
                data-testid="google-login-btn"
                onClick={handleGoogleLogin}
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
                data-testid="github-login-btn"
                onClick={handleGithubLogin}
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
                data-testid="linkedin-login-btn"
                onClick={handleLinkedInLogin}
                disabled={!!ssoLoading}
                className="flex items-center justify-center gap-2 py-2.5 rounded-xl border text-xs font-medium transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                style={{
                  borderColor: colors.border,
                  color: colors.text,
                  backgroundColor: isDark ? 'rgba(13,17,23,0.6)' : 'rgba(250,251,252,0.8)',
                }}
                onMouseEnter={e => {
                  e.currentTarget.style.borderColor = '#0A66C2';
                  e.currentTarget.style.boxShadow = '0 0 0 2px #0A66C220';
                }}
                onMouseLeave={e => {
                  e.currentTarget.style.borderColor = colors.border;
                  e.currentTarget.style.boxShadow = 'none';
                }}
              >
                {ssoLoading === 'oauth_linkedin_oidc' ? <Loader2 size={15} className="animate-spin" /> : <LinkedInIcon />}
                LinkedIn
              </button>
            </div>

            <div className="flex items-center gap-2 justify-center text-[11px]" style={{ color: colors.textMuted }}>
              <Shield size={11} className="opacity-60" />
              <span>Secured with Clerk</span>
            </div>
          </div>

          <div id="clerk-captcha" />

          <p className="text-center text-sm mt-5 animate-in fade-in duration-500 delay-150" style={{ animationFillMode: 'both', color: colors.textMuted }}>
            Don&apos;t have an account?{' '}
            <button onClick={() => router.push('/sign-up')} className="font-semibold hover:underline transition-all duration-200 hover:scale-[1.02]" style={{ color: colors.green }}>
              Sign up
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
