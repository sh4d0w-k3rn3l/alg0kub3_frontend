'use client';
import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError, showConfirm } from '@/lib/toast';
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer,
  BarChart, Bar, CartesianGrid,
} from 'recharts';
import {
  ArrowLeft, Activity, Clock, Zap, AlertTriangle,
  RefreshCw, Trash2, Loader2, TrendingUp, Server,
  ChevronDown, ChevronUp,
} from 'lucide-react';

const MetricCard = ({ icon: Icon, label, value, sub, color, testId }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: string | number; sub?: string; color: string; testId?: string }) => (
  <div
    data-testid={testId}
    className="border border-[#2d333b] rounded-xl p-5 transition-all hover:border-[#444c56]"
    style={{ backgroundColor: '#161b22' }}
  >
    <div className="flex items-center gap-3 mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <Icon size={18} style={{ color }} />
      </div>
      <span className="text-xs text-[#8b949e] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white font-mono">{value}</p>
    {sub && <p className="text-xs mt-1.5" style={{ color }}>{sub}</p>}
  </div>
);

interface TooltipPayloadItem { color: string; name: string; value: number | string; dataKey: string; }

const CustomTooltip = ({ active, payload, label }: { active?: boolean; payload?: TooltipPayloadItem[]; label?: string }) => {
  if (!active || !payload?.length) return null;
  return (
    <div className="border border-[#2d333b] rounded-lg px-3 py-2 text-xs" style={{ backgroundColor: '#161b22' }}>
      <p className="text-[#8b949e] mb-1">{label}</p>
      {(payload as TooltipPayloadItem[]).map((p, i) => (
        <p key={i} style={{ color: p.color }} className="font-mono">
          {p.name}: {typeof p.value === 'number' ? p.value.toLocaleString() : p.value}
          {p.name.includes('ms') || p.dataKey.includes('ms') ? 'ms' : ''}
        </p>
      ))}
    </div>
  );
};

interface MetricsOverview { total_requests?: number; avg_ms?: number; p95_ms?: number; max_ms?: number; error_rate?: number; total_errors?: number; status_2xx?: number; status_4xx?: number; status_5xx?: number; }
interface SlowEndpoint { path: string; method: string; avg_ms: number; max_ms: number; min_ms: number; total_requests: number; error_count: number; }
interface TrendPoint { time: string; avg_ms: number; max_ms: number; requests: number; errors: number; }

const RANGES = [
  { label: '1h', hours: 1 },
  { label: '6h', hours: 6 },
  { label: '24h', hours: 24 },
  { label: '7d', hours: 168 },
  { label: '30d', hours: 720 },
];

