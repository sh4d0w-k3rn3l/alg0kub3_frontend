'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/context/AuthContext';
import { api, ApiError } from '@/lib/api';
import { showError, showSuccess } from '@/lib/toast';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Link2, Copy, Check, TrendingUp, Users, MousePointerClick,
  DollarSign, Loader2, ExternalLink, Gift, Award, ChevronRight,
  BarChart3, Wallet, Clock, CheckCircle, XCircle, ArrowUpRight,
} from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import PageHeader from '@/components/PageHeader';

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ size?: number; className?: string; style?: React.CSSProperties }>; label: string; value: React.ReactNode; sub?: string; color: string }) => (
  <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
    <div className="flex items-center gap-2 mb-2">
      <span style={{ color }}><Icon size={14} /></span>
      <span className="text-xs text-[#8b949e]">{label}</span>
    </div>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
    {sub && <p className="text-xs text-[#484f58] mt-1">{sub}</p>}
  </div>
);

const STATUS_STYLES: Record<string, { color: string; bg: string; icon: React.ComponentType<{ size?: number }> }> = {
  pending: { color: '#f59e0b', bg: 'rgba(245,158,11,0.1)', icon: Clock },
  payout_requested: { color: '#3b82f6', bg: 'rgba(59,130,246,0.1)', icon: ArrowUpRight },
  paid: { color: '#22c55e', bg: 'rgba(34,197,94,0.1)', icon: CheckCircle },
  rejected: { color: '#ef4444', bg: 'rgba(239,68,68,0.1)', icon: XCircle },
};

