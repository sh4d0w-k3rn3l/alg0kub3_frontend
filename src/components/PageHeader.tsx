'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { createPortal } from 'react-dom';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code, Sun, Moon, LogIn, User, ArrowRight, ChevronRight,
  Layers, Terminal, Menu, X, Trophy, Gift, Target,
  Server, Braces, ChevronDown, Flame, Zap, LogOut, LayoutDashboard, Settings,
} from 'lucide-react';
import { api } from '@/lib/api';
import { COURSE_ICONS, COURSE_COLORS, CATEGORY_META } from '@/config/courseConfig';
import NotificationBell from './NotificationBell';
import CoursesMegaMenu from './CoursesMegaMenu';
import { WHATS_NEW_FALLBACK, KIND_META, relativeTime, fetchWhatsNew } from '@/config/whatsNew';
import { fetchNavigation, HEADER_FALLBACK, visible } from '@/config/navigation';
import type { NavigationConfig, Course } from '@/types';
import { useUIStore } from '@/store/ui';
import { useCourseStore } from '@/store/courses';

const NAV_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = { Code, Server, Braces, Target };

interface NavLink {
  label: string;
  path: string;
  desc?: string;
  isNew?: boolean;
}

interface PracticeItem {
  label: string;
  desc: string;
  icon: React.ComponentType<{ size?: number; style?: React.CSSProperties }>;
  path: string;
  isNew?: boolean;
}

interface StreakData {
  streak: number;
  active_today: boolean;
  xp: number;
}

