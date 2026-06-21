'use client';
import { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { api } from '@/lib/api';
import type { ApiError } from '@/lib/api';
import {
  Play, ChevronDown, CheckCircle, XCircle, Loader2, Clock,
  Pause, RotateCcw, Send, Beaker, Plus, Trash2, Lightbulb, FileCode,
} from 'lucide-react';

interface LangMeta {
  label: string;
  syntax: string;
  icon: string;
}

interface TestCaseItem {
  name: string;
  input: string;
  expected: string;
}

interface RunResult {
  stdout: string;
  stderr: string;
  exit_code?: number;
  pass: boolean | null;
  running: boolean;
}

type RunResults = Record<number, RunResult>;

const LANG_META: Record<string, LangMeta> = {
  python:     { label: 'Python',     syntax: 'python',     icon: '🐍' },
  javascript: { label: 'JavaScript', syntax: 'javascript', icon: 'JS' },
  typescript: { label: 'TypeScript', syntax: 'typescript', icon: 'TS' },
  java:       { label: 'Java',       syntax: 'java',       icon: '☕' },
  cpp:        { label: 'C++',        syntax: 'cpp',        icon: 'C+' },
  c:          { label: 'C',          syntax: 'c',          icon: 'C' },
  go:         { label: 'Go',         syntax: 'go',         icon: 'Go' },
  rust:       { label: 'Rust',       syntax: 'rust',       icon: '🦀' },
  ruby:       { label: 'Ruby',       syntax: 'ruby',       icon: '💎' },
};

const DEFAULT_LANGS = ['python', 'java', 'cpp', 'javascript'];

const formatTime = (secs: number): string => {
  const m = Math.floor(secs / 60).toString().padStart(2, '0');
  const s = Math.floor(secs % 60).toString().padStart(2, '0');
  return `${m}:${s}`;
};

const normalizeOutput = (s: string): string => (s || '').replace(/\s+/g, ' ').trim();

interface PlaygroundProps {
  title?: string;
  lesson_slug?: string;
  starter_code?: Record<string, string>;
  languages?: string[];
  test_cases?: TestCaseItem[];
  timer?: boolean;
  isDark?: boolean;
}

const Playground = ({
  title = 'Try it Yourself',
  lesson_slug,
  starter_code = {},
  languages,
  test_cases = [],
  timer = true,
  isDark = true,
}: PlaygroundProps) => {
  const langs = (languages && languages.length ? languages : Object.keys(starter_code || {}).length ? Object.keys(starter_code) : DEFAULT_LANGS)
    .map((l: string) => l.toLowerCase())
    .filter((l: string) => LANG_META[l]);

  const [lang, setLang] = useState(langs[0] || 'python');
  const [showLangPicker, setShowLangPicker] = useState<boolean>(false);
  const storageKey = useMemo(() => `algokube.playground.${lesson_slug || 'default'}.${lang}`, [lesson_slug, lang]);

  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) return saved;
    } catch {}
    return starter_code[lang] || starter_code[Object.keys(starter_code)[0]] || '';
  });

  // Reset code when language changes
  useEffect(() => {
    /* eslint-disable react-hooks/set-state-in-effect */
    try {
      const saved = localStorage.getItem(storageKey);
      if (saved) { setCode(saved); return; }
    } catch {}
    setCode(starter_code[lang] || '');
    /* eslint-enable react-hooks/set-state-in-effect */
  }, [lang, storageKey, starter_code]);

  // Persist code on change (debounced)
  useEffect(() => {
    const id = setTimeout(() => { try { localStorage.setItem(storageKey, code); } catch {} }, 400);
    return () => clearTimeout(id);
  }, [code, storageKey]);

  // Test cases — editable
  const [cases, setCases] = useState(() =>
    (test_cases && test_cases.length ? test_cases : [{ name: 'Case 1', input: '', expected: '' }]).map((t, i) => ({
      name: t.name || `Case ${i + 1}`,
      input: t.input || '',
      expected: t.expected || '',
    }))
  );
  const [activeCase, setActiveCase] = useState<number>(0);

  // Run state — per-case result
  const [results, setResults] = useState<RunResults>({}); // { [caseIdx]: { stdout, stderr, pass, running } }
  const [isEvaluating, setIsEvaluating] = useState<boolean>(false);
  const [submitted, setSubmitted] = useState<boolean>(false);

  // Session timer
  const [elapsed, setElapsed] = useState<number>(0);
  const [timerRunning, setTimerRunning] = useState<boolean>(true);
  useEffect(() => {
    if (!timer || !timerRunning) return undefined;
    const id = setInterval(() => setElapsed(e => e + 1), 1000);
    return () => clearInterval(id);
  }, [timer, timerRunning]);

  const editorRef = useRef<HTMLTextAreaElement>(null);

  const runCase = useCallback(async (idx: number): Promise<RunResult | null> => {
    const tc = cases[idx];
    if (!tc) return null;
    setResults(r => ({ ...r, [idx]: { ...(r[idx] || {}), running: true, stdout: '', stderr: '', pass: null } }));
    try {
      const res = await api.post(`/execute-code`, {
        code, language: lang, stdin: tc.input || '',
      });
      const { stdout = '', stderr = '', exit_code = 0 } = (res.data || {}) as { stdout?: string; stderr?: string; exit_code?: number };
      const pass = exit_code === 0 && tc.expected ? normalizeOutput(stdout) === normalizeOutput(tc.expected) : null;
      const out: RunResult = { stdout: (stdout || '').trimEnd(), stderr: stderr || '', exit_code, pass, running: false };
      setResults(r => ({ ...r, [idx]: out }));
      return out;
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : (err as ApiError)?.detail || 'Execution error';
      const out: RunResult = { stdout: '', stderr: `Execution error: ${message}`, exit_code: 1, pass: false, running: false };
      setResults(r => ({ ...r, [idx]: out }));
      return out;
    }
  }, [code, lang, cases]);

  const handleRun = () => runCase(activeCase);

  const handleEvaluate = async () => {
    setIsEvaluating(true);
    for (let i = 0; i < cases.length; i++) {
      await runCase(i);
    }
    setIsEvaluating(false);
  };

  const handleSubmit = async () => {
    await handleEvaluate();
    setSubmitted(true);
    setTimerRunning(false);
    setTimeout(() => setSubmitted(false), 4000);
  };

  const handleReset = () => {
    try { localStorage.removeItem(storageKey); } catch {}
    setCode(starter_code[lang] || '');
    setResults({});
    setSubmitted(false);
  };

  const addCase = () => {
    const n = cases.length + 1;
    setCases([...cases, { name: `Case ${n}`, input: '', expected: '' }]);
    setActiveCase(cases.length);
  };

  const removeCase = (i: number): void => {
    if (cases.length <= 1) return;
    const next = cases.filter((_: TestCaseItem, j: number) => j !== i);
    setCases(next);
    setActiveCase(Math.min(activeCase, next.length - 1));
    setResults(r => {
      const out: RunResults = {};
      Object.keys(r).forEach((k: string) => {
        const ki = parseInt(k, 10);
        if (ki < i) out[ki] = r[ki];
        else if (ki > i) out[ki - 1] = r[ki];
      });
      return out;
    });
  };

  const updateCase = (idx: number, field: keyof TestCaseItem, value: string): void => {
    const next = cases.slice();
    next[idx] = { ...next[idx], [field]: value };
    setCases(next);
  };

  const passCount = Object.values(results).filter((r: RunResult) => r && r.pass === true).length;
  const allRun = Object.keys(results).length === cases.length;
  const allPass = allRun && passCount === cases.length;

  const panelBg = isDark ? 'rgba(13,17,23,0.85)' : 'rgba(246,248,250,0.95)';
  const borderCol = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const textCol = isDark ? '#e5e5e5' : '#1f2937';
  const mutedCol = isDark ? '#9ca3af' : '#4b5563';
  const inputBg = isDark ? 'rgba(0,0,0,0.35)' : 'rgba(255,255,255,0.8)';

  const currentResult = results[activeCase];

  return (
    <div
      data-testid="playground"
      style={{
        background: panelBg, border: `1px solid ${borderCol}`,
        borderRadius: 16, margin: '24px 0', overflow: 'hidden',
      }}
    >
      {/* Header */}
      <div
        style={{
          padding: '14px 18px', borderBottom: `1px solid ${borderCol}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <Beaker size={16} style={{ color: '#22c55e' }} />
          <span style={{ fontSize: 14, fontWeight: 700, color: textCol, letterSpacing: 0.2 }}>{title}</span>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
          {/* Language dropdown */}
          <div style={{ position: 'relative' }}>
            <button
              data-testid="playground-lang-button"
              onClick={() => setShowLangPicker(v => !v)}
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 12px', borderRadius: 8,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${borderCol}`, color: textCol,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
              }}
            >
              <span style={{ fontSize: 11, fontFamily: 'ui-monospace,monospace', opacity: 0.7, minWidth: 16 }}>{LANG_META[lang]?.icon || '>'}</span>
              {LANG_META[lang]?.label || lang}
              <ChevronDown size={12} />
            </button>
            {showLangPicker && (
              <div
                style={{
                  position: 'absolute', top: 'calc(100% + 4px)', right: 0,
                  background: isDark ? '#0d1117' : '#ffffff',
                  border: `1px solid ${borderCol}`, borderRadius: 10,
                  minWidth: 170, zIndex: 40, boxShadow: '0 10px 30px rgba(0,0,0,0.35)',
                  overflow: 'hidden',
                }}
              >
                {langs.map(l => (
                  <button
                    key={l}
                    data-testid={`playground-lang-${l}`}
                    onClick={() => { setLang(l); setShowLangPicker(false); }}
                    style={{
                      width: '100%', textAlign: 'left', padding: '8px 12px',
                      display: 'flex', alignItems: 'center', gap: 10, fontSize: 13,
                      background: l === lang ? 'rgba(34,197,94,0.12)' : 'transparent',
                      color: l === lang ? '#22c55e' : textCol, cursor: 'pointer', border: 0,
                    }}
                  >
                    <span style={{ fontSize: 11, opacity: 0.7, width: 18, textAlign: 'center' }}>{LANG_META[l]?.icon}</span>
                    <span style={{ fontWeight: 600 }}>{LANG_META[l]?.label}</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Session timer */}
          {timer && (
            <div
              data-testid="playground-timer"
              style={{
                display: 'flex', alignItems: 'center', gap: 6,
                padding: '6px 10px', borderRadius: 8,
                background: isDark ? 'rgba(255,255,255,0.04)' : 'rgba(0,0,0,0.04)',
                border: `1px solid ${borderCol}`, color: textCol,
                fontFamily: 'ui-monospace,monospace', fontSize: 13, fontWeight: 600,
              }}
            >
              <Clock size={13} style={{ color: mutedCol }} />
              <span>{formatTime(elapsed)}</span>
              <button
                data-testid="playground-timer-toggle"
                onClick={() => setTimerRunning(v => !v)}
                style={{ background: 'transparent', border: 0, color: mutedCol, cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center' }}
                title={timerRunning ? 'Pause' : 'Resume'}
              >
                {timerRunning ? <Pause size={11} /> : <Play size={11} />}
              </button>
              <button
                data-testid="playground-timer-reset"
                onClick={() => { setElapsed(0); setTimerRunning(true); }}
                style={{ background: 'transparent', border: 0, color: mutedCol, cursor: 'pointer', padding: 2, display: 'grid', placeItems: 'center' }}
                title="Reset"
              >
                <RotateCcw size={11} />
              </button>
            </div>
          )}

          <button
            data-testid="playground-reset-code"
            onClick={handleReset}
            style={{ padding: '6px 10px', borderRadius: 8, background: 'transparent', border: `1px solid ${borderCol}`, color: mutedCol, cursor: 'pointer', fontSize: 12, fontWeight: 600, display: 'flex', alignItems: 'center', gap: 4 }}
            title="Reset code to starter"
          >
            <RotateCcw size={12} /> Reset
          </button>
        </div>
      </div>

      {/* Editor */}
      <div style={{ display: 'flex', borderBottom: `1px solid ${borderCol}`, background: isDark ? '#0d1117' : '#f9fafb' }}>
        <div
          aria-hidden
          style={{
            padding: '14px 8px 14px 14px', textAlign: 'right',
            fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 13,
            color: mutedCol, userSelect: 'none', lineHeight: 1.6, whiteSpace: 'pre',
            minWidth: 40,
          }}
        >
          {code.split('\n').map((_, i) => i + 1).join('\n')}
        </div>
        <textarea
          ref={editorRef}
          data-testid="playground-editor"
          value={code}
          onChange={(e) => setCode(e.target.value)}
          spellCheck={false}
          onKeyDown={(e: React.KeyboardEvent<HTMLTextAreaElement>) => {
            if (e.key === 'Tab') {
              e.preventDefault();
              const target = e.target as HTMLTextAreaElement;
              const s = target.selectionStart; const end = target.selectionEnd;
              setCode(code.substring(0, s) + '    ' + code.substring(end));
              setTimeout(() => { if (editorRef.current) { editorRef.current.selectionStart = editorRef.current.selectionEnd = s + 4; } }, 0);
            }
          }}
          style={{
            flex: 1, minHeight: 280, padding: '14px 14px 14px 6px', resize: 'vertical',
            background: 'transparent', border: 0, outline: 'none',
            fontFamily: 'ui-monospace,SFMono-Regular,monospace', fontSize: 13, lineHeight: 1.6,
            color: textCol, tabSize: 4, whiteSpace: 'pre',
          }}
        />
      </div>

      {/* Action bar */}
      <div
        style={{
          padding: '10px 14px', borderBottom: `1px solid ${borderCol}`,
          display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 10, flexWrap: 'wrap',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, color: mutedCol, fontSize: 12 }}>
          {allRun && (
            <span style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: allPass ? '#22c55e' : '#f59e0b', fontWeight: 700 }}>
              {allPass ? <CheckCircle size={12} /> : <Lightbulb size={12} />}
              {passCount}/{cases.length} passed
            </span>
          )}
          {submitted && (
            <span data-testid="playground-submitted-toast" style={{ display: 'inline-flex', alignItems: 'center', gap: 5, color: '#22c55e', fontWeight: 700 }}>
              <CheckCircle size={12} /> Solution submitted — nice work!
            </span>
          )}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <button
            data-testid="playground-run"
            onClick={handleRun}
            disabled={currentResult?.running}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'transparent', border: `1px solid ${borderCol}`,
              color: textCol, fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {currentResult?.running ? <Loader2 size={13} className="animate-spin" /> : <Play size={13} />}
            Run
          </button>
          <button
            data-testid="playground-evaluate"
            onClick={handleEvaluate}
            disabled={isEvaluating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: 'rgba(168,85,247,0.14)', border: '1px solid rgba(168,85,247,0.45)',
              color: '#c084fc', fontSize: 13, fontWeight: 600, cursor: 'pointer',
            }}
          >
            {isEvaluating ? <Loader2 size={13} className="animate-spin" /> : <Beaker size={13} />}
            Evaluate All
          </button>
          <button
            data-testid="playground-submit"
            onClick={handleSubmit}
            disabled={isEvaluating}
            style={{
              display: 'flex', alignItems: 'center', gap: 6,
              padding: '7px 14px', borderRadius: 8,
              background: '#22c55e', color: '#0a0a0a',
              border: 0, fontSize: 13, fontWeight: 700, cursor: 'pointer',
            }}
          >
            <Send size={13} /> Submit
          </button>
        </div>
      </div>

      {/* Test case tab strip */}
      <div style={{ padding: '0 14px', borderBottom: `1px solid ${borderCol}`, display: 'flex', alignItems: 'stretch', gap: 2, overflowX: 'auto' }}>
        {cases.map((c, i) => {
          const r = results[i];
          const status = r ? (r.pass === true ? 'pass' : r.pass === false ? 'fail' : r.running ? 'run' : 'done') : 'idle';
          const statusColor = status === 'pass' ? '#22c55e' : status === 'fail' ? '#ef4444' : status === 'run' ? '#3b82f6' : mutedCol;
          return (
            <button
              key={i}
              data-testid={`playground-case-tab-${i}`}
              onClick={() => setActiveCase(i)}
              style={{
                padding: '10px 14px', background: 'transparent', border: 0,
                borderBottom: `2px solid ${i === activeCase ? '#22c55e' : 'transparent'}`,
                color: i === activeCase ? textCol : mutedCol,
                fontSize: 13, fontWeight: 600, cursor: 'pointer',
                display: 'flex', alignItems: 'center', gap: 6, whiteSpace: 'nowrap',
              }}
            >
              {status === 'pass' && <CheckCircle size={12} style={{ color: statusColor }} />}
              {status === 'fail' && <XCircle size={12} style={{ color: statusColor }} />}
              {status === 'run' && <Loader2 size={12} className="animate-spin" style={{ color: statusColor }} />}
              {(status === 'idle' || status === 'done') && <FileCode size={12} style={{ color: statusColor }} />}
              {c.name}
            </button>
          );
        })}
        <button
          data-testid="playground-case-add"
          onClick={addCase}
          style={{ padding: '10px 10px', background: 'transparent', border: 0, color: mutedCol, cursor: 'pointer' }}
          title="Add test case"
        >
          <Plus size={13} />
        </button>
      </div>

      {/* Active case panel */}
      {cases[activeCase] && (
        <div style={{ padding: '14px', display: 'grid', gap: 12, gridTemplateColumns: '1fr 1fr' }}>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 6 }}>
              <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: mutedCol }}>Input (stdin)</label>
              {cases.length > 1 && (
                <button
                  data-testid={`playground-case-remove-${activeCase}`}
                  onClick={() => removeCase(activeCase)}
                  style={{ background: 'transparent', border: 0, color: mutedCol, cursor: 'pointer', fontSize: 11, display: 'flex', alignItems: 'center', gap: 3 }}
                  title="Remove case"
                >
                  <Trash2 size={11} /> Remove
                </button>
              )}
            </div>
            <textarea
              data-testid={`playground-input-${activeCase}`}
              value={cases[activeCase].input}
              onChange={(e) => updateCase(activeCase, 'input', e.target.value)}
              placeholder="e.g. 5\n1 2 3 4 5"
              style={{
                width: '100%', minHeight: 80, padding: 10, borderRadius: 8,
                background: inputBg, border: `1px solid ${borderCol}`,
                color: textCol, fontFamily: 'ui-monospace,monospace', fontSize: 12,
                outline: 'none', resize: 'vertical',
              }}
            />
          </div>
          <div>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: mutedCol, display: 'block', marginBottom: 6 }}>
              Expected Output
            </label>
            <textarea
              data-testid={`playground-expected-${activeCase}`}
              value={cases[activeCase].expected}
              onChange={(e) => updateCase(activeCase, 'expected', e.target.value)}
              placeholder="Expected stdout for this input..."
              style={{
                width: '100%', minHeight: 80, padding: 10, borderRadius: 8,
                background: inputBg, border: `1px solid ${borderCol}`,
                color: textCol, fontFamily: 'ui-monospace,monospace', fontSize: 12,
                outline: 'none', resize: 'vertical',
              }}
            />
          </div>
          <div style={{ gridColumn: '1 / -1' }}>
            <label style={{ fontSize: 11, fontWeight: 700, textTransform: 'uppercase', letterSpacing: 0.6, color: mutedCol, display: 'block', marginBottom: 6 }}>
              {currentResult?.stderr ? 'Error' : 'Your Output'}
            </label>
            <pre
              data-testid={`playground-output-${activeCase}`}
              style={{
                margin: 0, padding: 12, borderRadius: 8,
                background: inputBg, border: `1px solid ${borderCol}`,
                color: currentResult?.stderr ? '#fca5a5' : textCol,
                fontFamily: 'ui-monospace,monospace', fontSize: 12,
                minHeight: 60, whiteSpace: 'pre-wrap', wordBreak: 'break-word',
              }}
            >
              {currentResult
                ? (currentResult.stderr || currentResult.stdout || '(no output)')
                : 'Press Run to execute against this test case.'}
            </pre>
            {currentResult && currentResult.pass !== null && !currentResult.stderr && (
              <div style={{ marginTop: 8, fontSize: 12, fontWeight: 700, color: currentResult.pass ? '#22c55e' : '#ef4444', display: 'flex', alignItems: 'center', gap: 6 }}>
                {currentResult.pass
                  ? (<><CheckCircle size={13} /> Output matches expected</>)
                  : (<><XCircle size={13} /> Output differs from expected</>)}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default Playground;
