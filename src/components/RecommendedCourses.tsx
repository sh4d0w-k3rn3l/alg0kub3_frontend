'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useTheme } from '@/context/ThemeContext';
import { BookOpen, ChevronRight, Sparkles, TrendingUp } from 'lucide-react';
import { api } from '@/lib/api';
import { COURSE_ICONS, COURSE_COLORS } from '@/config/courseConfig';

interface RecommendedCoursesProps {
  excludeSlug?: string | null;
  title?: string | null;
  maxItems?: number;
}

const RecommendedCourses: React.FC<RecommendedCoursesProps> = ({ excludeSlug = null, title = null, maxItems = 4 }) => {
  const { colors } = useTheme();
  const router = useRouter();
  const [recs, setRecs] = useState<Record<string, unknown>[]>([]);
  const [strategy, setStrategy] = useState('');

  useEffect(() => {
    const ac = new AbortController();
    const params = new URLSearchParams({ limit: String(maxItems) });
    if (excludeSlug) params.set('exclude_slug', excludeSlug);

    api.get<{ recommendations: Record<string, unknown>[]; strategy: string }>(`/recommendations?${params}`, { signal: ac.signal })
      .then(r => {
        if (ac.signal.aborted) return;
        setRecs(r.data.recommendations || []);
        setStrategy(r.data.strategy || '');
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') return;
      });
    return () => ac.abort();
  }, [excludeSlug, maxItems]);

  if (!recs.length) return null;

  const heading = title || (strategy === 'personalized' ? 'Recommended for You' : 'Popular Courses');
  const HeadIcon = strategy === 'personalized' ? Sparkles : TrendingUp;

  return (
    <div data-testid="recommended-courses">
      <div className="flex items-center gap-2 mb-4">
        <HeadIcon size={16} style={{ color: colors.green }} />
        <h3 data-testid="rec-heading" className="text-base font-bold" style={{ color: colors.text }}>
          {heading}
        </h3>
      </div>

      <div className={`grid gap-3 ${recs.length > 2 ? 'grid-cols-1 sm:grid-cols-2' : 'grid-cols-1 sm:grid-cols-2'}`}>
        {recs.map((course: Record<string, unknown>) => {
          const Icon = COURSE_ICONS?.[course.slug] || BookOpen;
          const color = COURSE_COLORS?.[course.slug] || colors.green;
          return (
            <button
              key={course.id}
              data-testid={`rec-${course.slug}`}
              onClick={() => router.push(`/course/${course.slug}`)}
              className="flex items-center gap-3.5 p-3.5 rounded-xl text-left transition-all group border"
              style={{ borderColor: colors.borderLight, backgroundColor: 'transparent' }}
              onMouseEnter={e => { e.currentTarget.style.borderColor = color; e.currentTarget.style.backgroundColor = `${color}08`; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor = colors.borderLight; e.currentTarget.style.backgroundColor = 'transparent'; }}
            >
              <div className="w-10 h-10 rounded-lg flex items-center justify-center flex-shrink-0 transition-transform group-hover:scale-110" style={{ backgroundColor: `${color}15` }}>
                <Icon size={18} style={{ color }} />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold truncate" style={{ color: colors.text }}>{course.title}</p>
                <p className="text-xs mt-0.5" style={{ color: colors.textMuted }}>
                  {course.section_count || 0} sections &middot; {course.lesson_count || 0} lessons
                </p>
              </div>
              <ChevronRight size={14} className="flex-shrink-0 opacity-0 group-hover:opacity-100 transition-opacity" style={{ color }} />
            </button>
          );
        })}
      </div>
    </div>
  );
};

export default RecommendedCourses;
