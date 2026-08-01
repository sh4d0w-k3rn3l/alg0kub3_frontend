'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, showSuccess, handleApiError, showConfirm } from '@/lib/toast';
import { ApiError } from '@/lib/api';
import {
  ArrowLeft, Plus, Trash2, Edit3, ToggleLeft, ToggleRight,
  Loader2, Bell, Info, AlertTriangle, CheckCircle, X, Save,
  Eye, Megaphone, Link2, Sparkles, BookOpen, FileText,
} from 'lucide-react';

const TYPES = [
  { value: 'info', label: 'Info', icon: Info, color: '#3b82f6' },
  { value: 'warning', label: 'Warning', icon: AlertTriangle, color: '#f59e0b' },
  { value: 'success', label: 'Success', icon: CheckCircle, color: '#22c55e' },
  { value: 'urgent', label: 'Urgent', icon: Bell, color: '#ef4444' },
  { value: 'whats_new', label: "What's New", icon: Sparkles, color: '#a855f7' },
];

const KINDS = [
  { value: 'course',  label: 'Course',  icon: BookOpen, color: '#22c55e' },
  { value: 'feature', label: 'Feature', icon: Sparkles, color: '#06b6d4' },
  { value: 'post',    label: 'Post',    icon: FileText, color: '#a855f7' },
];

const AUDIENCES = [
  { value: 'all', label: 'All Users' },
  { value: 'pro', label: 'Pro Only' },
  { value: 'free', label: 'Free Only' },
];

interface Announcement { id: string; title: string; message: string; type: string; kind?: string; audience: string; active: boolean; dismissible: boolean; expires_at?: string; link?: string; created_at: string; dismiss_count?: number; }
interface AnnouncementForm { title: string; message: string; type: string; kind: string; audience: string; active: boolean; dismissible: boolean; expires_at: string; link: string; }

const emptyForm: AnnouncementForm = { title: '', message: '', type: 'info', kind: 'feature', audience: 'all', active: true, dismissible: true, expires_at: '', link: '' };

