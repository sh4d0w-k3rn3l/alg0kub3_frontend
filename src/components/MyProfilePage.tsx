'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/context/AuthContext';
import { api } from '@/lib/api';
import { motion } from 'framer-motion';
import {
  ArrowLeft, Trophy, Medal, Award, Star, Crown, Zap, Target,
  BookOpen, Brain, Terminal, Globe, GraduationCap, Loader2, Lock,
  Flame, Shield, ChevronRight,
} from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const TIER_CONFIG: Record<string, { color: string; bg: string; border: string; label: string }> = {
  bronze: { color: '#cd7f32', bg: 'rgba(205,127,50,0.12)', border: 'rgba(205,127,50,0.25)', label: 'Bronze' },
  silver: { color: '#94a3b8', bg: 'rgba(148,163,184,0.12)', border: 'rgba(148,163,184,0.25)', label: 'Silver' },
  gold: { color: '#f59e0b', bg: 'rgba(245,158,11,0.12)', border: 'rgba(245,158,11,0.25)', label: 'Gold' },
};

const ICON_MAP: Record<string, React.ComponentType<{ size?: number; className?: string }>> = {
  'book-open': BookOpen, 'brain': Brain, 'target': Target, 'zap': Zap,
  'trophy': Trophy, 'terminal': Terminal, 'globe': Globe, 'sword': Shield,
  'crown': Crown, 'award': Award, 'medal': Medal, 'star': Star,
  'graduation-cap': GraduationCap,
};

const CATEGORY_LABELS: Record<string, string> = { course: 'Learning', quiz: 'Quizzes', code: 'Coding', community: 'Community' };

