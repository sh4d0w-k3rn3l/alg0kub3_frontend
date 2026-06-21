'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { ArrowLeft, Trophy, Medal, Crown, User, Loader2 } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const RANK_STYLES: Record<number, { bg: string; border: string; icon: React.ComponentType<{ size?: number; className?: string }>; color: string }> = {
  1: { bg: 'bg-[#f59e0b]/10', border: 'border-[#f59e0b]/30', icon: Crown, color: '#f59e0b' },
  2: { bg: 'bg-[#94a3b8]/10', border: 'border-[#94a3b8]/30', icon: Medal, color: '#94a3b8' },
  3: { bg: 'bg-[#cd7f32]/10', border: 'border-[#cd7f32]/30', icon: Medal, color: '#cd7f32' },
};

const LeaderboardPage = () => {
  const [data, setData] = useState<Record<string, any> | null>(null);
  const [period, setPeriod] = useState('all');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    setLoading(true);
    api.get<Record<string, any>>(`/gamification/leaderboard?period=${period}`)
      .then(res => setData(res.data))
      .catch(handleApiError)
      .finally(() => setLoading(false));
  }, [period]);

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      <div className="max-w-3xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => router.back()} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="leaderboard-title" className="text-2xl font-bold text-white flex items-center gap-2">
              <Trophy size={24} className="text-[#f59e0b]" /> Leaderboard
            </h1>
            <p className="text-sm text-[#8b949e]">Top learners ranked by XP</p>
          </div>
          <div className="flex gap-1 bg-[#161b22] border border-[#2d333b] rounded-lg p-1">
            {['all', 'weekly'].map(p => (
              <button
                key={p}
                data-testid={`period-${p}`}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded-md text-xs font-medium transition-colors capitalize ${
                  period === p ? 'bg-[#22c55e] text-white' : 'text-[#8b949e] hover:text-[#c9d1d9]'
                }`}
              >
                {p === 'all' ? 'All Time' : 'This Week'}
              </button>
            ))}
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-16"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>
        ) : (
          <div className="space-y-2">
            {(data?.leaderboard || []).map((entry: any, i: number) => {
              const rankStyle = RANK_STYLES[entry.rank];
              const RankIcon = rankStyle?.icon;
              return (
                <div
                  key={entry.user_id}
                  data-testid={`lb-row-${entry.rank}`}
                  className={`flex items-center gap-4 px-5 py-4 rounded-xl border transition-colors ${
                    rankStyle
                      ? `${rankStyle.bg} ${rankStyle.border}`
                      : 'border-[#2d333b] hover:border-[#444c56]'
                  }`}
                  style={{ backgroundColor: rankStyle ? undefined : '#161b22' }}
                >
                  <div className="w-10 text-center shrink-0">
                    {RankIcon ? (
                      <span style={{ color: rankStyle.color }}><RankIcon size={20} className="mx-auto" /></span>
                    ) : (
                      <span className="text-lg font-bold text-[#484f58]">{entry.rank}</span>
                    )}
                  </div>

                  {entry.picture ? (
                    <img src={entry.picture} alt="" className="w-10 h-10 rounded-full shrink-0" />
                  ) : (
                    <div className="w-10 h-10 rounded-full bg-[#2d333b] flex items-center justify-center shrink-0">
                      <User size={16} className="text-[#8b949e]" />
                    </div>
                  )}

                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium text-[#c9d1d9] truncate">{entry.name || 'Anonymous'}</p>
                    <p className="text-xs text-[#484f58]">{entry.badges || 0} badges</p>
                  </div>

                  <div className="text-right shrink-0">
                    <p className="text-lg font-bold text-[#22c55e]">{(entry.xp || 0).toLocaleString()}</p>
                    <p className="text-xs text-[#484f58]">XP</p>
                  </div>
                </div>
              );
            })}
            {(!data?.leaderboard || data.leaderboard.length === 0) && (
              <div className="text-center py-16 border border-[#2d333b] rounded-xl" style={{ backgroundColor: '#161b22' }}>
                <Trophy size={24} className="text-[#484f58] mx-auto mb-3" />
                <p className="text-sm text-[#8b949e]">No one on the leaderboard yet</p>
                <p className="text-xs text-[#484f58] mt-1">Complete lessons and quizzes to earn XP!</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LeaderboardPage;
