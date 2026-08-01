'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, BarChart, Bar } from 'recharts';
import {
  Users, TrendingUp, Award, BookOpen, Activity, DollarSign,
  Brain, Server, ChevronRight, Loader2, ArrowLeft, Mail,
  Terminal, Shield, Layers, Globe, Flame, Bell, Key, FolderArchive, Clock, FileText, MessageCircle, ThumbsUp, Layout, Zap,
} from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';

const StatCard = ({ icon: Icon, label, value, sub, color, onClick }: { icon: React.ComponentType<{ size?: number }>; label: string; value: string | number; sub?: string; color?: string; onClick?: () => void }) => (
  <button
    onClick={onClick}
    data-testid={`stat-card-${label.toLowerCase().replace(/\s+/g, '-')}`}
    className="text-left border border-[#2d333b] rounded-xl p-5 transition-all hover:border-[#444c56] hover:translate-y-[-2px] group"
    style={{ backgroundColor: '#161b22' }}
  >
    <div className="flex items-center justify-between mb-3">
      <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${color}18` }}>
        <span style={{ color }}><Icon size={18} /></span>
      </div>
      {onClick && <ChevronRight size={14} className="text-[#484f58] group-hover:text-[#8b949e] transition-colors" />}
    </div>
    <p className="text-2xl font-bold text-white">{value}</p>
    <p className="text-xs text-[#8b949e] mt-1">{label}</p>
    {sub && <p className="text-xs mt-1" style={{ color }}>{sub}</p>}
  </button>
);

const COLORS = ['#22c55e', '#3b82f6', '#f59e0b', '#ef4444', '#8b5cf6', '#06b6d4'];

interface OverviewData { total_users?: number; new_users?: number; total_enrollments?: number; enrollments_period?: number; certificates_issued?: number; certificates_period?: number; dau?: number; mau?: number; signups_trend?: { date: string; count: number }[]; }
interface EngagementData { subscription_distribution?: Record<string, number>; top_courses?: { course_title: string; unique_users_count: number; enrollments: number }[]; }
interface RevenueData { mrr?: number; active_pro_subscribers?: number; period_revenue?: number; period_transactions?: number; revenue_trend?: { date: string; revenue: number }[]; }
interface QuizStatsData { total_attempts?: number; pass_rate?: number; }
interface HealthData { database?: { data_size_mb?: number; indexes?: number; }; }

const AdminDashboard = () => {
  const [overview, setOverview] = useState<OverviewData | null>(null);
  const [engagement, setEngagement] = useState<EngagementData | null>(null);
  const [revenue, setRevenue] = useState<RevenueData | null>(null);
  const [quizStats, setQuizStats] = useState<QuizStatsData | null>(null);
  const [health, setHealth] = useState<HealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [days, setDays] = useState(30);
  const navigate = useRouter();
  
  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [ov, eng, rev, quiz, sys] = await Promise.all([
        api.get<OverviewData>(`/admin/analytics/overview?days=${days}`, { signal }),
        api.get<EngagementData>('/admin/analytics/engagement', { signal }),
        api.get<RevenueData>(`/admin/revenue/overview?days=${days}`, { signal }),
        api.get<QuizStatsData>('/admin/quiz-analytics', { signal }),
        api.get<HealthData>('/admin/system-health', { signal }),
      ]);
      if (signal?.aborted) return;
      setOverview(ov.data);
      setEngagement(eng.data);
      setRevenue(rev.data);
      setQuizStats(quiz.data);
      setHealth(sys.data);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [days]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await load(ac.signal); })();
    return () => ac.abort();
  }, [load]);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-32">
        <Loader2 size={28} className="text-[#22c55e] animate-spin" />
      </div>
    );
  }

  const subDist = engagement?.subscription_distribution || {};
  const pieData = Object.entries(subDist).map(([name, value]) => ({ name, value }));

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex flex-wrap items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white transition-colors">
            <ArrowLeft size={20} />
          </button>
          <div className="flex-1">
            <h1 data-testid="admin-dashboard-title" className="text-2xl font-bold text-white">Admin Dashboard</h1>
            <p className="text-sm text-[#8b949e]">Platform overview &middot; Last {days} days</p>
          </div>
          <DateRangeFilter value={days} onChange={setDays} />
          <div className="flex items-center gap-2 flex-wrap">
            {[
              { icon: Bell, label: 'Alerts', path: '/admin/dashboard/announcements' },
              { icon: Mail, label: 'Digest', path: '/admin/dashboard/digest' },
              { icon: Terminal, label: 'Code', path: '/admin/dashboard/code-monitor' },
              { icon: Activity, label: 'Activity', path: '/admin/dashboard/activity' },
              { icon: Shield, label: 'Audit', path: '/admin/dashboard/audit-logs' },
              { icon: Layers, label: 'Bulk', path: '/admin/dashboard/bulk' },
              { icon: Globe, label: 'SEO', path: '/admin/dashboard/seo' },
              { icon: Flame, label: 'Heatmap', path: '/admin/dashboard/heatmap' },
              { icon: Users, label: 'Affiliates', path: '/admin/dashboard/affiliates' },
              { icon: Key, label: 'LLM Keys', path: '/admin/dashboard/llm-keys' },
              { icon: Zap, label: 'Code Exec', path: '/admin/dashboard/code-execution' },
              { icon: FolderArchive, label: 'Backup', path: '/admin/dashboard/backup' },
              { icon: Activity, label: 'Homepage', path: '/admin/dashboard/homepage' },
              { icon: Clock, label: 'API Monitor', path: '/admin/dashboard/api-monitoring' },
              { icon: FileText, label: 'Policies', path: '/admin/dashboard/policies' },
              { icon: Layout, label: 'Navigation', path: '/admin/navigation' },
              { icon: MessageCircle, label: 'Discussions', path: '/admin/dashboard/discussions' },
              { icon: ThumbsUp, label: 'Feedback', path: '/admin/dashboard/lesson-feedback' },
              { icon: Globe, label: 'PPP Analytics', path: '/admin/dashboard/ppp-analytics' },
            ].map(link => (
              <button
                key={link.path}
                data-testid={`nav-${link.label.toLowerCase()}`}
                onClick={() => navigate.push(link.path)}
                className="flex items-center gap-1.5 bg-[#161b22] border border-[#2d333b] hover:border-[#444c56] text-[#c9d1d9] px-3 py-1.5 rounded-lg text-xs transition-colors"
              >
                <link.icon size={12} /> {link.label}
              </button>
            ))}
          </div>
        </div>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          <StatCard icon={Users} label="Total Users" value={overview?.total_users || 0} sub={`+${overview?.new_users || 0} new`} color="#3b82f6" onClick={() => navigate.push('/admin/dashboard/users')} />
          <StatCard icon={DollarSign} label="MRR" value={`$${revenue?.mrr || 0}`} sub={`${revenue?.active_pro_subscribers || 0} active Pro`} color="#22c55e" onClick={() => navigate.push('/admin/dashboard/revenue')} />
          <StatCard icon={BookOpen} label="Enrollments" value={overview?.total_enrollments || 0} sub={`+${overview?.enrollments_period || 0} this period`} color="#f59e0b" />
          <StatCard icon={Award} label="Certificates" value={overview?.certificates_issued || 0} sub={`+${overview?.certificates_period || 0} this period`} color="#8b5cf6" onClick={() => navigate.push('/admin/dashboard/certificates')} />
          <StatCard icon={Activity} label="DAU / MAU" value={`${overview?.dau || 0} / ${overview?.mau || 0}`} color="#06b6d4" />
          <StatCard icon={Brain} label="Quiz Attempts" value={quizStats?.total_attempts || 0} sub={`${quizStats?.pass_rate || 0}% pass rate`} color="#ef4444" onClick={() => navigate.push('/admin/dashboard/quizzes')} />
          <StatCard icon={TrendingUp} label="Revenue (Period)" value={`$${revenue?.period_revenue || 0}`} sub={`${revenue?.period_transactions || 0} transactions`} color="#22c55e" onClick={() => navigate.push('/admin/dashboard/revenue')} />
          <StatCard icon={Server} label="DB Size" value={`${health?.database?.data_size_mb || 0} MB`} sub={`${health?.database?.indexes || 0} indexes`} color="#f97316" onClick={() => navigate.push('/admin/dashboard/system')} />
        </div>

        {/* Charts Row */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Signups Trend */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">User Signups (30d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <AreaChart data={overview?.signups_trend || []}>
                <defs>
                  <linearGradient id="signupG" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3} />
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#484f58' }} allowDecimals={false} />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
                <Area type="monotone" dataKey="count" stroke="#3b82f6" fill="url(#signupG)" strokeWidth={2} />
              </AreaChart>
            </ResponsiveContainer>
          </div>

          {/* Revenue Trend */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Revenue (30d)</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={revenue?.revenue_trend || []}>
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
                <YAxis tick={{ fontSize: 10, fill: '#484f58' }} />
                <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
                <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bottom Row */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Top Courses */}
          <div className="lg:col-span-2 border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Top Courses by Enrollment</h3>
            <div className="space-y-2">
              {(engagement?.top_courses || []).slice(0, 8).map((c: { course_title: string; unique_users_count: number; enrollments: number }, i: number) => (
                <div key={i} className="flex items-center justify-between py-2 border-b border-[#2d333b]/50 last:border-0">
                  <div className="flex items-center gap-3">
                    <span className="text-xs text-[#484f58] w-5">{i + 1}.</span>
                    <span className="text-sm text-[#c9d1d9]">{c.course_title}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className="text-xs text-[#8b949e]">{c.unique_users_count} users</span>
                    <span className="text-xs font-mono text-[#22c55e]">{c.enrollments} lessons</span>
                  </div>
                </div>
              ))}
              {(!engagement?.top_courses || engagement.top_courses.length === 0) && (
                <p className="text-sm text-[#484f58] py-4 text-center">No enrollment data yet</p>
              )}
            </div>
          </div>

          {/* Subscription Distribution */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Subscriptions</h3>
            {pieData.length > 0 ? (
              <>
                <ResponsiveContainer width="100%" height={160}>
                  <PieChart>
                    <Pie data={pieData} cx="50%" cy="50%" innerRadius={40} outerRadius={65} dataKey="value" strokeWidth={0}>
                      {pieData.map((_, i) => <Cell key={i} fill={COLORS[i % COLORS.length]} />)}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} />
                  </PieChart>
                </ResponsiveContainer>
                <div className="flex flex-wrap gap-3 mt-3 justify-center">
                  {pieData.map((d, i) => (
                    <div key={d.name} className="flex items-center gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                      <span className="text-xs text-[#8b949e] capitalize">{d.name}: {String(d.value)}</span>
                    </div>
                  ))}
                </div>
              </>
            ) : (
              <p className="text-sm text-[#484f58] py-8 text-center">No data</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
