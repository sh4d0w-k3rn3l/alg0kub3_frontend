'use client';

import React, { useState, useMemo, useRef } from 'react';
import type { FC } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Code, Layers, Cpu, Database, Server, BookOpen, ArrowRight, Search,
  Star, Users, ChevronRight, Briefcase, GraduationCap, Brackets,
} from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';

const CAT_ICONS: Record<string, React.ComponentType<{ size?: number }>> = {
  'Data Structures & Algorithms': Brackets,
  'Programming Languages': Code,
  'AI & Machine Learning': Cpu,
  'Interview Prep': Briefcase,
  'Data & Databases': Database,
  'DevOps': Server,
  'Other': Layers,
};

const CAT_ACCENT: Record<string, string> = {
  'Data Structures & Algorithms': '#22c55e',
  'Programming Languages': '#3b82f6',
  'AI & Machine Learning': '#a855f7',
  'Interview Prep': '#f59e0b',
  'Data & Databases': '#14b8a6',
  'DevOps': '#f97316',
  'Other': '#6b7280',
};

const CAT_ORDER = ['Data Structures & Algorithms', 'Programming Languages', 'AI & Machine Learning', 'Interview Prep', 'DevOps', 'Data & Databases', 'Other'];

interface CourseItem {
  id?: string;
  slug: string;
  title: string;
  description?: string;
  category?: string;
  lesson_count?: number;
  difficulty?: string;
  is_new?: boolean;
  social_proof?: {
    rating?: number;
    enrollments?: number;
  };
}

interface CoursesMegaMenuProps {
  courses: CourseItem[];
  isDark: boolean;
  navigate: (path: string) => void;
  onClose: () => void;
}

