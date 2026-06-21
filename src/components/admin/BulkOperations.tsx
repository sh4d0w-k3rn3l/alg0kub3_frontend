'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Download, BookOpen, Loader2,
  CheckCircle, ToggleLeft, ToggleRight, Trash2,
} from 'lucide-react';

const BulkOperations = () => {
  const [courses, setCourses] = useState<Record<string, unknown>[]>([]);
  const [selected, setSelected] = useState(new Set());
  const [loading, setLoading] = useState<boolean>(true);
  const [operating, setOperating] = useState<boolean>(false);
  const [result, setResult] = useState<Record<string, unknown> | null>(null);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
api.get<{ courses: Record<string, unknown>[] }>('/courses', { signal: ac.signal })
      .then(res => { if (!ac.signal.aborted) setCourses(res.data.courses || res.data || []); })
      .catch(handleApiError)
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const toggleSelect = (id: string) => {
    setSelected(prev => {
      const next = new Set(prev);
      if (next.has(id)) { next.delete(id); } else { next.add(id); }
      return next;
    });
  };

  const selectAll = () => {
    if (selected.size === courses.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(courses.map(c => c.id)));
    }
  };

  const bulkPublish = async (publish: boolean) => {
    if (selected.size === 0) return;
    setOperating(true);
    setResult(null);
    try {
      const res = await api.post<{ modified: number }>('/admin/bulk/publish-courses', {
        course_ids: Array.from(selected),
        publish,
      });
      setResult({ success: true, message: `${res.data.modified} courses ${publish ? 'published' : 'unpublished'}` });
      const ac = new AbortController();
      try {
        const refresh = await api.get<{ courses: Record<string, unknown>[] }>('/courses', { signal: ac.signal });
        if (!ac.signal.aborted) setCourses(refresh.data.courses || refresh.data || []);
      } catch {}
      navigate.refresh();
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      setResult({ success: false, message: e.detail || e.message });
    } finally {
      setOperating(false);
    }
  };

  const exportData = async (type: string) => {
    try {
      const endpoint = type === 'users' ? 'export-users' : 'export-progress';
      const BACKEND_URL = process.env.NEXT_PUBLIC_BACKEND_URL;
      const res = await fetch(`${BACKEND_URL}/api/admin/bulk/${endpoint}`);
      if (!res.ok) throw new Error('Export failed');
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${type}_export.csv`;
      a.click();
      URL.revokeObjectURL(url);
    } catch (err: unknown) {
      showError('Export failed: ' + ((err as { message?: string }).message || 'Unknown error'));
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="bulk-ops-title" className="text-2xl font-bold text-white">Bulk Operations</h1>
            <p className="text-sm text-[#8b949e]">{selected.size} of {courses.length} selected</p>
          </div>
        </div>

        {/* Export Section */}
        <div className="border border-[#2d333b] rounded-xl p-5 mb-6" style={{ backgroundColor: '#161b22' }}>
          <h3 className="text-sm font-medium text-[#c9d1d9] mb-3">Data Export</h3>
          <div className="flex gap-3">
            <button data-testid="export-users-btn" onClick={() => exportData('users')} className="flex items-center gap-2 border border-[#2d333b] hover:border-[#444c56] rounded-lg px-4 py-2 text-sm text-[#c9d1d9] transition-colors">
              <Download size={14} /> Export Users CSV
            </button>
            <button data-testid="export-progress-btn" onClick={() => exportData('progress')} className="flex items-center gap-2 border border-[#2d333b] hover:border-[#444c56] rounded-lg px-4 py-2 text-sm text-[#c9d1d9] transition-colors">
              <Download size={14} /> Export Progress CSV
            </button>
          </div>
        </div>

        {/* Batch Course Actions */}
        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center justify-between px-5 py-4 border-b border-[#2d333b]">
            <div className="flex items-center gap-3">
              <button onClick={selectAll} className="text-xs text-[#8b949e] hover:text-white transition-colors">
                {selected.size === courses.length ? 'Deselect All' : 'Select All'}
              </button>
            </div>
            <div className="flex items-center gap-2">
              <button
                data-testid="bulk-publish-btn"
                onClick={() => bulkPublish(true)}
                disabled={selected.size === 0 || operating}
                className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                <ToggleRight size={12} /> Publish
              </button>
              <button
                data-testid="bulk-unpublish-btn"
                onClick={() => bulkPublish(false)}
                disabled={selected.size === 0 || operating}
                className="flex items-center gap-1.5 bg-[#8b949e] hover:bg-[#6e7681] disabled:opacity-40 text-white text-xs px-3 py-1.5 rounded-lg transition-colors"
              >
                <ToggleLeft size={12} /> Unpublish
              </button>
            </div>
          </div>

          {result && (
            <div className={`px-5 py-2 text-sm flex items-center gap-2 ${result.success ? 'text-[#22c55e] bg-[#22c55e]/10' : 'text-[#ef4444] bg-[#ef4444]/10'}`}>
              {result.success ? <CheckCircle size={14} /> : <Trash2 size={14} />}
              {result.message}
            </div>
          )}

          <div className="max-h-[500px] overflow-y-auto">
            {courses.map(c => (
              <div
                key={c.id}
                onClick={() => toggleSelect(c.id)}
                className={`flex items-center gap-4 px-5 py-3 cursor-pointer border-b border-[#2d333b]/30 transition-colors ${
                  selected.has(c.id) ? 'bg-[#22c55e]/5' : 'hover:bg-[#1c2128]'
                }`}
              >
                <div className={`w-4 h-4 rounded border-2 flex items-center justify-center transition-colors ${
                  selected.has(c.id) ? 'border-[#22c55e] bg-[#22c55e]' : 'border-[#2d333b]'
                }`}>
                  {selected.has(c.id) && <CheckCircle size={10} className="text-white" />}
                </div>
                <BookOpen size={14} className="text-[#8b949e]" />
                <div className="flex-1">
                  <p className="text-sm text-[#c9d1d9]">{c.title}</p>
                  <p className="text-xs text-[#484f58]">{c.category} &middot; {c.slug}</p>
                </div>
                <span className={`text-xs px-2 py-0.5 rounded-full ${c.is_published !== false ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#8b949e20] text-[#8b949e]'}`}>
                  {c.is_published !== false ? 'Published' : 'Draft'}
                </span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default BulkOperations;
