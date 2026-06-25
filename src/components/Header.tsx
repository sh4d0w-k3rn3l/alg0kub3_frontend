'use client';

import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { api } from '@/lib/api';
import { Menu, Search, Sun, Moon, ChevronDown, Code, BookOpen, LogIn, User, Trophy, Target, Server, Braces, TrendingUp, Play, LayoutDashboard, LogOut } from 'lucide-react';
import { COURSE_ICONS } from '@/config/courseConfig';

interface HeaderProps {
  onToggleSidebar: () => void;
  isMobile: boolean;
  onToggleRight: () => void;
  onOpenSearch: () => void;
  courses?: any[];
  activeCourse?: string;
}

const Header: React.FC<HeaderProps> = ({ onToggleSidebar, isMobile, onToggleRight, onOpenSearch, courses = [], activeCourse }) => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, login, logout } = useAuth();
  const router = useRouter();
  const [learnOpen, setLearnOpen] = useState(false);
  const [practiceOpen, setPracticeOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const practiceRef = useRef<HTMLDivElement>(null);
  const userMenuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) setLearnOpen(false);
      if (practiceRef.current && !practiceRef.current.contains(e.target as Node)) setPracticeOpen(false);
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) setUserMenuOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleCourseNav = async (slug: string) => {
    setLearnOpen(false);
    try {
      const res = await api.get<{ slug?: string }>(`/courses/${slug}/first-lesson`);
      router.push(res.data.slug ? `/learn/${slug}/${res.data.slug}` : `/learn/${slug}`);
    } catch {
      router.push(`/learn/${slug}`);
    }
  };

  return (
    <header data-testid="main-header" className="fixed top-0 left-0 right-0 z-50 h-[52px] flex items-center justify-between px-3 sm:px-4 border-b" style={{ backgroundColor: colors.headerBg, borderColor: colors.borderLight }}>
      <div className="flex items-center gap-2 sm:gap-3">
        {isMobile && (
          <button data-testid="toggle-sidebar-button" onClick={onToggleSidebar} className="p-1" style={{ color: colors.textSecondary }}>
            <Menu size={18} />
          </button>
        )}
        <Link href="/" className="flex items-center gap-2 hover:opacity-80 transition-opacity">
          <div className="w-6 h-6 rounded flex items-center justify-center" style={{ backgroundColor: colors.green }}>
            <Code size={14} className="text-white" />
          </div>
          <span className="text-sm font-bold hidden sm:inline" style={{ color: colors.text }}>AlgoKube</span>
        </Link>
        <nav className="hidden md:flex items-center gap-1 ml-3">
          <div ref={dropdownRef} className="relative">
            <button
              data-testid="learn-dropdown-button"
              onClick={() => setLearnOpen(!learnOpen)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors"
              style={{ color: learnOpen ? colors.text : colors.textSecondary, backgroundColor: learnOpen ? colors.hoverBg : 'transparent' }}
            >
              <BookOpen size={13} /> Learn <ChevronDown size={11} className={`transition-transform ${learnOpen ? 'rotate-180' : ''}`} />
            </button>
            {learnOpen && (
              <div className="absolute top-full left-0 mt-1 w-64 border rounded-lg shadow-xl py-2 z-50" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                {courses.map((course: any) => {
                  const Icon = COURSE_ICONS[course.slug] || Code;
                  const isActive = course.slug === activeCourse;
                  return (
                    <button
                      key={course.id}
                      data-testid={`nav-course-${course.slug}`}
                      onClick={() => handleCourseNav(course.slug)}
                      className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                      style={{ backgroundColor: isActive ? colors.hoverBg : 'transparent', color: isActive ? colors.text : colors.textSecondary }}
                      onMouseEnter={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = colors.hoverBg; }}
                      onMouseLeave={(e) => { if (!isActive) e.currentTarget.style.backgroundColor = 'transparent'; }}
                    >
                      <Icon size={16} style={{ color: isActive ? colors.green : colors.textMuted }} />
                      <div className="flex-1 min-w-0">
                        <div className="text-sm font-medium truncate">{course.title}</div>
                        <div className="text-[10px]" style={{ color: colors.textMuted }}>{course.lesson_count} lessons</div>
                      </div>
                      {isActive && <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: colors.green }} />}
                    </button>
                  );
                })}
              </div>
            )}
          </div>
          <div ref={practiceRef} className="relative">
            <button
              data-testid="practice-dropdown-button"
              onClick={() => setPracticeOpen(!practiceOpen)}
              className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors"
              style={{ color: practiceOpen ? colors.text : colors.textSecondary, backgroundColor: practiceOpen ? colors.hoverBg : 'transparent' }}
            >
              <Target size={13} /> Practice <ChevronDown size={11} className={`transition-transform ${practiceOpen ? 'rotate-180' : ''}`} />
            </button>
            {practiceOpen && (
              <div className="absolute top-full left-0 mt-1 w-72 border rounded-lg shadow-xl py-2 z-50" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <button
                  data-testid="nav-practice-dsa"
                  onClick={() => { setPracticeOpen(false); router.push('/practice/dsa'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Code size={16} style={{ color: colors.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>DSA Patterns</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>Practice data structures & algorithms</div>
                  </div>
                </button>
                <button
                  data-testid="nav-practice-system-design"
                  onClick={() => { setPracticeOpen(false); router.push('/system-design'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Server size={16} style={{ color: colors.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>System Design Interview</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>15 sections, 85 problems</div>
                  </div>
                </button>
                <button
                  data-testid="nav-practice-lld"
                  onClick={() => { setPracticeOpen(false); router.push('/practice/lld'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <Braces size={16} style={{ color: colors.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium" style={{ color: colors.text }}>Low-Level Design Interview</span>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded" style={{ backgroundColor: colors.green, color: '#fff' }}>New</span>
                    </div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>Practice object-oriented design</div>
                  </div>
                </button>
                <div className="border-t my-1" style={{ borderColor: colors.border }} />
                <button
                  data-testid="nav-practice-progress"
                  onClick={() => { setPracticeOpen(false); router.push('/practice/progress'); }}
                  className="w-full flex items-center gap-3 px-3 py-2.5 text-left transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <TrendingUp size={16} style={{ color: colors.textMuted }} />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium" style={{ color: colors.text }}>My Progress</div>
                    <div className="text-[10px]" style={{ color: colors.textMuted }}>Stats, streaks & activity heatmap</div>
                  </div>
                </button>
              </div>
            )}
          </div>
          <button onClick={() => router.push('/admin')} className="text-xs px-2.5 py-1.5 rounded transition-colors" style={{ color: colors.textSecondary }}>Admin</button>
          <button data-testid="header-leaderboard-btn" onClick={() => router.push('/leaderboard')} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors" style={{ color: colors.textSecondary }}><Trophy size={12} /> Leaderboard</button>
          <button data-testid="header-paths-btn" onClick={() => router.push('/#paths')} className="text-xs px-2.5 py-1.5 rounded transition-colors" style={{ color: colors.textSecondary }}>Paths</button>
          <button data-testid="header-dsa-animations-btn" onClick={() => router.push('/animations/dsa')} className="flex items-center gap-1 text-xs px-2.5 py-1.5 rounded transition-colors" style={{ color: colors.textSecondary }}><Play size={12} /> DSA Animations</button>
        </nav>
      </div>

      <div className="flex items-center gap-1 sm:gap-2">
        <button data-testid="search-button" onClick={onOpenSearch} className="transition-colors p-1 flex items-center gap-1" style={{ color: colors.textSecondary }}>
          <Search size={16} />
          <span className="text-xs hidden sm:inline border rounded px-1.5 py-0.5" style={{ borderColor: colors.border, color: colors.textMuted }}>Ctrl+K</span>
        </button>
        <button data-testid="theme-toggle-button" onClick={toggleTheme} className="transition-colors p-1" style={{ color: colors.textSecondary }}>
          {isDark ? <Sun size={16} /> : <Moon size={16} />}
        </button>
        {user ? (
          <div ref={userMenuRef} className="relative ml-1">
            <button
              data-testid="user-menu-button"
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-1.5 px-2 py-1 rounded-md transition-colors"
              style={{ color: colors.textSecondary, backgroundColor: userMenuOpen ? colors.hoverBg : 'transparent' }}
              onMouseEnter={(e) => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = colors.hoverBg; }}
              onMouseLeave={(e) => { if (!userMenuOpen) e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              {user.picture ? (
                <img src={user.picture} alt="" className="w-5 h-5 rounded-full" />
              ) : (
                <User size={14} />
              )}
              <span className="text-xs hidden sm:inline">{user.name?.split(' ')[0]}</span>
              <ChevronDown size={11} className={`transition-transform ${userMenuOpen ? 'rotate-180' : ''}`} />
            </button>
            {userMenuOpen && (
              <div className="absolute top-full right-0 mt-1 w-44 border rounded-lg shadow-xl py-1 z-50" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
                <button
                  data-testid="user-menu-dashboard"
                  onClick={() => { setUserMenuOpen(false); router.push('/dashboard'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LayoutDashboard size={14} /> Dashboard
                </button>
                <button
                  data-testid="user-menu-profile"
                  onClick={() => { setUserMenuOpen(false); router.push('/profile'); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors"
                  style={{ color: colors.textSecondary }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <User size={14} /> Profile
                </button>
                <div className="border-t my-1" style={{ borderColor: colors.border }} />
                <button
                  data-testid="user-menu-logout"
                  onClick={() => { setUserMenuOpen(false); logout(); }}
                  className="w-full flex items-center gap-2.5 px-3 py-2 text-left text-sm transition-colors"
                  style={{ color: '#ef4444' }}
                  onMouseEnter={(e) => e.currentTarget.style.backgroundColor = colors.hoverBg}
                  onMouseLeave={(e) => e.currentTarget.style.backgroundColor = 'transparent'}
                >
                  <LogOut size={14} /> Log Out
                </button>
              </div>
            )}
          </div>
        ) : (
          <button data-testid="header-login-btn" onClick={login} className="flex items-center gap-1 ml-1 px-2.5 py-1.5 rounded-md text-xs font-medium transition-colors" style={{ backgroundColor: colors.green, color: '#fff' }}>
            <LogIn size={12} /> Sign In
          </button>
        )}
        {isMobile && (
          <button onClick={onToggleRight} className="p-1" style={{ color: colors.textSecondary }}>
            <Menu size={16} />
          </button>
        )}
      </div>
    </header>
  );
};

export default Header;
