'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Layers, ArrowLeft, Loader2, ThumbsUp, ThumbsDown, Eye, Lightbulb, Trash2 } from 'lucide-react';
import { api } from '@/lib/api';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import PageHeader from './PageHeader';

interface CardData {
  id: string;
  front: string;
  back: string;
  difficulty: string;
  status: string;
  hint?: string;
}

interface DeckData {
  topic: string;
  cards: CardData[];
}

interface FlashcardsData {
  total: number;
  stats: { new: number; review: number; got_it: number };
  decks: DeckData[];
}

const DIFF_COLORS: Record<string, string> = { easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444' };
const STATUS_COLORS: Record<string, string> = { new: '#8b949e', got_it: '#22c55e', review: '#ef4444' };

const FlashcardsPage: React.FC = () => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const router = useRouter();
  const [data, setData] = useState<FlashcardsData | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeFilter, setActiveFilter] = useState('all');
  const [reviewDeck, setReviewDeck] = useState<CardData[] | null>(null);
  const [reviewIdx, setReviewIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);

  const sessionToken = user?.session_token;

  useEffect(() => {
    if (!sessionToken) return;
    const ac = new AbortController();
    const fetch = async () => {
      try {
        const res = await api.get<FlashcardsData>('/tutor/flashcards', {
          headers: { Authorization: `Bearer ${sessionToken}` },
          signal: ac.signal,
        });
        if (ac.signal.aborted) return;
        setData(res.data);
      } catch (err) {
        if (err && typeof err === 'object' && (err as { name?: string }).name === 'AbortError') return;
        setData(null);
      }
      finally { setLoading(false); }
    };
    fetch();
    return () => ac.abort();
  }, [sessionToken]);

  const updateCard = async (cardId: string, status: string) => {
    try {
      await api.put(`/tutor/flashcards/${cardId}/review`, { status }, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setData(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.decks = updated.decks.map(d => ({
          ...d,
          cards: d.cards.map(c => c.id === cardId ? { ...c, status } : c),
        }));
        return updated;
      });
      if (reviewDeck) {
        setReviewDeck(prev => (prev ?? []).map(c => c.id === cardId ? { ...c, status } : c));
        setFlipped(false);
        setShowHint(false);
        if (reviewIdx < reviewDeck.length - 1) setReviewIdx(reviewIdx + 1);
      }
    } catch {}
  };

  const deleteCard = async (cardId: string) => {
    try {
      await api.delete(`/tutor/flashcards/${cardId}`, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setData(prev => {
        if (!prev) return prev;
        const updated = { ...prev };
        updated.decks = updated.decks.map(d => ({
          ...d,
          cards: d.cards.filter(c => c.id !== cardId),
        })).filter(d => d.cards.length > 0);
        updated.total = updated.decks.reduce((s, d) => s + d.cards.length, 0);
        return updated;
      });
    } catch {}
  };

  const startReview = (cards: CardData[]) => {
    const filtered = activeFilter === 'all' ? cards : cards.filter(c => c.status === activeFilter);
    if (filtered.length === 0) return;
    setReviewDeck(filtered);
    setReviewIdx(0);
    setFlipped(false);
    setShowHint(false);
  };

  if (loading && sessionToken) return (
    <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
      <Loader2 className="animate-spin" size={32} style={{ color: colors.green }} />
    </div>
  );

  if (reviewDeck && reviewDeck.length > 0) {
    const card = reviewDeck[reviewIdx];
    const diff = DIFF_COLORS[card?.difficulty] || '#f59e0b';
    return (
      <div className="min-h-screen py-12 px-4" style={{ backgroundColor: colors.bg }}>
        <div className="max-w-lg mx-auto">
          <div className="flex items-center justify-between mb-6">
            <button onClick={() => setReviewDeck(null)} className="flex items-center gap-1 text-sm" style={{ color: colors.textSecondary }}>
              <ArrowLeft size={16} /> Back
            </button>
            <span className="text-sm" style={{ color: colors.textSecondary }}>{reviewIdx + 1}/{reviewDeck.length}</span>
          </div>

          <div onClick={() => setFlipped(!flipped)} className="cursor-pointer rounded-xl border p-8 text-center transition-all hover:border-opacity-60 min-h-[220px] flex items-center justify-center"
            style={{ borderColor: flipped ? colors.green + '40' : colors.border, backgroundColor: flipped ? colors.green + '05' : colors.bgCard }}>
            {!flipped ? (
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-4 font-semibold" style={{ color: diff }}>{card?.difficulty}</p>
                <p className="text-base font-medium" style={{ color: colors.text }}>{card?.front}</p>
                {showHint && card?.hint && <p className="text-sm mt-4 italic" style={{ color: '#f59e0b' }}>{card.hint}</p>}
                <p className="text-xs mt-6" style={{ color: colors.textMuted }}>Tap to reveal</p>
              </div>
            ) : (
              <div>
                <p className="text-[10px] uppercase tracking-wider mb-4 font-semibold" style={{ color: colors.green }}>Answer</p>
                <p className="text-sm leading-relaxed" style={{ color: colors.text }}>{card?.back}</p>
              </div>
            )}
          </div>

          <div className="flex justify-center gap-3 mt-6">
            {!flipped ? (
              <>
                <button onClick={(e) => { e.stopPropagation(); setShowHint(!showHint); }} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: '#f59e0b40', color: '#f59e0b' }}>
                  <Lightbulb size={14} /> Hint
                </button>
                <button onClick={() => setFlipped(true)} className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: colors.green }}>
                  <Eye size={14} /> Reveal
                </button>
              </>
            ) : (
              <>
                <button onClick={() => updateCard(card.id, 'review')} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-colors" style={{ borderColor: '#ef444440', color: '#ef4444' }}>
                  <ThumbsDown size={14} /> Review Again
                </button>
                <button onClick={() => updateCard(card.id, 'got_it')} className="flex items-center gap-1.5 text-sm px-5 py-2 rounded-lg text-white font-medium" style={{ backgroundColor: colors.green }}>
                  <ThumbsUp size={14} /> Got It
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />
      <div className="py-12 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-3 mb-6">
          <button onClick={() => router.back()} className="p-1" style={{ color: colors.textSecondary }}><ArrowLeft size={20} /></button>
          <h1 className="text-2xl font-bold" style={{ color: colors.text }}>My Flashcards</h1>
        </div>

        {data && data.total > 0 && (
          <div className="flex items-center gap-4 mb-6 flex-wrap">
            {['all', 'new', 'review', 'got_it'].map(f => (
              <button key={f} onClick={() => setActiveFilter(f)} className="text-xs px-3 py-1.5 rounded-full font-medium transition-colors" style={{
                backgroundColor: activeFilter === f ? (f === 'all' ? colors.green + '20' : (STATUS_COLORS[f] || colors.green) + '20') : colors.bgTertiary,
                color: activeFilter === f ? (f === 'all' ? colors.green : STATUS_COLORS[f]) : colors.textSecondary,
              }}>
                {f === 'all' ? `All (${data.total})` : f === 'got_it' ? `Mastered (${data.stats.got_it})` : f === 'review' ? `Review (${data.stats.review})` : `New (${data.stats.new})`}
              </button>
            ))}
          </div>
        )}

        {!data || data.total === 0 ? (
          <div className="text-center py-16 rounded-xl" style={{ backgroundColor: colors.bgCard, border: `1px solid ${colors.border}` }}>
            <Layers size={48} className="mx-auto mb-4" style={{ color: colors.textMuted }} />
            <h2 className="text-lg font-bold mb-2" style={{ color: colors.text }}>No Flashcards Yet</h2>
            <p className="text-sm" style={{ color: colors.textSecondary }}>Open AI Tutor from any lesson and generate flashcards to start reviewing.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {data.decks.map(deck => {
              const filteredCards = activeFilter === 'all' ? deck.cards : deck.cards.filter(c => c.status === activeFilter);
              if (filteredCards.length === 0) return null;
              return (
                <div key={deck.topic} className="rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
                  <div className="px-5 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}` }}>
                    <div>
                      <h3 className="text-sm font-bold" style={{ color: colors.text }}>{deck.topic}</h3>
                      <p className="text-[11px]" style={{ color: colors.textSecondary }}>{filteredCards.length} cards</p>
                    </div>
                    <button onClick={() => startReview(deck.cards)} className="text-xs px-3 py-1.5 rounded-lg font-medium text-white" style={{ backgroundColor: colors.green }}>
                      Review
                    </button>
                  </div>
                  <div className="divide-y" style={{ borderColor: colors.border }}>
                    {filteredCards.slice(0, 5).map(card => (
                      <div key={card.id} className="px-5 py-3 flex items-center justify-between">
                        <div className="flex-1 mr-4">
                          <p className="text-xs font-medium" style={{ color: colors.text }}>{card.front}</p>
                        </div>
                        <div className="flex items-center gap-2 flex-shrink-0">
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full" style={{ backgroundColor: (STATUS_COLORS[card.status] || '#8b949e') + '15', color: STATUS_COLORS[card.status] }}>
                            {card.status === 'got_it' ? 'Mastered' : card.status === 'review' ? 'Review' : 'New'}
                          </span>
                          <button onClick={() => deleteCard(card.id)} className="p-1 text-[#484f58] hover:text-red-400 transition-colors"><Trash2 size={12} /></button>
                        </div>
                      </div>
                    ))}
                    {filteredCards.length > 5 && (
                      <div className="px-5 py-2 text-center">
                        <span className="text-[11px]" style={{ color: colors.textMuted }}>+{filteredCards.length - 5} more cards</span>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
      </div>
    </div>
  );
};

export default FlashcardsPage;
