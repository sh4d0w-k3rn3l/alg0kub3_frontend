'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  ArrowLeft, Trophy, Star, Zap, BookOpen, Brain, Terminal,
  Crown, Award, Target, Globe, Loader2, Lock,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'book-open': BookOpen, 'graduation-cap': Award, 'brain': Brain, 'target': Target,
  'zap': Zap, 'trophy': Trophy, 'terminal': Terminal, 'globe': Globe,
  'crown': Crown, 'award': Award, 'medal': Award, 'star': Star, 'sword': Zap,
};

const TIER_COLORS: Record<string, { bg: string; border: string; text: string }> = {
  bronze: { bg: '#cd7f3218', border: '#cd7f3240', text: '#cd7f32' },
  silver: { bg: '#94a3b818', border: '#94a3b840', text: '#94a3b8' },
  gold: { bg: '#f59e0b18', border: '#f59e0b40', text: '#f59e0b' },
};

interface BadgeItem {
  badge_id: string;
  name: string;
  description?: string;
  tier: string;
  icon: string;
  category?: string;
  earned: boolean;
  awarded_at?: string;
}

interface ProfileStats {
  lessons?: number;
  quizzes_passed?: number;
  certificates?: number;
  code_runs?: number;
}

interface ProfileData {
  xp: number;
  rank: number;
  badges_earned: number;
  badges_total: number;
  all_badges: BadgeItem[];
  new_badges?: BadgeItem[];
  stats?: ProfileStats;
}

const BadgesPage = () => {
  const [profile, setProfile] = useState<ProfileData | null>(null);
  const [loading, setLoading] = useState(true);
  const [newBadges, setNewBadges] = useState<BadgeItem[]>([]);
  const router = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    let timerId: ReturnType<typeof setTimeout> | null = null;
    api.get<ProfileData>('/gamification/profile', { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setProfile(res.data);
        const newB = res.data.new_badges;
        if (newB && newB.length > 0) {
          setNewBadges(newB);
          timerId = setTimeout(() => setNewBadges([]), 5000);
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      })
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => {
      if (timerId) clearTimeout(timerId);
      ac.abort();
    };
  }, []);

  if (loading) return <div className="flex items-center justify-center py-32" style={{ backgroundColor: '#0d1117' }}><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;

  if (!profile) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <div className="text-center">
          <p className="text-[#8b949e]">Login to view your badges and XP</p>
          <button onClick={() => router.push('/')} className="mt-3 text-[#22c55e] text-sm hover:underline">Go Home</button>
        </div>
      </div>
    );
  }

  const earned = (profile.all_badges || []).filter((b: BadgeItem) => b.earned);
  const locked = (profile.all_badges || []).filter((b: BadgeItem) => !b.earned);
  const stats: ProfileStats = profile.stats || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      {newBadges.length > 0 && (
        <div className="fixed top-4 right-4 z-50 space-y-2">
          {newBadges.map((b: BadgeItem, i: number) => (
            <div key={i} className="flex items-center gap-3 bg-[#161b22] border border-[#f59e0b]/40 rounded-xl px-4 py-3 shadow-xl animate-bounce">
              <Trophy size={18} className="text-[#f59e0b]" />
              <div>
                <p className="text-sm font-medium text-[#f59e0b]">Badge Unlocked!</p>
                <p className="text-xs text-[#c9d1d9]">{b.name}</p>
              </div>
            </div>
          ))}
        </div>
      )}

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="badges-title" className="text-2xl font-bold text-white">Your Achievements</h1>
            <p className="text-sm text-[#8b949e]">{profile.badges_earned} of {profile.badges_total} badges earned</p>
          </div>
          <button
            data-testid="view-leaderboard-btn"
            onClick={() => router.push('/leaderboard')}
            className="flex items-center gap-2 bg-[#f59e0b]/10 border border-[#f59e0b]/30 text-[#f59e0b] px-4 py-2 rounded-lg text-sm transition-colors hover:bg-[#f59e0b]/20"
          >
            <Trophy size={14} /> Leaderboard
          </button>
        </div>

        <div className="border border-[#2d333b] rounded-xl p-6 mb-8" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center justify-between mb-4">
            <div>
              <p data-testid="user-xp" className="text-4xl font-bold text-[#22c55e]">{(profile.xp || 0).toLocaleString()} <span className="text-lg text-[#8b949e]">XP</span></p>
              <p className="text-sm text-[#8b949e] mt-1">Rank #{profile.rank}</p>
            </div>
            <div className="grid grid-cols-4 gap-4 text-center">
              {[
                { label: 'Lessons', value: stats.lessons || 0, icon: BookOpen, color: '#22c55e' },
                { label: 'Quizzes', value: stats.quizzes_passed || 0, icon: Brain, color: '#8b5cf6' },
                { label: 'Certs', value: stats.certificates || 0, icon: Award, color: '#f59e0b' },
                { label: 'Code Runs', value: stats.code_runs || 0, icon: Terminal, color: '#3b82f6' },
              ].map(s => (
                <div key={s.label}>
                  <s.icon size={16} style={{ color: s.color }} className="mx-auto mb-1" />
                  <p className="text-lg font-bold text-white">{s.value}</p>
                  <p className="text-xs text-[#484f58]">{s.label}</p>
                </div>
              ))}
            </div>
          </div>
          <div className="w-full bg-[#2d333b] rounded-full h-2">
            <div
              className="h-2 rounded-full bg-gradient-to-r from-[#22c55e] to-[#06b6d4] transition-all"
              style={{ width: `${Math.min((profile.xp || 0) / 50, 100)}%` }}
            />
          </div>
        </div>

        <div className="mb-8">
          <h2 className="text-lg font-bold text-white mb-4">Earned ({earned.length})</h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {earned.map((b: BadgeItem) => {
              const tier = TIER_COLORS[b.tier] || TIER_COLORS.bronze;
              const Icon = ICON_MAP[b.icon] || Star;
              return (
                <div
                  key={b.badge_id}
                  data-testid={`badge-${b.badge_id}`}
                  className="border rounded-xl p-4 text-center transition-all hover:scale-105"
                  style={{ backgroundColor: tier.bg, borderColor: tier.border }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center" style={{ backgroundColor: `${tier.text}20` }}>
                    <span style={{ color: tier.text }}><Icon size={22} /></span>
                  </div>
                  <p className="text-sm font-medium text-[#c9d1d9]">{b.name}</p>
                  <p className="text-xs text-[#484f58] mt-0.5">{b.description}</p>
                  <p className="text-[10px] mt-1 capitalize" style={{ color: tier.text }}>{b.tier}</p>
                </div>
              );
            })}
          </div>
        </div>

        {locked.length > 0 && (
          <div>
            <h2 className="text-lg font-bold text-white mb-4">Locked ({locked.length})</h2>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
              {locked.map((b: BadgeItem) => (
                <div
                  key={b.badge_id}
                  data-testid={`badge-locked-${b.badge_id}`}
                  className="border border-[#2d333b] rounded-xl p-4 text-center opacity-50"
                  style={{ backgroundColor: '#161b22' }}
                >
                  <div className="w-12 h-12 rounded-full mx-auto mb-2 flex items-center justify-center bg-[#2d333b]">
                    <Lock size={18} className="text-[#484f58]" />
                  </div>
                  <p className="text-sm font-medium text-[#484f58]">{b.name}</p>
                  <p className="text-xs text-[#484f58] mt-0.5">{b.description}</p>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default BadgesPage;
