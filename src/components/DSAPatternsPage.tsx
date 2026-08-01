'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import { Code, ArrowLeft, Bell, Lock, Layers, GitBranch, Repeat, Braces } from 'lucide-react';
import PageHeader from '@/components/PageHeader';

const topics = [
  { title: 'Arrays & Hashing', count: 12, icon: Layers },
  { title: 'Two Pointers', count: 8, icon: GitBranch },
  { title: 'Sliding Window', count: 7, icon: Repeat },
  { title: 'Stack & Queue', count: 9, icon: Braces },
  { title: 'Binary Search', count: 10, icon: Code },
  { title: 'Trees & Graphs', count: 15, icon: GitBranch },
  { title: 'Dynamic Programming', count: 14, icon: Layers },
  { title: 'Greedy Algorithms', count: 6, icon: Code },
];

const DSAPatternsPage = () => {
  const router = useRouter();

  return (
    <div className="min-h-screen" style={{ backgroundColor: '#0d1117' }}>
      <PageHeader />
      <div className="max-w-4xl mx-auto px-6 py-10">
        <button onClick={() => router.back()} className="flex items-center gap-2 text-sm text-[#8b949e] hover:text-white mb-8 transition-colors">
          <ArrowLeft size={14} /> Back
        </button>

        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-[#f59e0b]/30 bg-[#f59e0b]/10 text-[#f59e0b] text-xs font-semibold mb-4">
            <Bell size={12} /> Coming Soon
          </div>
          <h1 data-testid="dsa-page-title" className="text-4xl font-extrabold text-white tracking-tight mb-3">
            DSA Patterns
          </h1>
          <p className="text-base text-[#8b949e] max-w-xl mx-auto">
            Master the most common data structure and algorithm patterns asked in coding interviews. Practice with curated problems, visual explanations, and step-by-step solutions.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-10">
          {topics.map(t => {
            const Icon = t.icon;
            return (
              <div key={t.title} className="rounded-xl border border-[#2d333b] p-4 relative overflow-hidden group" style={{ backgroundColor: '#161b22' }}>
                <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                <Icon size={18} className="text-[#22c55e] mb-2" />
                <h3 className="text-sm font-semibold text-[#c9d1d9] mb-1">{t.title}</h3>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-[#484f58]">{t.count} problems</span>
                  <Lock size={10} className="text-[#484f58]" />
                </div>
              </div>
            );
          })}
        </div>

        <div className="rounded-xl border border-[#22c55e]/20 bg-[#22c55e]/5 p-6 text-center">
          <h3 className="text-lg font-bold text-white mb-2">Get notified when it launches</h3>
          <p className="text-sm text-[#8b949e] mb-4">We&apos;re building 80+ curated problems across 8 pattern categories with visual explanations.</p>
          <div className="flex items-center justify-center gap-2">
            <input data-testid="dsa-notify-email" type="email" placeholder="Your email address"
              className="bg-[#0d1117] border border-[#2d333b] rounded-lg px-4 py-2 text-sm text-[#c9d1d9] outline-none focus:border-[#22c55e] placeholder-[#484f58] w-64" />
            <button data-testid="dsa-notify-btn" className="px-4 py-2 rounded-lg text-sm font-semibold bg-[#22c55e] hover:bg-[#16a34a] text-white transition-colors">
              Notify Me
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DSAPatternsPage;
