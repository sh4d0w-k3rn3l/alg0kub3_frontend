'use client';

import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, showConfirm } from '@/lib/toast';
import { motion, AnimatePresence } from 'framer-motion';
import Editor from '@monaco-editor/react';
import mermaid from 'mermaid';
import {
  ArrowLeft, Play, RotateCcw, CheckCircle, Clock, Lock,
  Plus, X, ChevronDown, ChevronRight, Send, BookOpen, MessageSquare,
  Target, Gauge, Layers, Zap, Shield, Route, Ruler, Minus,
  RefreshCw, Loader2, SkipForward, Code2, Link2, Puzzle, Braces,
  AlertCircle, Award, Trash2,
  FolderOpen, FileCode, FilePlus, Terminal, Folder, FolderPlus,
  ArrowUp, ArrowDown, Save, User, Bot, GitBranch, Download, ZoomIn, ZoomOut,
} from 'lucide-react';

mermaid.initialize({ startOnLoad: false, theme: 'dark', themeVariables: {
  darkMode: true, background: '#0d1117', primaryColor: '#22c55e', primaryTextColor: '#c9d1d9',
  primaryBorderColor: '#2d333b', lineColor: '#484f58', secondaryColor: '#161b22',
  tertiaryColor: '#1c2128', noteBkgColor: '#161b22', noteTextColor: '#c9d1d9',
  classText: '#c9d1d9',
}});

/* ── Type Definitions ── */
interface StepData { id: string; status: string; title?: string; description?: string; tips?: Record<string, unknown>[]; [key: string]: unknown }
interface StepGuidelines {
  goal?: string;
  duration?: string;
  tips?: { icon: string; title: string; text: string }[];
  fr_placeholder?: string;
  nfr_placeholder?: string;
  requirements?: string[];
}
interface SessionData { session_id?: string; steps?: StepData[]; experience_level?: string; answers?: Record<string, Record<string, unknown>>; final_evaluation?: Record<string, unknown>; timer_started_at?: string; examples?: Record<string, unknown>; guidelines?: Record<string, StepGuidelines>; passed?: boolean; problem_title?: string; difficulty?: string; [key: string]: unknown }
interface Entity { name: string; description: string }
interface AttrDef { name: string; type?: string; access?: string; [key: string]: unknown }
interface MethodDef { name: string; returnType?: string; access?: string; params?: string; visibility?: string; [key: string]: unknown }
interface ClassDef { name: string; type: string; attributes?: AttrDef[]; methods?: MethodDef[]; [key: string]: unknown }
interface PatternDef { name: string; reason: string }
interface FileDef { name: string; content: string }
interface AiMessage { role: string; text: string }
interface UndoItem<T = unknown> { type: string; text: string; index: number; data?: T }
interface FeedbackItem { type: string; text?: string; title?: string; description?: string; status?: string; [key: string]: unknown }
interface FinalEvalData { overall_score?: number; passed?: boolean; summary?: string; did_well?: string[]; categories?: Record<string, { score?: number; feedback?: FeedbackItem[] }>; status?: string; [key: string]: unknown }
interface FeedbackStepData { score?: number; did_well?: string[]; improve?: string[]; [key: string]: unknown }

/* ── Mermaid UML Diagram Component ── */
const ACCESS_SYMBOLS: Record<string, string> = { private: '-', public: '+', protected: '#' };
const REL_ARROWS: Record<string, string> = {
  inheritance: '<|--', implementation: '..|>', composition: '*--',
  aggregation: 'o--', association: '-->', dependency: '..>',
};

interface MermaidRelation { from_class: string; to_class: string; relationship: string; }
function buildMermaidSyntax(classes: ClassDef[], relationships: MermaidRelation[]) {
  const lines = ['classDiagram'];
  for (const cls of classes) {
    const safeName = cls.name.replace(/[^a-zA-Z0-9_]/g, '_');
    const hasMembers = (cls.attributes?.length || 0) + (cls.methods?.length || 0) > 0;

    if (hasMembers) {
      lines.push(`  class ${safeName} {`);
      for (const a of (cls.attributes || [])) {
        const sym = ACCESS_SYMBOLS[a.access || ''] || '-';
        lines.push(`    ${sym}${a.type || 'Object'} ${a.name}`);
      }
      for (const m of (cls.methods || [])) {
        const sym = ACCESS_SYMBOLS[m.access || ''] || '+';
        lines.push(`    ${sym}${m.name}(${m.params || ''}) ${m.returnType || 'void'}`);
      }
      lines.push('  }');
    } else {
      lines.push(`  class ${safeName}`);
    }

    if (cls.type === 'interface') lines.push(`  <<Interface>> ${safeName}`);
    else if (cls.type === 'abstract') lines.push(`  <<Abstract>> ${safeName}`);
    else if (cls.type === 'enum') lines.push(`  <<Enumeration>> ${safeName}`);
  }
  for (const r of relationships) {
    const from = r.from_class.replace(/[^a-zA-Z0-9_]/g, '_');
    const to = r.to_class.replace(/[^a-zA-Z0-9_]/g, '_');
    const arrow = REL_ARROWS[r.relationship] || '-->';
    lines.push(`  ${from} ${arrow} ${to}`);
  }
  return lines.join('\n');
}

