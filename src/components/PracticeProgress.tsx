'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import {
  ArrowLeft, Trophy, Target, Clock, Flame, TrendingUp, Layers,
  CheckCircle, AlertCircle, Loader2, BarChart3, Calendar, Zap,
  ArrowRight, GitBranch,
} from 'lucide-react';

const DIFF_COLORS: Record<string, string> = { Easy: '#4ade80', Medium: '#fbbf24', Hard: '#f87171' };
const SCORE_COLORS: Record<string, string> = { '1-3': '#ef4444', '4-5': '#f59e0b', '6-7': '#3b82f6', '8-10': '#22c55e' };

const StatCard = ({ icon: Icon, label, value, sub, color, testId }: { icon: React.ComponentType<{ size?: number; className?: string }>; label: string; value: React.ReactNode; sub?: string; color: string; testId?: string }) => (
  <div data-testid={testId} className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
    <div className="flex items-center gap-2.5 mb-3">
      <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
        <span style={{ color }}><Icon size={16} /></span>
      </div>
      <span className="text-xs font-medium text-[#8b949e] uppercase tracking-wider">{label}</span>
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    {sub && <p className="text-xs text-[#484f58] mt-1">{sub}</p>}
  </div>
);

const SectionCard = ({ type, title, icon: Icon, color, data, router: nav }: { type: string; title: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string; data: Record<string, unknown>; router: ReturnType<typeof useRouter> }) => {
  const pct = (data.attempted as number) > 0 ? Math.round(((data.completed as number) / (data.attempted as number)) * 100) : 0;
  const path = type === 'lld' ? '/practice/lld' : '/system-design';
  return (
    <div data-testid={`progress-section-${type}`} className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-3 px-5 py-4 border-b border-[#2d333b]" style={{ backgroundColor: `${color}08` }}>
        <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}15` }}>
          <span style={{ color }}><Icon size={18} /></span>
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-bold text-white">{title}</h3>
          <p className="text-[11px] text-[#484f58]">{data.attempted as number} attempted, {data.completed as number} completed</p>
        </div>
        <button onClick={() => nav.push(path)} className="flex items-center gap-1 text-xs font-medium px-3 py-1.5 rounded-lg transition-colors hover:bg-[#21262d]" style={{ color }}>
          Practice <ArrowRight size={12} />
        </button>
      </div>
      <div className="p-5">
        <div className="grid grid-cols-3 gap-4 mb-4">
          <div>
            <p className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Completion</p>
            <p className="text-lg font-bold text-white">{pct}%</p>
          </div>
          <div>
            <p className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Avg Score</p>
            <p className="text-lg font-bold" style={{ color: (data.avg_score as number) >= 6 ? '#22c55e' : (data.avg_score as number) >= 4 ? '#f59e0b' : '#ef4444' }}>
              {(data.avg_score as number | undefined) || '—'}<span className="text-xs text-[#484f58]">/10</span>
            </p>
          </div>
          <div>
            <p className="text-[10px] text-[#484f58] uppercase tracking-wider mb-1">Time</p>
            <p className="text-lg font-bold text-white">{data.total_time_min as number}<span className="text-xs text-[#484f58]"> min</span></p>
          </div>
        </div>
        <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden">
          <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: color }} />
        </div>
        {(data.by_difficulty as Record<string, number> | undefined) && Object.keys(data.by_difficulty as Record<string, number>).length > 0 && (
          <div className="flex gap-3 mt-4">
            {Object.entries(data.by_difficulty as Record<string, { completed: number; attempted: number }>).map(([diff, counts]) => (
              <div key={diff} className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full" style={{ backgroundColor: DIFF_COLORS[diff] }} />
                <span className="text-[10px] text-[#8b949e]">{diff}: {counts.completed}/{counts.attempted}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

const HeatmapGrid = ({ heatmap }: { heatmap: Record<string, number> }) => {
  const days = Object.entries(heatmap).sort((a, b) => a[0].localeCompare(b[0]));
  const maxVal = Math.max(1, ...days.map(d => d[1]));
  const weeks: [string, number][][] = [];
  for (let i = 0; i < days.length; i += 7) {
    weeks.push(days.slice(i, i + 7));
  }

  const getColor = (count: number) => {
    if (count === 0) return '#161b22';
    const intensity = Math.min(count / maxVal, 1);
    if (intensity <= 0.25) return '#0e4429';
    if (intensity <= 0.5) return '#006d32';
    if (intensity <= 0.75) return '#26a641';
    return '#39d353';
  };

  return (
    <div data-testid="progress-heatmap" className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-2 mb-4">
        <Calendar size={14} className="text-[#22c55e]" />
        <h3 className="text-sm font-bold text-white">Activity (Last 90 Days)</h3>
      </div>
      <div className="flex gap-[3px] overflow-x-auto pb-1">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map(([date, count]) => (
              <div key={date} title={`${date}: ${count} session${count !== 1 ? 's' : ''}`}
                className="w-[13px] h-[13px] rounded-sm transition-colors cursor-default"
                style={{ backgroundColor: getColor(count) }} />
            ))}
          </div>
        ))}
      </div>
      <div className="flex items-center gap-2 mt-3">
        <span className="text-[10px] text-[#484f58]">Less</span>
        {[0, 1, 2, 3, 4].map(i => (
          <div key={i} className="w-[10px] h-[10px] rounded-sm" style={{ backgroundColor: getColor(i === 0 ? 0 : (i / 4) * maxVal) }} />
        ))}
        <span className="text-[10px] text-[#484f58]">More</span>
      </div>
    </div>
  );
};

const ScoreDistribution = ({ dist }: { dist: Record<string, number> }) => {
  const total = Object.values(dist).reduce((a, b) => a + b, 0) || 1;
  return (
    <div data-testid="progress-score-dist" className="rounded-xl border border-[#2d333b] p-5" style={{ backgroundColor: '#161b22' }}>
      <div className="flex items-center gap-2 mb-4">
        <BarChart3 size={14} className="text-[#3b82f6]" />
        <h3 className="text-sm font-bold text-white">Score Distribution</h3>
      </div>
      <div className="space-y-3">
        {Object.entries(dist).map(([range, count]) => {
          const pct = Math.round((count / total) * 100);
          return (
            <div key={range}>
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs text-[#8b949e]">{range}</span>
                <span className="text-xs font-medium text-white">{count}</span>
              </div>
              <div className="w-full h-2 rounded-full bg-[#21262d] overflow-hidden">
                <div className="h-full rounded-full transition-all duration-500" style={{ width: `${pct}%`, backgroundColor: SCORE_COLORS[range] }} />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const RecentActivity = ({ items, router }: { items: Record<string, unknown>[]; router: ReturnType<typeof useRouter> }) => (
  <div data-testid="progress-recent-activity" className="rounded-xl border border-[#2d333b] overflow-hidden" style={{ backgroundColor: '#161b22' }}>
    <div className="flex items-center gap-2 px-5 py-3 border-b border-[#2d333b]">
      <Zap size={14} className="text-[#f59e0b]" />
      <h3 className="text-sm font-bold text-white">Recent Activity</h3>
    </div>
    <div className="divide-y divide-[#21262d]">
      {items.length === 0 && (
        <div className="p-8 text-center">
          <p className="text-sm text-[#484f58]">No activity yet. Start practicing!</p>
        </div>
      )}
      {items.map((item, i) => {
        const path = (item.type as string) === 'lld' ? `/practice/lld/${item.slug as string}` : `/system-design/${item.slug as string}`;
        const typeLabel = (item.type as string) === 'lld' ? 'LLD' : 'System Design';
        const typeColor = (item.type as string) === 'lld' ? '#a855f7' : '#3b82f6';
        const statusIcon = (item.status as string) === 'completed' ? <CheckCircle size={12} className="text-[#22c55e]" /> :
          (item.status as string) === 'in_progress' ? <Clock size={12} className="text-[#f59e0b]" /> :
          <AlertCircle size={12} className="text-[#484f58]" />;
        const timeAgo = _timeAgo(item.updated_at as string);
        return (
          <button key={i} data-testid={`progress-activity-${i}`} onClick={() => router.push(path)}
            className="w-full flex items-center gap-3 px-5 py-3 text-left hover:bg-[#21262d] transition-colors">
            {statusIcon}
            <div className="flex-1 min-w-0">
              <p className="text-sm text-[#c9d1d9] truncate">{item.title as string}</p>
              <div className="flex items-center gap-2 mt-0.5">
                <span className="text-[10px] font-medium px-1.5 py-0.5 rounded" style={{ color: typeColor, backgroundColor: `${typeColor}15` }}>{typeLabel}</span>
                <span className="text-[10px]" style={{ color: DIFF_COLORS[item.difficulty as string] }}>{item.difficulty as string}</span>
              </div>
            </div>
            <span className="text-[10px] text-[#484f58] shrink-0">{timeAgo}</span>
          </button>
        );
      })}
    </div>
  </div>
);

function _timeAgo(dateStr: string) {
  if (!dateStr) return '';
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d ago`;
  return `${Math.floor(days / 7)}w ago`;
}

export default function PracticeProgress() {
  const router = useRouter();
  const [data, setData] = useState<Record<string, unknown> | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    api.get<Record<string, unknown>>('/practice/progress', { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setData(res.data);
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        setData(null);
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: '#0d1117' }}>
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (!data) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center gap-3" style={{ backgroundColor: '#0d1117' }}>
        <AlertCircle size={32} className="text-[#484f58]" />
        <p className="text-sm text-[#8b949e]">Sign in to view your progress</p>
        <button onClick={() => router.push('/login')} className="px-4 py-2 rounded-lg text-xs font-medium bg-[#22c55e] text-white hover:bg-[#16a34a] transition-colors">Sign In</button>
      </div>
    );
  }

  const d = data as Record<string, unknown>;
  const overview = d.overview as Record<string, unknown>;
  const lld = d.lld as Record<string, unknown>;
  const sd = d.sd as Record<string, unknown>;
  const streak = d.streak as Record<string, unknown>;
  const heatmap = d.heatmap as Record<string, unknown>;
  const recent_activity = d.recent_activity as Record<string, unknown>[];
  const score_distribution = d.score_distribution as Record<string, number>;
  const formatTime = (mins: number) => mins >= 60 ? `${Math.floor(mins / 60)}h ${mins % 60}m` : `${mins}m`;

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="border-b border-[#2d333b]" style={{ backgroundColor: '#161b22' }}>
        <div className="max-w-6xl mx-auto px-6 py-4">
          <div className="flex items-center gap-3 mb-1">
            <button data-testid="progress-back-btn" onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors">
              <ArrowLeft size={16} />
            </button>
            <TrendingUp size={20} className="text-[#22c55e]" />
            <h1 className="text-lg font-bold text-white">Practice Progress</h1>
          </div>
          <p className="text-xs text-[#484f58] ml-10">Track your performance across all practice sections</p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-6 py-6 space-y-6">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard icon={Target} label="Problems Attempted" value={overview.total_attempted as number}
            sub={`${overview.total_completed as number} completed`} color="#3b82f6" testId="progress-stat-attempted" />
          <StatCard icon={Trophy} label="Average Score" value={`${overview.avg_score as number}/10`}
            sub={(overview.avg_score as number) >= 6 ? 'Above passing' : 'Below passing (6+)'}
            color={(overview.avg_score as number) >= 6 ? '#22c55e' : '#f59e0b'} testId="progress-stat-score" />
          <StatCard icon={Clock} label="Total Time" value={formatTime(overview.total_time_min as number)}
            sub="across all sessions" color="#a855f7" testId="progress-stat-time" />
          <StatCard icon={Flame} label="Current Streak"
            value={`${overview.current_streak as number} day${(overview.current_streak as number) !== 1 ? 's' : ''}`}
            sub={`Longest: ${overview.longest_streak as number} day${(overview.longest_streak as number) !== 1 ? 's' : ''}`}
            color={(streak.active_today as boolean) ? '#f97316' : '#484f58'} testId="progress-stat-streak" />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <SectionCard type="lld" title="Low-Level Design" icon={GitBranch} color="#a855f7" data={lld} router={router} />
          <SectionCard type="sd" title="System Design" icon={Layers} color="#3b82f6" data={sd} router={router} />
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          <div className="lg:col-span-2 space-y-4">
            <HeatmapGrid heatmap={heatmap as Record<string, number>} />
            <RecentActivity items={recent_activity} router={router} />
          </div>
          <div>
            <ScoreDistribution dist={score_distribution} />
          </div>
        </div>
      </div>
    </div>
  );
}
