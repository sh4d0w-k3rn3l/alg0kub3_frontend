'use client';

import React, { useState, useRef, useEffect } from 'react';
import {
  X, Send, Sparkles, Loader2, Bot, User, HelpCircle, Layers,
  Briefcase, RotateCcw, Eye,
  CheckCircle, XCircle, Code, ToggleLeft, MessageSquare, Lightbulb,
  ThumbsUp, ThumbsDown,
} from 'lucide-react';
import { api, ApiError } from '@/lib/api';
import { showError } from '@/lib/toast';

const TABS = [
  { key: 'chat', label: 'Chat', icon: Sparkles },
  { key: 'quiz', label: 'Quiz', icon: HelpCircle },
  { key: 'flashcards', label: 'Cards', icon: Layers },
  { key: 'interview', label: 'Interview', icon: Briefcase },
];

const DIFF_COLORS: Record<string, string> = {
  easy: '#22c55e', medium: '#f59e0b', hard: '#ef4444',
};

const TYPE_ICONS: Record<string, React.FC<{ size?: number }>> = {
  mcq: HelpCircle, true_false: ToggleLeft, code_snippet: Code, free_text: MessageSquare,
  technical: Code, coding: Code, behavioral: User,
};

const renderMarkdown = (text: string): React.ReactNode => {
  const parts = (text || '').split(/(```[\s\S]*?```)/g);
  return parts.map((part, i) => {
    if (part.startsWith('```')) {
      const code = part.replace(/```\w*\n?/g, '').replace(/```$/g, '').trim();
      return <pre key={i} className="bg-[#0d1117] rounded-md p-3 my-2 overflow-x-auto text-[13px] font-mono text-[#c9d1d9]"><code>{code}</code></pre>;
    }
    const inlineparts = part.split(/(`[^`]+`)/g);
    return (
      <span key={i}>{inlineparts.map((ip, j) => {
        if (ip.startsWith('`') && ip.endsWith('`')) return <code key={j} className="bg-[#1c2333] px-1.5 py-0.5 rounded text-[13px] text-[#e6edf3]">{ip.slice(1, -1)}</code>;
        const boldParts = ip.split(/(\*\*[^*]+\*\*)/g);
        return boldParts.map((bp, k) => bp.startsWith('**') && bp.endsWith('**')
          ? <strong key={`${j}-${k}`} className="text-white">{bp.slice(2, -2)}</strong>
          : <span key={`${j}-${k}`}>{bp}</span>);
      })}</span>
    );
  });
};

interface ChatMessage {
  role: 'user' | 'assistant';
  content: string;
}

const ChatTab = ({ lessonSlug, courseSlug, sessionToken }: { lessonSlug: string; courseSlug: string; sessionToken: string }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [sessionId, setSessionId] = useState('');
  const endRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => { endRef.current?.scrollIntoView({ behavior: 'smooth' }); }, [messages]);
  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    setMessages([]); setSessionId('');
  }, [lessonSlug]);
  useEffect(() => { inputRef.current?.focus(); }, []);

  const send = async () => {
    if (!input.trim() || loading) return;
    const text = input.trim();
    setMessages(prev => [...prev, { role: 'user', content: text }]);
    setInput('');
    setLoading(true);
    try {
      const res = await api.post<{ session_id: string; answer: string }>(`/tutor/chat`, {
        message: text, lesson_slug: lessonSlug, course_slug: courseSlug, session_id: sessionId,
      }, { headers: { Authorization: `Bearer ${sessionToken}` } });
      setSessionId(res.data.session_id);
      setMessages(prev => [...prev, { role: 'assistant', content: res.data.answer }]);
    } catch (err: unknown) {
      const msg = err instanceof ApiError && err.status === 403 ? 'Pro subscription required for AI Tutor.' : 'Something went wrong. Try again.';
      setMessages(prev => [...prev, { role: 'assistant', content: msg }]);
    } finally { setLoading(false); }
  };

  const suggestions = ['Explain this concept simply', 'Show me a code example', 'What are common mistakes here?', 'Why is this important?'];

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-4 space-y-3" style={{ minHeight: 0 }}>
        {messages.length === 0 && (
          <div className="text-center py-6">
            <Bot size={28} className="text-[#22c55e] mx-auto mb-2 opacity-60" />
            <p className="text-[#8b949e] text-xs mb-3">Ask me anything about your lesson</p>
            <div className="flex flex-wrap gap-1.5 justify-center">
              {suggestions.map((q, i) => (
                <button key={i} onClick={() => { setInput(q); inputRef.current?.focus(); }}
                  className="px-2.5 py-1 text-[11px] border border-[#2d333b] rounded-full text-[#8b949e] hover:text-white hover:border-[#484f58] transition-colors">{q}</button>
              ))}
            </div>
          </div>
        )}
        {messages.map((msg, i) => (
          <div key={i} className={`flex gap-2 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            {msg.role === 'assistant' && <div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex-shrink-0 flex items-center justify-center mt-0.5"><Bot size={12} className="text-[#22c55e]" /></div>}
            <div className={`max-w-[85%] rounded-lg px-3 py-2 text-[13px] leading-relaxed ${msg.role === 'user' ? 'bg-[#22c55e]/15 text-[#c9d1d9]' : 'bg-[#161b22] text-[#c9d1d9] border border-[#2d333b]'}`}>
              {msg.role === 'assistant' ? renderMarkdown(msg.content) : msg.content}
            </div>
            {msg.role === 'user' && <div className="w-6 h-6 rounded-full bg-[#2d333b] flex-shrink-0 flex items-center justify-center mt-0.5"><User size={12} className="text-[#8b949e]" /></div>}
          </div>
        ))}
        {loading && <div className="flex gap-2"><div className="w-6 h-6 rounded-full bg-[#22c55e]/20 flex-shrink-0 flex items-center justify-center"><Bot size={12} className="text-[#22c55e]" /></div><div className="bg-[#161b22] border border-[#2d333b] rounded-lg px-3 py-2"><Loader2 size={14} className="text-[#22c55e] animate-spin" /></div></div>}
        <div ref={endRef} />
      </div>
      <div className="border-t border-[#1e2533] p-2.5" style={{ backgroundColor: '#161b22' }}>
        <div className="flex items-end gap-2">
          <textarea ref={inputRef} value={input} onChange={e => setInput(e.target.value)}
            onKeyDown={e => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send(); } }}
            data-testid="tutor-chat-input"
            placeholder="Ask a question..." className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[#c9d1d9] text-[13px] outline-none focus:border-[#22c55e] resize-none placeholder-[#484f58]" rows={1} style={{ maxHeight: '60px' }} />
          <button onClick={send} disabled={!input.trim() || loading} data-testid="tutor-chat-send" className="p-2 bg-[#22c55e] hover:bg-[#16a34a] disabled:opacity-40 rounded-lg text-white transition-colors flex-shrink-0"><Send size={14} /></button>
        </div>
      </div>
    </div>
  );
};

