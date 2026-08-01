'use client';
import React, { useCallback, useEffect, useMemo, useRef, useState, createElement } from 'react';
import Image from 'next/image';
import Editor from '@monaco-editor/react';
import mermaid from 'mermaid';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import {
  Plus, Trash2, ChevronUp, ChevronDown, Copy, GripVertical,
  Type, Hash, Code, AlertCircle, AlertTriangle, Info, Lightbulb,
  ChevronRight, CreditCard, ListOrdered, List, Table2, Quote, Image as ImageIcon,
  Minus, Layers, LayoutGrid, Sparkles, Loader2, X, Search, Check,
  Youtube, Video, Play, GitBranch, RefreshCw, Upload
} from 'lucide-react';

import { handleApiError } from '@/lib/toast';
import { sanitizeHtml } from '@/lib/sanitize';
import RichTextEditor from './RichTextEditor';

type MermaidConfig = Parameters<typeof mermaid.initialize>[0];
type LucideIcon = React.ComponentType<{ size?: number; className?: string }>;

interface EditorBlock {
  id?: string;
  type: string;
  text?: string;
  title?: string;
  level?: number;
  code?: string;
  language?: string;
  lineNumbers?: boolean;
  runnable?: boolean;
  expandable?: boolean;
  highlight?: string;
  url?: string;
  alt?: string;
  caption?: string;
  variant?: string;
  theme?: string;
  videoId?: string;
  startTime?: string;
  autoplay?: boolean;
  poster?: string;
  controls?: boolean;
  loop?: boolean;
  muted?: boolean;
  headerColor?: string;
  headerTextColor?: string;
  headers?: string[];
  rows?: string[][];
  ordered?: boolean;
  icon?: string;
  items?: EditorBlock[] | string[];
  tabs?: { label: string; language?: string; code?: string; text?: string }[];
  href?: string;
}

// Initialize mermaid
mermaid.initialize({
  startOnLoad: false,
  theme: 'dark',
  securityLevel: 'strict',
  fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
} as MermaidConfig);

// ========== BLOCK DEFINITIONS ==========
const BLOCK_TYPES = [
  { type: 'paragraph', label: 'Paragraph', icon: Type, description: 'Rich text with bold, italic, colors, links', category: 'Text', shortcut: 'p' },
  { type: 'heading', label: 'Heading', icon: Hash, description: 'Section header (H2, H3, H4)', category: 'Text', shortcut: 'h' },
  { type: 'blockquote', label: 'Blockquote', icon: Quote, description: 'Highlighted quote block', category: 'Text', shortcut: 'q' },
  { type: 'divider', label: 'Divider', icon: Minus, description: 'Horizontal separator', category: 'Text', shortcut: 'd' },
  { type: 'code', label: 'Code Block', icon: Code, description: 'Syntax highlighted code', category: 'Code', shortcut: 'c' },
  { type: 'codegroup', label: 'Code Group', icon: Layers, description: 'Tabbed multi-language code', category: 'Code', shortcut: 'cg' },
  { type: 'mermaid', label: 'Mermaid Diagram', icon: GitBranch, description: 'Flowcharts, sequences, ER diagrams', category: 'Code', shortcut: 'mermaid' },
  { type: 'callout_note', label: 'Note', icon: Info, description: 'Informational callout', category: 'Callouts', shortcut: 'note' },
  { type: 'callout_warning', label: 'Warning', icon: AlertTriangle, description: 'Warning callout', category: 'Callouts', shortcut: 'warn' },
  { type: 'callout_tip', label: 'Tip', icon: Lightbulb, description: 'Helpful tip callout', category: 'Callouts', shortcut: 'tip' },
  { type: 'callout_error', label: 'Error', icon: AlertCircle, description: 'Error/danger callout', category: 'Callouts', shortcut: 'err' },
  { type: 'accordion', label: 'Accordion', icon: ChevronRight, description: 'Collapsible content section', category: 'Interactive', shortcut: 'acc' },
  { type: 'tabs', label: 'Tabs', icon: LayoutGrid, description: 'Tabbed content panels', category: 'Interactive', shortcut: 'tab' },
  { type: 'steps', label: 'Steps', icon: ListOrdered, description: 'Numbered step-by-step guide', category: 'Interactive', shortcut: 'steps' },
  { type: 'card', label: 'Card', icon: CreditCard, description: 'Content card with title & icon', category: 'Layout', shortcut: 'card' },
  { type: 'list', label: 'Bullet List', icon: List, description: 'Unordered list', category: 'Lists', shortcut: 'ul' },
  { type: 'ordered_list', label: 'Numbered List', icon: ListOrdered, description: 'Ordered list', category: 'Lists', shortcut: 'ol' },
  { type: 'table', label: 'Table', icon: Table2, description: 'Data table', category: 'Data', shortcut: 'table' },
  { type: 'image', label: 'Image', icon: ImageIcon, description: 'Image with caption', category: 'Media', shortcut: 'img' },
  { type: 'youtube', label: 'YouTube', icon: Youtube, description: 'Embed YouTube video', category: 'Media', shortcut: 'yt' },
  { type: 'vimeo', label: 'Vimeo', icon: Video, description: 'Embed Vimeo video', category: 'Media', shortcut: 'vim' },
  { type: 'loom', label: 'Loom', icon: Video, description: 'Embed Loom recording', category: 'Media', shortcut: 'loom' },
  { type: 'video', label: 'Video', icon: Video, description: 'Embed video file (MP4, WebM)', category: 'Media', shortcut: 'vid' },
];

const LANGUAGES = ['python', 'java', 'javascript', 'typescript', 'go', 'sql', 'bash', 'html', 'css', 'json', 'yaml', 'rust', 'c', 'cpp', 'ruby', 'php', 'swift', 'kotlin'];

function createDefaultBlock(type: string) {
  const id = `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
  switch (type) {
    case 'paragraph': return { id, type: 'paragraph', text: '' };
    case 'heading': return { id, type: 'heading', text: '', level: 2 };
    case 'subheading': return { id, type: 'subheading', text: '' };
    case 'blockquote': return { id, type: 'blockquote', text: '' };
    case 'divider': return { id, type: 'divider' };
    case 'code': return { id, type: 'code', code: '', language: 'python', title: '', runnable: true, lineNumbers: false, expandable: false, highlight: '' };
    case 'codegroup': return { id, type: 'codegroup', tabs: [{ label: 'Python', language: 'python', code: '' }, { label: 'JavaScript', language: 'javascript', code: '' }] };
    case 'callout_note': return { id, type: 'callout', variant: 'note', title: 'Note', text: '' };
    case 'callout_warning': return { id, type: 'callout', variant: 'warning', title: 'Warning', text: '' };
    case 'callout_tip': return { id, type: 'callout', variant: 'tip', title: 'Tip', text: '' };
    case 'callout_error': return { id, type: 'callout', variant: 'error', title: 'Error', text: '' };
    case 'accordion': return { id, type: 'accordion', title: 'Click to expand', items: [{ title: 'Section 1', text: '' }] };
    case 'tabs': return { id, type: 'tabs', tabs: [{ label: 'Tab 1', text: '' }, { label: 'Tab 2', text: '' }] };
    case 'steps': return { id, type: 'steps', items: [{ title: 'Step 1', text: '' }, { title: 'Step 2', text: '' }] };
    case 'card': return { id, type: 'card', title: 'Card Title', text: '', icon: 'code' };
    case 'list': return { id, type: 'list', items: [''], ordered: false };
    case 'ordered_list': return { id, type: 'list', items: [''], ordered: true };
    case 'table': return { id, type: 'table', headers: ['Column 1', 'Column 2', 'Column 3'], rows: [['', '', ''], ['', '', '']] };
    case 'image': return { id, type: 'image', url: '', caption: '', alt: '' };
    case 'youtube': return { id, type: 'youtube', url: '', videoId: '', title: '', startTime: '', autoplay: false };
    case 'vimeo': return { id, type: 'vimeo', url: '', videoId: '', title: '' };
    case 'loom': return { id, type: 'loom', url: '', videoId: '', title: '' };
    case 'video': return { id, type: 'video', url: '', title: '', poster: '', autoplay: false, loop: false, muted: false, controls: true };
    case 'mermaid': return { id, type: 'mermaid', code: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]', title: '', theme: 'default' };
    default: return { id, type: 'paragraph', text: '' };
  }
}

// Ensure blocks have IDs for drag-and-drop
function ensureBlockIds(blocks: EditorBlock[]) {
  return blocks.map((block: EditorBlock, index: number) => {
    if (!block.id) {
      return { ...block, id: `block-${index}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
    }
    return block;
  });
}

// ========== SLASH COMMAND MENU ==========
const SlashMenu = ({ isOpen, position, onSelect, onClose, searchTerm }: {
  isOpen: boolean; position: { top: number; left: number } | null; onSelect: (type: string) => void; onClose: () => void; searchTerm?: string;
}) => {
  const [filter, setFilter] = useState<string>('');
  const [selectedIndex, setSelectedIndex] = useState<number>(0);
  const [prevOpen, setPrevOpen] = useState(isOpen);
  if (isOpen !== prevOpen) {
    setPrevOpen(isOpen);
    setFilter('');
    setSelectedIndex(0);
  }
  const menuRef = useRef<HTMLDivElement>(null);
  const term = searchTerm || filter;

  const filtered = useMemo(() => BLOCK_TYPES.filter(b =>
    b.label.toLowerCase().includes(term.toLowerCase()) ||
    b.description.toLowerCase().includes(term.toLowerCase()) ||
    b.category.toLowerCase().includes(term.toLowerCase()) ||
    b.shortcut?.toLowerCase().includes(term.toLowerCase())
  ), [term]);

  const categories = useMemo(() => [...new Set(filtered.map(b => b.category))], [filtered]);

  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: MouseEvent | KeyboardEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) onClose();
      if ('key' in e && (e as KeyboardEvent).key === 'Escape') onClose();
      if ('key' in e && (e as KeyboardEvent).key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex(prev => Math.min(prev + 1, filtered.length - 1));
      }
      if ('key' in e && (e as KeyboardEvent).key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex(prev => Math.max(prev - 1, 0));
      }
      if ('key' in e && (e as KeyboardEvent).key === 'Enter' && filtered[selectedIndex]) {
        e.preventDefault();
        onSelect(filtered[selectedIndex].type);
      }
    };
    document.addEventListener('mousedown', handler);
    document.addEventListener('keydown', handler);
    return () => { document.removeEventListener('mousedown', handler); document.removeEventListener('keydown', handler); };
  }, [isOpen, onClose, filtered, selectedIndex, onSelect]);

  if (!isOpen) return null;

  let flatIndex = -1;

  return (
    <div ref={menuRef} data-testid="slash-menu" className="absolute z-50 w-80 max-h-[400px] overflow-y-auto border rounded-xl shadow-2xl py-2" style={{ backgroundColor: '#1c2333', borderColor: '#2d333b', top: position?.top || 0, left: position?.left || 0 }}>
      <div className="px-3 pb-2 border-b border-[#2d333b] mb-1">
        <div className="flex items-center gap-2 px-2 py-1.5 rounded-md" style={{ backgroundColor: '#0d1117' }}>
          <Search size={12} className="text-[#484f58]" />
          <input data-testid="slash-menu-search" value={filter} onChange={(e) => { setFilter(e.target.value); setSelectedIndex(0); }} placeholder="Search blocks... (type shortcut like 'p', 'c', 'tip')" className="bg-transparent text-[#c9d1d9] text-xs outline-none flex-1" autoFocus />
        </div>
      </div>
      {categories.map((cat: string) => (
        <div key={cat}>
          <div className="px-3 py-1.5 text-[9px] font-semibold uppercase tracking-wider text-[#484f58] flex items-center gap-2">
            <span>{cat}</span>
            <div className="flex-1 h-px bg-[#2d333b]" />
          </div>
          {filtered.filter((b: { category: string; type: string; label: string; description: string; shortcut?: string; icon: LucideIcon }) => b.category === cat).map((block: { type: string; label: string; description: string; shortcut?: string; icon: LucideIcon }) => {
            flatIndex++;
            const isSelected = flatIndex === selectedIndex;
            return (
              <button key={block.type} data-testid={`block-type-${block.type}`} onClick={() => onSelect(block.type)} className={`w-full flex items-center gap-3 px-3 py-2 text-left transition-colors ${isSelected ? 'bg-[#22c55e]/10' : 'hover:bg-[#2d333b]'}`}>
                <div className={`w-8 h-8 rounded-md flex items-center justify-center ${isSelected ? 'bg-[#22c55e]/20' : 'bg-[#22c55e]/10'}`}>
                  <block.icon size={14} className="text-[#22c55e]" />
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[#c9d1d9] text-xs font-medium">{block.label}</span>
                    {block.shortcut && <span className="text-[8px] font-mono px-1.5 py-0.5 rounded bg-[#2d333b] text-[#484f58]">/{block.shortcut}</span>}
                  </div>
                  <div className="text-[#484f58] text-[10px]">{block.description}</div>
                </div>
                {isSelected && <Check size={12} className="text-[#22c55e]" />}
              </button>
            );
          })}
        </div>
      ))}
      {filtered.length === 0 && <div className="px-3 py-6 text-center text-[#484f58] text-xs">No blocks found. Try another search term.</div>}
      <div className="px-3 pt-2 mt-1 border-t border-[#2d333b]">
        <div className="text-[9px] text-[#484f58] flex items-center gap-2">
          <span className="px-1.5 py-0.5 rounded bg-[#2d333b]">↑↓</span> navigate
          <span className="px-1.5 py-0.5 rounded bg-[#2d333b]">↵</span> select
          <span className="px-1.5 py-0.5 rounded bg-[#2d333b]">esc</span> close
        </div>
      </div>
    </div>
  );
};

