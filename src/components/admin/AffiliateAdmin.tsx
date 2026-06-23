'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Users, DollarSign, MousePointerClick, TrendingUp,
  Check, X, Settings, Loader2, AlertTriangle, Tag,
  Wallet,
} from 'lucide-react';

const AffiliateAdmin = () => {
  const [overview, setOverview] = useState<Record<string, unknown> | null>(null);
  const [affiliates, setAffiliates] = useState<Record<string, unknown>[]>([]);
  const [payouts, setPayouts] = useState<Record<string, unknown>[]>([]);
  const [promoCodes, setPromoCodes] = useState<Record<string, unknown>[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [settings, setSettings] = useState<Record<string, unknown>>({});
  const [settingsSaving, setSaving] = useState<boolean>(false);
  const [promoForm, setPromoForm] = useState({ code: '', affiliate_id: '', discount_percent: 10, max_uses: 100 });
  const navigate = useRouter();
  
  const fetchAll = useCallback(async (signal?: AbortSignal) => {
    try {
      const [ovRes, affRes, payRes, promoRes] = await Promise.all([
        api.get<Record<string, unknown>>('/affiliate/admin/overview', { signal }),
        api.get<{ affiliates: Record<string, unknown>[] }>('/affiliate/admin/affiliates', { signal }),
        api.get<{ payouts: Record<string, unknown>[] }>('/affiliate/admin/payouts', { signal }),
        api.get<{ promo_codes: Record<string, unknown>[] }>('/affiliate/admin/promo-codes', { signal }),
      ]);
      if (signal?.aborted) return;
      setOverview(ovRes.data);
      setAffiliates(affRes.data.affiliates);
      setPayouts(payRes.data.payouts);
      setPromoCodes(promoRes.data.promo_codes);
      setSettings((ovRes.data.settings ?? {}) as Record<string, unknown>);
    } catch (err: unknown) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchAll(ac.signal);
    return () => ac.abort();
  }, [fetchAll]);

  const updateStatus = async (id: string, status: string) => {
    await api.put<Record<string, unknown>>(`/affiliate/admin/affiliates/${id}/status`, { status });
    fetchAll();
  };

  const setCustomRate = async (id: string, rate: string) => {
    const val = prompt('Enter new commission rate (0-100):', rate);
    if (val === null) return;
    await api.put<Record<string, unknown>>(`/affiliate/admin/affiliates/${id}/rate`, { commission_rate: parseFloat(val) });
    fetchAll();
  };

  const processPayout = async (id: string, action: string) => {
    const note = action === 'reject' ? (prompt('Reason for rejection:') || '') : '';
    await api.put<Record<string, unknown>>(`/affiliate/admin/payouts/${id}`, { action, note });
    fetchAll();
  };

  const saveSettings = async () => {
    setSaving(true);
    try {
      await api.put<Record<string, unknown>>('/affiliate/admin/settings', settings);
      fetchAll();
    } finally {
      setSaving(false);
    }
  };

  const createPromo = async () => {
    if (!promoForm.code || !promoForm.affiliate_id) return showError('Code and Affiliate ID required');
    await api.post<Record<string, unknown>>('/affiliate/admin/promo-codes', promoForm);
    setPromoForm({ code: '', affiliate_id: '', discount_percent: 10, max_uses: 100 });
    fetchAll();
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const st = (overview?.stats ?? {}) as Record<string, unknown>;

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'affiliates', label: `Affiliates (${affiliates.length})`, icon: Users },
    { id: 'payouts', label: `Payouts (${payouts.filter(p => p.status === 'requested').length})`, icon: Wallet },
    { id: 'promos', label: 'Promo Codes', icon: Tag },
    { id: 'settings', label: 'Settings', icon: Settings },
  ];

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 data-testid="affiliate-admin-title" className="text-2xl font-bold text-white">Affiliate Program</h1>
            <p className="text-sm text-[#8b949e]">Manage affiliates, payouts, and settings</p>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 overflow-x-auto pb-1">
          {tabs.map(t => (
            <button key={t.id} data-testid={`affiliate-tab-${t.id}`} onClick={() => setActiveTab(t.id)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                activeTab === t.id ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] bg-[#161b22] border border-[#2d333b] hover:text-[#c9d1d9]'
              }`}>
              <t.icon size={12} /> {t.label}
            </button>
          ))}
        </div>

        {/* Overview */}
        {activeTab === 'overview' && (
          <div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
              {[
                { icon: Users, label: 'Total Affiliates', value: (st.total_affiliates as number) ?? 0, color: '#3b82f6' },
                { icon: MousePointerClick, label: 'Total Clicks', value: ((st.total_clicks as number) ?? 0).toLocaleString(), color: '#a855f7' },
                { icon: TrendingUp, label: 'Conversions', value: `${(st.total_conversions as number) ?? 0} (${(st.conversion_rate as number) ?? 0}%)`, color: '#22c55e' },
                { icon: DollarSign, label: 'Total Commissions', value: `$${(st.total_commissions as number) ?? 0}`, color: '#f59e0b' },
              ].map((s, i) => (
                <div key={i} className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
                  <div className="flex items-center gap-2 mb-2"><s.icon size={14} style={{ color: s.color }} /><span className="text-xs text-[#8b949e]">{s.label}</span></div>
                  <p className="text-xl font-bold" style={{ color: s.color }}>{s.value}</p>
                </div>
              ))}
            </div>

            {/* Fraud Flags */}
            {(((overview?.fraud_flags ?? []) as unknown[]).length) > 0 && (
              <div className="rounded-xl border border-red-500/20 p-4 mb-6" style={{ backgroundColor: 'rgba(239,68,68,0.04)' }}>
                <h3 className="text-sm font-semibold text-red-400 mb-3 flex items-center gap-2"><AlertTriangle size={14} /> Suspicious Activity</h3>
                {(overview?.fraud_flags as Record<string, unknown>[] | undefined)?.map((f, i: number) => (
                  <div key={i} className="text-xs text-[#8b949e] mb-1">IP hash {(f.ip_hash as string)}... — {(f.clicks as number)} clicks across codes: {(f.codes as string[]).join(', ')}</div>
                ))}
              </div>
            )}

            {/* Top Affiliates */}
            <div className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-semibold text-white mb-4">Top Affiliates</h3>
              <div className="space-y-2">
                {((overview?.top_affiliates ?? []) as Record<string, unknown>[]).map((a, i) => (
                  <div key={(a.id as string)} className="flex items-center gap-3 px-3 py-2.5 rounded-lg border border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
                    <span className="text-sm font-bold text-[#484f58] w-6 text-center">{i + 1}</span>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-[#c9d1d9] truncate">{(a.name as string)}</p>
                      <p className="text-[10px] text-[#484f58]">{(a.affiliate_code as string)}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-bold text-[#22c55e]">${(a.total_earned as number) ?? 0}</p>
                      <p className="text-[10px] text-[#484f58]">{(a.total_conversions as number) ?? 0} conv</p>
                    </div>
                  </div>
                ))}
                {!((overview?.top_affiliates ?? []) as Record<string, unknown>[]).length && (
                  <p className="text-sm text-[#484f58] text-center py-4">No affiliates yet</p>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Affiliates List */}
        {activeTab === 'affiliates' && (
          <div className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2d333b]">
                    <th className="text-left px-4 py-3 text-xs text-[#8b949e] font-medium">Affiliate</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Status</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Rate</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Clicks</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Conv</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Earned</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e] font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {affiliates.map(a => (
                    <tr key={(a.id as string)} data-testid={`affiliate-row-${(a.id as string)}`} className="border-b border-[#21262d] hover:bg-[#0d1117]">
                      <td className="px-4 py-3">
                        <p className="text-[#c9d1d9] font-medium">{(a.name as string)}</p>
                        <p className="text-[10px] text-[#484f58] font-mono">{(a.affiliate_code as string)}</p>
                      </td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          (a.status as string) === 'active' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                          (a.status as string) === 'pending' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          'bg-red-500/10 text-red-400'
                        }`}>{(a.status as string)}</span>
                      </td>
                      <td className="text-center px-3 py-3">
                        <button onClick={() => setCustomRate(a.id as string, String(a.commission_rate as number))} className="text-xs text-[#3b82f6] hover:underline">{(a.commission_rate as number)}%</button>
                      </td>
                      <td className="text-center px-3 py-3 text-[#8b949e]">{(a.total_clicks as number) ?? 0}</td>
                      <td className="text-center px-3 py-3 text-[#8b949e]">{(a.total_conversions as number) ?? 0}</td>
                      <td className="text-center px-3 py-3 text-[#22c55e] font-medium">${(a.total_earned as number) ?? 0}</td>
                      <td className="text-center px-3 py-3">
                        <div className="flex items-center justify-center gap-1">
                          {(a.status as string) === 'pending' && (
                            <button onClick={() => updateStatus(a.id as string, 'active')} className="text-[#22c55e] hover:bg-[#22c55e]/10 p-1 rounded"><Check size={14} /></button>
                          )}
                          {(a.status as string) !== 'active' && (
                            <button onClick={() => updateStatus(a.id as string, 'active')} className="text-[#22c55e] hover:bg-[#22c55e]/10 p-1 rounded"><Check size={14} /></button>
                          )}
                          {(a.status as string) !== 'suspended' && (
                            <button onClick={() => updateStatus(a.id as string, 'suspended')} className="text-[#da3633] hover:bg-[#da3633]/10 p-1 rounded"><X size={14} /></button>
                          )}
                          {(a.status as string) === 'suspended' && (
                            <button onClick={() => updateStatus(a.id as string, 'active')} className="text-[#22c55e] hover:bg-[#22c55e]/10 p-1 rounded"><Check size={14} /></button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Payouts */}
        {activeTab === 'payouts' && (
          <div className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-[#2d333b]">
                    <th className="text-left px-4 py-3 text-xs text-[#8b949e]">Affiliate</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Amount</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Status</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Date</th>
                    <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {payouts.map(p => (
                    <tr key={(p.id as string)} data-testid={`payout-row-${(p.id as string)}`} className="border-b border-[#21262d]">
                      <td className="px-4 py-3">
                        <p className="text-[#c9d1d9]">{(p.affiliate_name as string)}</p>
                        <p className="text-[10px] text-[#484f58]">{(p.affiliate_email as string)}</p>
                      </td>
                      <td className="text-center px-3 py-3 text-[#22c55e] font-bold">${(p.amount as number) ?? 0}</td>
                      <td className="text-center px-3 py-3">
                        <span className={`text-xs px-2 py-0.5 rounded-full capitalize ${
                          (p.status as string) === 'requested' ? 'bg-[#f59e0b]/10 text-[#f59e0b]' :
                          (p.status as string) === 'approved' ? 'bg-[#3b82f6]/10 text-[#3b82f6]' :
                          (p.status as string) === 'paid' ? 'bg-[#22c55e]/10 text-[#22c55e]' :
                          'bg-red-500/10 text-red-400'
                        }`}>{(p.status as string)}</span>
                      </td>
                      <td className="text-center px-3 py-3 text-[#8b949e] text-xs">{new Date((p.created_at as string)).toLocaleDateString()}</td>
                      <td className="text-center px-3 py-3">
                        {(p.status as string) === 'requested' && (
                          <div className="flex items-center justify-center gap-1">
                            <button onClick={() => processPayout(p.id as string, 'approve')} className="text-[#3b82f6] hover:bg-[#3b82f6]/10 px-2 py-1 rounded text-xs">Approve</button>
                            <button onClick={() => processPayout(p.id as string, 'mark_paid')} className="text-[#22c55e] hover:bg-[#22c55e]/10 px-2 py-1 rounded text-xs">Mark Paid</button>
                            <button onClick={() => processPayout(p.id as string, 'reject')} className="text-red-400 hover:bg-red-400/10 px-2 py-1 rounded text-xs">Reject</button>
                          </div>
                        )}
                        {(p.status as string) === 'approved' && (
                          <button onClick={() => processPayout(p.id as string, 'mark_paid')} className="text-[#22c55e] hover:bg-[#22c55e]/10 px-2 py-1 rounded text-xs">Mark Paid</button>
                        )}
                      </td>
                    </tr>
                  ))}
                  {payouts.length === 0 && (
                    <tr><td colSpan={5} className="text-center py-8 text-[#484f58]">No payout requests</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Promo Codes */}
        {activeTab === 'promos' && (
          <div>
            <div className="rounded-xl border border-[#2d333b] p-5 mb-4" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-semibold text-white mb-3">Create Promo Code</h3>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <input data-testid="promo-code-input" value={promoForm.code} onChange={e => setPromoForm(p => ({ ...p, code: e.target.value }))}
                  placeholder="Code (e.g. SAVE20)" className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
                <input data-testid="promo-affiliate-input" value={promoForm.affiliate_id} onChange={e => setPromoForm(p => ({ ...p, affiliate_id: e.target.value }))}
                  placeholder="Affiliate ID" className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
                <input type="number" value={promoForm.discount_percent} onChange={e => setPromoForm(p => ({ ...p, discount_percent: parseFloat(e.target.value) }))}
                  placeholder="Discount %" className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]" />
                <button data-testid="create-promo-btn" onClick={createPromo}
                  className="bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium rounded-lg text-sm transition-colors">Create</button>
              </div>
            </div>
            <div className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <table className="w-full text-sm">
                <thead><tr className="border-b border-[#2d333b]">
                  <th className="text-left px-4 py-3 text-xs text-[#8b949e]">Code</th>
                  <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Affiliate</th>
                  <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Discount</th>
                  <th className="text-center px-3 py-3 text-xs text-[#8b949e]">Uses</th>
                </tr></thead>
                <tbody>
                  {promoCodes.map(p => (
                    <tr key={(p.id as string)} className="border-b border-[#21262d]">
                      <td className="px-4 py-3 font-mono text-[#c9d1d9]">{(p.code as string)}</td>
                      <td className="text-center px-3 py-3 text-[#8b949e] text-xs">{(p.affiliate_id as string)}</td>
                      <td className="text-center px-3 py-3 text-[#22c55e]">{(p.discount_percent as number)}%</td>
                      <td className="text-center px-3 py-3 text-[#8b949e]">{(p.uses as number)}/{(p.max_uses as number) || '∞'}</td>
                    </tr>
                  ))}
                  {promoCodes.length === 0 && (
                    <tr><td colSpan={4} className="text-center py-8 text-[#484f58]">No promo codes yet</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* Settings */}
        {activeTab === 'settings' && (
          <div className="max-w-lg">
            <div className="rounded-xl border border-[#2d333b] p-6 space-y-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-semibold text-white">Program Settings</h3>
              {[
                { key: 'commission_rate', label: 'Default Commission Rate (%)', type: 'number' },
                { key: 'cookie_days', label: 'Cookie Duration (days)', type: 'number' },
                { key: 'min_payout', label: 'Minimum Payout ($)', type: 'number' },
              ].map(f => (
                <div key={f.key}>
                  <label className="text-xs text-[#8b949e] block mb-1">{f.label}</label>
                  <input type={f.type} value={String(settings[f.key] ?? '')} onChange={e => setSettings((s: Record<string, unknown>) => ({ ...s, [f.key]: parseFloat(e.target.value) }))}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]" />
                </div>
              ))}
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#8b949e]">Auto-approve new affiliates</label>
                <button onClick={() => setSettings((s: Record<string, unknown>) => ({ ...s, auto_approve: !s.auto_approve }))}
                  className={`w-10 h-5 rounded-full transition-colors ${settings.auto_approve ? 'bg-[#22c55e]' : 'bg-[#2d333b]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.auto_approve ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <div className="flex items-center justify-between">
                <label className="text-xs text-[#8b949e]">Program Enabled</label>
                <button onClick={() => setSettings((s: Record<string, unknown>) => ({ ...s, enabled: !s.enabled }))}
                  className={`w-10 h-5 rounded-full transition-colors ${settings.enabled ? 'bg-[#22c55e]' : 'bg-[#2d333b]'}`}>
                  <div className={`w-4 h-4 rounded-full bg-white shadow transition-transform ${settings.enabled ? 'translate-x-5' : 'translate-x-0.5'}`} />
                </button>
              </div>
              <button data-testid="save-settings-btn" onClick={saveSettings} disabled={settingsSaving}
                className="w-full flex items-center justify-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium py-2.5 rounded-lg text-sm transition-colors">
                {settingsSaving ? <Loader2 size={14} className="animate-spin" /> : <Check size={14} />}
                Save Settings
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AffiliateAdmin;
