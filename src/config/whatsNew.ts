import type { WhatsNewItem } from '@/types';
import { api } from '@/lib/api';

export const WHATS_NEW_FALLBACK: WhatsNewItem[] = [
  {
    title: 'AI Engineering for Beginners',
    desc: 'New 68-lesson course on LLMs, RAG & agents',
    url: '/ai-engineering-for-beginners',
    date: '2026-04-15',
    kind: 'course',
  },
  {
    title: 'Regenerate lesson from PDF',
    desc: 'One-click rewrite using the source pages',
    url: '/admin',
    date: '2026-04-19',
    kind: 'feature',
  },
  {
    title: 'AI Tutor per-lesson',
    desc: 'Chat, quiz & flashcards \u2014 Pro only',
    url: '/pricing',
    date: '2026-04-12',
    kind: 'feature',
  },
];

export const WHATS_NEW = WHATS_NEW_FALLBACK;

let _cache: WhatsNewItem[] | null = null;
let _cachePromise: Promise<WhatsNewItem[]> | null = null;
const CACHE_TTL_MS = 5 * 60 * 1000;
let _cacheExpiresAt = 0;

export function fetchWhatsNew(limit = 3): Promise<WhatsNewItem[]> {
  const now = Date.now();
  if (_cache && now < _cacheExpiresAt) return Promise.resolve(_cache);
  if (_cachePromise) return _cachePromise;
  _cachePromise = api
    .get(`/whats-new?limit=${limit}`)
    .then((res) => {
      const items: WhatsNewItem[] = (res.data as { items?: WhatsNewItem[] })?.items || [];
      _cache = items.length > 0 ? items : WHATS_NEW_FALLBACK.slice(0, limit);
      _cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return _cache;
    })
    .catch(() => {
      _cache = WHATS_NEW_FALLBACK.slice(0, limit);
      _cacheExpiresAt = Date.now() + CACHE_TTL_MS;
      return _cache;
    })
    .finally(() => { _cachePromise = null; });
  return _cachePromise;
}

export function relativeTime(iso: string): string {
  const then = new Date(iso).getTime();
  if (Number.isNaN(then)) return '';
  const diffMs = Date.now() - then;
  const mins = Math.round(diffMs / 60000);
  if (mins < 60) return `${Math.max(1, mins)}m ago`;
  const hrs = Math.round(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.round(hrs / 24);
  if (days < 7) return `${days}d ago`;
  const weeks = Math.round(days / 7);
  if (weeks < 5) return `${weeks}w ago`;
  const months = Math.round(days / 30);
  if (months < 12) return `${months}mo ago`;
  return `${Math.round(days / 365)}y ago`;
}

export const KIND_META: Record<string, { label: string; color: string }> = {
  course:  { label: 'Course',  color: '#22c55e' },
  feature: { label: 'Feature', color: '#06b6d4' },
  post:    { label: 'Post',    color: '#a855f7' },
};