const CoursesMegaMenu: FC<CoursesMegaMenuProps> = ({ courses, isDark, navigate, onClose }) => {
  const grouped = useMemo(() => {
    const g: Record<string, CourseItem[]> = {};
    (courses || []).filter(c => (c.lesson_count || 0) > 0).forEach(c => {
      const cat = c.category || 'Other';
      if (!g[cat]) g[cat] = [];
      g[cat].push(c);
    });
    Object.values(g).forEach(arr => arr.sort((a, b) => (b.lesson_count || 0) - (a.lesson_count || 0)));
    return g;
  }, [courses]);

  const sortedCategories = useMemo(() =>
    CAT_ORDER.filter(c => grouped[c]?.length > 0), [grouped]);

  const [activeCat, setActiveCat] = useState(sortedCategories[0] || '');
  const [search, setSearch] = useState('');
  const searchRef = useRef<HTMLInputElement>(null);
  const effectiveActiveCat = sortedCategories.includes(activeCat) ? activeCat : (sortedCategories[0] || '');

  const activeCourses = useMemo(() => {
    const list = grouped[effectiveActiveCat] || [];
    if (!search.trim()) return list;
    const q = search.toLowerCase();
    return list.filter(c =>
      c.title.toLowerCase().includes(q) || (c.description || '').toLowerCase().includes(q)
    );
  }, [grouped, effectiveActiveCat, search]);

  const featured = activeCourses[0];
  const rest = activeCourses.slice(1);
  const totalCourses = Object.values(grouped).reduce((s, a) => s + a.length, 0);
  const totalLessons = Object.values(grouped).flat().reduce((s, c) => s + (c.lesson_count || 0), 0);
  const accent = CAT_ACCENT[effectiveActiveCat] || '#6b7280';

  const bg = isDark ? 'rgba(8,8,8,0.92)' : 'rgba(255,255,255,0.95)';
  const sidebarBg = isDark ? 'rgba(255,255,255,0.03)' : 'rgba(0,0,0,0.02)';
  const border = isDark ? 'rgba(255,255,255,0.08)' : 'rgba(0,0,0,0.08)';
  const borderSubtle = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)';
  const textPrimary = isDark ? '#f0f0f0' : '#111111';
  const textSecondary = isDark ? '#a0a0a0' : '#6b7280';
  const textMuted = isDark ? '#666666' : '#9ca3af';
  const surfaceHover = isDark ? 'rgba(255,255,255,0.06)' : 'rgba(0,0,0,0.04)';
  const cardHover = isDark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.05)';
  const searchBg = isDark ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.04)';

  const handleCourseClick = (slug: string) => {
    onClose();
    navigate(`/course/${slug}`);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 6, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      exit={{ opacity: 0, y: 6, scale: 0.98 }}
      transition={{ duration: 0.2, ease: [0.23, 1, 0.32, 1] as const }}
      style={{
        background: bg,
        backdropFilter: 'blur(20px) saturate(1.4)',
        WebkitBackdropFilter: 'blur(20px) saturate(1.4)',
        border: `1px solid ${border}`,
        borderRadius: 16,
        boxShadow: isDark
          ? `0 0 0 1px rgba(255,255,255,0.04), 0 32px 64px -16px rgba(0,0,0,0.65), 0 0 80px -20px ${accent}12`
          : '0 32px 64px -16px rgba(0,0,0,0.15), 0 0 0 1px rgba(0,0,0,0.04)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        maxHeight: 'min(640px, calc(100vh - 100px))',
        width: '100%',
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        padding: '14px 20px 14px 24px',
        borderBottom: `1px solid ${borderSubtle}`,
        flexShrink: 0,
      }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{
            width: 28, height: 28, borderRadius: 8,
            background: `linear-gradient(135deg, ${accent}22, ${accent}08)`,
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <GraduationCap size={14} style={{ color: accent }} />
          </div>
          <div>
            <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary, letterSpacing: '-0.01em' }}>
              Browse Courses
            </span>
            <span style={{ fontSize: 11, color: textMuted, marginLeft: 8 }}>
              {totalCourses} courses &middot; {totalLessons.toLocaleString()} lessons
            </span>
          </div>
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          <div style={{ position: 'relative', display: 'flex', alignItems: 'center' }}>
            <Search size={13} style={{ position: 'absolute', left: 10, color: textMuted, pointerEvents: 'none' }} />
            <input
              ref={searchRef}
              data-testid="mega-menu-search"
              type="text"
              placeholder="Search courses..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              style={{
                width: 180,
                height: 30,
                padding: '0 10px 0 30px',
                fontSize: 12,
                color: textPrimary,
                background: searchBg,
                border: `1px solid ${borderSubtle}`,
                borderRadius: 8,
                outline: 'none',
              }}
              onFocus={e => { e.target.style.borderColor = accent; e.target.style.width = '220px'; }}
              onBlur={e => { e.target.style.borderColor = borderSubtle; e.target.style.width = '180px'; }}
            />
          </div>
          <button
            data-testid="nav-view-all-courses"
            onClick={() => { onClose(); navigate('/courses'); }}
            style={{
              display: 'flex', alignItems: 'center', gap: 4,
              padding: '6px 12px', borderRadius: 8,
              fontSize: 12, fontWeight: 600,
              color: accent, background: `${accent}10`,
              border: 'none', cursor: 'pointer',
            }}
            onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `${accent}20`}
            onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `${accent}10`}
          >
            View All <ArrowRight size={12} />
          </button>
        </div>
      </div>

      <button
        data-testid="mega-menu-launch-banner"
        onClick={() => { onClose(); navigate('/ai-engineering-for-beginners'); }}
        style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '10px 24px',
          borderBottom: `1px solid ${borderSubtle}`,
          background: `linear-gradient(90deg, #22c55e14, #22c55e05)`,
          cursor: 'pointer',
          border: 'none',
          textAlign: 'left',
        }}
        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = `linear-gradient(90deg, #22c55e22, #22c55e08)`}
        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = `linear-gradient(90deg, #22c55e14, #22c55e05)`}
      >
        <span style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <span style={{ fontSize: 9, fontWeight: 800, letterSpacing: '0.1em', padding: '2px 6px', borderRadius: 4, background: '#22c55e', color: '#052e16' }}>
            NEW
          </span>
          <span style={{ fontSize: 12, color: textPrimary, fontWeight: 600 }}>
            AI Engineering for Beginners
          </span>
          <span style={{ fontSize: 11, color: textMuted }}>
            &middot; 8 modules &middot; 68 lessons &middot; zero to production
          </span>
        </span>
        <ArrowRight size={13} style={{ color: '#22c55e' }} />
      </button>

      <div style={{ display: 'flex', flex: 1, minHeight: 0 }}>
        <div style={{
          width: 240,
          flexShrink: 0,
          background: sidebarBg,
          borderRight: `1px solid ${borderSubtle}`,
          padding: '12px 8px',
          display: 'flex',
          flexDirection: 'column',
          gap: 2,
          overflowY: 'auto',
        }}>
          {sortedCategories.map((cat) => {
            const CatIcon = CAT_ICONS[cat] || Layers;
            const catAccent = CAT_ACCENT[cat] || '#6b7280';
            const isActive = cat === effectiveActiveCat;
            const count = grouped[cat]?.length || 0;
            return (
              <button
                key={cat}
                data-testid={`mega-cat-${cat.replace(/\s+/g, '-').toLowerCase()}`}
                onClick={() => { setActiveCat(cat); setSearch(''); }}
                onMouseEnter={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = surfaceHover; }}
                onMouseLeave={(e) => { if (!isActive) (e.currentTarget as HTMLElement).style.background = 'transparent'; }}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: 10,
                  width: '100%',
                  padding: '10px 12px',
                  borderRadius: 10,
                  border: 'none',
                  cursor: 'pointer',
                  textAlign: 'left',
                  background: isActive ? `${catAccent}12` : 'transparent',
                  position: 'relative',
                }}
              >
                {isActive && (
                  <motion.div
                    layoutId="cat-indicator"
                    style={{
                      position: 'absolute',
                      left: 0, top: '50%',
                      transform: 'translateY(-50%)',
                      width: 3, height: 20,
                      borderRadius: 4,
                      background: catAccent,
                    }}
                    transition={{ type: 'spring', stiffness: 400, damping: 30 }}
                  />
                )}
                <div style={{
                  width: 30, height: 30, borderRadius: 8,
                  display: 'flex', alignItems: 'center', justifyContent: 'center',
                  background: isActive ? `${catAccent}18` : `${catAccent}08`,
                }}>
                  <span style={{ color: isActive ? catAccent : textSecondary }}><CatIcon size={14} /></span>
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 12, fontWeight: isActive ? 600 : 500, color: isActive ? textPrimary : textSecondary, lineHeight: 1.3 }}>
                    {cat}
                  </div>
                  <div style={{ fontSize: 10, color: textMuted, marginTop: 1 }}>
                    {count} {count === 1 ? 'course' : 'courses'}
                  </div>
                </div>
                <ChevronRight size={12} style={{ color: isActive ? catAccent : 'transparent', flexShrink: 0 }} />
              </button>
            );
          })}
        </div>

        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px', minHeight: 0 }}>
          <AnimatePresence mode="wait">
            <motion.div
              key={effectiveActiveCat + search}
              initial={{ opacity: 0, x: 8 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -8 }}
              transition={{ duration: 0.18, ease: 'easeOut' }}
            >
              {featured && !search.trim() && (
                <button
                  data-testid={`mega-featured-${featured.slug}`}
                  onClick={() => handleCourseClick(featured.slug)}
                  style={{
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 16,
                    width: '100%',
                    padding: 16,
                    marginBottom: 16,
                    borderRadius: 12,
                    border: `1px solid ${accent}18`,
                    background: `linear-gradient(135deg, ${accent}06, ${accent}02)`,
                    cursor: 'pointer',
                    textAlign: 'left',
                  }}
                  onMouseEnter={e => {
                    e.currentTarget.style.borderColor = `${accent}35`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${accent}10, ${accent}04)`;
                    e.currentTarget.style.transform = 'translateY(-1px)';
                    e.currentTarget.style.boxShadow = `0 8px 24px -8px ${accent}20`;
                  }}
                  onMouseLeave={e => {
                    e.currentTarget.style.borderColor = `${accent}18`;
                    e.currentTarget.style.background = `linear-gradient(135deg, ${accent}06, ${accent}02)`;
                    e.currentTarget.style.transform = 'none';
                    e.currentTarget.style.boxShadow = 'none';
                  }}
                >
                  <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    background: `${(COURSE_COLORS[featured.slug] || accent)}18`,
                    flexShrink: 0,
                  }}>
                    {React.createElement(COURSE_ICONS[featured.slug] || BookOpen, {
                      size: 20,
                      style: { color: COURSE_COLORS[featured.slug] || accent },
                    })}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                      <span style={{ fontSize: 13, fontWeight: 700, color: textPrimary }}>
                        {featured.title}
                      </span>
                      <span style={{ fontSize: 9, fontWeight: 700, padding: '2px 6px', borderRadius: 4, background: `${accent}15`, color: accent, textTransform: 'uppercase', letterSpacing: '0.04em' }}>
                        Featured
                      </span>
                    </div>
                    <p style={{ fontSize: 11, color: textSecondary, lineHeight: 1.5, margin: 0, display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical', overflow: 'hidden' }}>
                      {featured.description}
                    </p>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginTop: 8 }}>
                      <span style={{ display: 'flex', alignItems: 'center', gap: 4, fontSize: 10, color: textMuted }}>
                        <BookOpen size={10} /> {featured.lesson_count || 0} lessons
                      </span>
                      {(featured.social_proof?.rating ?? 0) > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: '#f59e0b' }}>
                          <Star size={10} fill="#f59e0b" /> {featured.social_proof?.rating}
                        </span>
                      )}
                      {(featured.social_proof?.enrollments ?? 0) > 0 && (
                        <span style={{ display: 'flex', alignItems: 'center', gap: 3, fontSize: 10, color: textMuted }}>
                          <Users size={10} /> {((featured.social_proof?.enrollments ?? 0) / 1000).toFixed(1)}k enrolled
                        </span>
                      )}
                      {featured.difficulty && (
                        <span style={{ fontSize: 9, padding: '1px 5px', borderRadius: 4, background: surfaceHover, color: textSecondary }}>
                          {featured.difficulty}
                        </span>
                      )}
                    </div>
                  </div>
                  <ArrowRight size={14} style={{ color: textMuted, flexShrink: 0, marginTop: 4 }} />
                </button>
              )}

              {(search.trim() ? activeCourses : rest).length > 0 ? (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 6 }}>
                  {(search.trim() ? activeCourses : rest).map((course, i) => {
                    const Icon = COURSE_ICONS[course.slug] || Code;
                    const color = COURSE_COLORS[course.slug] || '#6b7280';
                    return (
                      <motion.button
                        key={course.id}
                        data-testid={`nav-dropdown-course-${course.slug}`}
                        initial={{ opacity: 0, y: 4 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.15, delay: Math.min(i * 0.02, 0.2) }}
                        onClick={() => handleCourseClick(course.slug)}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: 10,
                          padding: '10px 12px',
                          borderRadius: 10,
                          border: 'none',
                          background: 'transparent',
                          cursor: 'pointer',
                          textAlign: 'left',
                          width: '100%',
                        }}
                        onMouseEnter={e => (e.currentTarget as HTMLElement).style.background = cardHover}
                        onMouseLeave={e => (e.currentTarget as HTMLElement).style.background = 'transparent'}
                      >
                        <div style={{
                          width: 34, height: 34, borderRadius: 9,
                          display: 'flex', alignItems: 'center', justifyContent: 'center',
                          background: `${color}12`,
                          flexShrink: 0,
                        }}>
                          <Icon size={15} style={{ color }} />
                        </div>
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{ fontSize: 12, fontWeight: 500, color: textPrimary, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {course.title}
                          </div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
                            <span style={{ fontSize: 10, color: textMuted }}>{course.lesson_count || 0} lessons</span>
                            {(course.social_proof?.rating ?? 0) > 0 && (
                              <span style={{ display: 'flex', alignItems: 'center', gap: 2, fontSize: 10, color: '#f59e0b' }}>
                                <Star size={8} fill="#f59e0b" /> {course.social_proof?.rating}
                              </span>
                            )}
                            {course.is_new && (
                              <span style={{ fontSize: 8, fontWeight: 700, padding: '1px 4px', borderRadius: 3, background: '#22c55e22', color: '#22c55e', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                New
                              </span>
                            )}
                          </div>
                        </div>
                      </motion.button>
                    );
                  })}
                </div>
              ) : search.trim() ? (
                <div style={{ textAlign: 'center', padding: '40px 20px', color: textMuted, fontSize: 13 }}>
                  No courses match &quot;{search}&quot; in {effectiveActiveCat}
                </div>
              ) : null}
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </motion.div>
  );
};

export default CoursesMegaMenu;
