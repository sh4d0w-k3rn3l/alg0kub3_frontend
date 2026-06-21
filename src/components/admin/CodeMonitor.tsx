'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Terminal, CheckCircle, XCircle, Clock, Loader2 } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';

interface CodeMonitorData {
  period_executions?: number; period_success?: number; period_failed?: number; success_rate?: number;
  trend?: { date: string; total: number; success: number }[];
  by_language?: { language: string; count: number; success_rate: number; avg_time_ms: number }[];
  recent_runs?: { success: boolean; language: string; execution_time_ms: number; executed_at?: string }[];
}

const CodeMonitor = () => {
  const [data, setData] = useState<CodeMonitorData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [days, setDays] = useState(30);
  const navigate = useRouter();
  
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    api.get<CodeMonitorData>(`/admin/code-monitor?days=${days}`, { signal })
      .then(res => { if (!signal?.aborted) setData(res.data); })
      .catch(err => { if ((err as DOMException)?.name !== 'AbortError') handleApiError(err); })
      .finally(() => { if (!signal?.aborted) setLoading(false); });
  }, [days]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="code-monitor-title" className="text-2xl font-bold text-white">Code Execution Monitor</h1>
            <p className="text-sm text-[#8b949e]">Runtime analytics &middot; Last {days} days</p>
          </div>
          <DateRangeFilter value={days} onChange={setDays} />
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Terminal, label: 'Total Executions', value: data?.period_executions || 0, color: '#3b82f6' },
            { icon: CheckCircle, label: 'Successful', value: data?.period_success || 0, color: '#22c55e' },
            { icon: XCircle, label: 'Failed', value: data?.period_failed || 0, color: '#ef4444' },
            { icon: Clock, label: 'Success Rate', value: `${data?.success_rate || 0}%`, color: '#f59e0b' },
          ].map(s => (
            <div key={s.label} className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#8b949e] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Trend Chart */}
        <div className="border border-[#2d333b] rounded-xl p-5 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Execution Trend (30d)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.trend || []}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="success" fill="#22c55e" radius={[4, 4, 0, 0]} name="Success" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* By Language */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">By Language</h3>
            <div className="space-y-2">
              {(data?.by_language || []).map((lang: { language: string; count: number; success_rate: number; avg_time_ms: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-sm font-mono text-[#c9d1d9] capitalize">{lang.language}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8b949e]">{lang.count} runs</span>
                    <span className="text-xs font-mono" style={{ color: lang.success_rate >= 80 ? '#22c55e' : '#f59e0b' }}>{lang.success_rate}%</span>
                    <span className="text-xs text-[#484f58]">{lang.avg_time_ms}ms</span>
                  </div>
                </div>
              ))}
              {(!data?.by_language || data.by_language.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No executions yet</p>
              )}
            </div>
          </div>

          {/* Recent Runs */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Recent Runs</h3>
            <div className="space-y-2 max-h-80 overflow-y-auto">
              {(data?.recent_runs || []).map((run: { success: boolean; language: string; execution_time_ms: number; executed_at?: string }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div className="flex items-center gap-2">
                    {run.success ? <CheckCircle size={12} className="text-[#22c55e]" /> : <XCircle size={12} className="text-[#ef4444]" />}
                    <span className="text-sm font-mono text-[#c9d1d9] capitalize">{run.language}</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#484f58]">{run.execution_time_ms}ms</span>
                    <span className="text-xs text-[#484f58]">{run.executed_at ? new Date(run.executed_at).toLocaleTimeString() : ''}</span>
                  </div>
                </div>
              ))}
              {(!data?.recent_runs || data.recent_runs.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No runs yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CodeMonitor;
