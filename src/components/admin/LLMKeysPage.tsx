'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError, showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Key, Plus, Trash2, Loader2, CheckCircle2,
  XCircle, AlertTriangle, Shield, Zap, ToggleLeft, ToggleRight,
  Pencil, Save, X, BarChart3,
} from 'lucide-react';

const PROVIDER_COLORS: Record<string, { bg: string; border: string; text: string; label: string }> = {
  openai: { bg: '#10a37f18', border: '#10a37f40', text: '#10a37f', label: 'OpenAI' },
  anthropic: { bg: '#d4a27418', border: '#d4a27440', text: '#d4a274', label: 'Anthropic' },
  google: { bg: '#4285f418', border: '#4285f440', text: '#4285f4', label: 'Google' },
};

const LLMKeysPage = () => {
  const navigate = useRouter();

  interface LLMKeyItem { key_id: string; provider: string; label: string; is_active: boolean; api_key_masked: string; assigned_features: string[]; created_at: string; }
  interface FeatureItem { id: string; label: string; }
  interface LLMConfig { providers: Record<string, { label: string }>; features: FeatureItem[]; }

  const [keys, setKeys] = useState<LLMKeyItem[]>([]);
  const [config, setConfig] = useState<LLMConfig>({ providers: {}, features: [] });
  const [loading, setLoading] = useState<boolean>(true);
  const [showAdd, setShowAdd] = useState<boolean>(false);
  const [testing, setTesting] = useState<string | null>(null);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editFeatures, setEditFeatures] = useState<string[]>([]);

  const [form, setForm] = useState<{ provider: string; api_key: string; label: string; assigned_features: string[] }>({ provider: 'openai', api_key: '', label: '', assigned_features: [] });

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [keysRes, configRes] = await Promise.all([
        api.get<{ keys: LLMKeyItem[] }>('/admin/llm-keys', { signal }),
        api.get<LLMConfig>('/admin/llm-keys/config', { signal }),
      ]);
      if (signal?.aborted) return;
      setKeys(keysRes.data.keys || []);
      setConfig(configRes.data);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  const handleSave = async () => {
    if (!form.api_key.trim()) return;
    setSaving(true);
    try {
      await api.post('/admin/llm-keys', form);
      setShowAdd(false);
      setForm({ provider: 'openai', api_key: '', label: '', assigned_features: [] });
      await load();
    } catch (err) {
      handleApiError(err);
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (keyId: string) => {
    if (!(await showConfirm('Delete this API key?'))) return;
    try {
      await api.delete(`/admin/llm-keys/${keyId}`);
      await load();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleToggle = async (key: LLMKeyItem) => {
    try {
      await api.put(`/admin/llm-keys/${key.key_id}`, { is_active: !key.is_active });
      await load();
    } catch (err) {
      handleApiError(err);
    }
  };

  const handleTest = async (provider: string, apiKey: string) => {
    setTesting(provider);
    setTestResult(null);
    try {
      const res = await api.post<{ success: boolean; message: string }>('/admin/llm-keys/test', { provider, api_key: apiKey });
      setTestResult(res.data);
    } catch {
      setTestResult({ success: false, message: 'Request failed' });
    } finally {
      setTesting(null);
    }
  };

  const startEditFeatures = (key: LLMKeyItem) => {
    setEditingId(key.key_id);
    setEditFeatures([...(key.assigned_features || [])]);
  };

  const saveFeatures = async (keyId: string) => {
    try {
      await api.put(`/admin/llm-keys/${keyId}`, { assigned_features: editFeatures });
      setEditingId(null);
      await load();
    } catch (err) {
      handleApiError(err);
    }
  };

  const toggleFeature = (list: string[], setList: React.Dispatch<React.SetStateAction<string[]>>, featureId: string) => {
    setList((prev: string[]) => prev.includes(featureId) ? prev.filter((f: string) => f !== featureId) : [...prev, featureId]);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="llm-keys-back-btn" onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="llm-keys-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <Key size={22} className="text-[#f59e0b]" /> LLM API Keys
            </h1>
            <p className="text-sm text-[#8b949e] mt-1">Manage custom API keys for AI features. Custom keys override the default Emergent key.</p>
          </div>
          <button
            data-testid="view-usage-btn"
            onClick={() => navigate.push('/admin/dashboard/llm-keys/usage')}
            className="flex items-center gap-2 border border-[#3b82f640] text-[#3b82f6] hover:bg-[#3b82f610] font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <BarChart3 size={16} /> Usage
          </button>
          <button
            data-testid="add-key-btn"
            onClick={() => { setShowAdd(true); setTestResult(null); }}
            className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            <Plus size={16} /> Add Key
          </button>
        </div>

        {/* Info Banner */}
        <div className="border border-[#f59e0b30] rounded-xl p-4 mb-6 flex items-start gap-3" style={{ backgroundColor: '#f59e0b08' }}>
          <Shield size={18} className="text-[#f59e0b] mt-0.5 shrink-0" />
          <div>
            <p className="text-sm text-[#c9d1d9]">
              Keys are stored securely and never shown in full after saving. When a feature has a custom key assigned, it will be used instead of the default Emergent Universal Key.
            </p>
          </div>
        </div>

        {/* Add Key Form */}
        {showAdd && (
          <div data-testid="add-key-form" className="border border-[#2d333b] rounded-xl p-6 mb-6" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center justify-between mb-5">
              <h2 className="text-lg font-semibold text-white">Add New API Key</h2>
              <button onClick={() => { setShowAdd(false); setTestResult(null); }} className="text-[#8b949e] hover:text-white"><X size={18} /></button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              {/* Provider */}
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5">Provider</label>
                <select
                  data-testid="provider-select"
                  value={form.provider}
                  onChange={e => setForm(f => ({ ...f, provider: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:border-[#22c55e] focus:outline-none"
                >
                  {Object.entries(config.providers).map(([key, val]) => (
                    <option key={key} value={key}>{val.label}</option>
                  ))}
                </select>
              </div>

              {/* Label */}
              <div>
                <label className="block text-xs text-[#8b949e] mb-1.5">Label (optional)</label>
                <input
                  data-testid="key-label-input"
                  type="text"
                  placeholder="e.g. Production Key"
                  value={form.label}
                  onChange={e => setForm(f => ({ ...f, label: e.target.value }))}
                  className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] focus:border-[#22c55e] focus:outline-none"
                />
              </div>
            </div>

            {/* API Key */}
            <div className="mb-4">
              <label className="block text-xs text-[#8b949e] mb-1.5">API Key</label>
              <input
                data-testid="api-key-input"
                type="password"
                placeholder="sk-..."
                value={form.api_key}
                  onChange={e => setForm(f => ({ ...f, api_key: e.target.value }))}
                className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] font-mono focus:border-[#22c55e] focus:outline-none"
              />
            </div>

            {/* Feature Assignment */}
            <div className="mb-5">
              <label className="block text-xs text-[#8b949e] mb-2">Assign to Features</label>
              <div className="flex flex-wrap gap-2">
                {(config.features || []).map((f: FeatureItem) => {
                  const active = form.assigned_features.includes(f.id);
                  return (
                    <button
                      key={f.id}
                      data-testid={`feature-toggle-${f.id}`}
                      onClick={() => toggleFeature(form.assigned_features, (updater) => setForm(prev => ({ ...prev, assigned_features: typeof updater === 'function' ? updater(prev.assigned_features) : updater })), f.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
                        active
                          ? 'bg-[#22c55e18] border-[#22c55e50] text-[#22c55e]'
                          : 'bg-[#0d1117] border-[#2d333b] text-[#8b949e] hover:border-[#444c56]'
                      }`}
                    >
                      {f.label}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Test Result */}
            {testResult && (
              <div data-testid="test-result" className={`rounded-lg p-3 mb-4 border text-sm flex items-center gap-2 ${
                testResult.success
                  ? 'bg-[#22c55e10] border-[#22c55e30] text-[#22c55e]'
                  : 'bg-[#ef444410] border-[#ef444430] text-[#ef4444]'
              }`}>
                {testResult.success ? <CheckCircle2 size={16} /> : <XCircle size={16} />}
                {testResult.message}
              </div>
            )}

            {/* Actions */}
            <div className="flex items-center gap-3">
              <button
                data-testid="test-connection-btn"
                onClick={() => handleTest(form.provider, form.api_key)}
                disabled={!form.api_key.trim() || !!testing}
                className="flex items-center gap-2 border border-[#f59e0b40] text-[#f59e0b] hover:bg-[#f59e0b10] px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {testing ? <Loader2 size={14} className="animate-spin" /> : <Zap size={14} />}
                Test Connection
              </button>
              <button
                data-testid="save-key-btn"
                onClick={handleSave}
                disabled={!form.api_key.trim() || saving}
                className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-sm font-medium transition-colors disabled:opacity-40"
              >
                {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                Save Key
              </button>
            </div>
          </div>
        )}

        {/* Keys List */}
        {keys.length === 0 && !showAdd ? (
          <div className="border border-[#2d333b] rounded-xl p-12 text-center" style={{ backgroundColor: '#161b22' }}>
            <Key size={40} className="mx-auto mb-3 text-[#484f58]" />
            <p className="text-[#8b949e] mb-1">No custom API keys configured</p>
            <p className="text-xs text-[#484f58]">All AI features are using the default Emergent Universal Key</p>
          </div>
        ) : (
          <div className="space-y-3">
            {keys.map((k: LLMKeyItem) => {
              const pc = PROVIDER_COLORS[k.provider] || PROVIDER_COLORS.openai;
              const isEditing = editingId === k.key_id;
              return (
                <div
                  key={k.key_id}
                  data-testid={`llm-key-card-${k.key_id}`}
                  className="border rounded-xl p-5 transition-all"
                  style={{ backgroundColor: '#161b22', borderColor: k.is_active ? pc.border : '#2d333b' }}
                >
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-3">
                      <span
                        className="px-2.5 py-1 rounded-md text-xs font-semibold uppercase tracking-wider"
                        style={{ backgroundColor: pc.bg, color: pc.text, border: `1px solid ${pc.border}` }}
                      >
                        {pc.label}
                      </span>
                      <span className="text-sm font-medium text-[#c9d1d9]">{k.label}</span>
                      {!k.is_active && (
                        <span className="text-xs text-[#f59e0b] flex items-center gap-1">
                          <AlertTriangle size={12} /> Disabled
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        data-testid={`toggle-key-${k.key_id}`}
                        onClick={() => handleToggle(k)}
                        className="text-[#8b949e] hover:text-white transition-colors p-1"
                        title={k.is_active ? 'Disable key' : 'Enable key'}
                      >
                        {k.is_active ? <ToggleRight size={20} className="text-[#22c55e]" /> : <ToggleLeft size={20} />}
                      </button>
                      <button
                        data-testid={`delete-key-${k.key_id}`}
                        onClick={() => handleDelete(k.key_id)}
                        className="text-[#8b949e] hover:text-[#ef4444] transition-colors p-1"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>

                  {/* Masked key */}
                  <div className="mb-3">
                    <span className="text-xs text-[#484f58] font-mono">{k.api_key_masked}</span>
                  </div>

                  {/* Feature assignments */}
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-xs text-[#8b949e]">Assigned Features</span>
                      {!isEditing ? (
                        <button
                          data-testid={`edit-features-${k.key_id}`}
                          onClick={() => startEditFeatures(k)}
                          className="text-xs text-[#3b82f6] hover:text-[#60a5fa] flex items-center gap-1 transition-colors"
                        >
                          <Pencil size={11} /> Edit
                        </button>
                      ) : (
                        <div className="flex items-center gap-2">
                          <button
                            data-testid={`save-features-${k.key_id}`}
                            onClick={() => saveFeatures(k.key_id)}
                            className="text-xs text-[#22c55e] hover:text-[#4ade80] flex items-center gap-1"
                          >
                            <Save size={11} /> Save
                          </button>
                          <button onClick={() => setEditingId(null)} className="text-xs text-[#8b949e] hover:text-white">
                            <X size={12} />
                          </button>
                        </div>
                      )}
                    </div>
                    <div className="flex flex-wrap gap-1.5">
                      {isEditing ? (
                        (config.features || []).map((f: FeatureItem) => {
                          const active = editFeatures.includes(f.id);
                          return (
                            <button
                              key={f.id}
                              onClick={() => toggleFeature(editFeatures, setEditFeatures, f.id)}
                              className={`px-2.5 py-1 rounded-md text-xs border transition-all ${
                                active
                                  ? 'bg-[#22c55e18] border-[#22c55e50] text-[#22c55e]'
                                  : 'bg-[#0d1117] border-[#2d333b] text-[#484f58] hover:border-[#444c56]'
                              }`}
                            >
                              {f.label}
                            </button>
                          );
                        })
                      ) : (
                        (k.assigned_features || []).length > 0 ? (
                          (k.assigned_features || []).map((fid: string) => {
                            const feat = config.features.find((f: FeatureItem) => f.id === fid);
                            return (
                              <span key={fid} className="px-2.5 py-1 rounded-md text-xs bg-[#22c55e18] border border-[#22c55e30] text-[#22c55e]">
                                {feat?.label || fid}
                              </span>
                            );
                          })
                        ) : (
                          <span className="text-xs text-[#484f58] italic">No features assigned</span>
                        )
                      )}
                    </div>
                  </div>

                  {/* Created date */}
                  <div className="mt-3 text-xs text-[#484f58]">
                    Added {k.created_at ? new Date(k.created_at).toLocaleDateString() : 'N/A'}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default LLMKeysPage;
