'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { showSuccess, showError, handleApiError, showConfirm } from '@/lib/toast';
import type { ApiError } from '@/lib/api';
import {
  ArrowLeft, Mail, Plus, Trash2, Send, Clock, Check,
  Loader2, Settings, History, AlertCircle, Users,
} from 'lucide-react';

const FREQ_OPTIONS = [
  { value: 'daily', label: 'Daily', desc: 'Sent every day' },
  { value: 'weekly', label: 'Weekly', desc: 'Sent every Monday' },
  { value: 'monthly', label: 'Monthly', desc: 'Sent 1st of each month' },
];

interface DigestConfigData { enabled: boolean; frequency: string; recipients: string[]; }
interface DigestLogData { sent_at: string; frequency: string; recipients_count: number; results?: { status: string }[]; }
interface UserDigestLogData { sent_at: string; total_users: number; sent: number; failed: number; }
interface TestResult { success: boolean; message: string; }

const EmailDigest = () => {
  const [config, setConfig] = useState<DigestConfigData>({ enabled: false, frequency: 'weekly', recipients: [] });
  const [logs, setLogs] = useState<DigestLogData[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [saving, setSaving] = useState<boolean>(false);
  const [sending, setSending] = useState<boolean>(false);
  const [sendingAll, setSendingAll] = useState<boolean>(false);
  const [newEmail, setNewEmail] = useState<string>('');
  const [testEmail, setTestEmail] = useState<string>('');
  const [testResult, setTestResult] = useState<TestResult | null>(null);
  const [tab, setTab] = useState('settings');
  const [userDigestLogs, setUserDigestLogs] = useState<UserDigestLogData[]>([]);
  const [userDigestSending, setUserDigestSending] = useState<boolean>(false);
  const [userTestEmail, setUserTestEmail] = useState<string>('');
  const [userTestResult, setUserTestResult] = useState<TestResult | null>(null);
  const [userTestSending, setUserTestSending] = useState<boolean>(false);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      try {
        const [cfg, lg] = await Promise.all([
          api.get<DigestConfigData>('/admin/digest/config', { signal: ac.signal }),
          api.get<{ logs: DigestLogData[] }>('/admin/digest/logs?limit=10', { signal: ac.signal }),
        ]);
        if (ac.signal.aborted) return;
        setConfig(cfg.data);
        setLogs(lg.data.logs);
      } catch (err) {
        if ((err as DOMException)?.name === 'AbortError') return;
        handleApiError(err);
      } finally {
        if (!ac.signal.aborted) setLoading(false);
      }
    })();
    return () => ac.abort();
  }, []);

  const saveConfig = async (updates: Partial<DigestConfigData>) => {
    setSaving(true);
    try {
      const res = await api.put<DigestConfigData>('/admin/digest/config', updates);
      setConfig(res.data);
    } catch (err) {
      showError('Save failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setSaving(false);
    }
  };

  const addRecipient = () => {
    if (!newEmail || !newEmail.includes('@')) return;
    if (config.recipients?.includes(newEmail)) return;
    const updated = [...(config.recipients || []), newEmail];
    saveConfig({ recipients: updated });
    setNewEmail('');
  };

  const removeRecipient = (email: string) => {
    const updated = (config.recipients || []).filter((e: string) => e !== email);
    saveConfig({ recipients: updated });
  };

  const sendTest = async () => {
    if (!testEmail || !testEmail.includes('@')) return;
    setSending(true);
    setTestResult(null);
    try {
      await api.post('/admin/digest/send-test', { recipient: testEmail });
      setTestResult({ success: true, message: `Digest sent to ${testEmail}` });
      const lg = await api.get<{ logs: DigestLogData[] }>('/admin/digest/logs?limit=10');
      setLogs(lg.data.logs);
    } catch (err) {
      setTestResult({ success: false, message: (err as ApiError).detail || (err as Error).message });
    } finally {
      setSending(false);
    }
  };

  const sendAll = async () => {
    if (!config.recipients?.length) {
      showError('No recipients configured');
      return;
    }
    setSendingAll(true);
    try {
      const res = await api.post<{ sent: number; total: number }>('/admin/digest/send-all');
      showSuccess(`Digest sent to ${res.data.sent} of ${res.data.total} recipients`);
      const lg = await api.get<{ logs: DigestLogData[] }>('/admin/digest/logs?limit=10');
      setLogs(lg.data.logs);
    } catch (err) {
      showError('Send failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setSendingAll(false);
    }
  };

  const fetchUserDigestLogs = async (signal?: AbortSignal) => {
    try {
      const res = await api.get<{ logs: UserDigestLogData[] }>('/admin/user-digest/logs?limit=10', { signal });
      if (signal?.aborted) return;
      setUserDigestLogs(res.data.logs || []);
    } catch {
      /* ignore */
    }
  };

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (tab === 'user-digest') fetchUserDigestLogs(ac.signal);
    return () => ac.abort();
  }, [tab]);

  const sendUserDigestTest = async () => {
    if (!userTestEmail) return;
    setUserTestSending(true);
    setUserTestResult(null);
    try {
      await api.post('/admin/user-digest/send-test', { recipient: userTestEmail });
      setUserTestResult({ success: true, message: `User digest sent to ${userTestEmail}` });
      fetchUserDigestLogs();
    } catch (err) {
      setUserTestResult({ success: false, message: (err as ApiError).detail || (err as Error).message });
    } finally {
      setUserTestSending(false);
    }
  };

  const sendUserDigestAll = async () => {
    if (!(await showConfirm('Send weekly digest email to ALL opted-in users?'))) return;
    setUserDigestSending(true);
    try {
      const res = await api.post<{ sent: number; total: number }>('/admin/user-digest/send-all');
      showSuccess(`User digest sent to ${res.data.sent} of ${res.data.total} users`);
      fetchUserDigestLogs();
    } catch (err) {
      showError('Failed: ' + ((err as ApiError).detail || (err as Error).message));
    } finally {
      setUserDigestSending(false);
    }
  };

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-4xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="email-digest-title" className="text-2xl font-bold text-white">Email Digest</h1>
            <p className="text-sm text-[#8b949e]">Automated admin metric summaries</p>
          </div>
          <button
            data-testid="send-all-btn"
            onClick={sendAll}
            disabled={sendingAll || !config.recipients?.length}
            className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
          >
            {sendingAll ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
            Send Now
          </button>
        </div>

        {/* Tabs */}
        <div className="flex gap-1 mb-6 border-b border-[#2d333b]">
          {[
            { id: 'settings', icon: Settings, label: 'Settings' },
            { id: 'history', icon: History, label: 'Send History' },
            { id: 'user-digest', icon: Users, label: 'User Digest' },
          ].map(t => (
            <button
              key={t.id}
              data-testid={`digest-tab-${t.id}`}
              onClick={() => setTab(t.id)}
              className={`flex items-center gap-2 px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-[1px] ${
                tab === t.id
                  ? 'text-[#22c55e] border-[#22c55e]'
                  : 'text-[#8b949e] border-transparent hover:text-[#c9d1d9]'
              }`}
            >
              <t.icon size={14} /> {t.label}
            </button>
          ))}
        </div>

        {tab === 'settings' && (
          <div className="space-y-6">
            {/* Enable/Disable */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-medium text-[#c9d1d9]">Digest Status</h3>
                  <p className="text-xs text-[#8b949e] mt-1">
                    {config.enabled ? 'Digest emails are active' : 'Digest emails are paused'}
                  </p>
                </div>
                <button
                  data-testid="toggle-digest-btn"
                  onClick={() => saveConfig({ enabled: !config.enabled })}
                  disabled={saving}
                  className={`relative w-12 h-6 rounded-full transition-colors ${config.enabled ? 'bg-[#22c55e]' : 'bg-[#2d333b]'}`}
                >
                  <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${config.enabled ? 'left-[26px]' : 'left-0.5'}`} />
                </button>
              </div>
            </div>

            {/* Frequency */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-medium text-[#c9d1d9] mb-3">Frequency</h3>
              <div className="grid grid-cols-3 gap-3">
                {FREQ_OPTIONS.map(f => (
                  <button
                    key={f.value}
                    data-testid={`freq-${f.value}`}
                    onClick={() => saveConfig({ frequency: f.value })}
                    disabled={saving}
                    className={`p-3 rounded-lg border text-left transition-all ${
                      config.frequency === f.value
                        ? 'border-[#22c55e] bg-[#22c55e]/10'
                        : 'border-[#2d333b] hover:border-[#444c56]'
                    }`}
                  >
                    <p className={`text-sm font-medium ${config.frequency === f.value ? 'text-[#22c55e]' : 'text-[#c9d1d9]'}`}>
                      {f.label}
                    </p>
                    <p className="text-xs text-[#8b949e] mt-0.5">{f.desc}</p>
                  </button>
                ))}
              </div>
            </div>

            {/* Recipients */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-medium text-[#c9d1d9] mb-3">Recipients ({config.recipients?.length || 0})</h3>
              <div className="flex gap-2 mb-4">
                <input
                  data-testid="add-recipient-input"
                  type="email"
                  value={newEmail}
                  onChange={e => setNewEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && addRecipient()}
                  placeholder="admin@example.com"
                  className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
                />
                <button
                  data-testid="add-recipient-btn"
                  onClick={addRecipient}
                  disabled={saving || !newEmail}
                  className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white px-3 py-2 rounded-lg text-sm transition-colors"
                >
                  <Plus size={14} /> Add
                </button>
              </div>
              <div className="space-y-2">
                {(config.recipients || []).map((email: string) => (
                  <div key={email} className="flex items-center justify-between py-2 px-3 bg-[#0d1117] rounded-lg">
                    <div className="flex items-center gap-2">
                      <Mail size={14} className="text-[#8b949e]" />
                      <span data-testid={`recipient-${email}`} className="text-sm text-[#c9d1d9]">{email}</span>
                    </div>
                    <button
                      data-testid={`remove-recipient-${email}`}
                      onClick={() => removeRecipient(email)}
                      className="text-[#ef4444] hover:text-[#dc2626] p-1 transition-colors"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                ))}
                {(!config.recipients || config.recipients.length === 0) && (
                  <p className="text-sm text-[#484f58] text-center py-3">No recipients added yet</p>
                )}
              </div>
            </div>

            {/* Send Test */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-medium text-[#c9d1d9] mb-3">Send Test Digest</h3>
              <div className="flex gap-2">
                <input
                  data-testid="test-email-input"
                  type="email"
                  value={testEmail}
                  onChange={e => setTestEmail(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && sendTest()}
                  placeholder="your@email.com"
                  className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
                />
                <button
                  data-testid="send-test-btn"
                  onClick={sendTest}
                  disabled={sending || !testEmail}
                  className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {sending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Test
                </button>
              </div>
              {testResult && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${testResult.success ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {testResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  {testResult.message}
                </div>
              )}
            </div>
          </div>
        )}

        {tab === 'history' && (
          <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
            {logs.length > 0 ? (
              <table className="w-full">
                <thead>
                  <tr className="border-b border-[#2d333b]">
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Sent At</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Frequency</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Recipients</th>
                    <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {logs.map((log: DigestLogData, i: number) => {
                    const success = (log.results || []).filter((r: { status: string }) => r.status === 'sent').length;
                    const failed = (log.results || []).filter((r: { status: string }) => r.status === 'failed').length;
                    return (
                      <tr key={i} className="border-b border-[#2d333b]/50">
                        <td className="px-4 py-3 text-xs text-[#c9d1d9]">{new Date(log.sent_at).toLocaleString()}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs px-2 py-0.5 rounded-full bg-[#3b82f620] text-[#3b82f6] capitalize">{log.frequency}</span>
                        </td>
                        <td className="px-4 py-3 text-sm text-[#c9d1d9]">{log.recipients_count}</td>
                        <td className="px-4 py-3">
                          <span className="text-xs text-[#22c55e]">{success} sent</span>
                          {failed > 0 && <span className="text-xs text-[#ef4444] ml-2">{failed} failed</span>}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            ) : (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <Clock size={24} className="text-[#484f58] mb-3" />
                <p className="text-sm text-[#8b949e]">No digests sent yet</p>
                <p className="text-xs text-[#484f58] mt-1">Send a test or enable automatic sending</p>
              </div>
            )}
          </div>
        )}
        {tab === 'user-digest' && (
          <div className="space-y-6">
            {/* User Digest Controls */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-medium text-[#c9d1d9] mb-1">User Weekly Digest</h3>
              <p className="text-xs text-[#8b949e] mb-4">
                Send personalized learning summaries to users — includes streak, XP, leaderboard rank, and course recommendations.
              </p>
              <div className="flex flex-wrap gap-3">
                <button
                  data-testid="send-user-digest-all"
                  onClick={sendUserDigestAll}
                  disabled={userDigestSending}
                  className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 text-white font-medium px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {userDigestSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send to All Users
                </button>
              </div>
            </div>

            {/* Test User Digest */}
            <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <h3 className="text-sm font-medium text-[#c9d1d9] mb-3">Send Test Digest</h3>
              <p className="text-xs text-[#8b949e] mb-3">Enter a user&apos;s email to send them a preview of their weekly digest.</p>
              <div className="flex gap-2">
                <input
                  data-testid="user-digest-test-email"
                  value={userTestEmail}
                  onChange={e => setUserTestEmail(e.target.value)}
                  placeholder="user@example.com"
                  className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58]"
                />
                <button
                  data-testid="user-digest-send-test"
                  onClick={sendUserDigestTest}
                  disabled={userTestSending || !userTestEmail}
                  className="flex items-center gap-1.5 bg-[#3b82f6] hover:bg-[#2563eb] disabled:opacity-40 text-white px-4 py-2 rounded-lg text-sm transition-colors"
                >
                  {userTestSending ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                  Send Test
                </button>
              </div>
              {userTestResult && (
                <div className={`mt-3 flex items-center gap-2 text-sm ${userTestResult.success ? 'text-[#22c55e]' : 'text-[#ef4444]'}`}>
                  {userTestResult.success ? <Check size={14} /> : <AlertCircle size={14} />}
                  {userTestResult.message}
                </div>
              )}
            </div>

            {/* User Digest Logs */}
            <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
              <div className="px-4 py-3 border-b border-[#2d333b]">
                <h3 className="text-sm font-medium text-[#c9d1d9]">Send History</h3>
              </div>
              {userDigestLogs.length > 0 ? (
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-[#2d333b]">
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Sent At</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Users</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Sent</th>
                      <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Failed</th>
                    </tr>
                  </thead>
                  <tbody>
                    {userDigestLogs.map((log, i) => (
                      <tr key={i} className="border-b border-[#2d333b]/50">
                        <td className="px-4 py-3 text-xs text-[#c9d1d9]">{new Date(log.sent_at).toLocaleString()}</td>
                        <td className="px-4 py-3 text-sm text-[#c9d1d9]">{log.total_users}</td>
                        <td className="px-4 py-3 text-xs text-[#22c55e]">{log.sent}</td>
                        <td className="px-4 py-3 text-xs text-[#ef4444]">{log.failed || 0}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center">
                  <Clock size={24} className="text-[#484f58] mb-3" />
                  <p className="text-sm text-[#8b949e]">No user digests sent yet</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default EmailDigest;
