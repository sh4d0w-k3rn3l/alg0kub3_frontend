'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';

export interface AnimationSummary {
  id: string;
  title: string;
  description: string;
  category: string;
  difficulty: string;
  lesson_slug: string;
  topics: string[];
  companies: string[];
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface AnimationDetail extends AnimationSummary {
  code: Record<string, string>;
  animation: Record<string, unknown>;
  timeComplexity?: string;
  spaceComplexity?: string;
}

export interface AnimationsMeta {
  categories: string[];
  difficulties: string[];
  total: number;
}

const OTHER_CATEGORY = 'Other';

export const displayCategory = (category: string): string => category || OTHER_CATEGORY;

export const displayDifficulty = (difficulty: string): string => {
  if (!difficulty) return 'N/A';
  return difficulty.charAt(0).toUpperCase() + difficulty.slice(1);
};

export function useAnimationsCatalog() {
  const [animations, setAnimations] = useState<AnimationSummary[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [difficulties, setDifficulties] = useState<string[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    Promise.all([
      api.get<{ animations: AnimationSummary[]; total: number }>('/animations', { signal: ac.signal }),
      api.get<AnimationsMeta>('/animations/meta', { signal: ac.signal }),
    ])
      .then(([list, meta]) => {
        if (ac.signal.aborted) return;
        const cats = [...meta.data.categories];
        if (list.data.animations.some((a) => !a.category) && !cats.includes(OTHER_CATEGORY)) {
          cats.push(OTHER_CATEGORY);
        }
        setAnimations(list.data.animations);
        setCategories(cats);
        setDifficulties(meta.data.difficulties);
        setTotal(meta.data.total);
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        setError(err instanceof Error ? err.message : 'Failed to load animations');
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, []);

  return { animations, categories, difficulties, total, loading, error };
}

export function useAnimationDetail(algorithmId: string, category?: string) {
  const [algorithm, setAlgorithm] = useState<AnimationDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const ac = new AbortController();
    if (!algorithmId) {
      const id = setTimeout(() => {
        setAlgorithm(null);
        setError('Algorithm not found');
        setLoading(false);
      }, 0);
      return () => {
        clearTimeout(id);
        ac.abort();
      };
    }
    const id = setTimeout(() => {
      setAlgorithm(null);
      setError(null);
      setLoading(true);
      const params = new URLSearchParams();
      if (category) params.set('category', category);
      const qs = params.toString();
      api
        .get<AnimationDetail>(`/animations/${encodeURIComponent(algorithmId)}${qs ? `?${qs}` : ''}`, { signal: ac.signal })
        .then((res) => {
          if (ac.signal.aborted) return;
          setAlgorithm(res.data);
        })
        .catch((err: unknown) => {
          if (ac.signal.aborted) return;
          setAlgorithm(null);
          setError(err instanceof Error ? err.message : 'Failed to load animation');
        })
        .finally(() => {
          if (!ac.signal.aborted) setLoading(false);
        });
    }, 0);
    return () => {
      clearTimeout(id);
      ac.abort();
    };
  }, [algorithmId, category]);

  return { algorithm, loading, error };
}
