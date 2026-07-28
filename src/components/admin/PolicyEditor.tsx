'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showSuccess, showError, handleApiError, showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, FileText,
  ChevronDown, ChevronUp, GripVertical, Eye, RotateCcw,
} from 'lucide-react';

interface PolicySection {
  heading: string;
  body: string;
  bullets: string[];
}

interface Policy {
  slug: string;
  title: string;
  last_updated: string;
  sections: PolicySection[];
}

const PolicyEditor = () => {
  const navigate = useRouter();

  const [policies, setPolicies] = useState<Policy[]>([]);
  const [selected, setSelected] = useState<Policy | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [expandedIdx, setExpandedIdx] = useState<number | null>(null);

  const fetchPolicies = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<Policy[]>('/admin/policies', { signal });
      if (signal?.aborted) return;
      setPolicies(res.data);
      if (!selected && res.data.length > 0) setSelected(res.data[0]);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    fetchPolicies(ac.signal);
    return () => ac.abort();
  }, [fetchPolicies]);

  const handleSelectPolicy = (p: Policy) => {
    setSelected({ ...p });
    setExpandedIdx(null);
  };

  const handleFieldChange = (field: string, value: string) => {
    setSelected((prev: Policy | null) => prev ? { ...prev, [field]: value } : prev);
  };

  const handleSectionChange = (idx: number, field: string, value: string) => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[idx] = { ...sections[idx], [field]: value };
      return { ...prev, sections };
    });
  };

  const handleBulletChange = (sIdx: number, bIdx: number, value: string) => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const bullets = [...(sections[sIdx].bullets || [])];
      bullets[bIdx] = value;
      sections[sIdx] = { ...sections[sIdx], bullets };
      return { ...prev, sections };
    });
  };

  const addBullet = (sIdx: number) => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections[sIdx] = { ...sections[sIdx], bullets: [...(sections[sIdx].bullets || []), ''] };
      return { ...prev, sections };
    });
  };

  const removeBullet = (sIdx: number, bIdx: number) => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const bullets = [...(sections[sIdx].bullets || [])];
      bullets.splice(bIdx, 1);
      sections[sIdx] = { ...sections[sIdx], bullets };
      return { ...prev, sections };
    });
  };

  const addSection = () => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      return {
        ...prev,
        sections: [...prev.sections, { heading: '', body: '', bullets: [] }],
      };
    });
    setExpandedIdx(prev => selected ? selected.sections.length : prev);
  };

  const removeSection = async (idx: number) => {
    if (!(await showConfirm('Remove this section?'))) return;
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      sections.splice(idx, 1);
      return { ...prev, sections };
    });
  };

  const moveSection = (idx: number, dir: number) => {
    setSelected((prev: Policy | null) => {
      if (!prev) return prev;
      const sections = [...prev.sections];
      const newIdx = idx + dir;
      if (newIdx < 0 || newIdx >= sections.length) return prev;
      [sections[idx], sections[newIdx]] = [sections[newIdx], sections[idx]];
      return { ...prev, sections };
    });
    setExpandedIdx((prev: number | null) => prev === idx ? idx + dir : prev);
  };

  const handleSave = async () => {
    if (!selected) return;
    setSaving(true);
    try {
      await api.put(`/policies/${selected.slug}`, selected);
      await fetchPolicies();
      showSuccess('Policy saved successfully!');
    } catch (err) { showError('Error saving policy'); handleApiError(err); }
    finally { setSaving(false); }
  };

  const handleReset = async () => {
    if (!selected) return;
    if (!(await showConfirm(`Reset "${selected.title}" to default content? Your custom changes will be lost.`))) return;
    try {
      await api.delete(`/policies/${selected.slug}`);
      await fetchPolicies();
      const res = await api.get<Policy>(`/policies/${selected.slug}`);
      setSelected(res.data);
    } catch (err) { handleApiError(err); }
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
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="policy-editor-back" onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="policy-editor-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <FileText size={22} className="text-[#22c55e]" /> Policy Pages
            </h1>
            <p className="text-sm text-[#8b949e]">Edit shipping, privacy, and terms pages</p>
          </div>
          {selected && (
            <div className="flex items-center gap-2">
              <a
                href={`/policies/${selected.slug}`}
                target="_blank"
                rel="noopener noreferrer"
                data-testid="policy-preview-link"
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#2d333b] text-[#8b949e] hover:text-white transition-colors"
              >
                <Eye size={12} /> Preview
              </a>
              <button
                data-testid="policy-reset-btn"
                onClick={handleReset}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs border border-[#f59e0b]/30 text-[#f59e0b] hover:bg-[#f59e0b]/10 transition-colors"
              >
                <RotateCcw size={12} /> Reset to Default
              </button>
              <button
                data-testid="policy-save-btn"
                onClick={handleSave}
                disabled={saving}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-xs bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium transition-colors disabled:opacity-50"
              >
                {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
                {saving ? 'Saving...' : 'Save'}
              </button>
            </div>
          )}
        </div>

        <div className="grid grid-cols-12 gap-6">
          {/* Policy list sidebar */}
          <div className="col-span-3">
            <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <div className="px-4 py-3 border-b border-[#2d333b]">
                <span className="text-xs font-semibold text-[#8b949e] uppercase tracking-wider">Pages</span>
              </div>
              {policies.map(p => (
                <button
                  key={p.slug}
                  data-testid={`policy-tab-${p.slug}`}
                  onClick={() => handleSelectPolicy(p)}
                  className={`w-full text-left px-4 py-3 text-sm border-b border-[#2d333b]/50 transition-colors ${
                    selected?.slug === p.slug ? 'bg-[#22c55e]/10 text-[#22c55e]' : 'text-[#c9d1d9] hover:bg-[#1c2128]'
                  }`}
                >
                  {p.title}
                </button>
              ))}
            </div>
          </div>

          {/* Editor */}
          <div className="col-span-9">
            {selected ? (
              <div className="space-y-6">
                {/* Page Title & Date */}
                <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs text-[#8b949e] mb-1.5">Page Title</label>
                      <input
                        data-testid="policy-title-input"
                        value={selected.title}
                        onChange={e => handleFieldChange('title', e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[#8b949e] mb-1.5">Last Updated</label>
                      <input
                        data-testid="policy-date-input"
                        value={selected.last_updated}
                        onChange={e => handleFieldChange('last_updated', e.target.value)}
                        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                      />
                    </div>
                  </div>
                </div>

                {/* Sections */}
                {selected.sections?.map((section: PolicySection, i: number) => (
                  <div key={i} className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
                    {/* Section header - clickable */}
                    <div
                      data-testid={`section-toggle-${i}`}
                      onClick={() => setExpandedIdx(expandedIdx === i ? null : i)}
                      onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setExpandedIdx(expandedIdx === i ? null : i); } }}
                      role="button"
                      tabIndex={0}
                      className="w-full flex items-center gap-3 px-5 py-3.5 text-left hover:bg-[#1c2128] transition-colors cursor-pointer"
                    >
                      <GripVertical size={14} className="text-[#484f58]" />
                      <span className="flex-1 text-sm font-medium text-[#c9d1d9]">
                        {section.heading || `Section ${i + 1}`}
                      </span>
                      <div className="flex items-center gap-1">
                        <button onClick={e => { e.stopPropagation(); moveSection(i, -1); }} className="p-1 text-[#484f58] hover:text-white" title="Move up"><ChevronUp size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); moveSection(i, 1); }} className="p-1 text-[#484f58] hover:text-white" title="Move down"><ChevronDown size={14} /></button>
                        <button onClick={e => { e.stopPropagation(); removeSection(i); }} className="p-1 text-[#484f58] hover:text-red-400" title="Remove"><Trash2 size={14} /></button>
                      </div>
                      {expandedIdx === i ? <ChevronUp size={14} className="text-[#8b949e]" /> : <ChevronDown size={14} className="text-[#8b949e]" />}
                    </div>

                    {/* Expanded content */}
                    {expandedIdx === i && (
                      <div className="px-5 pb-5 space-y-4 border-t border-[#2d333b]">
                        <div className="pt-4">
                          <label className="block text-xs text-[#8b949e] mb-1.5">Heading</label>
                          <input
                            data-testid={`section-heading-${i}`}
                            value={section.heading}
                            onChange={e => handleSectionChange(i, 'heading', e.target.value)}
                            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                          />
                        </div>
                        <div>
                          <label className="block text-xs text-[#8b949e] mb-1.5">Body Text</label>
                          <textarea
                            data-testid={`section-body-${i}`}
                            value={section.body || ''}
                            onChange={e => handleSectionChange(i, 'body', e.target.value)}
                            rows={3}
                            className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] resize-y"
                          />
                        </div>
                        <div>
                          <div className="flex items-center justify-between mb-2">
                            <label className="text-xs text-[#8b949e]">Bullet Points</label>
                            <button
                              data-testid={`add-bullet-${i}`}
                              onClick={() => addBullet(i)}
                              className="flex items-center gap-1 text-[10px] text-[#22c55e] hover:underline"
                            >
                              <Plus size={10} /> Add Bullet
                            </button>
                          </div>
                          <div className="space-y-2">
                            {(section.bullets || []).map((bullet: string, j: number) => (
                              <div key={j} className="flex items-start gap-2">
                                <span className="mt-2.5 w-1.5 h-1.5 rounded-full bg-[#22c55e] flex-shrink-0" />
                                <input
                                  data-testid={`bullet-${i}-${j}`}
                                  value={bullet}
                                  onChange={e => handleBulletChange(i, j, e.target.value)}
                                  className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                                />
                                <button
                                  onClick={() => removeBullet(i, j)}
                                  className="mt-1 p-1 text-[#484f58] hover:text-red-400"
                                >
                                  <Trash2 size={12} />
                                </button>
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                ))}

                {/* Add section button */}
                <button
                  data-testid="add-section-btn"
                  onClick={addSection}
                  className="w-full border border-dashed border-[#2d333b] rounded-xl py-3 text-sm text-[#8b949e] hover:text-[#22c55e] hover:border-[#22c55e]/40 transition-colors flex items-center justify-center gap-2"
                >
                  <Plus size={14} /> Add Section
                </button>
              </div>
            ) : (
              <div className="border border-[#2d333b] rounded-xl p-12 text-center" style={{ backgroundColor: '#161b22' }}>
                <FileText size={40} className="mx-auto mb-3 text-[#484f58]" />
                <p className="text-[#8b949e]">Select a policy page to edit</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyEditor;
