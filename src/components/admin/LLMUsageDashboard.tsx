'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
  ArrowLeft, Activity, DollarSign, Zap, Hash, Loader2,
  ChevronLeft, ChevronRight, Database, RefreshCw,
  Bell, BellOff, AlertTriangle, Check, Settings,
} from 'lucide-react';

const PROVIDER_COLORS: Record<string, string> = {
  openai: '#10a37f',
  anthropic: '#d4a274',
  google: '#4285f4',
  emergent: '#22c55e',
};
const PIE_COLORS = ['#10a37f', '#d4a274', '#4285f4', '#22c55e', '#8b5cf6', '#ef4444'];

const StatCard = ({ icon: Icon, label, value, sub, color }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; sub?: string; color: string }) => (
  <div
    data-testid={`usage-stat-${label.toLowerCase().replace(/\s+/g, '-')}`}
    className="border border-[#2d333b] rounded-xl p-5"
    style={{ backgroundColor: '#161b22' }}
  >
    <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${color}18` }}>
      <Icon size={18} style={{ color }} />
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-[#8b949e] mt-1">{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </div>
);

interface UsageStats {
  totals: { total_calls: number; total_tokens: number; total_input_tokens: number; total_output_tokens: number; total_cost: number };
  daily: { date: string; calls: number; tokens: number; cost: number }[];
  by_provider: { provider: string; cost: number }[];
  by_feature: { label: string; calls: number; cost: number }[];
  by_key: { key_id: string; label: string; provider: string; calls: number; cost: number }[];
}
interface LogEntry { timestamp: string; provider: string; model: string; feature: string; input_tokens: number; output_tokens: number; estimated_cost: number; }
interface LogsData { logs: LogEntry[]; total: number; page: number; pages: number; }

const LLMUsageDashboard = () => {
  const navigate = useRouter();

  const [days, setDays] = useState(30);
  const [stats, setStats] = useState<UsageStats | null>(null);
  const [logs, setLogs] = useState<LogsData>({ logs: [], total: 0, page: 1, pages: 1 });
  const [logPage, setLogPage] = useState(1);
  const [logFilter, setLogFilter] = useState<{ provider: string; feature: string }>({ provider: '', feature: '' });
  const [loading, setLoading] = useState<boolean>(true);
  const [seeding, setSeeding] = useState<boolean>(false);
  const [alertConfig, setAlertConfig] = useState<{ enabled: boolean; monthly_threshold: number; threshold_breached: boolean; current_month: string; current_month_cost: number } | null>(null);
  const [alertHistory, setAlertHistory] = useState<{ month: string; threshold: number; actual_cost: number; triggered_at: string }[]>([]);
  const [editingThreshold, setEditingThreshold] = useState<boolean>(false);
  const [thresholdInput, setThresholdInput] = useState<string>('');
  const [savingAlert, setSavingAlert] = useState<boolean>(false);

  const loadStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<UsageStats>(`/admin/llm-keys/usage?days=${days}`, { signal });
      if (signal?.aborted) return;
      setStats(res.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
  }, [days]);

  const loadLogs = useCallback(async (signal?: AbortSignal) => {
    try {
      const params = new URLSearchParams({ page: logPage.toString(), limit: '25', days: days.toString() });
      if (logFilter.provider) params.set('provider', logFilter.provider);
      if (logFilter.feature) params.set('feature', logFilter.feature);
      const res = await api.get<LogsData>(`/admin/llm-keys/usage/logs?${params}`, { signal });
      if (signal?.aborted) return;
      setLogs(res.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
  }, [logPage, days, logFilter]);

  const loadAlerts = useCallback(async (signal?: AbortSignal) => {
    try {
      const [configRes, historyRes] = await Promise.all([
        api.get<{ enabled: boolean; monthly_threshold: number; threshold_breached: boolean; current_month: string; current_month_cost: number }>('/admin/llm-keys/alerts/config', { signal }),
        api.get<{ alerts: { month: string; threshold: number; actual_cost: number; triggered_at: string }[] }>('/admin/llm-keys/alerts/history', { signal }),
      ]);
      if (signal?.aborted) return;
      setAlertConfig(configRes.data);
      setAlertHistory(historyRes.data.alerts || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setLoading(true);
    Promise.all([loadStats(ac.signal), loadLogs(ac.signal), loadAlerts(ac.signal)]).finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, [loadStats, loadLogs, loadAlerts]);

  const seedDemo = async () => {
    setSeeding(true);
    try {
      await api.post('/admin/llm-keys/usage/seed-demo');
      await Promise.all([loadStats(), loadLogs(), loadAlerts()]);
    } catch (err) {
      handleApiError(err);
    } finally {
      setSeeding(false);
    }
  };

  const saveThreshold = async () => {
    const val = parseFloat(thresholdInput);
    if (isNaN(val) || val <= 0) return;
    setSavingAlert(true);
    try {
      await api.put('/admin/llm-keys/alerts/config', { enabled: true, monthly_threshold: val });
      setEditingThreshold(false);
      await loadAlerts();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSavingAlert(false);
    }
  };

  const toggleAlertEnabled = async () => {
    if (!alertConfig) return;
    setSavingAlert(true);
    try {
      await api.put('/admin/llm-keys/alerts/config', {
        enabled: !alertConfig.enabled,
        monthly_threshold: alertConfig.monthly_threshold || 10,
      });
      await loadAlerts();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSavingAlert(false);
    }
  };

  const fmt = (n: number): string => {
    if (n >= 1_000_000) return `${(n / 1_000_000).toFixed(1)}M`;
    if (n >= 1_000) return `${(n / 1_000).toFixed(1)}K`;
    return String(n);
  };

  const fmtCost = (n: number): string => `$${Number(n || 0).toFixed(4)}`;

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const t = stats?.totals || {};
  const daily = stats?.daily || [];
  const byProvider = stats?.by_provider || [];
  const byFeature = stats?.by_feature || [];
  const byKey = stats?.by_key || [];
  const isEmpty = t.total_calls === 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="usage-back-btn" onClick={() => navigate.push('/admin/dashboard/llm-keys')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="usage-dashboard-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity size={22} className="text-[#3b82f6]" /> LLM Usage Dashboard
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">Track API calls, tokens, and estimated costs across all providers</p>
          </div>
          <div className="flex items-center gap-2">
            {[7, 30, 90].map(d => (
              <button
                key={d}
                data-testid={`days-filter-${d}`}
                onClick={() => setDays(d)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                  days === d
                    ? 'bg-[#3b82f618] border-[#3b82f650] text-[#3b82f6]'
                    : 'bg-[#161b22] border-[#2d333b] text-[#8b949e] hover:border-[#444c56]'
                }`}
              >
                {d}d
              </button>
            ))}
          </div>
        </div>

        {/* Empty state with seed button */}
        {isEmpty && (
          <div className="border border-[#2d333b] rounded-xl p-12 text-center mb-8" style={{ backgroundColor: '#161b22' }}>
            <Database size={40} className="mx-auto mb-3 text-[#484f58]" />
            <p className="text-[#8b949e] mb-1">No usage data yet</p>
            <p className="text-xs text-[#484f58] mb-4">Usage is logged automatically when AI features are used. You can seed demo data to preview the dashboard.</p>
            <button
              data-testid="seed-demo-btn"
              onClick={seedDemo}
              disabled={seeding}
              className="inline-flex items-center gap-2 bg-[#3b82f6] hover:bg-[#2563eb] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-50"
            >
              {seeding ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
              Seed Demo Data (200 entries)
            </button>
          </div>
        )}

        {/* Stats Grid */}
        {!isEmpty && (
          <>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
              <StatCard icon={Hash} label="Total API Calls" value={fmt(t.total_calls)} color="#3b82f6" />
              <StatCard icon={Zap} label="Total Tokens" value={fmt(t.total_tokens)} sub={`${fmt(t.total_input_tokens)} in / ${fmt(t.total_output_tokens)} out`} color="#f59e0b" />
              <StatCard icon={DollarSign} label="Estimated Cost" value={fmtCost(t.total_cost)} color="#22c55e" />
              <StatCard icon={Activity} label="Active Keys" value={byKey.length} sub={`${byProvider.length} providers`} color="#8b5cf6" />
            </div>

            {/* Cost Alert Card */}
            {alertConfig && (
              <div
                data-testid="cost-alert-card"
                className={`border rounded-xl p-5 mb-8 ${
                  alertConfig.threshold_breached
                    ? 'border-[#ef444450] bg-[#ef444408]'
                    : alertConfig.enabled && alertConfig.monthly_threshold > 0
                      ? 'border-[#2d333b] bg-[#161b22]'
                      : 'border-[#2d333b] bg-[#161b22]'
                }`}
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${
                      alertConfig.threshold_breached ? 'bg-[#ef444418]' : 'bg-[#f59e0b18]'
                    }`}>
                      {alertConfig.threshold_breached
                        ? <AlertTriangle size={18} className="text-[#ef4444]" />
                        : <Bell size={18} className="text-[#f59e0b]" />
                      }
                    </div>
                    <div>
                      <h3 className="text-sm font-medium text-[#c9d1d9]">Monthly Cost Alert</h3>
                      <p className="text-xs text-[#8b949e]">
                        {alertConfig.enabled
                          ? `Threshold: $${alertConfig.monthly_threshold} / month`
                          : 'Alerts are disabled'}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {!editingThreshold && (
                      <>
                        <button
                          data-testid="toggle-alert-btn"
                          onClick={toggleAlertEnabled}
                          disabled={savingAlert}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                            alertConfig.enabled
                              ? 'bg-[#22c55e18] border-[#22c55e50] text-[#22c55e]'
                              : 'bg-[#161b22] border-[#2d333b] text-[#8b949e]'
                          }`}
                        >
                          {alertConfig.enabled ? <Bell size={12} /> : <BellOff size={12} />}
                          {alertConfig.enabled ? 'On' : 'Off'}
                        </button>
                        <button
                          data-testid="edit-threshold-btn"
                          onClick={() => { setEditingThreshold(true); setThresholdInput(String(alertConfig.monthly_threshold || 10)); }}
                          className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border border-[#2d333b] text-[#8b949e] hover:border-[#444c56] transition-all"
                        >
                          <Settings size={12} /> Set Threshold
                        </button>
                      </>
                    )}
                  </div>
                </div>

                {/* Threshold Editor */}
                {editingThreshold && (
                  <div data-testid="threshold-editor" className="flex items-center gap-3 mb-4 p-3 rounded-lg bg-[#0d1117] border border-[#2d333b]">
                    <span className="text-sm text-[#8b949e]">$</span>
                    <input
                      data-testid="threshold-input"
                      type="number"
                      min="0.01"
                      step="0.5"
                      value={thresholdInput}
                      onChange={e => setThresholdInput(e.target.value)}
                      className="w-28 bg-transparent border border-[#2d333b] rounded-lg px-3 py-1.5 text-sm text-[#c9d1d9] font-mono focus:border-[#f59e0b] focus:outline-none"
                      placeholder="10.00"
                    />
                    <span className="text-xs text-[#484f58]">per month</span>
                    <button
                      data-testid="save-threshold-btn"
                      onClick={saveThreshold}
                      disabled={savingAlert}
                      className="flex items-center gap-1 bg-[#f59e0b] hover:bg-[#d97706] text-black px-3 py-1.5 rounded-lg text-xs font-medium transition-colors disabled:opacity-50"
                    >
                      {savingAlert ? <Loader2 size={12} className="animate-spin" /> : <Check size={12} />} Save
                    </button>
                    <button
                      onClick={() => setEditingThreshold(false)}
                      className="text-xs text-[#8b949e] hover:text-white px-2 py-1.5"
                    >Cancel</button>
                  </div>
                )}

                {/* Progress Bar */}
                {alertConfig.enabled && alertConfig.monthly_threshold > 0 && (
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#8b949e]">{alertConfig.current_month}</span>
                      <span className="text-xs font-mono text-[#c9d1d9]">
                        ${Number(alertConfig.current_month_cost).toFixed(4)} / ${alertConfig.monthly_threshold.toFixed(2)}
                      </span>
                    </div>
                    <div className="w-full h-2.5 rounded-full bg-[#0d1117] overflow-hidden">
                      {(() => {
                        const pct = Math.min(100, (alertConfig.current_month_cost / alertConfig.monthly_threshold) * 100);
                        const color = pct >= 100 ? '#ef4444' : pct >= 75 ? '#f59e0b' : '#22c55e';
                        return <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />;
                      })()}
                    </div>
                    <div className="flex items-center justify-between mt-1.5">
                      <span className="text-xs text-[#484f58]">
                        {Math.min(100, Math.round((alertConfig.current_month_cost / alertConfig.monthly_threshold) * 100))}% used
                      </span>
                      {alertConfig.threshold_breached && (
                        <span data-testid="breach-badge" className="text-xs text-[#ef4444] flex items-center gap-1">
                          <AlertTriangle size={11} /> Threshold exceeded
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Alert History */}
                {alertHistory.length > 0 && (
                  <div className="mt-4 pt-3 border-t border-[#2d333b]">
                    <p className="text-xs text-[#8b949e] mb-2">Alert History</p>
                    <div className="space-y-1.5">
                      {alertHistory.slice(0, 5).map((a, i: number) => (
                        <div key={i} data-testid={`alert-history-${i}`} className="flex items-center justify-between text-xs">
                          <span className="text-[#ef4444] flex items-center gap-1">
                            <AlertTriangle size={10} /> {a.month} — exceeded ${a.threshold}
                          </span>
                          <span className="text-[#8b949e] font-mono">
                            Actual: ${Number(a.actual_cost).toFixed(4)} &middot; {a.triggered_at ? new Date(a.triggered_at).toLocaleDateString() : ''}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
              {/* Daily Usage Trend */}
              <div className="lg:col-span-2 border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Daily Usage Trend ({days}d)</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <AreaChart data={daily}>
                    <defs>
                      <linearGradient id="usageG" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
                    <YAxis tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }}
                      formatter={(val: number, name: string) => [name === 'cost' ? fmtCost(val) : fmt(val), name === 'calls' ? 'Calls' : name === 'tokens' ? 'Tokens' : 'Cost'] as [string, string]}
                    />
                    <Area type="monotone" dataKey="calls" stroke="#3b82f6" fill="url(#usageG)" strokeWidth={2} />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* Cost by Provider Pie */}
              <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Cost by Provider</h3>
                {byProvider.length > 0 ? (
                  <>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie
                          data={byProvider.map((p: { provider: string; cost: number }) => ({ name: p.provider, value: p.cost }))}
                          cx="50%" cy="50%" innerRadius={40} outerRadius={65}
                          dataKey="value" strokeWidth={0}
                        >
                          {byProvider.map((p: { provider: string; cost: number }, i: number) => (
                            <Cell key={p.provider} fill={PROVIDER_COLORS[p.provider] || PIE_COLORS[i % PIE_COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip
                          contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }}
                          formatter={(val: number) => [fmtCost(val), 'Cost'] as [string, string]}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                    <div className="flex flex-wrap gap-3 mt-3 justify-center">
                       {byProvider.map((p: { provider: string; cost: number }, i: number) => (
                        <div key={p.provider} className="flex items-center gap-1.5">
                          <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[p.provider] || PIE_COLORS[i] }} />
                          <span className="text-xs text-[#8b949e] capitalize">{p.provider}: {fmtCost(p.cost)}</span>
                        </div>
                      ))}
                    </div>
                  </>
                ) : (
                  <p className="text-sm text-[#484f58] py-8 text-center">No data</p>
                )}
              </div>
            </div>

            {/* Calls by Feature Bar Chart + Per-Key Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
              {/* By Feature */}
              <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Calls by Feature</h3>
                <ResponsiveContainer width="100%" height={220}>
                  <BarChart data={byFeature} layout="vertical">
                    <XAxis type="number" tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
                    <YAxis dataKey="label" type="category" tick={{ fontSize: 10, fill: '#8b949e' }} width={120} />
                    <Tooltip
                      contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }}
                      formatter={(val: number, name: string) => [name === 'cost' ? fmtCost(val) : fmt(val), name === 'calls' ? 'Calls' : 'Cost'] as [string, string]}
                    />
                    <Bar dataKey="calls" fill="#3b82f6" radius={[0, 4, 4, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>

              {/* Per Key Breakdown */}
              <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Usage by API Key</h3>
                <div className="space-y-3">
                  {byKey.map((k: { key_id: string; label: string; provider: string; calls: number; cost: number }, i: number) => (
                    <div key={k.key_id} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                      <div className="flex items-center gap-3">
                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: PROVIDER_COLORS[k.provider] || PIE_COLORS[i] }} />
                        <div>
                          <span className="text-sm text-[#c9d1d9]">{k.label}</span>
                          <span className="text-xs text-[#484f58] ml-2 capitalize">{k.provider}</span>
                        </div>
                      </div>
                      <div className="flex items-center gap-4 text-right">
                        <span className="text-xs text-[#8b949e]">{fmt(k.calls)} calls</span>
                        <span className="text-xs font-mono text-[#22c55e]">{fmtCost(k.cost)}</span>
                      </div>
                    </div>
                  ))}
                  {byKey.length === 0 && <p className="text-sm text-[#484f58] py-4 text-center">No key data</p>}
                </div>
              </div>
            </div>

            {/* Raw Logs Table */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-medium text-[#c9d1d9]">API Call Logs</h3>
                <div className="flex items-center gap-2">
                  <select
                    data-testid="log-filter-provider"
                    value={logFilter.provider}
                    onChange={e => { setLogFilter(f => ({ ...f, provider: e.target.value })); setLogPage(1); }}
                    className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-2 py-1 text-xs text-[#c9d1d9]"
                  >
                    <option value="">All Providers</option>
                    <option value="openai">OpenAI</option>
                    <option value="anthropic">Anthropic</option>
                    <option value="google">Google</option>
                    <option value="emergent">Emergent</option>
                  </select>
                  <select
                    data-testid="log-filter-feature"
                    value={logFilter.feature}
                    onChange={e => { setLogFilter(f => ({ ...f, feature: e.target.value })); setLogPage(1); }}
                    className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-2 py-1 text-xs text-[#c9d1d9]"
                  >
                    <option value="">All Features</option>
                    <option value="ai_tutor">AI Tutor</option>
                    <option value="quiz_generation">Quiz Generation</option>
                    <option value="course_generation">Course Generation</option>
                    <option value="system_design_evaluator">System Design Evaluator</option>
                    <option value="final_evaluation">Final Evaluation</option>
                    <option value="db_schema_evaluator">DB Schema Evaluator</option>
                  </select>
                </div>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="text-[#8b949e] border-b border-[#2d333b]">
                      <th className="text-left py-2 px-2 font-medium">Timestamp</th>
                      <th className="text-left py-2 px-2 font-medium">Provider</th>
                      <th className="text-left py-2 px-2 font-medium">Model</th>
                      <th className="text-left py-2 px-2 font-medium">Feature</th>
                      <th className="text-right py-2 px-2 font-medium">Input</th>
                      <th className="text-right py-2 px-2 font-medium">Output</th>
                      <th className="text-right py-2 px-2 font-medium">Cost</th>
                    </tr>
                  </thead>
                  <tbody>
                    {logs.logs.map((log: LogEntry, i: number) => (
                      <tr key={i} className="border-b border-[#2d333b]/40 hover:bg-[#1c2333] transition-colors">
                        <td className="py-2 px-2 text-[#8b949e] font-mono">{log.timestamp ? new Date(log.timestamp).toLocaleString() : '-'}</td>
                        <td className="py-2 px-2">
                          <span className="capitalize" style={{ color: PROVIDER_COLORS[log.provider] || '#8b949e' }}>{log.provider}</span>
                        </td>
                        <td className="py-2 px-2 text-[#c9d1d9] font-mono">{log.model || '-'}</td>
                        <td className="py-2 px-2 text-[#c9d1d9]">{log.feature}</td>
                        <td className="py-2 px-2 text-right text-[#8b949e] font-mono">{fmt(log.input_tokens)}</td>
                        <td className="py-2 px-2 text-right text-[#8b949e] font-mono">{fmt(log.output_tokens)}</td>
                        <td className="py-2 px-2 text-right text-[#22c55e] font-mono">{fmtCost(log.estimated_cost)}</td>
                      </tr>
                    ))}
                    {logs.logs.length === 0 && (
                      <tr><td colSpan={7} className="py-6 text-center text-[#484f58]">No logs found</td></tr>
                    )}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {logs.pages > 1 && (
                <div className="flex items-center justify-between mt-4 pt-3 border-t border-[#2d333b]">
                  <span className="text-xs text-[#8b949e]">{logs.total} total entries</span>
                  <div className="flex items-center gap-2">
                    <button
                      data-testid="logs-prev-page"
                      onClick={() => setLogPage(p => Math.max(1, p - 1))}
                      disabled={logPage <= 1}
                      className="p-1 text-[#8b949e] hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronLeft size={16} />
                    </button>
                    <span className="text-xs text-[#8b949e]">{logPage} / {logs.pages}</span>
                    <button
                      data-testid="logs-next-page"
                      onClick={() => setLogPage(p => Math.min(logs.pages, p + 1))}
                      disabled={logPage >= logs.pages}
                      className="p-1 text-[#8b949e] hover:text-white disabled:opacity-30 transition-colors"
                    >
                      <ChevronRight size={16} />
                    </button>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default LLMUsageDashboard;
