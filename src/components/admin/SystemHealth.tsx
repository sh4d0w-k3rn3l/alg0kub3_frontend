'use client';
import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { ArrowLeft, Database, HardDrive, Zap, Loader2 } from 'lucide-react';

interface SystemHealthData {
  database?: { db_name?: string; data_size_mb?: number; storage_size_mb?: number; collections_count?: number; indexes?: number; index_size_mb?: number; };
  cache?: { connected?: boolean; memory_used?: string; cached_keys?: number; hit_rate_percent?: number; hits?: number; misses?: number; uptime_seconds?: number; };
  collections?: Record<string, number>;
}

const SystemHealth = () => {
  const [data, setData] = useState<SystemHealthData | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useRouter();

  useEffect(() => {
    const ac = new AbortController();
    api.get<SystemHealthData>('/admin/system-health', { signal: ac.signal })
      .then(res => { if (!ac.signal.aborted) setData(res.data); })
      .catch(handleApiError)
      .finally(() => { if (!ac.signal.aborted) setLoading(false); });
    return () => ac.abort();
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center py-32"><Loader2 size={28} className="text-[#22c55e] animate-spin" /></div>;
  }

  const db = data?.database || {};
  const cache = data?.cache || {};
  const collections: Record<string, number> = data?.collections || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <div className="max-w-7xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          <button onClick={() => navigate.push('/admin/dashboard')} className="text-[#8b949e] hover:text-white transition-colors"><ArrowLeft size={20} /></button>
          <div>
            <h1 data-testid="system-health-title" className="text-2xl font-bold text-white">System Health</h1>
            <p className="text-sm text-[#8b949e]">Infrastructure monitoring</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Database */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-2 mb-4">
              <Database size={18} className="text-[#3b82f6]" />
              <h3 className="text-sm font-medium text-[#c9d1d9]">MongoDB</h3>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Database', value: db.db_name || '-' },
                { label: 'Data Size', value: `${db.data_size_mb || 0} MB` },
                { label: 'Storage Size', value: `${db.storage_size_mb || 0} MB` },
                { label: 'Collections', value: db.collections_count || 0 },
                { label: 'Indexes', value: db.indexes || 0 },
                { label: 'Index Size', value: `${db.index_size_mb || 0} MB` },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-[#2d333b]/30 last:border-0">
                  <span className="text-xs text-[#8b949e]">{r.label}</span>
                  <span className="text-sm font-mono text-[#c9d1d9]">{r.value}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Redis */}
          <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
            <div className="flex items-center gap-2 mb-4">
              <Zap size={18} className="text-[#f97316]" />
              <h3 className="text-sm font-medium text-[#c9d1d9]">Redis Cache</h3>
              <span className={`ml-auto text-xs px-2 py-0.5 rounded-full ${cache.connected ? 'bg-[#22c55e20] text-[#22c55e]' : 'bg-[#ef444420] text-[#ef4444]'}`}>
                {cache.connected ? 'Connected' : 'Disconnected'}
              </span>
            </div>
            <div className="space-y-3">
              {[
                { label: 'Memory Used', value: cache.memory_used || '-' },
                { label: 'Cached Keys', value: cache.cached_keys || 0 },
                { label: 'Hit Rate', value: `${cache.hit_rate_percent || 0}%` },
                { label: 'Hits', value: cache.hits || 0 },
                { label: 'Misses', value: cache.misses || 0 },
                { label: 'Uptime', value: cache.uptime_seconds ? `${Math.round(cache.uptime_seconds / 60)} min` : '-' },
              ].map(r => (
                <div key={r.label} className="flex items-center justify-between py-1.5 border-b border-[#2d333b]/30 last:border-0">
                  <span className="text-xs text-[#8b949e]">{r.label}</span>
                  <span className="text-sm font-mono text-[#c9d1d9]">{r.value}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Collection Sizes */}
        <div className="border border-[#2d333b] rounded-xl p-5" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2 mb-4">
            <HardDrive size={18} className="text-[#8b5cf6]" />
            <h3 className="text-sm font-medium text-[#c9d1d9]">Collection Document Counts</h3>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {Object.entries(collections).sort((a, b) => b[1] - a[1]).map(([name, count]) => (
              <div key={name} className="border border-[#2d333b]/50 rounded-lg p-3 hover:border-[#444c56] transition-colors">
                <p className="text-xs text-[#8b949e] mb-1">{name}</p>
                <p className="text-lg font-mono font-bold text-[#c9d1d9]">{count.toLocaleString()}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default SystemHealth;
