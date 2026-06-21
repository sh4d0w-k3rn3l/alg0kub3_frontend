'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, Brain, Target, TrendingUp, AlertTriangle, Loader2 } from 'lucide-react';

const QuizAnalytics = () => {
  const [data, setData] = useState<QuizAnalyticsData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    api.get<QuizAnalyticsData>('/admin/quiz-analytics', { signal: ac.signal })
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
            <h1 data-testid="quiz-analytics-title" className="text-2xl font-bold text-white">Quiz Analytics</h1>
            <p className="text-sm text-[#8b949e]">Performance insights</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: Brain, label: 'Total Quizzes', value: data?.total_quizzes || 0, color: '#8b5cf6' },
            { icon: Target, label: 'Total Attempts', value: data?.total_attempts || 0, color: '#3b82f6' },
            { icon: TrendingUp, label: 'Pass Rate', value: `${data?.pass_rate || 0}%`, color: '#22c55e' },
            { icon: AlertTriangle, label: 'Avg Score', value: `${data?.avg_score || 0}%`, color: '#f59e0b' },
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

        {/* Attempts Trend */}
        <div className="border border-[#2d333b] rounded-xl p-5 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Quiz Attempts (30d)</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={data?.attempts_trend || []}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
              <Bar dataKey="total" fill="#3b82f6" radius={[4, 4, 0, 0]} name="Total" />
              <Bar dataKey="passed" fill="#22c55e" radius={[4, 4, 0, 0]} name="Passed" />
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Hardest Quizzes */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Hardest Quizzes (Lowest Avg Score)</h3>
            <div className="space-y-2">
              {(data?.hardest_quizzes || []).map((q, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div>
                    <p className="text-sm text-[#c9d1d9]">{q.quiz_title}</p>
                    <p className="text-xs text-[#484f58]">{q.section_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono" style={{ color: q.avg_score < 50 ? '#ef4444' : q.avg_score < 70 ? '#f59e0b' : '#22c55e' }}>{q.avg_score}%</p>
                    <p className="text-xs text-[#484f58]">{q.attempts} attempts</p>
                  </div>
                </div>
              ))}
              {(!data?.hardest_quizzes || data.hardest_quizzes.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No quiz data yet</p>
              )}
            </div>
          </div>

          {/* Most Popular */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Most Popular Quizzes</h3>
            <div className="space-y-2">
              {(data?.popular_quizzes || []).map((q, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div>
                    <p className="text-sm text-[#c9d1d9]">{q.quiz_title}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm font-mono text-[#3b82f6]">{q.attempts} attempts</p>
                    <p className="text-xs text-[#484f58]">Avg: {q.avg_score}%</p>
                  </div>
                </div>
              ))}
              {(!data?.popular_quizzes || data.popular_quizzes.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No quiz data yet</p>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default QuizAnalytics;
