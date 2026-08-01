'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import {
  Settings, User, Bell, Mail, Sparkles, Save, Check, Loader2,
  Code, Brain, Globe, Database, Cpu, Rocket,
} from 'lucide-react';
import { api } from '@/lib/api';
import PageHeader from './PageHeader';

interface InterestOption {
  id: string;
  label: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  color: string;
}

const INTEREST_OPTIONS: InterestOption[] = [
  { id: 'python', label: 'Python', icon: Code, color: '#3572A5' },
  { id: 'ai-ml', label: 'AI & ML', icon: Brain, color: '#f59e0b' },
  { id: 'web-dev', label: 'Web Dev', icon: Globe, color: '#3b82f6' },
  { id: 'dsa', label: 'DSA', icon: Database, color: '#22c55e' },
  { id: 'system-design', label: 'System Design', icon: Cpu, color: '#8b5cf6' },
  { id: 'devops', label: 'DevOps', icon: Rocket, color: '#ef4444' },
];

const NOTIF_TYPES: { key: string; label: string; desc: string }[] = [
  { key: 'streak_milestones', label: 'Streak milestones', desc: 'When you hit 3, 7, 30+ day streaks' },
  { key: 'leaderboard_rankup', label: 'Leaderboard rank-ups', desc: 'When you climb into top 20, 10, 5, 3, or #1' },
  { key: 'comment_replies', label: 'Comment replies', desc: 'When someone replies to your discussion comment' },
  { key: 'announcements', label: 'Announcements', desc: 'Platform-wide updates and new course launches' },
];

const Toggle = ({ checked, onChange, testId }: { checked: boolean; onChange: (val: boolean) => void; testId?: string }) => (
  <button
    data-testid={testId}
    onClick={() => onChange(!checked)}
    className="relative w-10 h-5 rounded-full transition-colors flex-shrink-0"
    style={{ backgroundColor: checked ? '#22c55e' : '#484f58' }}
  >
    <div
      className="absolute top-0.5 w-4 h-4 rounded-full bg-white transition-transform shadow-sm"
      style={{ left: checked ? '22px' : '2px' }}
    />
  </button>
);

const SectionCard = ({ icon: Icon, title, children, colors }: {
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  title: string;
  children: React.ReactNode;
  colors: Record<string, string>;
}) => (
  <div className="border rounded-xl p-5" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
    <div className="flex items-center gap-2 mb-4">
      <Icon size={16} style={{ color: '#22c55e' }} />
      <h3 className="text-sm font-bold" style={{ color: colors.text }}>{title}</h3>
    </div>
    {children}
  </div>
);

interface NotifPrefs {
  streak_milestones: boolean;
  leaderboard_rankup: boolean;
  comment_replies: boolean;
  announcements: boolean;
  [key: string]: boolean;
}

