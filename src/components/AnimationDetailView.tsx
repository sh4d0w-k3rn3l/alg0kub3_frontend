'use client';

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import Header from '@/components/DSAHeader';
import SimulationViewer from '@/components/SimulationViewer';
import { useAnimationDetail } from '@/hooks/useAnimations';

const CATEGORY_META: Record<string, { title: string; accent: string }> = {
  'dsa-concepts': { title: 'DSA Concept Animations', accent: '#14b8a6' },
  'system-design': { title: 'System Design Animations', accent: '#3b82f6' },
  concurrency: { title: 'Concurrency Animations', accent: '#8b5cf6' },
  'ai-ml': { title: 'AI / ML Animations', accent: '#ec4899' },
  sql: { title: 'SQL Animations', accent: '#f59e0b' },
};

const AnimationDetailView = () => {
  const params = useParams();
  const category = (Array.isArray(params?.category) ? params?.category[0] : params?.category) as string;
  const id = (Array.isArray(params?.id) ? params?.id[0] : params?.id) as string;
  const meta = CATEGORY_META[category] || { title: category, accent: '#14b8a6' };

  const { algorithm, loading, error } = useAnimationDetail(id, category);
  const [isPremium] = useState<boolean>(false);

  useEffect(() => {
    if (algorithm) {
      const anim = algorithm.animation as Record<string, unknown> | undefined;
      if (anim && typeof anim.premium === 'boolean') {
        // premium gating handled at the listing level; the viewer renders regardless
      }
    }
  }, [algorithm]);

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <Header />

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <Link
          href={`/animations/${category}`}
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to {meta.title}
        </Link>

        {loading && (
          <div className="flex items-center justify-center py-32">
            <div
              className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin"
              style={{ borderColor: `${meta.accent}`, borderTopColor: 'transparent' }}
            />
          </div>
        )}

        {error && (
          <div className="text-center py-32">
            <p className="text-red-400 text-sm">{error}</p>
            <Link href={`/animations/${category}`} className="inline-block mt-4 text-sm hover:underline" style={{ color: meta.accent }}>
              Back to {meta.title}
            </Link>
          </div>
        )}

        {!loading && !error && algorithm && (
          <>
            <div className="flex items-start justify-between gap-4 mb-6">
              <div>
                <h1 className="text-2xl md:text-3xl font-bold text-white mb-2">{algorithm.title}</h1>
                <p className="text-gray-400 text-sm">{algorithm.description || algorithm.id}</p>
              </div>
              {isPremium && (
                <span
                  className="shrink-0 rounded-full px-3 py-1 text-xs font-semibold"
                  style={{ backgroundColor: `${meta.accent}1a`, color: meta.accent }}
                >
                  Premium
                </span>
              )}
            </div>

            <div
              className="rounded-2xl border border-[#1f1f23] bg-[#0d0d0f] overflow-hidden"
              style={{ ['--accent' as string]: meta.accent }}
            >
              <SimulationViewer id={id} />
            </div>
          </>
        )}
      </main>
    </div>
  );
};

export default AnimationDetailView;
