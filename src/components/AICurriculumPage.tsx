'use client';

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ArrowRight, BookOpen, CheckCircle, Lock,
  ChevronRight, Play,
  Map, Clock, HelpCircle, X,
} from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';
import CourseNode, { DIFF_COLORS } from './curriculum/CourseNode';
import { QUIZ_QUESTIONS, getRecommendation } from './curriculum/curriculumData';
import PageHeader from './PageHeader';

const API = process.env.NEXT_PUBLIC_BACKEND_URL;

interface TrackCourse {
  slug: string;
  prereqs: string[];
}

interface Track {
  id: string;
  label: string;
  color: string;
  description: string;
  courses: TrackCourse[];
}

interface Course {
  slug: string;
  title: string;
  lesson_count: number;
  [key: string]: unknown;
}

interface ProgressEntry {
  course_slug: string;
  completed_lessons: number;
  [key: string]: unknown;
}

const dk = { bg: '#050505', surface: '#0a0a0a', border: '#1a1a1a', borderSubtle: '#111', text: '#f0f0f0', textSec: '#a0a0a0', textMut: '#555', primary: '#3b82f6', glow: 'rgba(59,130,246,0.08)' };
const lt = { bg: '#ffffff', surface: '#f8f8f8', border: '#e5e5e5', borderSubtle: '#eee', text: '#111', textSec: '#555', textMut: '#999', primary: '#2563eb', glow: 'rgba(37,99,235,0.05)' };

const TRACKS: Track[] = [
  {
    id: 'foundations',
    label: 'Foundations',
    color: '#8b5cf6',
    description: 'Build the mathematical and data skills every AI engineer needs',
    courses: [
      { slug: 'mathematics-for-ai', prereqs: [] },
      { slug: 'numpy-linear-algebra', prereqs: ['mathematics-for-ai'] },
      { slug: 'statistics-probability', prereqs: ['mathematics-for-ai'] },
      { slug: 'data-visualization', prereqs: ['numpy-linear-algebra'] },
      { slug: 'introduction-to-pandas-for-data-analysis', prereqs: ['numpy-linear-algebra'] },
    ],
  },
  {
    id: 'classical-ml',
    label: 'Classical ML',
    color: '#22c55e',
    description: 'Master traditional machine learning algorithms and techniques',
    courses: [
      { slug: 'scikit-learn-masterclass', prereqs: ['statistics-probability', 'numpy-linear-algebra'] },
      { slug: 'supervised-learning', prereqs: ['scikit-learn-masterclass'] },
      { slug: 'unsupervised-learning', prereqs: ['scikit-learn-masterclass'] },
      { slug: 'hyperparameter-tuning', prereqs: ['supervised-learning'] },
      { slug: 'recommendation-systems', prereqs: ['unsupervised-learning'] },
      { slug: 'reinforcement-learning', prereqs: ['statistics-probability'] },
    ],
  },
  {
    id: 'deep-learning',
    label: 'Deep Learning',
    color: '#06b6d4',
    description: 'Dive into neural network architectures from CNNs to Transformers',
    courses: [
      { slug: 'pytorch-fundamentals', prereqs: ['numpy-linear-algebra'] },
      { slug: 'neural-networks-from-scratch', prereqs: ['pytorch-fundamentals', 'mathematics-for-ai'] },
      { slug: 'cnns-computer-vision', prereqs: ['neural-networks-from-scratch'] },
      { slug: 'rnns-sequence-models', prereqs: ['neural-networks-from-scratch'] },
      { slug: 'transformers-attention', prereqs: ['rnns-sequence-models'] },
      { slug: 'multimodal-ai', prereqs: ['transformers-attention', 'cnns-computer-vision'] },
    ],
  },
  {
    id: 'applied-ai',
    label: 'Applied AI',
    color: '#f97316',
    description: 'Build production AI systems — from prompt engineering to deployment',
    courses: [
      { slug: 'nlp-fundamentals', prereqs: ['pytorch-fundamentals'] },
      { slug: 'prompt-engineering', prereqs: [] },
      { slug: 'vector-databases-embeddings', prereqs: ['nlp-fundamentals'] },
      { slug: 'rag-zero-to-hero', prereqs: ['vector-databases-embeddings', 'prompt-engineering'] },
      { slug: 'langchain-langgraph', prereqs: ['rag-zero-to-hero'] },
      { slug: 'fine-tuning-llms', prereqs: ['transformers-attention'] },
      { slug: 'ai-agents', prereqs: ['langchain-langgraph', 'prompt-engineering'] },
      { slug: 'mlops-deployment', prereqs: ['scikit-learn-masterclass'] },
      { slug: 'ai-api-design', prereqs: ['mlops-deployment', 'prompt-engineering'] },
      { slug: 'ai-safety-alignment', prereqs: ['ai-agents', 'fine-tuning-llms'] },
    ],
  },
];

