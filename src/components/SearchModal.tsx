'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { Search, X, FileText, ArrowRight, Loader2, BookOpen, Layers } from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { useTheme } from '@/context/ThemeContext';

interface SearchResult {
  match_type: string;
  slug: string;
  course_slug?: string;
  title: string;
  course_title?: string;
  section_title?: string;
  snippet?: string;
  read_time?: string;
}

interface SearchModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigate: (slug: string | null, courseSlug: string | null) => void;
  courseSlug?: string;
}

const SearchModal = ({ isOpen, onClose, onNavigate, courseSlug }: SearchModalProps) => {
  const { colors } = useTheme();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [totalLessons, setTotalLessons] = useState(0);
  const inputRef = useRef<HTMLInputElement | null>(null);
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setResults([]);
      setSelectedIdx(0);
      setTimeout(() => inputRef.current?.focus(), 100);
    }
  }, [isOpen]);

  useEffect(() => {
    const ac = new AbortController();
    api.get<{ courses: any[] } | any[]>('/courses', { signal: ac.signal, cache: 'no-store' }).then(r => {
      if (ac.signal.aborted) return;
      const courses = 'courses' in r.data ? r.data.courses : r.data || [];
      setTotalLessons(courses.reduce((a: number, c: { lesson_count?: number }) => a + (c.lesson_count || 0), 0));
    }).catch((err) => {
      if ((err as any)?.name === 'AbortError') return;
    });
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const searchAbortRef = useRef<AbortController | null>(null);

  const search = useCallback(async (signal?: AbortSignal) => {
    if ((signal as any)?.aborted) return;
    setLoading(true);
    try {
      const res = await api.get<{ results: any[] }>(`/search?q=${encodeURIComponent(query)}&limit=15`, { signal });
      if (signal?.aborted) return;
      setResults(res.data.results || []);
      setSelectedIdx(0);
    } catch (err) {
      if ((err as any)?.name === 'AbortError') return;
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  }, [query]);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    searchAbortRef.current?.abort();
    const ac = new AbortController();
    searchAbortRef.current = ac;
    debounceRef.current = setTimeout(() => search(ac.signal), 250);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIdx(prev => Math.min(prev + 1, results.length - 1));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIdx(prev => Math.max(prev - 1, 0));
    } else if (e.key === 'Enter' && results.length > 0) {
      e.preventDefault();
      handleSelect(results[selectedIdx]);
    } else if (e.key === 'Escape') {
      onClose();
    }
  };

  const handleSelect = (result: SearchResult) => {
    if (result.match_type === 'course') {
      onNavigate(null, result.course_slug || null);
    } else {
      onNavigate(result.slug, result.course_slug || null);
    }
    onClose();
  };

  const stripHtml = (html?: string): string => html?.replace(/<[^>]*>/g, '') || '';

  if (!isOpen) return null;

  return (
    <div data-testid="search-modal" className="fixed inset-0 z-[80] flex items-start justify-center pt-[15vh]" onClick={onClose}>
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" />
      <div
        className="relative w-full max-w-[640px] mx-4 rounded-xl border overflow-hidden shadow-2xl"
        style={{ backgroundColor: colors.bgSecondary, borderColor: colors.border }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-4 py-3 border-b" style={{ borderColor: colors.border }}>
          <Search size={18} style={{ color: colors.textMuted }} />
          <input
            ref={inputRef}
            data-testid="search-input"
            value={query}
            onChange={handleInput}
            onKeyDown={handleKeyDown}
            placeholder={`Search ${totalLessons || ''}+ lessons across all courses...`}
            className="flex-1 bg-transparent text-sm outline-none placeholder-opacity-50"
            style={{ color: colors.text }}
          />
          {loading && <Loader2 size={16} className="animate-spin" style={{ color: colors.green }} />}
          <kbd className="hidden sm:flex items-center gap-0.5 px-1.5 py-0.5 text-[10px] font-mono rounded border" style={{ color: colors.textMuted, borderColor: colors.border, backgroundColor: colors.bgTertiary }}>ESC</kbd>
        </div>

        <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
          {query.length < 2 && (
            <div className="px-4 py-8 text-center" style={{ color: colors.textMuted }}>
              <Search size={32} className="mx-auto mb-3 opacity-30" />
              <p className="text-sm">Search courses, sections, and lessons</p>
              <p className="text-xs mt-1 opacity-60">
                <kbd className="px-1 py-0.5 rounded border text-[10px]" style={{ borderColor: colors.border }}>↑↓</kbd> Navigate
                {' '}<kbd className="px-1 py-0.5 rounded border text-[10px]" style={{ borderColor: colors.border }}>Enter</kbd> Open
                {' '}<kbd className="px-1 py-0.5 rounded border text-[10px]" style={{ borderColor: colors.border }}>Esc</kbd> Close
              </p>
            </div>
          )}

          {query.length >= 2 && results.length === 0 && !loading && (
            <div className="px-4 py-8 text-center" style={{ color: colors.textMuted }}>
              <p className="text-sm">No results for &quot;<strong>{query}</strong>&quot;</p>
              <p className="text-xs mt-1 opacity-60">Try different keywords</p>
            </div>
          )}

          {results.map((result, idx) => {
            const isCourse = result.match_type === 'course';
            const ResultIcon = isCourse ? BookOpen : FileText;

            return (
              <button
                key={`${result.match_type}-${result.slug}-${idx}`}
                data-testid={`search-result-${idx}`}
                onClick={() => handleSelect(result)}
                onMouseEnter={() => setSelectedIdx(idx)}
                className="w-full text-left px-4 py-3 flex items-start gap-3 transition-colors border-b"
                style={{
                  backgroundColor: idx === selectedIdx ? colors.hoverBg : 'transparent',
                  borderColor: colors.borderLight,
                }}
              >
                <ResultIcon size={16} className="mt-0.5 flex-shrink-0" style={{ color: isCourse ? colors.green : colors.textMuted }} />
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-sm font-medium truncate" style={{ color: colors.text }}>{result.title}</span>
                    {result.match_type === 'course' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: '#06b6d4', backgroundColor: '#06b6d420' }}>Course</span>
                    )}
                    {result.match_type === 'title' && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded font-medium" style={{ color: colors.green, backgroundColor: colors.green + '20' }}>Title</span>
                    )}
                  </div>
                  {!isCourse && result.course_title && (
                    <span className="text-[11px] mt-0.5 flex items-center gap-1 block" style={{ color: colors.textSecondary }}>
                      <Layers size={10} /> {result.course_title} {result.section_title && `/ ${result.section_title}`}
                    </span>
                  )}
                  {result.snippet && (
                    <p className="text-xs mt-1 line-clamp-2 opacity-60" style={{ color: colors.textSecondary }}>
                      {stripHtml(result.snippet)}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2 mt-1 flex-shrink-0">
                  {result.read_time && <span className="text-[10px]" style={{ color: colors.textMuted }}>{result.read_time}</span>}
                  <ArrowRight size={14} className="opacity-40" style={{ color: colors.textMuted }} />
                </div>
              </button>
            );
          })}
        </div>

        <div className="px-4 py-2 border-t flex items-center justify-between" style={{ borderColor: colors.border, backgroundColor: colors.bgTertiary }}>
          <div className="flex items-center gap-3">
            <span className="text-[10px] flex items-center gap-1" style={{ color: colors.textMuted }}>
              <kbd className="px-1 py-0.5 rounded border" style={{ borderColor: colors.border }}>↑↓</kbd> Navigate
            </span>
            <span className="text-[10px] flex items-center gap-1" style={{ color: colors.textMuted }}>
              <kbd className="px-1 py-0.5 rounded border" style={{ borderColor: colors.border }}>↵</kbd> Open
            </span>
          </div>
          <span className="text-[10px]" style={{ color: colors.textMuted }}>
            {results.length > 0 ? `${results.length} result${results.length > 1 ? 's' : ''}` : `${totalLessons}+ lessons`}
          </span>
        </div>
      </div>
    </div>
  );
};

export default SearchModal;
