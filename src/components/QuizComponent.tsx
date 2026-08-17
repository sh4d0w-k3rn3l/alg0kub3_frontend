'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { Loader2, CheckCircle, XCircle, ChevronRight, Trophy, RotateCcw, Code, ToggleLeft, MessageSquare, HelpCircle, Clock, Award } from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';

interface QuizQuestion {
  id: number;
  type: string;
  question: string;
  difficulty: string;
  options?: string[];
  code_snippet?: string;
}

interface QuizData {
  id: number;
  title?: string;
  description?: string;
  questions: QuizQuestion[];
  passing_score: number;
  user_best?: UserBest;
}

interface UserBest {
  score: number;
  total: number;
  percentage: number;
  passed: boolean;
}

interface SubmitResult {
  score: number;
  total: number;
  percentage: number;
  passing_score: number;
  passed: boolean;
  results: QuestionResult[];
}

interface QuestionResult {
  type: string;
  question: string;
  is_correct: boolean;
  user_answer: number | string | null;
  correct_answer: number;
  explanation: string;
  expected_keywords?: string[];
}

interface QuizComponentProps {
  sectionId: string | number;
  sectionTitle: string;
}

const DIFFICULTY_COLORS: Record<string, { bg: string; text: string; label: string }> = {
  easy: { bg: '#22c55e15', text: '#22c55e', label: 'Easy' },
  medium: { bg: '#f59e0b15', text: '#f59e0b', label: 'Medium' },
  hard: { bg: '#ef444415', text: '#ef4444', label: 'Hard' },
};

const TYPE_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = {
  mcq: HelpCircle,
  true_false: ToggleLeft,
  code_snippet: Code,
  free_text: MessageSquare,
};

const TYPE_LABELS: Record<string, string> = {
  mcq: 'Multiple Choice',
  true_false: 'True / False',
  code_snippet: 'Code Output',
  free_text: 'Written Answer',
};