const AVG_MINUTES_PER_LESSON = 8;

const DIFFICULTY: Record<string, string> = {
  'mathematics-for-ai': 'Beginner', 'numpy-linear-algebra': 'Beginner', 'statistics-probability': 'Beginner',
  'data-visualization': 'Beginner', 'introduction-to-pandas-for-data-analysis': 'Beginner', 'prompt-engineering': 'Beginner',
  'scikit-learn-masterclass': 'Intermediate', 'supervised-learning': 'Intermediate', 'unsupervised-learning': 'Intermediate',
  'hyperparameter-tuning': 'Intermediate', 'pytorch-fundamentals': 'Intermediate', 'neural-networks-from-scratch': 'Intermediate',
  'nlp-fundamentals': 'Intermediate', 'vector-databases-embeddings': 'Intermediate', 'reinforcement-learning': 'Intermediate',
  'recommendation-systems': 'Intermediate', 'rnns-sequence-models': 'Intermediate',
  'cnns-computer-vision': 'Advanced', 'transformers-attention': 'Advanced', 'multimodal-ai': 'Advanced',
  'rag-zero-to-hero': 'Advanced', 'langchain-langgraph': 'Advanced', 'fine-tuning-llms': 'Advanced',
  'ai-agents': 'Advanced', 'mlops-deployment': 'Advanced', 'ai-api-design': 'Advanced', 'ai-safety-alignment': 'Advanced',
};

