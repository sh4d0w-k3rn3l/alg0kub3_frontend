'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { showConfirm } from '@/lib/toast';
import { invalidateNavCache } from '@/config/navigation';
import type { NavLink, FooterSection, SocialLink } from '@/types';
import {
  ArrowLeft, Plus, Trash2, Save, Loader2, Eye, EyeOff, ChevronUp, ChevronDown,
  RotateCcw, AlertCircle, Check, Layout, PanelBottom,
  Code as CodeIcon, Server as SvrIcon, Braces as BrIcon, Target as TgIcon,
} from 'lucide-react';

const ICON_OPTIONS = [
  { value: 'Code',   label: 'Code',   Icon: CodeIcon },
  { value: 'Server', label: 'Server', Icon: SvrIcon },
  { value: 'Braces', label: 'Braces', Icon: BrIcon },
  { value: 'Target', label: 'Target', Icon: TgIcon },
];

const uid = (prefix = 'id') => `${prefix}_${Math.random().toString(36).slice(2, 10)}`;

// ────────────────────────────────────────────────────────────
// Generic editable row (label + path + visibility + remove)
// ────────────────────────────────────────────────────────────
interface RowField {
  key: string; placeholder?: string; type?: string; label?: string; size?: string; options?: { value: string; label: string }[];
}
const Row = ({ item, idx, total, fields, onChange, onRemove, onMove }: { item: NavLink; idx: number; total: number; fields: RowField[]; onChange: (item: NavLink) => void; onRemove: () => void; onMove: (from: number, to: number) => void; }) => {
  const update = (key: string, value: string | boolean) => onChange({ ...item, [key]: value });
  return (
    <div className="flex items-start gap-2 bg-[#0d1117] border border-[#1e2533] rounded-lg p-2.5 group">
      <div className="flex flex-col gap-0.5 mt-1">
        <button onClick={() => onMove(idx, idx - 1)} disabled={idx === 0}
          className="text-[#484f58] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
          data-testid={`row-up-${idx}`}><ChevronUp size={12} /></button>
        <button onClick={() => onMove(idx, idx + 1)} disabled={idx === total - 1}
          className="text-[#484f58] hover:text-white disabled:opacity-30 disabled:cursor-not-allowed p-0.5"
          data-testid={`row-down-${idx}`}><ChevronDown size={12} /></button>
      </div>

      <div className="flex-1 grid gap-1.5" style={{ gridTemplateColumns: fields.map(f => f.size || '1fr').join(' ') }}>
        {fields.map(f => (
          f.type === 'checkbox' ? (
            <label key={f.key} className="flex items-center gap-1.5 text-[11px] text-[#8b949e] cursor-pointer self-center">
              <input
                type="checkbox" checked={!!item[f.key as keyof NavLink]}
                onChange={e => update(f.key, e.target.checked)}
                className="w-3 h-3 rounded bg-[#0d1117] border border-[#2d333b]"
              />
              {f.label}
            </label>
          ) : f.type === 'select' ? (
            <select key={f.key} value={(item[f.key as keyof NavLink] as string) || ''} onChange={e => update(f.key as keyof NavLink, e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-white focus:border-[#22c55e] outline-none">
              {(f.options ?? []).map((o: { value: string; label: string }) => <option key={o.value} value={o.value}>{o.label}</option>)}
            </select>
          ) : (
            <input key={f.key}
              type={f.type || 'text'}
              placeholder={f.placeholder}
              value={(item[f.key as keyof NavLink] as string) || ''}
              onChange={e => update(f.key as keyof NavLink, e.target.value)}
              className="bg-[#161b22] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-white focus:border-[#22c55e] outline-none placeholder:text-[#484f58]"
            />
          )
        ))}
      </div>

      <button onClick={() => update('visible', !item.visible)} title={item.visible ? 'Visible' : 'Hidden'}
        className={`p-1.5 rounded transition-colors mt-0.5 ${item.visible ? 'text-[#22c55e] hover:bg-[#22c55e]/10' : 'text-[#8b949e] hover:bg-[#484f58]/20'}`}
        data-testid={`row-toggle-${idx}`}>
        {item.visible ? <Eye size={14} /> : <EyeOff size={14} />}
      </button>
      <button onClick={onRemove} className="text-[#8b949e] hover:text-[#ef4444] p-1.5 rounded transition-colors mt-0.5"
        data-testid={`row-remove-${idx}`}>
        <Trash2 size={14} />
      </button>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// List builder: manages an array of items with add/edit/delete/reorder
// ────────────────────────────────────────────────────────────
const ListBuilder = ({ title, subtitle, items, setItems, fields, makeEmpty, testId }: { title: string; subtitle: string; items: NavLink[]; setItems: (items: NavLink[]) => void; fields: RowField[]; makeEmpty: () => NavLink; testId: string; }) => {
  const update = (idx: number, next: NavLink) => {
    const copy = [...items];
    copy[idx] = next;
    setItems(copy);
  };
  const move = (from: number, to: number) => {
    if (to < 0 || to >= items.length) return;
    const copy = [...items];
    const [r] = copy.splice(from, 1);
    copy.splice(to, 0, r);
    copy.forEach((it, i) => { it.order = i; });
    setItems(copy);
  };
  const remove = (idx: number) => setItems(items.filter((_: NavLink, i: number) => i !== idx));
  const add = () => setItems([...items, { ...makeEmpty(), order: items.length, visible: true }]);

  return (
    <div className="bg-[#161b22] border border-[#2d333b] rounded-lg p-4" data-testid={testId}>
      <div className="flex items-center justify-between mb-1">
        <h3 className="text-white text-sm font-semibold">{title}</h3>
        <button onClick={add}
          className="flex items-center gap-1 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium px-2.5 py-1 rounded transition-colors"
          data-testid={`${testId}-add`}>
          <Plus size={12} /> Add
        </button>
      </div>
      {subtitle && <p className="text-[11px] text-[#8b949e] mb-3">{subtitle}</p>}
      <div className="space-y-2">
        {items.length === 0 && (
          <div className="text-center text-[#484f58] text-xs py-6">No items yet. Click <strong>Add</strong> to create one.</div>
        )}
        {items.map((it: NavLink, idx) => (
          <Row key={it.id || idx} item={it} idx={idx} total={items.length} fields={fields}
            onChange={(n) => update(idx, n)} onMove={move} onRemove={() => remove(idx)} />
        ))}
      </div>
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Header editor
// ────────────────────────────────────────────────────────────
interface NavigationConfigType {
  primary_links?: NavLink[];
  practice_items?: NavLink[];
  more_items?: NavLink[];
  tagline?: string;
  copyright?: string;
  sections?: FooterSection[];
  legal_links?: NavLink[];
  social_links?: SocialLink[];
}
const HeaderEditor = ({ cfg, setCfg }: { cfg: NavigationConfigType; setCfg: (cfg: NavigationConfigType) => void; }) => (
  <div className="space-y-5">
    <ListBuilder
      title="Primary Nav Links"
      subtitle="Shown inline between Practice and More. Keep to 3-5 for best fit."
      items={(cfg?.primary_links as unknown as NavLink[]) ?? []}
      setItems={(items) => setCfg({ ...cfg, primary_links: items })}
      fields={[
        { key: 'label', placeholder: 'Label', size: '1fr' },
        { key: 'path',  placeholder: '/path', size: '1.5fr' },
        { key: 'is_new', type: 'checkbox', label: 'New dot', size: '0.6fr' },
      ]}
      makeEmpty={() => ({ id: uid('pl'), label: '', path: '', is_new: false })}
      testId="nav-primary-links"
    />

    <ListBuilder
      title="Practice Dropdown"
      subtitle="Items in the Practice dropdown menu."
      items={(cfg?.practice_items as unknown as NavLink[]) ?? []}
      setItems={(items) => setCfg({ ...cfg, practice_items: items })}
      fields={[
        { key: 'label', placeholder: 'Label',       size: '1fr' },
        { key: 'desc',  placeholder: 'Description', size: '1.5fr' },
        { key: 'path',  placeholder: '/path',       size: '1fr' },
        { key: 'icon', type: 'select', options: ICON_OPTIONS.map(o => ({ value: o.value, label: o.label })), size: '0.8fr' },
        { key: 'is_new', type: 'checkbox', label: 'New', size: '0.5fr' },
      ]}
      makeEmpty={() => ({ id: uid('pr'), label: '', desc: '', path: '', icon: 'Code', is_new: false })}
      testId="nav-practice-items"
    />

    <ListBuilder
      title="More Dropdown — Explore Items"
      subtitle="Secondary nav shown inside the More dropdown. What's New items are managed via Announcements."
      items={(cfg?.more_items as unknown as NavLink[]) ?? []}
      setItems={(items) => setCfg({ ...cfg, more_items: items })}
      fields={[
        { key: 'label', placeholder: 'Label',       size: '1fr' },
        { key: 'desc',  placeholder: 'Description', size: '2fr' },
        { key: 'path',  placeholder: '/path',       size: '1fr' },
      ]}
      makeEmpty={() => ({ id: uid('mr'), label: '', desc: '', path: '' })}
      testId="nav-more-items"
    />
  </div>
);

// ────────────────────────────────────────────────────────────
// Footer editor
// ────────────────────────────────────────────────────────────
const SectionEditor = ({ section, onChange, onRemove, idx, total, onMove }: { section: FooterSection; onChange: (section: FooterSection) => void; onRemove: () => void; idx: number; total: number; onMove: (from: number, to: number) => void; }) => {
  const update = (k: string, v: string | boolean | number) => onChange({ ...section, [k]: v });
  const updateLinks = (links: NavLink[]) => onChange({ ...section, links });

  return (
    <div className="bg-[#161b22] border border-[#2d333b] rounded-lg p-4" data-testid={`footer-section-${idx}`}>
      <div className="flex items-center gap-2 mb-3">
        <div className="flex flex-col gap-0.5">
          <button onClick={() => onMove(idx, idx - 1)} disabled={idx === 0} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ChevronUp size={12} /></button>
          <button onClick={() => onMove(idx, idx + 1)} disabled={idx === total - 1} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ChevronDown size={12} /></button>
        </div>
        <input
          value={section.title}
          onChange={e => update('title', e.target.value)}
          placeholder="Section title"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-3 py-1.5 text-sm text-white font-semibold focus:border-[#22c55e] outline-none"
        />
        <label className="flex items-center gap-1.5 text-[11px] text-[#8b949e] cursor-pointer">
          <input type="checkbox" checked={!!section.dynamic_courses}
            onChange={e => update('dynamic_courses', e.target.checked)} className="w-3 h-3" />
          Auto-list Courses
        </label>
        <button onClick={() => update('visible', !section.visible)} title={section.visible ? 'Visible' : 'Hidden'}
          className={`p-1.5 rounded ${section.visible ? 'text-[#22c55e]' : 'text-[#8b949e]'}`}>
          {section.visible ? <Eye size={14} /> : <EyeOff size={14} />}
        </button>
        <button onClick={onRemove} className="text-[#8b949e] hover:text-[#ef4444] p-1.5 rounded"><Trash2 size={14} /></button>
      </div>

      {section.dynamic_courses ? (
        <div className="pl-7">
          <div className="flex items-center gap-2 bg-[#0d1117] border border-[#1e2533] rounded p-2 mb-2">
            <span className="text-[11px] text-[#8b949e]">Auto-inject top</span>
            <input type="number" min="1" max="20" value={section.dynamic_courses_limit || 8}
              onChange={e => update('dynamic_courses_limit', parseInt(e.target.value) || 8)}
              className="w-14 bg-[#161b22] border border-[#2d333b] rounded px-2 py-1 text-xs text-white focus:border-[#22c55e] outline-none" />
            <span className="text-[11px] text-[#8b949e]">published courses</span>
          </div>
          <p className="text-[11px] text-[#484f58] italic">Courses are pulled from the database — no manual list needed.</p>
        </div>
      ) : (
        <div className="pl-7">
          <ListBuilder
            title="Links"
            subtitle=""
            items={section.links || []}
            setItems={updateLinks}
            fields={[
              { key: 'label',    placeholder: 'Label',   size: '1fr' },
              { key: 'path',     placeholder: '/path or https://…', size: '2fr' },
              { key: 'external', type: 'checkbox', label: 'External', size: '0.7fr' },
            ]}
            makeEmpty={() => ({ id: uid('fl'), label: '', path: '', external: false })}
            testId={`section-links-${idx}`}
          />
        </div>
      )}
    </div>
  );
};

const FooterEditor = ({ cfg, setCfg }: { cfg: NavigationConfigType; setCfg: (cfg: NavigationConfigType) => void; }) => {
  const update = (k: string, v: unknown) => setCfg({ ...cfg, [k]: v });
  const moveSection = (from: number, to: number) => {
    if (to < 0 || to >= (cfg?.sections as unknown[])?.length) return;
    const copy = [...(cfg?.sections as unknown[] ?? [])];
    const [r] = copy.splice(from, 1);
    copy.splice(to, 0, r);
    (copy as Record<string, unknown>[]).forEach((s, i) => { s.order = i as unknown as number; });
    update('sections', copy);
  };
  const updateSection = (idx: number, next: FooterSection) => {
    const copy = [...(cfg?.sections as unknown as Record<string, unknown>[] ?? [])]; copy[idx] = next as unknown as Record<string, unknown>; update('sections', copy);
  };
  const removeSection = (idx: number) => update('sections', (cfg?.sections as unknown as Record<string, unknown>[] ?? []).filter((_: Record<string, unknown>, i: number) => i !== idx));
  const addSection = () => update('sections', [...(cfg?.sections as unknown as Record<string, unknown>[] ?? []), {
    id: uid('sec'), title: 'New Section', visible: true, order: ((cfg?.sections as unknown as Record<string, unknown>[])?.length ?? 0), dynamic_courses: false, links: [],
  }]);

  return (
    <div className="space-y-5">
      {/* Tagline + Copyright */}
      <div className="bg-[#161b22] border border-[#2d333b] rounded-lg p-4 space-y-3">
        <h3 className="text-white text-sm font-semibold">Brand</h3>
        <div>
          <label className="text-[11px] text-[#8b949e] mb-1 block">Tagline</label>
          <input value={(cfg?.tagline as string) ?? ''} onChange={e => update('tagline', e.target.value)}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-1.5 text-sm text-white focus:border-[#22c55e] outline-none"
            data-testid="footer-tagline" />
        </div>
        <div>
          <label className="text-[11px] text-[#8b949e] mb-1 block">Copyright <span className="text-[#484f58]">(use {'{year}'} for the current year)</span></label>
          <input value={(cfg?.copyright as string) ?? ''} onChange={e => update('copyright', e.target.value)}
            className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-1.5 text-sm text-white focus:border-[#22c55e] outline-none"
            data-testid="footer-copyright" />
        </div>
      </div>

      {/* Sections */}
      <div className="flex items-center justify-between">
        <h3 className="text-white text-sm font-semibold">Footer Sections</h3>
        <button onClick={addSection}
          className="flex items-center gap-1 bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium px-2.5 py-1 rounded"
          data-testid="footer-add-section"><Plus size={12} /> Add Section</button>
      </div>
      <div className="space-y-3">
        {((cfg?.sections as unknown as Record<string, unknown>[]) ?? []).map((sec, idx) => (
          <SectionEditor
            key={(sec.id as string)} section={sec as unknown as FooterSection} idx={idx} total={((cfg?.sections as unknown as Record<string, unknown>[]) ?? []).length}
            onChange={(n) => updateSection(idx, n)}
            onRemove={() => removeSection(idx)}
            onMove={moveSection}
          />
        ))}
      </div>

      {/* Legal */}
      <ListBuilder
        title="Legal Links (Bottom Bar)"
        subtitle="Small text links shown in the copyright row."
        items={(cfg?.legal_links as unknown as NavLink[]) ?? []}
        setItems={(items) => update('legal_links', items)}
        fields={[
          { key: 'label', placeholder: 'Label', size: '1fr' },
          { key: 'path',  placeholder: '/path', size: '2fr' },
        ]}
        makeEmpty={() => ({ id: uid('lg'), label: '', path: '' })}
        testId="footer-legal-links"
      />

      {/* Social */}
      <ListBuilder
        title="Social Links"
        subtitle="Icons shown in the copyright row. Use full URLs (https:// or mailto:)."
        items={(cfg?.social_links as unknown as NavLink[]) ?? []}
        setItems={(items) => update('social_links', items)}
        fields={[
          { key: 'icon', type: 'select', size: '0.8fr', options: [
            { value: 'ExternalLink', label: 'ExternalLink' },
            { value: 'Mail',         label: 'Mail' },
            { value: 'Github',       label: 'GitHub' },
            { value: 'Twitter',      label: 'Twitter' },
            { value: 'Linkedin',     label: 'LinkedIn' },
            { value: 'Youtube',      label: 'YouTube' },
          ] },
          { key: 'url',        placeholder: 'https://… or mailto:…', size: '2fr' },
          { key: 'aria_label', placeholder: 'Accessible label',       size: '1fr' },
        ]}
        makeEmpty={() => ({ id: uid('so'), icon: 'ExternalLink', url: '', aria_label: '' } as unknown as NavLink)}
        testId="footer-social-links"
      />
    </div>
  );
};

// ────────────────────────────────────────────────────────────
// Top-level editor
// ────────────────────────────────────────────────────────────
const NavigationEditor = () => {
  const navigate = useRouter();
  const [area, setArea] = useState('header');
  const [cfg, setCfg] = useState<NavigationConfigType | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [msg, setMsg] = useState<string>('');
  const [err, setErr] = useState<string>('');

  const load = useCallback(async (a: string, signal?: AbortSignal) => {
    setLoading(true);
    setErr(''); setMsg('');
    try {
      const res = await api.get<{ config: NavigationConfigType }>(`/admin/navigation/${a}`, { signal });
      if (signal?.aborted) return;
      setCfg(res.data.config);
    } catch (e) {
      if (e instanceof DOMException && e.name === 'AbortError') return;
      setErr((e as ApiError).detail || 'Failed to load');
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(area, ac.signal);
    return () => ac.abort();
  }, [area, load]);

  const save = async () => {
    setSaving(true);
    setErr(''); setMsg('');
    try {
      await api.put(`/admin/navigation/${area}`, { config: cfg }, {
        headers: { 'Content-Type': 'application/json' } as Record<string, string>,
      });
      invalidateNavCache(area);
      setMsg(`${area[0].toUpperCase() + area.slice(1)} saved. Live on all pages (hard-refresh to see instantly).`);
      setTimeout(() => setMsg(''), 5000);
    } catch (e) {
      setErr((e as ApiError).detail || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const reset = async () => {
    if (!(await showConfirm(`Reset ${area} to factory defaults? This cannot be undone.`))) return;
    setSaving(true);
    try {
      const res = await api.post<{ config: NavigationConfigType }>(`/admin/navigation/${area}/reset`, {});
      setCfg(res.data.config);
      invalidateNavCache(area);
      setMsg('Reset to defaults.');
      setTimeout(() => setMsg(''), 3000);
    } catch (e) {
      setErr((e as ApiError).detail || 'Reset failed');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0d1117]">
      <div className="sticky top-0 z-10 bg-[#0d1117]/90 backdrop-blur border-b border-[#1e2533] px-6 py-3 flex items-center gap-3">
        <button onClick={() => navigate.push('/admin')} className="flex items-center gap-1 text-[#8b949e] hover:text-white text-sm" data-testid="nav-back">
          <ArrowLeft size={14} /> Admin
        </button>
        <div className="h-5 w-px bg-[#2d333b]" />
        <h1 className="text-white text-base font-semibold">Navigation Editor</h1>

        <div className="flex-1" />

        <div className="flex items-center bg-[#161b22] border border-[#2d333b] rounded-lg p-0.5">
          <button onClick={() => setArea('header')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${area === 'header' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] hover:text-white'}`}
            data-testid="nav-tab-header">
            <Layout size={12} /> Header
          </button>
          <button onClick={() => setArea('footer')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-medium transition-colors ${area === 'footer' ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] hover:text-white'}`}
            data-testid="nav-tab-footer">
            <PanelBottom size={12} /> Footer
          </button>
        </div>

        <button onClick={reset} disabled={saving || loading}
          className="flex items-center gap-1.5 border border-[#2d333b] text-[#8b949e] hover:text-white hover:border-[#484f58] px-3 py-1.5 rounded text-xs disabled:opacity-50 transition-colors"
          data-testid="nav-reset">
          <RotateCcw size={12} /> Reset
        </button>
        <button onClick={save} disabled={saving || loading || !cfg}
          className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white font-medium px-4 py-1.5 rounded text-xs transition-colors"
          data-testid="nav-save">
          {saving ? <Loader2 size={12} className="animate-spin" /> : <Save size={12} />}
          {saving ? 'Saving…' : 'Save'}
        </button>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-6">
        {msg && (
          <div className="mb-4 flex items-center gap-2 bg-[#22c55e]/10 border border-[#22c55e]/30 text-[#22c55e] rounded p-3 text-sm" data-testid="nav-msg">
            <Check size={14} /> {msg}
          </div>
        )}
        {err && (
          <div className="mb-4 flex items-center gap-2 bg-[#ef4444]/10 border border-[#ef4444]/30 text-[#f87171] rounded p-3 text-sm" data-testid="nav-err">
            <AlertCircle size={14} /> {err}
          </div>
        )}

        {loading || !cfg ? (
          <div className="flex items-center justify-center py-20 text-[#8b949e] gap-2">
            <Loader2 size={14} className="animate-spin" /> Loading {area}…
          </div>
        ) : (
          area === 'header' ? <HeaderEditor cfg={cfg} setCfg={setCfg} /> : <FooterEditor cfg={cfg} setCfg={setCfg} />
        )}
      </div>
    </div>
  );
};

export default NavigationEditor;
