'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showError, handleApiError, showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Key, Save, CheckCircle2, XCircle, Loader2, Play,
  Server, Zap, AlertTriangle, Eye, EyeOff, Trash2,
} from 'lucide-react';

const PROVIDERS = [
  { id: 'local',   label: 'Local (in-process)', desc: 'Run code on this server (fast, limited languages, no extra keys)' },
  { id: 'judge0',  label: 'Judge0 (RapidAPI)',  desc: 'Full-language support with strict sandboxing — recommended for prod' },
  { id: 'piston',  label: 'Piston (public)',    desc: 'Free public API by engineer-man — no key required, modest quotas' },
];

const LANGS = [
  { id: 'python',     label: 'Python' },
  { id: 'java',       label: 'Java' },
  { id: 'cpp',        label: 'C++' },
  { id: 'csharp',     label: 'C#' },
  { id: 'javascript', label: 'JavaScript' },
  { id: 'typescript', label: 'TypeScript' },
  { id: 'go',         label: 'Go' },
  { id: 'rust',       label: 'Rust' },
];

const CodeExecutionSettings = () => {
  const navigate = useRouter();
  
  const [cfg, setCfg] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [showKey, setShowKey] = useState<boolean>(false);
  const [keyInput, setKeyInput] = useState<string>('');
  const [testResult, setTestResult] = useState<Record<string, unknown> | null>(null);
  const [testing, setTesting] = useState<boolean>(false);

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const r = await api.get<Record<string, unknown>>('/admin/code-execution/settings', { signal });
      if (signal?.aborted) return;
      setCfg(r.data);
    } catch (e: unknown) {
      if ((e as DOMException)?.name === 'AbortError') return;
      handleApiError(e);
    }
    if (!signal?.aborted) setLoading(false);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const save = async (patch: Record<string, unknown>) => {
    setSaving(true);
    try {
      const r = await api.put<Record<string, unknown>>('/admin/code-execution/settings', patch);
      setCfg(r.data);
      setTestResult(null);
    } catch (e: unknown) {
      showError((e as { detail?: string }).detail || 'Save failed');
    }
    setSaving(false);
  };

  const saveKey = async () => {
    if (!keyInput.trim()) return;
    await save({ judge0_api_key: keyInput.trim() });
    setKeyInput('');
  };

  const clearKey = async () => {
    if (!(await showConfirm('Clear the stored Judge0 API key?'))) return;
    setSaving(true);
    try {
      const r = await api.post<Record<string, unknown>>('/admin/code-execution/settings/clear-key');
      setCfg(r.data);
    } catch { showError('Failed to clear'); }
    setSaving(false);
  };

  const runTest = async () => {
    setTesting(true);
    setTestResult(null);
    try {
      const r = await api.post<Record<string, unknown>>('/admin/code-execution/settings/test');
      setTestResult(r.data);
    } catch (e: unknown) {
      setTestResult({ ok: false, message: (e as { detail?: string }).detail || 'Test failed' });
    }
    setTesting(false);
  };

  const toggleLang = (id: string) => {
    const current = (cfg?.languages as string[]) || [];
    const next = current.includes(id) ? current.filter((x: string) => x !== id) : [...current, id];
    save({ languages: next });
  };

  if (loading || !cfg) {
    return (
      <div style={{ minHeight: '60vh', display: 'grid', placeItems: 'center', color: '#8b949e' }}>
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  const card = { background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)', borderRadius: 16, padding: 24 };
  const label = { color: '#a1a1aa', fontSize: 12, textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 8 };
  const input = { width: '100%', padding: '10px 14px', background: 'rgba(0,0,0,0.3)', border: '1px solid rgba(255,255,255,0.1)', borderRadius: 10, color: '#e5e5e5', fontSize: 14, fontFamily: 'ui-monospace,SFMono-Regular,monospace' };
  const btn = { padding: '10px 18px', borderRadius: 10, border: 'none', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: 8 };

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '32px 24px', color: '#e5e5e5' }}>
      <button
        onClick={() => navigate.push('/admin/dashboard')}
        data-testid="back-btn"
        style={{ ...btn, background: 'transparent', color: '#8b949e', padding: 0, marginBottom: 20 }}
      >
        <ArrowLeft size={16} /> Back to Admin Dashboard
      </button>

      <div style={{ display: 'flex', alignItems: 'center', gap: 14, marginBottom: 8 }}>
        <div style={{ width: 48, height: 48, borderRadius: 12, background: 'linear-gradient(135deg, #22c55e22, #22c55e11)', border: '1px solid #22c55e33', display: 'grid', placeItems: 'center' }}>
          <Zap size={22} color="#22c55e" />
        </div>
        <div>
          <h1 style={{ margin: 0, fontSize: 28, fontWeight: 700 }}>Code Execution Settings</h1>
          <div style={{ color: '#8b949e', fontSize: 14 }}>Configure the provider powering the DSA playground &amp; Try-it-Yourself sandboxes</div>
        </div>
      </div>

      {/* Provider */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={label}>Execution Provider</div>
        <div style={{ display: 'grid', gap: 10 }}>
          {PROVIDERS.map(p => {
            const active = (cfg?.provider as string) === p.id;
            return (
              <button
                key={p.id}
                data-testid={`provider-${p.id}`}
                onClick={() => save({ provider: p.id })}
                style={{
                  padding: '14px 16px', textAlign: 'left', cursor: 'pointer',
                  background: active ? 'rgba(34,197,94,0.08)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${active ? '#22c55e' : 'rgba(255,255,255,0.08)'}`,
                  borderRadius: 12, color: '#e5e5e5',
                  display: 'flex', alignItems: 'center', gap: 12,
                }}
              >
                <div style={{ width: 18, height: 18, borderRadius: '50%', border: `2px solid ${active ? '#22c55e' : '#555'}`, display: 'grid', placeItems: 'center' }}>
                  {active && <div style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e' }} />}
                </div>
                <div>
                  <div style={{ fontWeight: 600 }}>{p.label}</div>
                  <div style={{ fontSize: 12, color: '#8b949e', marginTop: 2 }}>{p.desc}</div>
                </div>
              </button>
            );
          })}
        </div>
      </div>

      {/* Judge0 config */}
      {(cfg?.provider as string) === 'judge0' && (
        <div style={{ ...card, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Key size={18} color="#22c55e" />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Judge0 RapidAPI configuration</div>
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={label}>API URL</div>
            <input
              data-testid="judge0-url"
              style={input}
              value={(cfg?.judge0_api_url as string) ?? ''}
              onChange={(e) => setCfg({ ...cfg, judge0_api_url: e.target.value })}
              onBlur={() => save({ judge0_api_url: cfg?.judge0_api_url })}
              placeholder="https://judge0-ce.p.rapidapi.com"
            />
          </div>

          <div style={{ marginBottom: 18 }}>
            <div style={label}>RapidAPI Host</div>
            <input
              data-testid="judge0-host"
              style={input}
              value={(cfg?.judge0_host as string) ?? ''}
              onChange={(e) => setCfg({ ...(cfg ?? {}), judge0_host: e.target.value } as Record<string, unknown>)}
              onBlur={() => save({ judge0_host: cfg?.judge0_host })}
              placeholder="judge0-ce.p.rapidapi.com"
            />
          </div>

          <div style={{ marginBottom: 8 }}>
            <div style={label}>API Key {(cfg?.judge0_api_key_configured as boolean) ? <span style={{ color: '#22c55e', textTransform: 'none', letterSpacing: 0 }}>· stored: {(cfg?.judge0_api_key_masked as string)}</span> : null}</div>
            <div style={{ display: 'flex', gap: 10 }}>
              <input
                data-testid="judge0-key"
                style={{ ...input, fontFamily: 'ui-monospace,monospace' }}
                type={showKey ? 'text' : 'password'}
                value={keyInput}
                onChange={(e) => setKeyInput(e.target.value)}
                placeholder={(cfg?.judge0_api_key_configured as boolean) ? 'Enter new key to replace existing' : 'Paste your RapidAPI key'}
                autoComplete="off"
              />
              <button
                data-testid="judge0-key-toggle-visibility"
                onClick={() => setShowKey(v => !v)}
                style={{ ...btn, background: 'rgba(255,255,255,0.05)', color: '#a1a1aa' }}
              >
                {showKey ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
              <button
                data-testid="judge0-key-save"
                onClick={saveKey}
                disabled={!keyInput.trim() || saving}
                style={{ ...btn, background: '#22c55e', color: '#0a0a0a', opacity: !keyInput.trim() || saving ? 0.5 : 1 }}
              >
                <Save size={16} /> Save key
              </button>
            </div>
            {(cfg?.judge0_api_key_configured as boolean) ? (
              <button
                data-testid="judge0-key-clear"
                onClick={clearKey}
                style={{ ...btn, background: 'transparent', color: '#ef4444', padding: '6px 0', marginTop: 8, fontSize: 13 }}
              >
                <Trash2 size={14} /> Clear stored key
              </button>
            ) : null}
            <div style={{ fontSize: 12, color: '#8b949e', marginTop: 10, display: 'flex', alignItems: 'flex-start', gap: 6 }}>
              <AlertTriangle size={12} style={{ marginTop: 2, flexShrink: 0 }} />
              <span>
                Get a free key at <a href="https://rapidapi.com/judge0-official/api/judge0-ce/" target="_blank" rel="noopener" style={{ color: '#22c55e' }}>rapidapi.com/judge0-official</a>. Keys are stored encrypted-at-rest in MongoDB and never returned in plaintext.
              </span>
            </div>
          </div>
        </div>
      )}

      {(cfg?.provider as string) === 'piston' && (
        <div style={{ ...card, marginTop: 24 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 16 }}>
            <Server size={18} color="#22c55e" />
            <div style={{ fontSize: 16, fontWeight: 600 }}>Piston configuration</div>
          </div>
          <div style={label}>API URL</div>
          <input
            data-testid="piston-url"
            style={input}
            value={(cfg?.piston_api_url as string) ?? ''}
            onChange={(e) => setCfg({ ...(cfg ?? {}), piston_api_url: e.target.value } as Record<string, unknown>)}
            onBlur={() => save({ piston_api_url: cfg?.piston_api_url })}
            placeholder="https://emkc.org/api/v2/piston"
          />
          <div style={{ fontSize: 12, color: '#8b949e', marginTop: 10 }}>
            Public Piston API has rate limits (5 req/s per IP). For high traffic, self-host Piston.
          </div>
        </div>
      )}

      {/* Languages */}
      <div style={{ ...card, marginTop: 24 }}>
        <div style={label}>Enabled languages</div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {LANGS.map(l => {
            const active = ((cfg?.languages as string[]) || []).includes(l.id);
            return (
              <button
                key={l.id}
                data-testid={`lang-${l.id}`}
                onClick={() => toggleLang(l.id)}
                style={{
                  padding: '8px 14px', borderRadius: 999,
                  background: active ? 'rgba(34,197,94,0.12)' : 'rgba(0,0,0,0.2)',
                  border: `1px solid ${active ? '#22c55e' : 'rgba(255,255,255,0.1)'}`,
                  color: active ? '#22c55e' : '#a1a1aa',
                  fontWeight: 600, fontSize: 13, cursor: 'pointer',
                }}
              >
                {l.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Test + enable */}
      <div style={{ ...card, marginTop: 24, display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 20, flexWrap: 'wrap' }}>
        <div>
          <div style={{ fontSize: 15, fontWeight: 600, marginBottom: 4 }}>
            Playground is {(cfg?.enabled as boolean) ? <span style={{ color: '#22c55e' }}>ENABLED</span> : <span style={{ color: '#ef4444' }}>DISABLED</span>}
          </div>
          <div style={{ fontSize: 13, color: '#8b949e' }}>
            When disabled, DSA lessons hide the Try-it-Yourself sandbox entirely.
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <button
            data-testid="toggle-enabled"
            onClick={() => save({ enabled: !(cfg?.enabled as boolean) })}
            style={{ ...btn, background: (cfg?.enabled as boolean) ? 'rgba(239,68,68,0.1)' : 'rgba(34,197,94,0.1)', color: (cfg?.enabled as boolean) ? '#ef4444' : '#22c55e' }}
          >
            {(cfg?.enabled as boolean) ? 'Disable' : 'Enable'}
          </button>
          <button
            data-testid="test-provider"
            onClick={runTest}
            disabled={testing}
            style={{ ...btn, background: '#22c55e', color: '#0a0a0a', opacity: testing ? 0.6 : 1 }}
          >
            {testing ? <Loader2 className="animate-spin" size={16} /> : <Play size={16} />}
            Test provider
          </button>
        </div>
      </div>

      {testResult && (
        <div
          data-testid="test-result"
          style={{
            ...card,
            marginTop: 16,
            background: (testResult.ok as boolean) ? 'rgba(34,197,94,0.05)' : 'rgba(239,68,68,0.05)',
            borderColor: (testResult.ok as boolean) ? 'rgba(34,197,94,0.3)' : 'rgba(239,68,68,0.3)',
            display: 'flex', alignItems: 'center', gap: 10,
          }}
        >
          {(testResult.ok as boolean) ? <CheckCircle2 color="#22c55e" size={20} /> : <XCircle color="#ef4444" size={20} />}
          <div>
            <div style={{ fontWeight: 600, color: (testResult.ok as boolean) ? '#22c55e' : '#ef4444' }}>
              {(testResult.ok as boolean) ? 'Connection OK' : 'Connection failed'}
            </div>
            <div style={{ fontSize: 13, color: '#a1a1aa', marginTop: 2 }}>{(testResult.message as string)}</div>
          </div>
        </div>
      )}
    </div>
  );
};

export default CodeExecutionSettings;
