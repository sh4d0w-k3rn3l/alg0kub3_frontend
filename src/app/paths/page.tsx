'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { Layers, Brain, Server, BookOpen, Clock, Loader2, GraduationCap, Route } from 'lucide-react';

interface LearningPathCourse {
  course_slug: string;
  title?: string;
}

interface LearningPath {
  id: string;
  title: string;
  slug: string;
  description?: string;
  icon?: string;
  difficulty?: string;
  estimated_hours?: number;
  course_count?: number;
  courses: LearningPathCourse[];
}

export default function PathsPage() {
  const router = useRouter();
  const [paths, setPaths] = useState<LearningPath[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    api.get<LearningPath[]>('/learning-paths', { signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (res.ok && res.data) {
          setPaths(Array.isArray(res.data) ? res.data : []);
        }
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        handleApiError(err);
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  const pathIcons: Record<string, React.ElementType> = { brain: Brain, layers: Layers, server: Server };
  const diffStyles: Record<string, { bg: string; text: string }> = {
    Beginner: { bg: '#22c55e15', text: '#22c55e' },
    Intermediate: { bg: '#f59e0b15', text: '#f59e0b' },
    Advanced: { bg: '#ef444415', text: '#ef4444' },
  };

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]/50">
        <div className="max-w-[1280px] mx-auto px-4 h-12 flex items-center gap-3 text-xs">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-medium">Learning Paths</span>
        </div>
      </nav>

      <div className="max-w-[1280px] mx-auto px-4 py-8">
        <div className="flex items-center gap-3 mb-8">
          <div className="w-10 h-10 rounded-xl bg-[#22c55e]/10 flex items-center justify-center">
            <Route className="w-5 h-5 text-[#22c55e]" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white">Learning Paths</h1>
            <p className="text-xs text-gray-500 mt-0.5">Curated tracks that take you from beginner to expert</p>
          </div>
        </div>

        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
          </div>
        ) : paths.length === 0 ? (
          <div className="text-center py-20">
            <GraduationCap className="w-12 h-12 text-gray-600 mx-auto mb-3" />
            <p className="text-gray-500">No learning paths available yet.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {paths.map((lp) => {
              const Icon = pathIcons[lp.icon || ''] || Layers;
              const ds = diffStyles[lp.difficulty || ''] || { bg: '#6366f115', text: '#6366f1' };
              return (
                <button
                  key={lp.id}
                  onClick={() => router.push(`/paths/${lp.slug}`)}
                  className="group text-left border border-[#1f1f23] rounded-xl p-6 transition-all duration-300 bg-[#0f0f11] hover:border-[#22c55e]/30 hover:translate-y-[-3px] hover:shadow-lg hover:shadow-[#22c55e]/5"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="w-11 h-11 rounded-xl flex items-center justify-center bg-[#22c55e12]">
                      <Icon size={20} className="text-[#22c55e]" />
                    </div>
                    <span
                      className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full"
                      style={{ backgroundColor: ds.bg, color: ds.text, fontFamily: 'JetBrains Mono, monospace' }}
                    >
                      {lp.difficulty || 'All Levels'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold mb-1.5 text-white group-hover:text-[#22c55e] transition-colors">{lp.title}</h3>
                  <p className="text-xs leading-relaxed line-clamp-2 mb-4 text-gray-400">{lp.description}</p>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3 text-[11px] text-gray-500" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      <span className="flex items-center gap-1"><BookOpen size={11} /> {lp.course_count || lp.courses.length} courses</span>
                      {lp.estimated_hours && (
                        <span className="flex items-center gap-1"><Clock size={11} /> ~{lp.estimated_hours}h</span>
                      )}
                    </div>
                    <span className="text-[#22c55e] text-[11px] opacity-0 group-hover:opacity-100 transition-opacity font-medium" style={{ fontFamily: 'JetBrains Mono, monospace' }}>
                      View Path &rarr;
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
