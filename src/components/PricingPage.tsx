'use client';

import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import PageHeader from './PageHeader';
import { useRouter } from 'next/navigation';
import { Check, Zap, Star, Globe, X, Crown, Clock, Users } from 'lucide-react';
import MoneyBackBadge from './home/MoneyBackBadge';
import SEO from './SEO';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
const PPP_DISMISS_KEY = 'algokube_ppp_dismissed';
const AB_VARIANT_KEY = 'algokube_ab_variant';
const VISITOR_ID_KEY = 'algokube_visitor_id';

interface GeoData {
  country_code: string;
  country_name?: string;
  flag?: string;
  currency_code?: string;
  currency_symbol?: string;
  exchange_rate?: number;
  discount_percent: number;
  plans: Plan[];
}

interface Plan {
  id: string;
  features: string[];
  price: number;
  adjusted_price?: number;
  adjusted_monthly_equivalent?: number;
  monthly_equivalent?: number;
  savings_percent?: number;
  original_price?: number;
  local_price?: number;
  local_original_price?: number;
  local_monthly_equivalent?: number;
}

interface PromoData {
  enabled: boolean;
  end_date: string;
  label?: string;
  promo_price?: number;
  social_proof_base?: number;
  social_proof_drift?: number;
  ab_enabled?: boolean;
  ab_split?: number;
  variant_a?: { price: number; label: string };
  variant_b?: { price: number; label: string };
}

interface TimeLeft {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  expired: boolean;
}

const getVisitorId = (): string => {
  if (typeof window === 'undefined') return '';
  let id = localStorage.getItem(VISITOR_ID_KEY);
  if (!id) { id = 'v_' + Math.random().toString(36).slice(2, 12); localStorage.setItem(VISITOR_ID_KEY, id); }
  return id;
};

const useCountdown = (targetDate?: string): TimeLeft => {
  const [timeLeft, setTimeLeft] = useState<TimeLeft>({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    if (!targetDate) return;
    const target = new Date(targetDate).getTime();
    if (isNaN(target)) return;

    const tick = () => {
      const diff = target - Date.now();
      if (diff <= 0) {
        setTimeLeft({ days: 0, hours: 0, minutes: 0, seconds: 0, expired: true });
        if (intervalRef.current) clearInterval(intervalRef.current);
        return;
      }
      setTimeLeft({
        days: Math.floor(diff / 86400000),
        hours: Math.floor((diff % 86400000) / 3600000),
        minutes: Math.floor((diff % 3600000) / 60000),
        seconds: Math.floor((diff % 60000) / 1000),
        expired: false,
      });
    };

    tick();
    intervalRef.current = setInterval(tick, 1000);
    return () => { if (intervalRef.current) clearInterval(intervalRef.current); };
  }, [targetDate]);

  return timeLeft;
};

const useSocialProof = (base?: number, drift?: number): number => {
  const [count, setCount] = useState(() => (base ? base + Math.floor(Math.random() * (drift || 5)) : 0));
  const [prevBase, setPrevBase] = useState(base);
  if (base !== prevBase) {
    setPrevBase(base);
    if (base) setCount(base + ((base * 7) % (drift || 5)));
  }
  useEffect(() => {
    if (!base) return;
    const interval = setInterval(() => {
      const d = drift || 5;
      setCount(prev => {
        const change = Math.random() < 0.5 ? 1 : -1;
        const next = prev + change;
        return Math.max(base - d, Math.min(base + d, next));
      });
    }, 4000 + Math.random() * 6000);
    return () => clearInterval(interval);
  }, [base, drift]);
  return count;
};

const CountdownUnit = ({ value, label }: { value: number; label: string }) => (
  <div className="flex flex-col items-center">
    <span className="text-lg sm:text-xl font-bold font-mono leading-none" style={{ color: '#fff' }}>
      {String(value).padStart(2, '0')}
    </span>
    <span className="text-[9px] uppercase tracking-wider mt-0.5" style={{ color: 'rgba(255,255,255,0.6)' }}>{label}</span>
  </div>
);

