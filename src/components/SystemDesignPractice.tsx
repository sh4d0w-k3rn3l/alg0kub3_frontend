'use client';

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, showConfirm } from '@/lib/toast';
import { motion } from 'framer-motion';
import HighLevelDesignStep from '@/components/HighLevelDesignStep';
import DatabaseDesignStep from '@/components/DatabaseDesignStep';
import EvalHistory from '@/components/EvalHistory';
import {
  ArrowLeft, Play, RotateCcw, CheckCircle, XCircle, Clock, Lock,
  Plus, X, Send, BookOpen, MessageSquare,
  Target, Gauge, Ruler, Route, Shield, Layers, Zap, Table2, Key,
  RefreshCw, Database, BarChart2, ArrowRight, Loader2, SkipForward,
  AlertCircle, Award, TrendingUp, Lightbulb, Star,
} from 'lucide-react';

interface StepData { id: string; status: string; title?: string; description?: string; tips?: Record<string, unknown>[]; score?: number; [key: string]: unknown }
interface SessionData { session_id?: string; steps?: StepData[]; experience_level?: string; answers?: Record<string, unknown>; final_evaluation?: Record<string, unknown>; timer_started_at?: string; examples?: Record<string, unknown>; guidelines?: Record<string, unknown>; passed?: boolean; problem_title?: string; difficulty?: string; [key: string]: unknown }
interface FinalEvalData { overall_score?: number; passed?: boolean; summary?: string; did_well?: string[]; categories?: Record<string, { score?: number; feedback?: Record<string, unknown>[] }>; status?: string; [key: string]: unknown }
interface EvalHistoryEntry { attempt: number; score: number; timestamp: string; schema_snapshot?: Record<string, unknown>; feedback?: Record<string, unknown> }

const STEP_ICONS: Record<string, React.ComponentType<{ size?: number; className?: string }>> = { target: Target, gauge: Gauge, ruler: Ruler, route: Route, shield: Shield, layers: Layers, arrows: ArrowRight, table: Table2, key: Key, zap: Zap, refresh: RefreshCw, database: Database, 'bar-chart': BarChart2 };

const METHOD_COLORS: Record<string, string> = { GET: '#3b82f6', POST: '#a855f7', PUT: '#f59e0b', DELETE: '#ef4444', PATCH: '#22c55e' };

