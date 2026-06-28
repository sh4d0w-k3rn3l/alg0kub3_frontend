'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { api } from '@/lib/api';
import { ThumbsUp, ThumbsDown, Check, Loader2 } from 'lucide-react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
const ANON_KEY = 'ak_feedback_anon_id';

const getAnonId = (): string => {
  try {
    let v = typeof window !== 'undefined' ? localStorage.getItem(ANON_KEY) : null;
    if (!v) {
      v = 'anon-' + Math.random().toString(36).slice(2) + Date.now().toString(36);
      if (typeof window !== 'undefined') localStorage.setItem(ANON_KEY, v);
    }
    return v;
  } catch {
    return 'anon-' + Math.random().toString(36).slice(2);
  }
};

interface LessonFeedbackProps {
  lessonSlug: string;
}

const LessonFeedback: React.FC<LessonFeedbackProps> = ({ lessonSlug }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [summary, setSummary] = useState<{ up: number; down: number; my_rating: number | null }>({ up: 0, down: 0, my_rating: null });
  const [picked, setPicked] = useState<number | null>(null);
  const [showComment, setShowComment] = useState(false);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [thanks, setThanks] = useState(false);

  const anonId = getAnonId();

  const load = useCallback(async (signal?: AbortSignal) => {
    if (!lessonSlug) return;
    try {
      const params = user ? undefined : { anon_id: anonId };
      const r = await api.get<{ up: number; down: number; my_rating: number | null }>(`/lessons/${lessonSlug}/feedback-summary`, {
        params,
        signal,
      });
      if (signal?.aborted) return;
      setSummary(r.data);
      setPicked(r.data.my_rating);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
  }, [lessonSlug, user, anonId]);

  useEffect(() => {
    const ac = new AbortController();
    load(ac.signal);
    return () => ac.abort();
  }, [load]);

  useEffect(() => {
    setShowComment(false);
    setComment('');
    setThanks(false);
  }, [lessonSlug]);

  const submit = async (rating: number, commentText = '') => {
    if (!lessonSlug || submitting) return;
    setSubmitting(true);
    const prev = picked;
    setPicked(rating);
    try {
      await api.post(
        `/lessons/${lessonSlug}/feedback`,
        { rating, comment: commentText },
      );
      await load();
      if (rating <= 2 && !commentText) {
        setShowComment(true);
      } else {
        setThanks(true);
        setTimeout(() => setThanks(false), 2500);
      }
    } catch {
      setPicked(prev);
    } finally {
      setSubmitting(false);
    }
  };

  const onUp = () => submit(5);
  const onDown = () => submit(1);
  const onSubmitComment = async () => {
    const c = comment.trim();
    if (!c) { setShowComment(false); return; }
    await submit(1, c);
    setComment('');
    setShowComment(false);
  };

  const total = (summary.up || 0) + (summary.down || 0);
  const ratio = total > 0 ? Math.round((summary.up / total) * 100) : null;

  const isUp = picked !== null && picked >= 4;
  const isDown = picked !== null && picked <= 2;

  return (
    <div
      data-testid="lesson-feedback-widget"
      className="mt-10 mb-6 border rounded-xl px-5 py-5"
      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
    >
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <p className="text-sm font-semibold mb-1" style={{ color: colors.text }}>
            {thanks ? 'Thanks for the signal!' : 'Was this lesson helpful?'}
          </p>
          <p className="text-xs" style={{ color: colors.textMuted }}>
            {total > 0
              ? `${ratio}% helpful · ${total} ${total === 1 ? 'vote' : 'votes'}`
              : 'Be the first to rate this lesson.'}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            data-testid="feedback-thumbs-up"
            onClick={onUp}
            disabled={submitting}
            aria-pressed={isUp}
            aria-label="Helpful"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-60"
            style={{
              backgroundColor: isUp ? '#22c55e22' : 'transparent',
              borderColor: isUp ? '#22c55e80' : colors.border,
              color: isUp ? '#22c55e' : colors.textSecondary,
            }}
          >
            {submitting && picked === 5 ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isUp ? (
              <Check size={15} />
            ) : (
              <ThumbsUp size={15} />
            )}
            <span>Yes</span>
            {summary.up > 0 && (
              <span className="text-xs" style={{ color: colors.textMuted }}>· {summary.up}</span>
            )}
          </button>

          <button
            data-testid="feedback-thumbs-down"
            onClick={onDown}
            disabled={submitting}
            aria-pressed={isDown}
            aria-label="Not helpful"
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg border text-sm font-medium transition-all disabled:opacity-60"
            style={{
              backgroundColor: isDown ? '#ef444422' : 'transparent',
              borderColor: isDown ? '#ef444480' : colors.border,
              color: isDown ? '#ef4444' : colors.textSecondary,
            }}
          >
            {submitting && picked === 1 ? (
              <Loader2 size={15} className="animate-spin" />
            ) : isDown ? (
              <Check size={15} />
            ) : (
              <ThumbsDown size={15} />
            )}
            <span>No</span>
            {summary.down > 0 && (
              <span className="text-xs" style={{ color: colors.textMuted }}>· {summary.down}</span>
            )}
          </button>
        </div>
      </div>

      {showComment && (
        <div
          data-testid="feedback-comment-section"
          className="mt-4 pt-4 border-t"
          style={{ borderColor: colors.border }}
        >
          <label className="block text-xs mb-2" style={{ color: colors.textMuted }}>
            What would make this lesson better? <span style={{ color: colors.textMuted }}>(optional)</span>
          </label>
          <textarea
            data-testid="feedback-comment-input"
            value={comment}
            onChange={(e) => setComment(e.target.value.slice(0, 1000))}
            placeholder="Unclear sections, missing examples, broken diagrams…"
            rows={3}
            className="w-full rounded-md border px-3 py-2 text-sm resize-y focus:outline-none focus:ring-1"
            style={{
              backgroundColor: colors.bg,
              color: colors.text,
              borderColor: colors.border,
            }}
          />
          <div className="flex items-center justify-end gap-2 mt-3">
            <button
              data-testid="feedback-comment-skip"
              onClick={() => { setShowComment(false); setComment(''); }}
              className="px-3 py-1.5 rounded-md text-xs transition-colors"
              style={{ color: colors.textMuted }}
            >
              Skip
            </button>
            <button
              data-testid="feedback-comment-submit"
              onClick={onSubmitComment}
              disabled={submitting}
              className="px-4 py-1.5 rounded-md text-xs font-medium transition-opacity hover:opacity-90 disabled:opacity-60"
              style={{ backgroundColor: colors.green, color: '#fff' }}
            >
              {submitting ? 'Sending…' : 'Send feedback'}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default LessonFeedback;
