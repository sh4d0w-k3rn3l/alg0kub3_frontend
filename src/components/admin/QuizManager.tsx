'use client';
import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { api, ApiError } from '@/lib/api';
import { handleApiError, showError, showConfirm } from '@/lib/toast';
import {
  ArrowLeft, Plus, Edit2, Trash2, Save, Loader2, Sparkles,
  HelpCircle, ToggleLeft, Code, MessageSquare, ChevronDown, ChevronUp, Trophy
} from 'lucide-react';

interface QuizQuestion { type: string; question: string; options: string[]; correct_answer: number; expected_keywords: string[]; code_snippet: string; explanation: string; difficulty: string; points: number; }
type QuizData = { id: string; title: string; description: string; passing_score: number; questions: QuizQuestion[]; };

const TYPE_OPTIONS = [
  { value: 'mcq', label: 'Multiple Choice', icon: HelpCircle },
  { value: 'true_false', label: 'True / False', icon: ToggleLeft },
  { value: 'code_snippet', label: 'Code Output', icon: Code },
  { value: 'free_text', label: 'Written Answer', icon: MessageSquare },
];

const DIFF_OPTIONS = ['easy', 'medium', 'hard'];

const emptyQuestion = (type = 'mcq') => ({
  type,
  question: '',
  options: type === 'true_false' ? ['True', 'False'] : ['', '', '', ''],
  correct_answer: 0,
  expected_keywords: [],
  code_snippet: '',
  explanation: '',
  difficulty: 'medium',
  points: 1,
});