const AffiliateDashboard = () => {
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [paymentDetails, setPaymentDetails] = useState('');
  const [copied, setCopied] = useState(false);
  const [requesting, setRequesting] = useState(false);
  const { user } = useAuth();
  const router = useRouter();

  const fetchDashboard = useCallback((signal?: AbortSignal) => {
    api.get<Record<string, unknown>>('/affiliate/my-dashboard', { signal })
      .then(res => {
        if (signal?.aborted) return;
        setData(res.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      })
      .finally(() => setLoading(false));
  }, []);

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const ac = new AbortController();
    fetchDashboard(ac.signal);
    return () => ac.abort();
  }, [user, router, fetchDashboard]);

  const handleApply = async () => {
    setApplying(true);
    try {
      await api.post('/affiliate/apply', {
        payment_method: 'bank_transfer',
        payment_details: paymentDetails,
      });
      fetchDashboard();
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : (err as Error)?.message || 'Failed to apply');
    } finally {
      setApplying(false);
    }
  };

  const handleCopyLink = () => {
    const link = `${window.location.origin}?ref=${data?.affiliate?.affiliate_code}`;
    navigator.clipboard.writeText(link);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleRequestPayout = async () => {
    setRequesting(true);
    try {
      const res = await api.post<{ message: string }>('/affiliate/request-payout', {});
      showSuccess(res.data.message);
      fetchDashboard();
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : (err as Error)?.message || 'Payout request failed');
    } finally {
      setRequesting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (!data?.is_affiliate) {
    return (
      <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
        <div className="max-w-2xl mx-auto px-6 py-12">
          <button data-testid="affiliate-back-btn" onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors mb-8 flex items-center gap-2">
            <ArrowLeft size={16} /> Back
          </button>
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
            <div className="text-center mb-8">
              <div className="w-16 h-16 rounded-2xl mx-auto mb-4 flex items-center justify-center" style={{ backgroundColor: 'rgba(34,197,94,0.1)' }}>
                <Gift size={28} className="text-[#22c55e]" />
              </div>
              <h1 data-testid="affiliate-apply-title" className="text-3xl font-bold text-white mb-2">Become an Affiliate</h1>
              <p className="text-[#8b949e] max-w-md mx-auto">
                Earn 20% recurring commission on every payment from users you refer. Share your unique link and start earning.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-8">
              {[
                { icon: Link2, title: 'Get Your Link', desc: 'Share your unique referral link' },
                { icon: Users, title: 'Refer Users', desc: 'When they sign up & subscribe' },
                { icon: DollarSign, title: 'Earn Commission', desc: '20% recurring on every payment' },
              ].map((step, i) => (
                <div key={i} className="rounded-xl border border-[#2d333b] p-5 text-center" style={{ backgroundColor: '#161b22' }}>
                  <step.icon size={20} className="text-[#22c55e] mx-auto mb-2" />
                  <p className="text-sm font-semibold text-white">{step.title}</p>
                  <p className="text-xs text-[#8b949e] mt-1">{step.desc}</p>
                </div>
              ))}
            </div>

            <div className="rounded-xl border border-[#2d333b] p-6" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Payment Details (for payouts)</h3>
              <textarea
                data-testid="affiliate-payment-details"
                value={paymentDetails}
                onChange={e => setPaymentDetails(e.target.value)}
                placeholder="Bank name, account number, IBAN, etc."
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2.5 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e] placeholder-[#484f58] resize-none h-20"
              />
              <button
                data-testid="affiliate-apply-btn"
                onClick={handleApply}
                disabled={applying}
                className="mt-3 w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors"
              >
                {applying ? <Loader2 size={14} className="animate-spin" /> : <Award size={14} />}
                {applying ? 'Applying...' : 'Join Affiliate Program'}
              </button>
            </div>
          </motion.div>
        </div>
      </div>
    );
  }

  const { affiliate, stats, commissions, payouts, chart, settings } = data;
  const link = `${window.location.origin}?ref=${affiliate.affiliate_code}`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="affiliate-dashboard-back" onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="affiliate-dashboard-title" className="text-2xl font-bold text-white">Affiliate Dashboard</h1>
            <p className="text-sm text-[#8b949e]">Track your referrals and earnings</p>
          </div>
          <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${affiliate.status === 'active' ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'bg-[#f59e0b]/10 text-[#f59e0b]'}`}>
            {affiliate.status}
          </span>
        </div>

        <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-xl border border-[#22c55e]/20 p-5 mb-6" style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}>
          <p className="text-xs text-[#8b949e] mb-2 font-medium">Your Referral Link</p>
          <div className="flex items-center gap-2">
            <div className="flex-1 flex items-center gap-2 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 overflow-hidden">
              <Link2 size={14} className="text-[#22c55e] shrink-0" />
              <span data-testid="affiliate-link" className="text-sm text-[#c9d1d9] truncate font-mono">{link}</span>
            </div>
            <button data-testid="copy-affiliate-link" onClick={handleCopyLink}
              className="shrink-0 flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-medium transition-colors"
              style={{ backgroundColor: copied ? '#22c55e' : '#161b22', color: copied ? '#fff' : '#c9d1d9', border: `1px solid ${copied ? '#22c55e' : '#2d333b'}` }}>
              {copied ? <Check size={14} /> : <Copy size={14} />}
              {copied ? 'Copied' : 'Copy'}
            </button>
          </div>
          <p className="text-xs text-[#484f58] mt-2">Commission: {settings.commission_rate}% recurring &middot; Cookie: {settings.cookie_days} days</p>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
          <StatCard icon={MousePointerClick} label="Total Clicks" value={stats.clicks.toLocaleString()} color="#3b82f6" />
          <StatCard icon={Users} label="Signups" value={stats.signups} sub={`${stats.conversion_rate}% conversion`} color="#a855f7" />
          <StatCard icon={DollarSign} label="Total Earned" value={`$${stats.total_earned}`} color="#22c55e" />
          <StatCard icon={Wallet} label="Pending" value={`$${stats.pending_earnings}`} sub={`Min payout: $${settings.min_payout}`} color="#f59e0b" />
        </div>

        {chart.length > 0 && (
          <div className="rounded-xl border border-[#2d333b] p-5 mb-6" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <BarChart3 size={14} className="text-[#3b82f6]" /> Performance (Last 30 Days)
            </h3>
            <ResponsiveContainer width="100%" height={200}>
              <LineChart data={chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#21262d" />
                <XAxis dataKey="date" tick={{ fill: '#484f58', fontSize: 10 }} tickFormatter={v => v.slice(5)} />
                <YAxis tick={{ fill: '#484f58', fontSize: 10 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: '8px', fontSize: '12px' }}
                  labelStyle={{ color: '#8b949e' }}
                />
                <Line type="monotone" dataKey="clicks" stroke="#3b82f6" strokeWidth={2} dot={false} />
                <Line type="monotone" dataKey="conversions" stroke="#22c55e" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <DollarSign size={14} className="text-[#22c55e]" /> Commissions
              </h3>
              {stats.pending_earnings >= settings.min_payout && (
                <button data-testid="request-payout-btn" onClick={handleRequestPayout} disabled={requesting}
                  className="flex items-center gap-1 px-3 py-1 rounded-lg text-xs font-medium bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors disabled:opacity-50">
                  {requesting ? <Loader2 size={12} className="animate-spin" /> : <ArrowUpRight size={12} />}
                  Request Payout
                </button>
              )}
            </div>
            {commissions.length === 0 ? (
              <p className="text-sm text-[#484f58] text-center py-6">No commissions yet. Share your link to start earning!</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {commissions.map((c: Record<string, unknown>) => {
                  const st = STATUS_STYLES[c.status] || STATUS_STYLES.pending;
                  const StIcon = st.icon;
                  return (
                    <div key={c.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
                      <span style={{ color: st.color }}><StIcon size={14} /></span>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs text-[#c9d1d9]">${c.payment_amount} sale &middot; {c.commission_rate}%</p>
                        <p className="text-[10px] text-[#484f58]">{new Date(c.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-sm font-bold" style={{ color: st.color }}>${c.amount}</span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          <div className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
              <Wallet size={14} className="text-[#f59e0b]" /> Payouts
            </h3>
            {payouts.length === 0 ? (
              <p className="text-sm text-[#484f58] text-center py-6">No payouts yet.</p>
            ) : (
              <div className="space-y-2 max-h-[300px] overflow-y-auto">
                {payouts.map((p: Record<string, unknown>) => {
                  const st = STATUS_STYLES[p.status] || STATUS_STYLES.pending;
                  return (
                    <div key={p.id} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
                      <div className="flex-1">
                        <p className="text-sm font-medium text-[#c9d1d9]">${p.amount}</p>
                        <p className="text-[10px] text-[#484f58]">{new Date(p.created_at).toLocaleDateString()}</p>
                      </div>
                      <span className="text-xs px-2 py-0.5 rounded-full font-medium capitalize" style={{ color: st.color, backgroundColor: st.bg }}>
                        {p.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AffiliateDashboard;
