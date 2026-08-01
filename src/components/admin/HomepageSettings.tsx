'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft, Activity, Save, Loader2, Eye, EyeOff, CheckCircle,
  AlertTriangle, Zap, ArrowRight, FlaskConical, RotateCcw,
} from 'lucide-react';

const ACCENT_PRESETS = [
  { color: '#f59e0b', label: 'Amber' },
  { color: '#ef4444', label: 'Red' },
  { color: '#3b82f6', label: 'Blue' },
  { color: '#22c55e', label: 'Green' },
  { color: '#a855f7', label: 'Purple' },
  { color: '#ec4899', label: 'Pink' },
  { color: '#06b6d4', label: 'Cyan' },
];

const HomepageSettings = () => {
  const navigate = useRouter();

  const [bannerConfig, setBannerConfig] = useState<Record<string, unknown> | null>(null);
  const [promoConfig, setPromoConfig] = useState<Record<string, unknown> | null>(null);
  const [abResults, setAbResults] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [savingBanner, setSavingBanner] = useState<boolean>(false);
  const [savingPromo, setSavingPromo] = useState<boolean>(false);
  const [resettingAb, setResettingAb] = useState<boolean>(false);
  const [toast, setToast] = useState<{ msg: string; type: string } | null>(null);

  const showToast = (msg: string, type: string = 'success') => {
    setToast({ msg, type });
    setTimeout(() => setToast(null), 3000);
  };

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      api.get<Record<string, unknown>>('/homepage-settings/flash-banner', { signal: ac.signal }).then(r => r.data).catch(() => ({
        enabled: false, title: 'Limited Time Offer', subtitle: 'Get 40% off annual Pro plan',
        end_date: '', accent_color: '#f59e0b', link_url: '/pricing', link_text: 'Claim Offer',
      })),
      api.get<Record<string, unknown>>('/pricing/lifetime-promo', { signal: ac.signal }).then(r => r.data).catch(() => ({
        enabled: false, promo_price: 149, label: 'Launch Special', end_date: '',
        ab_enabled: false, variant_a: { price: 149, label: 'Launch Special' }, variant_b: { price: 159, label: 'Early Bird' }, ab_split: 50,
      })),
      api.get<Record<string, unknown>>('/admin/ab-results', { signal: ac.signal }).then(r => r.data).catch(() => null),
    ]).then(([banner, promo, ab]) => {
      if (ac.signal.aborted) return;
      setBannerConfig(banner);
      setPromoConfig(promo);
      setAbResults(ab);
    }).finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const saveBanner = async () => {
    setSavingBanner(true);
    try {
      const res = await api.put<Record<string, unknown>>('/homepage-settings/flash-banner', bannerConfig);
      setBannerConfig(res.data);
      showToast('Flash banner saved');
    } catch { showToast('Failed to save', 'error'); }
    finally { setSavingBanner(false); }
  };

  const ub = (key: string, val: unknown) => setBannerConfig((p: Record<string, unknown> | null) => ({ ...p, [key]: val }));
  const up = (key: string, val: unknown) => setPromoConfig((p: Record<string, unknown> | null) => ({ ...p, [key]: val }));

  const savePromo = async () => {
    setSavingPromo(true);
    try {
      const res = await api.put<Record<string, unknown>>('/pricing/lifetime-promo', promoConfig);
      setPromoConfig(res.data);
      showToast('Lifetime promo saved');
      api.get<Record<string, unknown>>('/admin/ab-results').then(r => setAbResults(r.data)).catch(() => {});
    } catch { showToast('Failed to save', 'error'); }
    finally { setSavingPromo(false); }
  };

  const resetAbData = async () => {
    setResettingAb(true);
    try {
      await api.delete('/admin/ab-reset');
      const ab = await api.get<Record<string, unknown>>('/admin/ab-results');
      setAbResults(ab.data);
      showToast('A/B test data reset');
    } catch { showToast('Failed to reset', 'error'); }
    finally { setResettingAb(false); }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#0d1117]">
        <Loader2 size={24} className="animate-spin text-[#8b949e]" />
      </div>
    );
  }

  return (
    <div data-testid="homepage-settings-page" className="min-h-screen bg-[#0d1117] text-white p-6">
      {toast && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-2 px-4 py-3 rounded-lg shadow-lg text-sm font-medium ${
          toast.type === 'error' ? 'bg-red-500/90' : 'bg-emerald-500/90'
        } text-white`}>
          {toast.type === 'error' ? <AlertTriangle size={16} /> : <CheckCircle size={16} />}
          {toast.msg}
        </div>
      )}

      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="settings-back-btn" onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-2xl font-bold flex items-center gap-3">
              <Activity size={24} className="text-[#22c55e]" />
              Homepage Settings
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">Configure flash banner and lifetime promo</p>
          </div>
        </div>

        <div className="space-y-6">
          {/* ═══ FLASH BANNER ═══ */}
          <div className="border border-[#2d333b] rounded-xl overflow-hidden bg-[#161b22]">
            <div className="p-5 border-b border-[#2d333b] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
                  <Zap size={16} className="text-[#f59e0b]" />
                  Flash Banner / Countdown
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">Promotional banner with countdown timer</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-testid="toggle-banner-enabled"
                  onClick={() => ub('enabled', !bannerConfig?.enabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    bannerConfig?.enabled ? 'bg-[#f59e0b]/10 text-[#f59e0b] border-[#f59e0b]/30' : 'bg-[#484f58]/10 text-[#8b949e] border-[#484f58]/30'
                  }`}
                >
                  {bannerConfig?.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                  {bannerConfig?.enabled ? 'Live' : 'Off'}
                </button>
                <button
                  data-testid="save-banner-btn"
                  onClick={saveBanner}
                  disabled={savingBanner}
                  className="flex items-center gap-1.5 text-black font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                  style={{ backgroundColor: '#f59e0b' }}
                  onMouseEnter={e => e.currentTarget.style.backgroundColor = '#d97706'}
                  onMouseLeave={e => e.currentTarget.style.backgroundColor = '#f59e0b'}
                >
                  {savingBanner ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save
                </button>
              </div>
            </div>

            <div className="p-5 space-y-5">
              {/* Preview */}
              <div className="rounded-xl border border-[#2d333b] bg-[#0d1117] overflow-hidden">
                <div className="text-[10px] text-[#484f58] uppercase tracking-wider font-semibold px-3 pt-3">Preview</div>
                {bannerConfig?.enabled ? (
                  <div className="px-3 pb-3 pt-2">
                    <div className="flex items-center justify-center gap-3 flex-wrap py-2 px-4 rounded-lg"
                      style={{ background: `linear-gradient(135deg, ${bannerConfig?.accent_color}10, transparent, ${bannerConfig?.accent_color}10)`, border: `1px solid ${bannerConfig?.accent_color}20` }}>
                      <span style={{ width: 7, height: 7, borderRadius: '50%', backgroundColor: bannerConfig?.accent_color as string, boxShadow: `0 0 6px ${bannerConfig?.accent_color}50` }} />
                      <Zap size={13} style={{ color: bannerConfig?.accent_color as string }} />
                      <span className="text-xs font-bold text-[#c9d1d9]">{bannerConfig?.title as string}</span>
                      {bannerConfig?.subtitle as string && <span className="text-xs text-[#8b949e]">— {bannerConfig?.subtitle as string}</span>}
                      {bannerConfig?.end_date as string && (
                        <div className="flex items-center gap-1 text-[10px] font-bold" style={{ color: bannerConfig?.accent_color as string, fontFamily: "'JetBrains Mono', monospace" }}>
                          <span className="px-1 py-0.5 rounded bg-white/5 border border-white/5">00d</span>
                          <span>:</span>
                          <span className="px-1 py-0.5 rounded bg-white/5 border border-white/5">00h</span>
                          <span>:</span>
                          <span className="px-1 py-0.5 rounded bg-white/5 border border-white/5">00m</span>
                          <span>:</span>
                          <span className="px-1 py-0.5 rounded bg-white/5 border border-white/5">00s</span>
                        </div>
                      )}
                      {bannerConfig?.link_text as string && (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold text-white" style={{ backgroundColor: bannerConfig?.accent_color as string }}>
                          {bannerConfig?.link_text as string} <ArrowRight size={10} />
                        </span>
                      )}
                    </div>
                  </div>
                ) : (
                  <div className="px-3 pb-3 pt-2 text-center"><span className="text-sm text-[#484f58] italic">Banner is off</span></div>
                )}
              </div>

              {/* Fields */}
              <div className="grid grid-cols-2 gap-4">
                <Field label="Title" help="Main headline text">
                  <input data-testid="input-banner-title" type="text" value={bannerConfig?.title as string}
                    onChange={e => ub('title', e.target.value)} className="input-field" />
                </Field>
                <Field label="Subtitle" help="Secondary text (optional)">
                  <input data-testid="input-banner-subtitle" type="text" value={bannerConfig?.subtitle as string}
                    onChange={e => ub('subtitle', e.target.value)} className="input-field" />
                </Field>
                <Field label="End Date/Time" help="Countdown target (leave blank for no timer)">
                  <input data-testid="input-banner-enddate" type="datetime-local" value={bannerConfig?.end_date ? (bannerConfig?.end_date as string).slice(0, 16) : ''}
                    onChange={e => ub('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')}
                    className="input-field" />
                </Field>
                <Field label="Accent Color" help="Banner highlight color">
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1.5">
                      {ACCENT_PRESETS.map(p => (
                        <button key={p.color} data-testid={`color-${p.label.toLowerCase()}`}
                          onClick={() => ub('accent_color', p.color)}
                          className="w-6 h-6 rounded-md border-2 transition-all hover:scale-110"
                          style={{
                            backgroundColor: p.color,
                            borderColor: bannerConfig?.accent_color === p.color ? '#fff' : 'transparent',
                            boxShadow: bannerConfig?.accent_color === p.color ? `0 0 8px ${p.color}50` : 'none',
                          }}
                          title={p.label}
                        />
                      ))}
                    </div>
                    <input data-testid="input-banner-color" type="text" value={bannerConfig?.accent_color as string}
                      onChange={e => ub('accent_color', e.target.value)} className="input-field w-24 text-center" />
                  </div>
                </Field>
                <Field label="Link URL" help="Where the CTA navigates to">
                  <input data-testid="input-banner-linkurl" type="text" value={bannerConfig?.link_url as string}
                    onChange={e => ub('link_url', e.target.value)} className="input-field" placeholder="/pricing" />
                </Field>
                <Field label="CTA Text" help="Button label (leave blank to hide)">
                  <input data-testid="input-banner-linktext" type="text" value={bannerConfig?.link_text as string}
                    onChange={e => ub('link_text', e.target.value)} className="input-field" placeholder="Claim Offer" />
                </Field>
              </div>
            </div>
          </div>

          {/* ═══ LIFETIME PROMO ═══ */}
          {promoConfig && (
          <div className="border border-[#2d333b] rounded-xl overflow-hidden bg-[#161b22]">
            <div className="p-5 border-b border-[#2d333b] flex items-center justify-between">
              <div>
                <h2 className="text-base font-semibold text-[#c9d1d9] flex items-center gap-2">
                  <Zap size={16} className="text-[#ef4444]" />
                  Lifetime Promo
                </h2>
                <p className="text-xs text-[#8b949e] mt-1">Limited-time promotional pricing for the Lifetime plan</p>
              </div>
              <div className="flex items-center gap-2">
                <button
                  data-testid="toggle-promo-enabled"
                  onClick={() => up('enabled', !promoConfig?.enabled)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all border ${
                    promoConfig?.enabled ? 'bg-[#ef4444]/10 text-[#ef4444] border-[#ef4444]/30' : 'bg-[#484f58]/10 text-[#8b949e] border-[#484f58]/30'
                  }`}
                >
                  {promoConfig?.enabled ? <Eye size={13} /> : <EyeOff size={13} />}
                  {promoConfig?.enabled ? 'Active' : 'Inactive'}
                </button>
                <button
                  data-testid="save-promo-btn"
                  onClick={savePromo}
                  disabled={savingPromo}
                  className="flex items-center gap-1.5 bg-[#ef4444] hover:bg-[#dc2626] disabled:opacity-50 text-white font-semibold px-3 py-1.5 rounded-lg text-xs transition-colors"
                >
                  {savingPromo ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                  Save
                </button>
              </div>
            </div>
            <div className="p-5">
              <div className="space-y-4">
                <Field label="Promo Label" help="Displayed on the countdown banner (e.g., 'Launch Special')">
                  <input data-testid="input-promo-label" type="text" value={(promoConfig?.label as string) ?? ''}
                    onChange={e => up('label', e.target.value)} className="input-field" placeholder="Launch Special" />
                </Field>
                <Field label="Promo Price ($)" help="Discounted one-time price (regular: $199)">
                  <input data-testid="input-promo-price" type="number" step="0.01" value={(promoConfig?.promo_price as number) ?? 0}
                    onChange={e => up('promo_price', parseFloat(e.target.value) || 0)} className="input-field" placeholder="149" />
                </Field>
                <Field label="End Date" help="Countdown timer runs until this date. Leave blank for no countdown (promo still active).">
                  <input data-testid="input-promo-enddate" type="datetime-local" value={promoConfig?.end_date ? (promoConfig?.end_date as string).slice(0, 16) : ''}
                    onChange={e => up('end_date', e.target.value ? new Date(e.target.value).toISOString() : '')} className="input-field" />
                </Field>
                {(promoConfig?.enabled as boolean) && (
                  <div className="rounded-lg p-3 border" style={{ backgroundColor: '#ef444410', borderColor: '#ef444430' }}>
                    <p className="text-xs text-[#ef4444] font-semibold">Preview</p>
                    <p className="text-sm text-[#c9d1d9] mt-1">
                      &ldquo;{(promoConfig?.label as string)}&rdquo; &mdash; <span className="line-through text-[#8b949e]">$199</span>{' '}
                      <strong className="text-[#ef4444]">${(promoConfig?.promo_price as number)}</strong> one-time
                      {(promoConfig?.end_date as string) && ` (ends ${new Date(promoConfig?.end_date as string).toLocaleDateString()})`}
                    </p>
                  </div>
                )}

                {/* A/B Testing Section */}
                <div className="border-t border-[#2d333b] pt-4 mt-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <FlaskConical size={14} className="text-[#8b5cf6]" />
                      <span className="text-sm font-semibold text-[#c9d1d9]">A/B Price Test</span>
                    </div>
                    <button
                      data-testid="toggle-ab-enabled"
                      onClick={() => up('ab_enabled', !promoConfig?.ab_enabled)}
                      className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition-all border ${
                        promoConfig?.ab_enabled ? 'bg-[#8b5cf6]/10 text-[#8b5cf6] border-[#8b5cf6]/30' : 'bg-[#484f58]/10 text-[#8b949e] border-[#484f58]/30'
                      }`}
                    >
                      {promoConfig?.ab_enabled ? 'Enabled' : 'Disabled'}
                    </button>
                  </div>
                  {(promoConfig?.ab_enabled as boolean) && (
                    <div className="space-y-3">
                      <div className="grid grid-cols-2 gap-4">
                        <div className="rounded-lg p-3 border" style={{ backgroundColor: '#3b82f610', borderColor: '#3b82f630' }}>
                          <p className="text-[10px] font-bold text-[#3b82f6] mb-2 uppercase tracking-wider">Variant A</p>
                          <Field label="Label">
                            <input data-testid="input-variant-a-label" type="text" value={((promoConfig?.variant_a as Record<string, unknown>)?.label as string) ?? ''}
                              onChange={e => up('variant_a', { ...((promoConfig?.variant_a ?? {}) as Record<string, unknown>), label: e.target.value })} className="input-field" />
                          </Field>
                          <Field label="Price ($)">
                            <input data-testid="input-variant-a-price" type="number" step="0.01" value={((promoConfig?.variant_a as Record<string, unknown>)?.price as number) ?? 149}
                              onChange={e => up('variant_a', { ...((promoConfig?.variant_a ?? {}) as Record<string, unknown>), price: parseFloat(e.target.value) || 0 })} className="input-field" />
                          </Field>
                        </div>
                        <div className="rounded-lg p-3 border" style={{ backgroundColor: '#22c55e10', borderColor: '#22c55e30' }}>
                          <p className="text-[10px] font-bold text-[#22c55e] mb-2 uppercase tracking-wider">Variant B</p>
                          <Field label="Label">
                            <input data-testid="input-variant-b-label" type="text" value={((promoConfig?.variant_b as Record<string, unknown>)?.label as string) ?? ''}
                              onChange={e => up('variant_b', { ...((promoConfig?.variant_b ?? {}) as Record<string, unknown>), label: e.target.value })} className="input-field" />
                          </Field>
                          <Field label="Price ($)">
                            <input data-testid="input-variant-b-price" type="number" step="0.01" value={((promoConfig?.variant_b as Record<string, unknown>)?.price as number) ?? 159}
                              onChange={e => up('variant_b', { ...((promoConfig?.variant_b ?? {}) as Record<string, unknown>), price: parseFloat(e.target.value) || 0 })} className="input-field" />
                          </Field>
                        </div>
                      </div>
                      <Field label="Traffic Split (%)" help={`${(promoConfig?.ab_split as number) ?? 50}% see Variant A, ${100 - ((promoConfig?.ab_split as number) ?? 50)}% see Variant B`}>
                        <input data-testid="input-ab-split" type="range" min="10" max="90" step="5" value={(promoConfig?.ab_split as number) ?? 50}
                          onChange={e => up('ab_split', parseInt(e.target.value))}
                          className="w-full h-1.5 rounded-lg cursor-pointer" style={{ accentColor: '#8b5cf6' }} />
                      </Field>

                      {/* A/B Results */}
                      {abResults && (
                        <div className="rounded-lg border p-3" style={{ backgroundColor: '#0d1117', borderColor: '#2d333b' }}>
                          <div className="flex items-center justify-between mb-2">
                            <p className="text-xs font-semibold text-[#c9d1d9]">Test Results</p>
                            <button
                              data-testid="reset-ab-btn"
                              onClick={resetAbData}
                              disabled={resettingAb}
                              className="flex items-center gap-1 text-[10px] text-[#8b949e] hover:text-[#ef4444] transition-colors"
                            >
                              {resettingAb ? <Loader2 size={10} className="animate-spin" /> : <RotateCcw size={10} />} Reset
                            </button>
                          </div>
                          <table className="w-full text-xs">
                            <thead><tr style={{ color: '#6b7280' }}>
                              <th className="text-left py-1">Variant</th>
                              <th className="text-right py-1">Views</th>
                              <th className="text-right py-1">Clicks</th>
                              <th className="text-right py-1">Rate</th>
                            </tr></thead>
                            <tbody>
                              {(abResults.results as Record<string, unknown>[])?.map((r) => (
                                <tr key={(r.variant as string)} style={{ borderTop: '1px solid #1f2937' }}>
                                  <td className="py-1.5 font-medium" style={{ color: (r.variant as string) === 'A' ? '#3b82f6' : '#22c55e' }}>
                                    {(r.variant as string)} &mdash; ${(r.variant as string) === 'A' ? ((abResults.variant_a as Record<string, unknown>)?.price as number) : ((abResults.variant_b as Record<string, unknown>)?.price as number)}
                                    <span className="text-[10px] ml-1 text-[#6b7280]">&ldquo;{(r.variant as string) === 'A' ? ((abResults.variant_a as Record<string, unknown>)?.label as string) : ((abResults.variant_b as Record<string, unknown>)?.label as string)}&rdquo;</span>
                                  </td>
                                  <td className="text-right py-1.5 text-[#d1d5db]">{(r.unique_impressions as number)}</td>
                                  <td className="text-right py-1.5 text-[#d1d5db]">{(r.unique_conversions as number)}</td>
                                  <td className="text-right py-1.5">
                                    <span className="px-1.5 py-0.5 rounded text-[10px] font-bold" style={{
                                      backgroundColor: (r.conversion_rate as number) > 5 ? '#22c55e20' : (r.conversion_rate as number) > 0 ? '#f59e0b20' : '#374151',
                                      color: (r.conversion_rate as number) > 5 ? '#22c55e' : (r.conversion_rate as number) > 0 ? '#f59e0b' : '#6b7280',
                                    }}>{(r.conversion_rate as number)}%</span>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                          {((abResults.results as Record<string, unknown>[]) ?? [])?.every((r) => (r.unique_impressions as number) === 0) && (
                            <p className="text-center text-[10px] text-[#6b7280] mt-2 py-2">No data yet. Results appear after visitors view the pricing page.</p>
                          )}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
          )}
        </div>
      </div>

      {/* Shared input styles */}
      <style>{`
        .input-field {
          width: 100%;
          background: #0d1117;
          border: 1px solid #2d333b;
          color: #e6edf3;
          border-radius: 8px;
          padding: 8px 12px;
          font-size: 13px;
          outline: none;
          transition: border-color 0.2s;
        }
        .input-field:focus {
          border-color: rgba(34,197,94,0.5);
        }
        .input-field[type="datetime-local"]::-webkit-calendar-picker-indicator {
          filter: invert(0.7);
        }
      `}</style>
    </div>
  );
};

const Field = ({ label, help, children }: { label: string; help?: string; children: React.ReactNode }) => (
  <div>
    <label className="block text-xs text-[#8b949e] font-semibold uppercase tracking-wider mb-2">{label}</label>
    {children}
    {help && <p className="text-[10px] text-[#484f58] mt-1.5">{help}</p>}
  </div>
);

export default HomepageSettings;
