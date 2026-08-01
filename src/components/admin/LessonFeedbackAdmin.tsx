'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Loader2, ThumbsUp, ThumbsDown, MessageCircle, X, ExternalLink,
} from 'lucide-react';

const SORTS = [
  { key: 'worst', label: 'Lowest helpful %' },
  { key: 'most_voted', label: 'Most votes' },
  { key: 'best', label: 'Highest helpful %' },
];

interface FeedbackRow { lesson_id: string; lesson_slug: string; lesson_title?: string; course_slug?: string; helpful_ratio: number; up: number; down: number; total: number; }
interface FeedbackDetail { id: string; rating: string; user_id?: string; anon_id?: string; comment?: string; updated_at: string; }
interface OverallStats { lessons_with_feedback: number; total_up: number; total_down: number; }

const LessonFeedbackAdmin = () => {
  const navigate = useRouter();

  const [rows, setRows] = useState<FeedbackRow[]>([]);
  const [overall, setOverall] = useState<OverallStats | null>(null);
  const [courses, setCourses] = useState<{ slug: string; title: string }[]>([]);
  const [sort, setSort] = useState('worst');
  const [courseFilter, setCourseFilter] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);
  const [detailLesson, setDetailLesson] = useState<FeedbackRow | null>(null);
  const [detailRows, setDetailRows] = useState<FeedbackDetail[]>([]);
  const [detailLoading, setDetailLoading] = useState<boolean>(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const params = new URLSearchParams({ sort, min_votes: '1', limit: '200' });
      if (courseFilter) params.set('course', courseFilter);
      const r = await api.get<{ rows: FeedbackRow[]; overall: OverallStats }>(`/admin/lesson-feedback?${params}`, { signal });
      if (signal?.aborted) return;
      setRows(r.data.rows || []);
      setOverall(r.data.overall || null);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [sort, courseFilter]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await load(ac.signal); })();
    return () => ac.abort();
  }, [load]);

  useEffect(() => {
    const ac = new AbortController();
    api.get<Record<string, unknown>>('/courses', { signal: ac.signal, cache: 'no-store' })
      .then(r => { if (!ac.signal.aborted) setCourses(((r.data?.courses as Record<string, unknown>[]) ?? []) as never[]); })
      .catch(() => {});
    return () => ac.abort();
  }, []);

  const openDetail = async (row: FeedbackRow) => {
    setDetailLesson(row);
    setDetailLoading(true);
    setDetailRows([]);
    try {
      const r = await api.get<{ rows: FeedbackDetail[] }>(`/admin/lesson-feedback/${row.lesson_id}`);
      setDetailRows(r.data.rows || []);
    } catch (err) {
      handleApiError(err);
    } finally {
      setDetailLoading(false);
    }
  };

  const ratioColor = (ratio: number) => {
    if (ratio >= 0.8) return '#22c55e';
    if (ratio >= 0.5) return '#f59e0b';
    return '#ef4444';
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button
            data-testid="feedback-admin-back"
            onClick={() => navigate.push('/admin/dashboard')}
            className="text-[#8b949e] hover:text-white transition-colors"
          >
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 className="text-2xl font-bold text-white">Lesson Feedback</h1>
            <p className="text-sm text-[#8b949e]">Thumbs-up / thumbs-down votes from readers, worst-rated lessons first.</p>
          </div>
        </div>

        {overall && (
          <div className="grid grid-cols-3 gap-4 mb-6">
            <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <p className="text-xs text-[#8b949e] mb-1">Lessons rated</p>
              <p className="text-2xl font-bold text-white">{overall.lessons_with_feedback}</p>
            </div>
            <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <p className="text-xs text-[#8b949e] mb-1 flex items-center gap-1"><ThumbsUp size={12} className="text-[#22c55e]" /> Upvotes</p>
              <p className="text-2xl font-bold text-[#22c55e]">{overall.total_up}</p>
            </div>
            <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <p className="text-xs text-[#8b949e] mb-1 flex items-center gap-1"><ThumbsDown size={12} className="text-[#ef4444]" /> Downvotes</p>
              <p className="text-2xl font-bold text-[#ef4444]">{overall.total_down}</p>
            </div>
          </div>
        )}

        <div className="flex flex-wrap items-center gap-3 mb-4">
          <label className="text-xs text-[#8b949e]">Sort:</label>
          <select
            data-testid="feedback-admin-sort"
            value={sort}
            onChange={(e) => setSort(e.target.value)}
            className="bg-[#161b22] border border-[#2d333b] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs focus:outline-none focus:border-[#444c56]"
          >
            {SORTS.map(s => <option key={s.key} value={s.key}>{s.label}</option>)}
          </select>

          <label className="text-xs text-[#8b949e] ml-2">Course:</label>
          <select
            data-testid="feedback-admin-course-filter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="bg-[#161b22] border border-[#2d333b] text-[#c9d1d9] px-3 py-1.5 rounded-md text-xs focus:outline-none focus:border-[#444c56]"
          >
            <option value="">All courses</option>
            {courses.map(c => <option key={c.slug} value={c.slug}>{c.title}</option>)}
          </select>

          <button
            data-testid="feedback-admin-refresh"
            onClick={() => load()}
            className="ml-auto text-xs bg-[#161b22] border border-[#2d333b] hover:border-[#444c56] text-[#c9d1d9] px-3 py-1.5 rounded-md transition-colors"
          >
            Refresh
          </button>
        </div>

        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          {loading ? (
            <div className="flex items-center justify-center py-24">
              <Loader2 size={22} className="text-[#22c55e] animate-spin" />
            </div>
          ) : rows.length === 0 ? (
            <p className="text-center text-sm text-[#484f58] py-16">No feedback yet.</p>
          ) : (
            <table className="w-full text-sm" data-testid="feedback-admin-table">
              <thead>
                <tr className="border-b border-[#2d333b] text-[#8b949e] text-xs uppercase tracking-wide">
                  <th className="text-left px-4 py-3 font-medium">Lesson</th>
                  <th className="text-left px-4 py-3 font-medium">Course</th>
                  <th className="text-right px-4 py-3 font-medium">Helpful %</th>
                  <th className="text-right px-4 py-3 font-medium"><ThumbsUp size={12} className="inline" /> Up</th>
                  <th className="text-right px-4 py-3 font-medium"><ThumbsDown size={12} className="inline" /> Down</th>
                  <th className="text-right px-4 py-3 font-medium">Total</th>
                  <th className="px-4 py-3" />
                </tr>
              </thead>
              <tbody>
                {rows.map((row: FeedbackRow) => {
                  const ratio = row.helpful_ratio;
                  const pct = Math.round(ratio * 100);
                  return (
                    <tr
                      key={row.lesson_id}
                      data-testid={`feedback-row-${row.lesson_slug}`}
                      className="border-b border-[#2d333b]/50 last:border-0 hover:bg-[#1c2333] transition-colors"
                    >
                      <td className="px-4 py-3 text-[#c9d1d9]">{row.lesson_title || row.lesson_slug}</td>
                      <td className="px-4 py-3 text-[#8b949e] text-xs">{row.course_slug || '—'}</td>
                      <td className="px-4 py-3 text-right font-mono text-sm" style={{ color: ratioColor(ratio) }}>
                        {pct}%
                      </td>
                      <td className="px-4 py-3 text-right text-[#22c55e] font-mono">{row.up}</td>
                      <td className="px-4 py-3 text-right text-[#ef4444] font-mono">{row.down}</td>
                      <td className="px-4 py-3 text-right text-[#c9d1d9] font-mono">{row.total}</td>
                      <td className="px-4 py-3 text-right">
                        <button
                          data-testid={`feedback-row-open-${row.lesson_slug}`}
                          onClick={() => openDetail(row)}
                          className="inline-flex items-center gap-1 text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                        >
                          <MessageCircle size={12} /> Comments
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>
      </div>

      {detailLesson && (
        <div
          data-testid="feedback-detail-modal"
          className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70"
          onClick={() => setDetailLesson(null)}
        >
          <div
            className="relative w-full max-w-2xl max-h-[80vh] overflow-y-auto rounded-xl border border-[#2d333b]"
            style={{ backgroundColor: '#0d1117' }}
            onClick={(e) => e.stopPropagation()}
          >
            <div className="sticky top-0 flex items-start justify-between gap-4 px-5 py-4 border-b border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
              <div>
                <h3 className="text-sm font-semibold text-white">{detailLesson.lesson_title}</h3>
                <p className="text-xs text-[#8b949e] mt-0.5">
                  {detailLesson.up} up · {detailLesson.down} down · {Math.round(detailLesson.helpful_ratio * 100)}% helpful
                </p>
              </div>
              <div className="flex items-center gap-2">
                {detailLesson.course_slug && (
                  <a
                    data-testid="feedback-detail-open-lesson"
                    href={`/learn/${detailLesson.course_slug}/${detailLesson.lesson_slug}`}
                    target="_blank" rel="noreferrer"
                    className="text-[#8b949e] hover:text-white transition-colors"
                    title="Open lesson"
                  >
                    <ExternalLink size={16} />
                  </a>
                )}
                <button
                  data-testid="feedback-detail-close"
                  onClick={() => setDetailLesson(null)}
                  className="text-[#8b949e] hover:text-white transition-colors"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
            <div className="px-5 py-4 space-y-3">
              {detailLoading ? (
                <div className="flex items-center justify-center py-10">
                  <Loader2 size={20} className="text-[#22c55e] animate-spin" />
                </div>
              ) : detailRows.length === 0 ? (
                <p className="text-sm text-[#8b949e]">No individual feedback entries.</p>
              ) : (
                detailRows.map((row: FeedbackDetail) => (
                  <div
                    key={row.id}
                    className="border border-[#2d333b] rounded-lg px-4 py-3"
                    style={{ backgroundColor: '#161b22' }}
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {row.rating === 'up' ? (
                        <ThumbsUp size={14} className="text-[#22c55e]" />
                      ) : (
                        <ThumbsDown size={14} className="text-[#ef4444]" />
                      )}
                      <span className="text-xs text-[#8b949e]">
                        {row.user_id ? `user:${row.user_id.slice(0, 8)}` : `anon:${(row.anon_id || '').slice(0, 10)}`}
                        {' · '}
                        {new Date(row.updated_at).toLocaleString()}
                      </span>
                    </div>
                    {row.comment ? (
                      <p className="text-sm text-[#c9d1d9] whitespace-pre-wrap">{row.comment}</p>
                    ) : (
                      <p className="text-xs text-[#484f58] italic">No comment.</p>
                    )}
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonFeedbackAdmin;
