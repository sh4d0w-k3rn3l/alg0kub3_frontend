'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Brain, Users, BookOpen, TrendingUp, Loader2 } from 'lucide-react';

interface TutorUsageData { total_flashcards?: number; mastered?: number; needs_review?: number; unique_users?: number; creation_trend?: { date: string; count: number }[]; top_topics?: { topic: string; count: number }[]; top_users?: { user_name: string; user_email: string; count: number }[]; }

const TutorUsage = () => {
  const [data, setData] = useState<TutorUsageData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    api.get<TutorUsageData>('/admin/tutor-usage', { signal: ac.signal })
      .then(res => { if (!ac.signal.aborted) setData(res.data); })
      .catch(handleApiError)
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 data-testid="tutor-usage-title" className="text-2xl font-bold text-white">AI Tutor Usage</h1>
            <p className="text-sm text-[#8b949e]">Flashcard and tutor analytics</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Brain, label: 'Total Flashcards', value: data?.total_flashcards || 0, color: '#8b5cf6' },
            { icon: TrendingUp, label: 'Mastered', value: data?.mastered || 0, color: '#22c55e' },
            { icon: BookOpen, label: 'Needs Review', value: data?.needs_review || 0, color: '#f59e0b' },
            { icon: Users, label: 'Unique Users', value: data?.unique_users || 0, color: '#3b82f6' },
          ].map(s => (
            <div key={s.label} className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
              <div className="w-9 h-9 rounded-lg flex items-center justify-center mb-3" style={{ backgroundColor: `${s.color}18` }}>
                <s.icon size={18} style={{ color: s.color }} />
              </div>
              <p className="text-2xl font-bold text-white">{s.value}</p>
              <p className="text-xs text-[#8b949e] mt-1">{s.label}</p>
            </div>
          ))}
        </div>

        {/* Creation Trend */}
        <div className="border border-[#2d333b] rounded-xl p-5 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Flashcard Creation (30d)</h3>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data?.creation_trend || []}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="count" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Top Topics */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Popular Topics</h3>
            <div className="space-y-2">
              {(data?.top_topics || []).map((t: { topic: string; count: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <span className="text-sm text-[#c9d1d9]">{t.topic}</span>
                  <span className="text-sm font-mono text-[#8b5cf6]">{t.count}</span>
                </div>
              ))}
              {(!data?.top_topics || data.top_topics.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No topic data</p>
              )}
            </div>
          </div>

          {/* Top Users */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Most Active Users</h3>
            <div className="space-y-2">
              {(data?.top_users || []).map((u: { user_name: string; user_email: string; count: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div>
                    <p className="text-sm text-[#c9d1d9]">{u.user_name}</p>
                    <p className="text-xs text-[#484f58]">{u.user_email}</p>
                  </div>
                  <span className="text-sm font-mono text-[#3b82f6]">{u.count} cards</span>
                </div>
              ))}
              {(!data?.top_users || data.top_users.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No user data</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TutorUsage;
