'use client';

import React, { useState, useEffect } from 'react';
import { useTheme } from '@/context/ThemeContext';
import { useAuth } from '@/context/AuthContext';
import { useRouter, usePathname } from 'next/navigation';
import { Code, BookOpen, ArrowRight, Sun, Moon, LogOut, Zap, Trophy, Layers, Award, Play, Bookmark } from 'lucide-react';
import { api } from '@/lib/api';
import ActivityHeatmap from './ActivityHeatmap';
import PageHeader from './PageHeader';
import OnboardingModal from './OnboardingModal';
import RecommendedCourses from './RecommendedCourses';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';

interface Course {
  id: number;
  slug: string;
  title: string;
  section_count: number;
  lesson_count: number;
}

interface ContinueCourse {
  course_id: number;
  slug: string;
  title: string;
  completed: number;
  total: number;
  progress_percent: number;
  next_lesson?: { slug: string; title: string };
}

interface BookmarkItem {
  id: number;
  lesson_slug: string;
  course_slug: string;
  lesson_title: string;
  course_title: string;
  read_time?: string;
}

interface ProgressCourse {
  course_id: number;
  progress_percent: number;
}

interface DashboardData {
  courses: ProgressCourse[];
  total_completed: number;
}

const UserDashboard = () => {
  const { colors, isDark, toggleTheme } = useTheme();
  const { user, logout, isSubscribed, loading: authLoading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [dashboard, setDashboard] = useState<DashboardData | null>(null);
  const [allCourses, setAllCourses] = useState<Course[]>([]);
  const [continueCourses, setContinueCourses] = useState<ContinueCourse[]>([]);
  const [bookmarks, setBookmarks] = useState<BookmarkItem[]>([]);
  const [loading, setLoading] = useState(true);

  const currentUser = ((pathname ?? '') === '/dashboard' || (pathname ?? '').startsWith('/dashboard')) ? user : user;

  useEffect(() => {
    if (authLoading) return;
    if (!currentUser) {
      router.push('/login');
      return;
    }
    const ac = new AbortController();
    const fetchData = async () => {
      try {
        const [dashRes, coursesRes, continueRes, bookmarksRes] = await Promise.all([
          api.get<DashboardData>(`/progress/dashboard`, { signal: ac.signal }).catch(() => ({ data: { courses: [], total_completed: 0 } })),
          api.get<{ courses: Record<string, unknown>[] } | Record<string, unknown>[]>(`/courses`, { signal: ac.signal, cache: 'no-store' }),
          api.get<{ courses: Record<string, unknown>[] }>(`/progress/continue?limit=3`, { signal: ac.signal }).catch(() => ({ data: { courses: [] } })),
          api.get<{ bookmarks: Record<string, unknown>[] }>(`/bookmarks?limit=5`, { signal: ac.signal }).catch(() => ({ data: { bookmarks: [] } })),
        ]);
        if (ac.signal.aborted) return;
        setDashboard(dashRes.data);
        const rawCourses = 'courses' in coursesRes.data ? coursesRes.data.courses : (coursesRes.data as Record<string, unknown>[]) || [];
        setAllCourses(rawCourses.filter((c: Record<string, unknown>) => (c.lesson_count ?? 0) > 0));
        setContinueCourses(continueRes.data?.courses || []);
        setBookmarks(bookmarksRes.data?.bookmarks || []);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      }
      finally { setLoading(false); }
    };
    fetchData();
    return () => ac.abort();
  }, [currentUser, authLoading, router]);

  if (authLoading || !currentUser) return null;

  const handleCourseClick = async (course: Course) => {
    try {
      const res = await api.get<{ slug: string }>(`/courses/${course.slug}/first-lesson`);
      router.push(res.data.slug ? `/learn/${course.slug}/${res.data.slug}` : `/learn/${course.slug}`);
    } catch {
      router.push(`/learn/${course.slug}`);
    }
  };

  const progressCourses = dashboard?.courses || [];
  const totalCompleted = dashboard?.total_completed || 0;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />
      <OnboardingModal />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <div className="flex items-center gap-4 mb-8">
          {currentUser.picture ? (
            <img src={currentUser.picture} alt="" className="w-14 h-14 rounded-full" />
          ) : (
            <div className="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold" style={{ backgroundColor: colors.green, color: '#fff' }}>
              {currentUser.name?.[0] || '?'}
            </div>
          )}
          <div>
            <h1 className="text-xl font-bold" style={{ color: colors.text }}>{currentUser.name}</h1>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-sm" style={{ color: colors.textSecondary }}>{currentUser.email}</span>
              {isSubscribed && (
                <span className="inline-flex items-center gap-1 text-xs font-medium px-2 py-0.5 rounded-full" style={{ backgroundColor: colors.green + '20', color: colors.green }}>
                  <Zap size={10} /> Pro
                </span>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-8">
          <div className="border rounded-lg p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <div className="text-2xl font-bold" style={{ color: colors.text }}>{totalCompleted}</div>
            <div className="text-xs" style={{ color: colors.textMuted }}>Lessons completed</div>
          </div>
          <div className="border rounded-lg p-4" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <div className="text-2xl font-bold" style={{ color: colors.text }}>{progressCourses.length}</div>
            <div className="text-xs" style={{ color: colors.textMuted }}>Courses started</div>
          </div>
          <div className="border rounded-lg p-4 hidden sm:block" style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}>
            <div className="text-2xl font-bold flex items-center gap-1" style={{ color: colors.green }}>
              <Trophy size={20} /> {isSubscribed ? 'Pro' : 'Free'}
            </div>
            <div className="text-xs" style={{ color: colors.textMuted }}>
              {isSubscribed ? 'Unlimited access' : (
                <button onClick={() => router.push('/pricing')} className="underline" style={{ color: colors.green }}>Upgrade</button>
              )}
            </div>
          </div>
        </div>

        <ActivityHeatmap colors={colors} isDark={isDark} />

        {isSubscribed && (
          <button data-testid="my-certificates-btn" onClick={() => router.push('/certificates')} className="w-full flex items-center justify-between rounded-xl p-4 mb-6 mt-4 transition-all hover:opacity-90" style={{ border: `1px solid #d4a84340`, backgroundColor: '#d4a84308' }}>
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ border: '2px solid #d4a843', backgroundColor: '#d4a84315' }}>
                <Award size={18} style={{ color: '#d4a843' }} />
              </div>
              <div className="text-left">
                <span className="text-sm font-bold" style={{ color: colors.text }}>My Certificates</span>
                <p className="text-xs" style={{ color: colors.textSecondary }}>View and download your earned certificates</p>
              </div>
            </div>
            <ArrowRight size={16} style={{ color: '#d4a843' }} />
          </button>
        )}

        {continueCourses.length > 0 && (
          <div className="mb-8" data-testid="continue-learning-section">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
              <Play size={16} style={{ color: colors.green }} /> Continue Learning
            </h2>
            <div className="space-y-3">
              {continueCourses.map(c => {
                const accent = COURSE_COLORS[c.slug] || colors.green;
                const Icon = COURSE_ICONS?.[c.slug] || BookOpen;
                const resumePath = c.next_lesson?.slug
                  ? `/learn/${c.slug}/${c.next_lesson.slug}`
                  : `/learn/${c.slug}`;
                return (
                  <div
                    key={c.course_id}
                    data-testid={`continue-${c.slug}`}
                    className="border rounded-xl p-4 transition-all group"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                    onMouseEnter={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = accent + '60'}
                    onMouseLeave={(e: React.MouseEvent<HTMLDivElement>) => e.currentTarget.style.borderColor = colors.border}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${accent}15` }}>
                        <Icon size={18} style={{ color: accent }} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>{c.title}</p>
                        <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                          {c.completed}/{c.total} lessons &middot; {c.progress_percent}% complete
                        </p>
                      </div>
                      <button
                        data-testid={`resume-${c.slug}`}
                        onClick={() => router.push(resumePath)}
                        className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all flex-shrink-0"
                        style={{ backgroundColor: accent, color: '#fff' }}
                        onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.opacity = '0.85'}
                        onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.opacity = '1'}
                      >
                        <Play size={12} fill="currentColor" /> Resume
                      </button>
                    </div>
                    <div className="mt-3 h-1.5 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                      <div
                        className="h-full rounded-full transition-all duration-500"
                        style={{ width: `${c.progress_percent}%`, backgroundColor: accent }}
                      />
                    </div>
                    {c.next_lesson && (
                      <p className="text-xs mt-1.5 truncate" style={{ color: colors.textMuted }}>
                        Next: {c.next_lesson.title}
                      </p>
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {bookmarks.length > 0 && (
          <div className="mb-8" data-testid="saved-lessons-section">
            <h2 className="text-base font-bold mb-3 flex items-center gap-2" style={{ color: colors.text }}>
              <Bookmark size={16} style={{ color: '#f59e0b' }} /> Saved Lessons
            </h2>
            <div className="space-y-2">
              {bookmarks.map(b => (
                <button
                  key={b.id}
                  data-testid={`saved-${b.lesson_slug}`}
                  onClick={() => router.push(`/learn/${b.course_slug}/${b.lesson_slug}`)}
                  className="w-full text-left flex items-center gap-3 border rounded-lg p-3 transition-all group"
                  style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                  onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.borderColor = '#f59e0b40'}
                  onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.borderColor = colors.border}
                >
                  <Bookmark size={14} fill="#f59e0b" style={{ color: '#f59e0b' }} className="flex-shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-medium truncate" style={{ color: colors.text }}>{b.lesson_title}</p>
                    <p className="text-xs" style={{ color: colors.textMuted }}>{b.course_title} &middot; {b.read_time || '5 min'}</p>
                  </div>
                  <ArrowRight size={14} className="opacity-0 group-hover:opacity-100 flex-shrink-0" style={{ color: '#f59e0b' }} />
                </button>
              ))}
            </div>
          </div>
        )}

        <div>
          <h2 className="text-base font-bold mb-3" style={{ color: colors.text }}>All Courses</h2>
          {loading ? (
            <div className="text-center py-8">
              <div className="w-6 h-6 border-2 border-t-transparent rounded-full animate-spin mx-auto" style={{ borderColor: colors.green, borderTopColor: 'transparent' }} />
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {allCourses.map(course => {
                const accent = COURSE_COLORS[course.slug] || colors.green;
                const progress = progressCourses.find(p => p.course_id === course.id);
                return (
                  <button
                    key={course.id}
                    onClick={() => handleCourseClick(course)}
                    className="text-left border rounded-lg p-4 transition-all group"
                    style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                    onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.borderColor = accent + '60'}
                    onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => e.currentTarget.style.borderColor = colors.border}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm font-medium" style={{ color: colors.text }}>{course.title}</span>
                      <ArrowRight size={14} className="opacity-0 group-hover:opacity-100" style={{ color: accent }} />
                    </div>
                    <div className="flex items-center gap-3 text-xs" style={{ color: colors.textMuted }}>
                      <span className="flex items-center gap-1"><Layers size={10} /> {course.section_count} sections</span>
                      <span className="flex items-center gap-1"><BookOpen size={10} /> {course.lesson_count} lessons</span>
                    </div>
                    {progress && (
                      <div className="mt-2 h-1 rounded-full overflow-hidden" style={{ backgroundColor: colors.border }}>
                        <div className="h-full rounded-full" style={{ width: `${progress.progress_percent}%`, backgroundColor: accent }} />
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          )}
        </div>

        <div className="mt-8">
          <RecommendedCourses maxItems={4} />
        </div>
      </div>
    </div>
  );
};

export default UserDashboard;
