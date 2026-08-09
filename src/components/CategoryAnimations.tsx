'use client';

import React, { useState, useEffect, useMemo } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Search, Loader2 } from 'lucide-react';
import Header from '@/components/DSAHeader';
import { api } from '@/lib/api';

interface AnimationItem {
  id: string;
  title: string;
  description: string;
  category: string;
  is_premium: boolean;
  group?: string;
  group_order?: number;
}

const CATEGORY_META: Record<string, { title: string; accent: string }> = {
  'dsa-concepts': { title: 'DSA Concept Animations', accent: '#14b8a6' },
  'system-design': { title: 'System Design Animations', accent: '#3b82f6' },
  concurrency: { title: 'Concurrency Animations', accent: '#8b5cf6' },
  'ai-ml': { title: 'AI / ML Animations', accent: '#ec4899' },
  sql: { title: 'SQL Animations', accent: '#f59e0b' },
};

const CategoryAnimations = () => {
  const params = useParams();
  const category = (Array.isArray(params?.category) ? params?.category[0] : params?.category) as string;
  const meta = CATEGORY_META[category] || { title: category, accent: '#14b8a6' };

  const [items, setItems] = useState<AnimationItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');

  useEffect(() => {
    const ac = new AbortController();
    const id = setTimeout(() => {
      setLoading(true);
      setError(null);
      api
        .get<{ animations: AnimationItem[]; total: number }>(
          `/animations?category=${encodeURIComponent(category)}&kind=component`,
          { signal: ac.signal },
        )
        .then((res) => {
          if (ac.signal.aborted) return;
          setItems(res.data.animations);
          setLoading(false);
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          setError(err instanceof Error ? err.message : 'Failed to load animations');
          setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(id);
      ac.abort();
    };
  }, [category]);

  const filtered = useMemo(() => {
    const q = searchQuery.toLowerCase();
    if (!q) return items;
    return items.filter(
      (a) => a.title.toLowerCase().includes(q) || a.id.toLowerCase().includes(q),
    );
  }, [items, searchQuery]);

  const grouped = useMemo(() => {
    const map = new Map<string, AnimationItem[]>();
    for (const item of filtered) {
      const g = item.group || 'Other';
      if (!map.has(g)) map.set(g, []);
      map.get(g)!.push(item);
    }
    const groups = Array.from(map.entries());
    groups.sort((a, b) => {
      const oa = items.find((i) => (i.group || 'Other') === a[0])?.group_order ?? 999;
      const ob = items.find((i) => (i.group || 'Other') === b[0])?.group_order ?? 999;
      return oa - ob;
    });
    return groups;
  }, [filtered, items]);

  const renderGrid = (groupItems: AnimationItem[]) => (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {groupItems.map((item) => (
        <Link
          key={item.id}
          href={`/animations/${category}/${item.id}`}
          className="block group"
        >
          <div className="bg-[#141416] border border-[#1f1f23] rounded-lg p-4 hover:border-[#2f2f35] hover:bg-[#18181b] transition-all duration-200">
            <div className="flex items-start justify-between gap-3">
              <div className="flex-1 min-w-0">
                <h3 className="text-white font-medium text-base mb-1 group-hover:text-[color:var(--accent)] transition-colors truncate">
                  {item.title}
                </h3>
                <p className="text-gray-500 text-sm line-clamp-2">{item.description || item.id}</p>
              </div>
              {item.is_premium && (
                <span
                  className="shrink-0 rounded-full px-2 py-0.5 text-xs font-semibold"
                  style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
                >
                  Premium
                </span>
              )}
            </div>
          </div>
        </Link>
      ))}
    </div>
  );

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Header />
        <main className="max-w-[1000px] mx-auto px-4 py-8 flex items-center justify-center">
          <div className="flex flex-col items-center gap-3 py-24">
            <Loader2 className="w-6 h-6 animate-spin" style={{ color: meta.accent }} />
            <p className="text-gray-500 text-sm">Loading animations...</p>
          </div>
        </main>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-[#0a0a0b]">
        <Header />
        <main className="max-w-[1000px] mx-auto px-4 py-8 flex items-center justify-center">
          <div className="text-center py-24">
            <p className="text-gray-500 text-sm">{error}</p>
            <Link href="/animations" className="inline-block mt-4 text-sm hover:underline" style={{ color: meta.accent }}>
              Back to All Animations
            </Link>
          </div>
        </main>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />

      <main className="max-w-[1000px] mx-auto px-4 py-8">
        <Link
          href="/animations"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Animations
        </Link>

        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">{meta.title}</h1>
            <p className="text-gray-400">{items.length} interactive animations</p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 mb-8">
          <div className="relative flex-1 min-w-[200px] max-w-[300px]">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
            <input
              type="text"
              placeholder="Search animations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141416] border border-[#1f1f23] rounded-md pl-10 pr-4 py-2 text-white placeholder-gray-500 focus:outline-none focus:border-[#2f2f35] text-sm"
            />
          </div>
        </div>

        {grouped.map(([groupTitle, groupItems]) => (
          <section key={groupTitle} className="mb-8">
            <h2
              className="text-lg font-semibold text-white mb-3 flex items-center gap-2"
              style={{ color: meta.accent }}
            >
              {groupTitle}
              <span className="text-sm font-normal text-gray-500">{groupItems.length}</span>
            </h2>
            {renderGrid(groupItems)}
          </section>
        ))}

        {filtered.length === 0 && (
          <p className="text-center text-gray-500 text-sm py-16">No animations match your search.</p>
        )}
      </main>
    </div>
  );
};

export default CategoryAnimations;