const Announcements = () => {
  const [items, setItems] = useState<Announcement[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [showEditor, setShowEditor] = useState<boolean>(false);
  const [form, setForm] = useState<AnnouncementForm>(emptyForm);
  const [editId, setEditId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [broadcasting, setBroadcasting] = useState<string | null>(null);
  const navigate = useRouter();
  
  const load = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<{ announcements: Announcement[] }>('/admin/announcements', { signal });
      if (signal?.aborted) return;
      setItems(res.data.announcements);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await load(ac.signal); })();
    return () => ac.abort();
  }, [load]);

  const openNew = () => {
    setForm(emptyForm);
    setEditId(null);
    setShowEditor(true);
  };

  const openEdit = (ann: Announcement) => {
    setForm({
      title: ann.title,
      message: ann.message,
      type: ann.type || 'info',
      kind: ann.kind || 'feature',
      audience: ann.audience || 'all',
      active: ann.active,
      dismissible: ann.dismissible !== false,
      expires_at: ann.expires_at ? ann.expires_at.slice(0, 16) : '',
      link: ann.link || '',
    });
    setEditId(ann.id);
    setShowEditor(true);
  };

  const save = async () => {
    if (!form.title.trim() || !form.message.trim()) return;
    setSaving(true);
    try {
      const payload = {
        ...form,
        expires_at: form.expires_at ? new Date(form.expires_at).toISOString() : null,
      };
      if (editId) {
        await api.put(`/admin/announcements/${editId}`, payload);
      } else {
        await api.post('/admin/announcements', payload);
      }
      setShowEditor(false);
      load();
    } catch (err) {
      showError('Save failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const toggleActive = async (ann: Announcement) => {
    try {
      await api.put(`/admin/announcements/${ann.id}`, { active: !ann.active });
      load();
    } catch {
      showError('Toggle failed');
    }
  };

  const remove = async (ann: Announcement) => {
    if (!(await showConfirm(`Delete announcement "${ann.title}"?`))) return;
    try {
      await api.delete(`/admin/announcements/${ann.id}`);
      load();
    } catch {
      showError('Delete failed');
    }
  };

  const broadcast = async (ann: Announcement) => {
    const audience = ann.audience === 'all' ? 'all users' : `${ann.audience} users`;
    if (!(await showConfirm(`Broadcast "${ann.title}" as a push notification to ${audience}?`))) return;
    setBroadcasting(ann.id);
    try {
      const res = await api.post<{ sent: number }>(`/admin/announcements/${ann.id}/broadcast`);
      showSuccess(`Notification sent to ${res.data.sent} users!`);
    } catch (err) {
      showError('Broadcast failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setBroadcasting(null);
    }
  };

  if (loading) return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-6">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="announcements-title" className="text-2xl font-bold text-white">Announcements</h1>
            <p className="text-sm text-[#8b949e]">{items.length} total &middot; {items.filter(a => a.active).length} active</p>
          </div>
          <button
            data-testid="create-announcement-btn"
            onClick={openNew}
            className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={14} /> New Announcement
          </button>
        </div>

        {/* Announcements List */}
        <div className="space-y-3">
          {items.map(ann => {
            const typeConfig = TYPES.find(t => t.value === ann.type) || TYPES[0];
            const Icon = typeConfig.icon;
            return (
              <div
                key={ann.id}
                data-testid={`admin-ann-${ann.id}`}
                className="border border-[#2d333b] rounded-xl p-4 transition-colors hover:border-[#444c56]"
                style={{ backgroundColor: '#161b22' }}
              >
                <div className="flex items-start gap-4">
                  <div className="w-9 h-9 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: `${typeConfig.color}18` }}>
                    <Icon size={16} style={{ color: typeConfig.color }} />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1 flex-wrap">
                      <h3 className="text-sm font-medium text-[#c9d1d9]">{ann.title}</h3>
                      <span className={`text-xs px-1.5 py-0.5 rounded-full ${ann.active ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#8b949e20] text-[#8b949e]'}`}>
                        {ann.active ? 'Active' : 'Inactive'}
                      </span>
                      <span className="text-xs px-1.5 py-0.5 rounded-full bg-[#3b82f620] text-[#3b82f6] capitalize">{ann.audience}</span>
                      {ann.type === 'whats_new' && (() => {
                        const k = KINDS.find(kk => kk.value === (ann.kind || 'feature')) || KINDS[1];
                        return (
                          <span className="text-[10px] font-bold tracking-wider uppercase px-1.5 py-0.5 rounded" style={{ color: k.color, border: `1px solid ${k.color}50`, backgroundColor: `${k.color}10` }}>
                            What&apos;s New · {k.label}
                          </span>
                        );
                      })()}
                    </div>
                    <p className="text-sm text-[#8b949e] line-clamp-2">{ann.message}</p>
                    <div className="flex items-center gap-4 mt-2">
                      <span className="text-xs text-[#484f58]">{new Date(ann.created_at).toLocaleDateString()}</span>
                      {ann.expires_at && <span className="text-xs text-[#484f58]">Expires: {new Date(ann.expires_at).toLocaleDateString()}</span>}
                      <span className="text-xs text-[#484f58] flex items-center gap-1"><Eye size={10} /> {ann.dismiss_count || 0} dismissed</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      data-testid={`broadcast-ann-${ann.id}`}
                      onClick={() => broadcast(ann)}
                      disabled={broadcasting === ann.id}
                      className="p-2 rounded-lg hover:bg-[#1c2128] text-[#f59e0b] transition-colors"
                      title="Broadcast to notification center"
                    >
                      {broadcasting === ann.id ? <Loader2 size={14} className="animate-spin" /> : <Megaphone size={14} />}
                    </button>
                    <button
                      data-testid={`toggle-ann-${ann.id}`}
                      onClick={() => toggleActive(ann)}
                      className="p-2 rounded-lg hover:bg-[#1c2128] text-[#8b949e] transition-colors"
                      title={ann.active ? 'Deactivate' : 'Activate'}
                    >
                      {ann.active ? <ToggleRight size={16} className="text-[#22c55e]" /> : <ToggleLeft size={16} />}
                    </button>
                    <button
                      data-testid={`edit-ann-${ann.id}`}
                      onClick={() => openEdit(ann)}
                      className="p-2 rounded-lg hover:bg-[#1c2128] text-[#8b949e] transition-colors"
                    >
                      <Edit3 size={14} />
                    </button>
                    <button
                      data-testid={`delete-ann-${ann.id}`}
                      onClick={() => remove(ann)}
                      className="p-2 rounded-lg hover:bg-[#1c2128] text-[#ef4444] transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
          {items.length === 0 && (
            <div className="text-center py-16 border border-[#2d333b] rounded-xl" style={{ backgroundColor: '#161b22' }}>
              <Bell size={24} className="text-[#484f58] mx-auto mb-3" />
              <p className="text-sm text-[#8b949e]">No announcements yet</p>
              <p className="text-xs text-[#484f58] mt-1">Create one to notify your users</p>
            </div>
          )}
        </div>

        {/* Editor Modal */}
        {showEditor && (
          <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
            <div className="w-full max-w-lg border border-[#2d333b] rounded-xl p-6" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-5">
                <h3 className="text-lg font-bold text-white">{editId ? 'Edit' : 'New'} Announcement</h3>
                <button onClick={() => setShowEditor(false)} className="text-[#8b949e] hover:text-white"><X size={18} /></button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Title</label>
                  <input
                    data-testid="ann-title-input"
                    value={form.title}
                    onChange={e => setForm({ ...form, title: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                    placeholder="Announcement title"
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Message</label>
                  <textarea
                    data-testid="ann-message-input"
                    value={form.message}
                    onChange={e => setForm({ ...form, message: e.target.value })}
                    className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] h-20 resize-none"
                    placeholder="Announcement message..."
                  />
                </div>
                <div>
                  <label className="text-xs text-[#8b949e] mb-1 block">Link (optional)</label>
                  <div className="relative">
                    <Link2 size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#484f58]" />
                    <input
                      data-testid="ann-link-input"
                      value={form.link}
                      onChange={e => setForm({ ...form, link: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg pl-9 pr-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e]"
                      placeholder="/course/go or https://..."
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Type</label>
                    <div className="grid grid-cols-2 gap-2">
                      {TYPES.map(tp => (
                        <button
                          key={tp.value}
                          data-testid={`ann-type-${tp.value}`}
                          onClick={() => setForm({ ...form, type: tp.value })}
                          className={`flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all whitespace-nowrap ${
                            form.type === tp.value
                              ? `border-current`
                              : 'border-[#2d333b] hover:border-[#444c56]'
                          }`}
                          style={{ color: form.type === tp.value ? tp.color : '#8b949e' }}
                        >
                          <tp.icon size={12} /> {tp.label}
                        </button>
                      ))}
                    </div>
                    {form.type === 'whats_new' && (
                      <p className="text-[10px] text-[#a855f7] mt-1.5 leading-snug">
                        Appears in the site-wide <strong>More → What&apos;s New</strong> dropdown. Pick a kind below.
                      </p>
                    )}
                  </div>
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Audience</label>
                    <select
                      data-testid="ann-audience-select"
                      value={form.audience}
                      onChange={e => setForm({ ...form, audience: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none"
                    >
                      {AUDIENCES.map(a => <option key={a.value} value={a.value}>{a.label}</option>)}
                    </select>
                  </div>
                </div>

                {form.type === 'whats_new' && (
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Kind <span className="text-[#484f58]">(colors the tag in the dropdown)</span></label>
                    <div className="grid grid-cols-3 gap-2">
                      {KINDS.map(k => (
                        <button
                          key={k.value}
                          data-testid={`ann-kind-${k.value}`}
                          onClick={() => setForm({ ...form, kind: k.value })}
                          className={`flex items-center justify-center gap-1.5 px-2.5 py-1.5 rounded-lg border text-xs transition-all ${
                            form.kind === k.value ? 'border-current' : 'border-[#2d333b] hover:border-[#444c56]'
                          }`}
                          style={{ color: form.kind === k.value ? k.color : '#8b949e' }}
                        >
                          <k.icon size={12} /> {k.label}
                        </button>
                      ))}
                    </div>
                  </div>
                )}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-[#8b949e] mb-1 block">Expires At (optional)</label>
                    <input
                      data-testid="ann-expires-input"
                      type="datetime-local"
                      value={form.expires_at}
                      onChange={e => setForm({ ...form, expires_at: e.target.value })}
                      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none"
                    />
                  </div>
                  <div className="flex items-end gap-4 pb-1">
                    <label className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer">
                      <input type="checkbox" checked={form.dismissible} onChange={e => setForm({ ...form, dismissible: e.target.checked })} className="rounded" />
                      Dismissible
                    </label>
                    <label className="flex items-center gap-2 text-sm text-[#c9d1d9] cursor-pointer">
                      <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="rounded" />
                      Active
                    </label>
                  </div>
                </div>
              </div>
              <div className="flex justify-end gap-2 mt-6">
                <button onClick={() => setShowEditor(false)} className="px-4 py-2 text-sm text-[#8b949e] hover:text-white transition-colors">Cancel</button>
                <button
                  data-testid="save-announcement-btn"
                  onClick={save}
                  disabled={saving || !form.title.trim() || !form.message.trim()}
                  className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                  {editId ? 'Update' : 'Create'}
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Announcements;
