'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { Bookmark } from 'lucide-react';
import { api } from '@/lib/api';

interface BookmarkButtonProps {
  lessonSlug: string;
  size?: number;
}

const BookmarkButton = ({ lessonSlug, size = 18 }: BookmarkButtonProps) => {
  const { colors } = useTheme();
  const { user, getAuthHeaders } = useAuth();
  const [bookmarked, setBookmarked] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!user || !lessonSlug) return;
    const ac = new AbortController();
    (async () => {
      const headers = await getAuthHeaders();
      api.get<{ bookmarked: boolean }>(`/bookmarks/check/${lessonSlug}`, { headers, signal: ac.signal })
        .then(r => {
          if (ac.signal.aborted) return;
          setBookmarked(r.data.bookmarked);
        })
        .catch((err) => {
          if (err instanceof DOMException && err.name === 'AbortError') return;
        });
    })();
    return () => ac.abort();
  }, [lessonSlug, user]);

  const toggle = async () => {
    if (!user || loading) return;
    setLoading(true);
    try {
      const headers = await getAuthHeaders();
      const res = await api.post<{ bookmarked: boolean }>(`/bookmarks/${lessonSlug}`, {}, { headers });
      setBookmarked(res.data.bookmarked);
    } catch { /* ignore */ }
    setLoading(false);
  };

  if (!user) return null;

  return (
    <button
      data-testid="bookmark-btn"
      onClick={toggle}
      disabled={loading}
      className="p-1.5 rounded-lg transition-all"
      style={{ color: bookmarked ? '#f59e0b' : colors.textMuted }}
      title={bookmarked ? 'Remove bookmark' : 'Save for later'}
    >
      <Bookmark size={size} fill={bookmarked ? 'currentColor' : 'none'} />
    </button>
  );
};

export default BookmarkButton;
