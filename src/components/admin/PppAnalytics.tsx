'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { ArrowLeft, TrendingUp, DollarSign, Users, Loader2, Percent, RefreshCw, CheckCircle2, AlertTriangle } from 'lucide-react';

const TIER_COLORS = ['#6b7280', '#3b82f6', '#f59e0b', '#22c55e'];

interface PppTier { tier: number; name: string; discount: number; total_checkouts: number; paid: number; conversion_rate: number; revenue: number; }
interface PppCountry { country_code: string; flag: string; country_name: string; tier: number; transactions: number; revenue: number; }
interface PppPlanBreakdown { plan_id: string; revenue: number; transactions: number; }
interface PppSummary { total_checkouts: number; total_revenue: number; overall_conversion_rate: number; ppp_discount_revenue: number; ppp_discount_transactions: number; }
interface PppAnalyticsData { summary: PppSummary; tiers: PppTier[]; top_countries: PppCountry[]; plan_breakdown: PppPlanBreakdown[]; }
interface PlanPieItem { name: string; value: number; count: number; }
interface RateStatus { is_stale?: boolean; source?: string; currencies_count?: number; age_hours?: number; cache_ttl_hours?: number; sample_rates?: Record<string, { live?: number; hardcoded?: number; diff_pct?: number }>; }

