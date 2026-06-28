'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { MessageCircle, Send, ChevronDown, ChevronUp, Trash2, Reply, Loader2 } from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showError, showConfirm } from '@/lib/toast';

interface Comment {
  id: string;
  user_id: string;
  user_name: string;
  user_picture?: string;
  content: string;
  created_at: string;
  replies?: Reply[];
}

interface Reply {
  id: string;
  user_id: string;
  user_name: string;
  user_picture?: string;
  content: string;
  created_at: string;
}

interface CommentItemProps {
  comment: Comment;
  colors: Record<string, string>;
  user: { user_id?: string } | null;
  onDelete: (id: string) => void;
  onReply: (parentId: string, content: string) => Promise<void>;
  replyingTo: string | null;
  setReplyingTo: (id: string | null) => void;
}

const timeAgo = (dateStr: string): string => {
  const diff = (Date.now() - new Date(dateStr).getTime()) / 1000;
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d ago`;
  return new Date(dateStr).toLocaleDateString();
};

const Avatar: React.FC<{ name?: string; picture?: string; size?: number }> = ({ name, picture, size = 32 }) => {
  if (picture) return <img src={picture} alt="" className="rounded-full flex-shrink-0" style={{ width: size, height: size }} />;
  return (
    <div className="rounded-full flex-shrink-0 flex items-center justify-center text-xs font-bold" style={{ width: size, height: size, backgroundColor: '#22c55e30', color: '#22c55e' }}>
      {(name || '?')[0].toUpperCase()}
    </div>
  );
};

const CommentItem: React.FC<CommentItemProps> = ({ comment, colors, user, onDelete, onReply, replyingTo, setReplyingTo }) => {
  const isOwn = user && user.user_id === comment.user_id;
  const [replyText, setReplyText] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const handleSubmitReply = async () => {
    if (!replyText.trim() || submitting) return;
    setSubmitting(true);
    await onReply(comment.id, replyText.trim());
    setReplyText('');
    setSubmitting(false);
    setReplyingTo(null);
  };

  return (
    <div data-testid={`comment-${comment.id}`} className="group">
      <div className="flex gap-2.5">
        <Avatar name={comment.user_name} picture={comment.user_picture} />
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-sm font-semibold" style={{ color: colors.text }}>{comment.user_name}</span>
            <span className="text-xs" style={{ color: colors.textMuted }}>{timeAgo(comment.created_at)}</span>
          </div>
          <p className="text-sm mt-0.5 whitespace-pre-wrap break-words" style={{ color: colors.textSecondary }}>{comment.content}</p>
          <div className="flex items-center gap-3 mt-1.5">
            {user && (
              <button
                data-testid={`reply-btn-${comment.id}`}
                onClick={() => setReplyingTo(replyingTo === comment.id ? null : comment.id)}
                className="flex items-center gap-1 text-xs transition-colors hover:opacity-80"
                style={{ color: colors.textMuted }}
              >
                <Reply size={12} /> Reply
              </button>
            )}
            {isOwn && (
              <button
                data-testid={`delete-btn-${comment.id}`}
                onClick={() => onDelete(comment.id)}
                className="flex items-center gap-1 text-xs opacity-0 group-hover:opacity-100 transition-opacity text-red-400 hover:text-red-300"
              >
                <Trash2 size={12} /> Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {replyingTo === comment.id && (
        <div className="ml-10 mt-2 flex gap-2">
          <input
            data-testid={`reply-input-${comment.id}`}
            value={replyText}
            onChange={e => setReplyText(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && handleSubmitReply()}
            placeholder="Write a reply..."
            maxLength={2000}
            autoFocus
            className="flex-1 text-sm px-3 py-2 rounded-lg border outline-none transition-colors"
            style={{ backgroundColor: colors.bgSecondary || colors.bg, borderColor: colors.border, color: colors.text }}
          />
          <button
            data-testid={`reply-submit-${comment.id}`}
            onClick={handleSubmitReply}
            disabled={!replyText.trim() || submitting}
            className="px-3 py-2 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
            style={{ backgroundColor: '#22c55e', color: '#fff' }}
          >
            {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
          </button>
        </div>
      )}

      {(comment.replies?.length ?? 0) > 0 && (
        <div className="ml-10 mt-2 space-y-2.5 pl-3 border-l-2" style={{ borderColor: colors.border }}>
          {comment.replies!.map(r => (
            <div key={r.id} data-testid={`reply-${r.id}`} className="flex gap-2 group/reply">
              <Avatar name={r.user_name} picture={r.user_picture} size={26} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-semibold" style={{ color: colors.text }}>{r.user_name}</span>
                  <span className="text-xs" style={{ color: colors.textMuted }}>{timeAgo(r.created_at)}</span>
                </div>
                <p className="text-sm mt-0.5 whitespace-pre-wrap break-words" style={{ color: colors.textSecondary }}>{r.content}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

interface LessonDiscussionsProps {
  lessonSlug: string;
  courseSlug: string;
}

const LessonDiscussions: React.FC<LessonDiscussionsProps> = ({ lessonSlug, courseSlug }) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [comments, setComments] = useState<Comment[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [expanded, setExpanded] = useState(true);
  const [newComment, setNewComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [replyingTo, setReplyingTo] = useState<string | null>(null);

  const token = null;
  const authHeaders = token ? { Authorization: `Bearer ${token}` } : undefined;

  const fetchComments = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<{ comments: Comment[]; total: number }>(`/lessons/${lessonSlug}/discussions`, { params: { course: courseSlug }, signal });
      if (signal?.aborted) return;
      setComments(res.data.comments || []);
      setTotal(res.data.total || 0);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
    }
    finally { setLoading(false); }
  }, [lessonSlug, courseSlug]);

  useEffect(() => {
    if (!lessonSlug) return;
    const ac = new AbortController();
    fetchComments(ac.signal);
    return () => ac.abort();
  }, [lessonSlug, fetchComments]);

  const handleSubmit = async () => {
    if (!newComment.trim() || submitting) return;
    setSubmitting(true);
    try {
      await api.post(`/lessons/${lessonSlug}/discussions`, { content: newComment.trim() }, { headers: authHeaders, params: { course: courseSlug } });
      setNewComment('');
      await fetchComments();
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : (err as Error)?.message || 'Failed to post comment');
    } finally {
      setSubmitting(false);
    }
  };

  const handleReply = async (parentId: string, content: string) => {
    try {
      await api.post(`/lessons/${lessonSlug}/discussions`, { content, parent_id: parentId }, { headers: authHeaders, params: { course: courseSlug } });
      await fetchComments();
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : (err as Error)?.message || 'Failed to post reply');
    }
  };

  const handleDelete = async (commentId: string) => {
    if (!(await showConfirm('Delete this comment?'))) return;
    try {
      await api.delete(`/discussions/${commentId}`, { headers: authHeaders });
      await fetchComments();
    } catch { /* ignore */ }
  };

  if (!lessonSlug) return null;

  return (
    <div data-testid="lesson-discussions" className="mt-10 border-t pt-6" style={{ borderColor: colors.border }}>
      <button
        data-testid="discussions-toggle"
        onClick={() => setExpanded(!expanded)}
        className="flex items-center gap-2 w-full text-left mb-4"
      >
        <MessageCircle size={18} style={{ color: '#22c55e' }} />
        <span className="text-base font-bold" style={{ color: colors.text }}>Discussion</span>
        <span className="text-xs px-2 py-0.5 rounded-full" style={{ backgroundColor: '#22c55e20', color: '#22c55e' }}>{total}</span>
        {expanded ? <ChevronUp size={14} style={{ color: colors.textMuted }} /> : <ChevronDown size={14} style={{ color: colors.textMuted }} />}
      </button>

      {expanded && (
        <div>
          {user ? (
            <div className="flex gap-2.5 mb-6" data-testid="comment-form">
              <Avatar name={user.name} picture={user.picture} />
              <div className="flex-1">
                <textarea
                  data-testid="comment-input"
                  value={newComment}
                  onChange={e => setNewComment(e.target.value)}
                  placeholder="Share your thoughts or ask a question..."
                  maxLength={2000}
                  rows={2}
                  className="w-full text-sm px-3 py-2.5 rounded-lg border outline-none resize-none transition-colors"
                  style={{ backgroundColor: colors.bgSecondary || colors.bg, borderColor: colors.border, color: colors.text }}
                  onFocus={e => e.target.style.borderColor = '#22c55e'}
                  onBlur={e => e.target.style.borderColor = colors.border}
                />
                <div className="flex justify-between items-center mt-2">
                  <span className="text-xs" style={{ color: colors.textMuted }}>{newComment.length}/2000</span>
                  <button
                    data-testid="comment-submit"
                    onClick={handleSubmit}
                    disabled={!newComment.trim() || submitting}
                    className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium transition-opacity disabled:opacity-40"
                    style={{ backgroundColor: '#22c55e', color: '#fff' }}
                  >
                    {submitting ? <Loader2 size={14} className="animate-spin" /> : <Send size={14} />}
                    Post
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="text-center py-4 mb-4 rounded-lg border" style={{ borderColor: colors.border, backgroundColor: colors.bgCard }}>
              <p className="text-sm" style={{ color: colors.textMuted }}>
                <a href="/login" className="underline" style={{ color: '#22c55e' }}>Sign in</a> to join the discussion
              </p>
            </div>
          )}

          {loading ? (
            <div className="flex justify-center py-6">
              <Loader2 size={20} className="animate-spin" style={{ color: '#22c55e' }} />
            </div>
          ) : comments.length === 0 ? (
            <p className="text-center text-sm py-6" style={{ color: colors.textMuted }}>No comments yet. Be the first to start a discussion!</p>
          ) : (
            <div className="space-y-5">
              {comments.map(c => (
                <CommentItem
                  key={c.id}
                  comment={c}
                  colors={colors}
                  user={user}
                  onDelete={handleDelete}
                  onReply={handleReply}
                  replyingTo={replyingTo}
                  setReplyingTo={setReplyingTo}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default LessonDiscussions;
