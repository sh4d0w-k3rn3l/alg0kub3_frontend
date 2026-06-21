'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { ArrowLeft, DollarSign, TrendingUp, Users, CreditCard, Loader2, ChevronLeft, ChevronRight } from 'lucide-react';
import DateRangeFilter from './DateRangeFilter';

interface RevenueOverview { total_revenue?: number; mrr?: number; active_pro_subscribers?: number; period_transactions?: number; revenue_trend?: { date: string; revenue: number }[]; }
interface Transaction { user_name?: string; user_email?: string; amount: number; payment_status: string; created_at?: string; }

const RevenueDashboard = () => {
  const [overview, setOverview] = useState<RevenueOverview | null>(null);
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [txnTotal, setTxnTotal] = useState<number>(0);
  const [txnPage, setTxnPage] = useState(1);
  const [txnPages, setTxnPages] = useState(1);
  const [loading, setLoading] = useState<boolean>(true);
  const [days, setDays] = useState(30);
  const navigate = useRouter();

  const load = useCallback(async (signal?: AbortSignal) => {
    setLoading(true);
    try {
      const [rev, txn] = await Promise.all([
        api.get<RevenueOverview>(`/admin/revenue/overview?days=${days}`, { signal }),
        api.get<{ transactions: Transaction[]; total: number; total_pages: number }>(`/admin/revenue/transactions?page=${txnPage}&limit=15`, { signal }),
      ]);
      if (signal?.aborted) return;
      setOverview(rev.data);
      setTransactions(txn.data.transactions);
      setTxnTotal(txn.data.total);
      setTxnPages(txn.data.total_pages);
    } catch (err) {
      if ((err as DOMException)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      if (!signal?.aborted) setLoading(false);
    }
  }, [txnPage, days]);

  useEffect(() => {
    const ac = new AbortController();
    // eslint-disable-next-line react-hooks/set-state-in-effect
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;
  }

  const STATUS_COLORS: Record<string, string> = {
    paid: '#22c55e',
    initiated: '#f59e0b',
    failed: '#ef4444',
  };

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div className="flex-1">
            <h1 data-testid="revenue-dashboard-title" className="text-2xl font-bold text-white">Revenue Dashboard</h1>
            <p className="text-sm text-[#8b949e]">Financial overview &middot; Last {days} days</p>
          </div>
          <DateRangeFilter value={days} onChange={setDays} />
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
          {[
            { icon: DollarSign, label: 'Total Revenue', value: `$${overview?.total_revenue || 0}`, color: '#22c55e' },
            { icon: TrendingUp, label: 'MRR', value: `$${overview?.mrr || 0}`, color: '#3b82f6' },
            { icon: Users, label: 'Active Pro', value: overview?.active_pro_subscribers || 0, color: '#8b5cf6' },
            { icon: CreditCard, label: 'Period Transactions', value: overview?.period_transactions || 0, color: '#f59e0b' },
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

        {/* Revenue Chart */}
        <div className="border border-[#2d333b] rounded-xl p-5 mb-8" style={{ backgroundColor: '#161b22' }}>
          <h3 className="text-sm font-medium text-[#c9d1d9] mb-4">Daily Revenue</h3>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={overview?.revenue_trend || []}>
              <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={d => d.slice(5)} />
              <YAxis tick={{ fontSize: 10, fill: '#484f58' }} tickFormatter={v => `$${v}`} />
              <Tooltip contentStyle={{ backgroundColor: '#161b22', border: '1px solid #2d333b', borderRadius: 8, fontSize: 12 }} formatter={v => [`$${v}`, 'Revenue']} />
              <Bar dataKey="revenue" fill="#22c55e" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Transactions Table */}
        <div className="border border-[#2d333b] rounded-xl overflow-hidden" style={{ backgroundColor: '#161b22' }}>
          <div className="px-5 py-4 border-b border-[#2d333b]">
            <h3 className="text-sm font-medium text-[#c9d1d9]">Recent Transactions ({txnTotal})</h3>
          </div>
          <table className="w-full">
            <thead>
              <tr className="border-b border-[#2d333b]">
                <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">User</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Amount</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Status</th>
                <th className="text-left px-4 py-3 text-xs font-medium text-[#8b949e]">Date</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map((t, i) => (
                <tr key={i} className="border-b border-[#2d333b]/50">
                  <td className="px-4 py-3">
                    <p className="text-sm text-[#c9d1d9]">{t.user_name || 'Unknown'}</p>
                    <p className="text-xs text-[#484f58]">{t.user_email || ''}</p>
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-[#22c55e]">${t.amount}</td>
                  <td className="px-4 py-3">
                    <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: `${STATUS_COLORS[t.payment_status] || '#8b949e'}20`, color: STATUS_COLORS[t.payment_status] || '#8b949e' }}>
                      {t.payment_status}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-xs text-[#8b949e]">{t.created_at ? new Date(t.created_at).toLocaleString() : '-'}</td>
                </tr>
              ))}
              {transactions.length === 0 && (
                <tr><td colSpan={4} className="text-center py-8 text-sm text-[#484f58]">No transactions</td></tr>
              )}
            </tbody>
          </table>
          {txnPages > 1 && (
            <div className="flex items-center justify-between px-4 py-3 border-t border-[#2d333b]">
              <span className="text-xs text-[#8b949e]">Page {txnPage} of {txnPages}</span>
              <div className="flex gap-1">
                <button onClick={() => setTxnPage(p => Math.max(1, p - 1))} disabled={txnPage <= 1} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronLeft size={16} /></button>
                <button onClick={() => setTxnPage(p => Math.min(txnPages, p + 1))} disabled={txnPage >= txnPages} className="p-1.5 rounded text-[#8b949e] hover:text-white disabled:opacity-30"><ChevronRight size={16} /></button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default RevenueDashboard;
