'use client';

import React, { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { useTheme } from '@/context/ThemeContext';

import {
  Code, ArrowRight,
  Brain, Layers, Server, BookOpen, Clock, BarChart3,
  ChevronRight, CheckCircle2,
} from 'lucide-react';
import SEO from './SEO';
import PageHeader from './PageHeader';
import { api } from '@/lib/api';
import { handleApiError } from '@/lib/toast';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';

interface Course {
  course_slug: string;
  title: string;
  lesson_count: number;
  section_count: number;
  description?: string;
  first_lesson_slug?: string;
}

interface LearningPath {
  icon: string;
  title: string;
  description: string;
  difficulty: string;
  estimated_hours: number;
  course_count: number;
  total_lessons: number;
  courses: Course[];
}

const PATH_ICONS: Record<string, React.ComponentType<{ size?: number; style?: React.CSSProperties }>> = { brain: Brain, layers: Layers, server: Server };

const DIFFICULTY_COLORS: Record<string, string> = {
  Beginner: '#22c55e',
  Intermediate: '#f59e0b',
  Advanced: '#ef4444',
};

const LearningPathPage = () => {
  const params = useParams();
  const slug = (params?.slug as string) || '';
  const { colors } = useTheme();
  const router = useRouter();
  const [path, setPath] = useState<LearningPath | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const ac = new AbortController();
    const fetchPath = async () => {
      try {
        const res = await api.get<LearningPath>(`/learning-paths/${slug}`, { signal: ac.signal });
        if (ac.signal.aborted) return;
        setPath(res.data);
      } catch (err) {
        if (err instanceof DOMException && err.name === 'AbortError') return;
        handleApiError(err);
      } finally {
        setLoading(false);
      }
    };
    fetchPath();
    return () => ac.abort();
  }, [slug]);

  const handleStartPath = () => {
    if ((path?.courses?.length ?? 0) > 0) {
      const first = path!.courses[0];
      if (first.first_lesson_slug) {
        router.push(`/learn/${first.course_slug}/${first.first_lesson_slug}`);
      } else {
        router.push(`/learn/${first.course_slug}`);
      }
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="w-8 h-8 border-2 border-t-transparent rounded-full animate-spin" style={{ borderColor: colors.green, borderTopColor: 'transparent' }} />
      </div>
    );
  }

  if (!path) {
    return (
      <div className="min-h-screen flex items-center justify-center" style={{ backgroundColor: colors.bg }}>
        <div className="text-center">
          <p className="text-lg mb-4" style={{ color: colors.textSecondary }}>Path not found</p>
          <Link href="/" className="text-sm underline" style={{ color: colors.green }}>Back to Home</Link>
        </div>
      </div>
    );
  }

  const PathIcon = PATH_ICONS[path.icon] || Layers;
  const diffColor = DIFFICULTY_COLORS[path.difficulty] || colors.green;

  return (
    <div className="min-h-screen" style={{ backgroundColor: colors.bg }}>
      <PageHeader />

      <div className="max-w-4xl mx-auto px-6 py-10">
        <SEO
          title={path.title}
          description={path.description}
          path={`/paths/${slug}`}
          course={{ name: path.title, difficulty: path.difficulty, lesson_count: path.total_lessons, category: 'Learning Path' }}
        />
        <div className="mb-10">
          <div className="flex items-center gap-3 mb-4">
            <div
              className="w-12 h-12 rounded-xl flex items-center justify-center"
              style={{ backgroundColor: colors.green + '15' }}
            >
              <PathIcon size={24} style={{ color: colors.green }} />
            </div>
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span
                  data-testid="path-difficulty"
                  className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full"
                  style={{ backgroundColor: diffColor + '20', color: diffColor }}
                >
                  {path.difficulty}
                </span>
                <span className="text-xs flex items-center gap-1" style={{ color: colors.textMuted }}>
                  <Clock size={11} /> ~{path.estimated_hours}h
                </span>
              </div>
              <h1 data-testid="path-title" className="text-2xl sm:text-3xl font-bold" style={{ color: colors.text }}>
                {path.title}
              </h1>
            </div>
          </div>
          <p className="text-sm sm:text-base leading-relaxed max-w-2xl" style={{ color: colors.textSecondary }}>
            {path.description}
          </p>

          <div className="flex items-center gap-6 mt-5">
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textMuted }}>
              <BookOpen size={13} />
              <span><strong style={{ color: colors.text }}>{path.course_count}</strong> courses</span>
            </div>
            <div className="flex items-center gap-1.5 text-xs" style={{ color: colors.textMuted }}>
              <BarChart3 size={13} />
              <span><strong style={{ color: colors.text }}>{path.total_lessons}</strong> lessons</span>
            </div>
          </div>

          <button
            data-testid="start-path-btn"
            onClick={handleStartPath}
            className="mt-6 flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-opacity hover:opacity-90"
            style={{ backgroundColor: colors.green, color: '#fff' }}
          >
            Start Learning <ArrowRight size={14} />
          </button>
        </div>

        <div>
          <h2 className="text-base font-bold mb-5" style={{ color: colors.text }}>
            Course Roadmap
          </h2>
          <div className="relative">
            <div
              className="absolute left-[19px] top-3 bottom-3 w-[2px]"
              style={{ backgroundColor: colors.border }}
            />

            <div className="space-y-4">
              {path.courses.map((course, i) => {
                const Icon = COURSE_ICONS[course.course_slug] || Code;
                const accent = COURSE_COLORS[course.course_slug] || colors.green;
                return (
                  <div key={course.course_slug} className="relative flex items-start gap-4">
                    <div
                      className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2"
                      style={{
                        backgroundColor: colors.bgCard,
                        borderColor: accent,
                      }}
                    >
                      <span className="text-xs font-bold" style={{ color: accent }}>{i + 1}</span>
                    </div>

                    <button
                      data-testid={`path-course-${course.course_slug}`}
                      onClick={() => {
                        if (course.first_lesson_slug) {
                          router.push(`/learn/${course.course_slug}/${course.first_lesson_slug}`);
                        } else {
                          router.push(`/learn/${course.course_slug}`);
                        }
                      }}
                      className="flex-1 group border rounded-xl p-4 text-left transition-all duration-200"
                      style={{ backgroundColor: colors.bgCard, borderColor: colors.border }}
                      onMouseEnter={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.borderColor = accent + '60';
                        e.currentTarget.style.transform = 'translateX(4px)';
                      }}
                      onMouseLeave={(e: React.MouseEvent<HTMLButtonElement>) => {
                        e.currentTarget.style.borderColor = colors.border;
                        e.currentTarget.style.transform = 'translateX(0)';
                      }}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <div
                            className="w-9 h-9 rounded-lg flex items-center justify-center"
                            style={{ backgroundColor: accent + '18' }}
                          >
                            <Icon size={18} style={{ color: accent }} />
                          </div>
                          <div>
                            <div className="text-sm font-semibold" style={{ color: colors.text }}>
                              {course.title}
                            </div>
                            <div className="text-[11px] mt-0.5 flex items-center gap-3" style={{ color: colors.textMuted }}>
                              <span className="flex items-center gap-1"><BookOpen size={10} /> {course.lesson_count} lessons</span>
                              <span className="flex items-center gap-1"><Layers size={10} /> {course.section_count} sections</span>
                            </div>
                          </div>
                        </div>
                        <ChevronRight
                          size={16}
                          className="opacity-0 group-hover:opacity-100 transition-opacity shrink-0"
                          style={{ color: accent }}
                        />
                      </div>
                      {course.description && (
                        <p className="mt-2 text-xs leading-relaxed line-clamp-2" style={{ color: colors.textSecondary }}>
                          {course.description}
                        </p>
                      )}
                    </button>
                  </div>
                );
              })}

              <div className="relative flex items-center gap-4">
                <div
                  className="relative z-10 w-10 h-10 rounded-full flex items-center justify-center shrink-0"
                  style={{ backgroundColor: colors.green + '20' }}
                >
                  <CheckCircle2 size={18} style={{ color: colors.green }} />
                </div>
                <span className="text-sm font-medium" style={{ color: colors.green }}>
                  Path Complete
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LearningPathPage;