const BadgeCard = ({ badge, index }: { badge: any; index: number }) => {
  const tier = TIER_CONFIG[badge.tier] || TIER_CONFIG.bronze;
  const Icon = ICON_MAP[badge.icon] || Award;
  const earned = badge.earned;

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.04, duration: 0.3 }}
      data-testid={`badge-${badge.badge_id}`}
      className={`relative rounded-xl border p-4 transition-all duration-300 ${
        earned ? 'hover:scale-[1.03]' : 'opacity-40'
      }`}
      style={{
        backgroundColor: earned ? tier.bg : '#161b22',
        borderColor: earned ? tier.border : '#2d333b',
      }}
    >
      {earned && (
        <div className="absolute top-2 right-2">
          <div className="w-2 h-2 rounded-full" style={{ backgroundColor: tier.color, boxShadow: `0 0 8px ${tier.color}` }} />
        </div>
      )}
      <div className="flex items-start gap-3">
        <div
          className="w-10 h-10 rounded-lg flex items-center justify-center shrink-0"
          style={{ backgroundColor: earned ? `${tier.color}20` : '#21262d' }}
        >
          {earned ? (
            <span style={{ color: tier.color }}><Icon size={18} /></span>
          ) : (
            <Lock size={14} className="text-[#484f58]" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-semibold truncate" style={{ color: earned ? '#e6edf3' : '#484f58' }}>
            {badge.name}
          </p>
          <p className="text-xs mt-0.5" style={{ color: earned ? '#8b949e' : '#30363d' }}>
            {badge.description}
          </p>
          <div className="flex items-center gap-2 mt-2">
            <span
              className="text-[10px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded"
              style={{ color: tier.color, backgroundColor: `${tier.color}15` }}
            >
              {tier.label}
            </span>
            {earned && badge.awarded_at && (
              <span className="text-[10px] text-[#484f58]">
                {new Date(badge.awarded_at).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
};

const StatCard = ({ icon: Icon, label, value, color }: { icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>; label: string; value: React.ReactNode; color: string }) => (
  <div className="rounded-xl border border-[#2d333b] p-4" style={{ backgroundColor: '#161b22' }}>
    <div className="flex items-center gap-2 mb-2">
      <span style={{ color }}><Icon size={14} /></span>
      <span className="text-xs text-[#8b949e]">{label}</span>
    </div>
    <p className="text-2xl font-bold" style={{ color }}>{value}</p>
  </div>
);

const MyProfilePage = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('all');
  const { user } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!user) { router.push('/login'); return; }
    const ac = new AbortController();
    api.get<Record<string, any>>(`/gamification/profile`, { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setData(res.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        router.push('/login');
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [user, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (!data) return null;

  const { xp, rank, badges_earned, badges_total, all_badges, stats } = data;
  const xpToNext = Math.ceil(xp / 500) * 500;
  const xpProgress = xp > 0 ? (xp % 500) / 500 * 100 : 0;

  const categories = ['all', ...Object.keys(CATEGORY_LABELS)];
  const filtered = activeCategory === 'all'
    ? all_badges
    : all_badges.filter((b: any) => b.category === activeCategory);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button data-testid="profile-back-btn" onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="profile-title" className="text-2xl font-bold text-white">My Profile</h1>
            <p className="text-sm text-[#8b949e]">Your achievements and progress</p>
          </div>
          <Link
            data-testid="profile-leaderboard-link"
            href="/leaderboard"
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#2d333b] text-[#8b949e] hover:text-[#22c55e] hover:border-[#22c55e]/30 transition-colors"
          >
            <Trophy size={13} /> Leaderboard <ChevronRight size={11} />
          </Link>
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.4 }}
          data-testid="profile-xp-card"
          className="rounded-2xl border border-[#22c55e]/20 p-6 mb-8"
          style={{ backgroundColor: 'rgba(34,197,94,0.04)' }}
        >
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-6">
            <div className="flex items-center gap-4">
              {user?.picture ? (
                <img src={user.picture} alt="" className="w-16 h-16 rounded-full border-2 border-[#22c55e]/30" />
              ) : (
                <div className="w-16 h-16 rounded-full bg-[#22c55e]/10 border-2 border-[#22c55e]/30 flex items-center justify-center">
                  <span className="text-2xl font-bold text-[#22c55e]">{user?.name?.[0] || '?'}</span>
                </div>
              )}
              <div>
                <p className="text-lg font-bold text-white">{user?.name || 'Learner'}</p>
                <div className="flex items-center gap-2 mt-1">
                  <Crown size={14} className="text-[#f59e0b]" />
                  <span className="text-sm font-medium text-[#f59e0b]">Rank #{rank}</span>
                </div>
              </div>
            </div>

            <div className="flex-1 w-full sm:w-auto">
              <div className="flex items-baseline justify-between mb-2">
                <div className="flex items-baseline gap-1">
                  <span data-testid="profile-xp-value" className="text-3xl font-extrabold text-[#22c55e]">{xp.toLocaleString()}</span>
                  <span className="text-sm text-[#484f58]">XP</span>
                </div>
                <span className="text-xs text-[#484f58]">Next: {xpToNext.toLocaleString()} XP</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${xpProgress}%` }}
                  transition={{ duration: 0.8, ease: 'easeOut' }}
                  className="h-full rounded-full"
                  style={{ backgroundColor: '#22c55e', boxShadow: '0 0 12px rgba(34,197,94,0.4)' }}
                />
              </div>
            </div>
          </div>
        </motion.div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-8">
          <StatCard icon={BookOpen} label="Lessons" value={stats.lessons} color="#3b82f6" />
          <StatCard icon={Brain} label="Quizzes Passed" value={stats.quizzes_passed} color="#a855f7" />
          <StatCard icon={GraduationCap} label="Certificates" value={stats.certificates} color="#f59e0b" />
          <StatCard icon={Flame} label="Quiz Streak" value={stats.quiz_streak} color="#ef4444" />
        </div>

        <div className="mb-6">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Award size={18} className="text-[#f59e0b]" /> Badges
              </h2>
              <p className="text-xs text-[#484f58] mt-0.5">
                {badges_earned} of {badges_total} earned
              </p>
            </div>
          </div>

          <div data-testid="badge-category-tabs" className="flex gap-1 mb-5 overflow-x-auto pb-1">
            {categories.map((cat: string) => (
              <button
                key={cat}
                data-testid={`badge-tab-${cat}`}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 rounded-lg text-xs font-medium capitalize whitespace-nowrap transition-colors ${
                  activeCategory === cat
                    ? 'bg-[#22c55e] text-white'
                    : 'text-[#8b949e] hover:text-[#c9d1d9] bg-[#161b22] border border-[#2d333b]'
                }`}
              >
                {cat === 'all' ? `All (${all_badges.length})` : `${CATEGORY_LABELS[cat]} (${all_badges.filter((b: any) => b.category === cat).length})`}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filtered.sort((a: any, b: any) => (b.earned ? 1 : 0) - (a.earned ? 1 : 0)).map((badge: any, i: number) => (
              <BadgeCard key={badge.badge_id} badge={badge} index={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MyProfilePage;