const MermaidDiagram = ({ classes, relationships }: { classes: ClassDef[]; relationships: MermaidRelation[] }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const renderCount = useRef(0);

  const syntax = useMemo(() => buildMermaidSyntax(classes, relationships), [classes, relationships]);
  const hasContent = classes.length > 0;

  useEffect(() => {
    if (!hasContent || !containerRef.current) {
      if (containerRef.current) containerRef.current.innerHTML = '';
      setError(null);
      return;
    }
    const id = `mermaid-uml-${++renderCount.current}`;
    const timer = setTimeout(async () => {
      try {
        document.querySelectorAll('[id^="dmermaid-uml-"]').forEach(el => el.remove());
        const { svg } = await mermaid.render(id, syntax);
        if (containerRef.current) {
          containerRef.current.innerHTML = svg;
          const svgEl = containerRef.current.querySelector('svg');
          if (svgEl) {
            svgEl.style.maxWidth = '100%';
            svgEl.style.height = 'auto';
          }
        }
        setError(null);
      } catch (e) {
        console.error('Mermaid render error:', e);
        if (containerRef.current) containerRef.current.innerHTML = '';
        setError(e instanceof Error ? e.message : 'Render failed');
        const failedEl = document.getElementById('d' + id);
        if (failedEl) failedEl.remove();
      }
    }, 200);
    return () => clearTimeout(timer);
  }, [syntax, hasContent]);

  const handleDownload = () => {
    if (!containerRef.current) return;
    const svgEl = containerRef.current.querySelector('svg');
    if (!svgEl) return;
    const blob = new Blob([svgEl.outerHTML], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = 'class-diagram.svg'; a.click();
    URL.revokeObjectURL(url);
  };

  if (!hasContent) {
    return (
      <div data-testid="lld-diagram-empty" className="rounded-xl border border-dashed border-[#2d333b] p-12 text-center" style={{ backgroundColor: '#0d1117' }}>
        <GitBranch size={32} className="mx-auto text-[#484f58] mb-3" />
        <p className="text-sm text-[#8b949e] font-medium">No classes defined yet</p>
        <p className="text-xs text-[#484f58] mt-1">Add classes in the Classes tab to see your UML diagram here.</p>
      </div>
    );
  }

  return (
    <div data-testid="lld-diagram-view" className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex items-center justify-between px-4 py-2 border-b border-[#2d333b]" style={{ backgroundColor: '#161b22' }}>
        <div className="flex items-center gap-2">
          <GitBranch size={13} className="text-[#22c55e]" />
          <span className="text-xs font-semibold text-[#c9d1d9]">UML Class Diagram</span>
          <span className="text-[10px] text-[#484f58]">{classes.length} classes, {relationships.length} relationships</span>
        </div>
        <div className="flex items-center gap-1.5">
          <button data-testid="lld-diagram-zoom-out" onClick={() => setZoom(z => Math.max(0.3, z - 0.15))}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><ZoomOut size={13} /></button>
          <span className="text-[10px] text-[#484f58] w-10 text-center">{Math.round(zoom * 100)}%</span>
          <button data-testid="lld-diagram-zoom-in" onClick={() => setZoom(z => Math.min(2.5, z + 0.15))}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors"><ZoomIn size={13} /></button>
          <div className="w-px h-4 bg-[#2d333b] mx-1" />
          <button data-testid="lld-diagram-download" onClick={handleDownload}
            className="p-1 rounded text-[#8b949e] hover:text-white hover:bg-[#21262d] transition-colors" title="Download SVG"><Download size={13} /></button>
        </div>
      </div>
      {error && (
        <div className="px-4 py-2 border-b border-red-500/20 bg-red-500/5">
          <p className="text-xs text-red-400">Diagram render issue — try simplifying class/relationship names</p>
        </div>
      )}
      <div className="overflow-auto" style={{ maxHeight: '480px' }}>
        <div ref={containerRef} className="flex items-center justify-center p-6 min-h-[200px]"
          style={{ transform: `scale(${zoom})`, transformOrigin: 'top center', transition: 'transform 0.2s ease' }} />
      </div>
    </div>
  );
};


const STEP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = { target: Target, gauge: Gauge, ruler: Ruler, route: Route, shield: Shield, layers: Layers, zap: Zap };
const DIFF_COLORS: Record<string, string> = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };

/* ── Item 6: Undo Toast ── */
const UndoToast = ({ item, onUndo, onDismiss }: { item: UndoItem | null; onUndo: () => void; onDismiss: () => void }) => {
  useEffect(() => { if (!item) return; const t = setTimeout(onDismiss, 5000); return () => clearTimeout(t); }, [item, onDismiss]);
  if (!item) return null;
  return (
    <div data-testid="undo-toast" className="fixed bottom-6 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-4 py-2.5 rounded-lg bg-[#1c2128] border border-[#2d333b] shadow-xl">
      <span className="text-sm text-[#c9d1d9]">{'Removed "'}{item.text?.length > 40 ? item.text.slice(0, 40) + '...' : item.text}{'"'}</span>
      <button onClick={onUndo} className="text-sm font-semibold text-[#a855f7] hover:text-[#c084fc]">Undo</button>
      <button onClick={onDismiss} className="text-[#484f58] hover:text-white"><X size={12} /></button>
    </div>
  );
};

const EXPERIENCE_LEVELS = [
  { key: 'junior', label: 'Junior', years: '0-2 years', color: '#4ade80' },
  { key: 'mid', label: 'Mid-Level', years: '2-5 years', color: '#60a5fa' },
  { key: 'senior', label: 'Senior', years: '5-10 years', color: '#c084fc' },
  { key: 'staff', label: 'Staff+', years: '10+ years', color: '#fbbf24' },
];

const LANGUAGES = [
  { value: 'python', label: 'Python' },
  { value: 'java', label: 'Java' },
  { value: 'javascript', label: 'JavaScript' },
  { value: 'typescript', label: 'TypeScript' },
  { value: 'cpp', label: 'C++' },
  { value: 'csharp', label: 'C#' },
  { value: 'go', label: 'Go' },
  { value: 'rust', label: 'Rust' },
];

const RELATIONSHIP_TYPES = [
  { value: 'association', label: 'association (uses)' },
  { value: 'composition', label: 'composition (owns)' },
  { value: 'aggregation', label: 'aggregation (has)' },
  { value: 'inheritance', label: 'inheritance (extends)' },
  { value: 'implementation', label: 'implementation (implements)' },
  { value: 'dependency', label: 'dependency (depends on)' },
];

const CLASS_TYPES = [
  { value: 'class', label: 'Class' },
  { value: 'interface', label: 'Interface' },
  { value: 'enum', label: 'Enum' },
  { value: 'abstract', label: 'Abstract Class' },
];

/* ────────── Experience Level Modal ────────── */
const ExperienceLevelModal = ({ onSelect }: { onSelect: (key: string) => void }) => (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm">
    <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
      className="rounded-2xl border border-[#2d333b] p-8 w-full max-w-lg" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-3">
          <Target size={20} className="text-[#22c55e]" />
          <h2 className="text-xl font-bold text-white">Select Your Experience Level</h2>
        </div>
      </div>
      <p className="text-sm text-[#8b949e] mb-6">This helps calibrate the evaluation to your experience. You can change this later.</p>
      <div className="grid grid-cols-2 gap-3">
        {EXPERIENCE_LEVELS.map(lvl => (
          <button key={lvl.key} data-testid={`exp-level-${lvl.key}`} onClick={() => onSelect(lvl.key)}
            className="group rounded-xl border border-[#2d333b] p-5 text-center hover:border-[#22c55e] transition-all cursor-pointer"
            style={{ backgroundColor: '#161b22' }}>
            <div className="text-3xl mb-2">
              {lvl.key === 'junior' ? '🎨' : lvl.key === 'mid' ? '💻' : lvl.key === 'senior' ? '🔧' : '⭐'}
            </div>
            <p className="text-sm font-bold group-hover:text-[#22c55e] transition-colors" style={{ color: lvl.color }}>{lvl.label}</p>
            <p className="text-xs text-[#8b949e] mt-0.5">{lvl.years}</p>
          </button>
        ))}
      </div>
    </motion.div>
  </div>
);

/* ────────── Left Sidebar ────────── */
const Sidebar = ({ session, activeStep, sidebarTab, setSidebarTab, aiQuestion, setAiQuestion, aiMessages, aiLoading, onAskAi }: {
  session: SessionData; activeStep: string; sidebarTab: string; setSidebarTab: (t: string) => void;
  aiQuestion: string; setAiQuestion: (q: string) => void; aiMessages: AiMessage[]; aiLoading: boolean; onAskAi: () => void;
}) => {
  const step = session?.steps?.find((s: StepData) => s.id === activeStep);
  const guidelines = session?.guidelines?.[activeStep];
  const chatEndRef = useRef<HTMLDivElement>(null);
  useEffect(() => { chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [aiMessages]);

  return (
    <div className="w-72 shrink-0 border-r border-[#2d333b] flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex border-b border-[#2d333b]">
        <button data-testid="lld-sidebar-guidelines" onClick={() => setSidebarTab('guidelines')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${sidebarTab === 'guidelines' ? 'text-white bg-[#161b22] border-b-2 border-[#22c55e]' : 'text-[#8b949e]'}`}>
          <BookOpen size={12} /> Guidelines
        </button>
        <button data-testid="lld-sidebar-ask-ai" onClick={() => setSidebarTab('ask-ai')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${sidebarTab === 'ask-ai' ? 'text-white bg-[#161b22] border-b-2 border-[#22c55e]' : 'text-[#8b949e]'}`}>
          <MessageSquare size={12} /> Ask AI
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        {sidebarTab === 'guidelines' && (
          <div>
            <h3 className="text-base font-bold text-white mb-1">{step?.title}</h3>
            <p className="text-xs text-[#8b949e] mb-4">{step?.description}</p>
            {guidelines && (
              <>
                <p className="text-xs text-[#c9d1d9] mb-3 leading-relaxed">{guidelines.goal}</p>
                {guidelines.duration && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-[#8b949e]"><Clock size={12} /> Duration: ~{guidelines.duration}</div>
                )}
                {guidelines.tips?.map((tip, i) => {
                  const Icon = STEP_ICONS[tip.icon] || Target;
                  return (
                    <div key={i} className="flex gap-2.5 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#161b22] border border-[#2d333b] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={10} className="text-[#8b949e]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#c9d1d9]">{tip.title}</p>
                        <p className="text-[11px] text-[#8b949e] leading-relaxed mt-0.5">{tip.text}</p>
                      </div>
                    </div>
                  );
                })}
              </>
            )}
          </div>
        )}
        {sidebarTab === 'ask-ai' && (
          <div className="flex flex-col h-full">
            <p className="text-xs text-[#8b949e] mb-3">Ask a clarifying question. The AI will guide you without giving away the answer.</p>
            <div className="flex-1 overflow-y-auto space-y-2.5 mb-3">
              {aiMessages.length === 0 && <p className="text-xs text-[#484f58] italic text-center py-4">No messages yet.</p>}
              {aiMessages.map((msg: AiMessage, i: number) => (
                <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  {msg.role === 'assistant' && <div className="w-5 h-5 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0"><Bot size={10} className="text-[#a855f7]" /></div>}
                  <div className={`max-w-[85%] px-3 py-2 rounded-lg text-xs leading-relaxed whitespace-pre-wrap ${msg.role === 'user' ? 'bg-[#1c3a5f] text-[#c9d1d9]' : 'bg-[#161b22] border border-[#2d333b] text-[#c9d1d9]'}`}>{msg.text}</div>
                  {msg.role === 'user' && <div className="w-5 h-5 rounded-full bg-[#22c55e]/20 flex items-center justify-center shrink-0"><User size={10} className="text-[#22c55e]" /></div>}
                </div>
              ))}
              {aiLoading && <div className="flex gap-2"><div className="w-5 h-5 rounded-full bg-[#a855f7]/20 flex items-center justify-center shrink-0"><Bot size={10} className="text-[#a855f7]" /></div><div className="px-3 py-2 rounded-lg bg-[#161b22] border border-[#2d333b]"><Loader2 size={10} className="text-[#a855f7] animate-spin" /></div></div>}
              <div ref={chatEndRef} />
            </div>
            <div className="flex gap-2 mt-auto">
              <input data-testid="lld-ask-ai-input" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAskAi()} placeholder="Ask a question..."
                className="flex-1 bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
              <button data-testid="lld-ask-ai-send" onClick={onAskAi} disabled={aiLoading || !aiQuestion.trim()}
                className="p-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white transition-colors">
                {aiLoading ? <Loader2 size={12} className="animate-spin" /> : <Send size={12} />}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

/* ────────── Step 1: Requirements Gathering ────────── */
const RequirementsStep = ({ session, onSave }: { session: SessionData; onSave: (data: Record<string, unknown>) => void }) => {
  const guidelines = session?.guidelines?.requirements;
  const examples = session?.examples as Record<string, unknown> || {};
  const saved = session?.answers?.requirements as Record<string, unknown> || {};
  const [frs, setFrs] = useState<string[]>(saved.functional as string[] || []);
  const [nfrs, setNfrs] = useState<string[]>(saved.non_functional as string[] || []);
  const [frInput, setFrInput] = useState('');
  const [nfrInput, setNfrInput] = useState('');
  const [frError, setFrError] = useState('');
  const [nfrError, setNfrError] = useState('');

  const addFr = () => {
    const val = frInput.trim();
    if (!val) return;
    if (val.length < 10) { setFrError('Minimum 10 characters required'); return; }
    setFrError('');
    const next = [...frs, val]; setFrs(next); setFrInput(''); onSave({ functional: next, non_functional: nfrs });
  };
  const addNfr = () => {
    const val = nfrInput.trim();
    if (!val) return;
    if (val.length < 10) { setNfrError('Minimum 10 characters required'); return; }
    setNfrError('');
    const next = [...nfrs, val]; setNfrs(next); setNfrInput(''); onSave({ functional: frs, non_functional: next });
  };
  const removeFr = (i: number) => { const removed = frs[i]; const next = frs.filter((_, idx) => idx !== i); setFrs(next); onSave({ functional: next, non_functional: nfrs }); setUndoItem({ type: 'fr', text: removed, index: i }); };
  const removeNfr = (i: number) => { const removed = nfrs[i]; const next = nfrs.filter((_, idx) => idx !== i); setNfrs(next); onSave({ functional: frs, non_functional: next }); setUndoItem({ type: 'nfr', text: removed, index: i }); };
  const [undoItem, setUndoItem] = useState<UndoItem<string> | null>(null);
  const handleUndo = () => { if (!undoItem) return; if (undoItem.type === 'fr') { const n = [...frs]; n.splice(undoItem.index, 0, undoItem.text); setFrs(n); onSave({ functional: n, non_functional: nfrs }); } else { const n = [...nfrs]; n.splice(undoItem.index, 0, undoItem.text); setNfrs(n); onSave({ functional: frs, non_functional: n }); } setUndoItem(null); };
  const moveFr = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= frs.length) return; const n = [...frs]; [n[i], n[j]] = [n[j], n[i]]; setFrs(n); onSave({ functional: n, non_functional: nfrs }); };
  const moveNfr = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= nfrs.length) return; const n = [...nfrs]; [n[i], n[j]] = [n[j], n[i]]; setNfrs(n); onSave({ functional: frs, non_functional: n }); };

  return (
    <div>
      <div className="flex items-center gap-4 mb-4 px-1">
        <span className={`text-xs font-medium ${frs.length >= 3 ? 'text-[#22c55e]' : 'text-[#8b949e]'}`}>
          {frs.length >= 3 ? <CheckCircle size={12} className="inline mr-1" /> : <AlertCircle size={12} className="inline mr-1" />}
          Use cases: {frs.length}/3 min
        </span>
        <span className={`text-xs font-medium ${nfrs.length >= 2 ? 'text-[#22c55e]' : 'text-[#8b949e]'}`}>
          {nfrs.length >= 2 ? <CheckCircle size={12} className="inline mr-1" /> : <AlertCircle size={12} className="inline mr-1" />}
          Constraints: {nfrs.length}/2 min
        </span>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      <div className="rounded-xl border border-[#22c55e]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#22c55e]/20" style={{ backgroundColor: '#22c55e08' }}>
          <CheckCircle size={14} className="text-[#22c55e]" />
          <h4 className="text-sm font-bold text-white">Functional Requirements</h4>
          <span className="ml-auto text-xs text-[#8b949e]">{frs.length} added</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-1">
            <input data-testid="lld-fr-input" value={frInput} onChange={e => { setFrInput(e.target.value); if (frError) setFrError(''); }}
              onKeyDown={e => e.key === 'Enter' && addFr()}
              placeholder={guidelines?.fr_placeholder || "What should the system do?"}
              className={`flex-1 bg-[#161b22] border rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none placeholder-[#484f58] ${frError ? 'border-red-500 focus:border-red-500' : 'border-[#2d333b] focus:border-[#22c55e]'}`} />
            <button data-testid="lld-fr-add" onClick={addFr} className="px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors"><Plus size={16} /></button>
          </div>
          {frError && <p className="text-xs text-red-400 mb-2 px-1">{frError}</p>}
          {!frError && <p className="text-xs text-[#484f58] mb-2 px-1">Min 10 characters per requirement</p>}
          <div className="space-y-1.5 mb-4">
            {frs.map((fr, i) => (
              <div key={i} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#161b22]">
                <CheckCircle size={12} className="text-[#22c55e] shrink-0" />
                <span className="text-sm text-[#c9d1d9] flex-1">{fr}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button onClick={() => moveFr(i, -1)} disabled={i === 0} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowUp size={11} /></button>
                  <button onClick={() => moveFr(i, 1)} disabled={i === frs.length - 1} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowDown size={11} /></button>
                  <button onClick={() => removeFr(i)} className="text-[#484f58] hover:text-red-400 p-0.5"><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          {(examples.fr_examples as string[] | undefined) && (
            <div className="border-t border-[#2d333b] pt-3">
              <p className="text-xs text-[#484f58] italic mb-1.5">Examples:</p>
              {(examples.fr_examples as string[]).map((ex: string, i: number) => <p key={i} className="text-xs text-[#484f58] italic mb-0.5">• {ex}</p>)}
            </div>
          )}
        </div>
      </div>
      <div className="rounded-xl border border-[#3b82f6]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
        <div className="flex items-center gap-2 px-4 py-3 border-b border-[#3b82f6]/20" style={{ backgroundColor: '#3b82f608' }}>
          <Gauge size={14} className="text-[#3b82f6]" />
          <h4 className="text-sm font-bold text-white">Non-Functional Requirements</h4>
          <span className="ml-auto text-xs text-[#8b949e]">{nfrs.length} added</span>
        </div>
        <div className="p-4">
          <div className="flex gap-2 mb-1">
            <input data-testid="lld-nfr-input" value={nfrInput} onChange={e => { setNfrInput(e.target.value); if (nfrError) setNfrError(''); }}
              onKeyDown={e => e.key === 'Enter' && addNfr()}
              placeholder={guidelines?.nfr_placeholder || "Modular, thread-safe, maintainable..."}
              className={`flex-1 bg-[#161b22] border rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none placeholder-[#484f58] ${nfrError ? 'border-red-500 focus:border-red-500' : 'border-[#2d333b] focus:border-[#3b82f6]'}`} />
            <button data-testid="lld-nfr-add" onClick={addNfr} className="px-3 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors"><Plus size={16} /></button>
          </div>
          {nfrError && <p className="text-xs text-red-400 mb-2 px-1">{nfrError}</p>}
          {!nfrError && <p className="text-xs text-[#484f58] mb-2 px-1">Min 10 characters per constraint</p>}
          <div className="space-y-1.5 mb-4">
            {nfrs.map((nfr, i) => (
              <div key={i} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#161b22]">
                <div className="w-3 h-3 rounded-full border-2 border-[#3b82f6] shrink-0" />
                <span className="text-sm text-[#c9d1d9] flex-1">{nfr}</span>
                <div className="opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                  <button onClick={() => moveNfr(i, -1)} disabled={i === 0} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowUp size={11} /></button>
                  <button onClick={() => moveNfr(i, 1)} disabled={i === nfrs.length - 1} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowDown size={11} /></button>
                  <button onClick={() => removeNfr(i)} className="text-[#484f58] hover:text-red-400 p-0.5"><X size={12} /></button>
                </div>
              </div>
            ))}
          </div>
          {(examples.nfr_examples as string[] | undefined) && (
            <div className="border-t border-[#2d333b] pt-3">
              <p className="text-xs text-[#484f58] italic mb-1.5">Examples:</p>
              {(examples.nfr_examples as string[]).map((ex: string, i: number) => <p key={i} className="text-xs text-[#484f58] italic mb-0.5">• {ex}</p>)}
            </div>
          )}
        </div>
      </div>
    </div>
    <UndoToast item={undoItem} onUndo={handleUndo} onDismiss={() => setUndoItem(null)} />
    </div>
  );
};
const EntitiesStep = ({ session, onSave }: { session: SessionData; onSave: (data: Record<string, unknown>) => void }) => {
  const examples = session?.examples as Record<string, unknown> || {};
  const saved = (session?.answers?.entities || {}) as Record<string, unknown>;
  const [entities, setEntities] = useState<Entity[]>(saved.entities as Entity[] || []);
  const [nameInput, setNameInput] = useState('');
  const [descInput, setDescInput] = useState('');

  const addEntity = () => {
    if (!nameInput.trim()) return;
    const next = [...entities, { name: nameInput.trim(), description: descInput.trim() }];
    setEntities(next);
    setNameInput('');
    setDescInput('');
    onSave({ entities: next });
  };
  const removeEntity = (i: number) => {
    const removed = entities[i];
    const next = entities.filter((_, idx) => idx !== i);
    setEntities(next);
    onSave({ entities: next });
    setUndoItem({ type: 'entity', text: removed.name, index: i, data: removed });
  };
  const [undoItem, setUndoItem] = useState<UndoItem<Entity> | null>(null);
  const handleUndo = () => { if (!undoItem || !undoItem.data) return; const n = [...entities]; n.splice(undoItem.index, 0, undoItem.data); setEntities(n); onSave({ entities: n }); setUndoItem(null); };
  const moveEntity = (i: number, d: number) => { const j = i + d; if (j < 0 || j >= entities.length) return; const n = [...entities]; [n[i], n[j]] = [n[j], n[i]]; setEntities(n); onSave({ entities: n }); };

  return (
    <>
    <div className="rounded-xl border border-[#a855f7]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
      <div className="flex items-center justify-between px-4 py-3 border-b border-[#a855f7]/20" style={{ backgroundColor: '#a855f708' }}>
        <div className="flex items-center gap-2">
          <Puzzle size={14} className="text-[#a855f7]" />
          <h4 className="text-sm font-bold text-white">Classes / Entities</h4>
        </div>
        <span className="text-xs text-[#8b949e]">{entities.length} added</span>
      </div>
      <div className="p-4">
        <div className="flex gap-2 mb-4">
          <input data-testid="lld-entity-name" value={nameInput} onChange={e => setNameInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEntity()}
            placeholder="Class name (e.g., ParkingLot)"
            className="w-1/3 bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#a855f7] placeholder-[#484f58]" />
          <input data-testid="lld-entity-desc" value={descInput} onChange={e => setDescInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEntity()}
            placeholder="Brief description of what this entity represents..."
            className="flex-1 bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#a855f7] placeholder-[#484f58]" />
          <button data-testid="lld-entity-add" onClick={addEntity} className="px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors"><Plus size={16} /></button>
        </div>
        <div className="space-y-2 mb-4">
          {entities.map((e: Entity, i: number) => (
            <div key={i} data-testid={`lld-entity-${i}`} className="flex items-center gap-3 group px-3 py-2 rounded-lg border border-[#2d333b] hover:border-[#a855f7]/30" style={{ backgroundColor: '#161b22' }}>
              <Puzzle size={12} className="text-[#a855f7] shrink-0" />
              <span className="text-sm font-semibold text-[#c9d1d9]">{e.name}</span>
              {e.description && <span className="text-xs text-[#8b949e]">— {e.description}</span>}
              <div className="ml-auto opacity-0 group-hover:opacity-100 flex items-center gap-0.5 transition-opacity">
                <button onClick={() => moveEntity(i, -1)} disabled={i === 0} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowUp size={11} /></button>
                <button onClick={() => moveEntity(i, 1)} disabled={i === entities.length - 1} className="text-[#484f58] hover:text-white disabled:opacity-30 p-0.5"><ArrowDown size={11} /></button>
                <button onClick={() => removeEntity(i)} className="text-[#484f58] hover:text-red-400 p-0.5"><Trash2 size={12} /></button>
              </div>
            </div>
          ))}
        </div>
        {(examples.entity_examples as Entity[] | undefined) && (
          <div className="rounded-lg border border-[#a855f7]/20 p-3" style={{ backgroundColor: '#a855f705' }}>
            <p className="text-xs text-[#484f58] italic mb-1.5">Examples for this system:</p>
            {(examples.entity_examples as Entity[]).map((ex: Entity, i: number) => (
              <p key={i} className="text-xs text-[#484f58] italic mb-0.5">• <span className="font-semibold text-[#8b949e]">{ex.name}</span> - {ex.description}</p>
            ))}
          </div>
        )}
      </div>
    </div>
    <UndoToast item={undoItem} onUndo={handleUndo} onDismiss={() => setUndoItem(null)} />
    </>
  );
};

/* ────────── Step 3: Designing Classes & Relationships (Tabbed) ────────── */
const ACCESS_MODIFIERS = ['private', 'public', 'protected'];
const TYPE_COLORS: Record<string, string> = { 'class': '#22c55e', 'interface': '#60a5fa', 'enum': '#fbbf24', 'abstract': '#c084fc' };

const ClassCard = ({ cls, idx, expanded, onToggle, onRemove, onAddAttr, onRemoveAttr, onAddMethod, onRemoveMethod }: {
  cls: ClassDef; idx: number; expanded: boolean; onToggle: () => void; onRemove: () => void;
  onAddAttr: (access: string, name: string, type: string) => void; onRemoveAttr: (i: number) => void;
  onAddMethod: (access: string, name: string, params: string, returnType: string) => void; onRemoveMethod: (i: number) => void;
}) => {
  const [attrAccess, setAttrAccess] = useState('private');
  const [attrName, setAttrName] = useState('');
  const [attrType, setAttrType] = useState('');
  const [methodAccess, setMethodAccess] = useState('public');
  const [methodName, setMethodName] = useState('');
  const [methodParams, setMethodParams] = useState('');
  const [methodReturn, setMethodReturn] = useState('void');
  const color = TYPE_COLORS[cls.type] || '#22c55e';

  const handleAddAttr = () => { onAddAttr(attrAccess, attrName, attrType); setAttrName(''); setAttrType(''); };
  const handleAddMethod = () => { onAddMethod(methodAccess, methodName, methodParams, methodReturn); setMethodName(''); setMethodParams(''); setMethodReturn('void'); };

  return (
    <div data-testid={`lld-class-${idx}`} className="rounded-lg border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-2.5 px-3 py-2.5 cursor-pointer" onClick={onToggle}>
        {expanded ? <ChevronDown size={13} className="text-[#8b949e]" /> : <ChevronRight size={13} className="text-[#8b949e]" />}
        <Puzzle size={14} style={{ color }} />
        <span className="text-sm font-bold text-white">{cls.name}</span>
        <span className="text-[10px] font-bold uppercase px-1.5 py-0.5 rounded" style={{ color, backgroundColor: `${color}15` }}>{cls.type}</span>
        <span className="text-[10px] text-[#484f58] ml-1">{cls.attributes?.length || 0} attrs, {cls.methods?.length || 0} methods</span>
        <button onClick={(e) => { e.stopPropagation(); onRemove(); }} className="ml-auto text-[#484f58] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
      </div>

      {expanded && (
        <div className="border-t border-[#2d333b]">
          <div className="px-3 pt-3 pb-2">
            <div className="flex items-center gap-1.5 mb-2">
              <Minus size={11} className="text-[#8b949e]" />
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Attributes</span>
            </div>
            {cls.attributes?.map((attr: AttrDef, ai: number) => (
              <div key={ai} data-testid={`lld-attr-${idx}-${ai}`} className="flex items-center gap-2 mb-1.5 group">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d333b] text-[#8b949e]">{attr.access}</span>
                <span className="text-xs text-[#c9d1d9] font-medium">{attr.name}</span>
                <span className="text-xs text-[#484f58]">:</span>
                <span className="text-xs text-[#60a5fa]">{attr.type}</span>
                <button onClick={() => onRemoveAttr(ai)} className="ml-auto opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 mt-2">
              <select data-testid={`lld-attr-access-${idx}`} value={attrAccess} onChange={e => setAttrAccess(e.target.value)}
                className="bg-[#0d1117] border border-[#2d333b] rounded px-1.5 py-1.5 text-[11px] text-[#8b949e] outline-none w-20">
                {ACCESS_MODIFIERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input data-testid={`lld-attr-name-${idx}`} value={attrName} onChange={e => setAttrName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAttr()}
                placeholder="name" className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#484f58] placeholder-[#484f58] flex-1 min-w-0" />
              <input data-testid={`lld-attr-type-${idx}`} value={attrType} onChange={e => setAttrType(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddAttr()}
                placeholder="type" className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#484f58] placeholder-[#484f58] flex-1 min-w-0" />
              <button data-testid={`lld-attr-add-${idx}`} onClick={handleAddAttr}
                className="w-7 h-7 rounded flex items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white shrink-0"><Plus size={12} /></button>
            </div>
          </div>

          <div className="px-3 pt-2 pb-3 border-t border-[#2d333b]/50">
            <div className="flex items-center gap-1.5 mb-2">
              <Braces size={11} className="text-[#8b949e]" />
              <span className="text-[10px] font-bold text-[#8b949e] uppercase tracking-wider">Methods</span>
            </div>
            {cls.methods?.map((m: MethodDef, mi: number) => (
              <div key={mi} data-testid={`lld-method-${idx}-${mi}`} className="flex items-center gap-2 mb-1.5 group">
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#2d333b] text-[#8b949e]">{m.access}</span>
                <span className="text-xs text-[#c9d1d9] font-medium">{m.name}</span>
                <span className="text-xs text-[#484f58]">({m.params})</span>
                <span className="text-xs text-[#484f58]">:</span>
                <span className="text-xs text-[#60a5fa]">{m.returnType}</span>
                <button onClick={() => onRemoveMethod(mi)} className="ml-auto opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
              </div>
            ))}
            <div className="flex items-center gap-1.5 mt-2">
              <select data-testid={`lld-method-access-${idx}`} value={methodAccess} onChange={e => setMethodAccess(e.target.value)}
                className="bg-[#0d1117] border border-[#2d333b] rounded px-1.5 py-1.5 text-[11px] text-[#8b949e] outline-none w-20">
                {ACCESS_MODIFIERS.map(m => <option key={m} value={m}>{m}</option>)}
              </select>
              <input data-testid={`lld-method-name-${idx}`} value={methodName} onChange={e => setMethodName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMethod()}
                placeholder="methodName" className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#484f58] placeholder-[#484f58] flex-1 min-w-0" />
              <input data-testid={`lld-method-params-${idx}`} value={methodParams} onChange={e => setMethodParams(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMethod()}
                placeholder="params" className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#484f58] placeholder-[#484f58] flex-1 min-w-0" />
              <input data-testid={`lld-method-return-${idx}`} value={methodReturn} onChange={e => setMethodReturn(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleAddMethod()}
                placeholder="void" className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-[#c9d1d9] outline-none focus:border-[#484f58] placeholder-[#484f58] w-16" />
              <button data-testid={`lld-method-add-${idx}`} onClick={handleAddMethod}
                className="w-7 h-7 rounded flex items-center justify-center bg-[#22c55e] hover:bg-[#16a34a] text-white shrink-0"><Plus size={12} /></button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

const ClassDesignStep = ({ session, onSave }: { session: SessionData; onSave: (data: Record<string, unknown>) => void }) => {
  const saved = (session?.answers?.['class-design'] || {}) as Record<string, unknown>;
  const [activeTab, setActiveTab] = useState('classes');
  const [classes, setClasses] = useState<ClassDef[]>(saved.classes as ClassDef[] || []);
  const [relationships, setRelationships] = useState<MermaidRelation[]>(saved.relationships as MermaidRelation[] || []);
  const [patterns, setPatterns] = useState<PatternDef[]>(saved.patterns as PatternDef[] || []);

  const [classType, setClassType] = useState('class');
  const [className, setClassName] = useState('');
  const [expandedClasses, setExpandedClasses] = useState<Record<number, boolean>>({});

  const [fromClass, setFromClass] = useState('');
  const [relType, setRelType] = useState('association');
  const [toClass, setToClass] = useState('');

  const ALL_DESIGN_PATTERNS = [
    'Singleton', 'Factory', 'Abstract Factory', 'Builder', 'Prototype',
    'Adapter', 'Bridge', 'Composite', 'Decorator', 'Facade',
    'Flyweight', 'Proxy', 'Chain of Responsibility', 'Command', 'Iterator',
    'Mediator', 'Memento', 'Observer', 'State', 'Strategy',
    'Template Method', 'Visitor',
  ];
  const PATTERN_DESCRIPTIONS: Record<string, string> = {
    'Singleton': 'Ensures a class has only one instance',
    'Factory': 'Creates objects without specifying the exact class',
    'Abstract Factory': 'Creates families of related objects',
    'Builder': 'Constructs complex objects step by step',
    'Prototype': 'Creates new objects by copying an existing object',
    'Adapter': 'Allows incompatible interfaces to work together',
    'Bridge': 'Separates abstraction from its implementation',
    'Composite': 'Composes objects into tree structures',
    'Decorator': 'Adds new behaviors to objects dynamically',
    'Facade': 'Provides a simplified interface to a complex subsystem',
    'Flyweight': 'Reduces memory usage by sharing common data',
    'Proxy': 'Provides a surrogate or placeholder for another object',
    'Chain of Responsibility': 'Passes requests along a chain of handlers',
    'Command': 'Encapsulates a request as an object',
    'Iterator': 'Provides sequential access to elements of a collection',
    'Mediator': 'Reduces chaotic dependencies between objects',
    'Memento': 'Captures and restores an object\'s internal state',
    'Observer': 'Notifies multiple objects about state changes',
    'State': 'Alters behavior when internal state changes',
    'Strategy': 'Defines a family of interchangeable algorithms',
    'Template Method': 'Defines the skeleton of an algorithm in a base class',
    'Visitor': 'Separates algorithms from the objects they operate on',
  };

  const doSave = useCallback((c: ClassDef[], r: MermaidRelation[], p: PatternDef[]) => {
    onSave({ classes: c, relationships: r, patterns: p });
  }, [onSave]);

  const addClass = () => {
    if (!className.trim()) return;
    const next = [...classes, { type: classType, name: className.trim(), attributes: [], methods: [] }];
    setClasses(next);
    setExpandedClasses(prev => ({ ...prev, [next.length - 1]: true }));
    setClassName('');
    doSave(next, relationships, patterns);
  };

  const removeClass = (i: number) => {
    const next = classes.filter((_, idx) => idx !== i);
    setClasses(next);
    doSave(next, relationships, patterns);
  };

  const toggleClassExpand = (i: number) => setExpandedClasses(prev => ({ ...prev, [i]: !prev[i] }));

  const addAttribute = (classIdx: number, access: string, name: string, type: string) => {
    if (!name.trim()) return;
    const next = classes.map((c, i) => i === classIdx ? { ...c, attributes: [...(c.attributes || []), { access, name: name.trim(), type: type.trim() || 'String' }] } : c);
    setClasses(next);
    doSave(next, relationships, patterns);
  };

  const removeAttribute = (classIdx: number, attrIdx: number) => {
    const next = classes.map((c, i) => i === classIdx ? { ...c, attributes: (c.attributes || []).filter((_: AttrDef, ai: number) => ai !== attrIdx) } : c);
    setClasses(next);
    doSave(next, relationships, patterns);
  };

  const addMethod = (classIdx: number, access: string, name: string, params: string, returnType: string) => {
    if (!name.trim()) return;
    const next = classes.map((c, i) => i === classIdx ? { ...c, methods: [...(c.methods || []), { access, name: name.trim(), params: params.trim(), returnType: returnType.trim() || 'void' }] } : c);
    setClasses(next);
    doSave(next, relationships, patterns);
  };

  const removeMethod = (classIdx: number, methodIdx: number) => {
    const next = classes.map((c, i) => i === classIdx ? { ...c, methods: (c.methods || []).filter((_: MethodDef, mi: number) => mi !== methodIdx) } : c);
    setClasses(next);
    doSave(next, relationships, patterns);
  };

  const addRelationship = () => {
    if (!fromClass || !toClass) return;
    const next = [...relationships, { from_class: fromClass, relationship: relType, to_class: toClass }];
    setRelationships(next);
    setFromClass('');
    setToClass('');
    doSave(classes, next, patterns);
  };

  const removeRelationship = (i: number) => {
    const next = relationships.filter((_, idx) => idx !== i);
    setRelationships(next);
    doSave(classes, next, patterns);
  };

  const togglePattern = (name: string) => {
    const exists = patterns.some(p => p.name === name);
    if (exists) return;
    const next = [...patterns, { name, reason: '' }];
    setPatterns(next);
    doSave(classes, relationships, next);
  };

  const removePattern = (i: number) => {
    const next = patterns.filter((_, idx) => idx !== i);
    setPatterns(next);
    doSave(classes, relationships, next);
  };

  const updatePatternReason = (i: number, reason: string) => {
    const next = patterns.map((p, idx) => idx === i ? { ...p, reason } : p);
    setPatterns(next);
    doSave(classes, relationships, next);
  };

  const classNames = classes.map(c => c.name);

  const tabs = [
    { id: 'classes', label: 'Classes', count: classes.length, icon: Code2 },
    { id: 'relationships', label: 'Relationships', count: relationships.length, icon: Link2 },
    { id: 'patterns', label: 'Patterns', count: patterns.length, icon: Puzzle },
    { id: 'diagram', label: 'Diagram', count: null, icon: GitBranch },
  ];

  return (
    <div>
      <div className="flex rounded-lg overflow-hidden border border-[#2d333b] mb-4" style={{ backgroundColor: '#161b22' }}>
        {tabs.map(tab => (
          <button key={tab.id} data-testid={`lld-cd-tab-${tab.id}`} onClick={() => setActiveTab(tab.id)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium transition-colors ${
              activeTab === tab.id ? 'bg-[#0d1117] text-white border-b-2 border-white' : 'text-[#8b949e] hover:text-white'
            }`}>
            <tab.icon size={12} /> {tab.label} {tab.count !== null && <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded bg-[#2d333b] text-[#8b949e]">{tab.count}</span>}
          </button>
        ))}
      </div>

      {activeTab === 'classes' && (
        <div className="rounded-xl border border-[#f97316]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#f97316]/20" style={{ backgroundColor: '#f9731608' }}>
            <Plus size={14} className="text-[#f97316]" />
            <h4 className="text-sm font-bold text-white">Add New Class/Interface/Enum</h4>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4">
              <select data-testid="lld-class-type" value={classType} onChange={e => setClassType(e.target.value)}
                className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none w-32">
                {CLASS_TYPES.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
              </select>
              <input data-testid="lld-class-name" value={className} onChange={e => setClassName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && addClass()}
                placeholder="Name (e.g., ParkingLot, IPaymentStrategy)"
                className="flex-1 bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#f97316] placeholder-[#484f58]" />
              <button data-testid="lld-class-add" onClick={addClass} className="px-3 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors"><Plus size={16} /></button>
            </div>
            {classes.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#2d333b] rounded-lg">
                <p className="text-sm text-[#484f58] italic">No classes defined yet.</p>
                <p className="text-xs text-[#484f58] mt-1">Add classes, interfaces, enums, or abstract classes above.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {classes.map((c, i) => (
                  <ClassCard key={i} cls={c} idx={i} expanded={!!expandedClasses[i]}
                    onToggle={() => toggleClassExpand(i)} onRemove={() => removeClass(i)}
                    onAddAttr={(access, name, type) => addAttribute(i, access, name, type)}
                    onRemoveAttr={(ai) => removeAttribute(i, ai)}
                    onAddMethod={(access, name, params, ret) => addMethod(i, access, name, params, ret)}
                    onRemoveMethod={(mi) => removeMethod(i, mi)} />
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'relationships' && (
        <div className="rounded-xl border border-[#06b6d4]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#06b6d4]/20" style={{ backgroundColor: '#06b6d408' }}>
            <Link2 size={14} className="text-[#06b6d4]" />
            <h4 className="text-sm font-bold text-white">Add Relationship</h4>
          </div>
          <div className="p-4">
            <div className="flex gap-2 mb-4 items-center">
              <select data-testid="lld-rel-from" value={fromClass} onChange={e => setFromClass(e.target.value)}
                className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none w-40">
                <option value="">From class...</option>
                {classNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <select data-testid="lld-rel-type" value={relType} onChange={e => setRelType(e.target.value)}
                className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none flex-1">
                {RELATIONSHIP_TYPES.map(r => <option key={r.value} value={r.value}>{r.label}</option>)}
              </select>
              <select data-testid="lld-rel-to" value={toClass} onChange={e => setToClass(e.target.value)}
                className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none w-40">
                <option value="">To class...</option>
                {classNames.map(n => <option key={n} value={n}>{n}</option>)}
              </select>
              <button data-testid="lld-rel-add" onClick={addRelationship} className="px-3 py-2.5 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors shrink-0"><Plus size={16} /></button>
            </div>
            {classNames.length < 2 && (
              <p className="text-xs text-[#484f58] mb-4">Add at least 2 classes to create relationships.</p>
            )}
            {relationships.length === 0 ? (
              <div className="text-center py-8 border border-dashed border-[#2d333b] rounded-lg">
                <p className="text-sm text-[#484f58] italic">No relationships defined yet.</p>
                <p className="text-xs text-[#484f58] mt-1">Inheritance, composition, aggregation, association...</p>
              </div>
            ) : (
              <div className="space-y-3 mt-2">
                {relationships.map((r, i) => {
                  const relLabel = r.relationship === 'implementation' ? 'implements'
                    : r.relationship === 'inheritance' ? 'extends'
                    : r.relationship === 'dependency' ? 'depends on'
                    : `has (${r.relationship})`;
                  return (
                    <div key={i} data-testid={`lld-rel-${i}`}
                      className="group rounded-lg border-l-[3px] border-[#06b6d4] px-5 py-4 flex items-center gap-3"
                      style={{ backgroundColor: '#0c1520', borderTop: '1px solid #06b6d430', borderRight: '1px solid #06b6d430', borderBottom: '1px solid #06b6d430' }}>
                      <span className="text-sm font-bold text-[#22d3ee]">{r.from_class}</span>
                      <span className="text-[#06b6d4]">⇄</span>
                      <span className="text-xs font-medium px-2.5 py-1 rounded-md border border-[#2d333b] text-[#c9d1d9]" style={{ backgroundColor: '#161b22' }}>{relLabel}</span>
                      <span className="text-[#06b6d4]">⇄</span>
                      <span className="text-sm font-bold text-[#22d3ee]">{r.to_class}</span>
                      <button onClick={() => removeRelationship(i)} className="ml-auto opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400 transition-opacity"><Trash2 size={13} /></button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'patterns' && (
        <div className="rounded-xl border border-[#8b5cf6]/40 overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
          <div className="flex items-center gap-2 px-4 py-3 border-b border-[#8b5cf6]/20" style={{ backgroundColor: '#8b5cf608' }}>
            <Plus size={14} className="text-[#8b5cf6]" />
            <h4 className="text-sm font-bold text-white">Add Design Pattern</h4>
          </div>
          <div className="p-4">
            <div className="flex flex-wrap gap-2 mb-5">
              {ALL_DESIGN_PATTERNS.filter(name => !patterns.some(p => p.name === name)).map(name => (
                <button key={name} data-testid={`lld-pattern-chip-${name.toLowerCase().replace(/\s+/g, '-')}`}
                  onClick={() => togglePattern(name)}
                  className="px-3 py-1.5 rounded text-xs font-medium border bg-[#161b22] border-[#2d333b] text-[#8b949e] hover:border-[#8b5cf6] hover:text-white transition-all">
                  + {name}
                </button>
              ))}
              {ALL_DESIGN_PATTERNS.every(name => patterns.some(p => p.name === name)) && (
                <p className="text-xs text-[#484f58] italic">All patterns selected.</p>
              )}
            </div>
            {patterns.length === 0 ? (
              <div className="text-center py-8 border-t border-dashed border-[#2d333b]">
                <p className="text-sm text-[#484f58] italic">No design patterns selected yet.</p>
                <p className="text-xs text-[#484f58] mt-1">Select patterns that apply to your design.</p>
              </div>
            ) : (
              <div className="border-t border-[#2d333b] pt-4 space-y-3">
                {patterns.map((p, i) => (
                  <div key={i} data-testid={`lld-pattern-${i}`} className="rounded-lg border border-[#8b5cf6]/30 overflow-hidden" style={{ backgroundColor: '#161b22' }}>
                    <div className="flex items-center justify-between px-4 py-2.5 border-b border-[#8b5cf6]/15" style={{ backgroundColor: '#8b5cf608' }}>
                      <div className="flex items-center gap-2">
                        <Zap size={13} className="text-[#8b5cf6]" />
                        <span className="text-sm font-semibold text-white">{p.name}</span>
                      </div>
                      <button data-testid={`lld-pattern-delete-${i}`} onClick={() => removePattern(i)}
                        className="text-[#484f58] hover:text-red-400 transition-colors"><Trash2 size={13} /></button>
                    </div>
                    <div className="px-4 py-3">
                      <p className="text-xs text-[#8b949e] mb-3">{PATTERN_DESCRIPTIONS[p.name] || 'A design pattern for this system.'}</p>
                      <label className="text-xs font-medium text-[#8b949e] mb-1.5 block">Why are you using this pattern?</label>
                      <textarea data-testid={`lld-pattern-reason-${i}`}
                        value={p.reason || ''}
                        onChange={e => updatePatternReason(i, e.target.value)}
                        placeholder="Explain how this pattern applies to your design..."
                        rows={2}
                        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#8b5cf6] placeholder-[#484f58] resize-none" />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'diagram' && (
        <MermaidDiagram classes={classes} relationships={relationships} />
      )}
    </div>
  );
};

/* ────────── Step 4: Code Implementation (IDE Layout) ────────── */
const STARTER_TEMPLATES: Record<string, { filename: string; code: string }> = {
  java: { filename: 'Main.java', code: `import java.util.*;\n// Add any additional imports here\n\npublic class Main {\n    public static void main(String[] args) {\n        // Create instances of your classes and test your solution here\n        System.out.println("Hello! Implement your solution and run to test.");\n    }\n}\n` },
  python: { filename: 'main.py', code: `# Implement your solution here\n\nclass Main:\n    pass\n\nif __name__ == "__main__":\n    # Create instances and test your solution\n    print("Hello! Implement your solution and run to test.")\n` },
  javascript: { filename: 'main.js', code: `// Implement your solution here\n\nclass Main {\n  constructor() {\n    // Initialize your solution\n  }\n}\n\n// Create instances and test your solution\nconsole.log("Hello! Implement your solution and run to test.");\n` },
  typescript: { filename: 'main.ts', code: `// Implement your solution here\n\nclass Main {\n  constructor() {\n    // Initialize your solution\n  }\n}\n\n// Create instances and test your solution\nconsole.log("Hello! Implement your solution and run to test.");\n` },
  cpp: { filename: 'main.cpp', code: `#include <iostream>\n#include <vector>\n#include <string>\nusing namespace std;\n\n// Implement your classes here\n\nint main() {\n    // Create instances and test your solution\n    cout << "Hello! Implement your solution and run to test." << endl;\n    return 0;\n}\n` },
  csharp: { filename: 'Main.cs', code: `using System;\nusing System.Collections.Generic;\n\n// Implement your classes here\n\nclass Program {\n    static void Main(string[] args) {\n        // Create instances and test your solution\n        Console.WriteLine("Hello! Implement your solution and run to test.");\n    }\n}\n` },
  go: { filename: 'main.go', code: `package main\n\nimport "fmt"\n\n// Implement your structs and interfaces here\n\nfunc main() {\n    // Create instances and test your solution\n    fmt.Println("Hello! Implement your solution and run to test.")\n}\n` },
  rust: { filename: 'main.rs', code: `// Implement your structs and traits here\n\nfn main() {\n    // Create instances and test your solution\n    println!("Hello! Implement your solution and run to test.");\n}\n` },
};

const LANG_ICONS: Record<string, string> = {
  java: '☕', python: '🐍', javascript: 'JS', typescript: 'TS', cpp: 'C++', csharp: 'C#', go: '🔵', rust: '🦀',
};

const LANG_EXTENSIONS: Record<string, string> = {
  java: '.java', python: '.py', javascript: '.js', typescript: '.ts',
  cpp: '.cpp', csharp: '.cs', go: '.go', rust: '.rs',
};

const ImplementationStep = ({ session, onSave, onEvaluate, evaluating }: { session: SessionData; onSave: (data: Record<string, unknown>) => void; onEvaluate: () => void; evaluating: boolean }) => {
  const saved = (session?.answers?.implementation || {}) as Record<string, unknown>;
  const [language, setLanguage] = useState(saved.language as string || 'java');
  const [files, setFiles] = useState<FileDef[]>(saved.files as FileDef[] || [{ name: STARTER_TEMPLATES['java'].filename, content: STARTER_TEMPLATES['java'].code }]);
  const [folders, setFolders] = useState<string[]>(saved.folders as string[] || []);
  const [activeFileIdx, setActiveFileIdx] = useState(0);
  const [output, setOutput] = useState('');
  const [showOutput, setShowOutput] = useState(true);
  const [running, setRunning] = useState(false);
  const [showNewFileModal, setShowNewFileModal] = useState(false);
  const [showNewFolderModal, setShowNewFolderModal] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [newFolderName, setNewFolderName] = useState('');
  const [showLangConfirm, setShowLangConfirm] = useState<string | null>(null);
  const [saveStatus, setSaveStatus] = useState('saved');
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const ext = LANG_EXTENSIONS[language] || '.java';
  const activeFile = files[activeFileIdx] || files[0];

  const doSave = useCallback((f: FileDef[], lang: string, fldrs?: string[]) => {
    setSaveStatus('unsaved');
    clearTimeout(debounceRef.current!);
    debounceRef.current = setTimeout(() => {
      setSaveStatus('saving');
      const mainCode = f.map(fi => `// === ${fi.name} ===\n${fi.content}`).join('\n\n');
      onSave({ content: mainCode, language: lang, files: f, folders: fldrs || folders });
      setTimeout(() => setSaveStatus('saved'), 500);
    }, 1000);
  }, [onSave, folders]);

  const handleCodeChange = (val: string | undefined) => {
    const updated = files.map((f, i) => i === activeFileIdx ? { ...f, content: val || '' } : f);
    setFiles(updated);
    doSave(updated, language);
  };

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const newLang = e.target.value;
    const hasCustomCode = files.some(f => { const tmpl = STARTER_TEMPLATES[language]; return tmpl && f.content !== tmpl.code; });
    if (hasCustomCode && files.length > 0) {
      setShowLangConfirm(newLang);
    } else {
      applyLangChange(newLang);
    }
  };
  const applyLangChange = (newLang: string) => {
    const tmpl = STARTER_TEMPLATES[newLang] || STARTER_TEMPLATES.java;
    const newFiles = [{ name: tmpl.filename, content: tmpl.code }];
    setLanguage(newLang); setFiles(newFiles); setFolders([]); setActiveFileIdx(0); doSave(newFiles, newLang, []);
    setShowLangConfirm(null);
  };

  const handleCreateFile = () => {
    if (!newFileName.trim()) return;
    let name = newFileName.trim();
    if (!name.includes('.')) name += ext;
    const updated = [...files, { name, content: `// ${name}\n` }];
    setFiles(updated);
    setActiveFileIdx(updated.length - 1);
    setNewFileName('');
    setShowNewFileModal(false);
    doSave(updated, language);
  };

  const handleCreateFolder = () => {
    if (!newFolderName.trim()) return;
    const name = newFolderName.trim();
    if (!folders.includes(name)) {
      const updated = [...folders, name];
      setFolders(updated);
      doSave(files, language, updated);
    }
    setNewFolderName('');
    setShowNewFolderModal(false);
  };

  const removeFile = (idx: number) => {
    if (files.length <= 1) return;
    const updated = files.filter((_, i) => i !== idx);
    setFiles(updated);
    setActiveFileIdx(Math.min(activeFileIdx, updated.length - 1));
    doSave(updated, language);
  };

  const removeFolder = (name: string) => {
    const updatedFolders = folders.filter(f => f !== name);
    const updatedFiles = files.filter(f => !f.name.startsWith(name + '/'));
    setFolders(updatedFolders);
    setFiles(updatedFiles.length ? updatedFiles : [{ name: STARTER_TEMPLATES[language]?.filename || 'main.py', content: '' }]);
    setActiveFileIdx(0);
    doSave(updatedFiles.length ? updatedFiles : [{ name: STARTER_TEMPLATES[language]?.filename || 'main.py', content: '' }], language, updatedFolders);
  };

  const handleRun = async () => {
    setShowOutput(true);
    setRunning(true);
    setOutput(`[${new Date().toLocaleTimeString()}] Compiling and running ${activeFile.name}...`);
    try {
      const res = await api.post<{ stdout: string; stderr: string; exit_code: number }>('/lld/run-code', {
        language,
        files,
        main_file: activeFile.name,
      });
      const { stdout, stderr, exit_code } = res.data;
      let out = '';
      if (stdout) out += stdout;
      if (stderr) out += (out ? '\n' : '') + stderr;
      if (!out) out = exit_code === 0 ? '(no output)' : `Process exited with code ${exit_code}`;
      setOutput(out);
    } catch {
      setOutput('Error: Could not connect to execution server.');
    } finally {
      setRunning(false);
    }
  };

  const rootFiles = files.filter(f => !f.name.includes('/'));
  const folderFiles: Record<string, FileDef[]> = {};
  folders.forEach(fName => { folderFiles[fName] = files.filter(f => f.name.startsWith(fName + '/')); });

  return (
    <div className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
      {showLangConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowLangConfirm(null)}>
          <div className="rounded-xl border border-[#2d333b] p-5 w-96" style={{ backgroundColor: '#0d1117' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-2">Switch Language?</h3>
            <p className="text-sm text-[#8b949e] mb-4">Switching to <span className="text-white font-medium">{LANGUAGES.find(l => l.value === showLangConfirm)?.label}</span> will reset all your code. This cannot be undone.</p>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowLangConfirm(null)} className="px-4 py-2 rounded-lg text-xs font-medium text-[#8b949e] border border-[#2d333b] hover:text-white transition-colors">Cancel</button>
              <button data-testid="lld-lang-confirm" onClick={() => applyLangChange(showLangConfirm)}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-red-500 hover:bg-red-600 text-white transition-colors">Switch &amp; Reset</button>
            </div>
          </div>
        </div>
      )}
      {showNewFileModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewFileModal(false)}>
          <div className="rounded-xl border border-[#2d333b] p-5 w-96" style={{ backgroundColor: '#0d1117' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-1">Create New {LANGUAGES.find(l => l.value === language)?.label} File</h3>
            <p className="text-xs text-[#484f58] mb-4">Creating file in root directory</p>
            <div className="flex items-center gap-0 mb-4">
              <input data-testid="lld-new-file-input" value={newFileName} onChange={e => setNewFileName(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && handleCreateFile()}
                placeholder="FileName" autoFocus
                className="flex-1 bg-[#161b22] border border-[#2d333b] rounded-l-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
              <span className="bg-[#161b22] border border-l-0 border-[#2d333b] rounded-r-lg px-3 py-2.5 text-sm text-[#8b949e]">{ext}</span>
            </div>
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFileModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#8b949e] border border-[#2d333b] hover:text-white transition-colors">Cancel</button>
              <button data-testid="lld-new-file-create" onClick={handleCreateFile}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}

      {showNewFolderModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm" onClick={() => setShowNewFolderModal(false)}>
          <div className="rounded-xl border border-[#2d333b] p-5 w-96" style={{ backgroundColor: '#0d1117' }} onClick={e => e.stopPropagation()}>
            <h3 className="text-base font-bold text-white mb-1">Create New Folder</h3>
            <p className="text-xs text-[#484f58] mb-4">Creating folder in root directory</p>
            <input data-testid="lld-new-folder-input" value={newFolderName} onChange={e => setNewFolderName(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && handleCreateFolder()}
              placeholder="FolderName" autoFocus
              className="w-full bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2.5 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58] mb-4" />
            <div className="flex justify-end gap-2">
              <button onClick={() => setShowNewFolderModal(false)}
                className="px-4 py-2 rounded-lg text-xs font-medium text-[#8b949e] border border-[#2d333b] hover:text-white transition-colors">Cancel</button>
              <button data-testid="lld-new-folder-create" onClick={handleCreateFolder}
                className="px-4 py-2 rounded-lg text-xs font-medium bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">Create</button>
            </div>
          </div>
        </div>
      )}

      <div className="flex" style={{ height: '560px' }}>
        <div className="w-48 border-r border-[#2d333b] flex flex-col shrink-0" style={{ backgroundColor: '#0d1117' }}>
          <div className="flex items-center justify-between px-3 py-2 border-b border-[#2d333b]">
            <div className="flex items-center gap-1.5">
              <FolderOpen size={12} className="text-[#8b949e]" />
              <span className="text-xs font-semibold text-[#c9d1d9]">Files</span>
              <span className="text-[10px] text-[#484f58]">{files.length}</span>
            </div>
            <div className="flex items-center gap-1">
              <button data-testid="lld-add-file" onClick={() => setShowNewFileModal(true)} title="New file" className="text-[#8b949e] hover:text-white"><FilePlus size={12} /></button>
              <button data-testid="lld-add-folder" onClick={() => setShowNewFolderModal(true)} title="New folder" className="text-[#8b949e] hover:text-white"><FolderPlus size={12} /></button>
            </div>
          </div>
          <div className="flex-1 overflow-y-auto py-1">
            <div className="px-2 py-1">
              {rootFiles.map((f) => {
                const globalIdx = files.indexOf(f);
                return (
                  <button key={globalIdx} data-testid={`lld-file-${globalIdx}`} onClick={() => setActiveFileIdx(globalIdx)}
                    className={`w-full flex items-center gap-1.5 pl-3 pr-2 py-1 rounded text-xs group transition-colors ${
                      globalIdx === activeFileIdx ? 'bg-[#161b22] text-[#22c55e]' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-white'
                    }`}>
                    <FileCode size={11} className="shrink-0" />
                    <span className="truncate flex-1 text-left">{f.name}</span>
                    {files.length > 1 && (
                      <button onClick={(e) => { e.stopPropagation(); removeFile(globalIdx); }}
                        className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
                    )}
                  </button>
                );
              })}
              {folders.map(fName => (
                <div key={fName}>
                  <div className="flex items-center gap-1 pl-1.5 pr-2 py-1 text-xs text-[#8b949e] group">
                    <ChevronDown size={10} />
                    <Folder size={11} className="text-[#e2b655]" />
                    <span className="font-medium flex-1">{fName}</span>
                    <button onClick={() => removeFolder(fName)}
                      className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
                  </div>
                  {(folderFiles[fName] || []).map(f => {
                    const globalIdx = files.indexOf(f);
                    const shortName = f.name.replace(fName + '/', '');
                    return (
                      <button key={globalIdx} data-testid={`lld-file-${globalIdx}`} onClick={() => setActiveFileIdx(globalIdx)}
                        className={`w-full flex items-center gap-1.5 pl-7 pr-2 py-1 rounded text-xs group transition-colors ${
                          globalIdx === activeFileIdx ? 'bg-[#161b22] text-[#22c55e]' : 'text-[#8b949e] hover:bg-[#161b22] hover:text-white'
                        }`}>
                        <FileCode size={11} className="shrink-0" />
                        <span className="truncate flex-1 text-left">{shortName}</span>
                        <button onClick={(e) => { e.stopPropagation(); removeFile(globalIdx); }}
                          className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={10} /></button>
                      </button>
                    );
                  })}
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="flex-1 flex flex-col min-w-0">
          <div className="flex items-center border-b border-[#2d333b] shrink-0" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-1.5 px-3 py-1.5 border-r border-[#2d333b]">
              <span className="text-xs">{LANG_ICONS[language] || ''}</span>
              <select data-testid="lld-lang-select" value={language} onChange={handleLangChange}
                className="bg-transparent text-xs text-[#c9d1d9] outline-none cursor-pointer font-medium">
                {LANGUAGES.map(l => <option key={l.value} value={l.value}>{l.label}</option>)}
              </select>
            </div>
            <div className="flex items-center gap-0.5 px-2 flex-1">
              <div className="flex items-center gap-1.5 px-3 py-1.5 text-xs text-[#c9d1d9] border-b-2 border-[#22c55e]">
                <FileCode size={11} />
                <span>{activeFile.name}</span>
              </div>
            </div>
            <div className="flex items-center gap-2 px-3">
              <span data-testid="lld-save-status" className={`flex items-center gap-1 text-[10px] font-medium ${saveStatus === 'saved' ? 'text-[#22c55e]' : saveStatus === 'saving' ? 'text-[#f59e0b]' : 'text-[#8b949e]'}`}>
                {saveStatus === 'saving' && <Loader2 size={9} className="animate-spin" />}
                {saveStatus === 'saved' && <Save size={9} />}
                {saveStatus === 'saved' ? 'Saved' : saveStatus === 'saving' ? 'Saving...' : 'Unsaved'}
              </span>
              <button onClick={() => handleCodeChange(STARTER_TEMPLATES[language]?.code || '')} title="Reset code"
                className="text-[#8b949e] hover:text-white p-1"><RotateCcw size={12} /></button>
            </div>
          </div>

          <div className="flex-1 min-h-0">
            <Editor
              height="100%"
              language={language === 'csharp' ? 'csharp' : language}
              value={activeFile.content}
              onChange={handleCodeChange}
              theme="vs-dark"
              options={{
                minimap: { enabled: false },
                fontSize: 14,
                lineNumbers: 'on',
                scrollBeyondLastLine: false,
                automaticLayout: true,
                tabSize: 4,
                wordWrap: 'on',
                padding: { top: 8 },
              }}
            />
          </div>

          <div className="border-t border-[#2d333b] shrink-0" style={{ backgroundColor: '#0d1117' }}>
            <div className="flex items-center justify-between px-3 py-1.5">
              <button data-testid="lld-output-toggle" onClick={() => setShowOutput(!showOutput)}
                className="flex items-center gap-1.5 text-xs text-[#8b949e] hover:text-white">
                <Terminal size={12} /> Output {showOutput ? '▾' : '▸'}
              </button>
              <div className="flex items-center gap-2">
                <button data-testid="lld-run-btn" onClick={handleRun} disabled={running}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-60 text-white transition-colors">
                  {running ? <Loader2 size={11} className="animate-spin" /> : <Play size={11} />}
                  {running ? 'Running...' : 'Run'}
                </button>
                <button data-testid="lld-evaluate-impl" onClick={onEvaluate} disabled={evaluating}
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded text-xs font-semibold bg-[#8b5cf6] hover:bg-[#7c3aed] disabled:opacity-50 text-white transition-colors">
                  {evaluating ? <Loader2 size={11} className="animate-spin" /> : <Zap size={11} />}
                  Evaluate
                </button>
              </div>
            </div>
            {showOutput && (
              <div className="px-3 pb-2">
                <pre data-testid="lld-output-panel" className="text-[11px] font-mono leading-relaxed whitespace-pre-wrap p-3 rounded border border-[#2d333b] max-h-36 overflow-y-auto"
                  style={{ backgroundColor: '#161b22', color: output.includes('Error') || output.includes('error') ? '#f87171' : '#c9d1d9' }}>
                  {output || 'Click "Run" to execute your code.'}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

/* ────────── Feedback Panel ────────── */
const FeedbackPanel = ({ step }: { step: StepData }) => {
  if (!step.feedback) return null;
  const fb = step.feedback as FeedbackStepData;
  return (
    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      className="mt-4 rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-3 mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center text-sm font-bold ${step.status === 'passed' ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'bg-red-500/15 text-red-400'}`}>{fb.score}/10</div>
        <div>
          <p className="text-sm font-semibold text-white">{step.status === 'passed' ? 'Step Passed' : 'Needs Improvement'}</p>
          <p className="text-[11px] text-[#8b949e]">{step.status === 'passed' ? 'Great work! Proceeding to next step.' : 'Review the feedback and try again.'}</p>
        </div>
      </div>
      {fb.did_well && fb.did_well.length > 0 && (
        <div className="mb-3">
          <p className="text-[10px] font-bold text-[#22c55e] uppercase tracking-wider mb-1.5">What you did well</p>
          {fb.did_well.map((d: string, i: number) => <p key={i} className="text-xs text-[#c9d1d9] mb-1 flex items-start gap-2"><CheckCircle size={10} className="text-[#22c55e] mt-0.5 shrink-0" /> {d}</p>)}
        </div>
      )}
      {fb.improve && fb.improve.length > 0 && (
        <div>
          <p className="text-[10px] font-bold text-[#f59e0b] uppercase tracking-wider mb-1.5">How to improve</p>
          {fb.improve.map((im: string, i: number) => <p key={i} className="text-xs text-[#c9d1d9] mb-1 flex items-start gap-2"><AlertCircle size={10} className="text-[#f59e0b] mt-0.5 shrink-0" /> {im}</p>)}
        </div>
      )}
    </motion.div>
  );
};

/* ────────── Locked Overlay ────────── */
const LockedOverlay = ({ prevTitle }: { prevTitle: string }) => (
  <div className="rounded-xl border border-[#2d333b] p-10 text-center" style={{ backgroundColor: '#161b22' }}>
    <Lock size={28} className="mx-auto text-[#484f58] mb-3" />
    <p className="text-sm text-[#8b949e]">Complete <span className="text-white font-semibold">{prevTitle}</span> to unlock this step</p>
  </div>
);

/* ────────── Final Evaluation Report ────────── */
const CATEGORY_CONFIG: Record<string, { label: string; color: string; bg: string }> = {
  class_design_match: { label: 'Class Design Match', color: '#3b82f6', bg: '#1e3a5f' },
  solid_principles: { label: 'SOLID Principles', color: '#a855f7', bg: '#3b1d6e' },
  code_quality: { label: 'Code Quality', color: '#22c55e', bg: '#14532d' },
  correctness: { label: 'Correctness', color: '#f97316', bg: '#5c2d0e' },
  best_practices: { label: 'Best Practices', color: '#06b6d4', bg: '#164e63' },
  design_patterns: { label: 'Design Patterns', color: '#ef4444', bg: '#5c1e1e' },
};

const FEEDBACK_ICON_COLORS: Record<string, string> = { positive: '#22c55e', issue: '#f97316', suggestion: '#38bdf8' };

const FinalEvalReport = ({ eval: ev, onReEvaluate, reEvalLoading }: { eval: FinalEvalData; onReEvaluate: () => void; reEvalLoading: boolean }) => {
  const score = ev.overall_score ?? 0;
  const scoreColor = score >= 6 ? '#22c55e' : score >= 4 ? '#f59e0b' : '#ef4444';
  const status = ev.status || (score >= 8 ? 'Excellent' : score >= 6 ? 'Good' : score >= 4 ? 'Fair' : 'Needs work');
  const categories = ev.categories || {};

  return (
    <div data-testid="lld-final-eval-result" className="space-y-5">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <AlertCircle size={16} style={{ color: scoreColor }} />
          <span className="text-base font-bold" style={{ color: scoreColor }}>
            {score}/10 - {status}
          </span>
        </div>
        <span className="text-sm text-[#8b949e]">Passing: 6+</span>
      </div>

      {ev.did_well && ev.did_well.length > 0 && (
        <div className="rounded-lg overflow-hidden border border-[#22c55e]/30">
          <div className="px-4 py-2.5 flex items-center gap-2" style={{ backgroundColor: '#16372a' }}>
            <CheckCircle size={14} className="text-[#22c55e]" />
            <span className="text-sm font-semibold text-[#22c55e]">What you did well</span>
          </div>
          <div className="px-4 py-3 space-y-1.5" style={{ backgroundColor: '#0f261c' }}>
            {ev.did_well.map((item: string, i: number) => (
              <p key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                <span className="text-[#8b949e] mt-0.5 shrink-0">*</span> {item}
              </p>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-3 gap-px rounded-lg overflow-hidden border border-[#2d333b]">
        {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
          const cat = categories[key];
          const score = cat?.score ?? '-';
          return (
            <div key={key} data-testid={`lld-eval-card-${key}`} className="px-4 py-3" style={{ backgroundColor: cfg.bg }}>
              <p className="text-xs font-semibold mb-0.5" style={{ color: cfg.color }}>{cfg.label}</p>
              <p className="text-lg font-bold text-white">{score}/10</p>
            </div>
          );
        })}
      </div>

      <div className="rounded-lg border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
        <div className="px-5 py-3 border-b border-[#2d333b]" style={{ backgroundColor: '#161b22' }}>
          <h4 className="text-sm font-semibold text-[#c9d1d9]">Detailed Feedback</h4>
        </div>
        <div className="divide-y divide-[#2d333b]">
          {Object.entries(CATEGORY_CONFIG).map(([key, cfg]) => {
            const cat = categories[key];
            if (!cat) return null;
            const score = cat.score ?? 0;
            const feedbackItems = cat.feedback || [];
            return (
              <div key={key} data-testid={`lld-eval-detail-${key}`} className="px-5 py-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cfg.color }} />
                    <span className="text-sm font-bold" style={{ color: cfg.color }}>{cfg.label}</span>
                  </div>
                  <span className="text-sm font-bold" style={{ color: cfg.color }}>{score}/10</span>
                </div>
                <div className="space-y-2 pl-1">
                  {feedbackItems.map((fb: FeedbackItem, i: number) => {
                    const iconColor = FEEDBACK_ICON_COLORS[fb.type] || '#f97316';
                    return (
                      <div key={i} className="flex items-start gap-2.5">
                        <span className="w-3.5 h-3.5 rounded-full border-2 mt-0.5 shrink-0" style={{ borderColor: iconColor }} />
                        <p className="text-sm text-[#c9d1d9] leading-relaxed">{fb.text}</p>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      <div className="text-center pt-2 pb-8">
        <button data-testid="lld-final-re-evaluate-btn" onClick={onReEvaluate} disabled={reEvalLoading}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-white border border-[#2d333b] hover:border-[#484f58] transition-colors">
          <RefreshCw size={12} /> Re-evaluate
        </button>
      </div>
    </div>
  );
};

/* ────────── Main Practice Component ────────── */
const LLDPractice = () => {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [showExpModal, setShowExpModal] = useState(false);
  const [activeStep, setActiveStep] = useState('requirements');
  const [evaluating, setEvaluating] = useState(false);
  const [sidebarTab, setSidebarTab] = useState('guidelines');
  const [finalEval, setFinalEval] = useState<FinalEvalData | null>(null);
  const [finalEvalLoading, setFinalEvalLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiMessages, setAiMessages] = useState<AiMessage[]>([]);
  const [aiLoading, setAiLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    const createSession = async () => {
      try {
        const res = await api.post<SessionData>('/lld/session/create', { slug }, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setSession(res.data);
        if (res.data.timer_started_at) {
          const started = new Date(res.data.timer_started_at).getTime();
          setElapsed(Math.max(0, Math.floor((Date.now() - started) / 1000)));
        }
        setTimerRunning(true);
        if (!res.data.experience_level) {
          setShowExpModal(true);
        }
        const steps = res.data.steps || [];
        const firstIncomplete = steps.find((s: StepData) => s.status === 'active' || s.status === 'locked');
        if (firstIncomplete) setActiveStep(firstIncomplete.id);
        else if (steps.every((s: StepData) => ['passed', 'skipped', 'failed'].includes(s.status))) setActiveStep('final');
        if (res.data.final_evaluation) setFinalEval(res.data.final_evaluation);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        router.push('/practice/lld');
      } finally {
        setLoading(false);
      }
    };
    createSession();
    return () => ac.abort();
  }, [slug, router]);

  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else { clearInterval(timerRef.current!); }
    return () => clearInterval(timerRef.current!);
  }, [timerRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleExpSelect = async (level: string) => {
    setShowExpModal(false);
    if (session) {
      try {
        await api.post(`/lld/session/${session.session_id}/experience-level`, { level });
        setSession((prev: SessionData | null) => (prev ? { ...prev, experience_level: level } : prev));
      } catch {}
    }
  };

  const handleSave = useCallback(async (stepId: string, data: Record<string, unknown>) => {
    if (!session) return;
    try {
      await api.post(`/lld/session/${session.session_id}/save/${stepId}`, { data });
      setSession((prev: SessionData | null) => (prev ? { ...prev, answers: { ...prev.answers, [stepId]: data } } : prev));
    } catch {}
  }, [session]);

  const handleEvaluate = async (stepId: string) => {
    if (!session) return;
    setEvaluating(true);
    try {
      const res = await api.post<SessionData>(`/lld/session/${session.session_id}/evaluate/${stepId}`, {});
      setSession((prev: SessionData | null) => (prev ? { ...prev, steps: res.data.steps } : prev));
      if (res.data.passed) {
        const steps = res.data.steps || [];
        const idx = steps.findIndex((s: StepData) => s.id === stepId);
        if (idx >= 0 && idx + 1 < steps.length) setActiveStep(steps[idx + 1].id);
        else setActiveStep('final');
      }
    } catch { showError('Evaluation failed. Please try again.'); }
    finally { setEvaluating(false); }
  };

  const handleSkip = async (stepId: string) => {
    if (!session) return;
    try {
      const res = await api.post<SessionData>(`/lld/session/${session.session_id}/skip/${stepId}`, {});
      setSession((prev: SessionData | null) => (prev ? { ...prev, steps: res.data.steps } : prev));
      const stepsList = res.data.steps || [];
      const idx = stepsList.findIndex((s: StepData) => s.id === stepId);
      if (idx >= 0 && idx + 1 < stepsList.length) setActiveStep(stepsList[idx + 1].id);
      else setActiveStep('final');
    } catch {}
  };

  const allStepsDone = session?.steps?.every((s: StepData) => ['passed', 'skipped', 'failed'].includes(s.status));

  const handleFinalEvaluate = async () => {
    if (!session) return;
    setFinalEvalLoading(true);
    try {
      const res = await api.post<{ evaluation: FinalEvalData }>(`/lld/session/${session.session_id}/final-evaluate`, {});
      setFinalEval(res.data.evaluation);
    } catch { showError('Final evaluation failed. Please try again.'); }
    finally { setFinalEvalLoading(false); }
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim() || !session) return;
    const userMsg = aiQuestion.trim();
    setAiMessages((prev: AiMessage[]) => [...prev, { role: 'user', text: userMsg }]);
    setAiQuestion('');
    setAiLoading(true);
    try {
      const res = await api.post<{ answer: string }>(`/lld/session/${session.session_id}/ask-ai`, { question: userMsg, step_id: activeStep });
      setAiMessages((prev: AiMessage[]) => [...prev, { role: 'assistant', text: res.data.answer }]);
    } catch { setAiMessages((prev: AiMessage[]) => [...prev, { role: 'assistant', text: 'AI is temporarily unavailable. Please try again.' }]); }
    finally { setAiLoading(false); }
  };

  const handleReset = async () => {
    if (!(await showConfirm('Reset all progress? This cannot be undone.'))) return;
    setLoading(true);
    try {
      if (session?.session_id) {
        await api.delete(`/lld/session/${session.session_id}`).catch(() => {});
      }
      const res = await api.post<SessionData>('/lld/session/create', { slug });
      setSession(res.data);
      setActiveStep('requirements');
      setElapsed(0);
      setFinalEval(null);
      setAiMessages([]);
      if (!res.data.experience_level) setShowExpModal(true);
    } catch {} finally { setLoading(false); }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const steps = session.steps || [];

  const renderStepContent = (step: StepData) => {
    if (step.status === 'locked') {
      const idx = steps.findIndex((s: StepData) => s.id === step.id);
      return <LockedOverlay prevTitle={idx > 0 ? (steps[idx - 1].title || '') : ''} />;
    }
    switch (step.id) {
      case 'requirements': return <RequirementsStep session={session} onSave={(data) => handleSave('requirements', data)} />;
      case 'entities': return <EntitiesStep session={session} onSave={(data) => handleSave('entities', data)} />;
      case 'class-design': return <ClassDesignStep session={session} onSave={(data) => handleSave('class-design', data)} />;
      case 'implementation': return <ImplementationStep session={session} onSave={(data) => handleSave('implementation', data)} onEvaluate={() => handleEvaluate('implementation')} evaluating={evaluating} />;
      default: return null;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d1117' }}>
      <AnimatePresence>{showExpModal && <ExperienceLevelModal onSelect={handleExpSelect} />}</AnimatePresence>

      <div className="h-12 border-b border-[#2d333b] flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: '#161b22' }}>
        <button data-testid="lld-practice-back" onClick={() => router.push('/practice/lld')} className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-xs transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="h-4 w-px bg-[#2d333b]" />
        <h2 data-testid="lld-practice-title" className="text-sm font-bold text-white">{session.problem_title}</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: DIFF_COLORS[session.difficulty || ''], backgroundColor: `${DIFF_COLORS[session.difficulty || '']}15` }}>{session.difficulty}</span>
        {session.experience_level && (
          <span className="text-[10px] px-2 py-0.5 rounded border border-[#2d333b] text-[#8b949e]">
            {EXPERIENCE_LEVELS.find((l: { key: string; label: string; years: string; color: string }) => l.key === session.experience_level)?.label || session.experience_level}
          </span>
        )}
        <div className="flex-1" />
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <Clock size={12} />
          <span className="font-mono">{formatTime(elapsed)}</span>
          <button onClick={() => setTimerRunning(!timerRunning)} className="text-[#22c55e] hover:text-[#16a34a]">
            {timerRunning ? <span className="text-[10px]">||</span> : <Play size={10} />}
          </button>
        </div>
        <div className="h-4 w-px bg-[#2d333b]" />
        <button data-testid="lld-practice-reset" onClick={handleReset} className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-white transition-colors"><RotateCcw size={12} /> Reset</button>
        <button data-testid="lld-practice-end" onClick={() => router.push('/practice/lld')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">End Interview</button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        <Sidebar session={session} activeStep={activeStep} sidebarTab={sidebarTab} setSidebarTab={setSidebarTab}
          aiQuestion={aiQuestion} setAiQuestion={setAiQuestion} aiMessages={aiMessages} aiLoading={aiLoading} onAskAi={handleAskAi} />

        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            <div className="flex items-center gap-1 mb-8">
              {(session.steps || []).map((s: StepData, i: number) => (
                <React.Fragment key={s.id}>
                  <button onClick={() => s.status !== 'locked' && setActiveStep(s.id)} data-testid={`lld-step-nav-${s.id}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${s.id === activeStep ? 'ring-2 ring-offset-2 ring-offset-[#0d1117]' : ''} ${
                      s.status === 'passed' ? 'bg-[#22c55e] text-white ring-[#22c55e]' :
                      s.status === 'skipped' ? 'bg-[#f59e0b]/20 text-[#f59e0b] ring-[#f59e0b]' :
                      s.status === 'active' || s.status === 'failed' ? 'bg-[#161b22] border-2 border-[#22c55e] text-[#22c55e] ring-[#22c55e]' :
                      'bg-[#161b22] border border-[#2d333b] text-[#484f58] cursor-not-allowed ring-[#2d333b]'
                    }`}>
                    {s.status === 'passed' ? <CheckCircle size={14} /> : s.status === 'locked' ? <Lock size={10} /> : i + 1}
                  </button>
                  <div className="flex-1 h-0.5 rounded" style={{ backgroundColor: s.status === 'passed' ? '#22c55e' : '#2d333b' }} />
                </React.Fragment>
              ))}
              <button onClick={() => allStepsDone && setActiveStep('final')} data-testid="lld-step-nav-final"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${activeStep === 'final' ? 'ring-2 ring-offset-2 ring-offset-[#0d1117]' : ''} ${
                  finalEval ? 'bg-[#a855f7] text-white ring-[#a855f7]' :
                  allStepsDone ? 'bg-[#161b22] border-2 border-[#a855f7] text-[#a855f7] ring-[#a855f7]' :
                  'bg-[#161b22] border border-[#2d333b] text-[#484f58] cursor-not-allowed ring-[#2d333b]'
                }`}>
                <Award size={14} />
              </button>
            </div>

            {(session.steps || []).map((step: StepData, i: number) => {
              if (step.id !== activeStep) return null;
              return (
                <div key={step.id}>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-xs font-bold text-white">{i + 1}</div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    {step.status === 'passed' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">Passed</span>}
                    {step.status === 'skipped' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">Skipped</span>}
                    {step.status === 'failed' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400">Try Again</span>}
                  </div>
                  <p className="text-sm text-[#8b949e] mb-5">{step.description}</p>
                  {renderStepContent(step)}
                  <FeedbackPanel step={step} />
                  {step.status !== 'locked' && (
                    <div className="flex flex-col items-center gap-2 mt-6 mb-8">
                      {step.id === 'requirements' && (() => {
                        const reqs = (session?.answers?.requirements || {}) as Record<string, unknown>;
                        const frCount = ((reqs.functional as string[]) || []).length;
                        const nfrCount = ((reqs.non_functional as string[]) || []).length;
                        const isValid = frCount >= 3 && nfrCount >= 2;
                        return !isValid ? (
                          <p className="text-xs text-[#f59e0b] mb-1">Add at least 3 use cases and 2 constraints to evaluate</p>
                        ) : null;
                      })()}
                      <div className="flex items-center gap-3">
                      <button data-testid={`lld-evaluate-${step.id}`} onClick={() => handleEvaluate(step.id)}
                        disabled={evaluating || (step.id === 'requirements' && (!session?.answers?.requirements || ((session.answers.requirements as Record<string, string[]>).functional || []).length < 3 || ((session.answers.requirements as Record<string, string[]>).non_functional || []).length < 2))}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 disabled:cursor-not-allowed text-white transition-colors">
                        {evaluating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {evaluating ? 'Evaluating...' : `Evaluate ${(step.title || '').split(' - ')[0]}`}
                      </button>
                      {step.status !== 'passed' && (
                        <button data-testid={`lld-skip-${step.id}`} onClick={() => handleSkip(step.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-[#8b949e] hover:text-white border border-[#2d333b] hover:border-[#484f58] transition-colors">
                          Skip <SkipForward size={12} />
                        </button>
                      )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}

            {activeStep === 'final' && (
              <div data-testid="lld-final-eval-view">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#a855f7] flex items-center justify-center"><Award size={14} className="text-white" /></div>
                  <h3 className="text-lg font-bold text-white">Final Evaluation</h3>
                </div>
                <p className="text-sm text-[#8b949e] mb-6">Get a comprehensive AI evaluation of your entire low-level design.</p>
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {(session.steps || []).map((s: StepData) => (
                    <div key={s.id} className="rounded-lg border border-[#2d333b] p-3" style={{ backgroundColor: '#161b22' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#c9d1d9]">{s.title}</span>
                        {s.status === 'passed' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] font-medium">{String(s.score)}/10</span>}
                        {s.status === 'skipped' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-medium">Skipped</span>}
                        {s.status === 'failed' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">{String(s.score)}/10</span>}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                        <div className="h-full rounded-full" style={{ width: `${((s.score as number) || 0) * 10}%`, backgroundColor: s.status === 'passed' ? '#22c55e' : s.status === 'skipped' ? '#f59e0b' : '#ef4444' }} />
                      </div>
                    </div>
                  ))}
                </div>
                {!finalEval ? (
                  <div className="text-center py-8">
                    <button data-testid="lld-final-evaluate-btn" onClick={handleFinalEvaluate} disabled={finalEvalLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 text-white transition-colors">
                      {finalEvalLoading ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                      {finalEvalLoading ? 'Evaluating your design...' : 'Get Final AI Evaluation'}
                    </button>
                  </div>
                ) : (
                  <FinalEvalReport eval={finalEval} onReEvaluate={() => { setFinalEval(null); handleFinalEvaluate(); }} reEvalLoading={finalEvalLoading} />
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default LLDPractice;
