'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Activity, UserPlus, BookOpen, Award, Brain,
  Terminal, Filter, ChevronLeft, ChevronRight, Loader2,
} from 'lucide-react';

interface ActionConfig { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; color: string; label: string; }

const ACTION_ICONS: Record<string, ActionConfig> = {
  user_signup: { icon: UserPlus, color: '#3b82f6', label: 'New Signup' },
  lesson_complete: { icon: BookOpen, color: '#22c55e', label: 'Lesson Completed' },
  quiz_attempt: { icon: Brain, color: '#8b5cf6', label: 'Quiz Attempt' },
  cert_issued: { icon: Award, color: '#f59e0b', label: 'Certificate Issued' },
  code_execution: { icon: Terminal, color: '#06b6d4', label: 'Code Executed' },
};

const DEFAULT_ACTION: ActionConfig = { icon: Activity, color: '#8b949e', label: 'Activity' };

interface ActivityItem { action: string; user_name?: string; user_email?: string; details?: Record<string, string>; timestamp?: string; }

const ActivityFeed = () => {
  const [items, setItems] = useState<ActivityItem[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [actionFilter, setActionFilter] = useState<string>('');
  const [actionTypes, setActionTypes] = useState<string[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();
  
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: '25' });
      if (actionFilter) params.append('action', actionFilter);
      const res = await api.get<{ items: ActivityItem[]; total: number; total_pages: number; action_types: string[] }>(`/admin/activity-feed?${params}`, { signal });
      if (signal?.aborted) return;
      setItems(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
      setActionTypes(res.data.action_types || []);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="activity-feed-title" className="text-2xl font-bold text-white">Activity Feed</h1>
            <p className="text-sm text-[#8b949e]">{total} events recorded</p>
          </div>
          {actionTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#484f58]" />
              <select
                data-testid="activity-filter"
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-1.5 text-sm text-[#c9d1d9] outline-none"
              >
                <option value="">All Events</option>
                {actionTypes.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="border border-[#2d333b] rounded-xl" style={{ backgroundColor: '#161b22' }}>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#22c55e] animate-spin" /></div>
          ) : items.length > 0 ? (
            <div className="divide-y divide-[#2d333b]/50">
              {items.map((item, i) => {
                const config = ACTION_ICONS[item.action] || DEFAULT_ACTION;
                const Icon = config.icon;
                return (
                  <div key={i} className="flex items-start gap-4 px-5 py-4 hover:bg-[#1c2128] transition-colors">
                    <div className="w-8 h-8 rounded-lg flex items-center justify-center mt-0.5 shrink-0" style={{ backgroundColor: `${config.color}18` }}>
                      <Icon size={14} style={{ color: config.color }} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2">
                        <span className="text-sm text-[#c9d1d9] font-medium">{config.label}</span>
                        {item.user_name && <span className="text-xs text-[#8b949e]">by {item.user_name}</span>}
                      </div>
                      {item.details && Object.keys(item.details).length > 0 && (
                        <p className="text-xs text-[#484f58] mt-1 truncate">
                          {Object.entries(item.details).map(([k, v]) => `${k}: ${v}`).join(' | ')}
                        </p>
                      )}
                    </div>
                    <span className="text-xs text-[#484f58] shrink-0">
                      {item.timestamp ? new Date(item.timestamp).toLocaleString() : ''}
                    </span>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="flex flex-col items-center py-16">
              <Activity size={24} className="text-[#484f58] mb-3" />
              <p className="text-sm text-[#8b949e]">No activity yet</p>
            </div>
          )}

          {totalPages > 1 && (
            <div className="flex items-center justify-between px-5 py-3 border-t border-[#2d333b]">
              <span className="text-xs text-[#8b949e]">Page {page} of {totalPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page <= 1} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page >= totalPages} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ActivityFeed;
