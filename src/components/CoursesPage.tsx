'use client';

import React, { useState, useEffect, useRef } from 'react';
import type { FC } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import SEO from '@/components/SEO';
import PageHeader from '@/components/PageHeader';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code,
  ArrowRight,
  Layers, Clock, Lock,
  Search, Star,
  LayoutGrid, List, ChevronDown,
  Users, GraduationCap,
} from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';

import { COURSE_ICONS, COURSE_COLORS, CATEGORY_META } from '@/config/courseConfig';

interface CourseSocialProof {
  rating?: number;
  enrollments?: number;
}

interface CourseItem {
  id: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  lesson_count: number;
  section_count: number;
  order?: number;
  difficulty?: string;
  social_proof?: CourseSocialProof;
}

interface ThemeTokens {
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

const dk: ThemeTokens = {
  bg: '#050505', surface: '#0a0a0a', surfaceHi: '#121212',
  border: '#27272a', borderSubtle: '#18181b',
  text: '#ffffff', textSec: '#a1a1aa', textMut: '#8c8c96',
  primary: '#22c55e', glow: 'rgba(34,197,94,0.5)',
  blue: '#3b82f6', purple: '#a855f7', orange: '#f97316',
};
const lt: ThemeTokens = {
  bg: '#ffffff', surface: '#fafafa', surfaceHi: '#f4f4f5',
  border: '#e4e4e7', borderSubtle: '#f4f4f5',
  text: '#09090b', textSec: '#52525b', textMut: '#a1a1aa',
  primary: '#16a34a', glow: 'rgba(22,163,74,0.3)',
  blue: '#2563eb', purple: '#9333ea', orange: '#ea580c',
};

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.22, 1, 0.36, 1] as const } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.06 } } };
const scaleIn = { hidden: { opacity: 0, scale: 0.97 }, show: { opacity: 1, scale: 1, transition: { duration: 0.3, ease: [0.22, 1, 0.36, 1] as const } } };

const SORT_OPTIONS = [
  { value: 'popular', label: 'Most Popular' },
  { value: 'rated', label: 'Highest Rated' },
  { value: 'lessons', label: 'Most Lessons' },
  { value: 'newest', label: 'Newest' },
];

const StarRating: FC<{ rating: number; t: ThemeTokens }> = ({ rating, t }) => (
  <div className="flex items-center gap-1">
    {[1, 2, 3, 4, 5].map(i => (
      <Star key={i} size={11} fill={i <= Math.round(rating) ? '#f59e0b' : 'none'} stroke={i <= Math.round(rating) ? '#f59e0b' : t.textMut} strokeWidth={1.5} />
    ))}
    <span className="text-xs font-bold ml-0.5" style={{ color: t.text }}>{rating}</span>
  </div>
);