const QuizManager = () => {
  const navigate = useRouter();
  const [courses, setCourses] = useState<{ id: string; title: string; slug: string }[]>([]);
  const [selectedCourse, setSelectedCourse] = useState<{ id: string; title: string } | null>(null);
  const [sections, setSections] = useState<{ id: string; title: string; total: number }[]>([]);
  const [quizzes, setQuizzes] = useState<Record<string, { id: string; title: string; description: string; passing_score: number; questions: QuizQuestion[] }>>({});
  const [loading, setLoading] = useState<boolean>(true);
  const [editingQuiz, setEditingQuiz] = useState<{ title: string; description: string; passing_score: number; questions: QuizQuestion[] } | null>(null);
  const [editingSectionId, setEditingSectionId] = useState<string | null>(null);
  const [saving, setSaving] = useState<boolean>(false);
  const [generating, setGenerating] = useState<Record<string, boolean>>({});
  const [expandedSections, setExpandedSections] = useState<Record<string, boolean>>({});

  const fetchCourses = useCallback(async (signal?: AbortSignal) => {
    try {
      const res = await api.get<Record<string, unknown>>('/courses', { signal, cache: 'no-store' });
      if (signal?.aborted) return;
      const raw = res.data?.courses || res.data || [];
      const coursesList = raw as { id: string; title: string; slug: string }[];
      setCourses(coursesList);
      if (coursesList.length > 0 && !selectedCourse) {
        setSelectedCourse(coursesList[0]);
      }
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
    finally { if (!signal?.aborted) setLoading(false); }
  }, [selectedCourse]);

  const fetchSections = useCallback(async (signal?: AbortSignal) => {
    if (!selectedCourse) return;
    try {
      const res = await api.get<{ id: string; title: string; total: number }[]>(`/courses/${selectedCourse.id}/sections`, { signal, cache: 'no-store' });
      if (signal?.aborted) return;
      setSections(res.data);
      // Load quizzes for each section
      const quizMap: Record<string, { id: string; title: string; description: string; passing_score: number; questions: unknown[] }> = {};
      for (const section of res.data) {
        try {
          const qRes = await api.get<{ id: string; title: string; description: string; passing_score: number; questions: unknown[] }>(`/quizzes/section/${section.id}/admin`, {
            signal,
            cache: 'no-store',
          });
          if (signal?.aborted) return;
          quizMap[section.id] = qRes.data;
        } catch (e) {
          if (e instanceof DOMException && e.name === 'AbortError') return;
          // No quiz for this section (ignore 404)
        }
      }
      setQuizzes(quizMap as Record<string, { id: string; title: string; description: string; passing_score: number; questions: QuizQuestion[] }>);
    } catch (err) {
      if (err instanceof DOMException && err.name === 'AbortError') return;
      handleApiError(err);
    }
  }, [selectedCourse]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => { await fetchCourses(ac.signal); })();
    return () => ac.abort();
  }, [fetchCourses]);
  useEffect(() => {
    const ac = new AbortController();
    (async () => { if (selectedCourse) await fetchSections(ac.signal); })();
    return () => ac.abort();
  }, [selectedCourse, fetchSections]);

  const handleGenerateQuiz = async (sectionId: string) => {
    setGenerating(prev => ({ ...prev, [sectionId]: true }));
    try {
      const res = await api.post<QuizData>(`/quizzes/generate/${sectionId}`, {});
      setQuizzes(prev => ({ ...prev, [sectionId]: res.data as QuizData }));
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : 'Generation failed');
    } finally {
      setGenerating(prev => ({ ...prev, [sectionId]: false }));
    }
  };

  const handleDeleteQuiz = async (quizId: string, sectionId: string) => {
    if (!(await showConfirm('Delete this quiz?'))) return;
    try {
      await api.delete(`/quizzes/${quizId}`);
      setQuizzes(prev => { const n = { ...prev }; delete n[sectionId]; return n; });
    } catch (err) { showError('Delete failed'); handleApiError(err); }
  };

  const startEdit = (sectionId: string) => {
    const existing = quizzes[sectionId];
    if (existing) {
      setEditingQuiz({
        title: existing.title || '',
        description: existing.description || '',
        passing_score: existing.passing_score || 70,
        questions: existing.questions.map((q: QuizQuestion) => ({
          type: q.type || 'mcq',
          question: q.question || '',
          options: q.options || (q.type === 'true_false' ? ['True', 'False'] : ['', '', '', '']),
          correct_answer: q.correct_answer ?? 0,
          expected_keywords: q.expected_keywords || [],
          code_snippet: q.code_snippet || '',
          explanation: q.explanation || '',
          difficulty: q.difficulty || 'medium',
          points: q.points || 1,
        })),
      });
    } else {
      const section = sections.find(s => s.id === sectionId);
      setEditingQuiz({
        title: `${section?.title || ''} Quiz`,
        description: '',
        passing_score: 70,
        questions: [emptyQuestion('mcq')],
      });
    }
    setEditingSectionId(sectionId);
  };

  const handleSave = async () => {
    if (!editingQuiz || !editingSectionId) return;
    setSaving(true);
    try {
      const existing = quizzes[editingSectionId];
      const payload = {
        section_id: editingSectionId,
        title: editingQuiz.title,
        description: editingQuiz.description,
        passing_score: editingQuiz.passing_score,
        questions: editingQuiz.questions,
      };

      let res;
      if (existing?.id) {
        res = await api.put<Record<string, unknown>>(`/quizzes/${existing.id}`, payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      } else {
        res = await api.post<Record<string, unknown>>('/quizzes', payload, {
          headers: { 'Content-Type': 'application/json' },
        });
      }
      setQuizzes(prev => ({ ...prev, [editingSectionId]: res.data as QuizData }));
      setEditingQuiz(null);
      setEditingSectionId(null);
    } catch (err) {
      showError(err instanceof ApiError ? err.detail : 'Save failed');
    } finally { setSaving(false); }
  };

  const updateQuestion = (idx: number, field: string, value: string | number | string[]) => {
    setEditingQuiz((prev) => {
      if (!prev) return null;
      const qs = [...prev.questions];
      qs[idx] = { ...qs[idx], [field]: value };
      if (field === 'type') {
        if (value === 'true_false') qs[idx].options = ['True', 'False'];
        else if (value === 'free_text') qs[idx].options = [];
        else if (qs[idx].options.length < 4) qs[idx].options = ['', '', '', ''];
      }
      return { ...prev, questions: qs };
    });
  };

  const updateOption = (qIdx: number, optIdx: number, value: string) => {
    setEditingQuiz((prev) => {
      if (!prev) return null;
      const qs = [...prev.questions];
      const opts = [...(qs[qIdx].options || [])];
      opts[optIdx] = value;
      qs[qIdx] = { ...qs[qIdx], options: opts };
      return { ...prev, questions: qs };
    });
  };

  const addQuestion = (type: string = 'mcq') => {
    setEditingQuiz((prev) => {
      if (!prev) return null;
      return { ...prev, questions: [...prev.questions, emptyQuestion(type)] };
    });
  };

  const removeQuestion = (idx: number) => {
    setEditingQuiz((prev) => {
      if (!prev) return null;
      return { ...prev, questions: prev.questions.filter((_, i: number) => i !== idx) };
    });
  };

  if (loading) return <div className="min-h-screen bg-[#0d1117] flex items-center justify-center"><Loader2 className="animate-spin text-[#22c55e]" size={32} /></div>;

  // Quiz Editor View
  if (editingQuiz) {
    return (
      <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
        <div className="max-w-4xl mx-auto px-6 py-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <button onClick={() => { setEditingQuiz(null); setEditingSectionId(null); }} className="text-[#8b949e] hover:text-white"><ArrowLeft size={20} /></button>
              <h2 className="text-white text-xl font-bold">Edit Quiz</h2>
            </div>
            <button data-testid="quiz-save-button" onClick={handleSave} disabled={saving} className="flex items-center gap-2 bg-[#22c55e] hover:bg-[#16a34a] text-white px-4 py-2 rounded-md text-sm font-medium disabled:opacity-50">
              {saving ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />} Save Quiz
            </button>
          </div>

          {/* Quiz metadata */}
          <div className="border border-[#2d333b] rounded-lg p-4 mb-6 space-y-3" style={{ backgroundColor: '#161b22' }}>
            <input value={editingQuiz.title} onChange={e => setEditingQuiz((prev) => { if (!prev) return null; return { ...prev, title: e.target.value }; })} placeholder="Quiz Title" className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e]" />
            <input value={editingQuiz.description} onChange={e => setEditingQuiz((prev) => { if (!prev) return null; return { ...prev, description: e.target.value }; })} placeholder="Description" className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e]" />
            <div className="flex items-center gap-2">
              <label className="text-xs text-[#8b949e]">Passing Score:</label>
              <input type="number" min={0} max={100} value={editingQuiz.passing_score} onChange={e => setEditingQuiz((prev) => { if (!prev) return null; return { ...prev, passing_score: parseInt(e.target.value) || 0 }; })} className="w-20 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-sm text-white outline-none" />
              <span className="text-xs text-[#8b949e]">%</span>
            </div>
          </div>

          {/* Questions */}
          {editingQuiz.questions.map((q: QuizQuestion, idx: number) => (
            <div key={idx} className="border border-[#2d333b] rounded-lg p-4 mb-4" style={{ backgroundColor: '#161b22' }}>
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs font-bold text-[#22c55e]">Question {idx + 1}</span>
                <div className="flex items-center gap-2">
                  <select value={q.difficulty} onChange={e => updateQuestion(idx, 'difficulty', e.target.value)} className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none">
                    {DIFF_OPTIONS.map(d => <option key={d} value={d}>{d}</option>)}
                  </select>
                  <select value={q.type} onChange={e => updateQuestion(idx, 'type', e.target.value)} className="bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1 text-xs text-[#c9d1d9] outline-none">
                    {TYPE_OPTIONS.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                  <button onClick={() => removeQuestion(idx)} className="text-red-400 hover:text-red-300 p-1"><Trash2 size={14} /></button>
                </div>
              </div>

              <textarea value={q.question} onChange={e => updateQuestion(idx, 'question', e.target.value)} placeholder="Question text..." rows={2} className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-sm text-white outline-none focus:border-[#22c55e] resize-none mb-2" />

              {(q.type === 'code_snippet' || q.code_snippet) && (
                <textarea value={q.code_snippet || ''} onChange={e => updateQuestion(idx, 'code_snippet', e.target.value)} placeholder="Code snippet..." rows={3} className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-xs font-mono text-[#e6edf3] outline-none focus:border-[#22c55e] resize-none mb-2" />
              )}

              {q.type !== 'free_text' && (
                <div className="space-y-1 mb-2">
                  {(q.options || []).map((opt: string, optIdx: number) => (
                    <div key={optIdx} className="flex items-center gap-2">
                      <input type="radio" name={`correct-${idx}`} checked={q.correct_answer === optIdx} onChange={() => updateQuestion(idx, 'correct_answer', optIdx)} className="accent-[#22c55e]" />
                      <input value={opt} onChange={e => updateOption(idx, optIdx, e.target.value)} placeholder={`Option ${String.fromCharCode(65 + optIdx)}`} disabled={q.type === 'true_false'} className="flex-1 bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-white outline-none disabled:opacity-50" />
                    </div>
                  ))}
                </div>
              )}

              {q.type === 'free_text' && (
                <div className="mb-2">
                  <label className="text-[10px] text-[#8b949e] mb-1 block">Expected Keywords (comma-separated)</label>
                  <input value={(q.expected_keywords || []).join(', ')} onChange={e => updateQuestion(idx, 'expected_keywords', e.target.value.split(',').map(k => k.trim()).filter(Boolean))} placeholder="keyword1, keyword2, ..." className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-2 py-1.5 text-xs text-white outline-none" />
                </div>
              )}

              <textarea value={q.explanation} onChange={e => updateQuestion(idx, 'explanation', e.target.value)} placeholder="Explanation (shown after submission)..." rows={2} className="w-full bg-[#0d1117] border border-[#2d333b] rounded px-3 py-2 text-xs text-[#8b949e] outline-none focus:border-[#22c55e] resize-none" />
            </div>
          ))}

          <div className="flex gap-2 mt-4">
              {TYPE_OPTIONS.map(t => (
              <button key={t.value} onClick={() => addQuestion(t.value)} className="flex items-center gap-1.5 border border-[#2d333b] text-[#8b949e] hover:text-white px-3 py-1.5 rounded text-xs transition-colors">
                <t.icon size={12} /> + {t.label}
              </button>
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Main Quiz Manager View
  return (
    <div className="min-h-screen bg-[#0d1117] text-[#c9d1d9]">
      <div className="max-w-6xl mx-auto px-6 py-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            <button onClick={() => navigate.push('/admin')} className="text-[#8b949e] hover:text-white"><ArrowLeft size={20} /></button>
            <h1 className="text-white text-2xl font-bold">Quiz Manager</h1>
          </div>
        </div>

        {/* Course selector */}
        <div className="mb-6 flex gap-2 flex-wrap">
          {courses.map(c => (
            <button key={c.id} onClick={() => setSelectedCourse(c)} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${selectedCourse?.id === c.id ? 'bg-[#22c55e] text-white' : 'border border-[#2d333b] text-[#8b949e] hover:text-white'}`}>
              {c.title}
            </button>
          ))}
        </div>

        {/* Sections with quiz status */}
        <div className="space-y-2">
          {sections.map((section: { id: string; title: string; total: number }) => {
            const quiz = quizzes[section.id];
            const isExpanded = expandedSections[section.id];
            return (
              <div key={section.id} className="border border-[#2d333b] rounded-lg overflow-hidden" style={{ backgroundColor: '#161b22' }}>
                <div className="flex items-center justify-between px-4 py-3 cursor-pointer" onClick={() => setExpandedSections(prev => ({ ...prev, [section.id]: !prev[section.id] }))}>
                  <div className="flex items-center gap-3">
                    {isExpanded ? <ChevronUp size={14} className="text-[#484f58]" /> : <ChevronDown size={14} className="text-[#484f58]" />}
                    <span className="text-sm font-medium text-white">{section.title}</span>
                    <span className="text-[10px] text-[#484f58]">{section.total} lessons</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {quiz ? (
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#22c55e20] text-[#22c55e] font-medium">
                        <Trophy size={10} className="inline mr-1" />{quiz.questions?.length || 0} Qs
                      </span>
                    ) : (
                      <span className="text-[10px] text-[#484f58]">No quiz</span>
                    )}
                  </div>
                </div>

                {isExpanded && (
                  <div className="px-4 pb-3 border-t border-[#2d333b] pt-3">
                    {quiz ? (
                      <div>
                        <div className="text-xs text-[#8b949e] mb-2">
                          <strong>{quiz.title}</strong> — {quiz.questions?.length} questions, pass: {quiz.passing_score}%
                          {!!(quiz as Record<string, unknown>).generated && <span className="ml-2 text-[#f59e0b]">(AI Generated)</span>}
                        </div>
                        <div className="flex gap-2">
                          <button data-testid={`edit-quiz-${section.id}`} onClick={() => startEdit(section.id)} className="text-xs px-3 py-1.5 rounded border border-[#2d333b] text-[#8b949e] hover:text-white transition-colors flex items-center gap-1">
                            <Edit2 size={12} /> Edit
                          </button>
                          <button onClick={() => handleGenerateQuiz(section.id)} disabled={generating[section.id]} className="text-xs px-3 py-1.5 rounded border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-colors flex items-center gap-1 disabled:opacity-50">
                            {generating[section.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} Regenerate
                          </button>
                          <button onClick={() => handleDeleteQuiz(quiz.id, section.id)} className="text-xs px-3 py-1.5 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 transition-colors flex items-center gap-1">
                            <Trash2 size={12} /> Delete
                          </button>
                        </div>
                      </div>
                    ) : (
                      <div className="flex gap-2">
                        <button onClick={() => startEdit(section.id)} className="text-xs px-3 py-1.5 rounded border border-[#22c55e]/30 text-[#22c55e] hover:bg-[#22c55e]/10 transition-colors flex items-center gap-1">
                          <Plus size={12} /> Create Quiz
                        </button>
                        <button onClick={() => handleGenerateQuiz(section.id)} disabled={generating[section.id]} className="text-xs px-3 py-1.5 rounded border border-[#8b5cf6]/30 text-[#8b5cf6] hover:bg-[#8b5cf6]/10 transition-colors flex items-center gap-1 disabled:opacity-50">
                          {generating[section.id] ? <Loader2 size={12} className="animate-spin" /> : <Sparkles size={12} />} AI Generate
                        </button>
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

export default QuizManager;
