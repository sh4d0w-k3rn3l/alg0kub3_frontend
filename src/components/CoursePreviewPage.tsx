'use client';

import React, { useState, useEffect } from 'react';
import type { FC } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code, Database, Zap, Globe, Tag, Brain, Sparkles,
  ArrowRight, ArrowLeft, ChevronDown, ChevronUp, Clock, Layers,
  Play, Lock, CheckCircle2, FileText, Terminal, Users, Cpu,
  Route, Sun, Moon, Star, Award, BarChart3, Braces, Monitor,
  Rocket, Link, Wrench, GitBranch, TrendingUp, Box, Repeat, Package, Target,
} from 'lucide-react';
import { api } from '@/lib/api';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';
import { CourseCertificateSection } from '@/components/CertificatesPage';
import RecommendedCourses from '@/components/RecommendedCourses';

const SECTION_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  'rocket': Rocket, 'link': Link, 'brain': Brain, 'search': Globe,
  'wrench': Wrench, 'git-branch': GitBranch, 'users': Users, 'monitor': Monitor,
  'code': Code, 'database': Database, 'book-open': BookOpen, 'zap': Zap,
  'layers': Layers, 'terminal': Terminal, 'star': Star, 'cpu': Cpu,
  'box': Box, 'repeat': Repeat, 'package': Package,
  'target': Target, 'bar-chart': BarChart3,
};

const DIFFICULTY_MAP: Record<string, { level: string; color: string }> = {
  'Programming Languages': { level: 'Beginner', color: '#22c55e' },
  'AI & Machine Learning': { level: 'Intermediate', color: '#f59e0b' },
  'Data & Databases': { level: 'Beginner', color: '#22c55e' },
  'DevOps': { level: 'Intermediate', color: '#f59e0b' },
};

const fadeUp = { hidden: { opacity: 0, y: 24 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4 } } };

interface Lesson {
  id: number;
  slug: string;
  title: string;
  read_time?: string;
}

interface Section {
  id: number;
  icon: string;
  title: string;
  lesson_count: number;
  duration_minutes: number;
  lessons: Lesson[];
}

interface SocialProof {
  enrollments: number;
  rating: number;
  reviews: number;
  weekly_signups: number;
}

interface Stats {
  total_lessons: number;
  total_sections: number;
  estimated_hours: number;
  total_minutes: number;
}

interface CoursePreviewData {
  course: {
    title: string;
    description: string;
    category: string;
    difficulty: string;
    lesson_count: number;
    section_count: number;
    language?: string;
  };
  stats: Stats;
  curriculum: Section[];
  social_proof: SocialProof;
  first_lesson_slug?: string;
}

