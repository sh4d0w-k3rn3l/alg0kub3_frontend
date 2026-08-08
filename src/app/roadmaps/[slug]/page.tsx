'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { ArrowLeft, Loader2, Map, Layers, ListTree, ChevronRight, CheckCircle2 } from 'lucide-react';
import ErrorBoundary from '@/components/ErrorBoundary';

interface RoadmapNode {
  title: string;
  children?: RoadmapNode[];
}

interface RoadmapDetail {
  slug: string;
  title: string;
  description: string;
  order: number;
  groups: number;
  topics: number;
  nodes: RoadmapNode[];
}

function RoadmapDetailPage() {
  const params = useParams();
  const slug = (params?.slug as string) || '';

  const [roadmap, setRoadmap] = useState<RoadmapDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    if (!slug) {
      const id = setTimeout(() => {
        setLoading(false);
        setError('Roadmap not found');
      }, 0);
      return () => {
        clearTimeout(id);
        ac.abort();
      };
    }
    const id = setTimeout(() => {
      setLoading(true);
      setError(null);

      api
        .get<RoadmapDetail>(`/roadmaps/${encodeURIComponent(slug)}`, { signal: ac.signal })
        .then((res) => {
          if (ac.signal.aborted) return;
          setRoadmap(res.data);
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          handleApiError(err);
          setError('Failed to load roadmap');
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(id);
      ac.abort();
    };
  }, [slug]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
          <p className="text-gray-500 text-sm">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !roadmap) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Roadmap Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This roadmap does not exist.'}</p>
          <Link href="/roadmaps" className="text-[#22c55e] hover:underline">Browse Roadmaps</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]/50">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-3 text-xs">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <Link href="/roadmaps" className="text-gray-500 hover:text-white transition-colors">Roadmaps</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-medium truncate">{roadmap.title}</span>
        </div>
      </nav>

      <main className="max-w-[1100px] mx-auto px-4 py-8">
        <Link
          href="/roadmaps"
          className="inline-flex items-center gap-1 text-gray-400 hover:text-white text-sm mb-6 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to All Roadmaps
        </Link>

        <div className="mb-8">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-11 h-11 rounded-xl bg-[#22c55e]/10 flex items-center justify-center shrink-0">
              <Map className="w-6 h-6 text-[#22c55e]" />
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white">{roadmap.title}</h1>
            </div>
          </div>
          <p className="text-gray-400 text-sm max-w-2xl mb-4">{roadmap.description}</p>

          <div className="flex flex-wrap items-center gap-4 text-xs mb-6">
            <div className="flex items-center gap-1.5 text-gray-500">
              <Layers className="w-3.5 h-3.5" />
              <span>{roadmap.groups} groups</span>
            </div>
            <div className="flex items-center gap-1.5 text-gray-500">
              <ListTree className="w-3.5 h-3.5" />
              <span>{roadmap.topics} topics</span>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {roadmap.nodes.map((group, gi) => (
            <div
              key={`${group.title}-${gi}`}
              className="bg-[#0f0f11] border border-[#1f1f23] rounded-xl p-5"
            >
              <div className="flex items-center gap-3 mb-4">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] font-bold text-sm shrink-0">
                  {gi + 1}
                </div>
                <h2 className="text-white font-semibold text-sm">{group.title}</h2>
                {group.children && (
                  <span className="text-[10px] text-gray-600 font-mono ml-auto shrink-0">
                    {group.children.length} topics
                  </span>
                )}
              </div>
              {group.children && (
                <ul className="space-y-1">
                  {group.children.map((topic, ti) => (
                    <li
                      key={`${topic.title}-${ti}`}
                      className="flex items-center gap-2 px-3 py-2 rounded-lg bg-[#141416] border border-[#1f1f23]"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#22c55e]/60 shrink-0" />
                      <span className="text-sm text-gray-300">{topic.title}</span>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/roadmaps"
            className="inline-flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-black font-semibold rounded-xl hover:bg-[#16a34a] transition-colors"
          >
            Explore More Roadmaps
            <ChevronRight className="w-4 h-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary fallbackMessage="Failed to load roadmap. Please try refreshing.">
      <RoadmapDetailPage />
    </ErrorBoundary>
  );
}