const QuizComponent = ({ sectionId, sectionTitle }: QuizComponentProps) => {
  const { colors } = useTheme();
  const { user } = useAuth();
  const [quiz, setQuiz] = useState<QuizData | null>(null);
  const [loading, setLoading] = useState(true);
  const [started, setStarted] = useState(false);
  const [currentQ, setCurrentQ] = useState(0);
  const [answers, setAnswers] = useState<Record<number, number | string | null>>({});
  const [submitted, setSubmitted] = useState(false);
  const [result, setResult] = useState<SubmitResult | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [userBest, setUserBest] = useState<UserBest | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadQuiz = useCallback(async (signal?: AbortSignal): Promise<{ status: number; data?: QuizData & { user_best?: UserBest } } | null> => {
    try {
      const res = await api.get<QuizData & { user_best?: UserBest }>(`/quizzes/section/${sectionId}`, {
        headers: user?.token ? { Authorization: `Bearer ${user.token}` } : {} as Record<string, string>,
        signal,
      });
      if (signal?.aborted) return null;
      return { status: res.status, data: res.data };
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return null;
      const apiErr = err as { status?: number };
      return { status: apiErr.status ?? 0 };
    }
  }, [sectionId, user]);

  const applyQuizResult = (result: { status: number; data?: QuizData & { user_best?: UserBest } }) => {
    if (result.status === 404) { setError('no_quiz'); return; }
    if (!result.data) { setError('no_quiz'); return; }
    const data = result.data as Record<string, unknown>;
    if (data.quiz === null || data.quiz === undefined || !Array.isArray(data.questions) || data.questions.length === 0) {
      setError('no_quiz'); return;
    }
    setError(null);
    setQuiz(result.data);
    if (result.data.user_best) setUserBest(result.data.user_best);
    const initAnswers: Record<number, null> = {};
    (result.data.questions || []).forEach((q: QuizQuestion) => { initAnswers[q.id] = null; });
    setAnswers(initAnswers);
  };

  const refreshQuiz = async () => {
    setLoading(true);
    const result = await loadQuiz();
    if (result) applyQuizResult(result);
    setLoading(false);
  };

  const handleStart = () => {
    if (!quiz) void refreshQuiz();
    setStarted(true);
    setSubmitted(false);
    setResult(null);
    setCurrentQ(0);
    if (quiz) {
      const initAnswers: Record<number, null> = {};
      (quiz.questions || []).forEach(q => { initAnswers[q.id] = null; });
      setAnswers(initAnswers);
    }
  };

  useEffect(() => {
    if (!sectionId) return;
    const ac = new AbortController();
    (async () => {
      const result = await loadQuiz(ac.signal);
      if (ac.signal.aborted || !result) return;
      applyQuizResult(result);
      setLoading(false);
    })();
    return () => ac.abort();
  }, [sectionId, loadQuiz]);

  const selectAnswer = (questionId: number, value: number | string | null) => {
    if (submitted) return;
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async () => {
    if (!quiz) return;
    setSubmitting(true);
    try {
      const formattedAnswers = quiz.questions.map(q => ({
        question_id: q.id,
        answer: answers[q.id],
      }));
      const headers: Record<string, string> = {};
      if (user?.token) headers.Authorization = `Bearer ${user.token}`;
      const res = await api.post<SubmitResult>('/quizzes/submit', {
        quiz_id: quiz.id,
        answers: formattedAnswers,
      }, { headers });
      setResult(res.data);
      setSubmitted(true);
      if (res.data.passed && res.data.percentage > (userBest?.percentage || 0)) {
        setUserBest({ score: res.data.score, total: res.data.total, percentage: res.data.percentage, passed: res.data.passed });
      }
    } catch (err) {
      handleApiError(err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleRetry = () => {
    setSubmitted(false);
    setResult(null);
    setCurrentQ(0);
    const initAnswers: Record<number, null> = {};
    (quiz?.questions || []).forEach(q => { initAnswers[q.id] = null; });
    setAnswers(initAnswers);
  };

  if (error === 'no_quiz' && !started) return null;
  if (error === 'load_error' && !started) return null;

  if (!started) {
    const questionCount = quiz?.questions?.length || 0;
    const passingScore = quiz?.passing_score || 70;
    return (
      <div data-testid="quiz-section-card" className="mt-10 mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
        <div className="px-6 py-4 flex items-center gap-3" style={{ borderBottom: `1px solid ${colors.border}`, background: `linear-gradient(135deg, ${colors.green}08, ${colors.green}15)` }}>
          <div className="w-9 h-9 rounded-lg flex items-center justify-center" style={{ backgroundColor: colors.green + '20' }}>
            <Trophy size={18} style={{ color: colors.green }} />
          </div>
          <div>
            <h3 className="text-base font-bold" style={{ color: colors.text }}>{quiz?.title || `${sectionTitle} Quiz`}</h3>
            <p className="text-xs" style={{ color: colors.textSecondary }}>{quiz?.description || 'Test your knowledge of this section'}</p>
          </div>
        </div>
        <div className="px-6 py-4">
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textSecondary }}>
              <HelpCircle size={13} /> {questionCount} Questions
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textSecondary }}>
              <Award size={13} /> Pass: {passingScore}%
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textSecondary }}>
              <Clock size={13} /> ~{Math.max(3, questionCount * 2)} min
            </div>
          </div>
          {userBest && (
            <div className="mb-4 px-3 py-2 rounded-lg text-xs" style={{ backgroundColor: userBest.passed ? colors.green + '10' : '#f59e0b10', border: `1px solid ${userBest.passed ? colors.green + '30' : '#f59e0b30'}` }}>
              <span className="font-medium" style={{ color: userBest.passed ? colors.green : '#f59e0b' }}>
                Best: {userBest.percentage}% ({userBest.score}/{userBest.total}) {userBest.passed ? '— Passed' : '— Not passed'}
              </span>
            </div>
          )}
          <button data-testid="quiz-start-button" onClick={handleStart} className="flex items-center gap-2 text-white font-medium px-5 py-2.5 rounded-lg text-sm transition-all hover:opacity-90" style={{ backgroundColor: colors.green }}>
            {userBest ? 'Retake Quiz' : 'Start Quiz'} <ChevronRight size={16} />
          </button>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="mt-10 mb-4 rounded-xl p-10 text-center" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
        <Loader2 size={28} className="animate-spin mx-auto mb-3" style={{ color: colors.green }} />
        <p className="text-sm" style={{ color: colors.textSecondary }}>Loading quiz...</p>
      </div>
    );
  }

  if (!quiz || !quiz.questions?.length) {
    return null;
  }

  if (submitted && result) {
    const scoreColor = result.percentage >= 80 ? '#22c55e' : result.percentage >= 50 ? '#f59e0b' : '#ef4444';
    return (
      <div data-testid="quiz-results" className="mt-10 mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
        <div className="p-6 text-center" style={{ borderBottom: `1px solid ${colors.border}`, background: `linear-gradient(135deg, ${scoreColor}08, ${scoreColor}18)` }}>
          <Trophy size={36} style={{ color: scoreColor }} className="mx-auto mb-2" />
          <div className="text-3xl font-bold mb-1" style={{ color: scoreColor }}>{result.score}/{result.total}</div>
          <p className="text-sm font-medium" style={{ color: scoreColor }}>
            {result.percentage}% — {result.passed ? 'Passed!' : `Need ${result.passing_score}% to pass`}
          </p>
          {result.passed && (
            <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>This quiz contributes to your course progress</p>
          )}
        </div>

        <div className="divide-y" style={{ borderColor: colors.border }}>
          {result.results.map((r, i) => {
            const qData = quiz.questions[i];
            const TypeIcon = TYPE_ICONS[r.type] || HelpCircle;
            return (
              <div key={i} className="p-4" data-testid={`quiz-result-${i}`}>
                <div className="flex items-start gap-2 mb-2">
                  {r.is_correct
                    ? <CheckCircle size={16} className="mt-0.5 flex-shrink-0 text-green-500" />
                    : <XCircle size={16} className="mt-0.5 flex-shrink-0 text-red-400" />}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <TypeIcon size={12} style={{ color: colors.textMuted }} />
                      <span className="text-[10px] uppercase tracking-wider font-medium" style={{ color: colors.textMuted }}>{TYPE_LABELS[r.type]}</span>
                    </div>
                    <span className="text-sm font-medium" style={{ color: colors.text }}>Q{i + 1}: {r.question}</span>
                  </div>
                </div>
                <div className="ml-6">
                  {r.type === 'free_text' ? (
                    <div className="text-xs space-y-1">
                      <p style={{ color: r.is_correct ? '#22c55e' : '#ef4444' }}>
                        Your answer: {r.user_answer || '(empty)'}
                      </p>
                      {!r.is_correct && (r.expected_keywords?.length ?? 0) > 0 && (
                        <p style={{ color: colors.textMuted }}>Expected keywords: {r.expected_keywords?.join(', ')}</p>
                      )}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2 text-xs mb-1">
                      <span style={{ color: r.is_correct ? '#22c55e' : '#ef4444' }}>
                        Your answer: {r.type === 'true_false'
                          ? (r.user_answer === 0 ? 'True' : r.user_answer === 1 ? 'False' : 'None')
                          : (qData?.options?.[r.user_answer as number] || 'None')}
                      </span>
                      {!r.is_correct && (
                        <span style={{ color: '#22c55e' }}>
                          | Correct: {r.type === 'true_false'
                            ? (r.correct_answer === 0 ? 'True' : 'False')
                            : (qData?.options?.[r.correct_answer] || '')}
                        </span>
                      )}
                    </div>
                  )}
                  <p className="text-xs mt-1" style={{ color: colors.textSecondary }}>{r.explanation}</p>
                </div>
              </div>
            );
          })}
        </div>
        <div className="p-4 flex gap-3" style={{ borderTop: `1px solid ${colors.border}` }}>
          <button data-testid="quiz-retry-button" onClick={handleRetry} className="flex items-center gap-1.5 text-sm px-4 py-2 rounded-lg border transition-colors hover:opacity-80" style={{ borderColor: colors.border, color: colors.text }}>
            <RotateCcw size={14} /> Retry Quiz
          </button>
        </div>
      </div>
    );
  }

  const q = quiz.questions[currentQ];
  const allAnswered = quiz.questions.every(qItem => answers[qItem.id] !== null && answers[qItem.id] !== undefined);
  const TypeIcon = TYPE_ICONS[q.type] || HelpCircle;
  const diff = DIFFICULTY_COLORS[q.difficulty] || DIFFICULTY_COLORS.medium;

  return (
    <div data-testid="quiz-active" className="mt-10 mb-4 rounded-xl overflow-hidden" style={{ border: `1px solid ${colors.border}`, backgroundColor: colors.bgCard }}>
      <div className="px-4 py-3 flex items-center justify-between" style={{ borderBottom: `1px solid ${colors.border}`, backgroundColor: colors.bgTertiary }}>
        <div className="flex items-center gap-2">
          <span className="text-xs font-medium" style={{ color: colors.textSecondary }}>
            Question {currentQ + 1} of {quiz.questions.length}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded-full font-medium" style={{ backgroundColor: diff.bg, color: diff.text }}>{diff.label}</span>
        </div>
        <div className="flex gap-1">
          {quiz.questions.map((qItem, i) => (
            <button key={i} onClick={() => setCurrentQ(i)}
              className="w-6 h-6 rounded-full text-[10px] font-bold flex items-center justify-center transition-colors"
              style={{
                backgroundColor: answers[qItem.id] !== null && answers[qItem.id] !== undefined ? colors.green + '20' : colors.bgSecondary,
                color: i === currentQ ? colors.green : colors.textMuted,
                border: i === currentQ ? `2px solid ${colors.green}` : `1px solid ${colors.border}`,
              }}>
              {i + 1}
            </button>
          ))}
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 mb-3">
          <TypeIcon size={14} style={{ color: colors.green }} />
          <span className="text-[10px] uppercase tracking-wider font-semibold" style={{ color: colors.green }}>{TYPE_LABELS[q.type]}</span>
        </div>

        <h4 className="text-sm font-bold mb-4" style={{ color: colors.text }}>{q.question}</h4>

        {q.code_snippet && (
          <pre className="rounded-lg p-3 mb-4 text-[13px] font-mono overflow-x-auto" style={{ backgroundColor: '#0d1117', color: '#c9d1d9', border: `1px solid ${colors.border}` }}>
            <code>{q.code_snippet}</code>
          </pre>
        )}

        {q.type === 'free_text' ? (
          <textarea
            data-testid="quiz-free-text-input"
            value={answers[q.id] as string || ''}
            onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => selectAnswer(q.id, e.target.value)}
            placeholder="Type your answer here..."
            rows={4}
            className="w-full rounded-lg border px-4 py-3 text-sm resize-none focus:outline-none transition-colors"
            style={{
              borderColor: answers[q.id] ? colors.green : colors.border,
              backgroundColor: 'transparent',
              color: colors.text,
            }}
          />
        ) : (
          <div className="space-y-2">
            {(q.options || []).map((opt, optIdx) => {
              const isSelected = answers[q.id] === optIdx;
              return (
                <button
                  data-testid={`quiz-option-${optIdx}`}
                  key={optIdx}
                  onClick={() => selectAnswer(q.id, optIdx)}
                  className="w-full text-left px-4 py-3 rounded-lg border text-sm transition-all"
                  style={{
                    borderColor: isSelected ? colors.green : colors.border,
                    backgroundColor: isSelected ? colors.green + '12' : 'transparent',
                    color: colors.text,
                  }}
                >
                  <span className="font-mono text-xs mr-2" style={{ color: colors.textMuted }}>
                    {q.type === 'true_false' ? '' : `${String.fromCharCode(65 + optIdx)}.`}
                  </span>
                  {opt}
                </button>
              );
            })}
          </div>
        )}
      </div>

      <div className="px-5 py-3 flex items-center justify-between" style={{ borderTop: `1px solid ${colors.border}` }}>
        <button onClick={() => setCurrentQ(Math.max(0, currentQ - 1))} disabled={currentQ === 0}
          className="text-xs px-3 py-1.5 rounded-lg border transition-colors disabled:opacity-30"
          style={{ borderColor: colors.border, color: colors.textSecondary }}>
          Previous
        </button>
        <div className="flex gap-2">
          {currentQ < quiz.questions.length - 1 ? (
            <button data-testid="quiz-next-button" onClick={() => setCurrentQ(currentQ + 1)}
              className="text-xs px-4 py-1.5 rounded-lg text-white font-medium"
              style={{ backgroundColor: colors.green }}>
              Next
            </button>
          ) : (
            <button data-testid="quiz-submit-button" onClick={handleSubmit} disabled={!allAnswered || submitting}
              className="text-xs px-5 py-1.5 rounded-lg text-white font-medium disabled:opacity-40 transition-opacity"
              style={{ backgroundColor: colors.green }}>
              {submitting ? 'Submitting...' : 'Submit Quiz'}
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default QuizComponent;
