'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError, showError, showConfirm } from '@/lib/toast';
import { ArrowLeft, Award, Search, Trash2, Loader2, ChevronLeft, ChevronRight, Users, BookOpen } from 'lucide-react';

const CertificateManagement = () => {
  const [certs, setCerts] = useState<Record<string, unknown>[]>([]);
  const [stats, setStats] = useState<Record<string, unknown>>({});
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [search, setSearch] = useState<string>('');
  const [, setTotal] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      setLoading(true);
      try {
        const params = new URLSearchParams({ page: String(page), limit: '15' });
        if (search) params.append('search', search);
        const res = await api.get<{ certificates: Record<string, unknown>[]; total: number; total_pages: number; stats: Record<string, unknown> }>(`/admin/certificates?${params}`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setCerts(res.data.certificates);
        setTotal(res.data.total);
        setTotalPages(res.data.total_pages);
        setStats(res.data.stats);
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        handleApiError(err);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, [page, search]);

  const revoke = async (verificationId: string) => {
    if (!(await showConfirm(`Revoke certificate ${verificationId}?`))) return;
    try {
      await api.delete(`/admin/certificates/${verificationId}`);
      setCerts(prev => prev.filter(c => c.verification_id !== verificationId));
      setTotal(t => t - 1);
    } catch (err: unknown) {
      const e = err as { detail?: string; message?: string };
      showError('Revoke failed: ' + (e.detail || e.message));
    }
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 data-testid="certificate-management-title" className="text-2xl font-bold text-white">Certificate Management</h1>
            <p className="text-sm text-[#8b949e]">{(stats.total_issued as number) ?? 0} certificates issued</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          {[
            { icon: Award, label: 'Total Issued', value: (stats.total_issued as number) ?? 0, color: '#8b5cf6' },
            { icon: Users, label: 'Unique Users', value: (stats.unique_users as number) ?? 0, color: '#3b82f6' },
            { icon: BookOpen, label: 'Unique Courses', value: (stats.unique_courses as number) ?? 0, color: '#22c55e' },
          ].map(s => (
            <div key={s.label} className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${s.color}18` }}>
                  <s.icon size={18} style={{ color: s.color } as React.CSSProperties} />
                </div>
                <div>
                  <p className="text-xl font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#8b949e]">{s.label}</p>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Search */}
        <div className="relative max-w-md mb-6">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
          <input
            data-testid="cert-search-input"
            type="text"
            value={search}
            onChange={e => { setSearch(e.target.value); setPage(1); }}
            placeholder="Search by user name or course..."
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
          />
        </div>

        {/* Table */}
        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          {loading ? (
            <div className="flex justify-center py-16"><Loader2 size={24} className="text-[#22c55e] animate-spin" /></div>
          ) : (
            <table className="w-full">
              <thead>
                <tr className="border-b border-[#2d333b]">
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Verification ID</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">User</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Course</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Issued</th>
                  <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {certs.map(c => (
                  <tr key={(c.verification_id as string)} data-testid={`cert-row-${(c.verification_id as string)}`} className="border-b border-[#2d333b]/50 hover:bg-[#1c2128]">
                    <td className="px-4 py-3 text-xs font-mono text-[#8b5cf6]">{(c.verification_id as string)}</td>
                    <td className="px-4 py-3">
                      <p className="text-sm text-[#c9d1d9]">{(c.user_name as string)}</p>
                      <p className="text-xs text-[#484f58]">{(c.user_email as string)}</p>
                    </td>
                    <td className="px-4 py-3 text-sm text-[#c9d1d9]">{(c.course_title as string)}</td>
                    <td className="px-4 py-3 text-xs text-[#8b949e]">{(c.issue_date as string) || new Date((c.issued_at as string)).toLocaleDateString()}</td>
                    <td className="px-4 py-3">
                      <button
                        data-testid={`revoke-cert-${(c.verification_id as string)}`}
                        onClick={() => revoke(c.verification_id as string)}
                        className="text-[#ef4444] hover:text-[#dc2626] transition-colors p-1"
                        title="Revoke"
                      >
                        <Trash2 size={14} />
                      </button>
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && (
                  <tr><td colSpan={5} className="text-center py-8 text-sm text-[#484f58]">No certificates found</td></tr>
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

export default CertificateManagement;