/* ---------- Left Sidebar ---------- */
const Sidebar = ({ session, activeStep, sidebarTab, setSidebarTab, aiQuestion, setAiQuestion, aiAnswer, aiLoading, onAskAi }: { session: SessionData; activeStep: string; sidebarTab: string; setSidebarTab: (tab: string) => void; aiQuestion: string; setAiQuestion: (q: string) => void; aiAnswer: string; aiLoading: boolean; onAskAi: () => void }) => {
  const step = session?.steps?.find((s: StepData) => s.id === activeStep);
  const guidelines = session?.guidelines?.[activeStep] as Record<string, unknown> | undefined;

  return (
    <div className="w-72 shrink-0 border-r border-[#2d333b] flex flex-col h-full overflow-hidden" style={{ backgroundColor: '#0d1117' }}>
      {/* Tabs */}
      <div className="flex border-b border-[#2d333b]">
        <button data-testid="sidebar-guidelines" onClick={() => setSidebarTab('guidelines')}
          className={`flex-1 flex items-center justify-center gap-1.5 py-2.5 text-xs font-medium transition-colors ${sidebarTab === 'guidelines' ? 'text-white bg-[#161b22] border-b-2 border-[#22c55e]' : 'text-[#8b949e]'}`}>
          <BookOpen size={12} /> Guidelines
        </button>
        <button data-testid="sidebar-ask-ai" onClick={() => setSidebarTab('ask-ai')}
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
                <p className="text-xs text-[#c9d1d9] mb-3 leading-relaxed">{guidelines?.goal as string}</p>
                {guidelines.duration && (
                  <div className="flex items-center gap-2 mb-4 text-xs text-[#8b949e]">
                    <Clock size={12} /> Duration: ~{guidelines.duration as string}
                  </div>
                )}
                {(guidelines.tips as Record<string, unknown>[])?.map((tip: Record<string, unknown>, i: number) => {
                  const Icon = STEP_ICONS[tip.icon as string] || Target;
                  return (
                    <div key={i} className="flex gap-2.5 mb-3">
                      <div className="w-6 h-6 rounded-full bg-[#161b22] border border-[#2d333b] flex items-center justify-center shrink-0 mt-0.5">
                        <Icon size={10} className="text-[#8b949e]" />
                      </div>
                      <div>
                        <p className="text-xs font-semibold text-[#c9d1d9]">{tip.title as string}</p>
                        <p className="text-[11px] text-[#8b949e] leading-relaxed mt-0.5">{tip.text as string}</p>
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
            <p className="text-xs text-[#8b949e] mb-3">Ask a clarifying question about the current step. The AI will guide you without giving away the answer.</p>
            {aiAnswer && (
              <div className="rounded-lg border border-[#2d333b] p-3 mb-3 text-xs text-[#c9d1d9] leading-relaxed" style={{ backgroundColor: '#161b22' }}>
                {aiAnswer}
              </div>
            )}
            <div className="flex gap-2 mt-auto">
              <input data-testid="ask-ai-input" value={aiQuestion} onChange={e => setAiQuestion(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && onAskAi()}
                placeholder="Ask a question..."
                className="flex-1 bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2 text-xs text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
              <button data-testid="ask-ai-send" onClick={onAskAi} disabled={aiLoading || !aiQuestion.trim()}
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

/* ---------- Requirements Step ---------- */
const RequirementsStep = ({ session, onSave }: { session: SessionData; onSave: (data: Record<string, unknown>) => void }) => {
  const guidelines = (session?.guidelines?.requirements || {}) as Record<string, unknown>;
  const saved = (session?.answers?.requirements || {}) as Record<string, unknown>;
  const [frs, setFrs] = useState<string[]>(saved.functional as string[] || []);
  const [nfrs, setNfrs] = useState<string[]>(saved.non_functional as string[] || []);
  const [frInput, setFrInput] = useState('');
  const [nfrInput, setNfrInput] = useState('');

  const addFr = () => { if (frInput.trim()) { const next = [...frs, frInput.trim()]; setFrs(next); setFrInput(''); onSave({ functional: next, non_functional: nfrs }); } };
  const addNfr = () => { if (nfrInput.trim()) { const next = [...nfrs, nfrInput.trim()]; setNfrs(next); setNfrInput(''); onSave({ functional: frs, non_functional: next }); } };
  const removeFr = (i: number) => { const next = frs.filter((_, idx) => idx !== i); setFrs(next); onSave({ functional: next, non_functional: nfrs }); };
  const removeNfr = (i: number) => { const next = nfrs.filter((_, idx) => idx !== i); setNfrs(next); onSave({ functional: frs, non_functional: next }); };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
      {/* Functional */}
      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
        <div className="flex items-center gap-2 mb-3">
          <CheckCircle size={14} className="text-[#22c55e]" />
          <h4 className="text-sm font-semibold text-white">Functional Requirements</h4>
        </div>
        <div className="flex gap-2 mb-3">
          <input data-testid="fr-input" value={frInput} onChange={e => setFrInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addFr()}
            placeholder={((guidelines?.fr_placeholder) as string) || "What should the system do?"}
            className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
          <button data-testid="fr-add" onClick={addFr} className="p-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors"><Plus size={14} /></button>
        </div>
        <div className="space-y-1.5">
          {frs.map((fr, i) => (
            <div key={i} data-testid={`fr-item-${i}`} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#0d1117]">
              <CheckCircle size={12} className="text-[#22c55e] shrink-0" />
              <span className="text-sm text-[#c9d1d9] flex-1">{fr}</span>
              <button onClick={() => removeFr(i)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400 transition-opacity"><X size={12} /></button>
            </div>
          ))}
        </div>
        {frs.length === 0 && guidelines?.example_frs ? (
          <p className="text-[11px] text-[#484f58] mt-2 italic">Hint: Think about creating, reading, redirecting URLs...</p>
        ) : null}
      </div>

      {/* Non-Functional */}
      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
        <div className="flex items-center gap-2 mb-3">
          <Gauge size={14} className="text-[#3b82f6]" />
          <h4 className="text-sm font-semibold text-white">Non-Functional Requirements</h4>
        </div>
        <div className="flex gap-2 mb-3">
          <input data-testid="nfr-input" value={nfrInput} onChange={e => setNfrInput(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addNfr()}
            placeholder={((guidelines?.nfr_placeholder) as string) || "Scalability, availability, latency..."}
            className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
          <button data-testid="nfr-add" onClick={addNfr} className="p-2 rounded-lg bg-[#3b82f6] hover:bg-[#2563eb] text-white transition-colors"><Plus size={14} /></button>
        </div>
        <div className="space-y-1.5">
          {nfrs.map((nfr, i) => (
            <div key={i} data-testid={`nfr-item-${i}`} className="flex items-center gap-2 group px-2 py-1.5 rounded-lg hover:bg-[#0d1117]">
              <div className="w-3 h-3 rounded-full border-2 border-[#3b82f6] shrink-0" />
              <span className="text-sm text-[#c9d1d9] flex-1">{nfr}</span>
              <button onClick={() => removeNfr(i)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400 transition-opacity"><X size={12} /></button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- API Design Step ---------- */
const ApiDesignStep = ({ session, onSave }: { session: SessionData; onSave: (data: Record<string, unknown>) => void }) => {
  const guidelines = (session?.guidelines?.['api-design'] || {}) as Record<string, unknown>;
  const saved = (session?.answers?.['api-design'] || {}) as Record<string, unknown>;
  const [endpoints, setEndpoints] = useState<Record<string, unknown>[]>(saved.endpoints as Record<string, unknown>[] || []);
  const [method, setMethod] = useState('GET');
  const [path, setPath] = useState('');
  const [desc, setDesc] = useState('');

  const addEndpoint = () => {
    if (!path.trim()) return;
    const next = [...endpoints, { method, path: path.trim(), description: desc.trim() }];
    setEndpoints(next);
    setPath(''); setDesc('');
    onSave({ endpoints: next });
  };

  const removeEndpoint = (i: number) => {
    const next = endpoints.filter((_, idx) => idx !== i);
    setEndpoints(next);
    onSave({ endpoints: next });
  };

  return (
    <div>
      <div className="rounded-xl border border-[#2d333b] p-4 mb-4" style={{ backgroundColor: '#161b22' }}>
        <div className="flex items-center gap-2 mb-3">
          <span className="text-sm text-[#8b949e]">&lt;/&gt;</span>
          <h4 className="text-sm font-semibold text-white">API Endpoints</h4>
        </div>

        {/* Add endpoint row */}
        <div className="flex flex-wrap gap-2 mb-4">
          <select data-testid="api-method" value={method} onChange={e => setMethod(e.target.value)}
            className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-xs font-bold outline-none cursor-pointer"
            style={{ color: METHOD_COLORS[method] || '#8b949e' }}>
            {['GET', 'POST', 'PUT', 'DELETE', 'PATCH'].map(m => (
              <option key={m} value={m} style={{ color: METHOD_COLORS[m] }}>{m}</option>
            ))}
          </select>
          <input data-testid="api-path" value={path} onChange={e => setPath(e.target.value)}
            placeholder="/api/v1/resource"
            className="flex-1 min-w-[160px] bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58] font-mono" />
          <input data-testid="api-desc" value={desc} onChange={e => setDesc(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && addEndpoint()}
            placeholder="Description (optional)"
            className="flex-1 min-w-[140px] bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]" />
          <button data-testid="api-add" onClick={addEndpoint} className="px-3 py-2 rounded-lg bg-[#22c55e] hover:bg-[#16a34a] text-white text-xs font-medium transition-colors flex items-center gap-1"><Plus size={12} /> Add</button>
        </div>

        {/* User endpoints */}
        <div className="space-y-1.5 mb-4">
          {endpoints.map((ep, i) => (
            <div key={i} data-testid={`endpoint-${i}`} className="flex items-center gap-2 group px-3 py-2 rounded-lg border border-[#2d333b]" style={{ backgroundColor: '#0d1117' }}>
              <span className="text-xs font-bold shrink-0 w-14" style={{ color: METHOD_COLORS[ep.method as string] }}>{ep.method as string}</span>
              <code className="text-sm text-[#c9d1d9] font-mono flex-1">{ep.path as string}</code>
              {ep.description ? <span className="text-xs text-[#484f58]">{ep.description as string}</span> : null}
              <button onClick={() => removeEndpoint(i)} className="opacity-0 group-hover:opacity-100 text-[#484f58] hover:text-red-400"><X size={12} /></button>
            </div>
          ))}
        </div>

        {/* Example endpoints */}
        {endpoints.length === 0 && guidelines?.example_endpoints ? (
          <div className="mt-3">
            <p className="text-xs text-[#484f58] mb-2 italic">Example endpoints:</p>
            {(guidelines.example_endpoints as Record<string, unknown>[]).map((ep: Record<string, unknown>, i: number) => (
              <div key={i} className="flex items-center gap-2 text-xs mb-1">
                <span className="font-bold" style={{ color: METHOD_COLORS[ep.method as string] }}>{ep.method as string}</span>
                <code className="text-[#8b949e] font-mono">{ep.path as string}</code>
                <span className="text-[#484f58]">&rarr; {ep.description as string}</span>
              </div>
            ))}
          </div>
        ) : null}
      </div>
      <p className="text-xs text-[#484f58] text-center">Add at least 3 API endpoints</p>
    </div>
  );
};

/* ---------- Generic Text Step ---------- */
const TextStep = ({ stepId, session, onSave, placeholder }: { stepId: string; session: SessionData; onSave: (data: Record<string, unknown>) => void; placeholder?: string }) => {
  const saved = (session?.answers?.[stepId] || {}) as Record<string, unknown>;
  const [content, setContent] = useState(saved.content as string || '');
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const handleChange = (val: string) => {
    setContent(val);
    if (timerRef.current) clearTimeout(timerRef.current);
    timerRef.current = setTimeout(() => onSave({ content: val }), 1000);
  };

  return (
    <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
      <textarea data-testid={`step-${stepId}-textarea`} value={content} onChange={e => handleChange(e.target.value)}
        placeholder={placeholder || "Describe your design here..."}
        rows={12}
        className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-3 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58] resize-y leading-relaxed font-mono" />
    </div>
  );
};

/* ---------- Feedback Panel ---------- */
const SEVERITY_STYLES: Record<string, Record<string, string>> = {
  good: { color: '#22c55e', bg: 'rgba(34,197,94,0.06)', border: 'rgba(34,197,94,0.2)', label: 'Good' },
  warning: { color: '#f59e0b', bg: 'rgba(245,158,11,0.06)', border: 'rgba(245,158,11,0.2)', label: 'Warning' },
  critical: { color: '#ef4444', bg: 'rgba(239,68,68,0.06)', border: 'rgba(239,68,68,0.2)', label: 'Critical' },
};

const FeedbackPanel = ({ step }: { step: StepData }) => {
  if (!step?.feedback) return null;
  const feedback = step.feedback as Record<string, unknown> || {};
  const score = step.score as number || 0;
  const passed = step.status === 'passed';
  const hasCategories = (feedback.categories as Record<string, unknown>[]) && (feedback.categories as Record<string, unknown>[]).length > 0;

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="mt-4">
      <div className="flex items-center gap-3 mb-3">
        {passed ? <CheckCircle size={16} className="text-[#22c55e]" /> : <AlertCircle size={16} className="text-[#f59e0b]" />}
        <span className="text-sm font-semibold text-white">{score || feedback.score as number}/10 - {((score || feedback.score) as number) >= 7 ? 'Great job!' : ((score || feedback.score) as number) >= 5 ? 'Good effort!' : 'Needs improvement'}</span>
      </div>

      {/* Overall summary for database evaluations */}
      {(feedback as Record<string, unknown>).overall_summary ? (
        <p className="text-xs text-[#8b949e] leading-relaxed mb-4 px-1">{(feedback as Record<string, unknown>).overall_summary as string}</p>
      ) : null}

      {/* Category cards for database evaluations */}
      {hasCategories && (
        <div className="space-y-2 mb-4" data-testid="db-feedback-categories">
          {(feedback.categories as Record<string, unknown>[]).map((cat: Record<string, unknown>, ci: number) => {
            const sev = SEVERITY_STYLES[cat.severity as string] || SEVERITY_STYLES.warning;
            return (
              <div key={ci} data-testid={`db-feedback-cat-${ci}`}
                className="rounded-lg border p-3"
                style={{ backgroundColor: sev.bg, borderColor: sev.border }}>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-xs font-bold" style={{ color: sev.color }}>{cat.name as string}</span>
                  <span className="text-[9px] font-medium px-1.5 py-0.5 rounded" style={{ color: sev.color, backgroundColor: `${sev.color}15` }}>
                    {sev.label}
                  </span>
                </div>
                <ul className="space-y-1">
                  {((cat.findings as string[]) || []).map((f: string, fi: number) => (
                    <li key={fi} className="flex gap-2 text-xs text-[#c9d1d9] leading-relaxed">
                      {cat.severity === 'good' ? <CheckCircle size={10} className="shrink-0 mt-0.5" style={{ color: sev.color }} /> :
                       cat.severity === 'critical' ? <XCircle size={10} className="shrink-0 mt-0.5" style={{ color: sev.color }} /> :
                       <AlertCircle size={10} className="shrink-0 mt-0.5" style={{ color: sev.color }} />}
                      {f}
                    </li>
                  ))}
                </ul>
              </div>
            );
          })}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-3">
        {(feedback.did_well as string[])?.length > 0 && (
          <div className="rounded-xl border border-[#22c55e]/20 p-4" style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}>
            <h5 className="text-xs font-bold text-[#22c55e] mb-2">What you did well</h5>
            <ul className="space-y-1.5">
              {(feedback.did_well as string[]).map((p: string, i: number) => (
                <li key={i} className="flex gap-2 text-xs text-[#c9d1d9] leading-relaxed">
                  <CheckCircle size={10} className="text-[#22c55e] shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
        {(feedback.improve as string[])?.length > 0 && (
          <div className="rounded-xl border border-[#f59e0b]/20 p-4" style={{ backgroundColor: 'rgba(245,158,11,0.04)' }}>
            <h5 className="text-xs font-bold text-[#f59e0b] mb-2">What you can improve</h5>
            <ul className="space-y-1.5">
              {(feedback.improve as string[]).map((p: string, i: number) => (
                <li key={i} className="flex gap-2 text-xs text-[#c9d1d9] leading-relaxed">
                  <AlertCircle size={10} className="text-[#f59e0b] shrink-0 mt-0.5" />
                  {p}
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </motion.div>
  );
};

/* ---------- Locked Step Overlay ---------- */
const LockedOverlay = ({ prevTitle }: { prevTitle: string }) => (
  <div className="flex flex-col items-center justify-center py-12">
    <Lock size={20} className="text-[#484f58] mb-3" />
    <p className="text-sm text-[#484f58]">Pass {prevTitle} to unlock</p>
  </div>
);

/* ---------- Main Page ---------- */
const SystemDesignPractice = () => {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const router = useRouter();
  const [session, setSession] = useState<SessionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeStep, setActiveStep] = useState('requirements');
  const [sidebarTab, setSidebarTab] = useState('guidelines');
  const [evaluating, setEvaluating] = useState(false);
  const [finalEval, setFinalEval] = useState<FinalEvalData | null>(null);
  const [finalEvalLoading, setFinalEvalLoading] = useState(false);
  const [aiQuestion, setAiQuestion] = useState('');
  const [aiAnswer, setAiAnswer] = useState('');
  const [aiLoading, setAiLoading] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const [timerRunning, setTimerRunning] = useState(false);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Create or load session
  useEffect(() => {
    const ac = new AbortController();
    const createSession = async () => {
      try {
        const res = await api.post<SessionData>(`/system-design/session/create`, { slug }, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setSession(res.data);
        // Restore active step from session progress
        const steps = res.data.steps || [];
        const firstIncomplete = steps.find((s: StepData) => s.status === 'active' || s.status === 'locked');
        if (firstIncomplete) {
          setActiveStep(firstIncomplete.id);
        } else if (steps.every((s: StepData) => ['passed', 'skipped', 'failed'].includes(s.status))) {
          setActiveStep('final');
        }
        // Restore final evaluation if already done
        if (res.data.final_evaluation) {
          setFinalEval(res.data.final_evaluation);
        }
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        router.push('/system-design');
      } finally {
        setLoading(false);
      }
    };
    createSession();
    return () => ac.abort();
  }, [slug, router]);

  // Timer
  useEffect(() => {
    if (timerRunning) {
      timerRef.current = setInterval(() => setElapsed(e => e + 1), 1000);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => { if (timerRef.current) clearInterval(timerRef.current); };
  }, [timerRunning]);

  const formatTime = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

  const handleSave = useCallback(async (stepId: string, data: Record<string, unknown>) => {
    if (!session) return;
    try {
      await api.post(`/system-design/session/${session.session_id}/save/${stepId}`, { data });
      setSession(prev => (prev ? { ...prev, answers: { ...prev.answers, [stepId]: data } } : prev));
    } catch {}
  }, [session]);

  const handleEvaluate = async (stepId: string) => {
    if (!session) return;
    setEvaluating(true);
    try {
      const res = await api.post<SessionData>(`/system-design/session/${session.session_id}/evaluate/${stepId}`, {});
      setSession(prev => (prev ? { ...prev, steps: res.data.steps } : prev));
      // Auto-advance to next step if passed (only on first evaluation)
      if (res.data.passed) {
        const stepsArr = res.data.steps || [];
        const idx = stepsArr.findIndex((s: StepData) => s.id === stepId);
        const evalHist = (stepsArr[idx]?.eval_history as unknown[]) || [];
        if (evalHist.length <= 1) {
          if (idx >= 0 && idx + 1 < stepsArr.length) {
            setActiveStep(stepsArr[idx + 1].id);
          } else {
            // Last step passed — go to final evaluation
            setActiveStep('final');
          }
        }
      }
    } catch {
      showError('Evaluation failed. Please try again.');
    } finally {
      setEvaluating(false);
    }
  };

  const handleSkip = async (stepId: string) => {
    if (!session) return;
    try {
      const res = await api.post<SessionData>(`/system-design/session/${session.session_id}/skip/${stepId}`, {});
      setSession(prev => (prev ? { ...prev, steps: res.data.steps } : prev));
      // Auto-advance to next step or final view
      const stepsArr = res.data.steps || [];
      const idx = stepsArr.findIndex((s: StepData) => s.id === stepId);
      if (idx >= 0 && idx + 1 < stepsArr.length) {
        setActiveStep(stepsArr[idx + 1].id);
      } else {
        // Last step — go to final evaluation
        setActiveStep('final');
      }
    } catch {}
  };

  const allStepsDone = session?.steps?.every((s: StepData) => ['passed', 'skipped', 'failed'].includes(s.status));

  const handleFinalEvaluate = async () => {
    if (!session) return;
    setFinalEvalLoading(true);
    try {
      const res = await api.post<{ evaluation: FinalEvalData }>(`/system-design/session/${session.session_id}/final-evaluate`, {});
      setFinalEval(res.data.evaluation);
    } catch {
      showError('Final evaluation failed. Please try again.');
    } finally {
      setFinalEvalLoading(false);
    }
  };

  const handleAskAi = async () => {
    if (!aiQuestion.trim() || !session) return;
    setAiLoading(true);
    try {
      const res = await api.post<{ answer: string }>(`/system-design/session/${session.session_id}/ask-ai`, { question: aiQuestion, step_id: activeStep });
      setAiAnswer(res.data.answer);
      setAiQuestion('');
    } catch {
      setAiAnswer('AI is temporarily unavailable. Please try again.');
    } finally {
      setAiLoading(false);
    }
  };

  const handleReset = async () => {
    if (!(await showConfirm('Reset all progress? This cannot be undone.'))) return;
    setLoading(true);
    try {
      const res = await api.post<SessionData>(`/system-design/session/create`, { slug });
      setSession(res.data);
      setActiveStep('requirements');
      setElapsed(0);
    } catch {} finally {
      setLoading(false);
    }
  };

  if (loading || !session) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const steps = session.steps || [];
  const DIFF_COLORS: Record<string, string> = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };

  const renderStepContent = (step: StepData) => {
    if (step.status === 'locked') {
      const idx = steps.findIndex((s: StepData) => s.id === step.id);
      const prevTitle = idx > 0 ? (steps[idx - 1].title || '') : '';
      return <LockedOverlay prevTitle={prevTitle} />;
    }

    switch (step.id) {
      case 'requirements':
        return <RequirementsStep session={session} onSave={(data: Record<string, unknown>) => handleSave('requirements', data)} />;
        case 'api-design':
        return <ApiDesignStep session={session} onSave={(data: Record<string, unknown>) => handleSave('api-design', data)} />;
        case 'high-level':
        return <HighLevelDesignStep session={session} onSave={(data: Record<string, unknown>) => handleSave('high-level', data)} />;
        case 'database':
        return <DatabaseDesignStep session={session} onSave={(data: Record<string, unknown>) => handleSave('database', data)} />;
      default:
        return <TextStep stepId={step.id} session={session} onSave={(data: Record<string, unknown>) => handleSave(step.id, data)} placeholder={`Describe your ${(step.title || '').toLowerCase()} here. Include components, data flow, and design decisions...`} />;
    }
  };

  return (
    <div className="min-h-screen flex flex-col" style={{ backgroundColor: '#0d1117' }}>
      {/* Top Bar */}
      <div className="h-12 border-b border-[#2d333b] flex items-center px-4 gap-3 shrink-0" style={{ backgroundColor: '#161b22' }}>
        <button data-testid="practice-back" onClick={() => router.push('/system-design')} className="flex items-center gap-1.5 text-[#8b949e] hover:text-white text-xs transition-colors">
          <ArrowLeft size={14} /> Back
        </button>
        <div className="h-4 w-px bg-[#2d333b]" />
        <h2 data-testid="practice-title" className="text-sm font-bold text-white">{session.problem_title}</h2>
        <span className="text-xs font-medium px-2 py-0.5 rounded" style={{ color: DIFF_COLORS[session.difficulty || ''], backgroundColor: `${DIFF_COLORS[session.difficulty || '']}15` }}>
          {session.difficulty}
        </span>

        <div className="flex-1" />

        {/* Timer */}
        <div className="flex items-center gap-2 text-xs text-[#8b949e]">
          <Clock size={12} />
          <span className="font-mono">{formatTime(elapsed)}</span>
          <button onClick={() => setTimerRunning(!timerRunning)} className="text-[#22c55e] hover:text-[#16a34a]">
            {timerRunning ? <span className="text-[10px]">||</span> : <Play size={10} />}
          </button>
        </div>

        <div className="h-4 w-px bg-[#2d333b]" />

        <button data-testid="practice-reset" onClick={handleReset} className="flex items-center gap-1 text-xs text-[#8b949e] hover:text-white transition-colors">
          <RotateCcw size={12} /> Reset
        </button>

        <button data-testid="practice-end" onClick={() => router.push('/system-design')}
          className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors">
          End Interview
        </button>
      </div>

      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar session={session} activeStep={activeStep} sidebarTab={sidebarTab} setSidebarTab={setSidebarTab}
          aiQuestion={aiQuestion} setAiQuestion={setAiQuestion} aiAnswer={aiAnswer} aiLoading={aiLoading} onAskAi={handleAskAi} />

        {/* Main Content */}
        <div className="flex-1 overflow-y-auto">
          <div className="max-w-4xl mx-auto px-6 py-6">
            {/* Progress bar */}
            <div className="flex items-center gap-1 mb-8">
              {steps.map((s: StepData, i: number) => (
                <React.Fragment key={s.id}>
                  <button onClick={() => s.status !== 'locked' && setActiveStep(s.id)}
                    data-testid={`step-nav-${s.id}`}
                    className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                      s.id === activeStep ? 'ring-2 ring-offset-2 ring-offset-[#0d1117]' : ''
                    } ${
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
              <button onClick={() => allStepsDone && setActiveStep('final')}
                data-testid="step-nav-final"
                className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                  activeStep === 'final' ? 'ring-2 ring-offset-2 ring-offset-[#0d1117]' : ''
                } ${
                  finalEval ? 'bg-[#a855f7] text-white ring-[#a855f7]' :
                  allStepsDone ? 'bg-[#161b22] border-2 border-[#a855f7] text-[#a855f7] ring-[#a855f7]' :
                  'bg-[#161b22] border border-[#2d333b] text-[#484f58] cursor-not-allowed ring-[#2d333b]'
                }`}>
                <Award size={14} />
              </button>
            </div>

            {/* Steps Content */}
            {steps.map((step: StepData, i: number) => {
              if (step.id !== activeStep) return null;
              return (
                <div key={step.id}>
                  {/* Step Header */}
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-7 h-7 rounded-full bg-[#22c55e] flex items-center justify-center text-xs font-bold text-white">{i + 1}</div>
                    <h3 className="text-lg font-bold text-white">{step.title}</h3>
                    {step.status === 'passed' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e]">Passed</span>}
                    {step.status === 'skipped' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b]">Skipped</span>}
                    {step.status === 'failed' && <span className="text-xs font-medium px-2 py-0.5 rounded bg-red-500/10 text-red-400">Try Again</span>}
                    {step.status === 'locked' && <Lock size={14} className="text-[#484f58]" />}
                  </div>
                  <p className="text-sm text-[#8b949e] mb-5">{step.description}</p>

                  {/* Step Content */}
                  {renderStepContent(step)}

                  {/* Feedback */}
                  <FeedbackPanel step={step} />
                  <EvalHistory history={step.eval_history as EvalHistoryEntry[]} />

                  {/* Action Buttons */}
                  {step.status !== 'locked' && (
                    <div className="flex items-center justify-center gap-3 mt-6 mb-8">
                      <button data-testid={`evaluate-${step.id}`} onClick={() => handleEvaluate(step.id)} disabled={evaluating}
                        className="flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-medium bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-50 text-white transition-colors">
                        {evaluating ? <Loader2 size={14} className="animate-spin" /> : <CheckCircle size={14} />}
                        {evaluating ? 'Evaluating...' : `Evaluate ${(step.title || '').split(' - ')[0]}`}
                      </button>
                      {step.status !== 'passed' && (
                        <button data-testid={`skip-${step.id}`} onClick={() => handleSkip(step.id)}
                          className="flex items-center gap-1.5 px-4 py-2.5 rounded-lg text-sm text-[#8b949e] hover:text-white border border-[#2d333b] hover:border-[#484f58] transition-colors">
                          Skip <SkipForward size={12} />
                        </button>
                      )}
                    </div>
                  )}
                </div>
              );
            })}

            {/* Final Evaluation View */}
            {activeStep === 'final' && (
              <div data-testid="final-eval-view">
                <div className="flex items-center gap-3 mb-2">
                  <div className="w-7 h-7 rounded-full bg-[#a855f7] flex items-center justify-center">
                    <Award size={14} className="text-white" />
                  </div>
                  <h3 className="text-lg font-bold text-white">Final Evaluation</h3>
                </div>
                <p className="text-sm text-[#8b949e] mb-6">Get a comprehensive AI evaluation of your entire system design across all steps.</p>

                {/* Step Summary Cards */}
                <div className="grid grid-cols-2 gap-3 mb-6">
                  {steps.map((s: StepData) => (
                    <div key={s.id} className="rounded-lg border border-[#2d333b] p-3" style={{ backgroundColor: '#161b22' }}>
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-xs font-semibold text-[#c9d1d9]">{s.title}</span>
                        {s.status === 'passed' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#22c55e]/10 text-[#22c55e] font-medium">{s.score}/10</span>}
                        {s.status === 'skipped' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-[#f59e0b]/10 text-[#f59e0b] font-medium">Skipped</span>}
                        {s.status === 'failed' && <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500/10 text-red-400 font-medium">{s.score}/10</span>}
                      </div>
                      <div className="w-full h-1.5 rounded-full bg-[#21262d] overflow-hidden">
                        <div className="h-full rounded-full transition-all" style={{
                          width: `${(s.score || 0) * 10}%`,
                          backgroundColor: s.status === 'passed' ? '#22c55e' : s.status === 'skipped' ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                    </div>
                  ))}
                </div>

                {!finalEval ? (
                  <div className="text-center py-8">
                    <button data-testid="final-evaluate-btn" onClick={handleFinalEvaluate} disabled={finalEvalLoading}
                      className="inline-flex items-center gap-2 px-6 py-3 rounded-xl text-sm font-semibold bg-[#a855f7] hover:bg-[#9333ea] disabled:opacity-50 text-white transition-colors">
                      {finalEvalLoading ? <Loader2 size={16} className="animate-spin" /> : <Award size={16} />}
                      {finalEvalLoading ? 'Evaluating your complete design...' : 'Get Final AI Evaluation'}
                    </button>
                    <p className="text-xs text-[#484f58] mt-3">The AI will review your requirements, API design, architecture, and database schema holistically.</p>
                  </div>
                ) : (
                  <div data-testid="final-eval-result" className="space-y-5">
                    {/* Grade & Score */}
                    <div className="flex items-center gap-5 rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
                      <div className="w-20 h-20 rounded-2xl flex flex-col items-center justify-center"
                        style={{ backgroundColor: (finalEval.overall_score as number) >= 7 ? '#22c55e15' : (finalEval.overall_score as number) >= 5 ? '#f59e0b15' : '#ef444415',
                          border: `2px solid ${(finalEval.overall_score as number) >= 7 ? '#22c55e' : (finalEval.overall_score as number) >= 5 ? '#f59e0b' : '#ef4444'}` }}>
                        <span className="text-2xl font-black" style={{ color: (finalEval.overall_score as number) >= 7 ? '#22c55e' : (finalEval.overall_score as number) >= 5 ? '#f59e0b' : '#ef4444' }}>
                          {finalEval.grade as string}
                        </span>
                        <span className="text-[10px] font-medium text-[#8b949e]">{finalEval.overall_score as number}/10</span>
                      </div>
                      <div className="flex-1">
                        <h4 className="text-sm font-bold text-white mb-1">Overall Assessment</h4>
                        <p className="text-sm text-[#8b949e] leading-relaxed">{finalEval.summary}</p>
                      </div>
                    </div>

                    {/* Section Grades */}
                    {finalEval.section_grades ? (
                      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
                        <h4 className="text-xs font-bold text-[#8b949e] uppercase tracking-wider mb-3">Section Breakdown</h4>
                        <div className="space-y-2.5">
                          {Object.entries(finalEval.section_grades as Record<string, unknown>).map(([key, val]) => {
                            const v = val as Record<string, unknown>;
                            return (
                              <div key={key} className="flex items-center gap-3">
                                <span className="text-xs text-[#c9d1d9] w-36 capitalize">{key.replace(/_/g, ' ')}</span>
                                <div className="flex-1 h-2 rounded-full bg-[#21262d] overflow-hidden">
                                  <div className="h-full rounded-full" style={{
                                    width: `${((v.score as number) || 0) * 10}%`,
                                    backgroundColor: (v.score as number) >= 7 ? '#22c55e' : (v.score as number) >= 5 ? '#f59e0b' : '#ef4444',
                                  }} />
                                </div>
                                <span className="text-xs font-bold w-8 text-right" style={{ color: (v.score as number) >= 7 ? '#22c55e' : (v.score as number) >= 5 ? '#f59e0b' : '#ef4444' }}>
                                  {v.score as number}
                                </span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    ) : null}

                    {/* Strengths & Weaknesses */}
                    <div className="grid grid-cols-2 gap-4">
                      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <TrendingUp size={14} className="text-[#22c55e]" />
                          <h4 className="text-xs font-bold text-[#22c55e] uppercase tracking-wider">Strengths</h4>
                        </div>
                        <ul className="space-y-2">
                          {(finalEval.strengths as string[] || []).map((s: string, i: number) => (
                            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                              <Star size={10} className="text-[#22c55e] mt-1 shrink-0" />
                              {s}
                            </li>
                          ))}
                        </ul>
                      </div>
                      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <AlertCircle size={14} className="text-[#f59e0b]" />
                          <h4 className="text-xs font-bold text-[#f59e0b] uppercase tracking-wider">Areas to Improve</h4>
                        </div>
                        <ul className="space-y-2">
                          {(finalEval.weaknesses as string[] || []).map((w: string, i: number) => (
                            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                              <AlertCircle size={10} className="text-[#f59e0b] mt-1 shrink-0" />
                              {w}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>

                    {/* Missing Pieces */}
                    {(finalEval.missing_pieces as string[])?.length > 0 && (
                      <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Lightbulb size={14} className="text-[#3b82f6]" />
                          <h4 className="text-xs font-bold text-[#3b82f6] uppercase tracking-wider">Missing Pieces</h4>
                        </div>
                        <ul className="space-y-2">
                          {(finalEval.missing_pieces as string[]).map((m: string, i: number) => (
                            <li key={i} className="text-sm text-[#c9d1d9] flex items-start gap-2">
                              <Lightbulb size={10} className="text-[#3b82f6] mt-1 shrink-0" />
                              {m}
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Interview Tips */}
                    {(finalEval.interview_tips as string[])?.length > 0 && (
                      <div className="rounded-xl border border-[#a855f7]/30 p-4" style={{ backgroundColor: '#a855f710' }}>
                        <div className="flex items-center gap-2 mb-3">
                          <Award size={14} className="text-[#a855f7]" />
                          <h4 className="text-xs font-bold text-[#a855f7] uppercase tracking-wider">Interview Tips</h4>
                        </div>
                        <ul className="space-y-2">
                          {(finalEval.interview_tips as string[]).map((t: string, i: number) => (
                            <li key={i} className="text-sm text-[#c9d1d9]">{i + 1}. {t}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* Re-evaluate */}
                    <div className="text-center pt-2 pb-8">
                      <button data-testid="final-re-evaluate-btn" onClick={() => { setFinalEval(null); handleFinalEvaluate(); }}
                        disabled={finalEvalLoading}
                        className="inline-flex items-center gap-2 px-4 py-2 rounded-lg text-xs font-medium text-[#8b949e] hover:text-white border border-[#2d333b] hover:border-[#484f58] transition-colors">
                        <RefreshCw size={12} /> Re-evaluate
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemDesignPractice;
