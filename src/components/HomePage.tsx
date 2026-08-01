'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useCourseStore } from '@/store/courses';

import SEO from './SEO';
import { motion, useInView, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code,
  Brain, Sparkles, ArrowRight, ChevronRight,
  Layers, Server, Clock, Play, Lock,
  Terminal, Search, Star, TrendingUp,
  GraduationCap,
  Shield, Flame, Users,
  GitBranch,
} from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

import { COURSE_ICONS, COURSE_COLORS, CATEGORY_META } from '@/config/courseConfig';
import SkillQuiz from './home/SkillQuiz';
import SkillsCube from './home/SkillsCube';
import MoneyBackBadge from './home/MoneyBackBadge';
import FlashBanner from './home/FlashBanner';
import HomeHeader from './home/HomeHeader';
import SiteFooter from './SiteFooter';

interface Course {
  id: number;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  lesson_count: number;
  section_count?: number;
  social_proof?: { rating?: number; enrollments?: number };
}

interface LearningPath {
  id: number;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  icon: string;
  courses: { course_slug: string; title: string; lesson_count: number; section_count: number }[];
  course_count: number;
  estimated_hours: number;
  total_lessons: number;
}

interface ContinueData {
  slug: string;
  title: string;
  next_lesson?: { slug: string; title: string };
  progress_percent: number;
}

interface DesignTokens {
  bg: string;
  surface: string;
  surfaceHi: string;
  border: string;
  borderSubtle: string;
  text: string;
  textSec: string;
  textMut: string;
  primary: string;
  glow: string;
  blue: string;
  purple: string;
  orange: string;
}

const FEATURED_COURSES = [
  {
    slug: 'fine-tuning-llms',
    note: 'The most in-demand AI skill of 2026. Learn LoRA, QLoRA, and RLHF techniques used by OpenAI and Anthropic engineers.',
    tag: 'Trending',
  },
  {
    slug: 'neural-networks-from-scratch',
    note: 'Build neural networks from pure math — no frameworks. The course every ML engineer wishes they took first.',
    tag: 'Editor\'s Pick',
  },
  {
    slug: 'prompt-engineering',
    note: 'From zero-shot to chain-of-thought — master the art of getting the best output from any LLM.',
    tag: 'Hot',
  },
];

const dk: DesignTokens = {
  bg: '#050505', surface: '#0a0a0a', surfaceHi: '#121212',
  border: '#27272a', borderSubtle: '#18181b',
  text: '#ffffff', textSec: '#a1a1aa', textMut: '#8c8c96',
  primary: '#22c55e', glow: 'rgba(34,197,94,0.5)',
  blue: '#3b82f6', purple: '#a855f7', orange: '#f97316',
};

const lt: DesignTokens = {
  bg: '#ffffff', surface: '#fafafa', surfaceHi: '#f4f4f5',
  border: '#e4e4e7', borderSubtle: '#f4f4f5',
  text: '#09090b', textSec: '#52525b', textMut: '#a1a1aa',
  primary: '#16a34a', glow: 'rgba(22,163,74,0.3)',
  blue: '#2563eb', purple: '#9333ea', orange: '#ea580c',
};

const fadeUp = { hidden: { opacity: 0, y: 30 }, show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.95 }, show: { opacity: 1, scale: 1, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } };

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  style?: React.CSSProperties;
  id?: string;
}

const Section: React.FC<SectionProps> = ({ children, className = '', style = {}, id }) => {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: '-60px' });
  return (
    <motion.section
      id={id}
      ref={ref}
      initial="hidden"
      animate={isInView ? 'show' : 'hidden'}
      variants={stagger}
      className={className}
      style={style}
    >
      {children}
    </motion.section>
  );
};

