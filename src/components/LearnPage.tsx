'use client';

import React, { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { ArrowUp, Loader2 } from 'lucide-react';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import ErrorBoundary from '@/components/ErrorBoundary';
import { useSettingsStore } from '@/store/settings';
import { useCourseStore } from '@/store/courses';
import { useUIStore } from '@/store/ui';



const FONT_SIZES: Record<string, { content: string; heading: string; subheading: string }> = {
  xsmall: { content: '13px', heading: '24px', subheading: '16px' },
  small: { content: '14px', heading: '26px', subheading: '18px' },
  medium: { content: '15.5px', heading: '32px', subheading: '20px' },
  large: { content: '17px', heading: '36px', subheading: '22px' },
  xlarge: { content: '19px', heading: '40px', subheading: '24px' },
};

const FONT_FAMILIES: Record<string, string> = {
  sans: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  serif: 'Georgia, "Times New Roman", serif',
  mono: '"JetBrains Mono", "Fira Code", "SF Mono", Menlo, monospace',
};

const LINE_HEIGHTS: Record<string, number> = {
  compact: 1.5,
  default: 1.8,
  relaxed: 2.0,
  spacious: 2.4,
};

const CONTENT_WIDTHS: Record<string, string> = {
  narrow: '640px',
  default: '100%',
  wide: '100%',
};

export default function LearnPage() {
  const { colors } = useTheme();
  const params = useParams();
  const router = useRouter();
  const courseSlug = (params?.courseSlug as string) || 'python';
  const lessonSlugParam = params?.lessonSlug as string[] | string | undefined;
  const lessonSlug = Array.isArray(lessonSlugParam) ? lessonSlugParam[0] : lessonSlugParam;

  // Wire Zustand stores
  const { fontSize, syntaxTheme, fontFamily, lineHeight, contentWidth, focusMode, setFontSize, setSyntaxTheme, setFontFamily, setLineHeight, setContentWidth, setFocusMode } = useSettingsStore();
  const { courses: storeCourses, sections: storeSections, fetchCourses, loading: courseLoading } = useCourseStore();
  const { sidebarOpen, setSidebarOpen, toggleSidebar } = useUIStore();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sections, setSections] = useState<any[]>([]);
  const [currentLesson, setCurrentLesson] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<{ id: string; title: string }[]>([]);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);
  const [isTablet, setIsTablet] = useState(window.innerWidth >= 768 && window.innerWidth < 1024);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [courses, setCourses] = useState<any[]>([]);
  const [defaultSlug, setDefaultSlug] = useState<string | null>(null);

  const activeCourse = courseSlug;
  const activeSlug: string | undefined = lessonSlug || defaultSlug || undefined;
  const activeCourseTitle = courses.find(c => c.slug === activeCourse)?.title || '';

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

  useEffect(() => {
    if (storeCourses.length > 0) {
      setCourses(storeCourses);
    }
  }, [storeCourses]);

  useEffect(() => {
    const handler = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'k') {
        e.preventDefault();
        setSearchOpen(prev => !prev);
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, []);

  useEffect(() => {
    const askAIHandler = () => setAskAIOpen(true);
    window.addEventListener('algokube:ask-ai', askAIHandler);
    return () => window.removeEventListener('algokube:ask-ai', askAIHandler as EventListener);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      const w = window.innerWidth;
      setIsMobile(w < 768);
      setIsTablet(w >= 768 && w < 1024);
      if (w >= 1024) setSidebarOpen(true);
      else setSidebarOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Settings persist to localStorage via useSettingsStore setters

  const toggleFullScreen = useCallback(() => {
    if (!document.fullscreenElement) {
      document.documentElement.requestFullscreen().then(() => setIsFullScreen(true)).catch(() => {});
    } else {
      document.exitFullscreen().then(() => setIsFullScreen(false)).catch(() => {});
    }
  }, []);

  useEffect(() => {
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

  const fetchSections = useCallback(async () => {
    try {
      const res = await api.get<Record<string, any>>(`/sections?course_slug=${activeCourse}`);
      const secs = res.data?.sections || res.data || [];
      setSections(secs);
      if (!lessonSlug && secs.length > 0 && secs[0].lessons?.length > 0) {
        setDefaultSlug(secs[0].lessons[0].slug);
      }
    } catch (err) { handleApiError(err); }
  }, [activeCourse, lessonSlug]);

  const fetchLesson = useCallback(async (slug: string) => {
    if (!slug) return;
    try {
      setLoading(true);
      const res = await api.get<{ content_blocks?: any[] }>(`/lessons/${slug}`, { params: { course: activeCourse } });
      setCurrentLesson(res.data);
      const toc: { id: string; title: string }[] = [];
      if (res.data.content_blocks) {
        res.data.content_blocks.forEach((block: any) => {
          if (block.type === 'subheading' || (block.type === 'heading' && (block.level || 2) === 2)) {
            const id = block.text.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            toc.push({ id, title: block.text });
          }
        });
      }
      setTocItems(toc);
    } catch (err) { handleApiError(err); setCurrentLesson(null); }
    finally { setLoading(false); }
  }, [activeCourse]);

  useEffect(() => { fetchSections(); }, [fetchSections]);
  useEffect(() => { if (activeSlug) fetchLesson(activeSlug); }, [activeSlug, fetchLesson]);

  const handleLessonClick = (slug: string) => {
    router.push(`/learn/${activeCourse}/${slug}`);
    const el = document.getElementById('main-content');
    if (el) el.scrollTo({ top: 0, behavior: 'smooth' });
    if (isMobile || isTablet) setSidebarOpen(false);
  };

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => { setShowScrollTop(e.currentTarget.scrollTop > 400); };
  const scrollToTop = () => { document.getElementById('main-content')?.scrollTo({ top: 0, behavior: 'smooth' }); };

  const handleToggleComplete = async () => {
    if (!currentLesson || !activeSlug) return;
    try {
      const res = await api.put<{ completed: boolean }>(`/lessons/${activeSlug}/toggle-complete`, null, { params: { course: activeCourse } });
      setCurrentLesson((prev: any) => ({ ...prev, completed: res.data.completed }));
      fetchSections();
    } catch (err) { handleApiError(err); }
  };

  const handleToggleStar = async () => {
    if (!currentLesson || !activeSlug) return;
    try {
      const res = await api.put<{ starred: boolean }>(`/lessons/${activeSlug}/toggle-star`, null, { params: { course: activeCourse } });
      setCurrentLesson((prev: any) => ({ ...prev, starred: res.data.starred }));
    } catch (err) { handleApiError(err); }
  };

  const Header = React.lazy(() => import('@/components/Header'));
  const Sidebar = React.lazy(() => import('@/components/Sidebar'));
  const ArticleContent = React.lazy(() => import('@/components/ArticleContent'));
  const RightSidebar = React.lazy(() => import('@/components/RightSidebar'));
  const BottomBar = React.lazy(() => import('@/components/BottomBar'));
  const AskAIPanel = React.lazy(() => import('@/components/AITutorPanel'));
  const NotesPanel = React.lazy(() => import('@/components/NotesPanel'));
  const SearchModal = React.lazy(() => import('@/components/SearchModal'));

  const totalLessons = sections.reduce((sum, s) => sum + (s.total || 0), 0);
  const fontConfig = FONT_SIZES[fontSize] || FONT_SIZES.medium;
  const activeFontFamily = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
  const activeLineHeight = LINE_HEIGHTS[lineHeight] || LINE_HEIGHTS.default;
  const activeContentWidth = CONTENT_WIDTHS[contentWidth] || CONTENT_WIDTHS.default;
  const showDesktopSidebar = !isMobile && !isTablet && sidebarOpen && !focusMode;
  const showDesktopRight = !isMobile && !isTablet && !focusMode;
  const leftOffset = showDesktopSidebar ? '280px' : '0';
  const rightOffset = showDesktopRight ? '280px' : '0';

  return (
    <div className="min-h-screen transition-all duration-300" style={{ backgroundColor: colors.bg }}>
      {!focusMode && (
        <React.Suspense fallback={null}>
          <Header
            onToggleSidebar={() => setSidebarOpen(!sidebarOpen)}
            isMobile={isMobile || isTablet}
            onToggleRight={() => setMobileRightOpen(!mobileRightOpen)}
            onOpenSearch={() => setSearchOpen(true)}
            courses={courses}
            activeCourse={activeCourse}
          />
        </React.Suspense>
      )}

      {!focusMode && (isMobile || isTablet) && sidebarOpen && (
        <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setSidebarOpen(false)} />
      )}

      {!focusMode && (
        <React.Suspense fallback={null}>
          <Sidebar
            isOpen={sidebarOpen && !focusMode}
            onToggle={() => setSidebarOpen(!sidebarOpen)}
            sections={sections}
            activeSlug={activeSlug}
            onLessonClick={handleLessonClick}
            totalLessons={totalLessons}
            isMobile={isMobile || isTablet}
            courseSlug={activeCourse}
            courseTitle={activeCourseTitle}
          />
        </React.Suspense>
      )}

      <main
        id="main-content"
        className="overflow-y-auto transition-all duration-300"
        onScroll={handleScroll}
        style={{
          position: 'fixed',
          top: focusMode ? '0' : '52px',
          bottom: '48px',
          left: (isMobile || isTablet || focusMode) ? '0' : leftOffset,
          right: (isMobile || isTablet || focusMode) ? '0' : rightOffset,
          transition: 'left 0.3s ease, right 0.3s ease, top 0.3s ease',
          backgroundColor: colors.bg,
          fontFamily: activeFontFamily,
        }}
      >
        <div
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8 mx-auto transition-all duration-300"
          style={{ maxWidth: activeContentWidth }}
        >
          {loading ? (
            <div className="flex items-center justify-center h-64">
              <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.green, borderTopColor: 'transparent' }} />
            </div>
          ) : currentLesson ? (
            <ErrorBoundary fallbackMessage="Lesson content failed to load. Try selecting a different lesson.">
              <React.Suspense fallback={<div className="flex items-center justify-center h-64"><Loader2 className="animate-spin" size={24} style={{ color: colors.green }} /></div>}>
                <ArticleContent
                  lesson={currentLesson}
                  fontSize={fontConfig}
                  lineHeight={activeLineHeight}
                  fontFamily={activeFontFamily}
                  syntaxTheme={syntaxTheme}
                  onSyntaxThemeChange={(v: string) => setSyntaxTheme(v as typeof syntaxTheme)}
                  sectionId={currentLesson.section_id}
                  sectionTitle={currentLesson.section?.title}
                  courseSlug={activeCourse}
                />
              </React.Suspense>
            </ErrorBoundary>
          ) : (
            <div className="text-center py-20" style={{ color: colors.textSecondary }}>
              <p className="text-lg">
                {sections.length === 0
                  ? 'This course has no content yet. Content is being generated...'
                  : 'Select a lesson from the sidebar to get started.'}
              </p>
            </div>
          )}
        </div>
      </main>

      {showDesktopRight && (
        <React.Suspense fallback={null}>
          <RightSidebar tocItems={tocItems} />
        </React.Suspense>
      )}

      {!focusMode && (isMobile || isTablet) && mobileRightOpen && (
        <>
          <div className="fixed inset-0 z-30 bg-black/50" onClick={() => setMobileRightOpen(false)} />
          <div className="fixed right-0 top-[52px] bottom-[48px] w-[280px] z-40 border-l overflow-y-auto" style={{ borderColor: colors.borderLight, backgroundColor: colors.bgSecondary }}>
            <RightSidebar tocItems={tocItems} isMobileOverlay />
          </div>
        </>
      )}

      <React.Suspense fallback={null}>
        <BottomBar
          nextLesson={currentLesson?.next_lesson}
          prevLesson={currentLesson?.prev_lesson}
          onNavigate={handleLessonClick}
          onToggleComplete={handleToggleComplete}
          onToggleStar={handleToggleStar}
          isCompleted={currentLesson?.completed}
          isStarred={currentLesson?.starred}
          onOpenNotes={() => setNotesOpen(true)}
          onOpenAskAI={() => setAskAIOpen(true)}
          fontSize={fontSize}
          onFontSizeChange={(v: string) => setFontSize(v as typeof fontSize)}
          fontFamily={fontFamily}
          onFontFamilyChange={(v: string) => setFontFamily(v as typeof fontFamily)}
          lineHeight={lineHeight}
          onLineHeightChange={(v: string) => setLineHeight(v as typeof lineHeight)}
          contentWidth={contentWidth}
          onContentWidthChange={(v: string) => setContentWidth(v as typeof contentWidth)}
          focusMode={focusMode}
          onFocusModeChange={(v: boolean) => setFocusMode(v)}
          isFullScreen={isFullScreen}
          onToggleFullScreen={toggleFullScreen}
          syntaxTheme={syntaxTheme}
          onSyntaxThemeChange={(v: string) => setSyntaxTheme(v as typeof syntaxTheme)}
        />
      </React.Suspense>

      <React.Suspense fallback={null}>
        <AskAIPanel isOpen={askAIOpen} onClose={() => setAskAIOpen(false)} lessonSlug={activeSlug || ''} lessonTitle={currentLesson?.title || ''} courseSlug={activeCourse} />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <NotesPanel isOpen={notesOpen} onClose={() => setNotesOpen(false)} lessonSlug={activeSlug || ''} lessonTitle={currentLesson?.title || ''} courseSlug={activeCourse} />
      </React.Suspense>
      <React.Suspense fallback={null}>
        <SearchModal
          isOpen={searchOpen}
          onClose={() => setSearchOpen(false)}
          onNavigate={(lessonSlug: string | null, courseSlug: string | null) => {
            if (lessonSlug) {
              const cs = courseSlug || activeCourse;
              router.push(`/learn/${cs}/${lessonSlug}`);
            } else if (courseSlug) {
              api.get<{ slug: string }>(`/courses/${courseSlug}/first-lesson`).then(r => {
                router.push(`/learn/${courseSlug}/${r.data.slug}`);
              }).catch(() => router.push('/'));
            }
          }}
          courseSlug={activeCourse}
        />
      </React.Suspense>

      {showScrollTop && (
        <button onClick={scrollToTop} className="fixed bottom-16 right-2 sm:right-8 w-10 h-10 border rounded-lg flex items-center justify-center transition-all z-50 shadow-lg" style={{ backgroundColor: colors.bgCard, borderColor: colors.border, color: colors.textSecondary }}>
          <ArrowUp size={18} />
        </button>
      )}
    </div>
  );
}