const AICurriculumPage = () => {
  const router = useRouter();
  const [isDark] = useState(true);
  const [courses, setCourses] = useState<Course[]>([]);
  const [progress, setProgress] = useState<Record<string, ProgressEntry>>({});
  const [activeTrack, setActiveTrack] = useState<string | null>(null);
  const [showQuiz, setShowQuiz] = useState(false);
  const [quizStep, setQuizStep] = useState(0);
  const [quizAnswers, setQuizAnswers] = useState<Record<string, unknown>>({});
  const [quizResult, setQuizResult] = useState<{ track: string; course: string; message: string } | null>(null);
  const t = isDark ? dk : lt;

  useEffect(() => {
    fetch(`${API}/api/courses`).then(r => r.json()).then(d => setCourses(d?.courses || d || [])).catch(() => {});
    fetch(`${API}/api/progress/dashboard`)
      .then(r => r.json()).then(data => {
        const courses = data?.courses;
        if (Array.isArray(courses)) {
          const map: Record<string, ProgressEntry> = {};
          courses.forEach((p: ProgressEntry) => { map[p.course_slug] = p; });
          setProgress(map);
        }
      }).catch(() => {});
  }, []);

  const courseMap = useMemo(() => {
    const m: Record<string, Course> = {};
    courses.forEach(c => { m[c.slug] = c; });
    return m;
  }, [courses]);

  const getCourseStatus = useCallback((slug: string): string => {
    const p = progress[slug];
    if (p && p.completed_lessons > 0) {
      const course = courseMap[slug];
      if (course && p.completed_lessons >= course.lesson_count) return 'completed';
      return 'in-progress';
    }
    return 'available';
  }, [progress, courseMap]);

  const totalLessons = useMemo(() => {
    let count = 0;
    TRACKS.forEach(track => {
      track.courses.forEach(tc => {
        const c = courseMap[tc.slug];
        if (c) count += c.lesson_count;
      });
    });
    return count;
  }, [courseMap]);

  const handleCourseClick = (slug: string) => router.push(`/course/${slug}`);

  const getTrackTime = useCallback((track: Track) => {
    let lessons = 0;
    track.courses.forEach(tc => {
      const c = courseMap[tc.slug];
      if (c) lessons += c.lesson_count;
    });
    const hours = Math.round((lessons * AVG_MINUTES_PER_LESSON) / 60);
    return { lessons, hours };
  }, [courseMap]);

  const totalHours = useMemo(() => {
    return TRACKS.reduce((sum, tr) => sum + getTrackTime(tr).hours, 0);
  }, [getTrackTime]);

  const handleQuizAnswer = (questionId: string, value: unknown) => {
    const newAnswers = { ...quizAnswers, [questionId]: value };
    setQuizAnswers(newAnswers);
    if (quizStep < QUIZ_QUESTIONS.length - 1) {
      setQuizStep(quizStep + 1);
    } else {
      setQuizResult(getRecommendation(newAnswers));
    }
  };

  const resetQuiz = () => { setQuizStep(0); setQuizAnswers({}); setQuizResult(null); setShowQuiz(false); };

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>
      <PageHeader />

      <section className="relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none" style={{
          background: isDark
            ? `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.12), transparent), radial-gradient(ellipse 60% 40% at 80% 50%, rgba(6,182,212,0.06), transparent)`
            : `radial-gradient(ellipse 80% 50% at 50% -20%, rgba(139,92,246,0.06), transparent)`,
        }} />
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 pt-16 pb-12 relative">
          <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
            <div className="flex items-center gap-2 mb-4">
              <Map size={16} style={{ color: t.primary }} />
              <span className="text-[11px] font-bold uppercase tracking-[0.15em]" style={{ color: t.primary, fontFamily: 'JetBrains Mono, monospace' }}>
                AI Engineering Mastery Curriculum
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black tracking-tight mb-4" style={{ color: t.text }}>
              Your path to becoming an<br />
              <span style={{ color: '#8b5cf6' }}>AI Engineer</span>
            </h1>
            <p className="text-base lg:text-lg max-w-2xl mb-6" style={{ color: t.textSec }}>
              26 courses. {totalLessons}+ lessons. ~{totalHours} hours. From mathematical foundations to production AI systems. Follow the recommended progression or forge your own path.
            </p>

            <button
              data-testid="quiz-start-btn"
              onClick={() => setShowQuiz(true)}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-sm font-bold mb-8 transition-all duration-200 hover:scale-105"
              style={{ backgroundColor: '#8b5cf620', color: '#8b5cf6', border: '1px solid #8b5cf630' }}
            >
              <HelpCircle size={16} /> Where should I start?
            </button>

            <div className="flex flex-wrap gap-6 mb-6">
              {TRACKS.map(track => (
                <div key={track.id} className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full" style={{ backgroundColor: track.color }} />
                  <span className="text-xs font-semibold" style={{ color: t.textSec }}>{track.label}</span>
                  <span className="text-xs" style={{ color: t.textMut }}>({track.courses.length})</span>
                </div>
              ))}
            </div>

            <div className="flex items-center gap-4 flex-wrap">
              {Object.entries(DIFF_COLORS).map(([level, color]) => (
                <div key={level} className="flex items-center gap-1.5">
                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: color }} />
                  <span className="text-[11px] font-medium" style={{ color: t.textMut }}>{level}</span>
                </div>
              ))}
              <div className="flex items-center gap-1.5 ml-2">
                <CheckCircle size={12} className="text-green-500" />
                <span className="text-[11px] font-medium" style={{ color: t.textMut }}>Completed</span>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      <section className="max-w-[1280px] mx-auto px-6 lg:px-8 pb-20">
        {TRACKS.map((track, trackIdx) => {
          const isExpanded = activeTrack === track.id || activeTrack === null;
          return (
            <motion.div
              key={track.id}
              data-testid={`curriculum-track-${track.id}`}
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: trackIdx * 0.1 }}
              className="mb-10"
            >
              <button
                data-testid={`track-header-${track.id}`}
                onClick={() => setActiveTrack(activeTrack === track.id ? null : track.id)}
                className="flex items-center gap-4 w-full text-left mb-6 group"
              >
                <div className="flex items-center gap-3 flex-1">
                  <div className="w-10 h-10 rounded-xl flex items-center justify-center" style={{ backgroundColor: track.color + '15' }}>
                    <span className="text-lg font-black" style={{ color: track.color }}>{trackIdx + 1}</span>
                  </div>
                  <div>
                    <h2 className="text-lg font-extrabold tracking-tight" style={{ color: t.text }}>{track.label}</h2>
                    <p className="text-xs" style={{ color: t.textMut }}>{track.description}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="hidden sm:flex items-center gap-1 text-[10px] font-mono" style={{ color: t.textMut }}>
                    <Clock size={10} /> ~{getTrackTime(track).hours}h
                  </span>
                  <span className="text-xs font-mono" style={{ color: t.textMut }}>
                    {track.courses.filter(tc => getCourseStatus(tc.slug) === 'completed').length}/{track.courses.length} completed
                  </span>
                  <div className="w-24 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: t.border }}>
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{
                        backgroundColor: track.color,
                        width: `${(track.courses.filter(tc => getCourseStatus(tc.slug) === 'completed').length / track.courses.length) * 100}%`,
                      }}
                    />
                  </div>
                  <ChevronRight
                    size={16}
                    className="transition-transform duration-200"
                    style={{ color: t.textMut, transform: isExpanded ? 'rotate(90deg)' : 'rotate(0deg)' }}
                  />
                </div>
              </button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.3 }}
                    className="overflow-hidden"
                  >
                    <div className="relative">
                      <div
                        className="absolute top-[60px] left-[20px] right-[20px] h-[2px] hidden lg:block"
                        style={{ backgroundColor: track.color + '20' }}
                      />

                      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-6 gap-3">
                        {track.courses.map((tc, idx) => {
                          const course = courseMap[tc.slug];
                          if (!course) return null;
                          const status = getCourseStatus(tc.slug);
                          const difficulty = DIFFICULTY[tc.slug] || 'Intermediate';
                          return (
                            <div key={tc.slug} className="relative">
                              {idx > 0 && (
                                <div className="absolute -left-2 top-[60px] w-4 h-[2px] hidden lg:block" style={{ backgroundColor: track.color + '40' }}>
                                  <div className="absolute right-0 -top-[3px] w-0 h-0" style={{
                                    borderTop: '4px solid transparent',
                                    borderBottom: '4px solid transparent',
                                    borderLeft: `6px solid ${track.color}40`,
                                  }} />
                                </div>
                              )}
                              <CourseNode
                                course={course}
                                trackColor={track.color}
                                difficulty={difficulty}
                                status={status}
                                onClick={handleCourseClick}
                                t={t}
                                isDark={isDark}
                              />
                              {tc.prereqs.length > 0 && (
                                <div className="mt-1 flex flex-wrap gap-1">
                                  {tc.prereqs.map(prereq => {
                                    const prereqCourse = courseMap[prereq];
                                    const prereqDone = getCourseStatus(prereq) === 'completed';
                                    return (
                                      <span key={prereq} className="text-[8px] px-1.5 py-0.5 rounded-full flex items-center gap-0.5" style={{
                                        backgroundColor: prereqDone ? '#22c55e15' : t.border,
                                        color: prereqDone ? '#22c55e' : t.textMut,
                                      }}>
                                        {prereqDone ? <CheckCircle size={7} /> : <Lock size={7} />}
                                        {prereqCourse ? prereqCourse.title.split(' ').slice(0, 2).join(' ') : prereq}
                                      </span>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}

        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.6 }}
          className="text-center mt-16 pt-12 border-t"
          style={{ borderColor: t.border }}
        >
          <h3 className="text-xl font-extrabold mb-3" style={{ color: t.text }}>
            Ready to start your AI journey?
          </h3>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: t.textSec }}>
            Begin with the Foundations track and work your way up. Each course builds on the skills from the previous one.
          </p>
          <div className="flex items-center justify-center gap-3 flex-wrap">
            <button
              data-testid="curriculum-start-btn"
              onClick={() => router.push('/course/mathematics-for-ai')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold text-white transition-transform hover:scale-105"
              style={{ backgroundColor: '#8b5cf6' }}
            >
              <Play size={14} /> Start with Foundations
            </button>
            <button
              onClick={() => router.push('/courses')}
              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold border transition-colors"
              style={{ borderColor: t.border, color: t.textSec }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
            >
              Browse All Courses <ArrowRight size={14} />
            </button>
          </div>
        </motion.div>
      </section>

      <AnimatePresence>
        {showQuiz && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] flex items-center justify-center p-4"
            style={{ backgroundColor: 'rgba(0,0,0,0.7)', backdropFilter: 'blur(8px)' }}
            onClick={(e: React.MouseEvent) => { if (e.target === e.currentTarget) resetQuiz(); }}
          >
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-lg rounded-2xl border overflow-hidden"
              style={{ backgroundColor: t.surface, borderColor: t.border }}
              data-testid="quiz-modal"
            >
              <div className="flex items-center justify-between px-6 py-4 border-b" style={{ borderColor: t.borderSubtle }}>
                <div className="flex items-center gap-2">
                  <HelpCircle size={18} style={{ color: '#8b5cf6' }} />
                  <h3 className="text-base font-bold" style={{ color: t.text }}>Where should I start?</h3>
                </div>
                <button onClick={resetQuiz} className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ color: t.textMut }}>
                  <X size={16} />
                </button>
              </div>

              {!quizResult ? (
                <div className="p-6">
                  <div className="flex gap-1.5 mb-6">
                    {QUIZ_QUESTIONS.map((_, i) => (
                      <div
                        key={i}
                        className="h-1 rounded-full flex-1 transition-all duration-300"
                        style={{ backgroundColor: i <= quizStep ? '#8b5cf6' : t.border }}
                      />
                    ))}
                  </div>

                  <AnimatePresence mode="wait">
                    <motion.div
                      key={quizStep}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0, x: -20 }}
                      transition={{ duration: 0.25 }}
                    >
                      <p className="text-[11px] font-bold uppercase tracking-wider mb-2" style={{ color: t.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
                        Question {quizStep + 1} of {QUIZ_QUESTIONS.length}
                      </p>
                      <h4 className="text-lg font-bold mb-5" style={{ color: t.text }}>
                        {QUIZ_QUESTIONS[quizStep].question}
                      </h4>

                      <div className="space-y-2.5">
                        {QUIZ_QUESTIONS[quizStep].options.map((opt, idx: number) => (
                          <button
                            key={idx}
                            data-testid={`quiz-option-${quizStep}-${idx}`}
                            onClick={() => handleQuizAnswer(QUIZ_QUESTIONS[quizStep].id, opt.value)}
                            className="w-full text-left px-4 py-3 rounded-xl border transition-all duration-200 group"
                            style={{ borderColor: t.border, backgroundColor: 'transparent' }}
                            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.backgroundColor = '#8b5cf608'; }}
                            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.backgroundColor = 'transparent'; }}
                          >
                            <span className="text-sm font-medium" style={{ color: t.text }}>{opt.label}</span>
                          </button>
                        ))}
                      </div>
                    </motion.div>
                  </AnimatePresence>
                </div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-6"
                  data-testid="quiz-result"
                >
                  {(() => {
                    const recTrack = TRACKS.find(tr => tr.id === quizResult.track);
                    const recCourse = courseMap[quizResult.course];
                    const RecIcon = recCourse ? (COURSE_ICONS[recCourse.slug as keyof typeof COURSE_ICONS] || BookOpen) : BookOpen;
                    const recColor = recCourse ? (COURSE_COLORS[recCourse.slug as keyof typeof COURSE_COLORS] || '#8b5cf6') : '#8b5cf6';
                    return (
                      <>
                        <div className="text-center mb-6">
                          <div className="w-14 h-14 rounded-2xl mx-auto mb-3 flex items-center justify-center" style={{ backgroundColor: recColor + '15' }}>
                            <RecIcon size={28} style={{ color: recColor }} />
                          </div>
                          <h4 className="text-lg font-bold mb-1" style={{ color: t.text }}>Start here</h4>
                          <p className="text-sm" style={{ color: t.textSec }}>{quizResult.message}</p>
                        </div>

                        {recCourse && (
                          <button
                            data-testid="quiz-result-course"
                            onClick={() => { resetQuiz(); router.push(`/course/${recCourse.slug}`); }}
                            className="w-full rounded-xl border p-4 text-left transition-all duration-200 hover:scale-[1.02] group mb-4"
                            style={{ borderColor: recColor + '40', backgroundColor: recColor + '06' }}
                          >
                            <div className="flex items-center gap-3">
                              <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: recColor + '15' }}>
                                <RecIcon size={20} style={{ color: recColor }} />
                              </div>
                              <div className="flex-1">
                                <span className="text-xs font-bold uppercase tracking-wider" style={{ color: recColor }}>{recTrack?.label}</span>
                                <h5 className="text-sm font-bold" style={{ color: t.text }}>{recCourse.title}</h5>
                                <span className="text-[11px]" style={{ color: t.textMut }}>{recCourse.lesson_count} lessons</span>
                              </div>
                              <ArrowRight size={16} style={{ color: recColor }} className="group-hover:translate-x-1 transition-transform" />
                            </div>
                          </button>
                        )}

                        <div className="flex gap-2">
                          <button
                            onClick={() => { setQuizStep(0); setQuizAnswers({}); setQuizResult(null); }}
                            className="flex-1 py-2.5 rounded-xl text-xs font-semibold border transition-colors"
                            style={{ borderColor: t.border, color: t.textSec }}
                          >
                            Retake Quiz
                          </button>
                          <button
                            onClick={resetQuiz}
                            className="flex-1 py-2.5 rounded-xl text-xs font-bold text-white transition-transform hover:scale-105"
                            style={{ backgroundColor: '#8b5cf6' }}
                          >
                            View Full Map
                          </button>
                        </div>
                      </>
                    );
                  })()}
                </motion.div>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AICurriculumPage;