// ========== CALLOUT STYLES ==========
const CALLOUT_STYLES = {
  note: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6', label: 'Note' },
  info: { bg: '#3b82f615', border: '#3b82f640', icon: Info, color: '#3b82f6', label: 'Info' },
  warning: { bg: '#f59e0b15', border: '#f59e0b40', icon: AlertTriangle, color: '#f59e0b', label: 'Warning' },
  tip: { bg: '#22c55e15', border: '#22c55e40', icon: Lightbulb, color: '#22c55e', label: 'Tip' },
  error: { bg: '#ef444415', border: '#ef444440', icon: AlertCircle, color: '#ef4444', label: 'Error' },
};

// ========== INDIVIDUAL BLOCK EDITORS ==========
const ParagraphEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <RichTextEditor
    value={block.text || ''}
    onChange={(html) => onChange({ ...block, text: html })}
    placeholder="Start typing... Select text for formatting options (bold, italic, color, link)"
  />
);

const HeadingEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <div className="flex items-center gap-3">
    <select data-testid="heading-level-select" value={block.level || 2} onChange={(e) => onChange({ ...block, level: parseInt(e.target.value) })} className="bg-[#0d1117] text-[#8b949e] text-xs border border-[#2d333b] rounded-md px-2 py-1.5 outline-none focus:border-[#22c55e]">
      <option value={2}>H2</option><option value={3}>H3</option><option value={4}>H4</option>
    </select>
    <input data-testid="heading-text-input" value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Heading text..." className={`flex-1 bg-transparent text-white outline-none font-bold placeholder:text-[#484f58] ${block.level === 2 ? 'text-2xl' : block.level === 3 ? 'text-xl' : 'text-lg'}`} />
  </div>
);

const CodeBlockEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2 flex-wrap">
      <input data-testid="code-title-input" value={block.title || ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Title (e.g., 'hello.py')" className="bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e] flex-1 min-w-[150px]" />
      <select data-testid="code-language-select" value={(block.language || 'python').toLowerCase()} onChange={(e) => onChange({ ...block, language: e.target.value })} className="bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]">
        {LANGUAGES.map(l => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
      </select>
    </div>
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.runnable || false} onChange={(e) => onChange({ ...block, runnable: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#22c55e] focus:ring-[#22c55e]" />
        <span>Runnable</span>
      </label>
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.lineNumbers || false} onChange={(e) => onChange({ ...block, lineNumbers: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#22c55e] focus:ring-[#22c55e]" />
        <span>Line Numbers</span>
      </label>
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.expandable || false} onChange={(e) => onChange({ ...block, expandable: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#22c55e] focus:ring-[#22c55e]" />
        <span>Expandable</span>
      </label>
      <input data-testid="code-highlight-input" value={block.highlight || ''} onChange={(e) => onChange({ ...block, highlight: e.target.value })} placeholder="Highlight lines: 1,3-5" className="bg-[#0d1117] border border-[#2d333b] rounded-md px-2 py-1 text-[#c9d1d9] text-[10px] outline-none focus:border-[#22c55e] w-32" />
    </div>
    <div className="border border-[#2d333b] rounded-lg overflow-hidden">
      <Editor data-testid="code-editor" height="200px" language={(block.language || 'python').toLowerCase()} value={block.code || ''} onChange={(val) => onChange({ ...block, code: val || '' })} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, lineNumbers: block.lineNumbers ? 'on' : 'off', scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 }, automaticLayout: true }} />
    </div>
  </div>
);

const CodeGroupEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabs = (block.tabs || []) as { label: string; language?: string; code?: string }[];
  const addTab = () => onChange({ ...block, tabs: [...tabs, { label: 'New Tab', language: 'python', code: '' }] });
  const removeTab = (i: number) => { if (tabs.length <= 1) return; const nt = tabs.filter((_: { label: string; language?: string; code?: string }, idx: number) => idx !== i); setActiveTab(Math.min(activeTab, nt.length - 1)); onChange({ ...block, tabs: nt }); };
  const updateTab = (i: number, field: string, val: string) => { const nt = [...tabs]; nt[i] = { ...nt[i], [field]: val }; onChange({ ...block, tabs: nt }); };

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-1 border-b border-[#2d333b] pb-2">
        {tabs.map((tab: { label: string; language?: string; code?: string }, i: number) => (
          <div key={i} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-t-md text-xs cursor-pointer transition-colors ${i === activeTab ? 'bg-[#2d333b] text-white' : 'text-[#8b949e] hover:text-white'}`} onClick={() => setActiveTab(i)}>
            <input value={tab.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTab(i, 'label', e.target.value)} className="bg-transparent outline-none w-20 text-center text-xs font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()} />
            {tabs.length > 1 && <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); removeTab(i); }} className="text-[#484f58] hover:text-red-400 transition-colors"><X size={12} /></button>}
          </div>
        ))}
        <button onClick={addTab} className="text-[#484f58] hover:text-[#22c55e] p-1.5 transition-colors"><Plus size={14} /></button>
      </div>
      {tabs[activeTab] && (
        <div className="space-y-2">
          <select value={(tabs[activeTab].language || 'python').toLowerCase()} onChange={(e) => updateTab(activeTab, 'language', e.target.value)} className="bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]">
            {LANGUAGES.map((l: string) => <option key={l} value={l}>{l.charAt(0).toUpperCase() + l.slice(1)}</option>)}
          </select>
          <div className="border border-[#2d333b] rounded-lg overflow-hidden">
            <Editor height="180px" language={(tabs[activeTab].language || 'python').toLowerCase()} value={tabs[activeTab].code || ''} onChange={(val) => updateTab(activeTab, 'code', val || '')} theme="vs-dark" options={{ minimap: { enabled: false }, fontSize: 13, scrollBeyondLastLine: false, wordWrap: 'on', padding: { top: 12, bottom: 12 }, automaticLayout: true }} />
          </div>
        </div>
      )}
    </div>
  );
};

const CalloutEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const style = CALLOUT_STYLES[block.variant as keyof typeof CALLOUT_STYLES] || CALLOUT_STYLES.note;
  const Icon = style.icon;
  return (
    <div className="rounded-lg border px-4 py-3 space-y-2" style={{ backgroundColor: style.bg, borderColor: style.border }}>
      <div className="flex items-center gap-2">
        <Icon size={16} style={{ color: style.color }} />
        <select data-testid="callout-variant-select" value={block.variant || 'note'} onChange={(e: React.ChangeEvent<HTMLSelectElement>) => onChange({ ...block, variant: e.target.value, title: (CALLOUT_STYLES as Record<string, { label: string }>)[e.target.value].label })} className="bg-transparent text-xs font-semibold outline-none cursor-pointer" style={{ color: style.color }}>
          {Object.entries(CALLOUT_STYLES).map(([k, v]: [string, { label: string }]) => <option key={k} value={k}>{v.label}</option>)}
        </select>
        <input data-testid="callout-title-input" value={block.title || ''} onChange={(e) => onChange({ ...block, title: e.target.value })} className="bg-transparent text-sm font-bold outline-none flex-1 placeholder:opacity-50" style={{ color: style.color }} placeholder="Callout title" />
      </div>
      <textarea data-testid="callout-text-input" value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Callout content..." className="w-full bg-transparent text-[#c9d1d9] text-sm outline-none resize-none min-h-[50px] placeholder:text-[#484f58]" rows={2} />
    </div>
  );
};

const AccordionEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const items = (block.items || [{ title: '', text: '' }] as EditorBlock[]) as EditorBlock[];
  const updateItem = (i: number, field: string, val: string) => { const ni = [...items]; ni[i] = { ...ni[i], [field]: val }; onChange({ ...block, items: ni }); };
  const addItem = () => onChange({ ...block, items: [...items, { title: `Section ${items.length + 1}`, text: '' } as EditorBlock] });
  const removeItem = (i: number) => onChange({ ...block, items: items.filter((_: EditorBlock, idx: number) => idx !== i) });

  return (
    <div className="space-y-2">
      {items.map((item: EditorBlock, i: number) => (
        <div key={i} className="border border-[#2d333b] rounded-lg p-3 space-y-2 hover:border-[#484f58] transition-colors">
          <div className="flex items-center gap-2">
            <ChevronRight size={14} className="text-[#22c55e]" />
            <input value={item.title || ''} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, 'title', e.target.value)} placeholder="Accordion title" className="flex-1 bg-transparent text-[#c9d1d9] text-sm font-medium outline-none placeholder:text-[#484f58]" />
            {items.length > 1 && <button onClick={() => removeItem(i)} className="text-[#484f58] hover:text-red-400 transition-colors"><X size={14} /></button>}
          </div>
          <textarea value={item.text || ''} onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => updateItem(i, 'text', e.target.value)} placeholder="Accordion content..." className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-xs outline-none resize-none focus:border-[#22c55e] placeholder:text-[#484f58]" rows={2} />
        </div>
      ))}
      <button onClick={addItem} className="text-[#22c55e] text-xs hover:underline flex items-center gap-1.5 py-1"><Plus size={12} /> Add Section</button>
    </div>
  );
};

const TabsEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const [activeTab, setActiveTab] = useState<number>(0);
  const tabs = (block.tabs || []) as { label: string; text?: string }[];
  const addTab = () => onChange({ ...block, tabs: [...tabs, { label: `Tab ${tabs.length + 1}`, text: '' }] });
  const removeTab = (i: number) => { if (tabs.length <= 1) return; const nt = tabs.filter((_: { label: string; text?: string }, idx: number) => idx !== i); setActiveTab(Math.min(activeTab, nt.length - 1)); onChange({ ...block, tabs: nt }); };
  const updateTab = (i: number, field: string, val: string) => { const nt = [...tabs]; nt[i] = { ...nt[i], [field]: val }; onChange({ ...block, tabs: nt }); };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-1 border-b border-[#2d333b]">
        {tabs.map((tab: { label: string; text?: string }, i: number) => (
          <div key={i} className={`flex items-center gap-1 px-3 py-2 text-xs cursor-pointer border-b-2 transition-colors ${i === activeTab ? 'border-[#22c55e] text-white' : 'border-transparent text-[#8b949e] hover:text-white'}`} onClick={() => setActiveTab(i)}>
            <input value={tab.label} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateTab(i, 'label', e.target.value)} className="bg-transparent outline-none w-20 text-center text-xs font-medium" onClick={(e: React.MouseEvent) => e.stopPropagation()} />
            {tabs.length > 1 && <button onClick={(e: React.MouseEvent) => { e.stopPropagation(); removeTab(i); }} className="text-[#484f58] hover:text-red-400 transition-colors"><X size={12} /></button>}
          </div>
        ))}
        <button onClick={addTab} className="text-[#484f58] hover:text-[#22c55e] px-2 py-1.5 transition-colors"><Plus size={14} /></button>
      </div>
      {tabs[activeTab] && (
        <textarea value={tabs[activeTab].text || ''} onChange={(e) => updateTab(activeTab, 'text', e.target.value)} placeholder="Tab content..." className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none resize-none focus:border-[#22c55e] placeholder:text-[#484f58]" rows={4} />
      )}
    </div>
  );
};

const StepsEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const items = (block.items || []) as EditorBlock[];
  const updateItem = (i: number, field: string, val: string) => { const ni = [...items]; ni[i] = { ...ni[i], [field]: val }; onChange({ ...block, items: ni }); };
  const addItem = () => onChange({ ...block, items: [...items, { title: `Step ${items.length + 1}`, text: '' } as EditorBlock] });
  const removeItem = (i: number) => onChange({ ...block, items: items.filter((_, idx) => idx !== i) });

  return (
    <div className="space-y-0">
      {items.map((item, i) => (
        <div key={i} className="flex gap-3">
          <div className="flex flex-col items-center">
            <div className="w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold text-white shrink-0" style={{ backgroundColor: '#22c55e' }}>{i + 1}</div>
            {i < items.length - 1 && <div className="w-0.5 flex-1 mt-1" style={{ backgroundColor: '#2d333b' }} />}
          </div>
          <div className="flex-1 pb-4">
            <div className="flex items-center gap-2 mb-2">
              <input value={item.title || ''} onChange={(e) => updateItem(i, 'title', e.target.value)} placeholder="Step title" className="flex-1 bg-transparent text-[#c9d1d9] text-sm font-semibold outline-none placeholder:text-[#484f58]" />
              {items.length > 1 && <button onClick={() => removeItem(i)} className="text-[#484f58] hover:text-red-400 transition-colors"><X size={14} /></button>}
            </div>
            <textarea value={item.text || ''} onChange={(e) => updateItem(i, 'text', e.target.value)} placeholder="Step description..." className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-xs outline-none resize-none focus:border-[#22c55e] placeholder:text-[#484f58]" rows={2} />
          </div>
        </div>
      ))}
      <button onClick={addItem} className="text-[#22c55e] text-xs hover:underline flex items-center gap-1.5 ml-11 py-1"><Plus size={12} /> Add Step</button>
    </div>
  );
};

const CardEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <div className="border border-[#2d333b] rounded-lg p-4 space-y-3 hover:border-[#484f58] transition-colors" style={{ backgroundColor: '#0d111720' }}>
    <div className="flex items-center gap-3">
      <input value={block.icon || ''} onChange={(e) => onChange({ ...block, icon: e.target.value })} placeholder="Icon name (e.g., 'code', 'book')" className="bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e] w-40" />
      <input value={block.title || ''} onChange={(e) => onChange({ ...block, title: e.target.value })} placeholder="Card title" className="flex-1 bg-transparent text-[#c9d1d9] text-sm font-bold outline-none placeholder:text-[#484f58]" />
    </div>
    <textarea value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Card description..." className="w-full bg-transparent text-[#c9d1d9] text-sm outline-none resize-none placeholder:text-[#484f58]" rows={2} />
    <input value={block.href || ''} onChange={(e) => onChange({ ...block, href: e.target.value })} placeholder="Link URL (optional)" className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#8b949e] text-xs outline-none focus:border-[#22c55e]" />
  </div>
);

const ListEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const items = (block.items || ['']) as string[];
  const updateItem = (i: number, val: string) => { const ni = [...items]; ni[i] = val; onChange({ ...block, items: ni }); };
  const addItem = (afterIndex: number) => { const ni = [...items]; ni.splice(afterIndex + 1, 0, ''); onChange({ ...block, items: ni }); };
  const removeItem = (i: number) => { if (items.length <= 1) return; onChange({ ...block, items: items.filter((_: string, idx: number) => idx !== i) }); };
  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, i: number) => { if (e.key === 'Enter') { e.preventDefault(); addItem(i); } if (e.key === 'Backspace' && !items[i] && items.length > 1) { e.preventDefault(); removeItem(i); } };

  return (
    <div className="space-y-2">
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.ordered || false} onChange={(e: React.ChangeEvent<HTMLInputElement>) => onChange({ ...block, ordered: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#22c55e] focus:ring-[#22c55e]" />
        <span>Numbered list</span>
      </label>
      <div className="space-y-1">
        {items.map((item: string, i: number) => (
          <div key={i} className="flex items-center gap-2 group">
            <span className="text-[#484f58] text-xs w-5 text-right font-mono">{block.ordered ? `${i + 1}.` : '•'}</span>
            <input value={item} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateItem(i, e.target.value)} onKeyDown={(e: React.KeyboardEvent<HTMLInputElement>) => handleKeyDown(e, i)} placeholder="List item..." className="flex-1 bg-transparent text-[#c9d1d9] text-sm outline-none placeholder:text-[#484f58]" />
            <button onClick={() => removeItem(i)} className="text-[#484f58] hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity"><X size={12} /></button>
          </div>
        ))}
      </div>
      <button onClick={() => addItem(items.length - 1)} className="text-[#22c55e] text-xs hover:underline flex items-center gap-1 ml-7">+ Add Item</button>
    </div>
  );
};

const HEADER_COLORS = [
  { name: 'Default', bg: null, text: null },
  { name: 'Green', bg: '#22c55e', text: '#fff' },
  { name: 'Blue', bg: '#3b82f6', text: '#fff' },
  { name: 'Purple', bg: '#a855f7', text: '#fff' },
  { name: 'Cyan', bg: '#06b6d4', text: '#fff' },
  { name: 'Amber', bg: '#f59e0b', text: '#000' },
  { name: 'Red', bg: '#ef4444', text: '#fff' },
  { name: 'Pink', bg: '#ec4899', text: '#fff' },
  { name: 'Slate', bg: '#475569', text: '#fff' },
];

const TableEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const headers = block.headers || ['Col 1', 'Col 2'];
  const rows = block.rows || [['', '']];
  // Brand-default when authoring: AlgoKube green header + black text. Per-table override still wins.
  const headerColor = block.headerColor || '#22c55e';
  const headerTextColor = block.headerTextColor || '#000000';
  const addCol = () => onChange({ ...block, headers: [...headers, `Col ${headers.length + 1}`], rows: rows.map((r: string[]) => [...r, '']) });
  const removeCol = (ci: number) => { if (headers.length <= 1) return; onChange({ ...block, headers: headers.filter((_: string, i: number) => i !== ci), rows: rows.map((r: string[]) => r.filter((_: string, i: number) => i !== ci)) }); };
  const addRow = () => onChange({ ...block, rows: [...rows, headers.map(() => '')] });
  const removeRow = (ri: number) => { if (rows.length <= 1) return; onChange({ ...block, rows: rows.filter((_: string[], i: number) => i !== ri) }); };
  const updateHeader = (ci: number, val: string) => { const nh = [...headers]; nh[ci] = val; onChange({ ...block, headers: nh }); };
  const updateCell = (ri: number, ci: number, val: string) => { const nr = rows.map((r: string[]) => [...r]); nr[ri][ci] = val; onChange({ ...block, rows: nr }); };

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <span className="text-[#484f58] text-[10px] uppercase tracking-wider">Header Color</span>
        <div className="flex items-center gap-1" data-testid="table-header-colors">
          {HEADER_COLORS.map((c: { name: string; bg: string | null; text: string | null }) => (
            <button
              key={c.name}
              onClick={() => onChange({ ...block, headerColor: c.bg ?? undefined, headerTextColor: c.text ?? undefined })}
              title={c.name}
              data-testid={`header-color-${c.name.toLowerCase()}`}
              className={`w-5 h-5 rounded-full border-2 transition-all hover:scale-110 ${
                headerColor === c.bg
                  ? 'ring-2 ring-offset-1 ring-offset-[#0d1117] ring-white/30 scale-110'
                  : ''
              }`}
              style={{
                backgroundColor: c.bg || '#161b22',
                borderColor: headerColor === c.bg ? '#fff' : '#2d333b',
              }}
            />
          ))}
        </div>
      </div>
      <div className="overflow-x-auto">
        <table className="w-full text-xs">
          <thead>
            <tr>
              {headers.map((h: string, ci: number) => (
                <th key={ci} className="border border-[#2d333b] p-0">
                  <div className="flex items-center">
                    <input
                      value={h}
                      onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateHeader(ci, e.target.value)}
                      className="flex-1 px-3 py-2 font-semibold outline-none"
                      style={{
                        backgroundColor: headerColor,
                        color: headerTextColor,
                      }}
                    />
                    <button onClick={() => removeCol(ci)} className="hover:text-red-400 px-2 transition-colors" style={{ color: headerTextColor + '80' }}><X size={12} /></button>
                  </div>
                </th>
              ))}
              <th className="border border-[#2d333b] p-0 w-10" style={{ backgroundColor: headerColor }}>
                <button onClick={addCol} className="hover:text-[#22c55e] p-2 w-full transition-colors" style={{ color: headerTextColor + '80' }}><Plus size={12} /></button>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row: string[], ri: number) => (
              <tr key={ri}>
                {row.map((cell: string, ci: number) => (
                  <td key={ci} className="border border-[#2d333b] p-0">
                    <input value={cell} onChange={(e: React.ChangeEvent<HTMLInputElement>) => updateCell(ri, ci, e.target.value)} className="w-full bg-transparent px-3 py-2 text-[#c9d1d9] outline-none" />
                  </td>
                ))}
                <td className="border border-[#2d333b] p-0 w-10"><button onClick={() => removeRow(ri)} className="text-[#484f58] hover:text-red-400 p-2 w-full transition-colors"><X size={12} /></button></td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={addRow} className="text-[#22c55e] text-xs hover:underline mt-2">+ Add Row</button>
      </div>
    </div>
  );
};

const ImageEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const fileInputRef = React.useRef<HTMLInputElement>(null);
  const [uploading, setUploading] = React.useState<boolean>(false);
  const [error, setError] = React.useState<string>('');
  const [dragOver, setDragOver] = React.useState<boolean>(false);

  const uploadFile = async (file: File) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
      setError('Only image files are supported.');
      return;
    }
    setError('');
    setUploading(true);
    try {
      const fd = new FormData();
      fd.append('file', file, file.name || 'pasted-image.png');
      const res = await fetch('/api/admin/upload-image', {
        method: 'POST',
        body: fd,
      });
      if (!res.ok) {
        const d = await res.json().catch(() => ({}));
        throw new Error(d.detail || `Upload failed (${res.status})`);
      }
      const data = await res.json();
      const absolute = data.url.startsWith('http') ? data.url : `${process.env.NEXT_PUBLIC_BACKEND_URL}${data.url}`;
      onChange({ ...block, url: absolute, alt: block.alt || file.name?.replace(/\.[^.]+$/, '') || '' });
    } catch (err) {
      setError((err as Error).message || 'Upload failed');
    } finally {
      setUploading(false);
    }
  };

  const onFilePick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (f) uploadFile(f);
    e.target.value = ''; // allow re-selecting the same file
  };

  const onPaste = (e: React.ClipboardEvent<HTMLDivElement>) => {
    const items = e.clipboardData?.items;
    if (!items) return;
    for (const item of items) {
      if (item.kind === 'file' && item.type.startsWith('image/')) {
        const blob = item.getAsFile();
        if (blob) {
          e.preventDefault();
          uploadFile(blob);
          return;
        }
      }
    }
  };

  const onDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDragOver(false);
    const f = e.dataTransfer?.files?.[0];
    if (f) uploadFile(f);
  };

  return (
    <div className="space-y-3" onPaste={onPaste}>
      <div className="flex gap-2">
        <input
          data-testid="image-url-input"
          value={block.url || ''}
          onChange={(e) => onChange({ ...block, url: e.target.value })}
          placeholder="Image URL — paste, drop, or click Upload"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#22c55e]"
        />
        <button
          data-testid="image-upload-button"
          type="button"
          onClick={() => fileInputRef.current?.click()}
          disabled={uploading}
          className="px-3 py-2 rounded-md bg-[#22c55e] text-white text-sm font-medium hover:bg-[#16a34a] disabled:opacity-50 flex items-center gap-2 whitespace-nowrap"
        >
          {uploading ? (
            <><Loader2 size={14} className="animate-spin" /> Uploading…</>
          ) : (
            <><Upload size={14} /> Upload</>
          )}
        </button>
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png,image/jpeg,image/gif,image/webp,image/svg+xml"
          onChange={onFilePick}
          className="hidden"
          data-testid="image-file-input"
        />
      </div>

      <div
        data-testid="image-dropzone"
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={onDrop}
        onClick={() => !uploading && fileInputRef.current?.click()}
        className={`rounded-md border-2 border-dashed px-4 py-3 text-center text-xs cursor-pointer transition-colors ${
          dragOver ? 'border-[#22c55e] bg-[#22c55e10] text-[#22c55e]' : 'border-[#2d333b] text-[#8b949e] hover:border-[#444c56]'
        }`}
      >
        {uploading ? 'Uploading image…' : (
          <span>
            <strong>Drop an image here</strong> · or <strong>paste</strong> from clipboard · or click to choose a file
            <span className="block text-[10px] text-[#484f58] mt-0.5">PNG · JPG · GIF · WebP · SVG · up to 10 MB</span>
          </span>
        )}
      </div>

      {error && (
        <div data-testid="image-upload-error" className="text-xs text-[#ef4444] bg-[#ef444410] border border-[#ef444440] rounded-md px-3 py-2">
          {error}
        </div>
      )}

      <div className="flex gap-2">
        <input
          data-testid="image-alt-input"
          value={block.alt || ''}
          onChange={(e) => onChange({ ...block, alt: e.target.value })}
          placeholder="Alt text (for accessibility)"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]"
        />
        <input
          data-testid="image-caption-input"
          value={block.caption || ''}
          onChange={(e) => onChange({ ...block, caption: e.target.value })}
          placeholder="Caption (optional)"
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]"
        />
      </div>

      {block.url && (
        <div className="rounded-lg border border-[#2d333b] overflow-hidden">
          <Image src={block.url} alt={block.alt || ''} width={1200} height={675} unoptimized className="max-h-[250px] w-full object-contain bg-[#0d1117]" onError={(e) => { (e.target as HTMLElement).style.display = 'none'; }} />
        </div>
      )}
    </div>
  );
};

// Mermaid Diagram Editor with live preview
const NODE_PALETTES = [
  {
    name: 'Pipeline',
    preview: ['#00e5ff', '#ffb74d', '#4dd0e1', '#b388ff'],
    classes: [
      { name: 'source', fill: '#00e5ff', stroke: '#00b8d4', text: '#000' },
      { name: 'parser', fill: '#ffb74d', stroke: '#ff9800', text: '#000' },
      { name: 'process', fill: '#4dd0e1', stroke: '#00acc1', text: '#000' },
      { name: 'storage', fill: '#b388ff', stroke: '#7c4dff', text: '#000' },
    ],
  },
  {
    name: 'Ocean',
    preview: ['#0ea5e9', '#06b6d4', '#2dd4bf', '#a78bfa'],
    classes: [
      { name: 'primary', fill: '#0ea5e9', stroke: '#0284c7', text: '#fff' },
      { name: 'secondary', fill: '#06b6d4', stroke: '#0891b2', text: '#fff' },
      { name: 'accent', fill: '#2dd4bf', stroke: '#14b8a6', text: '#000' },
      { name: 'highlight', fill: '#a78bfa', stroke: '#8b5cf6', text: '#fff' },
    ],
  },
  {
    name: 'Warm',
    preview: ['#f97316', '#ef4444', '#eab308', '#f472b6'],
    classes: [
      { name: 'primary', fill: '#f97316', stroke: '#ea580c', text: '#fff' },
      { name: 'danger', fill: '#ef4444', stroke: '#dc2626', text: '#fff' },
      { name: 'warning', fill: '#eab308', stroke: '#ca8a04', text: '#000' },
      { name: 'accent', fill: '#f472b6', stroke: '#ec4899', text: '#fff' },
    ],
  },
  {
    name: 'Neon',
    preview: ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444'],
    classes: [
      { name: 'success', fill: '#22c55e', stroke: '#16a34a', text: '#fff' },
      { name: 'info', fill: '#3b82f6', stroke: '#2563eb', text: '#fff' },
      { name: 'warn', fill: '#f59e0b', stroke: '#d97706', text: '#000' },
      { name: 'error', fill: '#ef4444', stroke: '#dc2626', text: '#fff' },
    ],
  },
  {
    name: 'Pastel',
    preview: ['#bfdbfe', '#bbf7d0', '#fde68a', '#fbcfe8'],
    classes: [
      { name: 'blue', fill: '#bfdbfe', stroke: '#93c5fd', text: '#1e3a5f' },
      { name: 'green', fill: '#bbf7d0', stroke: '#86efac', text: '#14532d' },
      { name: 'yellow', fill: '#fde68a', stroke: '#fcd34d', text: '#713f12' },
      { name: 'pink', fill: '#fbcfe8', stroke: '#f9a8d4', text: '#831843' },
    ],
  },
  {
    name: 'Monochrome',
    preview: ['#e2e8f0', '#94a3b8', '#475569', '#1e293b'],
    classes: [
      { name: 'light', fill: '#e2e8f0', stroke: '#cbd5e1', text: '#1e293b' },
      { name: 'mid', fill: '#94a3b8', stroke: '#64748b', text: '#fff' },
      { name: 'dark', fill: '#475569', stroke: '#334155', text: '#fff' },
      { name: 'deep', fill: '#1e293b', stroke: '#0f172a', text: '#e2e8f0' },
    ],
  },
];

const MERMAID_THEMES = [
  { value: 'brand', label: 'Brand (Green)', preview: '#22c55e', config: { theme: 'base', themeVariables: { primaryColor: '#22c55e', primaryTextColor: '#ffffff', primaryBorderColor: '#16a34a', secondaryColor: '#3b82f6', secondaryTextColor: '#ffffff', secondaryBorderColor: '#2563eb', tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b', lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22', nodeBorder: '#22c55e', clusterBkg: '#0d1117', clusterBorder: '#2d333b', titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff' } } },
  { value: 'brand-blue', label: 'Brand (Blue)', preview: '#3b82f6', config: { theme: 'base', themeVariables: { primaryColor: '#3b82f6', primaryTextColor: '#ffffff', primaryBorderColor: '#2563eb', secondaryColor: '#22c55e', secondaryTextColor: '#ffffff', secondaryBorderColor: '#16a34a', tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b', lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22', nodeBorder: '#3b82f6', clusterBkg: '#0d1117', clusterBorder: '#2d333b', titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff' } } },
  { value: 'brand-purple', label: 'Brand (Purple)', preview: '#a855f7', config: { theme: 'base', themeVariables: { primaryColor: '#a855f7', primaryTextColor: '#ffffff', primaryBorderColor: '#9333ea', secondaryColor: '#22c55e', secondaryTextColor: '#ffffff', secondaryBorderColor: '#16a34a', tertiaryColor: '#0d1117', tertiaryTextColor: '#c9d1d9', tertiaryBorderColor: '#2d333b', lineColor: '#484f58', textColor: '#c9d1d9', mainBkg: '#161b22', nodeBorder: '#a855f7', clusterBkg: '#0d1117', clusterBorder: '#2d333b', titleColor: '#c9d1d9', edgeLabelBackground: '#161b22', nodeTextColor: '#ffffff' } } },
  { value: 'dark', label: 'Dark', preview: '#1f2937', config: { theme: 'dark' } },
  { value: 'neutral', label: 'Neutral', preview: '#6b7280', config: { theme: 'neutral' } },
  { value: 'forest', label: 'Forest', preview: '#2d5a27', config: { theme: 'forest' } },
];

const MermaidEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [rendering, setRendering] = useState<boolean>(false);
  const [showPalettes, setShowPalettes] = useState<boolean>(false);
  const [copiedClass, setCopiedClass] = useState<string>('');
  const previewRef = useRef<HTMLDivElement>(null);
  const paletteRef = useRef<HTMLDivElement>(null);

  // Close palette panel on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (paletteRef.current && !paletteRef.current.contains(e.target as Node)) setShowPalettes(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const DIAGRAM_TEMPLATES = [
    { label: 'Flowchart', code: 'graph TD\n    A[Start] --> B{Decision}\n    B -->|Yes| C[Result 1]\n    B -->|No| D[Result 2]\n    C --> E[End]\n    D --> E' },
    { label: 'Pipeline (Colored)', code: 'graph LR\n    classDef source fill:#00e5ff,stroke:#00b8d4,color:#000\n    classDef parser fill:#ffb74d,stroke:#ff9800,color:#000\n    classDef process fill:#4dd0e1,stroke:#00acc1,color:#000\n    classDef storage fill:#b388ff,stroke:#7c4dff,color:#000\n\n    subgraph Sources\n        A[PDF Files]:::source\n        B[JSON Files]:::source\n    end\n    subgraph Parse\n        C[PyMuPDF]:::parser\n        D[json module]:::parser\n    end\n    subgraph Process\n        E[Validate]:::process\n        F[Transform]:::process\n    end\n    A --> C --> E\n    B --> D --> E\n    E --> F --> G[(Database)]:::storage' },
    { label: 'Architecture', code: 'graph TD\n    classDef client fill:#0ea5e9,stroke:#0284c7,color:#fff\n    classDef server fill:#22c55e,stroke:#16a34a,color:#fff\n    classDef db fill:#a78bfa,stroke:#8b5cf6,color:#fff\n    classDef cache fill:#f59e0b,stroke:#d97706,color:#000\n\n    A[Browser]:::client --> B[Load Balancer]:::server\n    B --> C[API Server 1]:::server\n    B --> D[API Server 2]:::server\n    C --> E[(PostgreSQL)]:::db\n    D --> E\n    C --> F[Redis Cache]:::cache\n    D --> F' },
    { label: 'Sequence', code: 'sequenceDiagram\n    participant A as Alice\n    participant B as Bob\n    A->>B: Hello Bob!\n    B-->>A: Hi Alice!\n    A->>B: How are you?\n    B-->>A: Great!' },
    { label: 'Class Diagram', code: 'classDiagram\n    class Animal {\n        +String name\n        +int age\n        +makeSound()\n    }\n    class Dog {\n        +String breed\n        +bark()\n    }\n    Animal <|-- Dog' },
    { label: 'State Diagram', code: 'stateDiagram-v2\n    classDef active fill:#22c55e,stroke:#16a34a,color:#fff\n    classDef error fill:#ef4444,stroke:#dc2626,color:#fff\n\n    [*] --> Idle\n    Idle --> Processing:::active : Start\n    Processing --> Complete:::active : Success\n    Processing --> Error:::error : Failure\n    Complete --> [*]\n    Error --> Idle : Retry' },
    { label: 'ER Diagram', code: 'erDiagram\n    USER ||--o{ ORDER : places\n    ORDER ||--|{ LINE-ITEM : contains\n    PRODUCT ||--o{ LINE-ITEM : "included in"' },
    { label: 'Gantt Chart', code: 'gantt\n    title Project Timeline\n    dateFormat YYYY-MM-DD\n    section Phase 1\n    Task 1: 2024-01-01, 30d\n    Task 2: 2024-01-15, 20d\n    section Phase 2\n    Task 3: 2024-02-01, 25d' },
    { label: 'Pie Chart', code: 'pie title Browser Usage\n    "Chrome" : 65\n    "Firefox" : 15\n    "Safari" : 12\n    "Edge" : 8' },
    { label: 'Git Graph', code: 'gitGraph\n    commit\n    branch develop\n    checkout develop\n    commit\n    commit\n    checkout main\n    merge develop\n    commit' },
  ];

  const currentTheme = block.theme || 'brand';
  const themeConfig = useMemo(() => {
    return MERMAID_THEMES.find(t => t.value === currentTheme)?.config || MERMAID_THEMES[0].config;
  }, [currentTheme]);

  const renderDiagram = useCallback(async () => {
    if (!block.code?.trim()) {
      setSvg('');
      setError('');
      return;
    }
    setRendering(true);
    setError('');
    try {
      // Re-initialize mermaid with selected theme
      mermaid.initialize({
        startOnLoad: false,
        securityLevel: 'strict',
        fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace',
        ...themeConfig
      } as MermaidConfig);
      
      // Generate unique ID for each render
      const uniqueId = `mermaid-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      const { svg: renderedSvg } = await mermaid.render(uniqueId, block.code);
      setSvg(renderedSvg);
      setError('');
    } catch (err) {
      setError((err as Error).message || 'Invalid Mermaid syntax');
      setSvg('');
      // Clean up any leftover mermaid error elements
      document.querySelectorAll(`[id^="dmermaid-"]`).forEach(el => el.remove());
    } finally {
      setRendering(false);
    }
  }, [block.code, themeConfig]);

  // Debounced re-render only when code or theme changes (initial render is immediate)
  const codeRef = useRef(block.code);
  const themeRef = useRef(currentTheme);
  const firstRender = useRef(true);
  useEffect(() => {
    const isFirst = firstRender.current;
    firstRender.current = false;
    if (!isFirst && codeRef.current === block.code && themeRef.current === currentTheme) return;
    codeRef.current = block.code;
    themeRef.current = currentTheme;
    const timer = setTimeout(renderDiagram, isFirst ? 0 : 500);
    return () => clearTimeout(timer);
  }, [block.code, currentTheme, renderDiagram]);

  const handleApplyPalette = (palette: { name: string; classes: { name: string; fill: string; stroke: string; text: string }[] }) => {
    const code = block.code || '';
    // Remove existing classDef lines
    const cleaned = code.split('\n').filter((l: string) => !l.trim().startsWith('classDef ')).join('\n');
    // Find the first line (graph declaration) and insert classDefs after it
    const lines = cleaned.split('\n');
    const firstLine = lines[0] || '';
    const rest = lines.slice(1).join('\n');
    const classDefs = palette.classes.map((c: { name: string; fill: string; stroke: string; text: string }) => `    classDef ${c.name} fill:${c.fill},stroke:${c.stroke},color:${c.text}`).join('\n');

    // Auto-apply :::className to nodes that don't already have :::
    // Strip existing ::: from nodes first, then we won't auto-apply (user controls this)
    const newCode = `${firstLine}\n${classDefs}\n${rest}`;
    onChange({ ...block, code: newCode });
    setShowPalettes(false);
  };

  const handleCopyClass = (className: string) => {
    navigator.clipboard.writeText(`:::${className}`);
    setCopiedClass(className);
    setTimeout(() => setCopiedClass(''), 1500);
  };

  // Detect which palette classes are present in current code
  const activeClasses = useMemo(() => {
    const code = block.code || '';
    const found = [];
    for (const palette of NODE_PALETTES) {
      for (const cls of palette.classes) {
        if (code.includes(`classDef ${cls.name} `)) {
          found.push(cls);
        }
      }
    }
    return found;
  }, [block.code]);

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <div className="flex items-center gap-2">
          <GitBranch size={18} className="text-[#22c55e]" />
          <span className="text-[#c9d1d9] text-sm font-medium">Mermaid Diagram</span>
        </div>
        <div className="flex items-center gap-2 flex-wrap">
          {/* Theme Selector */}
          <div className="flex items-center gap-1.5">
            <span className="text-[#484f58] text-[10px]">Theme:</span>
            <div className="flex items-center gap-1">
              {MERMAID_THEMES.map(t => (
                <button
                  key={t.value}
                  onClick={() => onChange({ ...block, theme: t.value })}
                  title={t.label}
                  className={`w-5 h-5 rounded-full border-2 transition-all ${currentTheme === t.value ? 'ring-2 ring-offset-1 ring-offset-[#0d1117] ring-white/30 scale-110' : 'hover:scale-105'}`}
                  style={{ backgroundColor: t.preview, borderColor: currentTheme === t.value ? '#fff' : 'transparent' }}
                />
              ))}
            </div>
          </div>
          
          <div className="w-px h-4 bg-[#2d333b]" />

          {/* Node Palette Toggle */}
          <div className="relative" ref={paletteRef}>
            <button
              onClick={() => setShowPalettes(!showPalettes)}
              className={`flex items-center gap-1 px-2 py-1 rounded-md text-xs transition-colors border ${showPalettes ? 'bg-[#22c55e]/20 text-[#22c55e] border-[#22c55e]/40' : 'bg-[#0d1117] text-[#8b949e] border-[#2d333b] hover:text-[#c9d1d9]'}`}
              data-testid="node-palette-toggle"
              title="Node Color Palettes"
            >
              <div className="flex -space-x-1">
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#00e5ff' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#ffb74d' }} />
                <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: '#b388ff' }} />
              </div>
              <span className="ml-1">Palettes</span>
            </button>

            {showPalettes && (
              <div className="absolute top-full mt-1 right-0 z-50 w-72 bg-[#161b22] border border-[#2d333b] rounded-lg shadow-2xl p-3 space-y-2" data-testid="palette-dropdown">
                <div className="text-[10px] text-[#8b949e] uppercase tracking-wider mb-1">Node Color Palettes</div>
                {NODE_PALETTES.map(p => (
                  <button
                    key={p.name}
                    onClick={() => handleApplyPalette(p)}
                    data-testid={`palette-${p.name.toLowerCase()}`}
                    className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-md hover:bg-[#1c2333] transition-colors group text-left"
                  >
                    <div className="flex -space-x-0.5 shrink-0">
                      {p.preview.map((c, i) => (
                        <div key={i} className="w-4 h-4 rounded-sm border border-black/20" style={{ backgroundColor: c }} />
                      ))}
                    </div>
                    <div>
                      <div className="text-[#c9d1d9] text-xs font-medium">{p.name}</div>
                      <div className="text-[#484f58] text-[9px]">{p.classes.map(c => c.name).join(' / ')}</div>
                    </div>
                  </button>
                ))}
                <div className="border-t border-[#2d333b] pt-2 mt-2">
                  <div className="text-[9px] text-[#484f58]">Click a palette to insert classDef lines. Then apply to nodes with <code className="text-[#22c55e]">:::className</code></div>
                </div>
              </div>
            )}
          </div>
          
          <div className="w-px h-4 bg-[#2d333b]" />
          
          <select
            value=""
            onChange={(e) => {
              if (e.target.value) {
                const template = DIAGRAM_TEMPLATES.find(t => t.label === e.target.value);
                if (template) onChange({ ...block, code: template.code });
              }
            }}
            className="bg-[#0d1117] border border-[#2d333b] rounded-md px-2 py-1 text-[#8b949e] text-xs outline-none focus:border-[#22c55e] cursor-pointer"
          >
            <option value="">Insert Template...</option>
            {DIAGRAM_TEMPLATES.map(t => <option key={t.label} value={t.label}>{t.label}</option>)}
          </select>
          <button
            onClick={renderDiagram}
            disabled={rendering}
            className="flex items-center gap-1 px-2 py-1 bg-[#22c55e]/10 text-[#22c55e] rounded-md text-xs hover:bg-[#22c55e]/20 transition-colors disabled:opacity-50"
          >
            <RefreshCw size={12} className={rendering ? 'animate-spin' : ''} />
            Render
          </button>
        </div>
      </div>

      {/* Active Node Classes — quick copy bar */}
      {activeClasses.length > 0 && (
        <div className="flex items-center gap-1.5 flex-wrap">
          <span className="text-[#484f58] text-[9px] uppercase tracking-wider mr-1">Apply to node:</span>
          {activeClasses.map(cls => (
            <button
              key={cls.name}
              onClick={() => handleCopyClass(cls.name)}
              className="flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono border transition-all hover:scale-105"
              style={{ backgroundColor: cls.fill + '25', borderColor: cls.fill + '50', color: cls.fill }}
              title={`Click to copy :::${cls.name}`}
              data-testid={`copy-class-${cls.name}`}
            >
              <div className="w-2 h-2 rounded-sm" style={{ backgroundColor: cls.fill }} />
              :::{cls.name}
              {copiedClass === cls.name && <Check size={10} className="text-[#22c55e]" />}
            </button>
          ))}
        </div>
      )}

      <input
        value={block.title || ''}
        onChange={(e) => onChange({ ...block, title: e.target.value })}
        placeholder="Diagram title (optional)"
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]"
      />

      <div className="grid grid-cols-2 gap-3">
        {/* Code Editor */}
        <div className="space-y-1">
          <span className="text-[#484f58] text-[10px] uppercase tracking-wider">Code</span>
          <div className="border border-[#2d333b] rounded-lg overflow-hidden">
            <Editor
              height="280px"
              language="markdown"
              value={block.code || ''}
              onChange={(val) => onChange({ ...block, code: val || '' })}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 12,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                wordWrap: 'on',
                padding: { top: 8, bottom: 8 },
                automaticLayout: true,
              }}
            />
          </div>
        </div>

        {/* Preview */}
        <div className="space-y-1">
          <span className="text-[#484f58] text-[10px] uppercase tracking-wider">Preview</span>
          <div
            ref={previewRef}
            className="border border-[#2d333b] rounded-lg p-4 h-[280px] overflow-auto flex items-center justify-center"
            style={{ backgroundColor: '#0d1117' }}
          >
            {rendering && (
              <div className="text-[#484f58] flex items-center gap-2">
                <Loader2 size={16} className="animate-spin" />
                <span className="text-xs">Rendering...</span>
              </div>
            )}
            {error && (
              <div className="text-red-400 text-xs text-center p-2">
                <AlertCircle size={20} className="mx-auto mb-2" />
                <p className="font-medium">Syntax Error</p>
                <p className="text-[10px] mt-1 opacity-80">{error}</p>
              </div>
            )}
            {svg && !error && !rendering && (
              <div
                className="mermaid-preview w-full h-full flex items-center justify-center"
                dangerouslySetInnerHTML={{ __html: sanitizeHtml(svg) }}
              />
            )}
            {!svg && !error && !rendering && (
              <div className="text-[#484f58] text-xs text-center">
                <GitBranch size={24} className="mx-auto mb-2 opacity-50" />
                <p>Enter Mermaid code to see preview</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="text-[10px] text-[#484f58] flex items-center gap-4">
        <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener noreferrer" className="hover:text-[#8b949e] transition-colors">
          Mermaid Docs
        </a>
        <span>Supports: Flowchart, Sequence, Class, State, ER, Gantt, Pie, Git diagrams</span>
        <span>Tip: Use <code className="text-[#22c55e]">:::className</code> after a node to apply color</span>
      </div>
    </div>
  );
};

// Helper to extract YouTube video ID from various URL formats
const extractYouTubeId = (url: string): string => {
  if (!url) return '';
  // Handle youtu.be/VIDEO_ID format
  const shortMatch = url.match(/youtu\.be\/([a-zA-Z0-9_-]{11})/);
  if (shortMatch) return shortMatch[1];
  // Handle youtube.com/watch?v=VIDEO_ID format
  const watchMatch = url.match(/[?&]v=([a-zA-Z0-9_-]{11})/);
  if (watchMatch) return watchMatch[1];
  // Handle youtube.com/embed/VIDEO_ID format
  const embedMatch = url.match(/embed\/([a-zA-Z0-9_-]{11})/);
  if (embedMatch) return embedMatch[1];
  // Handle youtube.com/v/VIDEO_ID format
  const vMatch = url.match(/\/v\/([a-zA-Z0-9_-]{11})/);
  if (vMatch) return vMatch[1];
  // If it's just the video ID (11 chars)
  if (/^[a-zA-Z0-9_-]{11}$/.test(url)) return url;
  return '';
};

const YouTubeEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const handleUrlChange = (url: string) => {
    const videoId = extractYouTubeId(url);
    onChange({ ...block, url, videoId });
  };

  const videoId = block.videoId || extractYouTubeId(block.url ?? '');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <Youtube size={18} className="text-[#ff0000]" />
        <span className="text-[#c9d1d9] text-sm font-medium">YouTube Video</span>
      </div>
      <input 
        data-testid="youtube-url-input"
        value={block.url || ''} 
        onChange={(e) => handleUrlChange(e.target.value)} 
        placeholder="Paste YouTube URL (e.g., https://youtube.com/watch?v=... or youtu.be/...)" 
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#ff0000]" 
      />
      <div className="flex gap-2">
        <input 
          value={block.title || ''} 
          onChange={(e) => onChange({ ...block, title: e.target.value })} 
          placeholder="Video title (optional)" 
          className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
        />
        <input 
          value={block.startTime || ''} 
          onChange={(e) => onChange({ ...block, startTime: e.target.value })} 
          placeholder="Start time (e.g., 1m30s)" 
          className="w-32 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
        />
      </div>
      <div className="flex items-center gap-4">
        <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
          <input type="checkbox" checked={block.autoplay || false} onChange={(e) => onChange({ ...block, autoplay: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#ff0000] focus:ring-[#ff0000]" />
          <span>Autoplay</span>
        </label>
      </div>
      {videoId && (
        <div className="rounded-lg border border-[#2d333b] overflow-hidden aspect-video bg-[#0d1117]">
          <iframe 
            src={`https://www.youtube.com/embed/${videoId}${block.startTime ? `?start=${parseStartTime(block.startTime)}` : ''}`}
            title={block.title || 'YouTube video'}
            className="w-full h-full"
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {!videoId && block.url && (
        <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#ef4444] text-sm">
          Invalid YouTube URL. Please use a valid YouTube link.
        </div>
      )}
    </div>
  );
};

// Parse start time string to seconds (e.g., "1m30s" -> 90)
const parseStartTime = (time: string): number => {
  if (!time) return 0;
  let seconds = 0;
  const hours = time.match(/(\d+)h/);
  const mins = time.match(/(\d+)m/);
  const secs = time.match(/(\d+)s/);
  if (hours) seconds += parseInt(hours[1]) * 3600;
  if (mins) seconds += parseInt(mins[1]) * 60;
  if (secs) seconds += parseInt(secs[1]);
  // If just a number, treat as seconds
  if (!hours && !mins && !secs && /^\d+$/.test(time)) seconds = parseInt(time);
  return seconds;
};

const VideoEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <div className="space-y-3">
    <div className="flex items-center gap-2">
      <Video size={18} className="text-[#a855f7]" />
      <span className="text-[#c9d1d9] text-sm font-medium">Video File</span>
    </div>
    <input 
      data-testid="video-url-input"
      value={block.url || ''} 
      onChange={(e) => onChange({ ...block, url: e.target.value })} 
      placeholder="Video URL (MP4, WebM, OGG)" 
      className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#a855f7]" 
    />
    <div className="flex gap-2">
      <input 
        value={block.title || ''} 
        onChange={(e) => onChange({ ...block, title: e.target.value })} 
        placeholder="Video title (optional)" 
        className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
      />
      <input 
        value={block.poster || ''} 
        onChange={(e) => onChange({ ...block, poster: e.target.value })} 
        placeholder="Poster image URL (thumbnail)" 
        className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
      />
    </div>
    <div className="flex items-center gap-4">
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.controls !== false} onChange={(e) => onChange({ ...block, controls: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#a855f7] focus:ring-[#a855f7]" />
        <span>Show Controls</span>
      </label>
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.autoplay || false} onChange={(e) => onChange({ ...block, autoplay: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#a855f7] focus:ring-[#a855f7]" />
        <span>Autoplay</span>
      </label>
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.loop || false} onChange={(e) => onChange({ ...block, loop: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#a855f7] focus:ring-[#a855f7]" />
        <span>Loop</span>
      </label>
      <label className="flex items-center gap-2 text-[#8b949e] text-xs cursor-pointer">
        <input type="checkbox" checked={block.muted || false} onChange={(e) => onChange({ ...block, muted: e.target.checked })} className="rounded bg-[#0d1117] border-[#2d333b] text-[#a855f7] focus:ring-[#a855f7]" />
        <span>Muted</span>
      </label>
    </div>
    {block.url && (
      <div className="rounded-lg border border-[#2d333b] overflow-hidden bg-[#0d1117]">
        <video 
          src={block.url}
          poster={block.poster}
          controls={block.controls !== false}
          loop={block.loop}
          muted={block.muted}
          className="w-full max-h-[300px]"
          onError={(e: React.SyntheticEvent<HTMLVideoElement, Event>) => { const target = e.target as HTMLVideoElement; if (target.parentElement) target.parentElement.innerHTML = '<div class="px-4 py-8 text-center text-[#ef4444] text-sm">Failed to load video</div>'; }}
        >
          Your browser does not support the video tag.
        </video>
      </div>
    )}
    {!block.url && (
      <div className="rounded-lg border border-dashed border-[#2d333b] bg-[#0d1117] px-4 py-8 text-center">
        <Play size={32} className="text-[#484f58] mx-auto mb-2" />
        <p className="text-[#484f58] text-sm">Enter a video URL to preview</p>
        <p className="text-[#484f58] text-xs mt-1">Supports MP4, WebM, OGG formats</p>
      </div>
    )}
  </div>
);

// Helper to extract Vimeo video ID from various URL formats
const extractVimeoId = (url: string): string => {
  if (!url) return '';
  // Handle vimeo.com/VIDEO_ID format
  const basicMatch = url.match(/vimeo\.com\/(\d+)/);
  if (basicMatch) return basicMatch[1];
  // Handle player.vimeo.com/video/VIDEO_ID
  const playerMatch = url.match(/player\.vimeo\.com\/video\/(\d+)/);
  if (playerMatch) return playerMatch[1];
  // If it's just the video ID (digits only)
  if (/^\d+$/.test(url)) return url;
  return '';
};

const VimeoEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const handleUrlChange = (url: string) => {
    const videoId = extractVimeoId(url);
    onChange({ ...block, url, videoId });
  };

  const videoId = block.videoId || extractVimeoId(block.url ?? '');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#1ab7ea">
          <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
        </svg>
        <span className="text-[#c9d1d9] text-sm font-medium">Vimeo Video</span>
      </div>
      <input 
        data-testid="vimeo-url-input"
        value={block.url || ''} 
        onChange={(e) => handleUrlChange(e.target.value)} 
        placeholder="Paste Vimeo URL (e.g., https://vimeo.com/123456789)" 
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#1ab7ea]" 
      />
      <input 
        value={block.title || ''} 
        onChange={(e) => onChange({ ...block, title: e.target.value })} 
        placeholder="Video title (optional)" 
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
      />
      {videoId && (
        <div className="rounded-lg border border-[#2d333b] overflow-hidden aspect-video bg-[#0d1117]">
          <iframe 
            src={`https://player.vimeo.com/video/${videoId}?title=0&byline=0&portrait=0`}
            title={block.title || 'Vimeo video'}
            className="w-full h-full"
            allow="autoplay; fullscreen; picture-in-picture"
            allowFullScreen
          />
        </div>
      )}
      {!videoId && block.url && (
        <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#ef4444] text-sm">
          Invalid Vimeo URL. Please use a valid Vimeo link.
        </div>
      )}
      {!block.url && (
        <div className="rounded-lg border border-dashed border-[#2d333b] bg-[#0d1117] px-4 py-8 text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-[#484f58]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M23.977 6.416c-.105 2.338-1.739 5.543-4.894 9.609-3.268 4.247-6.026 6.37-8.29 6.37-1.409 0-2.578-1.294-3.553-3.881L5.322 11.4C4.603 8.816 3.834 7.522 3.01 7.522c-.179 0-.806.378-1.881 1.132L0 7.197c1.185-1.044 2.351-2.084 3.501-3.128C5.08 2.701 6.266 1.984 7.055 1.91c1.867-.18 3.016 1.1 3.447 3.838.465 2.953.789 4.789.971 5.507.539 2.45 1.131 3.674 1.776 3.674.502 0 1.256-.796 2.265-2.385 1.004-1.589 1.54-2.797 1.612-3.628.144-1.371-.395-2.061-1.614-2.061-.574 0-1.167.121-1.777.391 1.186-3.868 3.434-5.757 6.762-5.637 2.473.06 3.628 1.664 3.493 4.797l-.013.01z"/>
          </svg>
          <p className="text-[#484f58] text-sm">Enter a Vimeo URL to preview</p>
        </div>
      )}
    </div>
  );
};

// Helper to extract Loom video ID from various URL formats
const extractLoomId = (url: string): string => {
  if (!url) return '';
  // Handle loom.com/share/VIDEO_ID format
  const shareMatch = url.match(/loom\.com\/share\/([a-zA-Z0-9]+)/);
  if (shareMatch) return shareMatch[1];
  // Handle loom.com/embed/VIDEO_ID format
  const embedMatch = url.match(/loom\.com\/embed\/([a-zA-Z0-9]+)/);
  if (embedMatch) return embedMatch[1];
  // If it's just the video ID (alphanumeric)
  if (/^[a-zA-Z0-9]{32}$/.test(url)) return url;
  return '';
};

const LoomEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => {
  const handleUrlChange = (url: string) => {
    const videoId = extractLoomId(url);
    onChange({ ...block, url, videoId });
  };

  const videoId = block.videoId || extractLoomId(block.url ?? '');

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <svg className="w-5 h-5" viewBox="0 0 24 24" fill="#625df5">
          <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 12.75l-6 3.75c-.375.25-.875 0-.875-.5v-8c0-.5.5-.75.875-.5l6 3.75c.375.25.375.75 0 1z"/>
        </svg>
        <span className="text-[#c9d1d9] text-sm font-medium">Loom Recording</span>
      </div>
      <input 
        data-testid="loom-url-input"
        value={block.url || ''} 
        onChange={(e) => handleUrlChange(e.target.value)} 
        placeholder="Paste Loom URL (e.g., https://www.loom.com/share/abc123...)" 
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-2 text-[#c9d1d9] text-sm outline-none focus:border-[#625df5]" 
      />
      <input 
        value={block.title || ''} 
        onChange={(e) => onChange({ ...block, title: e.target.value })} 
        placeholder="Video title (optional)" 
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-md px-3 py-1.5 text-[#c9d1d9] text-xs outline-none focus:border-[#22c55e]" 
      />
      {videoId && (
        <div className="rounded-lg border border-[#2d333b] overflow-hidden aspect-video bg-[#0d1117]">
          <iframe 
            src={`https://www.loom.com/embed/${videoId}`}
            title={block.title || 'Loom recording'}
            className="w-full h-full"
            allow="autoplay; fullscreen"
            allowFullScreen
          />
        </div>
      )}
      {!videoId && block.url && (
        <div className="rounded-lg border border-[#ef4444]/30 bg-[#ef4444]/10 px-4 py-3 text-[#ef4444] text-sm">
          Invalid Loom URL. Please use a valid Loom share link.
        </div>
      )}
      {!block.url && (
        <div className="rounded-lg border border-dashed border-[#2d333b] bg-[#0d1117] px-4 py-8 text-center">
          <svg className="w-8 h-8 mx-auto mb-2 text-[#484f58]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm4.5 12.75l-6 3.75c-.375.25-.875 0-.875-.5v-8c0-.5.5-.75.875-.5l6 3.75c.375.25.375.75 0 1z"/>
          </svg>
          <p className="text-[#484f58] text-sm">Enter a Loom URL to preview</p>
        </div>
      )}
    </div>
  );
};

const BlockquoteEditor = ({ block, onChange }: { block: EditorBlock; onChange: (block: EditorBlock) => void }) => (
  <div className="border-l-4 pl-4 py-2" style={{ borderColor: '#22c55e' }}>
    <textarea value={block.text || ''} onChange={(e) => onChange({ ...block, text: e.target.value })} placeholder="Quote text..." className="w-full bg-transparent text-[#c9d1d9] text-sm italic outline-none resize-none placeholder:text-[#484f58] placeholder:not-italic" rows={3} />
  </div>
);

// ========== BLOCK RENDERER ==========
function renderBlockEditor(block: EditorBlock, onChange: (block: EditorBlock) => void) {
  switch (block.type) {
    case 'paragraph': return <ParagraphEditor block={block} onChange={onChange} />;
    case 'heading': case 'subheading': return <HeadingEditor block={{ ...block, level: block.level || 2 }} onChange={onChange} />;
    case 'code': return <CodeBlockEditor block={block} onChange={onChange} />;
    case 'codegroup': return <CodeGroupEditor block={block} onChange={onChange} />;
    case 'mermaid': return <MermaidEditor block={block} onChange={onChange} />;
    case 'callout': return <CalloutEditor block={block} onChange={onChange} />;
    case 'accordion': return <AccordionEditor block={block} onChange={onChange} />;
    case 'tabs': return <TabsEditor block={block} onChange={onChange} />;
    case 'steps': return <StepsEditor block={block} onChange={onChange} />;
    case 'card': return <CardEditor block={block} onChange={onChange} />;
    case 'list': return <ListEditor block={block} onChange={onChange} />;
    case 'table': return <TableEditor block={block} onChange={onChange} />;
    case 'image': return <ImageEditor block={block} onChange={onChange} />;
    case 'youtube': return <YouTubeEditor block={block} onChange={onChange} />;
    case 'vimeo': return <VimeoEditor block={block} onChange={onChange} />;
    case 'loom': return <LoomEditor block={block} onChange={onChange} />;
    case 'video': return <VideoEditor block={block} onChange={onChange} />;
    case 'blockquote': return <BlockquoteEditor block={block} onChange={onChange} />;
    case 'divider': return <div className="border-t-2 border-dashed border-[#2d333b] my-4" />;
    default: return <ParagraphEditor block={block} onChange={onChange} />;
  }
}

// ========== BLOCK TYPE LABEL ==========
function getBlockLabel(block: EditorBlock) {
  if (block.type === 'callout') return `${(block.variant || 'note').charAt(0).toUpperCase() + (block.variant || 'note').slice(1)}`;
  if (block.type === 'heading' || block.type === 'subheading') return `H${block.level || 2}`;
  if (block.type === 'list') return block.ordered ? 'Numbered List' : 'Bullet List';
  const def = BLOCK_TYPES.find(b => b.type === block.type);
  return def?.label || block.type;
}

function getBlockIcon(block: EditorBlock) {
  if (block.type === 'callout') return CALLOUT_STYLES[block.variant as keyof typeof CALLOUT_STYLES]?.icon || Info;
  if (block.type === 'list') return block.ordered ? ListOrdered : List;
  const def = BLOCK_TYPES.find(b => b.type === block.type);
  return def?.icon || Type;
}

function getBlockColor(block: EditorBlock) {
  if (block.type === 'callout') return CALLOUT_STYLES[block.variant as keyof typeof CALLOUT_STYLES]?.color || '#3b82f6';
  if (block.type === 'code' || block.type === 'codegroup') return '#a855f7';
  if (block.type === 'mermaid') return '#ff6b6b';
  if (block.type === 'heading' || block.type === 'subheading') return '#f59e0b';
  if (block.type === 'accordion' || block.type === 'tabs' || block.type === 'steps') return '#3b82f6';
  if (block.type === 'card') return '#ec4899';
  if (block.type === 'table') return '#06b6d4';
  if (block.type === 'image') return '#8b5cf6';
  if (block.type === 'youtube') return '#ff0000';
  if (block.type === 'vimeo') return '#1ab7ea';
  if (block.type === 'loom') return '#625df5';
  if (block.type === 'video') return '#a855f7';
  if (block.type === 'blockquote') return '#22c55e';
  return '#22c55e';
}

const BlockTypeIcon = ({ block, color }: { block: EditorBlock; color: string }) =>
  createElement(getBlockIcon(block), { size: 12, style: { color } });

// ========== SORTABLE BLOCK WRAPPER ==========
const SortableBlock = ({ block, idx, blocksLength, updateBlock, removeBlock, moveBlock, duplicateBlock, openSlashMenu, onAiBlockAssist }: {
  block: EditorBlock;
  idx: number;
  blocksLength: number;
  updateBlock: (index: number, newBlock: EditorBlock) => void;
  removeBlock: (index: number) => void;
  moveBlock: (index: number, dir: number) => void;
  duplicateBlock: (index: number) => void;
  openSlashMenu: (afterIndex: number, element: HTMLElement) => void;
  onAiBlockAssist: ((blockIndex: number, action: string, blockText: string) => void) | null;
}) => {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: block.id ?? '' });
  const style = { transform: CSS.Transform.toString(transform), transition, opacity: isDragging ? 0.5 : 1 };
  const blockColor = getBlockColor(block);

  return (
    <div ref={setNodeRef} style={style} data-testid={`block-${idx}`} className={`group border rounded-xl overflow-hidden transition-all ${isDragging ? 'shadow-2xl ring-2 ring-[#22c55e]/50' : 'hover:border-[#484f58]'}`} {...attributes} data-block-index={idx}>
      <div style={{ backgroundColor: '#161b22', borderColor: isDragging ? '#22c55e' : '#2d333b' }}>
        {/* Block Header */}
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
          <div className="flex items-center gap-2">
            <div {...listeners} className="cursor-grab active:cursor-grabbing p-1 hover:bg-[#2d333b] rounded transition-colors">
              <GripVertical size={14} className="text-[#484f58]" />
            </div>
            <div className="flex items-center gap-2 px-2 py-1 rounded-md" style={{ backgroundColor: blockColor + '15' }}>
              <BlockTypeIcon block={block} color={blockColor} />
              <span className="text-[10px] font-semibold uppercase tracking-wide" style={{ color: blockColor }}>{getBlockLabel(block)}</span>
            </div>
          </div>
          <div className="flex items-center gap-0.5 opacity-0 group-hover:opacity-100 transition-opacity">
            {(block.type === 'paragraph' || block.type === 'subheading') && onAiBlockAssist && (
              <div className="flex items-center gap-0.5 mr-1 border-r border-[#2d333b] pr-1">
                <button onClick={() => onAiBlockAssist(idx, 'expand', block.text || '')} title="AI: Expand" className="p-1.5 text-[#8b5cf6]/60 hover:text-[#8b5cf6] hover:bg-[#8b5cf6]/10 rounded transition-colors"><Sparkles size={12} /></button>
                <button onClick={() => onAiBlockAssist(idx, 'add_code', block.text || '')} title="AI: Add Code Example" className="p-1.5 text-[#22c55e]/60 hover:text-[#22c55e] hover:bg-[#22c55e]/10 rounded transition-colors"><Code size={12} /></button>
                <button onClick={() => onAiBlockAssist(idx, 'explain', block.text || '')} title="AI: Explain Simply" className="p-1.5 text-[#3b82f6]/60 hover:text-[#3b82f6] hover:bg-[#3b82f6]/10 rounded transition-colors"><Info size={12} /></button>
              </div>
            )}
            <button onClick={() => moveBlock(idx, -1)} disabled={idx === 0} title="Move up (Alt+↑)" className="p-1.5 text-[#484f58] hover:text-white hover:bg-[#2d333b] rounded disabled:opacity-30 transition-colors"><ChevronUp size={14} /></button>
            <button onClick={() => moveBlock(idx, 1)} disabled={idx === blocksLength - 1} title="Move down (Alt+↓)" className="p-1.5 text-[#484f58] hover:text-white hover:bg-[#2d333b] rounded disabled:opacity-30 transition-colors"><ChevronDown size={14} /></button>
            <button onClick={() => duplicateBlock(idx)} title="Duplicate (Ctrl+D)" className="p-1.5 text-[#484f58] hover:text-white hover:bg-[#2d333b] rounded transition-colors"><Copy size={14} /></button>
            <button onClick={() => removeBlock(idx)} title="Delete (Backspace)" className="p-1.5 text-[#484f58] hover:text-red-400 hover:bg-red-400/10 rounded transition-colors"><Trash2 size={14} /></button>
          </div>
        </div>
        {/* Block Content */}
        <div className="px-4 py-4">{renderBlockEditor(block, (newBlock: EditorBlock) => updateBlock(idx, newBlock))}</div>
        {/* Insert after this block */}
        <div className="h-0 relative">
          <button data-testid={`add-block-after-${idx}`} onClick={(e) => openSlashMenu(idx, e.currentTarget)} className="absolute left-1/2 -translate-x-1/2 -bottom-3 z-10 w-7 h-7 rounded-full border-2 border-[#2d333b] flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all hover:border-[#22c55e] hover:scale-110" style={{ backgroundColor: '#161b22' }}>
            <Plus size={12} className="text-[#22c55e]" />
          </button>
        </div>
      </div>
    </div>
  );
};

// ========== MAIN BLOCK EDITOR ==========
const BlockEditor = ({ blocks: initialBlocks, onChange, onAiGenerate, generating, lessonId }: {
  blocks: EditorBlock[];
  onChange: (blocks: EditorBlock[]) => void;
  onAiGenerate?: () => void;
  generating?: boolean;
  lessonId?: string;
}) => {
  const [blocks, setBlocks] = useState(() => ensureBlockIds(initialBlocks || []));
  const [prevBlocksKey, setPrevBlocksKey] = useState(() => initialBlocks.map(b => b.id).join(','));
  const [slashOpen, setSlashOpen] = useState<boolean>(false);
  const [slashPosition, setSlashPosition] = useState({ top: 0, left: 0 });
  const [insertIndex, setInsertIndex] = useState(-1);
  const [, setAiAssisting] = useState<number | null>(null); // block index being AI-assisted
  const containerRef = useRef<HTMLDivElement>(null);
  const pendingOnChange = useRef<EditorBlock[] | null>(null);

  // Sync blocks from parent only when initialBlocks changes (not on internal updates)
  const nextBlocksKey = initialBlocks.map(b => b.id).join(',');
  if (nextBlocksKey !== prevBlocksKey) {
    setPrevBlocksKey(nextBlocksKey);
    setBlocks(ensureBlockIds(initialBlocks || []));
  }

  // Handle onChange after state updates (avoids setState during render)
  useEffect(() => {
    if (pendingOnChange.current) {
      onChange(pendingOnChange.current);
      pendingOnChange.current = null;
    }
  }, [blocks, onChange]);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 8 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates })
  );

  const notifyChange = useCallback((newBlocks: EditorBlock[]) => {
    pendingOnChange.current = newBlocks;
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    const { active, over } = event;
    if (!over) return;
    if (active.id !== over.id) {
      setBlocks((items) => {
        const oldIndex = items.findIndex(i => i.id === active.id);
        const newIndex = items.findIndex(i => i.id === over.id);
        const newItems = arrayMove(items, oldIndex, newIndex);
        notifyChange(newItems);
        return newItems;
      });
    }
  }, [notifyChange]);

  const updateBlock = useCallback((index: number, newBlock: EditorBlock) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb[index] = { ...newBlock, id: prev[index].id };
      notifyChange(nb);
      return nb;
    });
  }, [notifyChange]);

  const removeBlock = useCallback((index: number) => {
    setBlocks(prev => {
      const nb = prev.filter((_, i) => i !== index);
      notifyChange(nb);
      return nb;
    });
  }, [notifyChange]);

  const moveBlock = useCallback((index: number, dir: number) => {
    setBlocks(prev => {
      const nb = [...prev];
      const ni = index + dir;
      if (ni < 0 || ni >= nb.length) return prev;
      [nb[index], nb[ni]] = [nb[ni], nb[index]];
      notifyChange(nb);
      return nb;
    });
  }, [notifyChange]);

  const duplicateBlock = useCallback((index: number) => {
    setBlocks(prev => {
      const nb = [...prev];
      const newBlock = { ...JSON.parse(JSON.stringify(prev[index])), id: `block-${Date.now()}-${Math.random().toString(36).substr(2, 9)}` };
      nb.splice(index + 1, 0, newBlock);
      notifyChange(nb);
      return nb;
    });
  }, [notifyChange]);

  const insertBlock = useCallback((type: string, afterIndex: number) => {
    setBlocks(prev => {
      const nb = [...prev];
      nb.splice(afterIndex + 1, 0, createDefaultBlock(type) as EditorBlock);
      notifyChange(nb);
      return nb;
    });
    setSlashOpen(false);
  }, [notifyChange]);

  const handleAiBlockAssist = useCallback(async (blockIndex: number, action: string, blockText: string) => {
    if (!lessonId || !blockText.trim()) return;
    setAiAssisting(blockIndex);
    try {
      const res = await fetch(`/api/lessons/${lessonId}/ai-block-assist`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, block_index: blockIndex, block_text: blockText }),
      });
      if (!res.ok) throw new Error('AI assist failed');
      const data = (await res.json()) as { blocks?: EditorBlock[] };
      if (data.blocks && data.blocks.length > 0) {
        setBlocks(prev => {
          const nb = [...prev];
          const newBlocks = data.blocks!.map((b) => ({
            ...b,
            id: `block-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
          }));
          nb.splice(blockIndex + 1, 0, ...newBlocks);
          notifyChange(nb);
          return nb;
        });
      }
    } catch (err) {
      handleApiError(err, 'AI block assist failed');
    } finally {
      setAiAssisting(null);
    }
  }, [lessonId, notifyChange]);

  const openSlashMenu = (afterIndex: number, element: HTMLElement) => {
    if (!element) return;
    const rect = element.getBoundingClientRect();
    const containerRect = containerRef.current?.getBoundingClientRect() || { top: 0, left: 0 };
    setSlashPosition({ top: rect.bottom - containerRect.top + 8, left: Math.max(0, rect.left - containerRect.left - 100) });
    setInsertIndex(afterIndex);
    setSlashOpen(true);
  };

  const blockIds = useMemo(() => blocks.map(b => b.id).filter((id): id is string => id != null), [blocks]);

  return (
    <div ref={containerRef} className="relative space-y-4">
      {/* Stats bar */}
      <div className="flex items-center justify-between px-1 py-2 border-b border-[#2d333b] mb-2">
        <div className="flex items-center gap-3 text-[10px] text-[#484f58]">
          <span>{blocks.length} blocks</span>
          <span>•</span>
          <span>Drag to reorder • Type / to add blocks</span>
        </div>
        {onAiGenerate && (
          <button onClick={onAiGenerate} disabled={generating} className="flex items-center gap-1.5 text-[#a855f7] hover:text-[#c084fc] text-xs transition-colors disabled:opacity-50">
            {generating ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />}
            {generating ? 'Generating...' : 'AI Generate'}
          </button>
        )}
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={blockIds} strategy={verticalListSortingStrategy}>
          {blocks.map((block, idx) => (
            <SortableBlock
              key={block.id}
              block={block}
              idx={idx}
              blocksLength={blocks.length}
              updateBlock={updateBlock}
              removeBlock={removeBlock}
              moveBlock={moveBlock}
              duplicateBlock={duplicateBlock}
              openSlashMenu={openSlashMenu}
              onAiBlockAssist={lessonId ? handleAiBlockAssist : null}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Empty state / Add first block */}
      {blocks.length === 0 && (
        <button data-testid="add-first-block" onClick={(e) => openSlashMenu(-1, e.currentTarget)} className="w-full border-2 border-dashed border-[#2d333b] rounded-xl py-16 text-center text-[#484f58] hover:border-[#22c55e] hover:text-[#8b949e] transition-colors group">
          <div className="w-12 h-12 rounded-xl bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-3 group-hover:bg-[#22c55e]/20 transition-colors">
            <Plus size={24} className="text-[#22c55e]" />
          </div>
          <span className="text-sm font-medium">Click to add your first block</span>
          <span className="text-xs block mt-1 text-[#484f58]">or type <span className="font-mono bg-[#2d333b] px-1.5 py-0.5 rounded">/</span> anywhere for commands</span>
        </button>
      )}

      {/* Bottom add bar */}
      {blocks.length > 0 && (
        <div className="flex items-center gap-2 pt-2">
          <button data-testid="add-block-bottom" onClick={(e) => openSlashMenu(blocks.length - 1, e.currentTarget)} className="flex items-center gap-2 px-4 py-3 border-2 border-dashed border-[#2d333b] rounded-xl text-[#484f58] hover:text-[#22c55e] hover:border-[#22c55e] text-xs transition-colors w-full justify-center group">
            <Plus size={16} className="group-hover:scale-110 transition-transform" />
            <span>Add Block</span>
            <span className="text-[#484f58] ml-1 font-mono bg-[#2d333b] px-1.5 py-0.5 rounded text-[10px]">/</span>
          </button>
        </div>
      )}

      <SlashMenu isOpen={slashOpen} position={slashPosition} onSelect={(type) => insertBlock(type, insertIndex)} onClose={() => setSlashOpen(false)} />
    </div>
  );
};

export default BlockEditor;
export { BLOCK_TYPES, createDefaultBlock, CALLOUT_STYLES, LANGUAGES, ensureBlockIds };