const CoursePreviewPage: FC = () => {
  const params = useParams();
  const courseSlug = (params?.courseSlug as string) || '';
  const router = useRouter();
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, isSubscribed } = useAuth();
  const [data, setData] = useState<CoursePreviewData | null>(null);
  const [loading, setLoading] = useState(true);
  const [expandedSections, setExpandedSections] = useState<Record<number, boolean>>({});
  const [allExpanded, setAllExpanded] = useState(false);

  useEffect(() => {
    setLoading(true);
    const ac = new AbortController();
    api.get<CoursePreviewData>(`/courses/${courseSlug}/preview`, { signal: ac.signal })
      .then(res => {
        if (ac.signal.aborted) return;
        setData(res.data);
        if (res.data.curriculum?.length > 0) {
          setExpandedSections({ [res.data.curriculum[0].id]: true });
        }
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        router.push('/');
      })
      .finally(() => setLoading(false));
    return () => ac.abort();
  }, [courseSlug, router]);

  const toggleSection = (id: number) => {
    setExpandedSections(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleAll = () => {
    if (allExpanded) {
      setExpandedSections({});
    } else {
      const all: Record<number, boolean> = {};
      data!.curriculum.forEach(s => { all[s.id] = true; });
      setExpandedSections(all);
    }
    setAllExpanded(!allExpanded);
  };

  const handleStartLearning = () => {
    if (data?.first_lesson_slug) {
      router.push(`/learn/${courseSlug}/${data.first_lesson_slug}`);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.green, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!data) return null;

  const { course, stats, curriculum, social_proof } = data;
  const accent = COURSE_COLORS[courseSlug as string] || colors.green;
  const CourseIcon = COURSE_ICONS[courseSlug as string] || Code;
  const difficulty = course.difficulty
    ? { level: course.difficulty, color: (course.difficulty === 'Beginner' ? '#22c55e' : course.difficulty === 'Advanced' ? '#ef4444' : '#f59e0b') }
    : (DIFFICULTY_MAP[course.category] || { level: 'Beginner', color: '#22c55e' });
  const sp = social_proof || {};

  const formatCount = (n: number) => {
    if (n >= 10000) return `${(n / 1000).toFixed(1)}k`;
    if (n >= 1000) return `${(n / 1000).toFixed(1)}k`;
    return String(n);
  };

  const t = colors;

  let globalLessonIndex = 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg }} data-testid="course-preview-page">
      <SEO
        path={`/course/${courseSlug}`}
        title={`${course.title} Course`}
        description={course.description || `Master ${course.title} with ${course.lesson_count || 'hundreds of'} interactive lessons, quizzes, and hands-on projects on AlgoKube.`}
        course={{
          name: course.title,
          title: course.title,
          category: course.category,
          difficulty: course.difficulty,
          lesson_count: course.lesson_count,
          section_count: course.section_count,
          price: 0,
        }}
      />

      <PageHeader />

      <motion.section
        initial="hidden"
        animate="show"
        variants={stagger}
        className="relative overflow-hidden border-b"
        style={{ borderColor: t.borderLight }}
      >
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute -top-32 -right-32 w-96 h-96 rounded-full blur-[120px] opacity-20" style={{ backgroundColor: accent }} />
          <div className="absolute -bottom-20 -left-20 w-64 h-64 rounded-full blur-[100px] opacity-10" style={{ backgroundColor: accent }} />
        </div>

        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 lg:py-24 relative">
          <div className="grid lg:grid-cols-[1fr_380px] gap-12 lg:gap-20 items-start">
            <div>
              <motion.div variants={fadeUp} className="flex items-center gap-3 mb-6">
                <div className="w-12 h-12 rounded-2xl flex items-center justify-center" style={{ backgroundColor: accent + '18' }}>
                  <span style={{ color: accent }}><CourseIcon size={24} /></span>
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ color: accent, borderColor: accent + '40', backgroundColor: accent + '08', fontFamily: 'JetBrains Mono, monospace' }}>
                    {course.category}
                  </span>
                  <span className="px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ color: difficulty.color, borderColor: difficulty.color + '40', backgroundColor: difficulty.color + '08', fontFamily: 'JetBrains Mono, monospace' }}>
                    {difficulty.level}
                  </span>
                </div>
              </motion.div>

              <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-5 leading-[1.1]" style={{ color: t.text }} data-testid="course-title">
                {course.title}
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base lg:text-lg leading-relaxed mb-8 max-w-xl" style={{ color: t.textSecondary }}>
                {course.description}
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-3 mb-10">
                <button
                  onClick={handleStartLearning}
                  className="group flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
                  style={{ backgroundColor: accent, color: '#fff', boxShadow: `0 8px 32px ${accent}40` }}
                  data-testid="hero-start-learning"
                >
                  <Play size={16} fill="currentColor" />
                  Start Learning — Free
                  <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
                </button>
                {!isSubscribed && (
                  <button
                    onClick={() => router.push('/pricing')}
                    className="flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all hover:scale-105 active:scale-95"
                    style={{ borderColor: t.border, color: t.text, backgroundColor: 'transparent' }}
                    data-testid="hero-go-pro"
                  >
                    <Zap size={14} style={{ color: '#f59e0b' }} />
                    Unlock All with Pro
                  </button>
                )}
              </motion.div>

              {sp.enrollments > 0 && (
                <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-4 mb-6" data-testid="social-proof-bar">
                  <div className="flex items-center gap-1.5" data-testid="social-proof-enrollments">
                    <Users size={14} style={{ color: accent }} />
                    <span className="text-sm font-bold" style={{ color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>{formatCount(sp.enrollments)}</span>
                    <span className="text-xs" style={{ color: t.textMuted }}>enrolled</span>
                  </div>

                  <div className="w-px h-4" style={{ backgroundColor: t.borderLight }} />

                  <div className="flex items-center gap-1.5" data-testid="social-proof-rating">
                    <div className="flex items-center gap-0.5">
                      {[1, 2, 3, 4, 5].map(i => (
                        <Star key={i} size={13} fill={i <= Math.floor(sp.rating) ? '#f59e0b' : (i - 0.5 <= sp.rating ? '#f59e0b' : 'none')} style={{ color: i <= sp.rating ? '#f59e0b' : t.borderLight }} />
                      ))}
                    </div>
                    <span className="text-sm font-bold" style={{ color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>{sp.rating}</span>
                    <span className="text-xs" style={{ color: t.textMuted }}>({sp.reviews} reviews)</span>
                  </div>

                  <div className="w-px h-4 hidden sm:block" style={{ backgroundColor: t.borderLight }} />

                  {sp.weekly_signups > 0 && (
                    <div className="flex items-center gap-1.5 hidden sm:flex" data-testid="social-proof-weekly">
                      <TrendingUp size={14} style={{ color: colors.green }} />
                      <span className="text-xs" style={{ color: t.textMuted }}>
                        <span className="font-bold" style={{ color: colors.green }}>{sp.weekly_signups}</span> joined this week
                      </span>
                    </div>
                  )}
                </motion.div>
              )}

              <motion.div variants={fadeUp} className="flex items-center gap-2 text-xs" style={{ color: t.textMuted }}>
                <CheckCircle2 size={14} style={{ color: colors.green }} />
                First 3 lessons free — no account required
              </motion.div>
            </div>

            <motion.div
              variants={scaleIn}
              className="rounded-2xl border p-6 lg:p-8 space-y-6"
              style={{ backgroundColor: isDark ? t.surface : t.bgCard, borderColor: t.border }}
              data-testid="course-stats-card"
            >
              <h3 className="text-sm font-bold uppercase tracking-widest" style={{ color: t.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                Course Overview
              </h3>
              <div className="space-y-4">
                {[
                  { icon: BookOpen, label: 'Lessons', value: stats.total_lessons, color: accent },
                  { icon: Layers, label: 'Sections', value: stats.total_sections, color: colors.blue || '#3b82f6' },
                  { icon: Clock, label: 'Est. Time', value: stats.estimated_hours > 1 ? `${stats.estimated_hours}h` : `${stats.total_minutes}min`, color: colors.purple || '#a855f7' },
                  { icon: BarChart3, label: 'Difficulty', value: difficulty.level, color: difficulty.color },
                  { icon: Terminal, label: 'Language', value: course.language || 'Multiple', color: colors.orange || '#f97316' },
                ].map(({ icon: Icon, label, value, color }) => (
                  <div key={label} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: (color as string) + '12' }}>
                        <Icon size={16} style={{ color: color as string }} />
                      </div>
                      <span className="text-sm" style={{ color: t.textSecondary }}>{label}</span>
                    </div>
                    <span className="text-sm font-bold" style={{ color: t.text, fontFamily: 'JetBrains Mono, monospace' }}>{value}</span>
                  </div>
                ))}
              </div>
              <div className="pt-2 border-t" style={{ borderColor: t.borderLight }}>
                <div className="flex items-center gap-2 text-xs" style={{ color: t.textMuted }}>
                  <Award size={14} style={{ color: '#f59e0b' }} />
                  <span>Certificate on completion (Pro)</span>
                </div>
              </div>
            </motion.div>
          </div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="border-b"
        style={{ borderColor: t.borderLight, backgroundColor: isDark ? t.surface : t.bgCard }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
          <motion.h2 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold tracking-tight mb-8" style={{ color: t.text }}>
            What you'll learn
          </motion.h2>
          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {curriculum.map((section) => {
              const SIcon = SECTION_ICONS[section.icon] || BookOpen;
              return (
                <motion.div
                  key={section.id}
                  variants={scaleIn}
                  className="flex items-start gap-3 p-4 rounded-xl border transition-colors"
                  style={{ borderColor: t.borderLight, backgroundColor: isDark ? t.bg : '#fff' }}
                >
                  <div className="w-8 h-8 rounded-lg flex items-center justify-center shrink-0 mt-0.5" style={{ backgroundColor: accent + '12' }}>
                    <span style={{ color: accent }}><SIcon size={15} /></span>
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold mb-1" style={{ color: t.text }}>{section.title}</h3>
                    <p className="text-xs" style={{ color: t.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                      {section.lesson_count} lessons · {section.duration_minutes} min
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="border-b"
        style={{ borderColor: t.borderLight }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
          <motion.h2 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold tracking-tight mb-8" style={{ color: t.text }}>
            This course includes
          </motion.h2>
          <motion.div variants={stagger} className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              { icon: Code, title: 'Code Examples', desc: 'Copy-paste ready code in every lesson', color: accent },
              { icon: Terminal, title: 'Live Execution', desc: 'Run code directly in the browser', color: '#3b82f6' },
              { icon: Brain, title: 'AI Tutor', desc: 'Ask questions and get instant help', color: '#a855f7' },
              { icon: FileText, title: 'Notes & Bookmarks', desc: 'Save notes on any lesson', color: '#22c55e' },
            ].map(({ icon: Icon, title, desc, color }) => (
              <motion.div
                key={title}
                variants={scaleIn}
                className="p-5 rounded-xl border text-center"
                style={{ borderColor: t.borderLight, backgroundColor: isDark ? t.surface : t.bgCard }}
              >
                <div className="w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-3" style={{ backgroundColor: (color as string) + '12' }}>
                  <Icon size={18} style={{ color: color as string }} />
                </div>
                <h3 className="text-sm font-semibold mb-1" style={{ color: t.text }}>{title}</h3>
                <p className="text-xs" style={{ color: t.textMuted }}>{desc}</p>
              </motion.div>
            ))}
          </motion.div>
        </div>
      </motion.section>

      <motion.section
        initial="hidden"
        whileInView="show"
        viewport={{ once: true, margin: "-50px" }}
        variants={stagger}
        className="border-b"
        style={{ borderColor: t.borderLight }}
      >
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16">
          <div className="flex items-center justify-between mb-8">
            <motion.h2 variants={fadeUp} className="text-xl sm:text-2xl font-extrabold tracking-tight" style={{ color: t.text }}>
              Full Curriculum
            </motion.h2>
            <motion.button
              variants={fadeUp}
              onClick={toggleAll}
              className="text-xs font-semibold px-3 py-1.5 rounded-full border transition-colors"
              style={{ borderColor: t.border, color: t.textSecondary }}
              data-testid="toggle-all-sections"
            >
              {allExpanded ? 'Collapse All' : 'Expand All'}
            </motion.button>
          </div>

          <motion.div variants={stagger} className="space-y-3" data-testid="curriculum-sections">
            {curriculum.map((section, sectionIdx) => {
              const SIcon = SECTION_ICONS[section.icon] || BookOpen;
              const isOpen = expandedSections[section.id];
              return (
                <motion.div
                  key={section.id}
                  variants={scaleIn}
                  className="rounded-xl border overflow-hidden transition-colors"
                  style={{ borderColor: isOpen ? (accent as string) + '40' : t.borderLight, backgroundColor: isDark ? t.surface : t.bgCard }}
                  data-testid={`curriculum-section-${sectionIdx}`}
                >
                  <button
                    onClick={() => toggleSection(section.id)}
                    className="w-full flex items-center justify-between p-4 lg:p-5 text-left transition-colors"
                    data-testid={`section-toggle-${sectionIdx}`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-9 h-9 rounded-xl flex items-center justify-center" style={{ backgroundColor: (accent as string) + '12' }}>
                        <span style={{ color: accent }}><SIcon size={16} /></span>
                      </div>
                      <div>
                        <h3 className="text-sm font-bold" style={{ color: t.text }}>
                          <span className="mr-2" style={{ color: t.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>{String(sectionIdx + 1).padStart(2, '0')}</span>
                          {section.title}
                        </h3>
                        <p className="text-xs mt-0.5" style={{ color: t.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                          {section.lesson_count} lessons · {section.duration_minutes} min
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {isOpen ? <ChevronUp size={16} style={{ color: t.textMuted }} /> : <ChevronDown size={16} style={{ color: t.textMuted }} />}
                    </div>
                  </button>
                  <AnimatePresence>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.25, ease: 'easeInOut' }}
                        className="overflow-hidden"
                      >
                        <div className="px-4 lg:px-5 pb-4 lg:pb-5 space-y-1">
                          {section.lessons.map((lesson) => {
                            globalLessonIndex++;
                            const isFree = globalLessonIndex <= 3;
                            const isLocked = !isFree && !isSubscribed;
                            return (
                              <button
                                key={lesson.id}
                                onClick={() => !isLocked ? router.push(`/learn/${courseSlug}/${lesson.slug}`) : router.push('/pricing')}
                                className="w-full flex items-center justify-between py-2.5 px-3 rounded-lg text-left transition-colors group"
                                style={{ backgroundColor: 'transparent' }}
                                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.backgroundColor = isDark ? t.bgCard : t.borderLight; }}
                                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
                                data-testid={`lesson-${lesson.slug}`}
                              >
                                <div className="flex items-center gap-3 min-w-0">
                                  {isLocked ? (
                                    <Lock size={14} style={{ color: t.textMuted }} className="shrink-0" />
                                  ) : (
                                    <Play size={14} style={{ color: accent }} className="shrink-0" />
                                  )}
                                  <span className={`text-sm truncate ${isLocked ? 'opacity-60' : ''}`} style={{ color: t.text }}>
                                    {lesson.title}
                                  </span>
                                </div>
                                <div className="flex items-center gap-2 shrink-0 ml-3">
                                  {isFree && (
                                    <span className="text-[9px] font-bold uppercase tracking-widest px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.green + '18', color: colors.green, fontFamily: 'JetBrains Mono, monospace' }}>
                                      Free
                                    </span>
                                  )}
                                  <span className="text-xs" style={{ color: t.textMuted, fontFamily: 'JetBrains Mono, monospace' }}>
                                    {lesson.read_time || '5 min'}
                                  </span>
                                </div>
                              </button>
                            );
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              );
            })}
          </motion.div>
        </div>
      </motion.section>

      <section className="relative overflow-hidden" style={{ backgroundColor: isDark ? t.surface : t.bgCard }}>
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] rounded-full blur-[200px] opacity-10" style={{ backgroundColor: accent }} />
        </div>
        <div className="max-w-[700px] mx-auto px-6 lg:px-8 py-20 text-center relative">
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-4" style={{ color: t.text }}>
            Ready to master {course.title.split(' ')[0]}?
          </h2>
          <p className="text-sm mb-8 max-w-md mx-auto" style={{ color: t.textSecondary }}>
            {stats.total_lessons} lessons · {stats.total_sections} sections · ~{stats.estimated_hours}h to complete. Start free, upgrade when you're ready.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <button
              onClick={handleStartLearning}
              className="group flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all hover:scale-105 active:scale-95"
              style={{ backgroundColor: accent, color: '#fff', boxShadow: `0 8px 32px ${accent}40` }}
              data-testid="cta-start-learning"
            >
              <Play size={16} fill="currentColor" />
              Start First Lesson
              <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" />
            </button>
            {!isSubscribed && (
              <button
                onClick={() => router.push('/pricing')}
                className="flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-semibold border transition-all hover:scale-105 active:scale-95"
                style={{ borderColor: t.border, color: t.text }}
                data-testid="cta-go-pro"
              >
                <Star size={14} style={{ color: '#f59e0b' }} />
                Go Pro — $9.99/mo
              </button>
            )}
          </div>
          {sp.enrollments > 0 && (
            <div className="flex items-center justify-center gap-4 mt-6" data-testid="cta-social-proof">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map(i => (
                  <Star key={i} size={12} fill={i <= Math.floor(sp.rating) ? '#f59e0b' : 'none'} style={{ color: i <= sp.rating ? '#f59e0b' : t.borderLight }} />
                ))}
                <span className="text-xs ml-1 font-semibold" style={{ color: t.text }}>{sp.rating}</span>
              </div>
              <div className="w-px h-3" style={{ backgroundColor: t.borderLight }} />
              <span className="text-xs" style={{ color: t.textMuted }}>{formatCount(sp.enrollments)} students</span>
              <div className="w-px h-3" style={{ backgroundColor: t.borderLight }} />
              <span className="text-xs" style={{ color: t.textMuted }}>{sp.reviews} reviews</span>
            </div>
          )}
        </div>
      </section>

      {user && isSubscribed && (
        <section className="py-6">
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8">
            <CourseCertificateSection courseSlug={courseSlug as string} />
          </div>
        </section>
      )}

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12">
        <RecommendedCourses excludeSlug={courseSlug as string} title="Students Also Enrolled In" maxItems={4} />
      </div>

      <footer className="border-t py-6" style={{ borderColor: t.borderLight }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 flex items-center justify-between">
          <button onClick={() => router.push('/')} className="text-xs font-medium" style={{ color: t.textMuted }}>
            &copy; 2026 AlgoKube
          </button>
          <button onClick={() => router.push('/')} className="text-xs" style={{ color: t.textMuted }}>
            View all courses
          </button>
        </div>
      </footer>
    </div>
  );
};

export default CoursePreviewPage;
