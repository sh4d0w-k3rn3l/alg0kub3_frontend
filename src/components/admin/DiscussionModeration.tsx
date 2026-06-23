'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Trash2, Search, MessageCircle, Loader2,
  ChevronLeft, ChevronRight, BarChart3, AlertCircle,
} from 'lucide-react';

const DiscussionModeration = () => {
  const navigate = useRouter();

  const [comments, setComments] = useState<Record<string, unknown>[]>([]);
  const [total, setTotal] = useState<number>(0);
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [lessonFilter, setLessonFilter] = useState<string>('');
  const [stats, setStats] = useState<Record<string, unknown> | null>(null);
  const [deleting, setDeleting] = useState<string | null>(null);
  const limit = 20;

  const fetchComments = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ page: String(page), limit: String(limit) });
      if (search) params.set('search', search);
      if (lessonFilter) params.set('lesson_slug', lessonFilter);
      const res = await api.get<{ comments: Record<string, unknown>[]; total: number }>(`/admin/discussions?${params}`, { signal });
      if (signal?.aborted) return;
      setComments(res.data.comments || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      /* ignore */
    }
    if (!signal?.aborted) setLoading(false);
  }, [page, search, lessonFilter]);

  const fetchStats = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<Record<string, unknown>>('/admin/discussions/stats', { signal });
      if (signal?.aborted) return;
      setStats(res.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      /* ignore */
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchComments(ac.signal);
    return () => ac.abort();
  }, [fetchComments]);
  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchStats(ac.signal);
    return () => ac.abort();
  }, [fetchStats]);

  const handleDelete = async (id: string) => {
    if (!(await showConfirm('Delete this comment and all its replies?'))) return;
    setDeleting(id);
    try {
      await api.delete(`/admin/discussions/${id}`);
      fetchComments();
      fetchStats();
    } catch { /* ignore */ }
    setDeleting(null);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchComments();
  };

  const totalPages = Math.ceil(total / limit);
  /* eslint-disable react-hooks/purity */
  const timeAgo = (d: string) => {
    const diff = (Date.now() - new Date(d).getTime()) / 1000;
    if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
    if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
    return new Date(d).toLocaleDateString();
  };
  /* eslint-enable react-hooks/purity */

  return (
    <div className="min-h-screen p-6" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div>
            <h1 className="text-xl font-bold text-white flex items-center gap-2">
              <MessageCircle size={20} className="text-[#22c55e]" /> Discussion Moderation
            </h1>
            <p className="text-xs text-[#8b949e] mt-0.5">Manage and moderate lesson discussions</p>
          </div>
        </div>

        {/* Stats */}
        {stats && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-6">
            <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <div className="text-2xl font-bold text-white">{(stats.total_comments as number)}</div>
              <div className="text-xs text-[#8b949e]">Total Comments</div>
            </div>
            <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <div className="text-2xl font-bold text-[#22c55e]">{(stats.today_comments as number)}</div>
              <div className="text-xs text-[#8b949e]">Today</div>
            </div>
            <div className="border border-[#2d333b] rounded-xl p-4 col-span-2 md:col-span-1" style={{ backgroundColor: '#161b22' }}>
              <div className="text-xs text-[#8b949e] mb-2 flex items-center gap-1"><BarChart3 size={12} /> Top Discussed</div>
              {((stats.top_lessons as Record<string, unknown>[]) ?? []).slice(0, 3).map((l, i) => (
                <div key={i} className="flex items-center justify-between text-xs py-0.5">
                  <span className="text-[#c9d1d9] truncate max-w-[160px]">{(l.lesson_slug as string)}</span>
                  <span className="text-[#22c55e] font-mono">{(l.count as number)}</span>
                </div>
              ))}
              {!((stats.top_lessons as Record<string, unknown>[])?.length) && (
                <p className="text-xs text-[#484f58]">No data</p>
              )}
            </div>
          </div>
        )}

        {/* Search / Filter */}
        <form onSubmit={handleSearch} className="flex flex-wrap gap-3 mb-4">
          <div className="relative flex-1 min-w-[200px]">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
            <input
              data-testid="discussion-search"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search comments..."
              className="w-full pl-9 pr-3 py-2 bg-[#0d1117] border border-[#2d333b] rounded-lg text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
            />
          </div>
          <input
            data-testid="discussion-lesson-filter"
            value={lessonFilter}
            onChange={e => setLessonFilter(e.target.value)}
            placeholder="Filter by lesson slug..."
            className="w-48 px-3 py-2 bg-[#0d1117] border border-[#2d333b] rounded-lg text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
          />
          <button type="submit" className="px-4 py-2 bg-[#22c55e] text-white text-sm rounded-lg font-medium hover:bg-[#16a34a] transition-colors">
            Search
          </button>
        </form>

        {/* Comments table */}
        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 size={24} className="text-[#22c55e] animate-spin" />
            </div>
          ) : comments.length === 0 ? (
            <div className="text-center py-12">
              <AlertCircle size={24} className="text-[#484f58] mx-auto mb-2" />
              <p className="text-sm text-[#484f58]">No comments found</p>
            </div>
          ) : (
            <div className="divide-y divide-[#2d333b]">
              {comments.map(c => (
                <div key={(c.id as string)} data-testid={`admin-comment-${c.id as string}`} className="p-4 hover:bg-[#1c2129] transition-colors">
                  <div className="flex items-start justify-between gap-3">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap mb-1">
                        <span className="text-sm font-semibold text-[#c9d1d9]">{(c.user_name as string)}</span>
                        <span className="text-xs text-[#484f58]">{timeAgo(c.created_at as string)}</span>
                        {(c.parent_id as string) && (
                          <span className="text-xs px-1.5 py-0.5 rounded bg-[#3b82f620] text-[#3b82f6]">Reply</span>
                        )}
                        <span className="text-xs text-[#484f58] truncate max-w-[180px]">on {(c.lesson_slug as string)}</span>
                      </div>
                      <p className="text-sm text-[#8b949e] break-words line-clamp-2">{(c.content as string)}</p>
                    </div>
                    <button
                      data-testid={`admin-delete-${c.id as string}`}
                      onClick={() => handleDelete(c.id as string)}
                      disabled={deleting === (c.id as string)}
                      className="flex-shrink-0 p-2 rounded-lg text-red-400 hover:bg-red-400/10 transition-colors disabled:opacity-40"
                    >
                      {deleting === c.id ? <Loader2 size={16} className="animate-spin" /> : <Trash2 size={16} />}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Pagination */}
        {totalPages > 1 && (
          <div className="flex items-center justify-between mt-4">
            <span className="text-xs text-[#8b949e]">{total} comments &middot; Page {page}/{totalPages}</span>
            <div className="flex gap-2">
              <button
                data-testid="discussion-prev"
                onClick={() => setPage(p => Math.max(1, p - 1))}
                disabled={page <= 1}
                className="p-2 rounded-lg border border-[#2d333b] text-[#c9d1d9] hover:border-[#444c56] disabled:opacity-30 transition-colors"
              >
                <ChevronLeft size={14} />
              </button>
              <button
                data-testid="discussion-next"
                onClick={() => setPage(p => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-lg border border-[#2d333b] text-[#c9d1d9] hover:border-[#444c56] disabled:opacity-30 transition-colors"
              >
                <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default DiscussionModeration;
