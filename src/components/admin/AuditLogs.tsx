'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Shield, Filter, ChevronLeft, ChevronRight, Loader2,
  UserCog, Trash2, FileText, Settings, Download,
} from 'lucide-react';

const ACTION_ICONS = {
  user_update: { icon: UserCog, color: '#3b82f6' },
  user_deactivate: { icon: UserCog, color: '#ef4444' },
  cert_revoke: { icon: Trash2, color: '#ef4444' },
  seo_update: { icon: FileText, color: '#f59e0b' },
  bulk_publish: { icon: Settings, color: '#22c55e' },
  bulk_unpublish: { icon: Settings, color: '#8b949e' },
  bulk_delete_lessons: { icon: Trash2, color: '#ef4444' },
  export_users: { icon: Download, color: '#3b82f6' },
};

const AuditLogs = () => {
  const [items, setItems] = useState<Record<string, unknown>[]>([]);
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
      const res = await api.get<{ items: Record<string, unknown>[]; total: number; total_pages: number; action_types: string[] }>(`/admin/audit-logs?${params}`, { signal });
      if (signal?.aborted) return;
      setItems(res.data.items);
      setTotal(res.data.total);
      setTotalPages(res.data.total_pages);
      setActionTypes(res.data.action_types || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [page, actionFilter]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await load(ac.signal); })();
    return () => ac.abort();
  }, [load]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="audit-logs-title" className="text-2xl font-bold text-white">Audit Logs</h1>
            <p className="text-sm text-[#8b949e]">{total} admin actions recorded</p>
          </div>
          {actionTypes.length > 0 && (
            <div className="flex items-center gap-2">
              <Filter size={14} className="text-[#484f58]" />
              <select
                data-testid="audit-filter"
                value={actionFilter}
                onChange={e => { setActionFilter(e.target.value); setPage(1); }}
                className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-1.5 text-sm text-[#c9d1d9] outline-none"
              >
                <option value="">All Actions</option>
                {actionTypes.map(a => <option key={a} value={a}>{a.replace(/_/g, ' ')}</option>)}
              </select>
            </div>
          )}
        </div>

        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#22c55e] animate-spin" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2d333b]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Action</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Target</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Admin</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Details</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Time</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item, i) => {
                  const cfg = (ACTION_ICONS as Record<string, { icon: React.ComponentType<{size?: number; style?: React.CSSProperties}>; color: string }>)[item.action as string] || { icon: Shield, color: '#8b949e' };
                  const Icon = cfg.icon;
                  return (
                    <tr key={i} className="border-b border-[#2d333b]/50 hover:bg-[#1c2128]">
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2">
                          <Icon size={14} style={{ color: cfg.color } as React.CSSProperties} />
                          <span className="text-sm text-[#c9d1d9]">{(item.action as string)?.replace(/_/g, ' ')}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#8b949e]">{(item.target as string) || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[#8b949e]">{(item.admin as string) || '-'}</td>
                      <td className="px-4 py-3 text-xs text-[#484f58] max-w-[200px] truncate">
                        {item.details ? JSON.stringify(item.details as Record<string, unknown>).slice(0, 60) : '-'}
                      </td>
                      <td className="px-4 py-3 text-xs text-[#484f58]">
                        {(item.timestamp as string) ? new Date((item.timestamp as string)).toLocaleString() : '-'}
                      </td>
                    </tr>
                  );
                })}
                {items.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-12 text-sm text-[#484f58]">No audit logs yet</td></tr>
                )}
              </tbody>
            </table>
          )}
          {totalPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2d333b]">
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

export default AuditLogs;
