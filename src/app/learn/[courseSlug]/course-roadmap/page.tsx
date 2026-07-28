'use client';

import React, { useState, useEffect, useRef, useMemo } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { ArrowLeft, Clock, BookOpen, ChevronDown, ChevronRight, Loader2, Map } from 'lucide-react';

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

export default function CourseRoadmapPage() {
  const params = useParams();
  const courseSlug = params?.courseSlug as string;

  const [courseData, setCourseData] = useState<CoursePreview | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<Record<number, boolean>>({});
  const [expandAll, setExpandAll] = useState(false);
  const sectionRefs = useRef<Record<number, HTMLElement | null>>({});
  const [activeSection, setActiveSection] = useState<number>(0);

  useEffect(() => {
    if (!courseSlug) return;
    const ac = new AbortController();
    setLoading(true);
    setError(null);

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
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            const idx = Number(entry.target.getAttribute('data-section-idx'));
            if (!isNaN(idx)) setActiveSection(idx);
          }
        }
      },
      { rootMargin: '-100px 0px -60% 0px', threshold: 0 }
    );
    for (const key of Object.keys(sectionRefs.current)) {
      const el = sectionRefs.current[Number(key)];
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [courseData]);

  const toggleSection = (idx: number) => {
    setExpanded((prev) => ({ ...prev, [idx]: !prev[idx] }));
  };

  const toggleExpandAll = () => {
    const next = !expandAll;
    setExpandAll(next);
    if (!courseData) return;
    const map: Record<number, boolean> = {};
    courseData.curriculum.forEach((_: Section, i: number) => { map[i] = next; });
    setExpanded(map);
  };

  const scrollToSection = (idx: number) => {
    const el = sectionRefs.current[idx];
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <Loader2 className="w-6 h-6 text-[#22c55e] animate-spin" />
      </div>
    );
  }

  if (error || !courseData) {
    return (
      <div className="min-h-screen bg-[#0a0a0b] flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-2">Course Not Found</h1>
          <p className="text-gray-400 mb-4">{error || 'This course does not have a roadmap yet.'}</p>
          <Link href="/courses" className="text-[#22c55e] hover:underline">Browse Courses</Link>
        </div>
      </div>
    );
  }

  const { course, stats, curriculum } = courseData;

  return (
    <div className="min-h-screen bg-[#0a0a0b]">
      <nav className="sticky top-0 z-50 bg-[#0a0a0b]/90 backdrop-blur-xl border-b border-[#1f1f23]/50">
        <div className="max-w-[1400px] mx-auto px-4 h-12 flex items-center gap-3 text-xs">
          <Link href="/" className="text-gray-500 hover:text-white transition-colors">Home</Link>
          <span className="text-gray-700">/</span>
          <Link href="/courses" className="text-gray-500 hover:text-white transition-colors">Courses</Link>
          <span className="text-gray-700">/</span>
          <Link href={`/learn/${course.slug}`} className="text-gray-500 hover:text-white transition-colors truncate max-w-[200px]">{course.title}</Link>
          <span className="text-gray-700">/</span>
          <span className="text-gray-400 font-medium">Course Roadmap</span>
        </div>
      </nav>

      <div className="max-w-[1400px] mx-auto px-4 py-6 flex gap-6">
        {/* Sidebar */}
        <aside className="hidden lg:block w-64 shrink-0">
          <div className="sticky top-16 max-h-[calc(100vh-5rem)] overflow-y-auto pr-2">
            <div className="mb-4">
              <div className="flex items-center gap-2 mb-2">
                <div className="w-8 h-8 rounded-lg bg-[#22c55e]/10 flex items-center justify-center">
                  <Map className="w-4 h-4 text-[#22c55e]" />
                </div>
                <div>
                  <h2 className="text-sm font-semibold text-white truncate">{course.title}</h2>
                  <p className="text-[10px] text-gray-500">Course Roadmap</p>
                </div>
              </div>
              <div className="flex items-center gap-3 text-[10px] text-gray-600 mb-3">
                <span>{stats.total_sections} sections</span>
                <span>&middot;</span>
                <span>{stats.total_lessons} lessons</span>
                <span>&middot;</span>
                <span>{stats.estimated_hours}h</span>
              </div>
            </div>

            <nav className="space-y-0.5">
              {curriculum.map((section: Section, idx: number) => (
                <button
                  key={section.id}
                  onClick={() => scrollToSection(idx)}
                  className={`w-full text-left px-3 py-1.5 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                    activeSection === idx
                      ? 'bg-[#22c55e]/10 text-[#22c55e]'
                      : 'text-gray-400 hover:text-white hover:bg-[#1a1a1f]'
                  }`}
                >
                  <span className="w-5 text-center text-[10px] font-mono opacity-50 shrink-0">{idx + 1}</span>
                  <span className="truncate flex-1">{section.title}</span>
                  <span className="text-[10px] opacity-40 shrink-0">{section.lesson_count}</span>
                </button>
              ))}
            </nav>
          </div>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-4">
              {course.icon && (
                <span className="text-2xl">{course.icon}</span>
              )}
              <div>
                <h1 className="text-3xl md:text-4xl font-bold text-white">{course.title} Roadmap</h1>
              </div>
            </div>
            <p className="text-gray-400 text-sm max-w-2xl mb-4">
              {course.description || `A structured, topic-by-topic roadmap covering all ${stats.total_lessons} lessons in ${stats.total_sections} sections. Work through each section in order to build a solid foundation.`}
            </p>

            <div className="flex flex-wrap items-center gap-4 text-xs mb-4">
              <div className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{stats.total_sections} sections</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <BookOpen className="w-3.5 h-3.5" />
                <span>{stats.total_lessons} lessons</span>
              </div>
              <div className="flex items-center gap-1.5 text-gray-500">
                <Clock className="w-3.5 h-3.5" />
                <span>{stats.estimated_hours}h estimated</span>
              </div>
            </div>

            <button
              onClick={toggleExpandAll}
              className="text-[#22c55e] hover:underline text-xs font-medium"
            >
              {expandAll ? 'Collapse All' : 'Expand All'}
            </button>
          </div>

          <div className="space-y-3">
            {curriculum.map((section: Section, idx: number) => {
              const isExpanded = expanded[idx] ?? false;
              return (
                <div
                  key={section.id}
                  data-section-idx={idx}
                  ref={(el) => { sectionRefs.current[idx] = el; }}
                  className="scroll-mt-20"
                >
                  <div
                    className={`rounded-xl border transition-colors ${
                      isExpanded
                        ? 'bg-[#111113] border-[#2f2f35]'
                        : 'bg-[#0f0f11] border-[#1f1f23] hover:border-[#2f2f35]'
                    }`}
                  >
                    {/* Section Header */}
                    <button
                      onClick={() => toggleSection(idx)}
                      className="w-full flex items-center gap-4 p-4 text-left"
                    >
                      <div className="w-9 h-9 rounded-lg bg-[#22c55e]/10 flex items-center justify-center text-[#22c55e] font-bold text-sm shrink-0">
                        {idx + 1}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <h3 className="text-white font-semibold text-sm">{section.title}</h3>
                          <span className="text-[10px] text-gray-600 font-mono">{section.lesson_count} lessons</span>
                        </div>
                        {section.duration_minutes ? (
                          <p className="text-gray-500 text-xs mt-0.5">{section.duration_minutes} min</p>
                        ) : null}
                      </div>
                      <ChevronDown
                        className={`w-4 h-4 text-gray-500 shrink-0 transition-transform duration-200 ${
                          isExpanded ? 'rotate-180' : ''
                        }`}
                      />
                    </button>

                    {/* Lessons List */}
                    {isExpanded && (
                      <div className="px-4 pb-4">
                        <div className="border-t border-[#1f1f23] pt-3 space-y-0.5">
                          {section.lessons.map((lesson: Lesson, li: number) => (
                            <Link
                              key={lesson.id}
                              href={`/learn/${course.slug}/${lesson.slug}`}
                              className="flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-[#1a1a1f] transition-colors group"
                            >
                              <span className="text-[10px] text-gray-600 font-mono w-8 text-right shrink-0">
                                {idx + 1}.{li + 1}
                              </span>
                              <div className="flex-1 min-w-0">
                                <span className="text-sm text-gray-300 group-hover:text-white transition-colors">
                                  {lesson.title}
                                </span>
                              </div>
                              {lesson.read_time && (
                                <span className="text-[10px] text-gray-600 shrink-0 flex items-center gap-1">
                                  <Clock className="w-3 h-3" />
                                  {lesson.read_time}
                                </span>
                              )}
                              <ChevronRight className="w-3.5 h-3.5 text-gray-600 group-hover:text-[#22c55e] transition-colors shrink-0" />
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
            <div className="mt-10 text-center">
              <Link
                href={`/learn/${course.slug}/${courseData.first_lesson_slug}`}
                className="inline-flex items-center gap-2 px-6 py-3 bg-[#22c55e] text-black font-semibold rounded-xl hover:bg-[#16a34a] transition-colors"
              >
                Start Learning
                <ChevronRight className="w-4 h-4" />
              </Link>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
