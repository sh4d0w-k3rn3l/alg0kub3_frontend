'use client';

import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import {
  Clock, BookOpen, ChevronDown, ChevronRight, Loader2, Map, Code,
  Menu, X, ArrowRight, ListTree, LayoutGrid, Sparkles,
} from 'lucide-react';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';
import ErrorBoundary from '@/components/ErrorBoundary';

interface Lesson {
  id: string;
  title: string;
  slug: string;
  order: number;
  read_time?: string;
  status?: string;
}

interface Section {
  title: string;
  id: string;
  lessons: Lesson[];
  lesson_count: number;
  duration_minutes?: number;
}

interface CoursePreview {
  course: {
    id: string;
    title: string;
    slug: string;
    description: string;
    icon?: string;
    category?: string;
  };
  stats: {
    total_lessons: number;
    total_sections: number;
    total_minutes: number;
    estimated_hours: number;
  };
  curriculum: Section[];
  first_lesson_slug?: string;
}

function formatDuration(minutes?: number): string {
  if (!minutes) return '';
  if (minutes < 60) return `${minutes} min`;
  const h = Math.floor(minutes / 60);
  const m = minutes % 60;
  return m ? `${h}h ${m}m` : `${h}h`;
}

function CourseRoadmapPage() {
  const params = useParams();
  const courseSlug = params?.courseSlug as string;

  const [courseData, setCourseData] = useState<CoursePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [expandAll, setExpandAll] = useState(false);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<number>(0);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'list' | 'compact'>('list');

  const [prevSlug, setPrevSlug] = useState(courseSlug);
  if (courseSlug !== prevSlug) {
    setPrevSlug(courseSlug);
    setCourseData(null);
    setLoading(true);
    setError(null);
    setMobileSidebarOpen(false);
  }

  useEffect(() => {
    if (!courseSlug) return;
    const ac = new AbortController();
    api.get<CoursePreview>(`/courses/${courseSlug}/preview`, { signal: ac.signal })
      .then((res) => {
        if (ac.signal.aborted) return;
        if (res.ok && res.data) {
          setCourseData(res.data);
          const allExpanded: Record<number, boolean> = {};
          (res.data.curriculum || []).forEach((_: Section, i: number) => { allExpanded[i] = false; });
          setExpanded(allExpanded);
        } else {
          setError('Course not found');
        }
      })
      .catch((err: unknown) => {
        if (ac.signal.aborted) return;
        handleApiError(err);
        setError('Failed to load course');
      })
      .finally(() => {
        if (!ac.signal.aborted) setLoading(false);
      });
    return () => ac.abort();
  }, [courseSlug]);

  useEffect(() => {
    const curriculum = courseData?.curriculum || [];
    let rafId = 0;
    const updateActive = () => {
      rafId = 0;
      const topLine = 120;
      let current = 0;
      for (let i = 0; i < curriculum.length; i++) {
        const el = sectionRefs.current[i];
        if (!el) continue;
        if (el.getBoundingClientRect().top <= topLine) current = i;
        else break;
      }
      setActiveSection(current);
    };
    const onScroll = () => {
      if (rafId) return;
      rafId = window.requestAnimationFrame(updateActive);
    };
    updateActive();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => {
      window.removeEventListener('scroll', onScroll);
      if (rafId) window.cancelAnimationFrame(rafId);
    };
  }, [courseData]);

  const toggleSection = useCallback((idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  }, []);

  const toggleExpandAll = useCallback(() => {
    const next = !expandAll;
    setExpandAll(next);
    if (!courseData) return;
    const map: Record<number, boolean> = {};
    courseData.curriculum.forEach((_: Section, i: number) => { map[i] = next; });
    setExpanded(map);
  }, [expandAll, courseData]);

  const scrollToSection = useCallback((idx: number) => {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    setMobileSidebarOpen(false);
  }, []);

  const courseColor = COURSE_COLORS[courseSlug] || '#22c55e';

  const sectionDurations = useMemo(() => {
    if (!courseData) return [];
    return courseData.curriculum.map((s) => {
      const mins = s.duration_minutes || s.lessons.length * 5;
      return formatDuration(mins);
    });
  }, [courseData]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader2 className="w-8 h-8 text-[#22c55e] animate-spin" />
          <p className="text-sm text-gray-500">Loading roadmap...</p>
        </div>
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center max-w-md mx-auto px-4">
          <div className="w-16 h-16 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
            <Map className="w-8 h-8 text-[#22c55e]" />
          </div>
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
          <p className="text-gray-400 mb-6 text-sm">{error || 'This course does not have a roadmap yet.'}</p>
          <Link
            href="/courses"
            className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#22c55e] text-black font-medium rounded-lg text-sm hover:bg-[#16a34a] transition-colors"
          >
            Browse Courses <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      </div>
    );
  }

  const { course, stats, curriculum } = courseData;
  const CourseIcon = COURSE_ICONS[course.slug] || Code;

  const sidebarContent = (
    <div className="mb-6">
      <div className="flex items-center gap-3 mb-4">
        <div
          className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
          style={{ backgroundColor: `${courseColor}15` }}
        >
          <CourseIcon className="w-5 h-5" style={{ color: courseColor }} />
        </div>
        <div className="min-w-0">
          <h2 className="text-sm font-semibold text-white truncate">{course.title}</h2>
          <p className="text-[11px] text-gray-500">Course Roadmap</p>
        </div>
      </div>

      <div className="flex items-center gap-4 text-[11px] text-gray-500 mb-5 pb-4 border-b border-[#1f1f23]">
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{stats.total_sections} sections</span>
        </div>
        <div className="flex items-center gap-1.5">
          <BookOpen className="w-3.5 h-3.5" />
          <span>{stats.total_lessons} chapters</span>
        </div>
        <div className="flex items-center gap-1.5">
          <Clock className="w-3.5 h-3.5" />
          <span>{stats.estimated_hours}h</span>
        </div>
      </div>

      <nav className="space-y-0.5">
        {curriculum.map((section: Section, idx: number) => (
          <button
            key={section.id}
            onClick={() => scrollToSection(idx)}
            className={`w-full text-left px-3 py-2 rounded-lg text-[13px] transition-all duration-150 flex items-center gap-2.5 group ${
              activeSection === idx
                ? 'bg-[#22c55e]/10 text-[#22c55e] font-medium'
                : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
            }`}
          >
            <span className={`w-6 h-6 rounded-md flex items-center justify-center text-[10px] font-bold shrink-0 transition-colors ${
              activeSection === idx
                ? 'bg-[#22c55e]/20 text-[#22c55e]'
                : 'bg-[#1a1a1f] text-gray-500 group-hover:bg-[#22c55e]/10 group-hover:text-[#22c55e]'
            }`}>
              {idx + 1}
            </span>
            <span className="truncate flex-1">{section.title}</span>
            <span className="text-[10px] opacity-40 shrink-0 tabular-nums">{section.lesson_count}</span>
          </button>
        ))}
      </nav>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      {/* Sticky breadcrumb */}
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]/60">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-2.5 text-xs">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <Link href="/courses" className="text-gray-500 hover:text-white transition-colors">Courses</Link>
          <span className="text-gray-700">/</span>
          <Link href={`/learn/${course.slug}`} className="text-gray-500 hover:text-white transition-colors truncate max-w-[180px]">{course.title}</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-medium">Roadmap</span>

          {/* Mobile sidebar toggle */}
          <button
            onClick={() => setMobileSidebarOpen(!mobileSidebarOpen)}
            className="ml-auto lg:hidden p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-[#1a1a1f] transition-colors"
          >
            {mobileSidebarOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
          </button>
        </div>
      </nav>

      {/* Mobile sidebar overlay */}
      {mobileSidebarOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={() => setMobileSidebarOpen(false)} />
          <div className="absolute left-0 top-12 bottom-0 w-72 bg-[#0a0a0b] border-r border-[#1f1f23] overflow-y-auto p-4 z-50">
            {sidebarContent}
          </div>
        </div>
      )}

      <div className="max-w-[1400px] mx-auto px-4 py-8 flex gap-8">
        {/* Desktop sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-20 max-h-[calc(100vh-6rem)] overflow-y-auto pr-3 pb-8" style={{ scrollbarWidth: 'thin', scrollbarColor: '#2f2f35 transparent' }}>
            {sidebarContent}
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0 max-w-[860px]">
          {/* Hero Header */}
          <div className="mb-10">
            <div className="flex items-start gap-4 mb-5">
              <div
                className="w-14 h-14 rounded-2xl flex items-center justify-center shrink-0"
                style={{ backgroundColor: `${courseColor}12` }}
              >
                <CourseIcon className="w-7 h-7" style={{ color: courseColor }} />
              </div>
              <div className="min-w-0">
                <h1 className="text-3xl md:text-4xl font-bold text-white leading-tight mb-2">
                  {course.title}
                </h1>
                <p className="text-gray-400 text-sm leading-relaxed max-w-2xl">
                  {course.description || `A structured, topic-by-topic roadmap covering all ${stats.total_lessons} lessons in ${stats.total_sections} sections. Work through each section in order to build a solid foundation.`}
                </p>
              </div>
            </div>

            {/* Stats row + controls */}
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div className="flex flex-wrap items-center gap-5 text-sm">
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <BookOpen className="w-3.5 h-3.5 text-[#22c55e]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">{stats.total_sections}</span>
                    <span className="text-gray-500 ml-1">sections</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <ListTree className="w-3.5 h-3.5 text-[#22c55e]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">{stats.total_lessons}</span>
                    <span className="text-gray-500 ml-1">chapters</span>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-gray-400">
                  <div className="w-7 h-7 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                    <Clock className="w-3.5 h-3.5 text-[#22c55e]" />
                  </div>
                  <div>
                    <span className="text-white font-semibold">{stats.estimated_hours}h</span>
                    <span className="text-gray-500 ml-1">estimated</span>
                  </div>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* View mode toggle */}
                <div className="hidden sm:flex items-center bg-[#111113] rounded-lg border border-[#1f1f23] p-0.5">
                  <button
                    onClick={() => setViewMode('list')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'list' ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'text-gray-500 hover:text-white'}`}
                    title="List view"
                  >
                    <ListTree className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => setViewMode('compact')}
                    className={`p-1.5 rounded-md transition-colors ${viewMode === 'compact' ? 'bg-[#22c55e]/15 text-[#22c55e]' : 'text-gray-500 hover:text-white'}`}
                    title="Compact view"
                  >
                    <LayoutGrid className="w-3.5 h-3.5" />
                  </button>
                </div>

                {/* Expand all toggle */}
                <button
                  onClick={toggleExpandAll}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium rounded-lg border border-[#1f1f23] text-gray-400 hover:text-[#22c55e] hover:border-[#22c55e]/30 transition-colors"
                >
                  {expandAll ? (
                    <>
                      <ChevronDown className="w-3 h-3 rotate-180" />
                      Collapse All
                    </>
                  ) : (
                    <>
                      <ChevronDown className="w-3 h-3" />
                      Expand All
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Sections */}
          <div className={viewMode === 'compact' ? 'grid grid-cols-1 sm:grid-cols-2 gap-3' : 'space-y-3'}>
            {curriculum.map((section: Section, idx: number) => {
              const isExpanded = expanded[idx] ?? false;
              const duration = sectionDurations[idx];
              return (
                <div
                  key={section.id}
                  ref={(el) => { sectionRefs.current[idx] = el; }}
                  className="scroll-mt-24"
                >
                  <div
                    className={`rounded-xl border transition-all duration-200 ${
                      isExpanded
                        ? 'bg-[#111113] border-[#2f2f35] shadow-lg shadow-black/20'
                        : 'bg-[#0d0d0f] border-[#1a1a1f] hover:border-[#2a2a2f] hover:bg-[#0f0f11]'
                    }`}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center gap-4 p-4 text-left group"
                    >
                      <div
                        className="w-10 h-10 rounded-xl flex items-center justify-center font-bold text-sm shrink-0 transition-colors"
                        style={{
                          backgroundColor: isExpanded ? `${courseColor}20` : `${courseColor}08`,
                          color: isExpanded ? courseColor : `${courseColor}90`,
                        }}
                      >
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2.5 mb-0.5">
                          <h3 className="text-white font-semibold text-[15px] group-hover:text-white transition-colors">
                            {section.title}
                          </h3>
                        </div>
                        <div className="flex items-center gap-3 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <BookOpen className="w-3 h-3" />
                            {section.lesson_count} {section.lesson_count === 1 ? 'chapter' : 'chapters'}
                          </span>
                          {duration && (
                            <span className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              {duration}
                            </span>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-3 shrink-0">
                        {!isExpanded && section.lesson_count > 0 && (
                          <div className="hidden sm:flex items-center gap-1">
                            {section.lessons.slice(0, 3).map((_, i) => (
                              <div
                                key={i}
                                className="w-1.5 h-1.5 rounded-full"
                                style={{ backgroundColor: `${courseColor}${30 + i * 20}` }}
                              />
                            ))}
                            {section.lesson_count > 3 && (
                              <span className="text-[10px] text-gray-600 ml-0.5">+{section.lesson_count - 3}</span>
                            )}
                          </div>
                        )}
                        <ChevronDown
                          className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                            isExpanded ? 'rotate-180 text-gray-400' : ''
                          }`}
                        />
                      </div>
                    </button>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-[#1f1f23] pt-2 space-y-0.5">
                          {section.lessons.map((lesson: Lesson, li: number) => (
                            <Link
                              key={lesson.id}
                              href={`/learn/${course.slug}/${lesson.slug}`}
                              className="flex items-center gap-3 px-3 py-2.5 rounded-lg hover:bg-[#1a1a1f] transition-all duration-150 group"
                            >
                              <span
                                className="text-[11px] font-mono w-9 text-right shrink-0 tabular-nums"
                                style={{ color: `${courseColor}60` }}
                              >
                                {idx + 1}.{li + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors leading-snug">
                                  {lesson.title}
                                </span>
                              </div>
                              {lesson.read_time && (
                                <span className="text-[11px] text-gray-600 shrink-0 flex items-center gap-1 tabular-nums">
                                  <Clock className="w-3 h-3" />
                                  {lesson.read_time}
                                </span>
                              )}
                              <ArrowRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#22c55e] transition-all duration-150 shrink-0 opacity-0 group-hover:opacity-100 translate-x-0 group-hover:translate-x-0.5" />
                            </Link>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>

          {/* Start Learning CTA */}
          {courseData.first_lesson_slug && (
            <div className="mt-12 mb-8">
              <div className="relative rounded-2xl border border-[#1f1f23] bg-gradient-to-br from-[#0d0d0f] to-[#111113] p-8 text-center overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-br from-[#22c55e]/5 to-transparent pointer-events-none" />
                <div className="relative">
                  <div className="w-14 h-14 rounded-2xl bg-[#22c55e]/10 flex items-center justify-center mx-auto mb-4">
                    <Sparkles className="w-7 h-7 text-[#22c55e]" />
                  </div>
                  <h3 className="text-xl font-bold text-white mb-2">Ready to start learning?</h3>
                  <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                    Begin with the first lesson and work your way through the roadmap.
                  </p>
                  <Link
                    href={`/learn/${course.slug}/${courseData.first_lesson_slug}`}
                    className="inline-flex items-center gap-2 px-8 py-3 bg-[#22c55e] text-black font-semibold rounded-xl hover:bg-[#16a34a] transition-all duration-200 hover:shadow-lg hover:shadow-[#22c55e]/20"
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}

export default function Page() {
  return (
    <ErrorBoundary fallbackMessage="Failed to load course roadmap. Please try refreshing.">
      <CourseRoadmapPage />
    </ErrorBoundary>
  );
}