const QuizTab = ({ lessonSlug, courseSlug, lessonTitle, sessionToken }: { lessonSlug: string; courseSlug: string; lessonTitle: string; sessionToken: string }) => {
  const [quiz, setQuiz] = useState<{ questions: QuizQuestion[] } | null>(null);
  const [loading, setLoading] = useState(false);
  const [answers, setAnswers] = useState<Record<string, unknown>>({});
  const [result, setResult] = useState<{ score: number; total: number; pct: number; details: QuizQuestion[] } | null>(null);
  const [currentQ, setCurrentQ] = useState(0);
  const [topic, setTopic] = useState('');

  interface QuizQuestion {
    id: string;
    question: string;
    type: string;
    options?: string[];
    correct_answer?: number;
    expected_keywords?: string[];
    explanation?: string;
    code_snippet?: string;
    user_answer?: unknown;
    is_correct?: boolean;
  }

  const generate = async () => {
    setLoading(true);
    setQuiz(null); setResult(null); setAnswers({});
    try {
      const res = await api.post<{ questions: QuizQuestion[] }>(`/tutor/quiz`, {
        topic: topic || lessonTitle, lesson_slug: lessonSlug, course_slug: courseSlug, count: 5,
      }, { headers: { Authorization: `Bearer ${sessionToken}` } });
      setQuiz(res.data);
      setCurrentQ(0);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) showError('Pro subscription required');
    } finally { setLoading(false); }
  };

  const grade = () => {
    if (!quiz) return;
    let correct = 0;
    const details = quiz.questions.map(q => {
      const ans = answers[q.id];
      let isCorrect = false;
      if (q.type === 'free_text') {
        const text = String(ans || '').toLowerCase();
        const kws = (q.expected_keywords || []).map(k => k.toLowerCase());
        isCorrect = kws.length > 0 && kws.filter(k => text.includes(k)).length >= Math.max(1, Math.floor(kws.length / 2));
      } else {
        isCorrect = parseInt(ans as string) === q.correct_answer;
      }
      if (isCorrect) correct++;
      return { ...q, user_answer: ans, is_correct: isCorrect };
    });
    setResult({ score: correct, total: quiz.questions.length, pct: Math.round(correct / quiz.questions.length * 100), details });
  };

  if (!quiz && !loading) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <HelpCircle size={28} className="text-[#22c55e] mb-2 opacity-60" />
      <p className="text-[#c9d1d9] text-sm font-medium mb-1">Practice Quiz</p>
      <p className="text-[#8b949e] text-[11px] mb-4">Generate a quiz on any topic or your current lesson</p>
      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={lessonTitle || 'Enter topic...'} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[13px] text-[#c9d1d9] outline-none focus:border-[#22c55e] mb-3 placeholder-[#484f58]" />
      <button data-testid="tutor-generate-quiz" onClick={generate} className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
        <Sparkles size={13} /> Generate Quiz
      </button>
    </div>
  );

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="text-[#22c55e] animate-spin" /><span className="ml-2 text-[#8b949e] text-xs">Generating quiz...</span></div>;

  if (result) {
    const scoreColor = result.pct >= 80 ? '#22c55e' : result.pct >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div className="overflow-y-auto h-full p-4">
        <div className="text-center mb-4">
          <div className="text-2xl font-bold" style={{ color: scoreColor }}>{result.score}/{result.total}</div>
          <p className="text-xs" style={{ color: scoreColor }}>{result.pct}% correct</p>
        </div>
        <div className="space-y-2 mb-4">
          {result.details.map((q, i) => (
            <div key={i} className="p-2.5 rounded-lg border border-[#2d333b] bg-[#161b22]">
              <div className="flex items-start gap-1.5 mb-1">
                {q.is_correct ? <CheckCircle size={13} className="text-green-500 mt-0.5" /> : <XCircle size={13} className="text-red-400 mt-0.5" />}
                <span className="text-[12px] text-[#c9d1d9]">{q.question}</span>
              </div>
              <p className="text-[11px] text-[#8b949e] ml-5">{q.explanation}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={() => { setQuiz(null); setResult(null); setAnswers({}); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg border border-[#2d333b] text-[#8b949e] hover:text-white transition-colors"><RotateCcw size={12} /> New Quiz</button>
          <button onClick={() => { setResult(null); setCurrentQ(0); setAnswers({}); }} className="flex items-center gap-1 text-xs px-3 py-1.5 rounded-lg text-white bg-[#22c55e]"><RotateCcw size={12} /> Retry</button>
        </div>
      </div>
    );
  }

  const q = quiz!.questions[currentQ];
  const allDone = quiz!.questions.every(qq => answers[qq.id] !== undefined && answers[qq.id] !== null);
  const TIcon = TYPE_ICONS[q.type] || HelpCircle;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#1e2533] flex items-center justify-between bg-[#161b22]">
        <span className="text-[11px] text-[#8b949e]">Q{currentQ + 1}/{quiz!.questions.length}</span>
        <div className="flex gap-1">{quiz!.questions.map((_, i) => (
          <button key={i} onClick={() => setCurrentQ(i)} className="w-5 h-5 rounded-full text-[9px] font-bold flex items-center justify-center" style={{ backgroundColor: answers[quiz!.questions[i].id] != null ? '#22c55e20' : '#21262d', color: i === currentQ ? '#22c55e' : '#484f58', border: i === currentQ ? '1.5px solid #22c55e' : '1px solid #2d333b' }}>{i + 1}</button>
        ))}</div>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-1.5 mb-2"><span className="text-[#22c55e]"><TIcon size={12} /></span><span className="text-[10px] uppercase tracking-wider text-[#22c55e] font-semibold">{q.type.replace('_', ' ')}</span></div>
        <p className="text-[13px] text-[#c9d1d9] font-medium mb-3">{q.question}</p>
        {q.code_snippet && <pre className="bg-[#0d1117] rounded-lg p-2.5 mb-3 text-[12px] font-mono text-[#c9d1d9] overflow-x-auto"><code>{q.code_snippet}</code></pre>}
        {q.type === 'free_text' ? (
          <textarea data-testid="tutor-quiz-freetext" value={(answers[q.id] as string) || ''} onChange={e => setAnswers(prev => ({ ...prev, [q.id]: e.target.value }))} placeholder="Type your answer..." rows={3} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[13px] text-[#c9d1d9] outline-none focus:border-[#22c55e] resize-none placeholder-[#484f58]" />
        ) : (q.options || []).map((opt, oi) => (
          <button key={oi} data-testid={`tutor-quiz-opt-${oi}`} onClick={() => setAnswers(prev => ({ ...prev, [q.id]: oi }))} className="w-full text-left px-3 py-2 rounded-lg border text-[12px] mb-1.5 transition-all" style={{ borderColor: answers[q.id] === oi ? '#22c55e' : '#2d333b', backgroundColor: answers[q.id] === oi ? '#22c55e12' : 'transparent', color: '#c9d1d9' }}>
            {q.type !== 'true_false' && <span className="font-mono text-[10px] mr-1.5 text-[#484f58]">{String.fromCharCode(65 + oi)}.</span>}{opt}
          </button>
        ))}
      </div>
      <div className="px-3 py-2 border-t border-[#1e2533] flex justify-between bg-[#161b22]">
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0} className="text-[11px] px-2.5 py-1 rounded border border-[#2d333b] text-[#8b949e] disabled:opacity-30">Prev</button>
        {currentQ < quiz!.questions.length - 1 ? (
          <button data-testid="tutor-quiz-next" onClick={() => setCurrentQ(currentQ + 1)} className="text-[11px] px-3 py-1 rounded bg-[#22c55e] text-white font-medium">Next</button>
        ) : (
          <button data-testid="tutor-quiz-submit" onClick={grade} disabled={!allDone} className="text-[11px] px-3 py-1 rounded bg-[#22c55e] text-white font-medium disabled:opacity-40">Submit</button>
        )}
      </div>
    </div>
  );
};

const FlashcardsTab = ({ lessonSlug, courseSlug, lessonTitle, sessionToken }: { lessonSlug: string; courseSlug: string; lessonTitle: string; sessionToken: string }) => {
  const [cards, setCards] = useState<FlashCard[]>([]);
  const [loading, setLoading] = useState(false);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [flipped, setFlipped] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [topic, setTopic] = useState('');
  const [mode, setMode] = useState('generate');

  interface FlashCard {
    id: string;
    front: string;
    back: string;
    hint?: string;
    difficulty?: string;
    status?: string;
  }

  const generate = async () => {
    setLoading(true);
    try {
      const res = await api.post<{ cards: FlashCard[] }>(`/tutor/flashcards/generate`, {
        topic: topic || lessonTitle, lesson_slug: lessonSlug, course_slug: courseSlug, count: 8,
      }, { headers: { Authorization: `Bearer ${sessionToken}` } });
      setCards(res.data.cards || []);
      setCurrentIdx(0);
      setFlipped(false);
      setMode('review');
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) showError('Pro subscription required');
    } finally { setLoading(false); }
  };

  const markCard = async (status: string) => {
    const card = cards[currentIdx];
    if (!card) return;
    try {
      await api.put(`/tutor/flashcards/${card.id}/review`, { status }, {
        headers: { Authorization: `Bearer ${sessionToken}` },
      });
      setCards(prev => prev.map((c, i) => i === currentIdx ? { ...c, status } : c));
    } catch {}
    setFlipped(false);
    setShowHint(false);
    if (currentIdx < cards.length - 1) setCurrentIdx(currentIdx + 1);
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="text-[#22c55e] animate-spin" /><span className="ml-2 text-[#8b949e] text-xs">Creating flashcards...</span></div>;

  if (mode === 'generate' || cards.length === 0) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Layers size={28} className="text-[#22c55e] mb-2 opacity-60" />
      <p className="text-[#c9d1d9] text-sm font-medium mb-1">Flashcards</p>
      <p className="text-[#8b949e] text-[11px] mb-4">Generate cards to memorize key concepts</p>
      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={lessonTitle || 'Enter topic...'} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[13px] text-[#c9d1d9] outline-none focus:border-[#22c55e] mb-3 placeholder-[#484f58]" />
      <button data-testid="tutor-generate-flashcards" onClick={generate} className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
        <Sparkles size={13} /> Generate Flashcards
      </button>
    </div>
  );

  const card = cards[currentIdx];
  const diff = DIFF_COLORS[card?.difficulty || ''] || '#f59e0b';
  const remaining = cards.filter(c => c.status !== 'got_it').length;

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#1e2533] flex items-center justify-between bg-[#161b22]">
        <span className="text-[11px] text-[#8b949e]">{currentIdx + 1}/{cards.length}</span>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-[#484f58]">{remaining} remaining</span>
          <button onClick={() => { setMode('generate'); setCards([]); }} className="text-[10px] text-[#484f58] hover:text-white transition-colors">New set</button>
        </div>
      </div>

      <div className="flex-1 flex items-center justify-center p-4">
        <div data-testid="flashcard" onClick={() => setFlipped(!flipped)} className="w-full cursor-pointer rounded-xl border p-6 text-center transition-all hover:border-[#484f58]" style={{ borderColor: '#2d333b', backgroundColor: flipped ? '#0f1a12' : '#161b22', minHeight: '160px' }}>
          {!flipped ? (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-3 font-semibold" style={{ color: diff }}>{card?.difficulty}</p>
              <p className="text-[14px] text-[#c9d1d9] font-medium">{card?.front}</p>
              {showHint && card?.hint && <p className="text-[11px] text-[#f59e0b] mt-3 italic">{card.hint}</p>}
              <p className="text-[10px] text-[#484f58] mt-4">Tap to reveal answer</p>
            </div>
          ) : (
            <div>
              <p className="text-[10px] uppercase tracking-wider mb-3 text-[#22c55e] font-semibold">Answer</p>
              <p className="text-[13px] text-[#c9d1d9] leading-relaxed">{card?.back}</p>
            </div>
          )}
        </div>
      </div>

      <div className="px-3 py-2 border-t border-[#1e2533] bg-[#161b22]">
        {!flipped ? (
          <div className="flex justify-center gap-2">
            <button onClick={() => setShowHint(!showHint)} className="text-[11px] px-3 py-1.5 rounded border border-[#2d333b] text-[#f59e0b] hover:bg-[#f59e0b10] transition-colors flex items-center gap-1">
              <Lightbulb size={12} /> Hint
            </button>
            <button onClick={() => setFlipped(true)} className="text-[11px] px-4 py-1.5 rounded bg-[#22c55e] text-white font-medium flex items-center gap-1">
              <Eye size={12} /> Reveal
            </button>
          </div>
        ) : (
          <div className="flex justify-center gap-2">
            <button data-testid="flashcard-review" onClick={() => markCard('review')} className="text-[11px] px-3 py-1.5 rounded border border-[#ef4444]/30 text-[#ef4444] hover:bg-[#ef4444]/10 transition-colors flex items-center gap-1">
              <ThumbsDown size={12} /> Review Again
            </button>
            <button data-testid="flashcard-got-it" onClick={() => markCard('got_it')} className="text-[11px] px-3 py-1.5 rounded bg-[#22c55e] text-white font-medium flex items-center gap-1">
              <ThumbsUp size={12} /> Got It
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

const InterviewTab = ({ lessonSlug, courseSlug, lessonTitle, sessionToken }: { lessonSlug: string; courseSlug: string; lessonTitle: string; sessionToken: string }) => {
  const [questions, setQuestions] = useState<{ questions: InterviewQuestion[]; role: string } | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [revealed, setRevealed] = useState<Record<string, boolean>>({});
  const [role, setRole] = useState('Python Developer');
  const [topic, setTopic] = useState('');

  interface InterviewQuestion {
    id: string;
    question: string;
    type: string;
    difficulty: string;
    model_answer: string;
    key_points?: string[];
    follow_up?: string;
  }

  const ROLES = ['Python Developer', 'ML Engineer', 'Data Analyst', 'Full Stack Developer', 'Backend Engineer'];

  const generate = async () => {
    setLoading(true); setQuestions(null); setRevealed({});
    try {
      const res = await api.post<{ questions: InterviewQuestion[]; role: string }>(`/tutor/interview`, {
        role, topic: topic || lessonTitle, lesson_slug: lessonSlug, course_slug: courseSlug, count: 5,
      }, { headers: { Authorization: `Bearer ${sessionToken}` } });
      setQuestions(res.data);
      setCurrentQ(0);
    } catch (err: unknown) {
      if (err instanceof ApiError && err.status === 403) showError('Pro subscription required');
    } finally { setLoading(false); }
  };

  if (loading) return <div className="flex items-center justify-center h-full"><Loader2 size={24} className="text-[#22c55e] animate-spin" /><span className="ml-2 text-[#8b949e] text-xs">Preparing interview...</span></div>;

  if (!questions) return (
    <div className="flex flex-col items-center justify-center h-full p-6 text-center">
      <Briefcase size={28} className="text-[#22c55e] mb-2 opacity-60" />
      <p className="text-[#c9d1d9] text-sm font-medium mb-1">Interview Prep</p>
      <p className="text-[#8b949e] text-[11px] mb-4">Practice interview questions with model answers</p>
      <div className="flex flex-wrap gap-1.5 justify-center mb-3">
        {ROLES.map(r => (
          <button key={r} onClick={() => setRole(r)} className="text-[10px] px-2.5 py-1 rounded-full transition-colors" style={{ backgroundColor: role === r ? '#22c55e20' : '#21262d', color: role === r ? '#22c55e' : '#8b949e', border: `1px solid ${role === r ? '#22c55e40' : '#2d333b'}` }}>{r}</button>
        ))}
      </div>
      <input value={topic} onChange={e => setTopic(e.target.value)} placeholder={lessonTitle || 'Focus area (optional)...'} className="w-full bg-[#0d1117] border border-[#2d333b] rounded-lg px-3 py-2 text-[13px] text-[#c9d1d9] outline-none focus:border-[#22c55e] mb-3 placeholder-[#484f58]" />
      <button data-testid="tutor-generate-interview" onClick={generate} className="flex items-center gap-1.5 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
        <Sparkles size={13} /> Start Practice
      </button>
    </div>
  );

  const q = questions.questions[currentQ];
  const isRevealed = revealed[q.id];
  const TIcon = TYPE_ICONS[q.type] || Briefcase;
  const diffColor = DIFF_COLORS[q.difficulty] || '#f59e0b';

  return (
    <div className="flex flex-col h-full">
      <div className="px-3 py-2 border-b border-[#1e2533] flex items-center justify-between bg-[#161b22]">
        <span className="text-[11px] text-[#8b949e]">Q{currentQ + 1}/{questions.questions.length} | {questions.role}</span>
        <button onClick={() => setQuestions(null)} className="text-[10px] text-[#484f58] hover:text-white transition-colors">New Set</button>
      </div>
      <div className="flex-1 overflow-y-auto p-4">
        <div className="flex items-center gap-2 mb-2">
          <span className="text-[#22c55e]"><TIcon size={12} /></span>
          <span className="text-[10px] uppercase tracking-wider text-[#22c55e] font-semibold">{q.type}</span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: diffColor + '15', color: diffColor }}>{q.difficulty}</span>
        </div>
        <p className="text-[13px] text-[#c9d1d9] font-medium mb-4">{q.question}</p>

        {!isRevealed ? (
          <div className="text-center py-4">
            <p className="text-[11px] text-[#8b949e] mb-3">Think about your answer, then reveal the model response</p>
            <button data-testid="interview-reveal" onClick={() => setRevealed(prev => ({ ...prev, [q.id]: true }))} className="flex items-center gap-1.5 mx-auto bg-[#22c55e] text-white px-4 py-2 rounded-lg text-xs font-medium transition-colors">
              <Eye size={13} /> Reveal Answer
            </button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="rounded-lg border border-[#22c55e30] bg-[#22c55e08] p-3">
              <p className="text-[10px] uppercase tracking-wider text-[#22c55e] font-semibold mb-1.5">Model Answer</p>
              <p className="text-[12px] text-[#c9d1d9] leading-relaxed whitespace-pre-line">{q.model_answer}</p>
            </div>
            {(q.key_points?.length ?? 0) > 0 && (
              <div className="rounded-lg border border-[#2d333b] bg-[#161b22] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#f59e0b] font-semibold mb-1.5">Key Points</p>
                <ul className="space-y-1">{q.key_points!.map((kp, i) => (
                  <li key={i} className="text-[11px] text-[#8b949e] flex items-start gap-1.5"><CheckCircle size={10} className="text-[#22c55e] mt-0.5 flex-shrink-0" />{kp}</li>
                ))}</ul>
              </div>
            )}
            {q.follow_up && (
              <div className="rounded-lg border border-[#2d333b] bg-[#161b22] p-3">
                <p className="text-[10px] uppercase tracking-wider text-[#8b5cf6] font-semibold mb-1">Follow-up</p>
                <p className="text-[11px] text-[#c9d1d9]">{q.follow_up}</p>
              </div>
            )}
          </div>
        )}
      </div>
      <div className="px-3 py-2 border-t border-[#1e2533] flex justify-between bg-[#161b22]">
        <button onClick={() => { setCurrentQ(Math.max(0, currentQ - 1)); }} disabled={currentQ === 0} className="text-[11px] px-2.5 py-1 rounded border border-[#2d333b] text-[#8b949e] disabled:opacity-30">Prev</button>
        <button onClick={() => { if (currentQ < questions.questions.length - 1) { setCurrentQ(currentQ + 1); } }} disabled={currentQ >= questions.questions.length - 1} className="text-[11px] px-3 py-1 rounded bg-[#22c55e] text-white font-medium disabled:opacity-30">Next</button>
      </div>
    </div>
  );
};

interface AITutorPanelProps {
  isOpen: boolean;
  onClose: () => void;
  lessonSlug: string;
  lessonTitle: string;
  courseSlug: string;
}

const AITutorPanel = ({ isOpen, onClose, lessonSlug, lessonTitle, courseSlug }: AITutorPanelProps) => {
  const [activeTab, setActiveTab] = useState('chat');
  const sessionToken = '';

  useEffect(() => {
    if (isOpen) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setActiveTab('chat');
    }
  }, [isOpen, lessonSlug]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center" onClick={onClose}>
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" />
      <div className="relative w-full max-w-2xl mx-4 mb-[48px] rounded-t-xl border border-[#2d333b] border-b-0 overflow-hidden flex flex-col shadow-2xl" style={{ backgroundColor: '#0f1117', maxHeight: '75vh' }} onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between px-3 py-2 border-b border-[#1e2533]" style={{ backgroundColor: '#161b22' }}>
          <div className="flex items-center gap-2">
            <Bot size={15} className="text-[#22c55e]" />
            <span className="text-white text-sm font-semibold">AI Tutor</span>
            {lessonTitle && <span className="text-[#484f58] text-[10px] hidden sm:inline truncate max-w-[200px]">{lessonTitle}</span>}
          </div>
          <button data-testid="tutor-close" onClick={onClose} className="text-[#8b949e] hover:text-white transition-colors p-1"><X size={15} /></button>
        </div>

        <div className="flex border-b border-[#1e2533]" style={{ backgroundColor: '#131720' }}>
          {TABS.map(tab => {
            const Icon = tab.icon;
            const active = activeTab === tab.key;
            return (
              <button key={tab.key} data-testid={`tutor-tab-${tab.key}`} onClick={() => setActiveTab(tab.key)}
                className="flex-1 flex items-center justify-center gap-1.5 py-2 text-[11px] font-medium transition-colors relative"
                style={{ color: active ? '#22c55e' : '#484f58' }}>
                <Icon size={13} /> {tab.label}
                {active && <div className="absolute bottom-0 left-2 right-2 h-[2px] bg-[#22c55e] rounded-full" />}
              </button>
            );
          })}
        </div>

        <div className="flex-1" style={{ minHeight: '300px', maxHeight: '55vh', display: 'flex', flexDirection: 'column' }}>
          {activeTab === 'chat' && <ChatTab lessonSlug={lessonSlug} courseSlug={courseSlug} sessionToken={sessionToken} />}
          {activeTab === 'quiz' && <QuizTab lessonSlug={lessonSlug} courseSlug={courseSlug} lessonTitle={lessonTitle} sessionToken={sessionToken} />}
          {activeTab === 'flashcards' && <FlashcardsTab lessonSlug={lessonSlug} courseSlug={courseSlug} lessonTitle={lessonTitle} sessionToken={sessionToken} />}
          {activeTab === 'interview' && <InterviewTab lessonSlug={lessonSlug} courseSlug={courseSlug} lessonTitle={lessonTitle} sessionToken={sessionToken} />}
        </div>
      </div>
    </div>
  );
};

export default AITutorPanel;
