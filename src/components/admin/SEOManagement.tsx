'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, handleApiError } from '@/lib/toast';
import type { ApiError } from '@/lib/api';
import {
  ArrowLeft, Search, Globe, FileText, CheckCircle,
  AlertTriangle, Loader2, Save, X, Map,
} from 'lucide-react';

const ScoreBadge = ({ score }: { score: number }) => {
  const color = score >= 70 ? '#22c55e' : score >= 40 ? '#f59e0b' : '#ef4444';
  return (
    <span className="text-xs font-mono font-bold px-2 py-0.5 rounded-full" style={{ backgroundColor: `${color}20`, color }}>
      {score}
    </span>
  );
};

interface SEOPageItem { title: string; slug: string; url: string; category: string; seo_score: number; has_custom_seo: boolean; }
interface SEOStats { total: number; avg_score: number; good: number; needs_work: number; }
interface SEOSitemapData { total: number; urls: { type: string; url: string; title: string }[]; }
interface SEOMetaData { meta_title: string; meta_description: string; og_title: string; keywords: string[]; }

const SEOManagement = () => {
  const [pages, setPages] = useState<SEOPageItem[]>([]);
  const [stats, setStats] = useState<SEOStats>({ total: 0, avg_score: 0, good: 0, needs_work: 0 });
  const [sitemap, setSitemap] = useState<SEOSitemapData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [search, setSearch] = useState<string>('');
  const [editSlug, setEditSlug] = useState<string | null>(null);
  const [editData, setEditData] = useState<SEOMetaData>({ meta_title: '', meta_description: '', og_title: '', keywords: [] });
  const [saving, setSaving] = useState<boolean>(false);
  const [tab, setTab] = useState('pages');
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ pages: SEOPageItem[]; stats: SEOStats }>('/admin/seo/pages', { signal: ac.signal })
      .then(res => {
        if (!ac.signal.aborted) {
          setPages(res.data.pages);
          setStats(res.data.stats);
        }
      })
      .catch(handleApiError)
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  const loadSitemap = async () => {
    try {
      const res = await api.get<SEOSitemapData>('/admin/seo/sitemap');
      setSitemap(res.data);
    } catch (err) {
      handleApiError(err);
    }
  };

  const openEditor = async (slug: string) => {
    try {
      const res = await api.get<SEOMetaData>(`/admin/seo/meta/${slug}`);
      setEditData(res.data);
      setEditSlug(slug);
    } catch (err) {
      handleApiError(err);
    }
  };

  const saveMeta = async () => {
    setSaving(true);
    try {
      await api.put(`/admin/seo/meta/${editSlug}`, editData);
      setEditSlug(null);
      const res = await api.get<{ pages: SEOPageItem[]; stats: SEOStats }>('/admin/seo/pages');
      setPages(res.data.pages);
      setStats(res.data.stats);
    } catch (err) {
      showError('Save failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const filtered = pages.filter(p =>
    !search || (p.title || '').toLowerCase().includes(search.toLowerCase()) || (p.slug || '').toLowerCase().includes(search.toLowerCase())
  );

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 data-testid="seo-management-title" className="text-2xl font-bold text-white">SEO Management</h1>
            <p className="text-sm text-[#8b949e]">{stats.total || 0} pages &middot; Avg score: {stats.avg_score || 0}</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-6">
          <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#3b82f618]"><Globe size={18} className="text-[#3b82f6]" /></div>
              <div><p className="text-xl font-bold text-white">{stats.total || 0}</p><p className="text-xs text-[#8b949e]">Total Pages</p></div>
            </div>
          </div>
          <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#22c55e18]"><CheckCircle size={18} className="text-[#22c55e]" /></div>
              <div><p className="text-xl font-bold text-white">{stats.good || 0}</p><p className="text-xs text-[#8b949e]">Good SEO (70+)</p></div>
            </div>
          </div>
          <div className="border border-[#2d333b] rounded-xl p-4" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-lg flex items-center justify-center bg-[#f59e0b18]"><AlertTriangle size={18} className="text-[#f59e0b]" /></div>
              <div><p className="text-xl font-bold text-white">{stats.needs_work || 0}</p><p className="text-xs text-[#8b949e]">Needs Work</p></div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#2d333b]">
          {[
            { id: 'pages', icon: FileText, label: 'Pages' },
            { id: 'sitemap', icon: Map, label: 'Sitemap' },
          ].map(t => (
            <button
              key={t.id}
              data-testid={`seo-tab-${t.id}`}
              onClick={() => { setTab(t.id); if (t.id === 'sitemap' && !sitemap) loadSitemap(); }}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 -mb-[1px] transition-colors ${
                tab === t.id ? 'text-[#22c55e] border-[#22c55e]' : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'pages' && (
          <>
            {/* Search */}
            <div className="relative max-w-md mb-4">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
              <input
                data-testid="seo-search-input"
                type="text"
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder="Search pages..."
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
              />
            </div>

            {/* Page List */}
            <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d333b]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Page</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">URL</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Score</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Custom SEO</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map(p => (
                    <tr key={p.slug} className="border-b border-[#2d333b]/50 hover:bg-[#1c2128]">
                      <td className="px-4 py-3">
                        <p className="text-sm text-[#c9d1d9]">{p.title}</p>
                        <p className="text-xs text-[#484f58]">{p.category}</p>
                      </td>
                      <td className="px-4 py-3 text-xs font-mono text-[#8b949e]">{p.url}</td>
                      <td className="px-4 py-3"><ScoreBadge score={p.seo_score} /></td>
                      <td className="px-4 py-3">
                        {p.has_custom_seo ? (
                          <span className="text-xs text-[#22c55e]">Yes</span>
                        ) : (
                          <span className="text-xs text-[#484f58]">No</span>
                        )}
                      </td>
                      <td className="px-4 py-3">
                        <button
                          data-testid={`edit-seo-${p.slug}`}
                          onClick={() => openEditor(p.slug)}
                          className="text-xs text-[#3b82f6] hover:text-[#60a5fa] transition-colors"
                        >
                          Edit
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </>
        )}

        {tab === 'sitemap' && (
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <p className="text-sm text-[#8b949e] mb-4">{sitemap?.total || 0} public URLs</p>
            <div className="max-h-[500px] overflow-y-auto space-y-1">
              {(sitemap?.urls || []).map((u: { type: string; url: string; title: string }, i: number) => (
                <div key={i} className="flex items-center gap-3 py-1.5">
                  <span className={`text-xs px-1.5 py-0.5 rounded ${
                    u.type === 'course' ? 'bg-[#3b82f620] text-[#3b82f6]' :
                    u.type === 'lesson' ? 'bg-[#22c55e20] text-[#22c55e]' :
                    'bg-[#8b949e20] text-[#8b949e]'
                  }`}>{u.type}</span>
                  <span className="text-xs font-mono text-[#c9d1d9]">{u.url}</span>
                  <span className="text-xs text-[#484f58] ml-auto">{u.title}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* SEO Editor Modal */}
        {editSlug && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg border border-[#2d333b] rounded-xl p-6" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-white">Edit SEO - {editSlug}</h3>
                <button onClick={() => setEditSlug(null)} className="text-[#8b949e] hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Meta Title</label>
                  <input
                    data-testid="seo-meta-title"
                    type="text"
                    value={editData.meta_title || ''}
                    onChange={e => setEditData({ ...editData, meta_title: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                    placeholder="Page Title | AlgoKube"
                  />
                  <p className="text-xs text-[#484f58] mt-1">{(editData.meta_title || '').length}/60 characters</p>
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Meta Description</label>
                  <textarea
                    data-testid="seo-meta-description"
                    value={editData.meta_description || ''}
                    onChange={e => setEditData({ ...editData, meta_description: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] h-20 resize-none"
                    placeholder="Brief description for search engines..."
                  />
                  <p className="text-xs text-[#484f58] mt-1">{(editData.meta_description || '').length}/160 characters</p>
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">OG Title (Social)</label>
                  <input
                    type="text"
                    value={editData.og_title || ''}
                    onChange={e => setEditData({ ...editData, og_title: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                    placeholder="Title for social sharing"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Keywords (comma-separated)</label>
                  <input
                    type="text"
                    value={(editData.keywords || []).join(', ')}
                    onChange={e => setEditData({ ...editData, keywords: e.target.value.split(',').map(k => k.trim()).filter(Boolean) })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                    placeholder="python, algorithms, data structures"
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setEditSlug(null)} className="px-4 py-2 text-sm text-[#8b949e] hover:text-white transition-colors">Cancel</button>
                <button
                  data-testid="save-seo-btn"
                  onClick={saveMeta}
                  disabled={saving}
                  className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default SEOManagement;