const CourseCardGrid: FC<{ course: CourseItem; t: ThemeTokens; navigate: (path: string) => void }> = ({ course, t, navigate }) => {
  const Icon = COURSE_ICONS[course.slug] || Code;
  const accent = COURSE_COLORS[course.slug] || t.primary;
  const sp = course.social_proof || {};

  return (
    <motion.button
      variants={scaleIn}
      data-testid={`course-card-${course.slug}`}
      onClick={() => navigate(`/course/${course.slug}`)}
      className="group relative rounded-xl border text-left transition-all duration-300 overflow-hidden"
      style={{ backgroundColor: t.surface, borderColor: t.border }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = (accent as string) + '60'; e.currentTarget.style.transform = 'translateY(-4px)'; e.currentTarget.style.boxShadow = `0 20px 50px ${accent}12, 0 0 0 1px ${accent}20`; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.transform = 'translateY(0)'; e.currentTarget.style.boxShadow = 'none'; }}
    >
      <div className="h-[3px]" style={{ background: `linear-gradient(90deg, ${accent}, ${accent}00)` }} />
      <div className="p-5">
        <div className="flex items-start justify-between mb-4">
          <div className="w-11 h-11 rounded-xl flex items-center justify-center transition-transform duration-200 group-hover:scale-110" style={{ backgroundColor: (accent as string) + '12' }}>
            <Icon size={20} style={{ color: accent }} />
          </div>
          <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: t.textMut, borderColor: t.border, fontFamily: 'JetBrains Mono, monospace' }}>
            {course.lesson_count} lessons
          </span>
        </div>
        <h3 className="text-sm font-bold leading-snug mb-1.5" style={{ color: t.text }}>{course.title}</h3>
        <p className="text-xs leading-relaxed mb-4 line-clamp-2" style={{ color: t.textMut }}>
          {course.description || 'Learn the fundamentals and advanced concepts through hands-on practice.'}
        </p>
        <div className="flex items-center justify-between pt-3 border-t" style={{ borderColor: t.borderSubtle }}>
          {sp.rating ? <StarRating rating={sp.rating} t={t} /> : <span />}
          <div className="flex items-center gap-3">
            {(sp.enrollments ?? 0) > 0 && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: t.textMut }}>
                <Users size={10} /> {(sp.enrollments ?? 0) >= 1000 ? `${((sp.enrollments ?? 0) / 1000).toFixed(1)}k` : sp.enrollments}
              </span>
            )}
            {course.section_count > 0 && (
              <span className="flex items-center gap-1 text-[10px]" style={{ color: t.textMut }}>
                <BookOpen size={10} /> {course.section_count} sections
              </span>
            )}
          </div>
        </div>
      </div>
    </motion.button>
  );
};

const CourseCardList: FC<{ course: CourseItem; t: ThemeTokens; navigate: (path: string) => void }> = ({ course, t, navigate }) => {
  const Icon = COURSE_ICONS[course.slug] || Code;
  const accent = COURSE_COLORS[course.slug] || t.primary;
  const sp = course.social_proof || {};

  return (
    <motion.button
      variants={fadeUp}
      data-testid={`course-list-${course.slug}`}
      onClick={() => navigate(`/course/${course.slug}`)}
      className="group w-full flex items-center gap-4 p-4 rounded-xl border text-left transition-all duration-200"
      style={{ backgroundColor: t.surface, borderColor: t.border }}
      onMouseEnter={e => { e.currentTarget.style.borderColor = (accent as string) + '60'; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
      onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; e.currentTarget.style.backgroundColor = t.surface; }}
    >
      <div className="w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: (accent as string) + '12' }}>
        <Icon size={22} style={{ color: accent }} />
      </div>
      <div className="flex-1 min-w-0">
        <h3 className="text-sm font-bold truncate" style={{ color: t.text }}>{course.title}</h3>
        <p className="text-xs mt-0.5 truncate" style={{ color: t.textMut }}>
          {course.description || 'Hands-on course with structured lessons.'}
        </p>
      </div>
      <div className="hidden sm:flex items-center gap-4 flex-shrink-0">
        {(sp.rating ?? 0) > 0 && <StarRating rating={sp.rating ?? 0} t={t} />}
        {(sp.enrollments ?? 0) > 0 && (
          <span className="flex items-center gap-1 text-xs" style={{ color: t.textMut }}>
            <Users size={11} /> {(sp.enrollments ?? 0) >= 1000 ? `${((sp.enrollments ?? 0) / 1000).toFixed(1)}k` : sp.enrollments}
          </span>
        )}
        <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full border" style={{ color: t.textMut, borderColor: t.border, fontFamily: 'JetBrains Mono, monospace' }}>
          {course.lesson_count} lessons
        </span>
      </div>
      <ArrowRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color: accent }} />
    </motion.button>
  );
};