const UserSettings = () => {
  const { colors } = useTheme();
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();

  const [name, setName] = useState('');
  const [emailDigest, setEmailDigest] = useState(true);
  const [notifPrefs, setNotifPrefs] = useState<NotifPrefs>({
    streak_milestones: true,
    leaderboard_rankup: true,
    comment_replies: true,
    announcements: true,
  });
  const [interests, setInterests] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState<string | null>(null);

  const [prevUser, setPrevUser] = useState(user);
  if (user && user !== prevUser) {
    setPrevUser(user);
    setName(user.name || '');
  }

  const fetchSettings = useCallback(async (signal?: AbortSignal) => {
    try {
      const [prefsRes, onbRes] = await Promise.all([
        api.get<{ email_digest: boolean; notification_prefs: NotifPrefs }>(`/user/email-preferences`, { signal }),
        api.get<{ interests: string[] }>(`/user/onboarding`, { signal }).catch(() => ({ data: { interests: [] as string[] } })),
      ]);
      if (signal?.aborted) return;
      setEmailDigest(prefsRes.data.email_digest);
      setNotifPrefs(prefsRes.data.notification_prefs || {});
      setInterests(onbRes.data.interests || []);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    if (authLoading) return;
    if (!user) { router.push('/login'); return; }
    const ac = new AbortController();
    const load = async () => {
      await fetchSettings(ac.signal);
    };
    void load();
    return () => ac.abort();
  }, [user, authLoading, router, fetchSettings]);

  const saveProfile = async () => {
    setSaving('profile');
    try {
      await api.post(`/user/update-profile`, { name });
    } catch { /* ignore */ }
    setTimeout(() => setSaving(null), 800);
  };

  const saveEmailPrefs = async (digest: boolean, prefs: NotifPrefs) => {
    setSaving('email');
    try {
      await api.post(`/user/email-preferences`, {
        email_digest: digest,
        notification_prefs: prefs,
      });
    } catch { /* ignore */ }
    setTimeout(() => setSaving(null), 800);
  };

  const toggleDigest = (val: boolean) => {
    setEmailDigest(val);
    saveEmailPrefs(val, notifPrefs);
  };

  const toggleNotif = (key: string, val: boolean) => {
    const updated = { ...notifPrefs, [key]: val };
    setNotifPrefs(updated);
    saveEmailPrefs(emailDigest, updated);
  };

  const toggleInterest = (id: string) => {
    setInterests(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const saveInterests = async () => {
    setSaving('interests');
    try {
      await api.post(`/user/onboarding`, { interests });
    } catch { /* ignore */ }
    setTimeout(() => setSaving(null), 800);
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <Loader2 size={24} className="animate-spin" style={{ color: '#22c55e' }} />
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />
      <div className="max-w-2xl mx-auto px-4 py-8">
        <div className="flex items-center gap-2.5 mb-6">
          <Settings size={20} style={{ color: '#22c55e' }} />
          <h1 className="text-xl font-bold" style={{ color: colors.text }}>Settings</h1>
        </div>

        <div className="space-y-5">
          <SectionCard icon={User} title="Profile" colors={colors}>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textMuted }}>Display Name</label>
                <input
                  data-testid="settings-name"
                  value={name}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => setName(e.target.value)}
                  maxLength={50}
                  className="w-full px-3 py-2 rounded-lg border text-sm outline-none transition-colors"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.text }}
                  onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = '#22c55e'}
                  onBlur={(e: React.FocusEvent<HTMLInputElement>) => e.target.style.borderColor = colors.border}
                />
              </div>
              <div>
                <label className="text-xs font-medium mb-1 block" style={{ color: colors.textMuted }}>Email</label>
                <input
                  data-testid="settings-email"
                  value={user?.email || ''}
                  readOnly
                  className="w-full px-3 py-2 rounded-lg border text-sm cursor-not-allowed opacity-60"
                  style={{ backgroundColor: colors.bg, borderColor: colors.border, color: colors.textMuted }}
                />
              </div>
              <button
                data-testid="save-profile"
                onClick={saveProfile}
                disabled={saving === 'profile'}
                className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
                style={{ backgroundColor: saving === 'profile' ? '#16a34a' : '#22c55e', color: '#fff' }}
              >
                {saving === 'profile' ? <Check size={14} /> : <Save size={14} />}
                {saving === 'profile' ? 'Saved' : 'Save'}
              </button>
            </div>
          </SectionCard>

          <SectionCard icon={Mail} title="Email Preferences" colors={colors}>
            <div className="flex items-center justify-between py-2">
              <div>
                <p className="text-sm font-medium" style={{ color: colors.text }}>Weekly learning digest</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>Streak, XP, leaderboard rank, and course recommendations</p>
              </div>
              <Toggle checked={emailDigest} onChange={toggleDigest} testId="toggle-email-digest" />
            </div>
          </SectionCard>

          <SectionCard icon={Bell} title="Notification Preferences" colors={colors}>
            <div className="space-y-1">
              {NOTIF_TYPES.map(nt => (
                <div key={nt.key} className="flex items-center justify-between py-2.5 border-b last:border-0" style={{ borderColor: colors.border + '40' }}>
                  <div>
                    <p className="text-sm font-medium" style={{ color: colors.text }}>{nt.label}</p>
                    <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>{nt.desc}</p>
                  </div>
                  <Toggle
                    checked={notifPrefs[nt.key] !== false}
                    onChange={(val: boolean) => toggleNotif(nt.key, val)}
                    testId={`toggle-${nt.key}`}
                  />
                </div>
              ))}
            </div>
          </SectionCard>

          <SectionCard icon={Sparkles} title="Learning Interests" colors={colors}>
            <p className="text-xs mb-3" style={{ color: colors.textMuted }}>Your interests power course recommendations. Select what you want to learn.</p>
            <div className="flex flex-wrap gap-2 mb-4">
              {INTEREST_OPTIONS.map(opt => {
                const Icon = opt.icon;
                const active = interests.includes(opt.id);
                return (
                  <button
                    key={opt.id}
                    data-testid={`interest-${opt.id}`}
                    onClick={() => toggleInterest(opt.id)}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition-all"
                    style={{
                      backgroundColor: active ? `${opt.color}15` : 'transparent',
                      borderColor: active ? opt.color : colors.border,
                      color: active ? opt.color : colors.textMuted,
                    }}
                  >
                    <Icon size={13} />
                    {opt.label}
                  </button>
                );
              })}
            </div>
            <button
              data-testid="save-interests"
              onClick={saveInterests}
              disabled={saving === 'interests'}
              className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-all"
              style={{ backgroundColor: saving === 'interests' ? '#16a34a' : '#22c55e', color: '#fff' }}
            >
              {saving === 'interests' ? <Check size={14} /> : <Save size={14} />}
              {saving === 'interests' ? 'Saved' : 'Save Interests'}
            </button>
          </SectionCard>
        </div>
      </div>
    </div>
  );
};

export default UserSettings;