const HomePage: React.FC = () => {
  const { isDark, toggleTheme } = useTheme();
  const { user, login } = useAuth();
  const { courses: storeCourses, fetchCourses } = useCourseStore();
  const router = useRouter();

  const t = isDark ? dk : lt;

  const [courses, setCourses] = useState<Course[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [categories, setCategories] = useState<string[]>([]);
  const [learningPaths, setLearningPaths] = useState<LearningPath[]>([]);
  const [continueData, setContinueData] = useState<ContinueData | null>(null);

  const [featuredIdx, setFeaturedIdx] = useState(0);

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  const [prevStoreCourses, setPrevStoreCourses] = useState<Course[]>(storeCourses as unknown as Course[]);
  if ((storeCourses as unknown as Course[]) !== prevStoreCourses && storeCourses.length > 0) {
    setPrevStoreCourses(storeCourses as unknown as Course[]);
    setCourses(storeCourses as unknown as Course[]);
  }

  useEffect(() => {
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        const [catsRes, pathsRes] = await Promise.all([
          api.get<string[]>(`/categories`, { signal: ac.signal }),
          api.get<LearningPath[]>(`/learning-paths`, { signal: ac.signal }),
        ]);
        if (ac.signal.aborted) return;
        setCategories(catsRes.data); setLearningPaths(pathsRes.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      }
      finally { setLoading(false); }
    };
    fetchData();
    return () => ac.abort();
  }, []);

  const [prevUser, setPrevUser] = useState(user);
  if (user !== prevUser) {
    setPrevUser(user);
    setContinueData(null);
  }

  useEffect(() => {
    if (!user) return;
    const ac = new AbortController();
    const fetchContinue = async () => {
      try {
        const res = await api.get<{ courses: ContinueData[] }>(`/progress/continue`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        if (res.data.courses?.[0]) setContinueData(res.data.courses[0]);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
    };
    fetchContinue();
    return () => ac.abort();
  }, [user]);

  const handleCourseClick = useCallback(async (course: Course) => {
    router.push(`/course/${course.slug}`);
  }, [router]);

  useEffect(() => {
    const timer = setInterval(() => setFeaturedIdx(i => (i + 1) % FEATURED_COURSES.length), 8000);
    return () => clearInterval(timer);
  }, []);

  const filteredCourses = activeCategory === 'All' ? courses : courses.filter(c => c.category === activeCategory);
  const activeCourses = filteredCourses.filter(c => c.lesson_count > 0);
  const comingSoon = filteredCourses.filter(c => c.lesson_count === 0);
  const allTabs = ['All', ...categories];
  const totalLessons = courses.reduce((a, c) => a + c.lesson_count, 0);
  const activeCourseCount = courses.filter(c => c.lesson_count > 0).length;

  const featuredMeta = FEATURED_COURSES[featuredIdx];
  const featuredCourse = courses.find(c => c.slug === featuredMeta?.slug);
  const FeaturedIcon = featuredCourse ? (COURSE_ICONS[featuredCourse.slug] || Code) : Code;
  const featuredAccent = featuredCourse ? (COURSE_COLORS[featuredCourse.slug] || t.primary) : t.primary;
  const featuredSp = featuredCourse?.social_proof || {};

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>
      <SEO path="/" description={`Learn programming with ${courses.length}+ structured courses and ${totalLessons}+ interactive lessons.`} />

      <HomeHeader
        t={t}
        isDark={isDark}
        toggleTheme={toggleTheme}
        user={user}
        login={login}
        navigate={router.push}
        courses={courses}
        categories={categories}
      />

      {user && continueData && (
        <div className="border-b" style={{ borderColor: t.borderSubtle, backgroundColor: isDark ? '#0a120a' : '#f0fdf4' }}>
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-3">
            <button
              data-testid="continue-learning-banner"
              onClick={() => router.push(`/learn/${continueData.slug}/${continueData.next_lesson?.slug || ''}`)}
              className="w-full flex items-center gap-4 group"
            >
              <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0" style={{ backgroundColor: t.primary + '15' }}>
                <Play size={18} style={{ color: t.primary }} fill={t.primary} />
              </div>
              <div className="flex-1 min-w-0 text-left">
                <span className="text-[11px] font-bold uppercase tracking-widest" style={{ color: t.primary, fontFamily: 'JetBrains Mono, monospace' }}>Continue</span>
                <div className="text-sm font-semibold truncate" style={{ color: t.text }}>
                  {continueData.title}
                  {continueData.next_lesson && <span className="font-normal ml-2" style={{ color: t.textMut }}>— {continueData.next_lesson.title}</span>}
                </div>
              </div>
              <div className="hidden sm:flex items-center gap-3 shrink-0">
                <div className="w-28 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: t.border }}>
                  <div className="h-full rounded-full" style={{ width: `${continueData.progress_percent}%`, backgroundColor: t.primary }} />
                </div>
                <span className="text-xs font-bold tabular-nums" style={{ color: t.primary, fontFamily: 'JetBrains Mono, monospace' }}>{Math.round(continueData.progress_percent)}%</span>
              </div>
              <div className="flex items-center gap-1.5 shrink-0 px-4 py-2 rounded-full text-xs font-semibold transition-all group-hover:gap-2.5" style={{ backgroundColor: t.primary, color: '#fff' }}>
                Resume <ArrowRight size={12} />
              </div>
            </button>
          </div>
        </div>
      )}

      <FlashBanner />

      <div className="relative overflow-hidden" style={{ backgroundColor: t.bg }}>
        <div className="absolute top-[-20%] right-[-10%] w-[600px] h-[600px] rounded-full blur-[180px] pointer-events-none" style={{ backgroundColor: t.primary, opacity: isDark ? 0.06 : 0.04 }} />
        <div className="absolute bottom-[-20%] left-[-10%] w-[400px] h-[400px] rounded-full blur-[140px] pointer-events-none" style={{ backgroundColor: t.blue, opacity: isDark ? 0.04 : 0.02 }} />

        <div className="relative max-w-[1280px] mx-auto px-6 lg:px-8 pt-12 lg:pt-16 pb-16 lg:pb-20">
          <div className="grid lg:grid-cols-2 gap-16 lg:gap-20 items-center">
            <motion.div initial="hidden" animate="show" variants={stagger}>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 mb-6">
                <span
                  className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border"
                  style={{ color: t.primary, borderColor: t.primary + '30', backgroundColor: t.primary + '08', fontFamily: 'JetBrains Mono, monospace' }}
                >
                  <Sparkles size={12} /> {activeCourseCount} courses &middot; {totalLessons}+ lessons
                </span>
              </motion.div>

              <motion.h1
                variants={fadeUp}
                className="text-4xl sm:text-5xl lg:text-[56px] font-extrabold leading-[1.1] tracking-[-0.02em] mb-6"
                style={{ color: t.text }}
              >
                Master code.
                <br />
                <span style={{ color: t.primary }}>Ship faster.</span>
              </motion.h1>

              <motion.p variants={fadeUp} className="text-base lg:text-lg leading-relaxed mb-8 max-w-lg" style={{ color: t.textSec }}>
                Structured, hands-on courses built for developers who learn by doing.
                Run real code, track progress, and level up — all in one place.
              </motion.p>

              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-3 mb-8">
                <button
                  data-testid="hero-explore-btn"
                  onClick={() => router.push('/courses')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200"
                  style={{ backgroundColor: t.primary, color: '#052e16' }}
                  onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${t.glow}`; e.currentTarget.style.transform = 'translateY(-2px)'; }}
                  onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; e.currentTarget.style.transform = 'translateY(0)'; }}
                >
                  Explore Courses <ArrowRight size={14} />
                </button>
                <button
                  data-testid="hero-paths-btn"
                  onClick={() => document.getElementById('learning-paths')?.scrollIntoView({ behavior: 'smooth' })}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200"
                  style={{ color: t.textSec, borderColor: t.border }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMut; e.currentTarget.style.color = t.text; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                >
                  <GitBranch size={14} /> View Paths
                </button>
                <button
                  data-testid="hero-curriculum-btn"
                  onClick={() => router.push('/ai-curriculum')}
                  className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200"
                  style={{ color: '#8b5cf6', borderColor: '#8b5cf630' }}
                  onMouseEnter={e => { e.currentTarget.style.borderColor = '#8b5cf6'; e.currentTarget.style.backgroundColor = '#8b5cf610'; }}
                  onMouseLeave={e => { e.currentTarget.style.borderColor = '#8b5cf630'; e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  <Brain size={14} /> AI Curriculum
                </button>
              </motion.div>

              <motion.div variants={fadeUp} className="mb-6">
                <MoneyBackBadge variant="inline" />
              </motion.div>

              <motion.div variants={fadeUp} className="flex flex-wrap gap-2">
                {[
                  { label: 'Python', slug: 'python', color: '#3572A5' },
                  { label: 'JavaScript', slug: 'javascript', color: '#f1e05a' },
                  { label: 'Go', slug: 'go', color: '#00ADD8' },
                  { label: 'SQL', slug: 'sql', color: '#e38c00' },
                  { label: 'AI / ML', slug: 'mathematics-for-ai', color: '#a855f7' },
                ].map(topic => (
                  <button
                    key={topic.slug}
                    data-testid={`hero-pill-${topic.slug}`}
                    onClick={() => { const c = courses.find(cc => cc.slug === topic.slug); if (c) handleCourseClick(c); }}
                    className="group flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium transition-all duration-200 border"
                    style={{ color: t.textSec, borderColor: t.border, backgroundColor: 'transparent' }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = topic.color; e.currentTarget.style.color = topic.color; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                  >
                    <span className="w-2 h-2 rounded-full" style={{ backgroundColor: topic.color }} />
                    {topic.label}
                    <ChevronRight size={10} className="opacity-0 group-hover:opacity-100 transition-opacity -ml-0.5" />
                  </button>
                ))}
              </motion.div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
              className="hidden lg:flex items-center justify-center"
            >
              <SkillsCube />
            </motion.div>
          </div>
        </div>
      </div>

      <Section className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24" style={{ backgroundColor: t.bg }}>
        <motion.div variants={fadeUp} className="mb-16">
          <span className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3 block" style={{ color: t.primary, fontFamily: 'JetBrains Mono, monospace' }}>
            Why AlgoKube
          </span>
          <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: t.text }}>
            Everything you need to level up
          </h2>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { icon: Terminal, title: 'Run Real Code', desc: 'Execute Python, Java, Go, JS & more directly in the browser. No setup needed.', accent: t.primary, span: '' },
            { icon: Brain, title: 'AI-Powered Tutor', desc: 'Ask questions about any lesson. Get instant, context-aware explanations.', accent: t.purple, span: '' },
            { icon: GitBranch, title: 'Guided Paths', desc: 'Curated learning paths from beginner to expert. No guesswork.', accent: t.blue, span: '' },
            { icon: TrendingUp, title: 'Track Progress', desc: 'See your completion rate, streaks, and skill growth across every course.', accent: t.orange, span: '' },
            { icon: Search, title: 'Instant Search', desc: 'Find any lesson across all courses in milliseconds with Cmd+K.', accent: '#06b6d4', span: '' },
            { icon: Shield, title: 'Production-Grade', desc: '1000+ lessons authored by senior engineers. Battle-tested content.', accent: '#ec4899', span: '' },
          ].map((f, i) => (
            <motion.div
              key={i}
              variants={scaleIn}
              className={`group relative rounded-xl border p-6 transition-all duration-300 ${f.span}`}
              style={{ backgroundColor: t.surface, borderColor: t.border }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = f.accent + '50'; e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 12px 40px ${f.accent}10`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4 transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: f.accent + '12' }}>
                <f.icon size={20} style={{ color: f.accent }} />
              </div>
              <h3 className="text-sm font-bold mb-1.5" style={{ color: t.text }}>{f.title}</h3>
              <p className="text-xs leading-relaxed" style={{ color: t.textSec }}>{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </Section>

      <Section id="courses" className="border-t" style={{ borderColor: t.borderSubtle, backgroundColor: isDark ? t.surface : t.bg }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
          <motion.div variants={fadeUp} className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-10">
            <div>
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3 block" style={{ color: t.primary, fontFamily: 'JetBrains Mono, monospace' }}>
                Catalog
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight" style={{ color: t.text }}>All Courses</h2>
              <p className="text-sm mt-2" style={{ color: t.textSec }}>{activeCourseCount} courses &middot; {totalLessons}+ lessons &middot; Always free to start</p>
            </div>
          </motion.div>

          {loading ? (
            <div className="flex items-center justify-center h-40">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: t.primary, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <>
              <motion.div variants={fadeUp} className="flex flex-wrap items-center gap-2 mb-10" data-testid="category-filters">
                {allTabs.map(cat => {
                  const isActive = activeCategory === cat;
                  const meta = CATEGORY_META[cat] || { icon: Layers };
                  const CatIcon = meta.icon;
                  return (
                    <button
                      key={cat}
                      data-testid={`filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                      onClick={() => setActiveCategory(cat)}
                      className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold border transition-all duration-200"
                      style={{
                        backgroundColor: isActive ? t.primary + '15' : 'transparent',
                        borderColor: isActive ? t.primary + '50' : t.border,
                        color: isActive ? t.primary : t.textSec,
                      }}
                      onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = t.textMut; e.currentTarget.style.color = t.text; } }}
                      onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; } }}
                    >
                      <CatIcon size={12} /> {cat}
                    </button>
                  );
                })}
              </motion.div>

              {featuredCourse && activeCategory === 'All' && (
                <motion.div variants={fadeUp} className="mb-8">
                  <AnimatePresence mode="wait">
                    <motion.button
                      key={featuredCourse.slug}
                      initial={{ opacity: 0, y: 12 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: -12 }}
                      transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] as const }}
                      data-testid="featured-course-card"
                      onClick={() => handleCourseClick(featuredCourse)}
                      className="group w-full relative rounded-2xl border text-left transition-all duration-300 overflow-hidden"
                      style={{
                        backgroundColor: t.surface,
                        borderColor: featuredAccent + '30',
                        boxShadow: `0 0 60px ${featuredAccent}08`,
                      }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = featuredAccent + '60'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 20px 60px ${featuredAccent}15, 0 0 0 1px ${featuredAccent}25`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = featuredAccent + '30'; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = `0 0 60px ${featuredAccent}08`; }}
                    >
                      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${featuredAccent}, ${featuredAccent}60, transparent)` }} />
                      <div className="absolute top-0 right-0 w-[300px] h-[300px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: featuredAccent, opacity: isDark ? 0.06 : 0.03 }} />
                      <div className="relative p-6 lg:p-8">
                        <div className="flex flex-col lg:flex-row lg:items-center gap-6">
                          <div className="flex items-start gap-5 flex-1 min-w-0">
                            <div
                              className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 transition-transform duration-200 group-hover:scale-110"
                              style={{ backgroundColor: featuredAccent + '15', boxShadow: `0 0 20px ${featuredAccent}15` }}
                            >
                              <FeaturedIcon size={26} style={{ color: featuredAccent }} />
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-2 mb-2 flex-wrap">
                                <span
                                  className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest"
                                  style={{ backgroundColor: featuredAccent + '15', color: featuredAccent, fontFamily: 'JetBrains Mono, monospace' }}
                                >
                                  <Flame size={10} /> {featuredMeta.tag}
                                </span>
                                <span
                                  className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-widest border"
                                  style={{ color: t.textMut, borderColor: t.border, fontFamily: 'JetBrains Mono, monospace' }}
                                >
                                  AI & Machine Learning
                                </span>
                              </div>
                              <h3 className="text-lg lg:text-xl font-extrabold tracking-tight mb-1.5" style={{ color: t.text }}>
                                {featuredCourse.title}
                              </h3>
                              <p className="text-sm leading-relaxed mb-3 max-w-2xl" style={{ color: t.textSec }}>
                                {featuredMeta.note}
                              </p>
                              <div className="flex items-center gap-4 flex-wrap">
                                {(featuredSp.rating ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs font-bold" style={{ color: t.text }}>
                                    <Star size={12} fill="#f59e0b" stroke="#f59e0b" /> {featuredSp.rating}
                                  </span>
                                )}
                                {(featuredSp.enrollments ?? 0) > 0 && (
                                  <span className="flex items-center gap-1 text-xs" style={{ color: t.textMut }}>
                                    <Users size={12} /> {(featuredSp.enrollments ?? 0) >= 1000 ? `${((featuredSp.enrollments ?? 0) / 1000).toFixed(1)}k` : featuredSp.enrollments} enrolled
                                  </span>
                                )}
                                <span className="flex items-center gap-1 text-xs" style={{ color: t.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
                                  <BookOpen size={12} /> {featuredCourse.lesson_count} lessons
                                </span>
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center gap-3 shrink-0 lg:pl-4">
                            <span
                              className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-bold transition-all duration-200"
                              style={{ backgroundColor: featuredAccent, color: '#fff' }}
                            >
                              Start Learning <ArrowRight size={14} className="transition-transform group-hover:translate-x-0.5" />
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center gap-1.5 mt-5 lg:mt-4">
                          {FEATURED_COURSES.map((_, i) => (
                            <button
                              key={i}
                              data-testid={`featured-dot-${i}`}
                              onClick={(e) => { e.stopPropagation(); setFeaturedIdx(i); }}
                              className="w-1.5 h-1.5 rounded-full transition-all duration-300"
                              style={{
                                backgroundColor: i === featuredIdx ? featuredAccent : t.border,
                                width: i === featuredIdx ? '16px' : '6px',
                              }}
                            />
                          ))}
                        </div>
                      </div>
                    </motion.button>
                  </AnimatePresence>
                </motion.div>
              )}

              <motion.div variants={stagger} className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="course-grid">
                {activeCourses.map((course) => {
                  const Icon = COURSE_ICONS[course.slug] || Code;
                  const accent = COURSE_COLORS[course.slug] || t.primary;
                  const sp = course.social_proof || {};
                  const isPopular = (sp.enrollments ?? 0) >= 5000;
                  return (
                    <motion.button
                      key={course.id}
                      variants={scaleIn}
                      data-testid={`home-course-${course.slug}`}
                      onClick={() => handleCourseClick(course)}
                      className="group relative rounded-xl border text-left transition-all duration-300 overflow-hidden"
                      style={{ backgroundColor: t.surface, borderColor: t.border }}
                      onMouseEnter={e => { e.currentTarget.style.borderColor = accent + '60'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${accent}12, 0 0 0 1px ${accent}20`; }}
                      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                    >
                      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />
                      <div className="p-5">
                        <div className="flex items-start justify-between mb-4">
                          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: accent + '12' }}>
                            <Icon size={20} style={{ color: accent }} />
                          </div>
                          <div className="flex items-center gap-2">
                            {isPopular && (
                              <span className="text-[9px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: '#f59e0b15', color: '#f59e0b', fontFamily: 'JetBrains Mono, monospace' }}>
                                Popular
                              </span>
                            )}
                            <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: t.textMut, borderColor: t.border, fontFamily: 'JetBrains Mono, monospace' }}>
                              {course.lesson_count} lessons
                            </span>
                          </div>
                        </div>
                        <h3 className="text-sm font-bold leading-snug mb-1.5" style={{ color: t.text }}>{course.title}</h3>
                        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: t.textMut }}>
                          {course.description || 'Master the fundamentals through structured, hands-on lessons.'}
                        </p>
                        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: t.borderSubtle }}>
                          <div className="flex items-center gap-1">
                            {(sp.rating ?? 0) > 0 && <>
                              <Star size={11} fill="#f59e0b" stroke="#f59e0b" />
                              <span className="text-xs font-bold" style={{ color: t.text }}>{sp.rating}</span>
                            </>}
                          </div>
                          <div className="flex items-center gap-3">
                            {(sp.enrollments ?? 0) > 0 && (
                              <span className="flex items-center gap-1 text-[10px]" style={{ color: t.textMut }}>
                                <GraduationCap size={10} /> {(sp.enrollments ?? 0) >= 1000 ? `${((sp.enrollments ?? 0) / 1000).toFixed(1)}k` : sp.enrollments}
                              </span>
                            )}
                            <span className="text-[11px] font-bold uppercase tracking-widest opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1" style={{ color: accent }}>
                              Start <ArrowRight size={10} />
                            </span>
                          </div>
                        </div>
                      </div>
                    </motion.button>
                  );
                })}
                {comingSoon.map(course => {
                  const Icon = COURSE_ICONS[course.slug] || Code;
                  return (
                    <motion.div
                      key={course.id}
                      variants={scaleIn}
                      className="relative rounded-xl border overflow-hidden cursor-default"
                      style={{ backgroundColor: t.surface, borderColor: t.border }}
                    >
                      <div className="h-[3px]" style={{ backgroundColor: t.border }} />
                      <div className="p-6 flex flex-col items-center justify-center min-h-[160px]">
                        <div className="w-12 h-12 rounded-xl flex items-center justify-center mb-4" style={{ backgroundColor: t.surfaceHi }}>
                          <Icon size={22} style={{ color: t.textMut }} />
                        </div>
                        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ borderColor: '#f59e0b40', color: '#f59e0b', backgroundColor: '#f59e0b08', fontFamily: 'JetBrains Mono, monospace' }}>
                          <Lock size={10} /> Coming Soon
                        </span>
                      </div>
                    </motion.div>
                  );
                })}
              </motion.div>
              {activeCourses.length === 0 && comingSoon.length === 0 && (
                <div className="text-center py-12"><p className="text-sm" style={{ color: t.textMut }}>No courses in this category yet.</p></div>
              )}

              {activeCourses.length > 0 && (
                <motion.div variants={fadeUp} className="text-center mt-10">
                  <button
                    data-testid="home-browse-all-courses"
                    onClick={() => router.push('/courses')}
                    className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold border transition-all duration-200"
                    style={{ color: t.textSec, borderColor: t.border }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.primary; e.currentTarget.style.color = t.primary; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.color = t.textSec; }}
                  >
                    Browse All {activeCourseCount} Courses <ArrowRight size={14} />
                  </button>
                </motion.div>
              )}
            </>
          )}
        </div>
      </Section>

      <SkillQuiz t={t} isDark={isDark} courses={courses} learningPaths={learningPaths} navigate={router.push} onCourseClick={handleCourseClick} />

      {learningPaths.length > 0 && (
        <Section id="learning-paths" className="border-t" style={{ borderColor: t.borderSubtle, backgroundColor: t.bg }}>
          <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
            <motion.div variants={fadeUp} className="mb-12">
              <span className="text-[11px] uppercase tracking-[0.15em] font-bold mb-3 block" style={{ color: t.blue, fontFamily: 'JetBrains Mono, monospace' }}>
                Learning Paths
              </span>
              <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight mb-2" style={{ color: t.text }}>
                Follow the roadmap
              </h2>
              <p className="text-sm max-w-lg" style={{ color: t.textSec }}>
                Curated tracks that take you from beginner to expert. No more jumping between random tutorials.
              </p>
            </motion.div>

            <motion.div variants={stagger} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4" data-testid="learning-paths-grid">
              {learningPaths.map(lp => {
                const PathIcon = { brain: Brain, layers: Layers, server: Server }[lp.icon] || Layers;
                const diffColor = { Beginner: '#22c55e', Intermediate: '#f59e0b', Advanced: '#ef4444' }[lp.difficulty] || t.primary;
                return (
                  <motion.button
                    key={lp.id}
                    variants={scaleIn}
                    data-testid={`path-card-${lp.slug}`}
                    onClick={() => router.push(`/paths/${lp.slug}`)}
                    className="group text-left border rounded-xl p-6 transition-all duration-300"
                    style={{ backgroundColor: t.surface, borderColor: t.border }}
                    onMouseEnter={e => { e.currentTarget.style.borderColor = t.blue + '50'; e.currentTarget.style.transform = 'translateY(-3px)'; e.currentTarget.style.boxShadow = `0 16px 40px ${t.blue}10`; }}
                    onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
                  >
                    <div className="flex items-start justify-between mb-4">
                      <div className="w-11 h-11 rounded-xl flex items-center justify-center" style={{ backgroundColor: t.blue + '12' }}>
                        <PathIcon size={20} style={{ color: t.blue }} />
                      </div>
                      <span className="text-[10px] font-bold uppercase tracking-widest px-2 py-0.5 rounded-full" style={{ backgroundColor: diffColor + '15', color: diffColor, fontFamily: 'JetBrains Mono, monospace' }}>
                        {lp.difficulty}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold mb-1.5" style={{ color: t.text }}>{lp.title}</h3>
                    <p className="text-xs leading-relaxed line-clamp-2 mb-4" style={{ color: t.textSec }}>{lp.description}</p>
                    <div className="flex items-center gap-1.5 mb-4">
                      {lp.courses.map(c => {
                        const ac = COURSE_COLORS[c.course_slug] || t.primary;
                        const CI = COURSE_ICONS[c.course_slug] || Code;
                        return (
                          <div key={c.course_slug} className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: ac + '12' }} title={c.title}>
                            <CI size={13} style={{ color: ac }} />
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3 text-[11px]" style={{ color: t.textMut, fontFamily: 'JetBrains Mono, monospace' }}>
                        <span className="flex items-center gap-1"><BookOpen size={11} /> {lp.course_count} courses</span>
                        <span className="flex items-center gap-1"><Clock size={11} /> ~{lp.estimated_hours}h</span>
                      </div>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: t.blue }} />
                    </div>
                  </motion.button>
                );
              })}
            </motion.div>
          </div>
        </Section>
      )}

      <Section className="border-t" style={{ borderColor: t.borderSubtle, backgroundColor: t.bg }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-24">
          <motion.div
            variants={fadeUp}
            className="relative rounded-2xl border overflow-hidden p-10 lg:p-16 text-center"
            style={{
              backgroundColor: t.surface,
              borderColor: t.border,
              boxShadow: `0 0 80px ${t.glow}`,
            }}
          >
            <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[400px] h-[200px] rounded-full blur-[120px] pointer-events-none" style={{ backgroundColor: t.primary, opacity: isDark ? 0.08 : 0.05 }} />

            <div className="relative">
              <span className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-6" style={{ color: t.primary, borderColor: t.primary + '30', fontFamily: 'JetBrains Mono, monospace' }}>
                <Star size={12} /> Go Pro
              </span>
              <h2 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight mb-4" style={{ color: t.text }}>
                Unlock all {totalLessons}+ lessons
              </h2>
              <p className="text-sm lg:text-base max-w-md mx-auto mb-8" style={{ color: t.textSec }}>
                Unlimited access to every course, learning path, AI tutor, and future content. One subscription.
              </p>
              <button
                data-testid="home-cta-pricing"
                onClick={() => router.push('/pricing')}
                className="inline-flex items-center gap-2 px-8 py-3.5 rounded-full text-sm font-bold transition-all duration-200"
                style={{ backgroundColor: t.primary, color: '#052e16' }}
                onMouseEnter={e => { e.currentTarget.style.transform = 'translateY(-2px)'; e.currentTarget.style.boxShadow = `0 8px 30px ${t.glow}`; }}
                onMouseLeave={e => { e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
              >
                Go Pro — $9.99/mo <ArrowRight size={15} />
              </button>
            </div>
          </motion.div>
        </div>
      </Section>

      <SiteFooter t={t} isDark={isDark} courses={courses} />
    </div>
  );
};

export default HomePage;