const PricingPage = () => {
  const { colors } = useTheme();
  const { user, login, isSubscribed } = useAuth();
  const router = useRouter();
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState<string | null>(null);
  const [billing, setBilling] = useState('annual');
  const [geo, setGeo] = useState<GeoData | null>(null);
  const [promo, setPromo] = useState<PromoData | null>(null);
  const [abVariant, setAbVariant] = useState<string | null>(null);
  const [pppDismissed, setPppDismissed] = useState(() => typeof window !== 'undefined' ? localStorage.getItem(PPP_DISMISS_KEY) === 'true' : false);
  const [visitorId] = useState(() => getVisitorId());
  const impressionSent = useRef(false);

  useEffect(() => {
    const ac = new AbortController();
    api.get<GeoData>(`/pricing/geo`, { signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setGeo(r.data); setPlans(r.data.plans || []);
      })
      .catch((err) => {
        if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return;
        api.get<Plan[]>(`/plans`, { signal: ac.signal }).then(r => {
          if (ac.signal.aborted) return;
          setPlans(r.data);
        }).catch(() => {});
      });
    api.get<PromoData>(`/pricing/lifetime-promo`, { signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setPromo(r.data);
        if (r.data.ab_enabled) {
          let stored = localStorage.getItem(AB_VARIANT_KEY);
          if (!stored || (stored !== 'A' && stored !== 'B')) {
            stored = Math.random() * 100 < (r.data.ab_split || 50) ? 'A' : 'B';
            localStorage.setItem(AB_VARIANT_KEY, stored);
          }
          setAbVariant(stored);
        }
      })
      .catch((err) => {
        if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return;
      });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    if (!abVariant || impressionSent.current) return;
    impressionSent.current = true;
    const ac = new AbortController();
    api.post(`/pricing/ab-impression`, { variant: abVariant, event: 'impression', visitor_id: visitorId }, { signal: ac.signal }).catch(() => {});
    return () => ac.abort();
  }, [abVariant, visitorId]);

  const countdown = useCountdown(promo?.end_date);
  const promoActive = promo?.enabled && !countdown.expired;
  const claimsCount = useSocialProof(promo?.social_proof_base || 0, promo?.social_proof_drift || 5);

  const dismissPpp = () => {
    setPppDismissed(true);
    localStorage.setItem(PPP_DISMISS_KEY, 'true');
  };

  const handlePhonePeSubscribe = async (planId: string) => {
    if (!user) { login(); return; }
    setLoading(`phonepe_${planId}`);
    try {
      const res = await api.post<{ redirect_url: string }>(`/checkout/phonepe/create`, {
        plan_id: planId,
        origin_url: window.location.origin,
        country_code: geo?.country_code || '',
        amount_inr: geo?.country_code === 'IN',
      });
      window.location.href = res.data.redirect_url;
    } catch (err) {
      handleApiError(err);
      setLoading(null);
    }
  };

  const handlePayPalSubscribe = async (planId: string) => {
    if (!user) { login(); return; }
    setLoading(`paypal_${planId}`);
    if (abVariant && planId === 'pro_lifetime') {
      api.post(`/pricing/ab-impression`, { variant: abVariant, event: 'conversion', visitor_id: visitorId }).catch(() => {});
    }
    try {
      const res = await api.post<{ approval_url: string; order_id: string }>(`/checkout/paypal/create`, {
        plan_id: planId,
        origin_url: window.location.origin,
        country_code: geo?.country_code || '',
        ab_variant: abVariant || '',
        visitor_id: visitorId,
      });
      // Store order_id so callback page can retrieve it after PayPal redirect
      sessionStorage.setItem('paypal_order_id', res.data.order_id);
      window.location.href = res.data.approval_url;
    } catch (err) {
      handleApiError(err);
      setLoading(null);
    }
  };

  const isIndianUser = geo?.country_code === 'IN';

  const freePlan = plans.find(p => p.id === 'free') || ({ features: [] } as unknown as Plan);
  const monthlyPlan = plans.find(p => p.id === 'pro') || ({ features: [], price: 14.99 } as unknown as Plan);
  const annualPlan = plans.find(p => p.id === 'pro_annual') || ({ features: [], price: 99, monthly_equivalent: 8.25, savings_percent: 45 } as unknown as Plan);
  const lifetimePlan = plans.find(p => p.id === 'pro_lifetime') || ({ features: [], price: 199 } as unknown as Plan);

  const hasDiscount = geo && geo.discount_percent > 0 && !pppDismissed;
  const showBanner = geo && geo.discount_percent > 0 && !pppDismissed;

  const isLocal = geo && geo.currency_code && geo.currency_code !== 'USD';
  const sym = geo?.currency_symbol || '$';
  const rate = geo?.exchange_rate || 1;
  const toLocal = (usd: number): number => {
    if (!isLocal || !usd) return usd;
    const local = usd * rate;
    if (rate >= 100) return Math.round(local / 10) * 10;
    if (rate >= 10) return Math.round(local);
    return Math.round(local * 100) / 100;
  };
  const fmtPrice = (amount: number | string | undefined | null): string => {
    if (amount == null) return '';
    const num = Number(amount);
    if (rate >= 100) return num.toLocaleString();
    if (Number.isInteger(num)) return num.toLocaleString();
    return num.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 });
  };

  const monthlyUsd = hasDiscount ? monthlyPlan.adjusted_price : monthlyPlan.price;
  const annualUsd = hasDiscount ? annualPlan.adjusted_price : annualPlan.price;
  const annualMonthlyUsd = hasDiscount
    ? annualPlan.adjusted_monthly_equivalent || (annualUsd! / 12).toFixed(2)
    : annualPlan.monthly_equivalent || (annualPlan.price / 12).toFixed(2);

  const monthlyDisplay = isLocal ? (hasDiscount ? monthlyPlan.local_price : toLocal(monthlyPlan.price)) : monthlyUsd;
  const annualDisplay = isLocal ? (hasDiscount ? annualPlan.local_price : toLocal(annualPlan.price)) : annualUsd;
  const annualMonthlyDisplay = isLocal
    ? (hasDiscount ? (annualPlan.local_monthly_equivalent || toLocal(annualUsd! / 12)) : toLocal(annualPlan.monthly_equivalent || annualPlan.price / 12))
    : annualMonthlyUsd;
  const monthlyOrigDisplay = isLocal ? (monthlyPlan.local_original_price || toLocal(monthlyPlan.original_price || monthlyPlan.price)) : (monthlyPlan.original_price || monthlyPlan.price);
  const annualOrigDisplay = isLocal ? (annualPlan.local_original_price || toLocal(annualPlan.original_price || annualPlan.price)) : (annualPlan.original_price || annualPlan.price);
  const annualMonthlyOrigDisplay = isLocal ? toLocal((annualPlan.original_price || annualPlan.price) / 12) : ((annualPlan.original_price || annualPlan.price) / 12).toFixed(2);

  const baseLifetimePrice = lifetimePlan.price;
  const activeVariant = promo?.ab_enabled && abVariant
    ? (abVariant === 'A' ? promo.variant_a : promo.variant_b)
    : null;
  const promoBasePrice = promoActive
    ? (activeVariant ? activeVariant.price : promo!.promo_price)
    : baseLifetimePrice;
  const promoLabel = promoActive
    ? (activeVariant ? activeVariant.label : promo!.label)
    : '';
  const lifetimeUsd = hasDiscount
    ? Math.round(promoBasePrice! * (1 - geo!.discount_percent / 100) * 100) / 100
    : promoBasePrice;
  const lifetimeDisplay = isLocal ? toLocal(lifetimeUsd!) : lifetimeUsd;
  const lifetimeStrikeUsd = hasDiscount ? promoBasePrice : (promoActive ? baseLifetimePrice : null);
  const lifetimeStrikeDisplay = lifetimeStrikeUsd ? (isLocal ? toLocal(lifetimeStrikeUsd) : lifetimeStrikeUsd) : null;
  const lifetimeSavingsDisplay = isLocal ? toLocal(baseLifetimePrice - promoBasePrice!) : Math.round(baseLifetimePrice - promoBasePrice!);

  const activePlan = billing === 'annual' ? annualPlan : monthlyPlan;
  const activePlanId = billing === 'annual' ? 'pro_annual' : 'pro';

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <SEO title="Pricing" description="Unlock all courses with AlgoKube Pro. Free tier includes 3 lessons per course." path="/pricing" />
      <PageHeader />

      <div className="max-w-5xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <h1 className="text-3xl sm:text-4xl font-bold mb-3" style={{ color: colors.text }}>
            Simple, transparent pricing
          </h1>
          <p className="text-sm sm:text-base mb-6" style={{ color: colors.textSecondary }}>
            Start free, upgrade when you&apos;re ready for unlimited access.
          </p>

          {showBanner && (
            <div
              data-testid="ppp-banner"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-lg mb-6 text-sm relative"
              style={{ backgroundColor: '#22c55e15', border: '1px solid #22c55e40', color: colors.text }}
            >
              <Globe size={16} style={{ color: '#22c55e' }} />
              <span>
                {geo!.flag && <span className="mr-1">{geo!.flag}</span>}
                We noticed you&apos;re in <strong>{geo!.country_name || geo!.country_code}</strong>.
                Enjoy <strong style={{ color: '#22c55e' }}>{geo!.discount_percent}% off</strong> with
                purchasing power parity pricing!
              </span>
              <button
                data-testid="ppp-dismiss-btn"
                onClick={dismissPpp}
                className="ml-2 p-0.5 rounded hover:bg-white/10 transition-colors flex-shrink-0"
                title="Dismiss and show standard pricing"
              >
                <X size={14} style={{ color: colors.textMuted }} />
              </button>
            </div>
          )}

          <div className="inline-flex items-center gap-1 p-1 rounded-full border" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
            <button
              data-testid="billing-monthly"
              onClick={() => setBilling('monthly')}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all"
              style={{
                backgroundColor: billing === 'monthly' ? '#22c55e' : 'transparent',
                color: billing === 'monthly' ? '#fff' : colors.textMuted,
              }}
            >
              Monthly
            </button>
            <button
              data-testid="billing-annual"
              onClick={() => setBilling('annual')}
              className="px-4 py-1.5 rounded-full text-sm font-medium transition-all flex items-center gap-1.5"
              style={{
                backgroundColor: billing === 'annual' ? '#22c55e' : 'transparent',
                color: billing === 'annual' ? '#fff' : colors.textMuted,
              }}
            >
              Annual
              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-full" style={{
                backgroundColor: billing === 'annual' ? 'rgba(255,255,255,0.25)' : '#22c55e20',
                color: billing === 'annual' ? '#fff' : '#22c55e',
              }}>
                Save {annualPlan.savings_percent || 45}%
              </span>
            </button>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 max-w-5xl mx-auto">
          <div data-testid="plan-free" className="border rounded-xl p-6" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <h3 className="text-lg font-bold mb-1" style={{ color: colors.text }}>Free</h3>
            <div className="flex items-baseline gap-1 mb-4">
              <span className="text-3xl font-bold" style={{ color: colors.text }}>{sym}0</span>
              <span className="text-sm" style={{ color: colors.textMuted }}>forever</span>
            </div>
            <ul className="space-y-2.5 mb-6">
              {(freePlan.features || []).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: colors.textSecondary }}>
                  <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: colors.green }} />
                  {f}
                </li>
              ))}
            </ul>
            <button
              onClick={() => router.push('/')}
              className="w-full py-2.5 rounded-lg text-sm font-medium border transition-colors"
              style={{ borderColor: colors.border, color: colors.textSecondary }}
            >
              Browse Courses
            </button>
          </div>

          <div data-testid="plan-pro" className="border-2 rounded-xl p-6 relative" style={{ backgroundColor: colors.bgCard, borderColor: '#22c55e' }}>
            {billing === 'annual' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1" style={{ backgroundColor: '#f59e0b', color: '#fff' }}>
                <Star size={10} fill="currentColor" /> Best Value
              </div>
            )}
            {billing === 'monthly' && (
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-medium" style={{ backgroundColor: '#22c55e', color: '#fff' }}>
                Popular
              </div>
            )}
            <h3 className="text-lg font-bold mb-1 flex items-center gap-2" style={{ color: colors.text }}>
              <Zap size={18} style={{ color: '#22c55e' }} /> Pro
            </h3>

            {billing === 'annual' ? (
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  {hasDiscount && (
                    <span className="text-lg line-through mr-1" style={{ color: colors.textMuted }}>
                      {sym}{fmtPrice(annualMonthlyOrigDisplay)}
                    </span>
                  )}
                  <span data-testid="pro-annual-price" className="text-3xl font-bold" style={{ color: colors.text }}>{sym}{fmtPrice(annualMonthlyDisplay)}</span>
                  <span className="text-sm" style={{ color: colors.textMuted }}>/month</span>
                </div>
                <div className="flex items-center gap-2 mt-1">
                  <span className="text-xs line-through" style={{ color: colors.textMuted }}>{sym}{fmtPrice(hasDiscount ? monthlyOrigDisplay : monthlyDisplay)}/mo</span>
                  <span className="text-xs font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>
                    Save {annualPlan.savings_percent || 45}%
                  </span>
                </div>
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  {hasDiscount ? (
                    <>Billed <span className="line-through">{sym}{fmtPrice(annualOrigDisplay)}</span>{' '}<strong style={{ color: '#22c55e' }}>{sym}{fmtPrice(annualDisplay)}</strong>/year</>
                  ) : (
                    <>Billed {sym}{fmtPrice(annualDisplay)}/year</>
                  )}
                </p>
              </div>
            ) : (
              <div className="mb-4">
                <div className="flex items-baseline gap-1">
                  {hasDiscount && (
                    <span className="text-lg line-through mr-1" style={{ color: colors.textMuted }}>{sym}{fmtPrice(monthlyOrigDisplay)}</span>
                  )}
                  <span data-testid="pro-monthly-price" className="text-3xl font-bold" style={{ color: colors.text }}>{sym}{fmtPrice(monthlyDisplay)}</span>
                  <span className="text-sm" style={{ color: colors.textMuted }}>/month</span>
                </div>
                {hasDiscount && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{geo!.discount_percent}% PPP discount applied</p>
                )}
              </div>
            )}

            <ul className="space-y-2.5 mb-6">
              {(activePlan.features || []).map((f: string, i: number) => (
                <li key={i} className="flex items-start gap-2 text-sm" style={{ color: colors.textSecondary }}>
                  <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#22c55e' }} />
                  {f}
                </li>
              ))}
            </ul>
            {isSubscribed ? (
              <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#22c55e30', color: '#22c55e' }}>
                Current Plan
              </button>
            ) : (
              <div className="space-y-2">
                <button
                  data-testid="subscribe-pro-btn"
                  onClick={() => isIndianUser ? handlePhonePeSubscribe(activePlanId) : handlePayPalSubscribe(activePlanId)}
                  disabled={loading !== null}
                  className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity"
                  style={{ backgroundColor: '#22c55e', color: '#fff', opacity: loading === `paypal_${activePlanId}` || loading === `phonepe_${activePlanId}` ? 0.7 : 1 }}
                >
                  {(loading === `paypal_${activePlanId}` || loading === `phonepe_${activePlanId}`) ? 'Redirecting...' : user
                    ? (isIndianUser ? `Pay with PhonePe ${billing === 'annual' ? '(Annual)' : '(Monthly)'}` : `Pay with PayPal ${billing === 'annual' ? '(Annual)' : '(Monthly)'}`)
                    : 'Sign in & Subscribe'}
                </button>
                {!isIndianUser && (
                  <button
                    onClick={() => handlePhonePeSubscribe(activePlanId)}
                    disabled={loading !== null}
                    className="w-full py-2 rounded-lg text-xs font-medium transition-opacity border"
                    style={{ borderColor: colors.border, color: colors.textMuted, opacity: loading !== null ? 0.5 : 1 }}
                  >
                    Or pay with PhonePe
                  </button>
                )}
              </div>
            )}
            <MoneyBackBadge variant="card" className="mt-4" />
          </div>

          <div data-testid="plan-lifetime" className="border-2 rounded-xl p-6 relative overflow-hidden" style={{ backgroundColor: colors.bgCard, borderColor: promoActive ? '#ef4444' : '#f59e0b' }}>
            {promoActive && (
              <div
                data-testid="lifetime-promo-banner"
                className="absolute top-0 left-0 right-0 px-3 py-2 text-center"
                style={{ background: 'linear-gradient(135deg, #ef4444 0%, #dc2626 100%)' }}
              >
                <div className="flex items-center justify-center gap-2">
                  <Clock size={12} style={{ color: '#fff' }} />
                  <span className="text-[11px] font-bold tracking-wide uppercase" style={{ color: '#fff' }}>
                    {promoLabel} — Ends in
                  </span>
                </div>
                <div data-testid="promo-countdown" className="flex items-center justify-center gap-3 mt-1">
                  <CountdownUnit value={countdown.days} label="days" />
                  <span className="text-white/40 text-sm font-bold">:</span>
                  <CountdownUnit value={countdown.hours} label="hrs" />
                  <span className="text-white/40 text-sm font-bold">:</span>
                  <CountdownUnit value={countdown.minutes} label="min" />
                  <span className="text-white/40 text-sm font-bold">:</span>
                  <CountdownUnit value={countdown.seconds} label="sec" />
                </div>
              </div>
            )}

            <div style={{ marginTop: promoActive ? 68 : 0 }}>
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full text-xs font-bold flex items-center gap-1" style={{
                backgroundColor: '#8b5cf6', color: '#fff',
                top: promoActive ? 65 : -12,
              }}>
                <Crown size={10} fill="currentColor" /> Pay Once
              </div>
              <h3 className="text-lg font-bold mb-1 flex items-center gap-2 mt-2" style={{ color: colors.text }}>
                <Crown size={18} style={{ color: '#f59e0b' }} /> Lifetime
              </h3>
              <div className="mb-4">
                <div className="flex items-baseline gap-1 flex-wrap">
                  {lifetimeStrikeDisplay && (
                    <span className="text-lg line-through mr-1" style={{ color: colors.textMuted }}>{sym}{fmtPrice(lifetimeStrikeDisplay)}</span>
                  )}
                  <span data-testid="lifetime-price" className="text-3xl font-bold" style={{ color: promoActive ? '#ef4444' : colors.text }}>{sym}{fmtPrice(lifetimeDisplay!)}</span>
                  <span className="text-sm" style={{ color: colors.textMuted }}>one-time</span>
                </div>
                {promoActive && !hasDiscount && (
                  <p className="text-xs mt-1 font-semibold" style={{ color: '#ef4444' }}>
                    Save {sym}{fmtPrice(lifetimeSavingsDisplay)} — limited time only
                  </p>
                )}
                {hasDiscount && promoActive && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>
                    {promoLabel} + {geo!.discount_percent}% PPP applied
                  </p>
                )}
                {hasDiscount && !promoActive && (
                  <p className="text-xs mt-1" style={{ color: '#22c55e' }}>{geo!.discount_percent}% PPP discount applied</p>
                )}
                <p className="text-xs mt-1" style={{ color: colors.textMuted }}>
                  No renewals, ever. Lifetime access.
                </p>
              </div>

              <ul className="space-y-2.5 mb-6">
                {(lifetimePlan.features || []).map((f: string, i: number) => (
                  <li key={i} className="flex items-start gap-2 text-sm" style={{ color: colors.textSecondary }}>
                    <Check size={16} className="mt-0.5 flex-shrink-0" style={{ color: '#f59e0b' }} />
                    {f}
                  </li>
                ))}
              </ul>
              {isSubscribed ? (
                <button disabled className="w-full py-2.5 rounded-lg text-sm font-medium" style={{ backgroundColor: '#f59e0b30', color: '#f59e0b' }}>
                  Current Plan
                </button>
              ) : (
                <div className="space-y-2">
                  <button
                    data-testid="subscribe-lifetime-btn"
                    onClick={() => isIndianUser ? handlePhonePeSubscribe('pro_lifetime') : handlePayPalSubscribe('pro_lifetime')}
                    disabled={loading !== null}
                    className="w-full py-2.5 rounded-lg text-sm font-medium transition-opacity"
                    style={{
                      backgroundColor: promoActive ? '#ef4444' : '#f59e0b',
                      color: '#fff',
                      opacity: loading === 'paypal_pro_lifetime' || loading === 'phonepe_pro_lifetime' ? 0.7 : 1,
                    }}
                  >
                    {(loading === 'paypal_pro_lifetime' || loading === 'phonepe_pro_lifetime') ? 'Redirecting...' : user
                      ? (promoActive
                        ? (isIndianUser ? `Claim ${promoLabel} via PhonePe — ${sym}${fmtPrice(lifetimeDisplay)}` : `Claim ${promoLabel} via PayPal — ${sym}${fmtPrice(lifetimeDisplay)}`)
                        : (isIndianUser ? 'Pay with PhonePe (Lifetime)' : 'Pay with PayPal (Lifetime)'))
                      : (promoActive ? `Sign in & Claim ${sym}${fmtPrice(lifetimeDisplay)} Deal` : 'Sign in & Get Lifetime')}
                  </button>
                  {!isIndianUser && (
                    <button
                      onClick={() => handlePhonePeSubscribe('pro_lifetime')}
                      disabled={loading !== null}
                      className="w-full py-2 rounded-lg text-xs font-medium transition-opacity border"
                      style={{ borderColor: colors.border, color: colors.textMuted, opacity: loading !== null ? 0.5 : 1 }}
                    >
                      Or pay with PhonePe
                    </button>
                  )}
                </div>
              )}
              {promoActive && claimsCount > 0 && (
                <div
                  data-testid="social-proof-counter"
                  className="flex items-center justify-center gap-1.5 mt-3 py-1.5 rounded-md text-xs"
                  style={{ backgroundColor: '#ef444412', border: '1px solid #ef444425' }}
                >
                  <Users size={12} style={{ color: '#ef4444' }} />
                  <span style={{ color: colors.textSecondary }}>
                    <strong style={{ color: '#ef4444' }}>{claimsCount}</strong> people claimed this deal today
                  </span>
                </div>
              )}
              <MoneyBackBadge variant="card" className="mt-4" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default PricingPage;