const SortDropdown: FC<{ value: string; onChange: (v: string) => void; t: ThemeTokens }> = ({ value, onChange, t }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const h = (e: MouseEvent) => { if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false); };
    document.addEventListener('mousedown', h);
    return () => document.removeEventListener('mousedown', h);
  }, []);
  const current = SORT_OPTIONS.find(o => o.value === value);
  return (
    <div ref={ref} className="relative">
      <button
        data-testid="sort-dropdown-trigger"
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 px-3 py-2 rounded-lg border text-xs transition-colors"
        style={{ borderColor: t.border, color: t.textSec, backgroundColor: t.surface }}
        onMouseEnter={e => { e.currentTarget.style.borderColor = t.textMut; }}
        onMouseLeave={e => { e.currentTarget.style.borderColor = t.border; }}
      >
        {current?.label || 'Sort'} <ChevronDown size={12} className={`transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 4 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.12 }}
            className="absolute right-0 top-full mt-1 w-44 border rounded-lg shadow-xl py-1 z-30"
            style={{ backgroundColor: t.surface, borderColor: t.border }}
          >
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                data-testid={`sort-option-${opt.value}`}
                onClick={() => { onChange(opt.value); setOpen(false); }}
                className="w-full text-left text-xs px-3 py-2 transition-colors"
                style={{ color: value === opt.value ? t.primary : t.textSec, backgroundColor: value === opt.value ? t.primary + '10' : 'transparent' }}
                onMouseEnter={e => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = t.surfaceHi; }}
                onMouseLeave={e => { if (value !== opt.value) (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent'; }}
              >
                {opt.label}
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const CoursesPage: FC = () => {
  const { isDark } = useTheme();
  const { user, login } = useAuth();
  const router = useRouter();
  const t = isDark ? dk : lt;

  const [courses, setCourses] = useState<CourseItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeCategory, setActiveCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState('popular');
  const [viewMode, setViewMode] = useState('grid');
  const searchRef = useRef<HTMLInputElement>(null);
  const gridRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        const [coursesRes, catsRes] = await Promise.all([
          api.get<{ courses: CourseItem[] } | CourseItem[]>(`/courses`, { signal: ac.signal, cache: 'no-store' }),
          api.get<string[]>(`/categories`, { signal: ac.signal }),
        ]);
        if (ac.signal.aborted) return;
        setCourses(coursesRes.data && 'courses' in coursesRes.data ? coursesRes.data.courses : (coursesRes.data as CourseItem[]) || []);
        setCategories(catsRes.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      }
      finally { setLoading(false); }
    };
    fetchData();
    return () => ac.abort();
  }, []);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        searchRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  const allTabs = ['All', ...categories];

  const filtered = courses.filter(c => {
    const matchesCategory = activeCategory === 'All' || c.category === activeCategory;
    const query = searchQuery.toLowerCase().trim();
    const matchesSearch = !query || c.title.toLowerCase().includes(query) || (c.description || '').toLowerCase().includes(query);
    return matchesCategory && matchesSearch;
  });

  const sorted = [...filtered].sort((a, b) => {
    const spA = a.social_proof || {};
    const spB = b.social_proof || {};
    switch (sortBy) {
      case 'popular': return (spB.enrollments || 0) - (spA.enrollments || 0);
      case 'rated': return (spB.rating || 0) - (spA.rating || 0);
      case 'lessons': return b.lesson_count - a.lesson_count;
      case 'newest': return (b.order || 0) - (a.order || 0);
      default: return 0;
    }
  });

  const activeCourses = sorted.filter(c => c.lesson_count > 0);
  const comingSoon = sorted.filter(c => c.lesson_count === 0);
  const totalLessons = courses.reduce((a, c) => a + c.lesson_count, 0);
  const activeCourseCount = courses.filter(c => c.lesson_count > 0).length;

  return (
    <div className="min-h-screen" style={{ backgroundColor: t.bg, color: t.text }}>
      <SEO
        title="All Courses | AlgoKube"
        path="/courses"
        description={`Browse ${activeCourseCount} courses with ${totalLessons}+ lessons. Master programming, AI, databases, and more.`}
      />

      <PageHeader />

      <div className="border-b" style={{ borderColor: t.borderSubtle }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-12 lg:py-16">
          <motion.div initial="hidden" animate="show" variants={stagger}>
            <motion.span variants={fadeUp} className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-widest border mb-4" style={{ color: t.primary, borderColor: t.primary + '30', backgroundColor: t.primary + '08', fontFamily: 'JetBrains Mono, monospace' }}>
              <GraduationCap size={12} /> {activeCourseCount} courses &middot; {totalLessons}+ lessons
            </motion.span>
            <motion.h1 variants={fadeUp} className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight mb-3" style={{ color: t.text }}>
              Explore All Courses
            </motion.h1>
            <motion.p variants={fadeUp} className="text-sm sm:text-base max-w-xl" style={{ color: t.textSec }}>
              Structured, hands-on courses in programming, AI, databases, and more. Filter by category, search by name, and find the perfect course for your goals.
            </motion.p>
          </motion.div>
        </div>
      </div>

      <div className="sticky top-14 z-40 border-b backdrop-blur-xl" style={{ backgroundColor: isDark ? 'rgba(5,5,5,0.9)' : 'rgba(255,255,255,0.9)', borderColor: t.borderSubtle }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-3">
            <div className="relative flex-1 w-full sm:max-w-xs">
              <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" style={{ color: t.textMut }} />
              <input
                ref={searchRef}
                data-testid="courses-search-input"
                type="text"
                placeholder="Search courses..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-16 py-2 rounded-lg border text-xs outline-none transition-colors"
                style={{ backgroundColor: t.surface, borderColor: t.border, color: t.text }}
                onFocus={e => { e.currentTarget.style.borderColor = t.primary; }}
                onBlur={e => { e.currentTarget.style.borderColor = t.border; }}
              />
              <kbd className="absolute right-3 top-1/2 -translate-y-1/2 text-[10px] px-1.5 py-0.5 rounded border hidden sm:inline" style={{ color: t.textMut, borderColor: t.border, backgroundColor: t.surfaceHi }}>Ctrl+K</kbd>
            </div>

            <div className="flex items-center gap-1.5 flex-wrap flex-1">
              {allTabs.map(cat => {
                const isActive = activeCategory === cat;
                const CatIcon = (CATEGORY_META[cat] || { icon: Layers }).icon;
                return (
                  <button
                    key={cat}
                    data-testid={`courses-filter-${cat.toLowerCase().replace(/\s+/g, '-')}`}
                    onClick={() => setActiveCategory(cat)}
                    className="flex items-center gap-1 px-3 py-1.5 rounded-full text-[11px] font-semibold border transition-all"
                    style={{
                      backgroundColor: isActive ? t.primary + '15' : 'transparent',
                      borderColor: isActive ? t.primary + '50' : t.border,
                      color: isActive ? t.primary : t.textSec,
                    }}
                    onMouseEnter={e => { if (!isActive) { e.currentTarget.style.borderColor = t.textMut; e.currentTarget.style.color = t.text; } }}
                    onMouseLeave={e => { if (!isActive) { e.currentTarget.style.borderColor = isActive ? t.primary + '50' : t.border; e.currentTarget.style.color = isActive ? t.primary : t.textSec; } }}
                  >
                    <CatIcon size={11} /> {cat === 'AI & Machine Learning' ? 'AI / ML' : cat}
                  </button>
                );
              })}
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <SortDropdown value={sortBy} onChange={setSortBy} t={t} />
              <div className="flex rounded-lg border overflow-hidden" style={{ borderColor: t.border }}>
                <button
                  data-testid="view-grid-btn"
                  onClick={() => setViewMode('grid')}
                  className="p-2 transition-colors"
                  style={{ backgroundColor: viewMode === 'grid' ? t.primary + '15' : 'transparent', color: viewMode === 'grid' ? t.primary : t.textMut }}
                >
                  <LayoutGrid size={14} />
                </button>
                <button
                  data-testid="view-list-btn"
                  onClick={() => setViewMode('list')}
                  className="p-2 transition-colors"
                  style={{ backgroundColor: viewMode === 'list' ? t.primary + '15' : 'transparent', color: viewMode === 'list' ? t.primary : t.textMut }}
                >
                  <List size={14} />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-8">
        {loading ? (
          <div className="flex items-center justify-center h-40">
            <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: t.primary, borderTopColor: 'transparent' }} />
          </div>
        ) : (
          <>
            <div className="flex items-center justify-between mb-6">
              <p className="text-xs" style={{ color: t.textMut }}>
                {activeCourses.length} course{activeCourses.length !== 1 ? 's' : ''} found
                {searchQuery && <span> for &quot;<span style={{ color: t.text }}>{searchQuery}</span>&quot;</span>}
                {activeCategory !== 'All' && <span> in <span style={{ color: t.primary }}>{activeCategory}</span></span>}
              </p>
              {searchQuery && (
                <button
                  data-testid="clear-search-btn"
                  onClick={() => setSearchQuery('')}
                  className="text-xs px-2 py-1 rounded-md transition-colors"
                  style={{ color: t.textSec }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                >
                  Clear search
                </button>
              )}
            </div>

            <motion.div
              ref={gridRef}
              initial="hidden"
              animate="show"
              variants={stagger}
              className={viewMode === 'grid'
                ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4'
                : 'flex flex-col gap-2'
              }
              data-testid="courses-results"
            >
              {activeCourses.map(course =>
                viewMode === 'grid'
                  ? <CourseCardGrid key={course.id} course={course} t={t} navigate={router.push} />
                  : <CourseCardList key={course.id} course={course} t={t} navigate={router.push} />
              )}
            </motion.div>

            {activeCourses.length === 0 && (
              <div className="text-center py-20">
                <Search size={32} style={{ color: t.textMut }} className="mx-auto mb-4" />
                <p className="text-sm font-medium mb-1" style={{ color: t.text }}>No courses found</p>
                <p className="text-xs" style={{ color: t.textMut }}>
                  {searchQuery ? 'Try a different search term or clear the filter.' : 'No courses in this category yet.'}
                </p>
                {(searchQuery || activeCategory !== 'All') && (
                  <button
                    data-testid="reset-filters-btn"
                    onClick={() => { setSearchQuery(''); setActiveCategory('All'); }}
                    className="mt-4 text-xs font-medium px-4 py-2 rounded-lg border transition-colors"
                    style={{ color: t.primary, borderColor: t.primary + '40' }}
                  >
                    Reset all filters
                  </button>
                )}
              </div>
            )}

            {comingSoon.length > 0 && (
              <div className="mt-12 pt-8 border-t" style={{ borderColor: t.borderSubtle }}>
                <h3 className="text-sm font-bold mb-4 flex items-center gap-2" style={{ color: t.textMut }}>
                  <Clock size={14} /> Coming Soon
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {comingSoon.map(course => {
                    const Icon = COURSE_ICONS[course.slug] || Code;
                    return (
                      <div key={course.id} className="rounded-xl border overflow-hidden" style={{ backgroundColor: t.surface, borderColor: t.border }}>
                        <div className="h-[3px]" style={{ backgroundColor: t.border }} />
                        <div className="p-5 flex flex-col items-center justify-center min-h-[140px]">
                          <div className="w-10 h-10 rounded-xl flex items-center justify-center mb-3" style={{ backgroundColor: t.surfaceHi }}>
                            <Icon size={18} style={{ color: t.textMut }} />
                          </div>
                          <p className="text-xs font-medium mb-2" style={{ color: t.textMut }}>{course.title}</p>
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border" style={{ borderColor: '#f59e0b40', color: '#f59e0b', backgroundColor: '#f59e0b08', fontFamily: 'JetBrains Mono, monospace' }}>
                            <Lock size={9} /> Coming Soon
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </>
        )}
      </div>

      <div className="border-t" style={{ borderColor: t.borderSubtle }}>
        <div className="max-w-[1280px] mx-auto px-6 lg:px-8 py-16 text-center">
          <h2 className="text-xl sm:text-2xl font-extrabold mb-2" style={{ color: t.text }}>Ready to start learning?</h2>
          <p className="text-sm mb-6 max-w-md mx-auto" style={{ color: t.textSec }}>Every course starts with free lessons. No credit card required.</p>
          <button
            data-testid="courses-cta-btn"
            onClick={user ? () => router.push('/dashboard') : login}
            className="inline-flex items-center gap-2 px-6 py-3 rounded-full text-sm font-semibold transition-all"
            style={{ backgroundColor: t.primary, color: '#052e16' }}
            onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 24px ${t.glow}`; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
          >
            {user ? 'Go to Dashboard' : 'Get Started Free'} <ArrowRight size={14} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default CoursesPage;