const PageHeader = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  const t = {
    bg: colors.bg,
    surface: colors.bgSecondary,
    surfaceHi: colors.hoverBg,
    border: colors.border,
    borderSubtle: colors.borderLight,
    text: colors.text,
    textSec: colors.textSecondary,
    textMut: colors.textMuted,
    primary: colors.green,
    glow: colors.greenBg,
  };

  const pathParts = (pathname ?? '').split('/');
  const courseSlug = (pathParts[1] === 'course' || pathParts[1] === 'learn') ? pathParts[2] : null;
  const accent = (courseSlug && COURSE_COLORS[courseSlug]) || t.primary;

  const [courses, setCourses] = useState<Course[]>([]);
  const { sidebarOpen, setSidebarOpen, coursesOpen, setCoursesOpen, practiceOpen, setPracticeOpen, moreOpen, setMoreOpen, toggleSidebar } = useUIStore();
  const { courses: storeCourses, fetchCourses } = useCourseStore();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [streak, setStreak] = useState<StreakData | null>(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, left: 0 });
  const [whatsNew, setWhatsNew] = useState(WHATS_NEW_FALLBACK);
  const [navCfg, setNavCfg] = useState(HEADER_FALLBACK);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  const dropdownRef = useRef<HTMLDivElement | null>(null);
  const portalRef = useRef<HTMLDivElement | null>(null);
  const practiceRef = useRef<HTMLDivElement | null>(null);
  const moreRef = useRef<HTMLDivElement | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const practiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    fetchCourses().catch(() => {});
  }, [fetchCourses]);

  useEffect(() => {
    if (storeCourses.length > 0) {
      setCourses(storeCourses.filter((x: Course) => (x.lesson_count || 0) > 0));
    }
  }, [storeCourses]);

  useEffect(() => {
    if (!user) return;
    const token = null;
    if (!token) return;
    const ac = new AbortController();
    api.get<StreakData>(`/gamification/streak`, { signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setStreak(r.data);
      })
      .catch((err) => {
        if ((err as any)?.name === 'AbortError') return;
      });
    return () => ac.abort();
  }, [user]);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && (!portalRef.current || !portalRef.current.contains(e.target as Node))) setCoursesOpen(false);
      if (practiceRef.current && !practiceRef.current.contains(e.target as Node)) setPracticeOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const ac = new AbortController();
    fetchWhatsNew(3).then(res => { if (!ac.signal.aborted) setWhatsNew(res); });
    return () => ac.abort();
  }, []);
  useEffect(() => {
    const ac = new AbortController();
    fetchNavigation('header').then(c => { if (!ac.signal.aborted) setNavCfg(c as NavigationConfig); });
    return () => ac.abort();
  }, []);

  useEffect(() => { setMobileOpen(false); }, [pathname]);

  const navTo = useCallback((action: (() => void) | undefined) => {
    setMobileOpen(false);
    if (typeof action === 'function') action();
  }, []);

  const grouped: Record<string, Course[]> = {};
  courses.forEach(c => {
    const cat = c.category || 'Other';
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(c);
  });

  const handleMouseEnter = () => {
    if (timeoutRef.current) clearTimeout(timeoutRef.current);
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setDropdownPos({ top: rect.bottom + 8, left: rect.left });
    }
    setCoursesOpen(true);
  };
  const handleMouseLeave = () => { timeoutRef.current = setTimeout(() => setCoursesOpen(false), 250); };
  const handlePortalEnter = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };
  const handlePortalLeave = () => { timeoutRef.current = setTimeout(() => setCoursesOpen(false), 250); };
  const handlePracticeEnter = () => { if (practiceTimeoutRef.current) clearTimeout(practiceTimeoutRef.current); setPracticeOpen(true); };
  const handlePracticeLeave = () => { practiceTimeoutRef.current = setTimeout(() => setPracticeOpen(false), 200); };
  const handleMoreEnter = () => { if (moreTimeoutRef.current) clearTimeout(moreTimeoutRef.current); setMoreOpen(true); };
  const handleMoreLeave = () => { moreTimeoutRef.current = setTimeout(() => setMoreOpen(false), 200); };

  const primaryLinks: NavLink[] = visible(navCfg.primary_links).map(i => ({ label: i.label, path: i.path || '', isNew: i.is_new }));
  const moreLinks: NavLink[] = visible(navCfg.more_items).map(i => ({ label: i.label, path: i.path || '', desc: i.desc }));
  const practiceItems: PracticeItem[] = visible(navCfg.practice_items).map((i: import('@/types').NavLink) => ({
    label: i.label, desc: i.desc || '', icon: NAV_ICONS[i.icon || ''] || Code, path: i.path || '', isNew: i.is_new,
  }));

  const isActive = (path: string) => pathname === path;

  return (
    <header
      data-testid="main-nav"
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ backgroundColor: isDark ? 'rgba(5,5,5,0.85)' : 'rgba(255,255,255,0.85)', borderColor: t.borderSubtle }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => router.push('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center transition-colors duration-300" style={{ backgroundColor: accent }}>
            <Terminal size={16} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight whitespace-nowrap" style={{ color: t.text }}>
            Algo<span className="transition-colors duration-300" style={{ color: accent }}>Kube</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-0.5 min-w-0">
          <div ref={dropdownRef} className="relative shrink-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button data-testid="nav-courses" onClick={() => setCoursesOpen(!coursesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: coursesOpen || isActive('/courses') ? t.text : t.textSec, backgroundColor: coursesOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!coursesOpen) { e.currentTarget.style.color = isActive('/courses') ? t.text : t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
              <BookOpen size={14} /> Courses <ChevronDown size={11} className={`transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {coursesOpen && createPortal(
            <div ref={portalRef}
              data-testid="courses-mega-menu"
              onMouseEnter={handlePortalEnter} onMouseLeave={handlePortalLeave}
              style={{
                position: 'fixed',
                top: dropdownPos.top,
                left: Math.max(16, Math.min(dropdownPos.left, window.innerWidth - 1100 - 16)),
                width: Math.min(1100, window.innerWidth - 32),
                zIndex: 9999,
              }}>
              <CoursesMegaMenu
                courses={courses as any}
                isDark={isDark}
                t={t}
                navigate={(path: string) => router.push(path)}
                onClose={() => setCoursesOpen(false)}
              />
            </div>,
            document.body
          )}

          <div ref={practiceRef} className="relative shrink-0" onMouseEnter={handlePracticeEnter} onMouseLeave={handlePracticeLeave}>
            <button data-testid="nav-practice" onClick={() => setPracticeOpen(!practiceOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: practiceOpen ? t.text : t.textSec, backgroundColor: practiceOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!practiceOpen) { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
              <Target size={14} /> Practice <ChevronDown size={11} className={`transition-transform duration-200 ${practiceOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {practiceOpen && (
                <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 8 }} transition={{ duration: 0.15 }}
                  className="absolute top-full left-0 mt-2 w-80 border rounded-xl shadow-2xl py-2 overflow-hidden"
                  style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: t.border }}
                  onMouseEnter={handlePracticeEnter} onMouseLeave={handlePracticeLeave}>
                  {practiceItems.map(item => {
                    const Icon = item.icon;
                    return (
                      <button key={item.label} data-testid={`nav-practice-${item.path.split('/').pop()}`}
                        onClick={() => { setPracticeOpen(false); router.push(item.path); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        <div className="w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${t.primary}15` }}>
                          <Icon size={15} style={{ color: t.primary }} />
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium" style={{ color: t.text }}>{item.label}</span>
                            {item.isNew && (
                              <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: t.primary, color: '#052e16' }}>New</span>
                            )}
                          </div>
                          <p className="text-[11px] mt-0.5" style={{ color: t.textMut }}>{item.desc}</p>
                        </div>
                        <ChevronRight size={12} style={{ color: t.textMut }} />
                      </button>
                    );
                  })}
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {primaryLinks.map(item => (
            <button key={item.label} data-testid={`nav-${item.label.toLowerCase().replace(/\s/g,'-')}`} onClick={() => router.push(item.path)}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors"
              style={{ color: isActive(item.path) ? t.text : t.textSec }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = isActive(item.path) ? t.text : t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {item.label}
              {item.isNew && (
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary, boxShadow: `0 0 8px ${t.primary}` }} aria-label="New" />
              )}
            </button>
          ))}

          <div ref={moreRef} className="relative shrink-0" onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
            <button data-testid="nav-more" onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: moreOpen ? t.text : t.textSec, backgroundColor: moreOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { if (!moreOpen) { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
              More <ChevronDown size={11} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.14 }}
                  className="absolute top-full right-0 mt-2 w-80 border rounded-xl shadow-2xl py-1.5 overflow-hidden"
                  style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: t.border }}
                  onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
                  <div className="px-4 pt-1.5 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.textMut }}>What&apos;s New</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary, boxShadow: `0 0 6px ${t.primary}` }} />
                  </div>
                  {whatsNew.slice(0, 3).map((item: { title: string; url: string; desc: string; date: string; kind: string }) => {
                    const kind = KIND_META[item.kind] || KIND_META.feature;
                    return (
                      <button key={item.title} data-testid={`nav-more-news-${item.title.toLowerCase().replace(/\s+/g,'-').slice(0,32)}`}
                        onClick={() => { setMoreOpen(false); router.push(item.url); }}
                        className="w-full flex items-start gap-3 px-4 py-2 text-left transition-colors"
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: t.text }}>{item.title}</span>
                            <span className="text-[9px] font-bold px-1.5 py-[1px] rounded tracking-wider" style={{ color: kind.color, borderLeft: `2px solid ${kind.color}`, paddingLeft: 5 }}>{kind.label}</span>
                          </div>
                          <div className="flex items-center gap-1.5 mt-0.5">
                            <p className="text-[11px] leading-snug flex-1 min-w-0 truncate" style={{ color: t.textMut }}>{item.desc}</p>
                            <span className="text-[10px] shrink-0" style={{ color: t.textMut }}>·</span>
                            <span className="text-[10px] shrink-0" style={{ color: t.textMut }}>{relativeTime(item.date)}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}

                  <div className="mx-4 my-1.5 h-px" style={{ backgroundColor: t.borderSubtle }} />

                  <div className="px-4 pt-0.5 pb-1">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.textMut }}>Explore</span>
                  </div>
                  {moreLinks.map(item => (
                    <button key={item.label} data-testid={`nav-more-${item.label.toLowerCase().replace(/\s/g,'-')}`}
                      onClick={() => { setMoreOpen(false); router.push(item.path); }}
                      className="w-full flex items-start gap-3 px-4 py-2 text-left transition-colors"
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium whitespace-nowrap" style={{ color: t.text }}>{item.label}</div>
                        <p className="text-[11px] mt-0.5 leading-snug" style={{ color: t.textMut }}>{item.desc}</p>
                      </div>
                      <ChevronRight size={12} style={{ color: t.textMut }} className="mt-1" />
                    </button>
                  ))}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </nav>

        <div className="flex items-center gap-1.5 shrink-0">
          {user && streak && (streak.streak > 0 || streak.active_today) && (
            <button data-testid="nav-streak-badge" onClick={() => router.push('/profile')}
              className="hidden sm:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold transition-colors"
              style={{ backgroundColor: streak.active_today ? '#f59e0b18' : '#f59e0b0a', border: `1px solid ${streak.active_today ? '#f59e0b40' : '#f59e0b20'}`, color: '#f59e0b' }}>
              <Flame size={13} className={streak.active_today ? 'animate-pulse' : ''} />
              {streak.streak}
            </button>
          )}

          {user && streak && streak.xp > 0 && (
            <button data-testid="nav-xp-badge" onClick={() => router.push('/profile')}
              className="hidden sm:flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-bold transition-colors"
              style={{ backgroundColor: `${t.primary}12`, border: `1px solid ${t.primary}30`, color: t.primary }}>
              <Zap size={12} /> {streak.xp >= 1000 ? `${(streak.xp/1000).toFixed(1)}k` : streak.xp}
            </button>
          )}

          <NotificationBell />

          <button data-testid="theme-toggle" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ color: t.textMut }}
            onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; e.currentTarget.style.color = t.text; }}
            onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = t.textMut; }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          {user ? (
            <div ref={userMenuRef} className="relative hidden sm:flex">
              <button
                data-testid="nav-user-btn"
                onClick={() => setUserMenuOpen(!userMenuOpen)}
                className="flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
                style={{ backgroundColor: userMenuOpen ? accent + 'cc' : accent, color: '#fff' }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = `0 0 20px ${accent}40`; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = 'none'; }}
              >
                {user.picture ? <img src={user.picture} alt="" className="w-5 h-5 rounded-full" /> : <User size={14} />}
                <span className="hidden lg:inline">{user.name?.split(' ')[0] || 'Dashboard'}</span>
                <ChevronDown size={11} className={`transition-transform duration-200 ${userMenuOpen ? 'rotate-180' : ''}`} />
              </button>
              {userMenuOpen && (
                <div
                  className="absolute top-full right-0 mt-2 w-48 border rounded-xl shadow-2xl py-1.5 z-50 overflow-hidden"
                  style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: t.border }}
                >
                  <button
                    data-testid="nav-dropdown-dashboard"
                    onClick={() => { setUserMenuOpen(false); router.push('/dashboard'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors"
                    style={{ color: t.textSec }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LayoutDashboard size={15} /> Dashboard
                  </button>
                  <button
                    data-testid="nav-dropdown-settings"
                    onClick={() => { setUserMenuOpen(false); router.push('/settings'); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors"
                    style={{ color: t.textSec }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <Settings size={15} /> Settings
                  </button>
                  <div className="mx-3 my-1 h-px" style={{ backgroundColor: t.borderSubtle }} />
                  <button
                    data-testid="nav-dropdown-logout"
                    onClick={() => { setUserMenuOpen(false); logout(); }}
                    className="w-full flex items-center gap-2.5 px-4 py-2.5 text-left text-sm transition-colors"
                    style={{ color: '#ef4444' }}
                    onMouseEnter={(e) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                    onMouseLeave={(e) => { e.currentTarget.style.backgroundColor = 'transparent'; }}
                  >
                    <LogOut size={15} /> Log Out
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button data-testid="nav-login-btn" onClick={login}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all duration-300"
              style={{ backgroundColor: accent, color: '#fff' }}
              onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = `0 0 20px ${accent}40`; }}
              onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.boxShadow = 'none'; }}>
              <LogIn size={14} /> Sign In
            </button>
          )}

          <button data-testid="mobile-menu-toggle" onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden w-9 h-9 rounded-lg flex items-center justify-center transition-colors"
            style={{ color: t.textMut, backgroundColor: mobileOpen ? t.surfaceHi : 'transparent' }}>
            {mobileOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }} exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.2 }}
            className="md:hidden border-t overflow-hidden" style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: t.borderSubtle }}>
            <div className="px-4 py-3 space-y-1 max-h-[70vh] overflow-y-auto">
              <div className="pb-3 border-b mb-2" style={{ borderColor: t.borderSubtle }}>
                {user ? (
                  <div className="space-y-2">
                    <button onClick={() => navTo(() => router.push('/dashboard'))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                      style={{ backgroundColor: `${accent}15`, color: accent }}>
                      {user.picture ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full" /> : <User size={16} />}
                      Dashboard
                    </button>
                    <button onClick={() => navTo(() => router.push('/settings'))}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                      style={{ color: t.textMut }}>
                      <Settings size={16} /> Settings
                    </button>
                    <button onClick={() => navTo(() => { logout(); })}
                      className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors"
                      style={{ color: '#ef4444' }}>
                      <LogOut size={16} /> Log Out
                    </button>
                    {streak && streak.streak > 0 && (
                      <div className="flex items-center gap-3 px-3">
                        <span className="flex items-center gap-1 text-xs font-bold" style={{ color: '#f59e0b' }}>
                          <Flame size={13} /> {streak.streak} day streak
                        </span>
                        {streak.xp > 0 && (
                          <span className="flex items-center gap-1 text-xs font-bold" style={{ color: accent }}>
                            <Zap size={12} /> {streak.xp} XP
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                ) : (
                  <button onClick={() => navTo(login as unknown as () => void)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold"
                    style={{ backgroundColor: accent, color: '#fff' }}>
                    <LogIn size={14} /> Sign In
                  </button>
                )}
              </div>
              <button onClick={() => navTo(() => router.push('/courses'))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: t.text }}
                onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <BookOpen size={16} style={{ color: t.textMut }} /> All Courses
              </button>
              {practiceItems.map(item => (
                <button key={item.label} onClick={() => navTo(() => router.push(item.path))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: t.text }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  <item.icon size={16} style={{ color: t.textMut }} /> {item.label}
                </button>
              ))}
              {[...primaryLinks, ...moreLinks].map(item => (
                <button key={item.label} onClick={() => navTo(() => router.push(item.path))}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm" style={{ color: t.text }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  {item.label === 'Leaderboard' ? <Trophy size={16} style={{ color: t.textMut }} /> : item.label === 'Affiliate' ? <Gift size={16} style={{ color: t.textMut }} /> : <Layers size={16} style={{ color: t.textMut }} />}
                  {item.label}
                </button>
              ))}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default PageHeader;