const ApiMonitoring = () => {
  const navigate = useRouter();
  
  const [hours, setHours] = useState<number>(24);
  const [overview, setOverview] = useState<MetricsOverview | null>(null);
  const [slowEndpoints, setSlowEndpoints] = useState<SlowEndpoint[]>([]);
  const [trends, setTrends] = useState<TrendPoint[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [autoRefresh, setAutoRefresh] = useState<boolean>(false);
  const [sortField, setSortField] = useState<keyof SlowEndpoint>('avg_ms');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('desc');
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const fetchData = useCallback(async (silent = false, signal?: AbortSignal) => {
    if (!silent) setLoading(true);
    else setRefreshing(true);
    try {
      const [ovRes, slowRes, trendRes] = await Promise.all([
        api.get<MetricsOverview>(`/admin/api-metrics/overview?hours=${hours}`, { signal }),
        api.get<SlowEndpoint[]>(`/admin/api-metrics/slow-endpoints?hours=${hours}&limit=20`, { signal }),
        api.get<TrendPoint[]>(`/admin/api-metrics/trends?hours=${hours}`, { signal }),
      ]);
      if (signal?.aborted) return;
      setOverview(ovRes.data);
      setSlowEndpoints(slowRes.data);
      setTrends(trendRes.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) {
        setLoading(false);
        setRefreshing(false);
      }
    }
  }, [hours]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchData(undefined, ac.signal);
    return () => ac.abort();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [hours]);

  useEffect(() => {
    const ac = new AbortController();
    if (autoRefresh) {
      intervalRef.current = setInterval(() => fetchData(true, ac.signal), 15000);
    }
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      ac.abort();
    };
  }, [autoRefresh, fetchData]);

  const handleClear = async () => {
    if (!(await showConfirm('Clear all API metrics data? This cannot be undone.'))) return;
    try {
      await api.post<Record<string, unknown>>('/admin/api-metrics/clear');
      await fetchData();
    } catch (err) { handleApiError(err); }
  };

  const sorted = [...slowEndpoints].sort((a, b) => {
    const av = (a[sortField] ?? 0) as number;
    const bv = (b[sortField] ?? 0) as number;
    return sortDir === 'desc' ? bv - av : av - bv;
  });

  const toggleSort = (field: keyof SlowEndpoint) => {
    if (sortField === field) setSortDir(d => d === 'desc' ? 'asc' : 'desc');
    else { setSortField(field); setSortDir('desc'); }
  };

  const SortIcon = ({ field }: { field: keyof SlowEndpoint }) => {
    if (sortField !== field) return null;
    return sortDir === 'desc' ? <ChevronDown size={12} /> : <ChevronUp size={12} />;
  };

  const formatTime = (t: string) => {
    if (!t) return '';
    try {
      const d = new Date(t.includes('+') || t.endsWith('Z') ? t : t + 'Z');
      if (isNaN(d.getTime())) return t.slice(11, 16) || t;
      if (hours <= 48) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
      return d.toLocaleDateString([], { month: 'short', day: 'numeric' });
    } catch { return t.slice(11, 16) || t; }
  };

  const getLatencyColor = (ms: number) => {
    if (ms < 100) return '#22c55e';
    if (ms < 300) return '#f59e0b';
    if (ms < 1000) return '#f97316';
    return '#ef4444';
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="api-metrics-back" onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="api-metrics-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <Activity size={22} className="text-[#22c55e]" /> API Monitoring
            </h1>
            <p className="text-sm text-[#8b949e]">Endpoint latency, throughput &amp; error tracking</p>
          </div>

          {/* Time range picker */}
          <div className="flex items-center gap-1 bg-[#161b22] border border-[#2d333b] rounded-lg p-1">
            {RANGES.map(r => (
              <button
                key={r.hours}
                data-testid={`range-${r.label}`}
                onClick={() => setHours(r.hours)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors ${
                  hours === r.hours ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] hover:text-white'
                }`}
              >
                {r.label}
              </button>
            ))}
          </div>

          {/* Auto-refresh toggle */}
          <button
            data-testid="auto-refresh-toggle"
            onClick={() => setAutoRefresh(a => !a)}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-colors ${
              autoRefresh
                ? 'border-[#22c55e]/40 text-[#22c55e] bg-[#22c55e]/10'
                : 'border-[#2d333b] text-[#8b949e] hover:text-white'
            }`}
          >
            <RefreshCw size={12} className={autoRefresh ? 'animate-spin' : ''} />
            {autoRefresh ? 'Live' : 'Auto'}
          </button>

          <button
            data-testid="refresh-metrics"
            onClick={() => fetchData(true)}
            disabled={refreshing}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#2d333b] text-[#8b949e] hover:text-white transition-colors"
          >
            <RefreshCw size={12} className={refreshing ? 'animate-spin' : ''} /> Refresh
          </button>

          <button
            data-testid="clear-metrics"
            onClick={handleClear}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors"
          >
            <Trash2 size={12} /> Clear
          </button>
        </div>

        {/* Overview Cards */}
        <div data-testid="metrics-overview" className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-4 mb-8">
          <MetricCard
            testId="metric-total-requests"
            icon={TrendingUp} label="Total Requests" color="#3b82f6"
            value={overview?.total_requests?.toLocaleString() || '0'}
            sub={`Last ${hours}h`}
          />
          <MetricCard
            testId="metric-avg-latency"
            icon={Clock} label="Avg Latency" color="#22c55e"
            value={`${overview?.avg_ms || 0}ms`}
            sub={(overview?.avg_ms ?? 0) < 200 ? 'Healthy' : (overview?.avg_ms ?? 0) < 500 ? 'Moderate' : 'Slow'}
          />
          <MetricCard
            testId="metric-p95-latency"
            icon={Zap} label="P95 Latency" color="#f59e0b"
            value={`${overview?.p95_ms || 0}ms`}
            sub={`Max: ${overview?.max_ms || 0}ms`}
          />
          <MetricCard
            testId="metric-error-rate"
            icon={AlertTriangle} label="Error Rate" color="#ef4444"
            value={`${overview?.error_rate || 0}%`}
            sub={`${overview?.total_errors || 0} errors / ${overview?.status_5xx || 0} 5xx`}
          />
          <MetricCard
            testId="metric-status-breakdown"
            icon={Server} label="Status Breakdown" color="#8b5cf6"
            value={`${overview?.status_2xx || 0} OK`}
            sub={`${overview?.status_4xx || 0} 4xx / ${overview?.status_5xx || 0} 5xx`}
          />
        </div>

        {/* Latency Trend Chart */}
        <div className="border border-[#2d333b] rounded-xl p-6 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h2 data-testid="latency-trend-title" className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <Activity size={16} className="text-[#22c55e]" /> Latency Trend
          </h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={trends}>
                <defs>
                  <linearGradient id="avgGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="maxGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.2} />
                    <stop offset="95%" stopColor="#f59e0b" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                <XAxis dataKey="time" tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={formatTime} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={v => `${v}ms`} />
                <Tooltip content={<CustomTooltip />} />
                <Area type="monotone" dataKey="avg_ms" name="Avg ms" stroke="#22c55e" fill="url(#avgGrad)" strokeWidth={2} />
                <Area type="monotone" dataKey="max_ms" name="Max ms" stroke="#f59e0b" fill="url(#maxGrad)" strokeWidth={1.5} strokeDasharray="4 2" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-48 flex items-center justify-center text-[#484f58] text-sm">
              No data for this time range. Metrics are collected as requests come in.
            </div>
          )}
        </div>

        {/* Request Volume Chart */}
        <div className="border border-[#2d333b] rounded-xl p-6 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h2 data-testid="volume-chart-title" className="text-base font-semibold text-white mb-4 flex items-center gap-2">
            <TrendingUp size={16} className="text-[#3b82f6]" /> Request Volume
          </h2>
          {trends.length > 0 ? (
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={trends}>
                <CartesianGrid strokeDasharray="3 3" stroke="#2d333b" />
                <XAxis dataKey="time" tick={{ fill: '#8b949e', fontSize: 11 }} tickFormatter={formatTime} />
                <YAxis tick={{ fill: '#8b949e', fontSize: 11 }} />
                <Tooltip content={<CustomTooltip />} />
                <Bar dataKey="requests" name="Requests" fill="#3b82f6" radius={[3, 3, 0, 0]} />
                <Bar dataKey="errors" name="Errors" fill="#ef4444" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-36 flex items-center justify-center text-[#484f58] text-sm">
              No data available yet.
            </div>
          )}
        </div>

        {/* Slow Endpoints Table */}
        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          <div className="px-6 py-4 border-b border-[#2d333b] flex items-center justify-between">
            <h2 data-testid="slow-endpoints-title" className="text-base font-semibold text-white flex items-center gap-2">
              <Clock size={16} className="text-[#f59e0b]" /> Endpoint Performance
            </h2>
            <span className="text-xs text-[#8b949e]">{sorted.length} endpoints tracked</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-[#2d333b] text-[#8b949e] text-xs uppercase tracking-wider">
                  <th className="text-left px-6 py-3">Endpoint</th>
                  {[
                    { key: 'avg_ms', label: 'Avg' },
                    { key: 'max_ms', label: 'Max' },
                    { key: 'min_ms', label: 'Min' },
                    { key: 'total_requests', label: 'Requests' },
                    { key: 'error_count', label: 'Errors' },
                  ].map(col => (
                    <th
                      key={col.key}
                      data-testid={`sort-${col.key}`}
                      onClick={() => toggleSort(col.key as keyof SlowEndpoint)}
                      className="text-right px-4 py-3 cursor-pointer hover:text-white transition-colors"
                    >
                      <span className="inline-flex items-center gap-1">
                        {col.label} <SortIcon field={col.key as keyof SlowEndpoint} />
                      </span>
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {sorted.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="text-center py-12 text-[#484f58]">
                      No endpoint data collected yet. Browse the app to generate metrics.
                    </td>
                  </tr>
                ) : (
                  sorted.map((ep, i) => (
                    <tr key={i} data-testid={`endpoint-row-${i}`} className="border-b border-[#2d333b]/50 hover:bg-[#1c2128] transition-colors">
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-2">
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            ep.method === 'GET' ? 'bg-[#22c55e]/15 text-[#22c55e]' :
                            ep.method === 'POST' ? 'bg-[#3b82f6]/15 text-[#3b82f6]' :
                            ep.method === 'PUT' ? 'bg-[#f59e0b]/15 text-[#f59e0b]' :
                            ep.method === 'DELETE' ? 'bg-[#ef4444]/15 text-[#ef4444]' :
                            'bg-[#8b949e]/15 text-[#8b949e]'
                          }`}>
                            {ep.method}
                          </span>
                          <span className="text-[#c9d1d9] font-mono text-xs">{ep.path}</span>
                        </div>
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-xs" style={{ color: getLatencyColor(ep.avg_ms) }}>
                        {ep.avg_ms}ms
                      </td>
                      <td className="text-right px-4 py-3 font-mono text-xs text-[#8b949e]">{ep.max_ms}ms</td>
                      <td className="text-right px-4 py-3 font-mono text-xs text-[#8b949e]">{ep.min_ms}ms</td>
                      <td className="text-right px-4 py-3 font-mono text-xs text-[#c9d1d9]">{ep.total_requests.toLocaleString()}</td>
                      <td className="text-right px-4 py-3 font-mono text-xs">
                        <span className={ep.error_count > 0 ? 'text-[#ef4444]' : 'text-[#484f58]'}>
                          {ep.error_count}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Latency Legend */}
        <div className="flex items-center gap-6 mt-4 text-xs text-[#8b949e]">
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#22c55e]" /> &lt;100ms Fast</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f59e0b]" /> 100-300ms OK</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#f97316]" /> 300-1000ms Slow</span>
          <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-[#ef4444]" /> &gt;1000ms Critical</span>
        </div>
      </div>
    </div>
  );
};

export default ApiMonitoring;