const PppAnalytics = () => {
  const [data, setData] = useState<PppAnalyticsData | null>(null);
  const [rateStatus, setRateStatus] = useState<RateStatus | null>(null);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [analytics, rates] = await Promise.all([
        api.get<PppAnalyticsData>('/admin/ppp-analytics', { signal }),
        api.get<RateStatus>('/admin/exchange-rates', { signal }),
      ]);
      if (signal?.aborted) return;
      setData(analytics.data);
      setRateStatus(rates.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  const refreshRates = async () => {
    setRefreshing(true);
    try {
      await api.post('/admin/exchange-rates/refresh');
      const rates = await api.get<RateStatus>('/admin/exchange-rates');
      setRateStatus(rates.data);
    } catch (err) { handleApiError(err); }
    finally { setRefreshing(false); }
  };

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading) return (
    <div className="flex items-center justify-center py-20">
      <Loader2 className="animate-spin" size={32} style={{ color: '#22c55e' }} />
    </div>
  );

  if (!data) return <div className="p-8 text-center" style={{ color: '#9ca3af' }}>Failed to load analytics</div>;

  const { summary, tiers, top_countries, plan_breakdown } = data;

  const tierChartData = (tiers || []).map((t: PppTier) => ({
    name: `Tier ${t.tier}`,
    discount: `${t.discount}%`,
    checkouts: t.total_checkouts,
    paid: t.paid,
    revenue: t.revenue,
    rate: t.conversion_rate,
  }));

  const planPieData = (plan_breakdown || []).map((p: PppPlanBreakdown) => ({
    name: p.plan_id === 'pro' ? 'Monthly' : p.plan_id === 'pro_annual' ? 'Annual' : p.plan_id === 'pro_lifetime' ? 'Lifetime' : p.plan_id,
    value: p.revenue,
    count: p.transactions,
  }));

  const PIE_COLORS = ['#3b82f6', '#22c55e', '#f59e0b', '#ef4444'];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => navigate.push('/admin/dashboard')} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors">
          <ArrowLeft size={20} style={{ color: '#9ca3af' }} />
        </button>
        <div>
          <h1 className="text-xl font-bold" style={{ color: '#f3f4f6' }}>Geo-Pricing Analytics</h1>
          <p className="text-xs" style={{ color: '#6b7280' }}>PPP conversion rates and revenue by tier</p>
        </div>
      </div>

      {/* Summary Cards */}
      <div data-testid="ppp-summary-cards" className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {[
          { icon: Users, label: 'Total Checkouts', value: summary.total_checkouts, color: '#3b82f6' },
          { icon: DollarSign, label: 'Total Revenue', value: `$${summary.total_revenue}`, color: '#22c55e' },
          { icon: TrendingUp, label: 'Conversion Rate', value: `${summary.overall_conversion_rate}%`, color: '#f59e0b' },
          { icon: Percent, label: 'PPP Revenue', value: `$${summary.ppp_discount_revenue}`, sub: `${summary.ppp_discount_transactions} txns`, color: '#8b5cf6' },
        ].map((card, i) => (
          <div key={i} className="rounded-xl p-4 border" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
            <div className="flex items-center gap-2 mb-2">
              <card.icon size={16} style={{ color: card.color }} />
              <span className="text-xs" style={{ color: '#6b7280' }}>{card.label}</span>
            </div>
            <div className="text-lg font-bold" style={{ color: '#f3f4f6' }}>{card.value}</div>
            {card.sub && <div className="text-xs mt-0.5" style={{ color: '#6b7280' }}>{card.sub}</div>}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        {/* Tier Conversion Table */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f3f4f6' }}>Conversion by PPP Tier</h3>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr style={{ color: '#6b7280' }}>
                  <th className="text-left py-2 px-2">Tier</th>
                  <th className="text-right py-2 px-2">Discount</th>
                  <th className="text-right py-2 px-2">Checkouts</th>
                  <th className="text-right py-2 px-2">Paid</th>
                  <th className="text-right py-2 px-2">Rate</th>
                  <th className="text-right py-2 px-2">Revenue</th>
                </tr>
              </thead>
              <tbody>
                {(tiers || []).map((t: PppTier, i: number) => (
                  <tr key={t.tier} style={{ borderTop: '1px solid #1f2937' }}>
                    <td className="py-2.5 px-2 font-medium" style={{ color: '#f3f4f6' }}>
                      <span className="inline-block w-2 h-2 rounded-full mr-2" style={{ backgroundColor: TIER_COLORS[i] }} />
                      {t.name}
                    </td>
                    <td className="text-right py-2.5 px-2" style={{ color: t.discount > 0 ? '#22c55e' : '#6b7280' }}>
                      {t.discount > 0 ? `-${t.discount}%` : 'None'}
                    </td>
                    <td className="text-right py-2.5 px-2" style={{ color: '#d1d5db' }}>{t.total_checkouts}</td>
                    <td className="text-right py-2.5 px-2" style={{ color: '#d1d5db' }}>{t.paid}</td>
                    <td className="text-right py-2.5 px-2">
                      <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                        backgroundColor: t.conversion_rate > 50 ? '#22c55e20' : t.conversion_rate > 0 ? '#f59e0b20' : '#374151',
                        color: t.conversion_rate > 50 ? '#22c55e' : t.conversion_rate > 0 ? '#f59e0b' : '#6b7280',
                      }}>
                        {t.conversion_rate}%
                      </span>
                    </td>
                    <td className="text-right py-2.5 px-2 font-medium" style={{ color: '#f3f4f6' }}>${t.revenue}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* Tier Revenue Chart */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f3f4f6' }}>Revenue by Tier</h3>
          {tierChartData.some(d => d.revenue > 0) ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={tierChartData}>
                <XAxis dataKey="name" tick={{ fill: '#6b7280', fontSize: 11 }} />
                <YAxis tick={{ fill: '#6b7280', fontSize: 11 }} />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f3f4f6' }}
                  formatter={(v, name) => [name === 'revenue' ? `$${v}` : v, name]}
                />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#6b7280' }}>
              No revenue data yet. Transactions will appear here.
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Countries */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f3f4f6' }}>Top Countries by Revenue</h3>
          {top_countries.length > 0 ? (
            <div className="space-y-2 max-h-[250px] overflow-y-auto">
              {top_countries.map((c: PppCountry, i: number) => (
                <div key={c.country_code} className="flex items-center justify-between py-1.5 px-2 rounded" style={{ backgroundColor: i % 2 === 0 ? '#0d111780' : 'transparent' }}>
                  <div className="flex items-center gap-2">
                    <span className="text-sm">{c.flag}</span>
                    <span className="text-xs font-medium" style={{ color: '#d1d5db' }}>{c.country_name}</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded" style={{ backgroundColor: '#1f2937', color: '#6b7280' }}>Tier {c.tier}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs" style={{ color: '#6b7280' }}>{c.transactions} txn</span>
                    <span className="text-xs font-bold" style={{ color: '#22c55e' }}>${c.revenue}</span>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex items-center justify-center h-[200px] text-sm" style={{ color: '#6b7280' }}>
              No country data yet
            </div>
          )}
        </div>

        {/* Plan Breakdown */}
        <div className="rounded-xl border p-4" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <h3 className="text-sm font-semibold mb-3" style={{ color: '#f3f4f6' }}>Revenue by Plan</h3>
          {planPieData.length > 0 ? (
            <div className="flex items-center gap-6">
              <ResponsiveContainer width={160} height={160}>
                <PieChart>
                  <Pie data={planPieData} cx="50%" cy="50%" innerRadius={40} outerRadius={70} dataKey="value" paddingAngle={2}>
                    {planPieData.map((_, i: number) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ backgroundColor: '#1f2937', border: '1px solid #374151', borderRadius: 8, fontSize: 12, color: '#f3f4f6' }} formatter={(v) => [`$${v}`]} />
                </PieChart>
              </ResponsiveContainer>
              <div className="space-y-2">
                {planPieData.map((p: PlanPieItem, i: number) => (
                  <div key={p.name} className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PIE_COLORS[i % PIE_COLORS.length] }} />
                    <span className="text-xs" style={{ color: '#d1d5db' }}>{p.name}</span>
                    <span className="text-xs font-bold" style={{ color: '#f3f4f6' }}>${p.value}</span>
                    <span className="text-[10px]" style={{ color: '#6b7280' }}>({p.count})</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="flex items-center justify-center h-[160px] text-sm" style={{ color: '#6b7280' }}>
              No plan data yet
            </div>
          )}
        </div>
      </div>

      {/* Exchange Rate Status */}
      {rateStatus && (
        <div data-testid="exchange-rate-panel" className="rounded-xl border p-4 mt-6" style={{ backgroundColor: '#111827', borderColor: '#1f2937' }}>
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-semibold flex items-center gap-2" style={{ color: '#f3f4f6' }}>
              <RefreshCw size={14} style={{ color: '#3b82f6' }} />
              Live Exchange Rates
            </h3>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1.5 text-xs" style={{ color: rateStatus.is_stale ? '#f59e0b' : '#22c55e' }}>
                {rateStatus.is_stale
                  ? <><AlertTriangle size={12} /> Stale</>
                  : <><CheckCircle2 size={12} /> Fresh</>
                }
              </div>
              <button
                data-testid="refresh-rates-btn"
                onClick={refreshRates}
                disabled={refreshing}
                className="flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium transition-colors"
                style={{ backgroundColor: '#3b82f620', color: '#3b82f6', border: '1px solid #3b82f630' }}
              >
                <RefreshCw size={11} className={refreshing ? 'animate-spin' : ''} />
                {refreshing ? 'Refreshing...' : 'Refresh Now'}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-3">
            {[
              { label: 'Source', value: rateStatus.source },
              { label: 'Currencies', value: rateStatus.currencies_count },
              { label: 'Age', value: rateStatus.age_hours != null ? `${rateStatus.age_hours}h` : 'N/A' },
              { label: 'TTL', value: `${rateStatus.cache_ttl_hours}h` },
            ].map((item, i) => (
              <div key={i} className="rounded-lg px-3 py-2" style={{ backgroundColor: '#0d1117' }}>
                <div className="text-[10px] uppercase tracking-wider" style={{ color: '#6b7280' }}>{item.label}</div>
                <div className="text-sm font-medium" style={{ color: '#f3f4f6' }}>{item.value}</div>
              </div>
            ))}
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead><tr style={{ color: '#6b7280' }}>
                <th className="text-left py-1.5 px-2">Currency</th>
                <th className="text-right py-1.5 px-2">Live Rate</th>
                <th className="text-right py-1.5 px-2">Hardcoded</th>
                <th className="text-right py-1.5 px-2">Diff</th>
              </tr></thead>
              <tbody>
                {Object.entries(rateStatus.sample_rates || {}).map(([code, info]) => (
                  <tr key={code} style={{ borderTop: '1px solid #1f2937' }}>
                    <td className="py-1.5 px-2 font-medium" style={{ color: '#f3f4f6' }}>{code}</td>
                    <td className="text-right py-1.5 px-2" style={{ color: info.live ? '#d1d5db' : '#ef4444' }}>{info.live ?? 'N/A'}</td>
                    <td className="text-right py-1.5 px-2" style={{ color: '#6b7280' }}>{info.hardcoded}</td>
                    <td className="text-right py-1.5 px-2">
                      {info.diff_pct != null ? (
                        <span style={{ color: info.diff_pct > 10 ? '#f59e0b' : '#22c55e' }}>
                          {info.diff_pct}%
                        </span>
                      ) : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default PppAnalytics;
