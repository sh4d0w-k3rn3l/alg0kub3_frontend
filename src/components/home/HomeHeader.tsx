'use client';
import { useState, useEffect, useRef } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  BookOpen, Code, Sun, Moon, LogIn, User, ChevronRight,
  GitBranch, Terminal, Star, Menu, X, Trophy, Gift, Target,
  Server, Braces, ChevronDown,
} from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';
import CoursesMegaMenu from '../CoursesMegaMenu';
import { WHATS_NEW_FALLBACK, KIND_META, relativeTime, fetchWhatsNew } from '@/config/whatsNew';
import { fetchNavigation, HEADER_FALLBACK, visible } from '@/config/navigation';
import type { NavigationConfig } from '@/types';

const NAV_ICONS: Record<string, React.ComponentType<any>> = { Code, Server, Braces, Target };

interface HomeHeaderProps {
  t: any;
  isDark: boolean;
  toggleTheme: () => void;
  user: any;
  login: () => void;
  navigate: (url: string) => void;
  courses: any[];
  categories: any[];
}

const HomeHeader = ({ t, isDark, toggleTheme, user, login, navigate, courses }: HomeHeaderProps) => {
  const [coursesOpen, setCoursesOpen] = useState<boolean>(false);
  const [practiceOpen, setPracticeOpen] = useState<boolean>(false);
  const [moreOpen, setMoreOpen] = useState<boolean>(false);
  const [mobileOpen, setMobileOpen] = useState<boolean>(false);
  const [menuPos, setMenuPos] = useState({ top: 0, left: 0 });
  const [whatsNew, setWhatsNew] = useState(WHATS_NEW_FALLBACK);
  const [navCfg, setNavCfg] = useState(HEADER_FALLBACK);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const portalRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const moreRef = useRef<HTMLDivElement>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const practiceTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const moreTimeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node) && (!portalRef.current || !portalRef.current.contains(e.target as Node))) setCoursesOpen(false);
      if (practiceRef.current && !practiceRef.current.contains(e.target as Node)) setPracticeOpen(false);
      if (moreRef.current && !moreRef.current.contains(e.target as Node)) setMoreOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => { fetchWhatsNew(3).then(setWhatsNew); }, []);
  useEffect(() => { fetchNavigation('header').then(v => setNavCfg(v as NavigationConfig)); }, []);

  const navTo = (action: (() => void) | string) => {
    setMobileOpen(false);
    if (typeof action === 'function') action();
  };

  const handleMouseEnter = () => {
    clearTimeout(timeoutRef.current ?? undefined);
    if (dropdownRef.current) {
      const rect = dropdownRef.current.getBoundingClientRect();
      setMenuPos({ top: rect.bottom + 8, left: rect.left });
    }
    setCoursesOpen(true);
  };
  const handleMouseLeave = () => {
    timeoutRef.current = setTimeout(() => setCoursesOpen(false), 250);
  };
  const handlePortalEnter = () => { clearTimeout(timeoutRef.current ?? undefined); };
  const handlePortalLeave = () => { timeoutRef.current = setTimeout(() => setCoursesOpen(false), 250); };

  const primaryLinks = visible(navCfg.primary_links).map(i => ({ label: i.label, action: () => navigate(i.path ?? '/'), isNew: i.is_new }));
  const moreLinks = visible(navCfg.more_items).map(i => ({ label: i.label, action: () => navigate(i.path ?? '/'), desc: i.desc, path: i.path }));
  const practiceItems = visible(navCfg.practice_items).map(i => ({
    label: i.label, desc: i.desc, icon: NAV_ICONS[i.icon ?? ''] || Code, path: i.path, isNew: i.is_new,
  }));

  const handlePracticeEnter = () => {
    clearTimeout(practiceTimeoutRef.current ?? undefined);
    setPracticeOpen(true);
  };
  const handlePracticeLeave = () => {
    practiceTimeoutRef.current = setTimeout(() => setPracticeOpen(false), 200);
  };
  const handleMoreEnter = () => { clearTimeout(moreTimeoutRef.current ?? undefined); setMoreOpen(true); };
  const handleMoreLeave = () => { moreTimeoutRef.current = setTimeout(() => setMoreOpen(false), 200); };

  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-xl"
      style={{ backgroundColor: isDark ? 'rgba(5,5,5,0.85)' : 'rgba(255,255,255,0.85)', borderColor: t.borderSubtle }}
    >
      <div className="max-w-[1280px] mx-auto px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        <div className="flex items-center gap-2.5 cursor-pointer shrink-0" onClick={() => navigate('/')}>
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: t.primary }}>
            <Terminal size={16} className="text-white" />
          </div>
          <span className="text-base font-extrabold tracking-tight whitespace-nowrap" style={{ color: t.text }}>
            Algo<span style={{ color: t.primary }}>Kube</span>
          </span>
        </div>

        <nav className="hidden md:flex items-center gap-0.5 min-w-0">
          <div ref={dropdownRef} className="relative shrink-0" onMouseEnter={handleMouseEnter} onMouseLeave={handleMouseLeave}>
            <button data-testid="nav-courses" onClick={() => setCoursesOpen(!coursesOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: coursesOpen ? t.text : t.textSec, backgroundColor: coursesOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={e => { if (!coursesOpen) { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
              <BookOpen size={14} /> Courses <ChevronDown size={11} className={`transition-transform duration-200 ${coursesOpen ? 'rotate-180' : ''}`} />
            </button>
          </div>
          {coursesOpen && createPortal(
            <div ref={portalRef}
              data-testid="courses-mega-menu"
              onMouseEnter={handlePortalEnter} onMouseLeave={handlePortalLeave}
              style={{
                position: 'fixed',
                top: menuPos.top,
                left: Math.max(16, Math.min(menuPos.left, window.innerWidth - 1100 - 16)),
                width: Math.min(1100, window.innerWidth - 32),
                zIndex: 9999,
              }}>
              <CoursesMegaMenu
                courses={courses}
                isDark={isDark}
                t={t}
                navigate={navigate}
                onClose={() => setCoursesOpen(false)}
              />
            </div>,
            document.body
          )}
          {/* Practice Dropdown */}
          <div ref={practiceRef} className="relative shrink-0" onMouseEnter={handlePracticeEnter} onMouseLeave={handlePracticeLeave}>
            <button data-testid="nav-practice" onClick={() => setPracticeOpen(!practiceOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: practiceOpen ? t.text : t.textSec, backgroundColor: practiceOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={e => { if (!practiceOpen) { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
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
                      <button key={item.label} data-testid={`nav-practice-${item.path?.split('/').pop() ?? ''}`}
                        onClick={() => { setPracticeOpen(false); navigate(item.path ?? '/'); }}
                        className="w-full flex items-center gap-3 px-4 py-3 text-left transition-colors"
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
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
            <button key={item.label} data-testid={`nav-${item.label.toLowerCase().replace(/\s/g,'-')}`} onClick={item.action}
              className="relative inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap shrink-0 transition-colors" style={{ color: t.textSec }}
              onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={e => { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}>
              {item.label}
              {item.isNew && (
                <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary, boxShadow: `0 0 8px ${t.primary}` }} aria-label="New" />
              )}
            </button>
          ))}

          {/* More Dropdown */}
          <div ref={moreRef} className="relative shrink-0" onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
            <button data-testid="nav-more" onClick={() => setMoreOpen(!moreOpen)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm whitespace-nowrap transition-colors"
              style={{ color: moreOpen ? t.text : t.textSec, backgroundColor: moreOpen ? t.surfaceHi : 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.color = t.text; e.currentTarget.style.backgroundColor = t.surfaceHi; }}
              onMouseLeave={e => { if (!moreOpen) { e.currentTarget.style.color = t.textSec; e.currentTarget.style.backgroundColor = 'transparent'; }}}>
              More <ChevronDown size={11} className={`transition-transform duration-200 ${moreOpen ? 'rotate-180' : ''}`} />
            </button>
            <AnimatePresence>
              {moreOpen && (
                <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 6 }} transition={{ duration: 0.14 }}
                  className="absolute top-full right-0 mt-2 w-80 border rounded-xl shadow-2xl py-1.5 overflow-hidden"
                  style={{ backgroundColor: isDark ? '#0a0a0a' : '#ffffff', borderColor: t.border }}
                  onMouseEnter={handleMoreEnter} onMouseLeave={handleMoreLeave}>
                  {/* What&apos;s New */}
                  <div className="px-4 pt-1.5 pb-1 flex items-center justify-between">
                    <span className="text-[10px] font-bold uppercase tracking-wider" style={{ color: t.textMut }}>What&apos;s New</span>
                    <span className="inline-block w-1.5 h-1.5 rounded-full" style={{ backgroundColor: t.primary, boxShadow: `0 0 6px ${t.primary}` }} />
                  </div>
                  {whatsNew.slice(0, 3).map((item) => {
                    const kind = KIND_META[item.kind] || KIND_META.feature;
                    return (
                      <button key={item.title} data-testid={`nav-more-news-${item.title.toLowerCase().replace(/\s+/g,'-').slice(0,32)}`}
                        onClick={() => { setMoreOpen(false); navigate(item.url); }}
                        className="w-full flex items-start gap-3 px-4 py-2 text-left transition-colors"
                        onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                        onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-medium" style={{ color: t.text }}>{item.title}</span>
                            <span className="text-[9px] font-bold tracking-wider" style={{ color: kind.color, borderLeft: `2px solid ${kind.color}`, paddingLeft: 5 }}>{kind.label}</span>
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
                      onClick={() => { setMoreOpen(false); item.action(); }}
                      className="w-full flex items-start gap-3 px-4 py-2 text-left transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
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
          <button data-testid="home-theme-toggle" onClick={toggleTheme} aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
            className="w-9 h-9 rounded-lg flex items-center justify-center transition-colors" style={{ color: t.textMut }}
            onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; e.currentTarget.style.color = t.text; }}
            onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; e.currentTarget.style.color = t.textMut; }}>
            {isDark ? <Sun size={16} /> : <Moon size={16} />}
          </button>
          {user ? (
            <button data-testid="home-user-btn" onClick={() => navigate('/dashboard')}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={{ backgroundColor: t.primary, color: '#052e16' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${t.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
              {user.picture ? <img src={user.picture} alt="" className="w-5 h-5 rounded-full" /> : <User size={14} />}
              Dashboard
            </button>
          ) : (
            <button data-testid="home-login-btn" onClick={login}
              className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold whitespace-nowrap transition-all"
              style={{ backgroundColor: t.primary, color: '#052e16' }}
              onMouseEnter={e => { e.currentTarget.style.boxShadow = `0 0 20px ${t.glow}`; }}
              onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}>
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
                  <button data-testid="mobile-dashboard-btn" onClick={() => navTo(() => navigate('/dashboard'))}
                    className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ backgroundColor: `${t.primary}15`, color: t.primary }}>
                    {user.picture ? <img src={user.picture} alt="" className="w-6 h-6 rounded-full" /> : <User size={16} />}
                    Dashboard
                  </button>
                ) : (
                  <button data-testid="mobile-login-btn" onClick={() => navTo(login)}
                    className="w-full flex items-center justify-center gap-2 px-3 py-2.5 rounded-lg text-sm font-semibold transition-colors"
                    style={{ backgroundColor: t.primary, color: '#052e16' }}>
                    <LogIn size={14} /> Sign In
                  </button>
                )}
              </div>
              <button data-testid="mobile-nav-courses" onClick={() => navTo(() => document.getElementById('courses')?.scrollIntoView({ behavior: 'smooth' }))}
                className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors" style={{ color: t.text }}
                onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                <BookOpen size={16} style={{ color: t.textMut }} /> All Courses
              </button>
              {[...primaryLinks, ...moreLinks].map(item => (
                <button key={item.label} data-testid={`mobile-nav-${item.label.toLowerCase()}`} onClick={() => navTo(item.action)}
                  className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm transition-colors" style={{ color: t.text }}
                  onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                  onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                  {item.label === 'Paths' ? <GitBranch size={16} style={{ color: t.textMut }} /> : item.label === 'Leaderboard' ? <Trophy size={16} style={{ color: t.textMut }} /> : item.label === 'Affiliate' ? <Gift size={16} style={{ color: t.textMut }} /> : <Star size={16} style={{ color: t.textMut }} />}
                  {item.label}
                </button>
              ))}
              <div className="pt-3 border-t mt-2" style={{ borderColor: t.borderSubtle }}>
                <p className="px-3 text-[10px] font-bold uppercase tracking-wider mb-2" style={{ color: t.textMut }}>Popular Courses</p>
                {courses.filter(c => c.lesson_count > 0).slice(0, 6).map(course => {
                  const Icon = COURSE_ICONS[course.slug] || Code;
                  const color = COURSE_COLORS[course.slug] || t.primary;
                  return (
                    <button key={course.id} data-testid={`mobile-course-${course.slug}`} onClick={() => navTo(() => navigate(`/course/${course.slug}`))}
                      className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left transition-colors"
                      onMouseEnter={e => { e.currentTarget.style.backgroundColor = t.surfaceHi; }}
                      onMouseLeave={e => { e.currentTarget.style.backgroundColor = 'transparent'; }}>
                      <div className="w-7 h-7 rounded-md flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${color}18` }}>
                        <Icon size={13} style={{ color }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-xs font-medium truncate" style={{ color: t.text }}>{course.title}</p>
                        <p className="text-[10px]" style={{ color: t.textMut }}>{course.lesson_count} lessons</p>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
};

export default HomeHeader;
