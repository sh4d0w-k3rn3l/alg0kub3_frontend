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
import useMediaQuery from '@/hooks/useMediaQuery';

interface LearnSectionLesson {
  id?: number;
  slug: string;
  title: string;
  access_type?: string;
  completed?: boolean;
}

interface LearnSection {
  id: number;
  title: string;
  icon?: string;
  total?: number;
  completed?: number;
  lessons?: LearnSectionLesson[];
}

interface LearnBlock {
  type: string;
  text?: string;
  level?: number;
  code?: string;
  language?: string;
  runnable?: boolean;
  title?: string;
  url?: string;
  alt?: string;
  caption?: string;
  videoId?: string;
  [key: string]: unknown;
}

interface LearnLesson {
  id?: string | number;
  title?: string;
  slug?: string;
  section_id?: string;
  section?: { title?: string };
  content_blocks?: LearnBlock[];
  completed?: boolean;
  starred?: boolean;
  next_lesson?: { slug: string; title: string };
  prev_lesson?: { slug: string; title: string };
}

const Header = React.lazy(() => import('@/components/Header'));
const Sidebar = React.lazy(() => import('@/components/Sidebar'));
const ArticleContent = React.lazy(() => import('@/components/ArticleContent'));
const RightSidebar = React.lazy(() => import('@/components/RightSidebar'));
const BottomBar = React.lazy(() => import('@/components/BottomBar'));
const AskAIPanel = React.lazy(() => import('@/components/AITutorPanel'));
const NotesPanel = React.lazy(() => import('@/components/NotesPanel'));
const SearchModal = React.lazy(() => import('@/components/SearchModal'));



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
  const { courses: storeCourses, fetchCourses } = useCourseStore();
  const { sidebarOpen, setSidebarOpen } = useUIStore();

  const [showScrollTop, setShowScrollTop] = useState(false);
  const [sections, setSections] = useState<LearnSection[]>([]);
  const [currentLesson, setCurrentLesson] = useState<LearnLesson | null>(null);
  const [loading, setLoading] = useState(true);
  const [tocItems, setTocItems] = useState<{ id: string; title: string }[]>([]);
  const [isFullScreen, setIsFullScreen] = useState(false);
  const [askAIOpen, setAskAIOpen] = useState(false);
  const [notesOpen, setNotesOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [mobileRightOpen, setMobileRightOpen] = useState(false);
  const [defaultSlug, setDefaultSlug] = useState<string | null>(null);

  const isMobile = useMediaQuery('(max-width: 767px)');
  const isTablet = useMediaQuery('(min-width: 768px) and (max-width: 1023px)');
  const isDesktop = useMediaQuery('(min-width: 1024px)');
  const [desktopClosed, setDesktopClosed] = useState(false);
  const sidebarVisible = isDesktop ? !desktopClosed : sidebarOpen;
  const toggleSidebar = () => { if (isDesktop) setDesktopClosed(c => !c); else setSidebarOpen(!sidebarOpen); };

  const activeCourse = courseSlug;
  const activeSlug: string | undefined = lessonSlug || defaultSlug || undefined;
  const activeCourseTitle = storeCourses.find(c => c.slug === activeCourse)?.title || '';

  useEffect(() => {
    fetchCourses();
  }, [fetchCourses]);

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
    const handler = () => setIsFullScreen(!!document.fullscreenElement);
    document.addEventListener('fullscreenchange', handler);
    return () => document.removeEventListener('fullscreenchange', handler);
  }, []);

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

  const fetchSections = useCallback(async (signal?: AbortSignal): Promise<LearnSection[] | null> => {
    try {
      const res = await api.get<{ sections?: LearnSection[] } | LearnSection[]>(`/sections?course_slug=${activeCourse}`, { cache: 'no-store', signal });
      const payload = res.data;
      if (Array.isArray(payload)) return payload;
      return payload?.sections || [];
    } catch (err) { handleApiError(err); return null; }
  }, [activeCourse]);

  const fetchLesson = useCallback(async (slug: string, signal?: AbortSignal): Promise<LearnLesson | null> => {
    if (!slug) return null;
    try {
      const res = await api.get<LearnLesson>(`/lessons/${slug}`, { params: { course: activeCourse }, signal });
      return res.data;
    } catch (err) { handleApiError(err); return null; }
  }, [activeCourse]);

  useEffect(() => {
    const ac = new AbortController();
    (async () => {
      const secs = await fetchSections(ac.signal);
      if (ac.signal.aborted || secs === null) return;
      setSections(secs);
      const firstLessons = secs[0]?.lessons;
      if (!lessonSlug && secs.length > 0 && firstLessons && firstLessons.length > 0) {
        setDefaultSlug(firstLessons[0].slug);
      }
    })();
    return () => ac.abort();
  }, [fetchSections, lessonSlug]);

  useEffect(() => {
    if (!activeSlug) return;
    const ac = new AbortController();
    (async () => {
      const lesson = await fetchLesson(activeSlug, ac.signal);
      if (ac.signal.aborted) return;
      if (!lesson) { setCurrentLesson(null); setLoading(false); return; }
      setCurrentLesson(lesson);
      const toc: { id: string; title: string }[] = [];
      if (lesson.content_blocks) {
        lesson.content_blocks.forEach((block: LearnBlock) => {
          if (block.type === 'subheading' || (block.type === 'heading' && (block.level || 2) === 2)) {
            const blockText = block.text || '';
            const id = blockText.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '');
            toc.push({ id, title: blockText });
          }
        });
      }
      setTocItems(toc);
      setLoading(false);
    })();
    return () => ac.abort();
  }, [activeSlug, fetchLesson]);

  const handleLessonClick = (slug: string) => {
    router.push(`/learn/${activeCourse}/${slug}`);
    setLoading(true);
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
      setCurrentLesson({ ...currentLesson, completed: res.data.completed });
      const secs = await fetchSections();
      if (secs) setSections(secs);
    } catch (err) { handleApiError(err); }
  };

  const handleToggleStar = async () => {
    if (!currentLesson || !activeSlug) return;
    try {
      const res = await api.put<{ starred: boolean }>(`/lessons/${activeSlug}/toggle-star`, null, { params: { course: activeCourse } });
      setCurrentLesson({ ...currentLesson, starred: res.data.starred });
    } catch (err) { handleApiError(err); }
  };

  const totalLessons = sections.reduce((sum, s) => sum + (s.total || 0), 0);
  const fontConfig = FONT_SIZES[fontSize] || FONT_SIZES.medium;
  const activeFontFamily = FONT_FAMILIES[fontFamily] || FONT_FAMILIES.sans;
  const activeLineHeight = LINE_HEIGHTS[lineHeight] || LINE_HEIGHTS.default;
  const activeContentWidth = CONTENT_WIDTHS[contentWidth] || CONTENT_WIDTHS.default;
  const showDesktopSidebar = sidebarVisible && !focusMode;
  const showDesktopRight = !isMobile && !isTablet && !focusMode;
  const leftOffset = showDesktopSidebar ? '280px' : '0';
  const rightOffset = showDesktopRight ? '280px' : '0';

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      {!focusMode && (
        <React.Suspense fallback={null}>
          <Header
            onToggleSidebar={toggleSidebar}
            isMobile={isMobile || isTablet}
            onToggleRight={() => setMobileRightOpen(!mobileRightOpen)}
            onOpenSearch={() => setSearchOpen(true)}
            courses={storeCourses}
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
            isOpen={sidebarVisible && !focusMode}
            onToggle={toggleSidebar}
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
        className="overflow-y-auto"
        onScroll={handleScroll}
        style={{
          position: 'fixed',
          top: focusMode ? '0' : '52px',
          bottom: '48px',
          left: (isMobile || isTablet || focusMode) ? '0' : leftOffset,
          right: (isMobile || isTablet || focusMode) ? '0' : rightOffset,
          backgroundColor: colors.bg,
          fontFamily: activeFontFamily,
          scrollBehavior: 'auto',
        }}
      >
        <div
          className="px-4 sm:px-6 md:px-8 py-6 md:py-8 mx-auto"
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
          isCompleted={currentLesson?.completed ?? false}
          isStarred={currentLesson?.starred ?? false}
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
